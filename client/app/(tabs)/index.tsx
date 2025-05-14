
// app/(tabs)/index.tsx - Updated with authentication flow

import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Animated,
  PanResponder,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

I18nManager.forceRTL(true);

const { width, height } = Dimensions.get("window");
const PHOTO_SIZE = width * 0.28;
const IMAGE_AREA_HEIGHT = PHOTO_SIZE * 2.1 + 20;
const SERVER_URL = 'http://192.168.1.206:8000'; // Update this

const positions = [
  { top: 12, left: 16, rotate: "-8deg" },
  { top: 20, left: width * 0.36, rotate: "4deg" },
  { top: 10, left: width * 0.69, rotate: "-5deg" },
  { top: PHOTO_SIZE * 1.05 + 4, left: width * 0.14, rotate: "3deg" },
  { top: PHOTO_SIZE * 1.05, left: width * 0.58, rotate: "-4deg" },
  { top: PHOTO_SIZE * 1.05 + 4, left: width * 0.82 - PHOTO_SIZE, rotate: "2deg" },
];

const page1Images = [
  require("../../assets/images/photo1.jpg"),
  require("../../assets/images/photo2.jpg"),
  require("../../assets/images/photo3.jpg"),
  require("../../assets/images/photo4.jpg"),
  require("../../assets/images/photo5.jpg"),
  require("../../assets/images/photo6.jpg"),
];
const page2Images = [
  require("../../assets/images/photo7.jpg"),
  require("../../assets/images/photo8.jpg"),
  require("../../assets/images/photo9.jpg"),
  require("../../assets/images/photo10.jpg"),
  require("../../assets/images/photo11.jpg"),
  require("../../assets/images/photo12.jpg"),
];
const page3Images = [
  require("../../assets/images/photo13.jpg"),
  require("../../assets/images/photo14.jpg"),
  require("../../assets/images/photo15.jpg"),
  require("../../assets/images/photo16.jpg"),
  require("../../assets/images/photo17.jpg"),
  require("../../assets/images/photo18.jpg"),
];

const pages = [
  {
    images: page1Images,
    title: "ברוכים הבאים!",
    subtitle:
      "לכולנו קרה ששמענו מישהו/ת שנראינו חן בעיניו ולא היה לנו את האומץ\nאו ההזדמנות להגשת.",
    cta: "הבא",
  },
  {
    images: page2Images,
    title: "לא מפספסים הזדמנויות",
    subtitle:
      "עם Catch Match לא מפספסים יותר הזדמנויות.\n" +
      "נכנסים לאפליקציה ושולחים בקלות הודעה למי שלידנו.",
    cta: "הבא",
  },
  {
    images: page3Images,
    title: "יחס גברים נשים",
    subtitle:
      "תמיד תהיתם כמה גברים או נשים נמצאים עכשיו במקום שאתם רוצים ללכת אליו?\n" +
      "תוכלו לראות את כל זה באפליקציה. חפשו את בית העסק ותראו את יחס\n" +
      "הגברים והנשים במקום.",
    cta: "בואו נתחיל",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"phone" | "otp">("phone");
  const modalAnim = useRef(new Animated.Value(height)).current;
  const [phone, setPhone] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""));
  const codeRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Verify token with server
        const response = await fetch(`${SERVER_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.is_profile_complete) {
            router.replace('/MapScreen');
          } else {
            router.replace('/stage1');
          }
          return;
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    setCheckingAuth(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50 && page < pages.length - 1) goToPage(page + 1);
        else if (gs.dx > 50 && page > 0) goToPage(page - 1);
      },
    })
  ).current;

  const translateOutputs = pages.map((_, idx) =>
    slideAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [(-idx + 0) * width, (-idx + 1) * width, (-idx + 2) * width],
    })
  );
  const goToPage = (newPage: number) =>
    Animated.timing(slideAnim, {
      toValue: newPage,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setPage(newPage));

  const openModal = () => {
    setModalStep("phone");
    setShowModal(true);
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () =>
    Animated.timing(modalAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowModal(false));

  const sendCode = () => {
    setModalStep("otp");
    setCodeDigits(Array(6).fill(""));
    setTimeout(() => codeRefs.current[0]?.focus(), 100);
  };

  const onCodeChange = (text: string, idx: number) => {
    const newDigits = [...codeDigits];
    newDigits[idx] = text;
    setCodeDigits(newDigits);
    if (text && idx < 5) codeRefs.current[idx + 1]?.focus();
  };

  const onNextPress = () => {
    if (page < pages.length - 1) goToPage(page + 1);
    else openModal();
  };

  const confirmCode = async () => {
    // TODO: Verify OTP with server here
    // For now, save phone and navigate to email stage
    await AsyncStorage.setItem('temp_phone', phone);
    router.push('../emailStage');
  };

  if (checkingAuth) {
    return (
      <LinearGradient
        colors={["#FFA726", "#8E24AA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  const activeDot = 2 - page;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FFA726", "#8E24AA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safe} {...panResponder.panHandlers}>
          {/* IMAGE STACK */}
          <View style={styles.imageArea}>
            {pages.map((pg, pgIdx) => (
              <Animated.View
                key={pgIdx}
                style={[
                  StyleSheet.absoluteFillObject,
                  { transform: [{ translateX: translateOutputs[pgIdx] }] },
                ]}
              >
                {pg.images.map((src, i) => (
                  <Image
                    key={i}
                    source={src}
                    style={[
                      styles.photo,
                      {
                        top: positions[i].top,
                        left: positions[i].left,
                        transform: [{ rotate: positions[i].rotate }],
                      },
                    ]}
                  />
                ))}
              </Animated.View>
            ))}
          </View>

          {/* TEXT */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{pages[page].title}</Text>
            <Text style={styles.subtitle}>{pages[page].subtitle}</Text>
          </View>

          {/* PAGINATION & BUTTON */}
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {pages.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === activeDot && styles.activeDot]}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={onNextPress}>
              <Text style={styles.buttonText}>{pages[page].cta}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {showModal && (
        <KeyboardAvoidingView
          style={StyleSheet.absoluteFill}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              closeModal();
            }}
          >
            <BlurView intensity={100} tint="default" style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.modal, { transform: [{ translateY: modalAnim }] }]}>
            {modalStep === "phone" ? (
              <>        
                <Text style={styles.modalTitle}>שלחנו לך קוד אימות לטלפון</Text>
                <Text style={styles.modalSubtitle}>{phone || "054-0000000"}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="מספר טלפון"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus
                />
                <Text style={styles.disclaimer}>
                  בלחיצה על כפתור שלח לי קוד אימות, הנך מאשר/ת את תנאי השימוש והפרטיות
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={sendCode}>
                  <Text style={styles.modalButtonText}>שלחו לי קוד אימות</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>                
                <Text style={styles.modalTitle}>הזינו את קוד האימות</Text>
                <Text style={styles.modalSubtitle}>{phone}</Text>
                <Text style={[styles.modalSubtitle, { marginTop: 8 }]}>הזן את הקוד שקיבלת</Text>
                <View style={styles.otpContainer}>
                  {codeDigits.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      ref={el => { codeRefs.current[idx] = el }}
                      onChangeText={txt => onCodeChange(txt, idx)}
                    />
                  ))}
                </View>
                <View style={styles.otpFooter}>
                  <TouchableOpacity onPress={sendCode}>
                    <Text style={styles.linkText}>לא קיבלתי קוד</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setModalStep("phone"); setCodeDigits(Array(6).fill("")); }}>
                    <Text style={styles.linkText}>לא הטלפון שלי </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalButton} onPress={confirmCode}>
                  <Text style={styles.modalButtonText}>אישור</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  imageArea: {
    height: IMAGE_AREA_HEIGHT,
    position: "relative",
    marginTop: 20,
  },
  photo: {
    position: "absolute",
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 16,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E24AA",
    textAlign: "center",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#8E24AA",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    backgroundColor: "#fff",
  },
  otpFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  linkText: {
    color: "#8E24AA",
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
