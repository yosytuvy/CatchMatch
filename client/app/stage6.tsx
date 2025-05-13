// app/stage6.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';

I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');
const STAGES = 10;
const STAGE = 6;
const PROGRESS = STAGE / STAGES;

const BAR_HEIGHT = 4;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 24;
const SLOT_GAP = 12;

const LARGE_SIZE = width * 0.6;
const SMALL_SIZE = width - LARGE_SIZE - SLOT_GAP * 3;  // <-- wider!

export default function Stage6() {
  const router = useRouter();
  const {images, setImages} = useOnboarding();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('נדרש גישה לתמונות כדי להעלות תמונות');
      }
    })();
  }, []);

  const pickImage = async (idx: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;    // <-- new API shape
      const newImgs = [...images];
      newImgs[idx] = uri;
      setImages(newImgs);
    }
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

      {/* Title */}
      <Text style={styles.title}>העלו תמונות</Text>

      {/* Image pickers */}
      <View style={styles.uploaderRow}>
        {/* Main slot */}
        <TouchableOpacity
          style={[styles.largeSlot, styles.dashed]}
          onPress={() => pickImage(0)}
        >
          {images[0] ? (
            <Image source={{ uri: images[0]! }} style={styles.largeImage} />
          ) : (
            <Text style={styles.plusText}>+ תמונה ראשית</Text>
          )}
        </TouchableOpacity>

        {/* Small column */}
        <View style={styles.smallColumn}>
          {[1, 2, 3].map((i) => (
            <TouchableOpacity
              key={i}
              style={[styles.smallSlot, styles.dashed]}
              onPress={() => pickImage(i)}
            >
              {images[i] ? (
                <Image source={{ uri: images[i]! }} style={styles.smallImage} />
              ) : (
                <Text style={styles.plusSmall}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/stage7')}
        >
          <Text style={styles.nextButtonText}>הבא</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/stage5')}
          style={styles.backLinkContainer}
        >
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
    padding: SLOT_GAP,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SLOT_GAP,
    marginTop: 8,
    height: PILL_HEIGHT,
  },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    backgroundColor: '#EEE',
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  fill: { height: '100%' },
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
    marginTop: 24,
    marginBottom: 16,
  },
  uploaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  largeSlot: {
    width: LARGE_SIZE,
    height: LARGE_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallColumn: {
    justifyContent: 'space-between',
  },
  smallSlot: {
    width: SMALL_SIZE,
    height: (LARGE_SIZE - SLOT_GAP * 2) / 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  plusText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  plusSmall: {
    color: '#999',
    fontSize: 24,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  navRow: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#8E24AA',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: SLOT_GAP,
    marginBottom: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLinkContainer: {
    alignSelf: 'flex-end',
    marginRight: SLOT_GAP,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  backLink: {
    fontSize: 14,
    color: '#555',
  },
});
