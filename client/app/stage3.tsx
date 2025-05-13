// app/stage3.tsx

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
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';

I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');
const STAGES = 10;
const STAGE = 3;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;

export default function Stage3() {
  const router = useRouter();
  // Start with no selection
  const {lookingFor, setLookingFor} = useOnboarding();

  const choose = (lookingFor: 'gents' | 'ladies') => {
    setLookingFor(lookingFor);
    // short delay so user sees the highlight
    setTimeout(() => router.push('/stage4'), 150);
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
      <Text style={styles.title}>מה אתם מחפשים?</Text>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            lookingFor === 'gents' && styles.optionButtonActive,
          ]}
          onPress={() => choose('gents')}
        >
          <Text
            style={[
              styles.optionText,
              lookingFor === 'gents' && styles.optionTextActive,
            ]}
          >
            אני מחפש/ת גברים
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            lookingFor === 'ladies' && styles.optionButtonActive,
          ]}
          onPress={() => choose('ladies')}
        >
          <Text
            style={[
              styles.optionText,
              lookingFor === 'ladies' && styles.optionTextActive,
            ]}
          >
            אני מחפש/ת נשים
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer with “Back” on bottom-right */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/stage2')}>
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
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#8E24AA',
    borderColor: '#8E24AA',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
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
