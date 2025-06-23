import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Word = {
  id: string;
  word: string;
  translation: string;
};

const STORAGE_KEY_LEARNED = '@learned_words';
const STORAGE_KEY_KNOWN = '@known_words';
const STORAGE_KEY_RECORDINGS = '@user_recordings'; // { wordId: uri }

const initialWords: Word[] = [
  { id: '1', word: 'Hello', translation: 'Përshëndetje' },
  { id: '2', word: 'Thank you', translation: 'Faleminderit' },
  { id: '3', word: 'Goodbye', translation: 'Mirupafshim' },
  { id: '4', word: 'Please', translation: 'Ju lutem' },
  { id: '5', word: 'Yes', translation: 'Po' },
  { id: '6', word: 'No', translation: 'Jo' },
];

// Funksion bazik për krahasim fjalësh
const similarity = (a: string, b: string) => {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
};

export default function PracticeScreen() {
  const [themeDark, setThemeDark] = useState(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme) setThemeDark(savedTheme === 'dark');

      const savedLearned = await AsyncStorage.getItem(STORAGE_KEY_LEARNED);
      if (savedLearned) setLearnedWords(JSON.parse(savedLearned));

      const savedKnown = await AsyncStorage.getItem(STORAGE_KEY_KNOWN);
      if (savedKnown) setKnownWords(JSON.parse(savedKnown));

      const savedRecordings = await AsyncStorage.getItem(STORAGE_KEY_RECORDINGS);
      if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !themeDark;
    setThemeDark(newTheme);
    await AsyncStorage.setItem('@app_theme', newTheme ? 'dark' : 'light');
  };

  const speakWord = (word: string) => {
    Speech.speak(word, { language: 'en' });
  };

  const speakTranslation = (translation: string) => {
    Speech.speak(translation, { language: 'sq' });
  };

  const markLearned = async () => {
    const currentWord = initialWords[currentIndex];
    if (!learnedWords.includes(currentWord.id)) {
      const updated = [...learnedWords, currentWord.id];
      setLearnedWords(updated);
      await AsyncStorage.setItem(STORAGE_KEY_LEARNED, JSON.stringify(updated));
      Alert.alert('Great!', `"${currentWord.word}" marked as learned.`);
    } else {
      Alert.alert('Info', `"${currentWord.word}" is already learned.`);
    }
  };

  const markKnown = async () => {
    const currentWord = initialWords[currentIndex];
    if (!knownWords.includes(currentWord.id)) {
      const updated = [...knownWords, currentWord.id];
      setKnownWords(updated);
      await AsyncStorage.setItem(STORAGE_KEY_KNOWN, JSON.stringify(updated));
      Alert.alert('Great!', `You marked "${currentWord.word}" as known / well pronounced.`);
    } else {
      Alert.alert('Info', `"${currentWord.word}" is already marked as known.`);
    }
  };

  const startRecording = async () => {
    try {
      setIsChecking(false);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setIsChecking(true);

      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI');

      // Ruaj URI për fjalën aktuale në AsyncStorage
      const currentWord = initialWords[currentIndex];
      const updatedRecordings = { ...recordings, [currentWord.id]: uri };
      setRecordings(updatedRecordings);
      await AsyncStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(updatedRecordings));

      Alert.prompt(
        'Pronunciation Check',
        `Type what you said for "${currentWord.word}":`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsChecking(false),
          },
          {
            text: 'Check',
            onPress: (text) => {
              const sim = similarity(text || '', currentWord.word);
              if (sim > 0.7) {
                markKnown();
              } else {
                Alert.alert('Try Again', 'Your pronunciation does not match well. Please try again.');
              }
              setIsChecking(false);
            },
          },
        ],
        'plain-text'
      );
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
      setIsChecking(false);
    }
  };

  const playUserRecording = async () => {
    const currentWord = initialWords[currentIndex];
    const uri = recordings[currentWord.id];
    if (!uri) {
      Alert.alert('Info', 'No recording found for this word yet.');
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
      Alert.alert('Error', 'Could not play your recording.');
    }
  };

  const nextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % initialWords.length);
  };

  const currentWord = initialWords[currentIndex];
  const isLearned = learnedWords.includes(currentWord.id);
  const isKnown = knownWords.includes(currentWord.id);

  return (
    <SafeAreaView style={[styles.container, themeDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, themeDark ? styles.textLight : styles.textDark]}>
          Practice English Words
        </Text>
        <View style={styles.themeToggle}>
          <Text style={themeDark ? styles.textLight : styles.textDark}>Dark Mode</Text>
          <Switch value={themeDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.wordText, isLearned && styles.learnedText]}>
          {currentWord.word}
        </Text>
        <Text style={[styles.translationText, themeDark ? styles.textLight : styles.textDark]}>
          {currentWord.translation}
        </Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button} onPress={() => speakWord(currentWord.word)}>
            <Text style={styles.buttonText}>🔊 Listen English</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => speakTranslation(currentWord.translation)}>
            <Text style={styles.buttonText}>🔈 Listen Shqip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, isLearned ? styles.learnedButton : styles.markButton]}
            onPress={markLearned}
          >
            <Text style={styles.buttonText}>{isLearned ? 'Learned ✔️' : 'Mark Learned'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isKnown ? styles.knownButton : styles.markButton]}
            onPress={markKnown}
          >
            <Text style={styles.buttonText}>{isKnown ? 'Known ✔️' : 'Mark Known'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, isRecording ? styles.recordingButton : styles.markButton]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isChecking}
          >
            {isRecording ? (
              <Text style={styles.buttonText}>🎙️ Stop Recording</Text>
            ) : (
              <Text style={styles.buttonText}>🎤 Speak Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={playUserRecording}>
            <Text style={styles.buttonText}>▶️ Play My Recording</Text>
          </TouchableOpacity>
        </View>

        {isChecking && <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 10 }} />}

        <TouchableOpacity style={styles.nextButton} onPress={nextWord}>
          <Text style={styles.nextButtonText}>Next Word ➡️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#f5f5f7' },
  containerDark: { backgroundColor: '#1c1c1e' },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeToggle: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  textLight: { color: '#f5f5f7' },
  textDark: { color: '#1c1c1e' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wordText: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 10,
    color: '#007aff',
  },
  translationText: {
    fontSize: 22,
    marginBottom: 40,
    color: '#666',
  },
  learnedText: {
    color: '#34c759',
    textDecorationLine: 'line-through',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  markButton: {
    backgroundColor: '#ff9500',
  },
  learnedButton: {
    backgroundColor: '#34c759',
  },
  knownButton: {
    backgroundColor: '#5856d6',
  },
  recordingButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#5856d6',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 40,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
  },
});
