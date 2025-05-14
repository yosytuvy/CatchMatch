// app/stage10.tsx - Updated with authentication

import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL = 'http://192.168.1.206:8000';

export default function Stage10() {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const {
    fullName,
    dob,
    gender,
    lookingFor,
    relationshipType,
    ageRange,
    images,
    city,
    about,
    height,
    smokes,
    hobbies,
    instagram,
    tiktok,
    setProfileId,
  } = useOnboarding();

  const handleComplete = async () => {
    setRequesting(true);
    try {
      // 1) Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'הרשאת מיקום נדחתה',
          'כדי להשלים את הפרופיל יש לאשר גישה למיקום.'
        );
        setRequesting(false);
        return;
      }

      // 2) Ensure city selected
      if (!city) {
        Alert.alert('שגיאה', 'לא נבחרה עיר בשלב הקודם.');
        setRequesting(false);
        return;
      }

      // 3) Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('שגיאה', 'נדרש לבצע התחברות מחדש');
        router.replace('/');
        return;
      }

      // 4) Build payload
      const payload = {
        full_name: fullName,
        dob,
        gender,
        looking_for: lookingFor,
        relationship_type: relationshipType,
        age_range: ageRange,
        images: images.filter((img) => !!img),
        city,
        about,
        height: parseInt(height, 10) || undefined,
        smokes: smokes === 'yes',
        hobbies,
        instagram,
        tiktok,
      };

      // 5) Create profile on server with auth
      const response = await fetch(`${SERVER_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('שגיאה', 'נדרש לבצע התחברות מחדש');
          router.replace('/');
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }
      
      const json = await response.json();

      // 6) Save returned profile ID for location updates
      setProfileId(json._id);

      // 7) Navigate to home or map
      router.replace('/stage11');
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הנתונים.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>אישור הרשאת מיקום</Text>
      <Text style={styles.subheader}>
        אנא אשר את גישת המיקום כדי לסיים את יצירת הפרופיל.
      </Text>
      <TouchableOpacity
        style={[styles.button, requesting && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={requesting}
      >
        {requesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>אפשר מיקום וסיים</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#555',
  },
  button: {
    backgroundColor: '#8E24AA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
