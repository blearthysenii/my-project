import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type Word = {
  id: string;
  word: string;
  translation: string;
};

const STORAGE_KEY = '@vocab_words';
const LEARNED_KEY = '@vocab_learned';
const THEME_KEY = '@app_theme';

const initialWords: Word[] = [
  { id: '1', word: 'Hello', translation: 'Hello' },
  { id: '2', word: 'Thank you', translation: 'Thank you' },
  { id: '3', word: 'Goodbye', translation: 'Goodbye' },
  { id: '4', word: 'Please', translation: 'Please' },
  { id: '5', word: 'Yes', translation: 'Yes' },
  { id: '6', word: 'No', translation: 'No' },

  { id: '7', word: 'Morning', translation: 'Morning' },
  { id: '8', word: 'Night', translation: 'Night' },
  { id: '9', word: 'Friend', translation: 'Friend' },
  { id: '10', word: 'Family', translation: 'Family' },
  { id: '11', word: 'Food', translation: 'Food' },
  { id: '12', word: 'Water', translation: 'Water' },
  { id: '13', word: 'Love', translation: 'Love' },
  { id: '14', word: 'Work', translation: 'Work' },
  { id: '15', word: 'School', translation: 'School' },
  { id: '16', word: 'Happy', translation: 'Happy' },
  { id: '17', word: 'Sad', translation: 'Sad' },
  { id: '18', word: 'Run', translation: 'Run' },
  { id: '19', word: 'Walk', translation: 'Walk' },
  { id: '20', word: 'Sleep', translation: 'Sleep' },
  { id: '21', word: 'Read', translation: 'Read' },
  { id: '22', word: 'Write', translation: 'Write' },
  { id: '23', word: 'Play', translation: 'Play' },
  { id: '24', word: 'Dance', translation: 'Dance' },
  { id: '25', word: 'Music', translation: 'Music' },
  { id: '26', word: 'Book', translation: 'Book' },
];

export default function LessonsScreen() {
  // States
  const [words, setWords] = useState<Word[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showOnlyLearned, setShowOnlyLearned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [themeDark, setThemeDark] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);
  const [deletedWord, setDeletedWord] = useState<Word | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load data on mount
  useEffect(() => {
    (async () => {
      const savedWords = await AsyncStorage.getItem(STORAGE_KEY);
      const savedLearned = await AsyncStorage.getItem(LEARNED_KEY);
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);

      if (savedWords) setWords(JSON.parse(savedWords));
      else setWords(initialWords);

      if (savedLearned) setLearnedIds(JSON.parse(savedLearned));
      if (savedTheme) setThemeDark(savedTheme === 'dark');
    })();
  }, []);

  // Persist words and learnedIds
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    AsyncStorage.setItem(LEARNED_KEY, JSON.stringify(learnedIds));
  }, [learnedIds]);

  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, themeDark ? 'dark' : 'light');
  }, [themeDark]);

  // Filtered & sorted list
  const filteredWords = words
    .filter((w) => {
      const matchSearch =
        w.word.toLowerCase().includes(searchText.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchText.toLowerCase());
      const matchLearned = showOnlyLearned ? learnedIds.includes(w.id) : true;
      return matchSearch && matchLearned;
    })
    .sort((a, b) => {
      const aLearned = learnedIds.includes(a.id);
      const bLearned = learnedIds.includes(b.id);
      if (aLearned !== bLearned) return aLearned ? -1 : 1;
      return a.word.localeCompare(b.word);
    });

  // Toggle learned
  const toggleLearned = (id: string) => {
    setLearnedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Play pronunciation
  const speakWord = (text: string) => {
    Speech.speak(text, { language: 'en' });
  };

  // Show word details modal (edit)
  const openEditModal = (word: Word) => {
    setEditingWord(word);
    setNewWord(word.word);
    setNewTranslation(word.translation);
    setModalVisible(true);
  };

  // Add or update word
  const saveWord = () => {
    if (newWord.trim() === '' || newTranslation.trim() === '') {
      Alert.alert('Validation Error', 'Please fill in both fields');
      return;
    }

    if (editingWord) {
      setWords((prev) =>
        prev.map((w) =>
          w.id === editingWord.id
            ? { ...w, word: newWord.trim(), translation: newTranslation.trim() }
            : w
        )
      );
    } else {
      const newEntry: Word = {
        id: Date.now().toString(),
        word: newWord.trim(),
        translation: newTranslation.trim(),
      };
      setWords((prev) => [newEntry, ...prev]);
    }

    setModalVisible(false);
    setEditingWord(null);
    setNewWord('');
    setNewTranslation('');
  };

  // Delete word with undo
  const deleteWord = (word: Word) => {
    Alert.alert('Delete Word?', `Are you sure you want to delete "${word.word}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setWords((prev) => prev.filter((w) => w.id !== word.id));
          setLearnedIds((prev) => prev.filter((id) => id !== word.id));
          setDeletedWord(word);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease,
          }).start();

          if (undoTimeout.current) clearTimeout(undoTimeout.current);
          undoTimeout.current = setTimeout(() => {
            setDeletedWord(null);
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.ease,
            }).start();
          }, 5000);
        },
      },
    ]);
  };

  // Undo delete
  const undoDelete = () => {
    if (deletedWord) {
      setWords((prev) => [deletedWord!, ...prev]);
      setDeletedWord(null);
      if (undoTimeout.current) clearTimeout(undoTimeout.current);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    }
  };

  // Reset all learned
  const resetLearned = () => {
    Alert.alert('Reset Learned Words', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => setLearnedIds([]),
      },
    ]);
  };

  // Progress %
  const progressPercent = words.length ? (learnedIds.length / words.length) * 100 : 0;

  // Pull to refresh simulation
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView
      style={[styles.container, themeDark ? styles.containerDark : styles.containerLight]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <Switch value={themeDark} onValueChange={setThemeDark} />
              </View>

              <Text style={[styles.title, themeDark ? styles.textLight : styles.textDark]}>
                Vocabulary Practice
              </Text>
            </View>

            {/* Search + Add */}
            <View style={styles.searchAddContainer}>
              <TextInput
                placeholder="Search words or translations"
                placeholderTextColor={themeDark ? '#aaa' : '#555'}
                value={searchText}
                onChangeText={setSearchText}
                style={[styles.searchInput, themeDark ? styles.inputDark : styles.inputLight]}
                clearButtonMode="while-editing"
              />
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setEditingWord(null);
                  setNewWord('');
                  setNewTranslation('');
                }}
                style={styles.addButton}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>＋</Text>
              </TouchableOpacity>
            </View>

            {/* Filter / Reset / Progress */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                onPress={() => setShowOnlyLearned(!showOnlyLearned)}
                style={[styles.filterButton, showOnlyLearned && styles.filterButtonActive]}
                activeOpacity={0.7}
              >
                <Text style={showOnlyLearned ? styles.filterTextActive : styles.filterText}>
                  Show Learned
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetLearned}
                style={[styles.filterButton, styles.resetButton]}
                activeOpacity={0.7}
              >
                <Text style={styles.resetText}>Reset Learned</Text>
              </TouchableOpacity>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Word List */}
            <FlatList
              style={{ flex: 1 }}
              data={filteredWords}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const learned = learnedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => toggleLearned(item.id)}
                    onLongPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.wordItem,
                      learned && styles.wordItemLearned,
                      themeDark ? styles.itemDark : styles.itemLight,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.wordText,
                          learned && styles.wordTextLearned,
                          themeDark ? styles.textLight : styles.textDark,
                        ]}
                      >
                        {item.word}
                      </Text>
                      <Text
                        style={[
                          styles.translationText,
                          learned && styles.wordTextLearned,
                          themeDark ? styles.textLight : styles.textDark,
                        ]}
                      >
                        {item.translation}
                      </Text>
                    </View>
                    <View style={styles.wordButtons}>
                      <TouchableOpacity
                        onPress={() => speakWord(item.word)}
                        style={styles.iconButton}
                        accessibilityLabel={`Pronounce ${item.word}`}
                      >
                        <Text style={styles.icon}>🔊</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteWord(item)}
                        style={[styles.iconButton, styles.deleteIconButton]}
                        accessibilityLabel={`Delete ${item.word}`}
                      >
                        <Text style={styles.icon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.noWordsText, themeDark ? styles.textLight : styles.textDark]}>
                  No words found.
                </Text>
              }
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />

            {/* Undo delete toast */}
            {deletedWord && (
              <Animated.View style={[styles.undoToast, { opacity: fadeAnim }]}>
                <Text style={styles.undoText}>Deleted "{deletedWord.word}"</Text>
                <TouchableOpacity onPress={undoDelete}>
                  <Text style={styles.undoButton}>Undo</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Add/Edit Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalBackground}>
                  <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                  >
                    <Text style={styles.modalTitle}>{editingWord ? 'Edit Word' : 'Add New Word'}</Text>
                    <TextInput
                      placeholder="Word"
                      placeholderTextColor="#999"
                      style={styles.modalInput}
                      value={newWord}
                      onChangeText={setNewWord}
                      autoFocus
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        // focus next input (translation)
                      }}
                    />
                    <TextInput
                      placeholder="Translation"
                      placeholderTextColor="#999"
                      style={styles.modalInput}
                      value={newTranslation}
                      onChangeText={setNewTranslation}
                      returnKeyType="done"
                      onSubmitEditing={saveWord}
                    />
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={[styles.modalButton, styles.cancelButton]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={saveWord}
                        style={[styles.modalButton, styles.saveButton]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                          {editingWord ? 'Save' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f5f5f7',
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leftHeader: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  textLight: {
    color: '#f5f5f7',
  },
  textDark: {
    color: '#1c1c1e',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Search and Add
  searchAddContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
  inputDark: {
    backgroundColor: '#2c2c2e',
    color: '#f5f5f7',
  },
  inputLight: {
    color: '#1c1c1e',
  },
  addButton: {
    marginLeft: 12,
    backgroundColor: '#007aff',
    borderRadius: 20,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
  },
  addButtonText: {
    fontSize: 28,
    color: 'white',
    lineHeight: 28,
  },
  // Filter
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007aff',
  },
  filterButtonActive: {
    backgroundColor: '#007aff',
  },
  filterText: {
    color: '#007aff',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resetButton: {
    borderColor: '#d32f2f',
  },
  resetText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#d0d0d0',
    borderRadius: 3,
    marginLeft: 12,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#007aff',
    borderRadius: 3,
  },
  // Word Item
  wordItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  wordItemLearned: {
    backgroundColor: '#34c759', // iOS green
  },
  itemLight: {
    backgroundColor: 'white',
  },
  itemDark: {
    backgroundColor: '#2c2c2e',
  },
  wordText: {
    fontSize: 20,
    fontWeight: '600',
  },
  wordTextLearned: {
    color: 'white',
    textDecorationLine: 'line-through',
  },
  translationText: {
    fontSize: 14,
    color: '#555',
  },
  wordButtons: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
  },
  deleteIconButton: {
    marginLeft: 8,
  },
  icon: {
    fontSize: 20,
  },
  noWordsText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 18,
  },
  // Undo toast
  undoToast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  undoText: {
    color: 'white',
    fontSize: 16,
  },
  undoButton: {
    color: '#007aff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#007aff',
  },
  modalButtonText: {
    fontSize: 18,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});
