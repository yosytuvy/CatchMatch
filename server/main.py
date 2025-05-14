# server/main.py
import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
import motor.motor_asyncio
from bson import ObjectId
from dotenv import load_dotenv
import jwt
import bcrypt
from secrets import token_urlsafe

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/CatchMatch")
JWT_SECRET = os.getenv("JWT_SECRET", token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()
users_collection = db.get_collection("users")
auth_collection = db.get_collection("auth")

# Initialize FastAPI
app = FastAPI()
security = HTTPBearer()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def ensure_indexes():
    # Geospatial index for location queries
    await users_collection.create_index([("loc", "2dsphere")])
    # TTL index: expire stale locations after 5 minutes
    await users_collection.create_index(
        [("updatedAt", 1)],
        expireAfterSeconds=300
    )
    # Auth indexes
    await auth_collection.create_index([("phone", 1)], unique=True)
    await auth_collection.create_index([("email", 1)], unique=True)

# ==================== AUTHENTICATION ====================

class AuthSignup(BaseModel):
    phone: str
    email: EmailStr

class AuthResponse(BaseModel):
    token: str
    user_id: str
    is_profile_complete: bool

def create_token(user_id: str) -> str:
    """Create JWT token for user"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Validate JWT and return user_id"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(data: AuthSignup):
    """Create new auth account after phone verification"""
    # Check if phone already exists
    existing = await auth_collection.find_one({"phone": data.phone})
    if existing:
        # User exists, just return token
        token = create_token(str(existing["_id"]))
        # Check if profile exists
        profile = await users_collection.find_one({"auth_id": existing["_id"]})
        return {
            "token": token,
            "user_id": str(existing["_id"]),
            "is_profile_complete": profile is not None
        }
    
    # Create new auth account
    auth_doc = {
        "phone": data.phone,
        "email": data.email,
        "created_at": datetime.utcnow()
    }
    
    result = await auth_collection.insert_one(auth_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id)
    
    return {
        "token": token,
        "user_id": user_id,
        "is_profile_complete": False
    }

@app.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    """Get current user info"""
    auth = await auth_collection.find_one({"_id": ObjectId(user_id)})
    if not auth:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await users_collection.find_one({"auth_id": ObjectId(user_id)})
    
    return {
        "user_id": user_id,
        "phone": auth["phone"],
        "email": auth["email"],
        "is_profile_complete": profile is not None
    }

# ==================== PROFILE ENDPOINT (UPDATED) ====================

class ProfilePayload(BaseModel):
    full_name: str
    dob: str
    gender: str
    looking_for: str
    relationship_type: Optional[str] = None
    age_range: List[int]
    images: List[str]
    city: str
    about: Optional[str] = None
    height: Optional[int] = None
    smokes: Optional[bool] = None
    hobbies: List[str]
    instagram: Optional[str] = None
    tiktok: Optional[str] = None

class ProfileResponse(ProfilePayload):
    id: str = Field(alias="_id")
    auth_id: str

    class Config:
        allow_population_by_field_name = True

@app.post("/profiles", response_model=ProfileResponse)
async def create_profile(
    profile: ProfilePayload,
    user_id: str = Depends(get_current_user)
):
    """Create a new user profile (requires authentication)"""
    # Check if profile already exists
    existing = await users_collection.find_one({"auth_id": ObjectId(user_id)})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    data = profile.dict()
    data["auth_id"] = ObjectId(user_id)
    data["created_at"] = datetime.utcnow()
    
    result = await users_collection.insert_one(data)
    created = await users_collection.find_one({"_id": result.inserted_id})
    
    created["_id"] = str(created["_id"])
    created["auth_id"] = str(created["auth_id"])
    return created

# ==================== LOCATION ENDPOINT (UPDATED) ====================

class LocationPayload(BaseModel):
    user_id: str
    lon: float
    lat: float

@app.post("/locations")
async def upsert_location(
    payload: LocationPayload,
    user_id: str = Depends(get_current_user)
):
    """Update a user's last known location (requires authentication)"""
    # Verify the user is updating their own location
    profile = await users_collection.find_one({"auth_id": ObjectId(user_id)})
    if not profile or str(profile["_id"]) != payload.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        oid = ObjectId(payload.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    
    now = datetime.utcnow()
    update = {
        "loc": {"type": "Point", "coordinates": [payload.lon, payload.lat]},
        "updatedAt": now,
    }
    
    result = await users_collection.update_one(
        {"_id": oid},
        {"$set": update}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"status": "ok"}

# ==================== CLUSTERS ENDPOINT (UPDATED) ====================

@app.get("/clusters")
async def get_clusters(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...),
    zoom: int = Query(...),
    _: str = Depends(get_current_user)  # Requires auth but we don't use the user_id
):
    """Return aggregated clusters of users within the given bbox and zoom level."""
    precision = max(1, min(6, (zoom - 5) // 2))

    pipeline = [
        {"$match": {"loc": {"$geoWithin": {"$box": [[min_lon, min_lat], [max_lon, max_lat]]}}}},
        {"$addFields": {
            "lon_r": {"$round": [{"$arrayElemAt": ["$loc.coordinates", 0]}, precision]},
            "lat_r": {"$round": [{"$arrayElemAt": ["$loc.coordinates", 1]}, precision]},
        }},
        {"$group": {
            "_id": {"lon": "$lon_r", "lat": "$lat_r"},
            "count": {"$sum": 1},
            "male": {"$sum": {"$cond": [{"$eq": ["$gender", "male"]}, 1, 0]}},
            "female": {"$sum": {"$cond": [{"$eq": ["$gender", "female"]}, 1, 0]}},
        }},
        {"$project": {"_id": 0, "lon": "$_id.lon", "lat": "$_id.lat", "count": 1, "male": 1, "female": 1}},
    ]

    clusters = await users_collection.aggregate(pipeline).to_list(length=None)
    return clusters

# Keep the same models (LocationPayload, ClusterResponse) as before...

# .env example:
# MONGODB_URI=mongodb://localhost:27017/CatchMatch
# JWT_SECRET=your-secret-key-here