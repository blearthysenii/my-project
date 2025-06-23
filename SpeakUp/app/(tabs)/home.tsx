"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { Audio } from "expo-av"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
const isTablet = screenWidth > 768

type VocabularyItem = {
  id: string
  word: string
  meaning: string
  category: "Greetings" | "Thanks" | "Farewell" | "Others"
  audioUrl?: string
  viewCount?: number
  playCount?: number
}

const INITIAL_VOCAB: VocabularyItem[] = [
  {
    id: "1",
    word: "Hello",
    meaning: "Përshëndetje",
    category: "Greetings",
    audioUrl: "https://ssl.gstatic.com/dictionary/static/sounds/oxford/hello--_gb_1.mp3",
  },
  {
    id: "2",
    word: "Thank you",
    meaning: "Faleminderit",
    category: "Thanks",
    audioUrl: "https://ssl.gstatic.com/dictionary/static/sounds/oxford/thank_you--_gb_1.mp3",
  },
  {
    id: "3",
    word: "Goodbye",
    meaning: "Mirupafshim",
    category: "Farewell",
    audioUrl: "https://ssl.gstatic.com/dictionary/static/sounds/oxford/goodbye--_gb_1.mp3",
  },
  {
    id: "4",
    word: "Please",
    meaning: "Të lutem",
    category: "Others",
    audioUrl: "https://ssl.gstatic.com/dictionary/static/sounds/oxford/please--_gb_1.mp3",
  },
  {
    id: "5",
    word: "Sorry",
    meaning: "Më fal",
    category: "Others",
    audioUrl: "https://ssl.gstatic.com/dictionary/static/sounds/oxford/sorry--_gb_1.mp3",
   },
  { id: "6", word: "Yes", meaning: "Po", category: "Others" },
  { id: "7", word: "No", meaning: "Jo", category: "Others" },
  { id: "8", word: "Good morning", meaning: "Mirëmëngjes", category: "Greetings" },
  { id: "9", word: "Good night", meaning: "Natën e mirë", category: "Farewell" },
  { id: "10", word: "You're welcome", meaning: "S'ka përse", category: "Thanks" },
  { id: "11", word: "How are you?", meaning: "Si je?", category: "Greetings" },
  { id: "12", word: "Excuse me", meaning: "Më falni", category: "Others" },
  { id: "13", word: "See you later", meaning: "Shihemi më vonë", category: "Farewell" },
  { id: "14", word: "Cheers", meaning: "Gëzuar", category: "Thanks" },
  { id: "15", word: "Congratulations", meaning: "Urime", category: "Others" },
  { id: "16", word: "I love you", meaning: "Të dua", category: "Others" },
  { id: "17", word: "What's your name?", meaning: "Si quhesh?", category: "Greetings" },
  { id: "18", word: "Nice to meet you", meaning: "Kënaqësi të të njoh", category: "Greetings" },
  { id: "19", word: "Good afternoon", meaning: "Mirëdita", category: "Greetings" },
  { id: "20", word: "Bless you", meaning: "Shëndet", category: "Thanks" },
]


const ITEMS_PER_PAGE = 8

export default function VocabularyApp() {
  // States
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [reverseTranslate, setReverseTranslate] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [audioVolume, setAudioVolume] = useState(0.7)
  const [fadeAnim] = useState(new Animated.Value(0))
  const [darkMode, setDarkMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<"All" | VocabularyItem["category"]>("All")
  const [sortBy, setSortBy] = useState<"word" | "meaning" | "category">("word")
  const [paginationPage, setPaginationPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [editWordData, setEditWordData] = useState<Partial<VocabularyItem>>({
    word: "",
    meaning: "",
    category: "Others",
    audioUrl: "",
  })

  const soundRef = useRef<Audio.Sound | null>(null)

  // Quiz states
  const [quizModalVisible, setQuizModalVisible] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<VocabularyItem[]>([])

  // Load data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Save data when states change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("@vocabulary", JSON.stringify(vocabulary))
    }
  }, [vocabulary, isLoading])

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("@favorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveSettings()
    }
  }, [soundOn, audioVolume, darkMode, isLoading])

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("@searchHistory", JSON.stringify(searchHistory))
    }
  }, [searchHistory, isLoading])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([loadVocabulary(), loadFavorites(), loadSettings(), loadSearchHistory()])
    } catch (error) {
      console.log("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadVocabulary = async () => {
    try {
      const vocabString = await AsyncStorage.getItem("@vocabulary")
      if (vocabString) {
        setVocabulary(JSON.parse(vocabString))
      } else {
        setVocabulary(INITIAL_VOCAB)
      }
    } catch (e) {
      console.log("Error loading vocabulary:", e)
      setVocabulary(INITIAL_VOCAB)
    }
  }

  const loadFavorites = async () => {
    try {
      const favString = await AsyncStorage.getItem("@favorites")
      if (favString) setFavorites(JSON.parse(favString))
    } catch (e) {
      console.log("Error loading favorites:", e)
    }
  }

  const loadSettings = async () => {
    try {
      const [sound, vol, dark] = await Promise.all([
        AsyncStorage.getItem("@soundOn"),
        AsyncStorage.getItem("@audioVolume"),
        AsyncStorage.getItem("@darkMode"),
      ])

      if (sound !== null) setSoundOn(sound === "true")
      if (vol !== null) setAudioVolume(Number.parseFloat(vol))
      if (dark !== null) setDarkMode(dark === "true")
    } catch (e) {
      console.log("Error loading settings:", e)
    }
  }

  const loadSearchHistory = async () => {
    try {
      const hist = await AsyncStorage.getItem("@searchHistory")
      if (hist) setSearchHistory(JSON.parse(hist))
    } catch (e) {
      console.log("Error loading search history:", e)
    }
  }

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("@soundOn", soundOn.toString()),
        AsyncStorage.setItem("@audioVolume", audioVolume.toString()),
        AsyncStorage.setItem("@darkMode", darkMode.toString()),
      ])
    } catch (e) {
      console.log("Error saving settings:", e)
    }
  }

  const toggleFavorite = (id: string) => {
    let newFavs: string[]
    if (favorites.includes(id)) {
      newFavs = favorites.filter((favId) => favId !== id)
      Alert.alert("✨ Removed from favorites")
    } else {
      newFavs = [...favorites, id]
      Alert.alert("⭐ Added to favorites")
    }
    setFavorites(newFavs)
  }

  // Filter and sort vocabulary
  const filteredVocab = vocabulary.filter(({ word, meaning, category }) => {
    if (selectedCategory !== "All" && category !== selectedCategory) return false
    const searchText = searchTerm.toLowerCase()
    if (reverseTranslate) {
      return meaning.toLowerCase().includes(searchText)
    }
    return word.toLowerCase().includes(searchText)
  })

  const sortedVocab = filteredVocab.sort((a, b) => {
    if (sortBy === "word") {
      return (reverseTranslate ? a.meaning : a.word).localeCompare(reverseTranslate ? b.meaning : b.word)
    } else if (sortBy === "meaning") {
      return (reverseTranslate ? a.word : a.meaning).localeCompare(reverseTranslate ? b.word : b.meaning)
    } else {
      return a.category.localeCompare(b.category)
    }
  })

  // Pagination
  const startIndex = (paginationPage - 1) * ITEMS_PER_PAGE
  const paginatedVocab = sortedVocab.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const totalPages = Math.ceil(sortedVocab.length / ITEMS_PER_PAGE)

  const goToNextPage = () => {
    if (paginationPage < totalPages) {
      setPaginationPage(paginationPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (paginationPage > 1) {
      setPaginationPage(paginationPage - 1)
    }
  }

  const openModal = (item: VocabularyItem) => {
    setSelectedWord(item)
    setModalVisible(true)
    fadeIn()
    incrementViewCount(item.id)
  }

  const fadeIn = () => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const playSound = async (audioUrl?: string) => {
    if (!audioUrl || !soundOn) return
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { volume: audioVolume })
      soundRef.current = sound
      await sound.playAsync()
      if (selectedWord) incrementPlayCount(selectedWord.id)
    } catch (e) {
      console.log("Error playing sound:", e)
      Alert.alert("Audio Error", "Could not play audio file")
    }
  }

  const incrementViewCount = (id: string) => {
    setVocabulary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, viewCount: (item.viewCount || 0) + 1 } : item)),
    )
  }

  const incrementPlayCount = (id: string) => {
    setVocabulary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, playCount: (item.playCount || 0) + 1 } : item)),
    )
  }

  const shareWord = async (item: VocabularyItem) => {
    try {
      await Share.share({
        message: `📚 ${item.word} - ${item.meaning}\n\nShared from SpeakUp! Language Learning App`,
      })
    } catch {
      Alert.alert("Error", "Could not share word")
    }
  }

  const shareFavorites = async () => {
    const favWords = vocabulary.filter((v) => favorites.includes(v.id))
    if (favWords.length === 0) {
      Alert.alert("No Favorites", "Add some words to favorites first!")
      return
    }
    try {
      const message = `📚 My Favorite Words:\n\n${favWords.map((w) => `${w.word} - ${w.meaning}`).join("\n")}\n\nShared from SpeakUp! Language Learning App`
      await Share.share({ message })
    } catch {
      Alert.alert("Error", "Could not share favorites")
    }
  }

  const resetVocabulary = () => {
    Alert.alert("Reset Vocabulary", "This will restore default vocabulary and clear all your data. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setVocabulary(INITIAL_VOCAB)
          setFavorites([])
          setSearchTerm("")
          setSearchHistory([])
          setPaginationPage(1)
          Alert.alert("✅ Vocabulary Reset", "Default vocabulary restored")
        },
      },
    ])
  }

  const addNewWord = () => {
    if (!editWordData.word?.trim() || !editWordData.meaning?.trim()) {
      Alert.alert("Missing Information", "Please fill in both word and meaning")
      return
    }

    if (vocabulary.some((v) => v.word.toLowerCase() === editWordData.word!.toLowerCase())) {
      Alert.alert("Duplicate Word", "This word already exists in your vocabulary")
      return
    }

    const newWord: VocabularyItem = {
      id: Date.now().toString(),
      word: editWordData.word!.trim(),
      meaning: editWordData.meaning!.trim(),
      category: editWordData.category as VocabularyItem["category"],
      audioUrl: editWordData.audioUrl?.trim() || undefined,
      viewCount: 0,
      playCount: 0,
    }

    setVocabulary([newWord, ...vocabulary])
    setEditWordData({ word: "", meaning: "", category: "Others", audioUrl: "" })
    setAddModalVisible(false)
    Alert.alert("✅ Word Added", "New word added successfully!")
  }

  const updateVocabulary = (
    id: string,
    word: string,
    meaning: string,
    category: VocabularyItem["category"],
    audioUrl?: string,
  ) => {
    setVocabulary((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, word: word.trim(), meaning: meaning.trim(), category, audioUrl: audioUrl?.trim() || undefined }
          : item,
      ),
    )
    Alert.alert("✅ Word Updated", "Word updated successfully!")
  }

  const deleteWord = (id: string) => {
    Alert.alert("Delete Word", "Are you sure you want to delete this word?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setVocabulary((prev) => prev.filter((item) => item.id !== id))
          setFavorites((prev) => prev.filter((fid) => fid !== id))
          Alert.alert("✅ Word Deleted", "Word removed from vocabulary")
        },
      },
    ])
  }

  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return
    setSearchHistory((prev) => {
      const newHistory = [term, ...prev.filter((t) => t !== term)]
      return newHistory.slice(0, 10)
    })
  }

  const onSearchChange = (text: string) => {
    setSearchTerm(text)
    if (text.trim()) {
      addToSearchHistory(text)
    }
    setPaginationPage(1)
  }

  // Quiz logic
  const startQuiz = () => {
    const availableWords = sortedVocab.length >= 3 ? sortedVocab : INITIAL_VOCAB
    const shuffled = [...availableWords].sort(() => 0.5 - Math.random())
    setQuizQuestions(shuffled.slice(0, Math.min(5, shuffled.length)))
    setQuizStep(0)
    setQuizScore(0)
    setSelectedAnswer(null)
    setQuizModalVisible(true)
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answer)
    const currentQuestion = quizQuestions[quizStep]
    const correctAnswer = reverseTranslate ? currentQuestion.meaning : currentQuestion.word

    if (answer === correctAnswer) {
      setQuizScore(quizScore + 1)
    }

    setTimeout(() => {
      if (quizStep + 1 < quizQuestions.length) {
        setQuizStep(quizStep + 1)
        setSelectedAnswer(null)
      } else {
        const finalScore = quizScore + (answer === correctAnswer ? 1 : 0)
        Alert.alert(
          "🎉 Quiz Complete!",
          `Your score: ${finalScore} / ${quizQuestions.length}\n${finalScore === quizQuestions.length ? "Perfect! 🌟" : finalScore >= quizQuestions.length * 0.7 ? "Great job! 👏" : "Keep practicing! 💪"}`,
        )
        setQuizStep(0)
        setQuizScore(0)
        setSelectedAnswer(null)
        setQuizModalVisible(false)
      }
    }, 1500)
  }

  const toggleTheme = () => setDarkMode(!darkMode)

  const currentTheme = darkMode ? darkStyles : lightStyles

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, currentTheme.container]}>
        <Text style={[styles.loadingText, currentTheme.text]}>Loading SpeakUp! 🌍</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, currentTheme.container]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#1a1a1a" : "#ffffff"}
      />

      {/* Header */}
      <LinearGradient colors={darkMode ? ["#2d2d2d", "#1a1a1a"] : ["#ffffff", "#f8f9fa"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, currentTheme.text]}>SpeakUp!</Text>
            <Text style={[styles.subtitle, currentTheme.secondaryText]}>Language Learning</Text>
          </View>
          <View style={styles.headerControls}>
            <Text style={[styles.themeLabel, currentTheme.secondaryText]}>{darkMode ? "🌙" : "☀️"}</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#e0e0e0", true: "#4a90e2" }}
              thumbColor={darkMode ? "#ffffff" : "#f4f3f4"}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Switch */}
        <View style={styles.languageSwitchContainer}>
          <TouchableOpacity
            onPress={() => setReverseTranslate(false)}
            style={[styles.langButton, !reverseTranslate && styles.langButtonActive, currentTheme.button]}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.langButtonText, !reverseTranslate && styles.langButtonTextActive, currentTheme.buttonText]}
            >
              🇺🇸 EN → AL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setReverseTranslate(true)}
            style={[styles.langButton, reverseTranslate && styles.langButtonActive, currentTheme.button]}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.langButtonText, reverseTranslate && styles.langButtonTextActive, currentTheme.buttonText]}
            >
              🇦🇱 AL → EN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, currentTheme.inputContainer]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder={`Search ${reverseTranslate ? "Albanian" : "English"} words...`}
            value={searchTerm}
            onChangeText={onSearchChange}
            style={[styles.searchInput, currentTheme.text]}
            placeholderTextColor={darkMode ? "#888" : "#666"}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.clearButton} activeOpacity={0.7}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollContainer}
          contentContainerStyle={styles.categoryContainer}
        >
          {["All", "Greetings", "Thanks", "Farewell", "Others"].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setSelectedCategory(cat as any)
                setPaginationPage(1)
              }}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
                currentTheme.categoryButton,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                  currentTheme.categoryText,
                ]}
              >
                {cat === "All"
                  ? "📚 All"
                  : cat === "Greetings"
                    ? "👋 Greetings"
                    : cat === "Thanks"
                      ? "🙏 Thanks"
                      : cat === "Farewell"
                        ? "👋 Farewell"
                        : "💬 Others"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Controls */}
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, currentTheme.text]}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {[
              { key: "word", label: reverseTranslate ? "Albanian" : "English" },
              { key: "meaning", label: reverseTranslate ? "English" : "Albanian" },
              { key: "category", label: "Category" },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSortBy(key as any)}
                style={[styles.sortButton, sortBy === key && styles.sortButtonActive, currentTheme.sortButton]}
                activeOpacity={0.8}
              >
                <Text style={[styles.sortText, sortBy === key && styles.sortTextActive, currentTheme.sortText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, currentTheme.statsContainer]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, currentTheme.text]}>{vocabulary.length}</Text>
            <Text style={[styles.statLabel, currentTheme.secondaryText]}>Total Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, currentTheme.text]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, currentTheme.secondaryText]}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, currentTheme.text]}>{sortedVocab.length}</Text>
            <Text style={[styles.statLabel, currentTheme.secondaryText]}>Filtered</Text>
          </View>
        </View>

        {/* Vocabulary List */}
        <View style={styles.listContainer}>
          {paginatedVocab.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyText, currentTheme.text]}>No words found</Text>
              <Text style={[styles.emptySubtext, currentTheme.secondaryText]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={paginatedVocab}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const isFavorite = favorites.includes(item.id)
                return (
                  <TouchableOpacity
                    style={[
                      styles.vocabItem,
                      isFavorite && styles.favoriteItem,
                      currentTheme.vocabItem,
                      {
                        marginBottom: index === paginatedVocab.length - 1 ? 0 : 12,
                        transform: [{ scale: 1 }],
                      },
                    ]}
                    onPress={() => openModal(item)}
                    onLongPress={() => toggleFavorite(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.vocabContent}>
                      <View style={styles.vocabTextContainer}>
                        <Text style={[styles.vocabWord, currentTheme.text]}>
                          {reverseTranslate ? item.meaning : item.word}
                        </Text>
                        <Text style={[styles.vocabMeaning, currentTheme.secondaryText]}>
                          {reverseTranslate ? item.word : item.meaning}
                        </Text>
                        <View style={styles.vocabMeta}>
                          <Text style={[styles.categoryTag, currentTheme.categoryTag]}>{item.category}</Text>
                          {(item.viewCount || 0) > 0 && (
                            <Text style={[styles.viewCount, currentTheme.secondaryText]}>👁 {item.viewCount}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.vocabActions}>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(item.id)}
                          style={styles.favoriteButton}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.favoriteIcon}>{isFavorite ? "⭐" : "☆"}</Text>
                        </TouchableOpacity>
                        {item.audioUrl && (
                          <TouchableOpacity
                            onPress={() => playSound(item.audioUrl)}
                            style={[styles.audioButton, currentTheme.audioButton]}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.audioIcon}>🔊</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={[styles.paginationContainer, currentTheme.paginationContainer]}>
            <TouchableOpacity
              onPress={goToPrevPage}
              disabled={paginationPage === 1}
              style={[
                styles.paginationButton,
                paginationPage === 1 && styles.paginationButtonDisabled,
                currentTheme.paginationButton,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  paginationPage === 1 && styles.paginationButtonTextDisabled,
                  currentTheme.paginationButtonText,
                ]}
              >
                ← Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.paginationInfo}>
              <Text style={[styles.paginationText, currentTheme.text]}>
                {paginationPage} of {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              onPress={goToNextPage}
              disabled={paginationPage >= totalPages}
              style={[
                styles.paginationButton,
                paginationPage >= totalPages && styles.paginationButtonDisabled,
                currentTheme.paginationButton,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  paginationPage >= totalPages && styles.paginationButtonTextDisabled,
                  currentTheme.paginationButtonText,
                ]}
              >
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>➕</Text>
              <Text style={styles.actionButtonText}>Add Word</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.quizButton]} onPress={startQuiz} activeOpacity={0.8}>
              <Text style={styles.actionButtonIcon}>🧠</Text>
              <Text style={styles.actionButtonText}>Quiz</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={shareFavorites}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>📤</Text>
              <Text style={styles.actionButtonText}>Share Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetVocabulary}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>🔄</Text>
              <Text style={styles.actionButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio Controls */}
        <View style={[styles.audioControlsContainer, currentTheme.audioControlsContainer]}>
          <View style={styles.audioControlRow}>
            <Text style={[styles.audioControlLabel, currentTheme.text]}>🔊 Audio</Text>
            <Switch
              value={soundOn}
              onValueChange={setSoundOn}
              trackColor={{ false: "#e0e0e0", true: "#4a90e2" }}
              thumbColor={soundOn ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.volumeContainer}>
            <Text style={[styles.volumeLabel, currentTheme.secondaryText]}>
              Volume: {Math.round(audioVolume * 100)}%
            </Text>
            <View style={styles.volumeControls}>
              <TouchableOpacity
                onPress={() => setAudioVolume(Math.max(0, audioVolume - 0.1))}
                style={[styles.volumeButton, currentTheme.volumeButton]}
                activeOpacity={0.8}
              >
                <Text style={[styles.volumeButtonText, currentTheme.volumeButtonText]}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAudioVolume(Math.min(1, audioVolume + 0.1))}
                style={[styles.volumeButton, currentTheme.volumeButton]}
                activeOpacity={0.8}
              >
                <Text style={[styles.volumeButtonText, currentTheme.volumeButtonText]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Word Detail Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContent, currentTheme.modalContent, { opacity: fadeAnim }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.modalWord, currentTheme.text]}>{selectedWord?.word}</Text>
                <Text style={[styles.modalMeaning, currentTheme.secondaryText]}>{selectedWord?.meaning}</Text>

                <View style={[styles.modalStats, currentTheme.modalStats]}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatNumber, currentTheme.text]}>{selectedWord?.viewCount || 0}</Text>
                    <Text style={[styles.modalStatLabel, currentTheme.secondaryText]}>Views</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatNumber, currentTheme.text]}>{selectedWord?.playCount || 0}</Text>
                    <Text style={[styles.modalStatLabel, currentTheme.secondaryText]}>Plays</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatNumber, currentTheme.text]}>{selectedWord?.category}</Text>
                    <Text style={[styles.modalStatLabel, currentTheme.secondaryText]}>Category</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  {selectedWord?.audioUrl && (
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.playButton]}
                      onPress={() => playSound(selectedWord?.audioUrl)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalActionButtonText}>🔊 Play Audio</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.favoriteModalButton]}
                    onPress={() => selectedWord && toggleFavorite(selectedWord.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalActionButtonText}>
                      {selectedWord && favorites.includes(selectedWord.id) ? "⭐ Remove Favorite" : "☆ Add Favorite"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.shareModalButton]}
                    onPress={() => selectedWord && shareWord(selectedWord)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalActionButtonText}>📤 Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.editButton]}
                    onPress={() => {
                      if (selectedWord) {
                        setEditWordData({
                          id: selectedWord.id,
                          word: selectedWord.word,
                          meaning: selectedWord.meaning,
                          category: selectedWord.category,
                          audioUrl: selectedWord.audioUrl || "",
                        })
                        setModalVisible(false)
                        setEditModalVisible(true)
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalActionButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.deleteButton]}
                    onPress={() => {
                      if (selectedWord) {
                        setModalVisible(false)
                        deleteWord(selectedWord.id)
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalActionButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Add Word Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, currentTheme.modalContent]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, currentTheme.text]}>Add New Word</Text>
                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>English Word *</Text>
                  <TextInput
                    placeholder="Enter English word"
                    value={editWordData.word}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, word: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Albanian Translation *</Text>
                  <TextInput
                    placeholder="Enter Albanian translation"
                    value={editWordData.meaning}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, meaning: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Category</Text>
                  <View style={styles.categorySelector}>
                    {["Greetings", "Thanks", "Farewell", "Others"].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() =>
                          setEditWordData((prev) => ({ ...prev, category: cat as VocabularyItem["category"] }))
                        }
                        style={[
                          styles.categorySelectorButton,
                          editWordData.category === cat && styles.categorySelectorButtonActive,
                          currentTheme.categorySelectorButton,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categorySelectorText,
                            editWordData.category === cat && styles.categorySelectorTextActive,
                            currentTheme.categorySelectorText,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Audio URL (Optional)</Text>
                  <TextInput
                    placeholder="https://example.com/audio.mp3"
                    value={editWordData.audioUrl}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, audioUrl: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={() => {
                      setAddModalVisible(false)
                      setEditWordData({ word: "", meaning: "", category: "Others", audioUrl: "" })
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.formButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.formButton, styles.saveButton]}
                    onPress={addNewWord}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.formButtonText}>Add Word</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Word Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, currentTheme.modalContent]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, currentTheme.text]}>Edit Word</Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>English Word *</Text>
                  <TextInput
                    placeholder="Enter English word"
                    value={editWordData.word}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, word: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Albanian Translation *</Text>
                  <TextInput
                    placeholder="Enter Albanian translation"
                    value={editWordData.meaning}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, meaning: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Category</Text>
                  <View style={styles.categorySelector}>
                    {["Greetings", "Thanks", "Farewell", "Others"].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() =>
                          setEditWordData((prev) => ({ ...prev, category: cat as VocabularyItem["category"] }))
                        }
                        style={[
                          styles.categorySelectorButton,
                          editWordData.category === cat && styles.categorySelectorButtonActive,
                          currentTheme.categorySelectorButton,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categorySelectorText,
                            editWordData.category === cat && styles.categorySelectorTextActive,
                            currentTheme.categorySelectorText,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, currentTheme.text]}>Audio URL (Optional)</Text>
                  <TextInput
                    placeholder="https://example.com/audio.mp3"
                    value={editWordData.audioUrl}
                    onChangeText={(text) => setEditWordData((prev) => ({ ...prev, audioUrl: text }))}
                    style={[styles.textInput, currentTheme.textInput]}
                    placeholderTextColor={darkMode ? "#888" : "#666"}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.formButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.formButton, styles.saveButton]}
                    onPress={() => {
                      if (
                        selectedWord &&
                        editWordData.word?.trim() &&
                        editWordData.meaning?.trim() &&
                        editWordData.category
                      ) {
                        updateVocabulary(
                          selectedWord.id,
                          editWordData.word,
                          editWordData.meaning,
                          editWordData.category,
                          editWordData.audioUrl,
                        )
                        setEditModalVisible(false)
                        setSelectedWord(null)
                      } else {
                        Alert.alert("Missing Information", "Please fill in all required fields")
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.formButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quiz Modal */}
      <Modal visible={quizModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, currentTheme.modalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, currentTheme.text]}>
                Quiz {quizStep + 1} / {quizQuestions.length}
              </Text>
              <TouchableOpacity
                onPress={() => setQuizModalVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quizContainer}>
              <View style={[styles.quizProgress, currentTheme.quizProgress]}>
                <View
                  style={[styles.quizProgressBar, { width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }]}
                />
              </View>

              <Text style={[styles.quizScore, currentTheme.text]}>
                Score: {quizScore} / {quizQuestions.length}
              </Text>

              {quizQuestions.length > 0 && (
                <>
                  <Text style={[styles.quizQuestion, currentTheme.text]}>
                    What is the {reverseTranslate ? "English" : "Albanian"} translation of:
                  </Text>

                  <Text style={[styles.quizWord, currentTheme.text]}>
                    "{reverseTranslate ? quizQuestions[quizStep]?.word : quizQuestions[quizStep]?.meaning}"
                  </Text>

                  <View style={styles.quizOptions}>
                    {/* Correct answer */}
                    <TouchableOpacity
                      onPress={() =>
                        handleAnswer(
                          reverseTranslate ? quizQuestions[quizStep]?.meaning : quizQuestions[quizStep]?.word,
                        )
                      }
                      disabled={selectedAnswer !== null}
                      style={[
                        styles.quizOption,
                        selectedAnswer ===
                          (reverseTranslate ? quizQuestions[quizStep]?.meaning : quizQuestions[quizStep]?.word) &&
                          styles.quizOptionSelected,
                        selectedAnswer !== null &&
                          selectedAnswer !==
                            (reverseTranslate ? quizQuestions[quizStep]?.meaning : quizQuestions[quizStep]?.word) &&
                          styles.quizOptionDisabled,
                        currentTheme.quizOption,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.quizOptionText, currentTheme.text]}>
                        {reverseTranslate ? quizQuestions[quizStep]?.meaning : quizQuestions[quizStep]?.word}
                      </Text>
                    </TouchableOpacity>

                    {/* Wrong answer (random from other questions) */}
                    {quizQuestions.length > 1 && (
                      <TouchableOpacity
                        onPress={() => {
                          const wrongAnswer = quizQuestions.find((_, i) => i !== quizStep)
                          if (wrongAnswer) {
                            handleAnswer(reverseTranslate ? wrongAnswer.meaning : wrongAnswer.word)
                          }
                        }}
                        disabled={selectedAnswer !== null}
                        style={[
                          styles.quizOption,
                          selectedAnswer ===
                            (quizQuestions.find((_, i) => i !== quizStep)
                              ? reverseTranslate
                                ? quizQuestions.find((_, i) => i !== quizStep)?.meaning
                                : quizQuestions.find((_, i) => i !== quizStep)?.word
                              : "") && styles.quizOptionSelected,
                          selectedAnswer !== null &&
                            selectedAnswer !==
                              (quizQuestions.find((_, i) => i !== quizStep)
                                ? reverseTranslate
                                  ? quizQuestions.find((_, i) => i !== quizStep)?.meaning
                                  : quizQuestions.find((_, i) => i !== quizStep)?.word
                                : "") &&
                            styles.quizOptionDisabled,
                          currentTheme.quizOption,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.quizOptionText, currentTheme.text]}>
                          {quizQuestions.find((_, i) => i !== quizStep)
                            ? reverseTranslate
                              ? quizQuestions.find((_, i) => i !== quizStep)?.meaning
                              : quizQuestions.find((_, i) => i !== quizStep)?.word
                            : ""}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "500",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeLabel: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  languageSwitchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  langButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    minWidth: isTablet ? 160 : 140,
  },
  langButtonActive: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  langButtonText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    textAlign: "center",
  },
  langButtonTextActive: {
    color: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: "#ff6b6b",
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryScrollContainer: {
    marginBottom: 20,
  },
  categoryContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#7b68ee",
    borderColor: "#7b68ee",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  sortContainer: {
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sortButtonActive: {
    backgroundColor: "#f57c00",
    borderColor: "#f57c00",
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  sortTextActive: {
    color: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  listContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  vocabItem: {
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  favoriteItem: {
    backgroundColor: "#fff8e1",
    borderColor: "#ffc107",
  },
  vocabContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vocabTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vocabMeaning: {
    fontSize: 16,
    marginBottom: 8,
  },
  vocabMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  viewCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  vocabActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#4a90e2",
  },
  audioIcon: {
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#4a90e2",
    minWidth: 80,
  },
  paginationButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  paginationButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  paginationButtonTextDisabled: {
    color: "#888888",
  },
  paginationInfo: {
    alignItems: "center",
  },
  paginationText: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
  },
  addButton: {
    backgroundColor: "#4caf50",
  },
  quizButton: {
    backgroundColor: "#9c27b0",
  },
  shareButton: {
    backgroundColor: "#00bcd4",
  },
  resetButton: {
    backgroundColor: "#f44336",
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  audioControlsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  audioControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  audioControlLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  volumeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  volumeControls: {
    flexDirection: "row",
    gap: 8,
  },
  volumeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },
  volumeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: isTablet ? 500 : screenWidth - 40,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666666",
  },
  modalBody: {
    padding: 20,
  },
  modalWord: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMeaning: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalActions: {
    gap: 12,
  },
  modalActionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "#4a90e2",
  },
  favoriteModalButton: {
    backgroundColor: "#ffc107",
  },
  shareModalButton: {
    backgroundColor: "#00bcd4",
  },
  editButton: {
    backgroundColor: "#ff9800",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  modalActionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categorySelectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categorySelectorButtonActive: {
    backgroundColor: "#7b68ee",
    borderColor: "#7b68ee",
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categorySelectorTextActive: {
    color: "#ffffff",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
  },
  saveButton: {
    backgroundColor: "#4caf50",
  },
  formButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  quizContainer: {
    padding: 20,
  },
  quizProgress: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  quizProgressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 3,
  },
  quizScore: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  quizWord: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  quizOptionSelected: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  quizOptionDisabled: {
    opacity: 0.5,
  },
  quizOptionText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
  text: {
    color: "#333333",
  },
  secondaryText: {
    color: "#666666",
  },
  button: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  buttonText: {
    color: "#333333",
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  categoryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  categoryText: {
    color: "#333333",
  },
  sortButton: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  sortText: {
    color: "#333333",
  },
  statsContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  vocabItem: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  categoryTag: {
    backgroundColor: "#f0f0f0",
    color: "#666666",
  },
  audioButton: {
    backgroundColor: "#4a90e2",
  },
  paginationContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  paginationButton: {
    backgroundColor: "#4a90e2",
  },
  paginationButtonText: {
    color: "#ffffff",
  },
  audioControlsContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  volumeButton: {
    backgroundColor: "#4a90e2",
  },
  volumeButtonText: {
    color: "#ffffff",
  },
  modalContent: {
    backgroundColor: "#ffffff",
  },
  modalStats: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    color: "#333333",
  },
  categorySelectorButton: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
  categorySelectorText: {
    color: "#333333",
  },
  quizOption: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
  },
})

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  text: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#cccccc",
  },
  button: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  buttonText: {
    color: "#ffffff",
  },
  inputContainer: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  categoryButton: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  categoryText: {
    color: "#ffffff",
  },
  sortButton: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  sortText: {
    color: "#ffffff",
  },
  statsContainer: {
    backgroundColor: "#1e1e1e",
    borderColor: "#444444",
  },
  vocabItem: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  categoryTag: {
    backgroundColor: "#444444",
    color: "#cccccc",
  },
  audioButton: {
    backgroundColor: "#4a90e2",
  },
  paginationContainer: {
    backgroundColor: "#1e1e1e",
    borderColor: "#444444",
  },
  paginationButton: {
    backgroundColor: "#4a90e2",
  },
  paginationButtonText: {
    color: "#ffffff",
  },
  audioControlsContainer: {
    backgroundColor: "#1e1e1e",
    borderColor: "#444444",
  },
  volumeButton: {
    backgroundColor: "#4a90e2",
  },
  volumeButtonText: {
    color: "#ffffff",
  },
  modalContent: {
    backgroundColor: "#2d2d2d",
  },
  modalStats: {
    backgroundColor: "#1e1e1e",
    borderColor: "#444444",
  },
  textInput: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
    color: "#ffffff",
  },
  categorySelectorButton: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
  categorySelectorText: {
    color: "#ffffff",
  },
  quizOption: {
    backgroundColor: "#2d2d2d",
    borderColor: "#444444",
  },
})
//