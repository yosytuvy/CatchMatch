// app/stage9.tsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useOnboarding } from "./context/OnboardingContext";

I18nManager.forceRTL(true);

const { width } = Dimensions.get("window");
const STAGES = 10;
const STAGE = 9;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;

export default function Stage9() {
  const router = useRouter();
  const {instagram, setInstagram} = useOnboarding();
  const {tiktok, setTiktok} = useOnboarding()

  const goBack = () => router.push("/stage8");
  const goNext = () => router.push("/stage10"); // your final stage route
  const skip = () => router.push("/stage10");

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        <View style={styles.track}>
          <LinearGradient
            colors={["#FFA726", "#8E24AA"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={[styles.fill, { width: `${PROGRESS * 100}%` }]}
          />
        </View>
        <View
          style={[
            styles.pill,
            {
              left: `${(1 - PROGRESS) * 100}%`,
              transform: [{ translateX: -PILL_WIDTH / 2 }],
            },
          ]}
        >
          <Text style={styles.pillText}>{`${STAGE}/${STAGES}`}</Text>
        </View>
      </View>

      {/* Skip link */}
      <TouchableOpacity onPress={skip} style={styles.skip}>
        <Text style={styles.skipText}>דלג/י</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>רשתות חברתיות</Text>
        <Text style={styles.subtitle}>
          אנשים שמוסיפים קישור לפרופיל האינסטגרם או הטיקטוק שלהם זוכים לחשיפה
          מוגברת
        </Text>

        {/* Instagram Input */}
        <TextInput
          style={styles.input}
          placeholder="/הקלד שם משתמש או קישור לאינסטגרם"
          placeholderTextColor="#999"
          value={instagram}
          onChangeText={setInstagram}
          autoCapitalize="none"
          returnKeyType="next"
        />

        {/* TikTok Input */}
        <TextInput
          style={styles.input}
          placeholder="/הקלד שם משתמש או קישור לטיקטוק"
          placeholderTextColor="#999"
          value={tiktok}
          onChangeText={setTiktok}
          autoCapitalize="none"
          returnKeyType="done"
        />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>הבא</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack} style={styles.back}>
          <Text style={styles.backText}>הקודם</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL_PADDING = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
  },
  progressWrapper: {
    height: PILL_HEIGHT,
    justifyContent: "center",
  },
  track: {
    width: "100%",
    height: BAR_HEIGHT,
    backgroundColor: "#EEE",
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
    flexDirection: "row-reverse",
  },
  fill: {
    height: "100%",
  },
  pill: {
    position: "absolute",
    top: -(PILL_HEIGHT - BAR_HEIGHT) / 2,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#8E24AA",
    borderRadius: PILL_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 12,
    color: "#8E24AA",
    fontWeight: "600",
  },
  skip: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  skipText: {
    fontSize: 14,
    color: "#555",
  },
  form: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 20,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    marginBottom: 16,
    color: "#000",
    textAlign: "right",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  nextButton: {
    backgroundColor: "#8E24AA",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  back: {
    justifyContent: "center",
  },
  backText: {
    fontSize: 14,
    color: "#555",
  },
});
