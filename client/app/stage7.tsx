// app/stage7.tsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useOnboarding } from "./context/OnboardingContext";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function Stage7() {
  const router = useRouter();
  const { city, setCity } = useOnboarding();
  const [region, setRegion] = useState<Region | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);

  const openMap = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("הרשאת מיקום נדחתה", "יש לאפשר גישה למיקום כדי להמשיך.");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync();
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      setShowMap(true);
    } catch (err) {
      console.error(err);
      Alert.alert("שגיאה", "לא ניתן לקבל את המיקום.");
    } finally {
      setLoading(false);
    }
  };

  const confirmLocation = async () => {
    if (!region) return;
    setLoading(true);
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      if (address.city) {
        setCity(address.city);
        setShowMap(false);
        router.push("/stage8");
      } else {
        Alert.alert("שגיאה", "לא נמצא שם עיר.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("שגיאה", "לא ניתן לקבל את שם העיר.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>איפה אתה גר?</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={openMap}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{city || "בחר מיקום"}</Text>
      </TouchableOpacity>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#8E24AA"
          style={{ marginTop: 20 }}
        />
      )}

      <Modal visible={showMap} animationType="slide">
        {region ? (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker coordinate={region} />
          </MapView>
        ) : (
          <ActivityIndicator
            size="large"
            color="#8E24AA"
            style={styles.loader}
          />
        )}
        <View style={styles.mapButtons}>
          <TouchableOpacity
            style={styles.mapCancel}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.mapCancelText}>ביטול</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapConfirm}
            onPress={confirmLocation}
            disabled={loading}
          >
            <Text style={styles.mapConfirmText}>אישור</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#8E24AA",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapCancel: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mapCancelText: {
    fontSize: 16,
  },
  mapConfirm: {
    backgroundColor: "#8E24AA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mapConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
