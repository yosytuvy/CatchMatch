// app/stage4.tsx

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
const STAGE = 4;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;

const OPTIONS = [
  { key: 'long', label: 'קשר רציני לטווח ארוך' },
  { key: 'flow', label: 'אני זורם/ת' },
  { key: 'short', label: 'קשר קצר ולא מחייב' },
];

export default function Stage4() {
  const router = useRouter();
  const {relationshipType, setRelationshipType} = useOnboarding();

  const choose = (key: string) => {
    setRelationshipType(key);
    setTimeout(() => router.push('/stage5'), 150);
  };

  const skip = () => {
    router.push('/stage5');
  };

  const goBack = () => {
    router.push('/stage3');
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

      {/* Skip Link (under progress bar) */}
      <TouchableOpacity onPress={skip} style={styles.skipContainer}>
        <Text style={styles.skipText}>דלג/י</Text>
      </TouchableOpacity>

      {/* Question */}
      <Text style={styles.title}>איזה סוג קשר אתם מחפשים?</Text>

      {/* Options */}
      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionButton,
              relationshipType === opt.key && styles.optionButtonActive,
            ]}
            onPress={() => choose(opt.key)}
          >
            <Text
              style={[
                styles.optionText,
                relationshipType === opt.key && styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Back link */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={goBack}>
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
  },
  progressWrapper: {
    marginTop: 8,
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
  skipContainer: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    color: '#555',
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
