// app/stage5.tsx

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
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';

I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');
const STAGES = 10;
const STAGE = 5;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;
// shrink slider to 75% of screen width
const SLIDER_WIDTH = width * 0.75;

export default function Stage5() {
  const router = useRouter();
  const {ageRange, setAgeRange} = useOnboarding();

  const onValuesChange = (values: number[]) => {
    setAgeRange([values[0], values[1]]);
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
      <Text style={styles.title}>אני מחפש נשים בטווח גילאים</Text>

      {/* Slider */}
      <View style={styles.sliderWrapper}>
        <Text style={styles.endpointLabel}>18</Text>

        <MultiSlider
          values={[ageRange[0], ageRange[1]]}
          sliderLength={SLIDER_WIDTH}
          onValuesChange={onValuesChange}
          min={18}
          max={60}
          step={1}
          allowOverlap={false}
          snapped
          enableLabel={false}
          markerStyle={styles.marker}
          pressedMarkerStyle={styles.markerPressed}
          selectedStyle={styles.selectedTrack}
          unselectedStyle={styles.unselectedTrack}
        />

        <Text style={styles.endpointLabel}>60+</Text>
      </View>

      {/* Values under thumbs */}
      <View style={[styles.valuesRow, { width: SLIDER_WIDTH }]}>
        <Text style={styles.valueText}>{ageRange[0]}</Text>
        <Text style={styles.valueText}>{ageRange[1]}</Text>
      </View>

      {/* Next & Back */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/stage6')}
      >
        <Text style={styles.nextButtonText}>הבא</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/stage4')}
        style={styles.backLinkContainer}
      >
        <Text style={styles.backLink}>הקודם</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 16,
  },
  progressWrapper: {
    width: '90%',
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
    width: '90%',
    marginTop: 24,
    marginBottom: 16,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SLIDER_WIDTH + 80, // account for labels
    justifyContent: 'space-between',
  },
  endpointLabel: {
    fontSize: 14,
    color: '#333',
    width: 40,
    textAlign: 'center',
  },
  selectedTrack: {
    backgroundColor: '#8E24AA',
    height: BAR_HEIGHT,
  },
  unselectedTrack: {
    backgroundColor: '#EEE',
    height: BAR_HEIGHT,
  },
  marker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8E24AA',
    height: 24,
    width: 24,
    borderRadius: 12,
  },
  markerPressed: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8E24AA',
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  valueText: {
    fontSize: 18,
    color: '#333',
  },
  nextButton: {
    marginTop: 40,
    width: '90%',
    backgroundColor: '#8E24AA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLinkContainer: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingRight: '5%',
  },
  backLink: {
    fontSize: 14,
    color: '#555',
  },
});
