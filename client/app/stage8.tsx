// app/stage8.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useOnboarding } from './context/OnboardingContext';

const { width } = Dimensions.get('window');

export default function Stage8() {
  const router = useRouter();
  const {
    about,
    setAbout,
    height,
    setHeight,
    smokes,
    setSmokes,
    hobbies,
    setHobbies,
  } = useOnboarding();

  const [hobbyInput, setHobbyInput] = useState('');

  const addHobby = () => {
    const trimmed = hobbyInput.trim();
    if (trimmed && !hobbies.includes(trimmed)) {
      setHobbies([...hobbies, trimmed]);
    }
    setHobbyInput('');
  };

  const removeHobby = (item: string) => {
    setHobbies(hobbies.filter(h => h !== item));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>ספר קצת על עצמך</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="קצת עליי..."
            multiline
            value={about}
            onChangeText={setAbout}
          />

          <Text style={styles.header}>הגובה שלך</Text>
          <TextInput
            style={styles.input}
            placeholder="הקלד את הגובה שלך"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.header}>האם אתה מעשן?</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={smokes}
              onValueChange={(val) => setSmokes(val)}
              style={styles.picker}
            >
              <Picker.Item label="בחר" value="" />
              <Picker.Item label="כן" value="yes" />
              <Picker.Item label="לא" value="no" />
            </Picker>
          </View>

          <Text style={styles.header}>תחביבים</Text>
          <TextInput
            style={styles.input}
            placeholder="הוסף תחביב ולחץ על Enter"
            value={hobbyInput}
            onChangeText={setHobbyInput}
            onSubmitEditing={addHobby}
            blurOnSubmit={false}
            returnKeyType="done"
          />
          <View style={styles.hobbiesContainer}>
            {hobbies.map((h) => (
              <View key={h} style={styles.hobbyPill}>
                <Text style={styles.hobbyText}>{h}</Text>
                <TouchableOpacity onPress={() => removeHobby(h)}>
                  <Text style={styles.remove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>חזור</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.next} onPress={() => router.push('/stage9')}>
            <Text style={styles.nextText}>המשך</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 80 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: { width: width - 40 },
  hobbiesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  hobbyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: { marginRight: 6 },
  remove: { fontSize: 16, color: '#888' },
  buttons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  back: { justifyContent: 'center' },
  backText: { color: '#555', fontSize: 16 },
  next: {
    backgroundColor: '#8E24AA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
