// app/emailStage.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";

const SERVER_URL = 'http://192.168.1.206:8000'; // Update this

export default function EmailStage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('שגיאה', 'אנא הזן כתובת אימייל תקינה');
      return;
    }

    setLoading(true);
    try {
      // Get phone from previous stage (could be passed as param or stored temporarily)
      const phone = await AsyncStorage.getItem('temp_phone');
      
      const response = await fetch(`${SERVER_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store auth token
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_id', data.user_id);
      await AsyncStorage.removeItem('temp_phone'); // Clean up
      
      // Navigate based on profile completion
      if (data.is_profile_complete) {
        router.replace('/MapScreen');
      } else {
        router.replace('/stage1');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'לא הצלחנו לשמור את הפרטים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFA726", "#8E24AA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>כתובת האימייל שלך</Text>
            <Text style={styles.subtitle}>
              נשתמש באימייל שלך כדי לשמור את הפרופיל שלך
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>המשך</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#8E24AA',
    fontSize: 16,
    fontWeight: '600',
  },
});