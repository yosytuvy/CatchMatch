// app/stage11.tsx

import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  I18nManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

I18nManager.forceRTL(true);

const { width } = Dimensions.get("window");

export default function ProfileComplete() {
  const router = useRouter();

  const onContinue = () => {
    // enter your main tab layout
    router.replace("/MapScreen");
  };

  return (
    <LinearGradient
      colors={["#FFA726", "#8E24AA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.imageContainer}>
          <View style={styles.checkCircle}>
            {/* A big white checkmark */}
            <Text style={styles.check}>✓</Text>
          </View>
        </View>
        <Text style={styles.title}>הפרופיל הושלם אפשר להתחיל!</Text>
        <Text style={styles.subtitle}>
          זהו שילחתם את הפרופיל שלכם. תמיד תוכלו לערוך אותו דרך עריכת פרופיל
        </Text>

        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>קדימה!</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const BUTTON_PADDING = 20;
const CHECK_SIZE = width * 0.4;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: BUTTON_PADDING,
    paddingBottom: 40,
    paddingTop: 60,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
  },
  checkCircle: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  check: {
    fontSize: CHECK_SIZE * 0.5,
    color: "#8E24AA",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  buttonText: {
    color: "#8E24AA",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
