// app/stage1.tsx

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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useOnboarding } from "./context/OnboardingContext";

I18nManager.forceRTL(true);

const { width } = Dimensions.get("window");
const STAGES = 10;
const STAGE = 1;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;

export default function Stage1() {
  const router = useRouter();
  const { fullName, setFullName } = useOnboarding();
  const { dob, setDob } = useOnboarding();
  const [dobDate, setDobDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onNext = () => {
    router.push("/stage2");
  };

  const onChangeDate = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDobDate(selected);
      const d = selected.getDate().toString().padStart(2, "0");
      const m = (selected.getMonth() + 1).toString().padStart(2, "0");
      const y = selected.getFullYear();
      setDob(`${d}/${m}/${y}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.keyboard}
    >
      <SafeAreaView style={styles.container}>
        {/* PROGRESS BAR */}
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

        {/* TITLE */}
        <Text style={styles.title}>קצת עליכם</Text>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>שם מלא</Text>
          <TextInput
            style={styles.input}
            placeholder="הקלד/י"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 24 }]}>תאריך לידה</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.inputText, !dob && { color: "#999" }]}>
              {dob || "00/00/0000"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dobDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
              locale="he-IL"
            />
          )}
        </View>

        {/* NEXT BUTTON */}
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>הבא</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  progressWrapper: {
    marginTop: 16,
    height: PILL_HEIGHT,
    justifyContent: "center",
  },
  track: {
    width: "100%",
    height: BAR_HEIGHT,
    backgroundColor: "#EEE",
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
    flexDirection: "row-reverse", // fill from right→left
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 24,
  },
  form: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: "#333",
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  inputText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#8E24AA",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
