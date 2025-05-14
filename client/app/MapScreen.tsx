import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useOnboarding } from "./context/OnboardingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ProfileScreen from "./ProfileScreen";

const SERVER_URL = "http://192.168.1.206:8000";

interface Cluster {
  lon: number;
  lat: number;
  count: number;
  male: number;
  female: number;
}

export default function MapScreen() {
  const router = useRouter();
  const { profileId } = useOnboarding();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [watcher, setWatcher] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("location");
  const [showProfile, setShowProfile] = useState(false);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const getZoomLevel = (longitudeDelta: number) =>
    Math.round(Math.log2(360 / longitudeDelta));

  const fetchClusters = async (r: Region) => {
    const min_lon = r.longitude - r.longitudeDelta / 2;
    const max_lon = r.longitude + r.longitudeDelta / 2;
    const min_lat = r.latitude - r.latitudeDelta / 2;
    const max_lat = r.latitude + r.latitudeDelta / 2;
    const params = new URLSearchParams({
      min_lon: String(min_lon),
      min_lat: String(min_lat),
      max_lon: String(max_lon),
      max_lat: String(max_lat),
      zoom: String(getZoomLevel(r.longitudeDelta)),
    });

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${SERVER_URL}/clusters?${params}`, { headers });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: Cluster[] = await res.json();
      setClusters(data);
    } catch (err) {
      console.error("Failed to fetch clusters", err);
    }
  };

  const upsertLocation = async (lat: number, lon: number) => {
    if (!profileId) return;

    try {
      const headers = await getAuthHeaders();
      await fetch(`${SERVER_URL}/locations`, {
        method: "POST",
        headers,
        body: JSON.stringify({ user_id: profileId, lat, lon }),
      });
    } catch (err) {
      console.error("Upsert location failed", err);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync();
      const initial: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setRegion(initial);
      upsertLocation(initial.latitude, initial.longitude);
      fetchClusters(initial);
      setLoading(false);

      const subscription = await Location.watchPositionAsync(
        { distanceInterval: 150, timeInterval: 120000 },
        ({ coords }) => upsertLocation(coords.latitude, coords.longitude)
      );
      setWatcher(subscription);
    })();

    return () => {
      watcher?.remove();
    };
  }, []);

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
    fetchClusters(r);
  };

  const handleTabPress = (tab: string) => {
    console.log("Tab pressed:", tab);
    setActiveTab(tab);
    // Handle navigation based on tab
    switch (tab) {
      case "profile":
        console.log("Opening profile");
        setShowProfile(true);
        break;
      case "search":
        // Navigate to search screen
        break;
      case "chat":
        // Navigate to chat screen
        break;
      case "location":
        // Already on map screen
        break;
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8E24AA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="חיפוש"
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {clusters.map((c, idx) => (
          <Marker
            key={`${c.lon}-${c.lat}-${idx}`}
            coordinate={{ latitude: c.lat, longitude: c.lon }}
          >
            {c.count > 1 ? (
              <View style={styles.clusterContainer}>
                {c.female > 0 && (
                  <>
                    <View style={styles.femaleIcon}>
                      <Ionicons name="female" size={16} color="#fff" />
                    </View>
                    <Text style={styles.clusterCount}>{c.female}</Text>
                  </>
                )}
                {c.male > 0 && (
                  <>
                    <View style={styles.maleIcon}>
                      <Ionicons name="male" size={16} color="#fff" />
                    </View>
                    <Text style={styles.clusterCount}>{c.male}</Text>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.individualIcon,
                    c.female === 1
                      ? styles.femaleIconLarge
                      : styles.maleIconLarge,
                  ]}
                >
                  <Ionicons
                    name={c.female === 1 ? "female" : "male"}
                    size={20}
                    color="#fff"
                  />
                </View>
                {c.count === 1 && (
                  <Text
                    style={[
                      styles.markerLabel,
                      { color: c.female === 1 ? "#9C27B0" : "#FB8C00" },
                    ]}
                  >
                    {c.female === 1 ? "נשים" : "גברים"}
                  </Text>
                )}
              </View>
            )}
          </Marker>
        ))}
      </MapView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            console.log("Profile button pressed");
            handleTabPress("profile");
          }}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={activeTab === "profile" ? "#8E24AA" : "#999"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "profile" && styles.navTextActive,
            ]}
          >
            פרופיל
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("search")}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={activeTab === "search" ? "#8E24AA" : "#999"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "search" && styles.navTextActive,
            ]}
          >
            חיפוש
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("chat")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={activeTab === "chat" ? "#8E24AA" : "#999"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "chat" && styles.navTextActive,
            ]}
          >
            צ׳אט
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("location")}
        >
          <Ionicons
            name="location-outline"
            size={24}
            color={activeTab === "location" ? "#8E24AA" : "#999"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "location" && styles.navTextActive,
            ]}
          >
            מי מסביבי
          </Text>
        </TouchableOpacity>
      </View>
      <ProfileScreen
        visible={showProfile}
        onClose={() => {
          setShowProfile(false);
          setActiveTab("location");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  individualIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  femaleIcon: {
    backgroundColor: "#9C27B0",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  maleIcon: {
    backgroundColor: "#FB8C00",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  femaleIconLarge: {
    backgroundColor: "#9C27B0",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  maleIconLarge: {
    backgroundColor: "#FB8C00",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    gap: 4,
  },
  clusterCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  markerLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#999",
  },
  navTextActive: {
    color: "#8E24AA",
  },
});
