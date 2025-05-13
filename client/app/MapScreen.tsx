// app/screens/MapScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useOnboarding } from './context/OnboardingContext';

const SERVER_URL = 'http://192.168.1.206:8000';

interface Cluster {
  lon: number;
  lat: number;
  count: number;
  male: number;
  female: number;
}

export default function MapScreen() {
  const { profileId } = useOnboarding();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [watcher, setWatcher] = useState<any>(null);

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
      const res = await fetch(`${SERVER_URL}/clusters?${params}`);
      const data: Cluster[] = await res.json();
      setClusters(data);
    } catch (err) {
      console.error('Failed to fetch clusters', err);
    }
  };

  const upsertLocation = async (lat: number, lon: number) => {
    if (!profileId) return;
    try {
      await fetch(`${SERVER_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profileId, lat, lon }),
      });
    } catch (err) {
      console.error('Upsert location failed', err);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
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
      subscription?.remove();
    };
  }, []);

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
    fetchClusters(r);
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
        <Ionicons name="eye" size={24} color="#333" />
        <TextInput placeholder="חיפוש" style={styles.searchInput} />
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
            anchor={{ x: 0.5, y: 1 }}
          >
            {c.count > 1 ? (
              <View style={styles.clusterContainer}>
                <Text style={styles.clusterText}>{c.female}</Text>
                <Ionicons name="female" size={14} color="#9C27B0" />
                <Text style={styles.clusterText}>{c.male}</Text>
                <Ionicons name="male" size={14} color="#FB8C00" />
              </View>
            ) : (
              <View style={styles.individualContainer}>
                <Ionicons
                  name={c.female === 1 ? 'female' : 'male'}
                  size={30}
                  color={c.female === 1 ? '#9C27B0' : '#FB8C00'}
                />
              </View>
            )}
          </Marker>
        ))}
      </MapView>

      {/* Footer nav placeholder */}
      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  map: { flex: 1 },
  individualContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 4,
  },
  clusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
  },
  clusterText: { fontSize: 14, marginHorizontal: 6, color: '#333' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#fff',
  },
});