// app/stage2.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';

I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');
const STAGES = 10;
const STAGE = 2;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;

export default function Stage2() {
  const router = useRouter();
  const {gender, setGender} = useOnboarding();

  const choose = (gender: 'female' | 'male') => {
    setGender(gender);
    setTimeout(() => router.push('/stage3'), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        <View style={styles.track}>
          <LinearGradient
            colors={['#FFA726', '#8E24AA']}
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

      {/* Question */}
      <Text style={styles.title}>איך אתם מגדירים את עצמכם?</Text>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            gender === 'female' && styles.optionButtonActive,
          ]}
          onPress={() => choose('female')}
        >
          <Text
            style={[
              styles.optionText,
              gender === 'female' && styles.optionTextActive,
            ]}
          >
            אני אישה
          </Text>
          <Ionicons
            name="female"
            size={24}
            color="#FFA726"            // always yellow
            style={styles.optionIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            gender === 'male' && styles.optionButtonActive,
          ]}
          onPress={() => choose('male')}
        >
          <Text
            style={[
              styles.optionText,
              gender === 'male' && styles.optionTextActive,
            ]}
          >
            אני גבר
          </Text>
          <Ionicons
            name="male"
            size={24}
            color="#8E24AA"            // always purple
            style={styles.optionIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Footer with “Back” on bottom-right */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/stage1')}>
          <Text style={styles.backLink}>הקודם</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  progressWrapper: {
    marginTop: 16,
    height: PILL_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: '#EEE',
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  fill: {
    height: '100%',
  },
  pill: {
    position: 'absolute',
    top: -(PILL_HEIGHT - BAR_HEIGHT) / 2,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8E24AA',
    borderRadius: PILL_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    color: '#8E24AA',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginTop: 32,
  },
  options: {
    marginTop: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#8E24AA',
    backgroundColor: '#F5F0FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextActive: {
    color: '#8E24AA',
    fontWeight: '600',
  },
  optionIcon: {
    marginLeft: 12,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  backLink: {
    fontSize: 14,
    color: '#555',
  },
});
