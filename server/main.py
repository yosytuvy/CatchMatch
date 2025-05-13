# server/main.py
import os
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import motor.motor_asyncio
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
# Defaults to local CatchMatch DB and 'users' collection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/CatchMatch")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()
users_collection = db.get_collection("users")

# Initialize FastAPI
app = FastAPI()
# CORS (lock down origins in production)
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

# ==================== PROFILE ENDPOINT ====================
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

    class Config:
        allow_population_by_field_name = True

@app.post("/profiles", response_model=ProfileResponse)
async def create_profile(profile: ProfilePayload):
    """Create a new user profile."""
    data = profile.dict()
    result = await users_collection.insert_one(data)
    created = await users_collection.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(status_code=500, detail="Profile creation failed")
    # Convert ObjectId to str
    created["_id"] = str(created["_id"])
    return created

# ==================== LOCATION ENDPOINT ====================
class LocationPayload(BaseModel):
    user_id: str
    lon: float
    lat: float

@app.post("/locations")
async def upsert_location(payload: LocationPayload):
    """Update a user's last known location."""
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

# ==================== CLUSTERS ENDPOINT ====================
class ClusterResponse(BaseModel):
    lon: float
    lat: float
    count: int
    male: int
    female: int

@app.get("/clusters", response_model=List[ClusterResponse])
async def get_clusters(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...),
    zoom: int = Query(...),
):
    """
    Return aggregated clusters of users within the given bbox and zoom level.
    """
    # Determine decimal precision for clustering
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

# To run:
# uvicorn server.main:app --reload --host 0.0.0.0 --port 8000

# .env example:
# MONGODB_URI=mongodb://localhost:27017/CatchMatch
