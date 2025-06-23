import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Switch,
  Animated,
  SafeAreaView,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

type VocabularyItem = {
  id: string;
  word: string;
  meaning: string;
  category: string;
  audioUrl?: string;
};

const SAMPLE_VOCAB: VocabularyItem[] = [
  { id: '1', word: 'Hello', meaning: 'Përshëndetje', category: 'Greetings', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/hello--_gb_1.mp3' },
  { id: '2', word: 'Thank you', meaning: 'Faleminderit', category: 'Thanks', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/thank_you--_gb_1.mp3' },
  { id: '3', word: 'Goodbye', meaning: 'Mirupafshim', category: 'Farewell', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/goodbye--_gb_1.mp3' },
  { id: '4', word: 'Please', meaning: 'Të lutem', category: 'Others', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/please--_gb_1.mp3' },
  { id: '5', word: 'Sorry', meaning: 'Më fal', category: 'Others', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/sorry--_gb_1.mp3' },
  { id: '6', word: 'Yes', meaning: 'Po', category: 'Others', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/yes--_gb_1.mp3' },
  { id: '7', word: 'No', meaning: 'Jo', category: 'Others', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/no--_gb_1.mp3' },
  { id: '8', word: 'Friend', meaning: 'Mik', category: 'Nouns', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/friend--_gb_1.mp3' },
  { id: '9', word: 'Water', meaning: 'Ujë', category: 'Nouns', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/water--_gb_1.mp3' },
  { id: '10', word: 'Eat', meaning: 'Ha', category: 'Verbs', audioUrl: 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/eat--_gb_1.mp3' },
  // Shto edhe 20 të tjera për shembull
];

// -------------- Practice Component -----------------

export default function Practice() {
  // === 1. State variables ===
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(SAMPLE_VOCAB);
  const [filteredVocab, setFilteredVocab] = useState<VocabularyItem[]>(SAMPLE_VOCAB);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [randomOrder, setRandomOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [inputValid, setInputValid] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const autoNextTimeout = useRef<NodeJS.Timeout | null>(null);

  // === 2. Load progress from AsyncStorage ===
  useEffect(() => {
    (async () => {
      try {
        const savedScore = await AsyncStorage.getItem('@practice_score');
        const savedIndex = await AsyncStorage.getItem('@practice_index');
        if (savedScore) setScore(parseInt(savedScore));
        if (savedIndex) setCurrentIndex(parseInt(savedIndex));
      } catch (e) {
        console.log('Error loading progress', e);
      }
    })();
  }, []);

  // === 3. Save progress to AsyncStorage ===
  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('@practice_score', score.toString());
      await AsyncStorage.setItem('@practice_index', currentIndex.toString());
    } catch (e) {
      console.log('Error saving progress', e);
    }
  };

  // === 4. Clear progress ===
  const clearProgress = async () => {
    try {
      await AsyncStorage.removeItem('@practice_score');
      await AsyncStorage.removeItem('@practice_index');
      setScore(0);
      setCurrentIndex(0);
      setCorrectAnswers([]);
      setWrongAnswers([]);
      Alert.alert('Progress cleared');
    } catch (e) {
      console.log('Error clearing progress', e);
    }
  };

  // === 5. Prepare vocab list ===
  const prepareVocabList = () => {
    let list = [...vocabList];
    if (selectedCategory !== 'All') {
      list = list.filter((item) => item.category === selectedCategory);
    }
    if (randomOrder) {
      list.sort(() => Math.random() - 0.5);
    }
    setFilteredVocab(list);
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setShowAnswer(false);
    setUserAnswer('');
  };

  // === 6. Toggle dark mode ===
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // === 7. Toggle random order ===
  const toggleRandomOrder = () => setRandomOrder(!randomOrder);

  // === 8. Change category ===
  const changeCategory = (cat: string) => setSelectedCategory(cat);

  // === 9. Animated fade in for current word ===
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => fadeAnim.setValue(0));
  }, [currentIndex]);

  // === 10. Play sound ===
  const playSound = async (audioUrl?: string) => {
    if (!audioUrl || !soundOn) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log('Audio play error', e);
    }
  };

  // === 11. Handle answer submit ===
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      setInputValid(false);
      Alert.alert('Please enter your answer');
      return;
    }
    setInputValid(true);
    if (!filteredVocab[currentIndex]) return;

    const correctMeaning = filteredVocab[currentIndex].meaning.toLowerCase().trim();
    if (userAnswer.toLowerCase().trim() === correctMeaning) {
      Alert.alert('Correct!', 'Good job!');
      setScore(score + 1);
      setCorrectAnswers([...correctAnswers, filteredVocab[currentIndex].id]);
    } else {
      Alert.alert('Wrong!', `Correct answer: ${filteredVocab[currentIndex].meaning}`);
      setWrongAnswers([...wrongAnswers, filteredVocab[currentIndex].id]);
    }
    setShowAnswer(true);
    playSound(filteredVocab[currentIndex].audioUrl);

    if (autoNextTimeout.current) clearTimeout(autoNextTimeout.current);
    autoNextTimeout.current = setTimeout(() => {
      nextWord();
    }, 3000);
  };

  // === 12. Next word ===
  const nextWord = () => {
    setUserAnswer('');
    setShowAnswer(false);
    if (currentIndex + 1 < filteredVocab.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Practice finished!', `Your score: ${score} / ${filteredVocab.length}`);
      prepareVocabList();
    }
  };

  // === 13. Show modal with word details ===
  const showWordDetails = () => {
    if (!filteredVocab[currentIndex]) return;
    setSelectedWord(filteredVocab[currentIndex]);
    setModalVisible(true);
  };

  // === 14. Hide modal ===
  const hideModal = () => setModalVisible(false);

  // === 15. Toggle sound on/off ===
  const toggleSound = () => setSoundOn(!soundOn);

  // === 16. Save vocab list to AsyncStorage (optional feature) ===
  const saveVocabList = async () => {
    try {
      await AsyncStorage.setItem('@vocab_list', JSON.stringify(vocabList));
      Alert.alert('Vocabulary saved');
    } catch (e) {
      console.log('Error saving vocab', e);
    }
  };

  // === 17. Load vocab list from AsyncStorage (optional) ===
  const loadVocabList = async () => {
    try {
      const data = await AsyncStorage.getItem('@vocab_list');
      if (data) {
        setVocabList(JSON.parse(data));
        prepareVocabList();
      }
    } catch (e) {
      console.log('Error loading vocab', e);
    }
  };

  // === 18. Add new word (example) ===
  const addNewWord = (word: VocabularyItem) => {
    setVocabList((prev) => [...prev, word]);
  };

  // === 19. Remove word by id ===
  const removeWordById = (id: string) => {
    setVocabList((prev) => prev.filter((w) => w.id !== id));
  };

  // === 20. Edit existing word ===
  const editWord = (id: string, newData: Partial<VocabularyItem>) => {
    setVocabList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...newData } : w))
    );
  };

  // === 21. Shuffle vocab list manually ===
  const shuffleVocabList = () => {
    let shuffled = [...filteredVocab];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFilteredVocab(shuffled);
  };

  // === 22. Skip current word ===
  const skipWord = () => {
    nextWord();
  };

  // === 23. Show correct answer manually ===
  const revealAnswer = () => {
    if (filteredVocab[currentIndex]) setShowAnswer(true);
  };

  // === 24. Go to first word ===
  const goToFirstWord = () => {
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setUserAnswer('');
    setShowAnswer(false);
  };

  // === 25. Go to last word ===
  const goToLastWord = () => {
    setCurrentIndex(filteredVocab.length - 1);
    setShowAnswer(false);
    setUserAnswer('');
  };

  // === 26. Move to previous word ===
  const previousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
    }
  };

  // === 27. Set all answers correct (testing/debugging) ===
  const setAllCorrect = () => {
    setScore(filteredVocab.length);
    setCorrectAnswers(filteredVocab.map((w) => w.id));
    setWrongAnswers([]);
  };

  // === 28. Toggle input box enable/disable ===
  const [inputDisabled, setInputDisabled] = useState(false);
  const toggleInputDisabled = () => setInputDisabled(!inputDisabled);

  // === 29. Validate user input live ===
  const validateInput = (text: string) => {
    setUserAnswer(text);
    setInputValid(text.trim().length > 0);
  };

  // === 30. Save current progress when index changes ===
  useEffect(() => {
    saveProgress();
  }, [currentIndex, score]);

  // === 31. Cleanup sound on unmount ===
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (autoNextTimeout.current) {
        clearTimeout(autoNextTimeout.current);
      }
    };
  }, []);

  // === 32. Keyboard submit handling (optional, depends on UI) ===
  // We can skip for now or handle keyboard return key in TextInput with onSubmitEditing

  // === 33. Filter vocab on category change ===
  useEffect(() => {
    prepareVocabList();
  }, [selectedCategory, randomOrder]);

  // === 34. Render category buttons ===
  const renderCategories = () => {
    const categories = ['All', ...Array.from(new Set(vocabList.map((v) => v.category)))];
    return (
      <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => changeCategory(cat)}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // === 35. Render progress bar (optional) ===
  // For simplicity, just text-based progress shown below

  // === 36. Render detailed word list (optional) ===
  // Can be added as separate modal or screen, skipped here for brevity

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          Vocabulary Practice
        </Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* Settings row */}
      <View style={styles.toggleRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Switch value={randomOrder} onValueChange={toggleRandomOrder} />
          <Text style={[styles.toggleLabel, darkMode && styles.darkText]}>
            Random Order
          </Text>
        </View>
      </View>

      {/* Categories */}
      {renderCategories()}

      {/* Current word with fade */}
      <Animated.View style={{ opacity: fadeAnim, marginVertical: 20 }}>
        <TouchableOpacity onPress={showWordDetails}>
          <Text style={[styles.word, darkMode && styles.darkText]}>
            {filteredVocab[currentIndex]?.word ?? 'No words'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Input box */}
      <TextInput
        style={[
          styles.input,
          darkMode && styles.inputDark,
          !inputValid && styles.inputInvalid,
        ]}
        editable={!inputDisabled}
        placeholder="Enter meaning..."
        placeholderTextColor={darkMode ? '#ccc' : '#888'}
        value={userAnswer}
        onChangeText={validateInput}
        onSubmitEditing={handleSubmitAnswer}
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleSubmitAnswer} disabled={inputDisabled}>
        <Text style={styles.buttonText}>Submit Answer</Text>
      </TouchableOpacity>

      {showAnswer && (
        <>
          <Text style={[styles.showAnswerText, darkMode && styles.darkText]}>
            Correct meaning: {filteredVocab[currentIndex]?.meaning}
          </Text>
          <TouchableOpacity style={styles.buttonNext} onPress={nextWord}>
            <Text style={styles.buttonText}>Next Word</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Score and progress */}
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, darkMode && styles.darkText]}>
          Score: {score}
        </Text>
        <Text style={[styles.statsText, darkMode && styles.darkText]}>
          Word: {currentIndex + 1} / {filteredVocab.length}
        </Text>
      </View>

      {/* Modal for word details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
              {selectedWord?.word}
            </Text>
            <Text style={[styles.modalMeaning, darkMode && styles.darkText]}>
              Meaning: {selectedWord?.meaning}
            </Text>
            <Text style={[styles.modalCategory, darkMode && styles.darkText]}>
              Category: {selectedWord?.category}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => playSound(selectedWord?.audioUrl)}
              disabled={!selectedWord?.audioUrl}
            >
              <Text style={styles.buttonText}>Play Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#777' }]}
              onPress={hideModal}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clear progress button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearProgress}>
        <Text style={[styles.clearButtonText, darkMode && styles.darkText]}>
          Clear Progress
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// -------------- Styles -----------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafd' },
  darkContainer: { backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4a90e2' },
  darkText: { color: '#e1e1e1' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: '#4a90e2' },
  categoryScroll: { marginVertical: 10 },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4a90e2',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4a90e2',
  },
  categoryText: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  word: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#4a90e2' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#222',
    borderColor: '#555',
    color: '#eee',
  },
  inputInvalid: {
    borderColor: '#ea4335',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonNext: {
    backgroundColor: '#34a853',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  showAnswerText: { fontSize: 16, color: '#4a90e2', textAlign: 'center', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statsText: { fontSize: 16, fontWeight: '600', color: '#4a90e2' },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalContentDark: {
    backgroundColor: '#333',
  },
  modalTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#4a90e2' },
  modalMeaning: { fontSize: 20, marginBottom: 8 },
  modalCategory: { fontSize: 16, marginBottom: 16, fontStyle: 'italic', color: '#666' },
  clearButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ea4335',
  },
  clearButtonText: { color: '#ea4335', fontWeight: '700', fontSize: 16 },
});
