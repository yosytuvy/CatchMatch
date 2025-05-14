// app/ProfileScreen.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from './context/OnboardingContext';

const { height, width } = Dimensions.get('window');

interface ProfileMenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const { fullName } = useOnboarding();
  
  // Profile background image (you can use a user's photo here)
  const profileBgImage = require('../assets/images/photo1.jpg');
  const profileImage = require('../assets/images/photo1.jpg'); // Replace with actual user image

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
    router.replace('/');
  };

  const menuItems: ProfileMenuItem[] = [
    {
      id: 'view-profile',
      label: 'צפייה בפרופיל שלי',
      icon: 'person-outline',
      onPress: () => {},
    },
    {
      id: 'edit-profile',
      label: 'עריכת פרופיל',
      icon: 'create-outline',
      onPress: () => {},
    },
    {
      id: 'edit-photos',
      label: 'עריכת תמונות',
      icon: 'images-outline',
      onPress: () => {},
    },
    {
      id: 'edit-preferences',
      label: 'עריכת העדפות',
      icon: 'heart-outline',
      onPress: () => {},
    },
    {
      id: 'social-networks',
      label: 'רשתות חברתיות',
      icon: 'apps-outline',
      onPress: () => {},
    },
    {
      id: 'settings',
      label: 'הגדרות',
      icon: 'settings-outline',
      onPress: () => {},
    },
    {
      id: 'share-app',
      label: 'שיתוף האפליקציה',
      icon: 'share-social-outline',
      onPress: () => {},
    },
    {
      id: 'contact',
      label: 'יצירת קשר',
      icon: 'headset-outline',
      onPress: () => {},
    },
    {
      id: 'logout',
      label: 'התנתקות',
      icon: 'log-out-outline',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Blurred background with profile image */}
        <Image source={profileBgImage} style={styles.backgroundImage} blurRadius={20} />
        
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.profileCard,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.handle} />
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Profile Header */}
            <View style={styles.header}>
              <Image source={profileImage} style={styles.profileImage} />
              <Text style={styles.name}>{fullName || 'תמיר'}</Text>
              <Text style={styles.age}>27, מחזה תמוזה</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={[
                      styles.menuItemText,
                      item.danger && styles.dangerText
                    ]}>
                      {item.label}
                    </Text>
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={item.danger ? '#FF3B30' : '#333'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  backdrop: {
    flex: 1,
  },
  profileCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#DEDEDE',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#FF3B30',
  },
});