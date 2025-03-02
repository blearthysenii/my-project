import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, VolumeX, Volume2, Check, X, RotateCcw, ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';

// Sample lesson data
const lessonData = {
  1: {
    title: 'Basic Greetings',
    phrase: 'Buenos días',
    translation: 'Good morning',
    image: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    tips: [
      'The "B" in "Buenos" is softer than in English',
      'The "í" in "días" has a stress accent',
      'Try to roll the "r" sound slightly'
    ]
  },
  2: {
    title: 'Common Phrases',
    phrase: 'Mucho gusto',
    translation: 'Nice to meet you',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    tips: [
      'The "ch" in "Mucho" is pronounced like in "church"',
      'The "g" in "gusto" is pronounced like in "go"',
      'Keep the "u" in "gusto" short'
    ]
  },
  3: {
    title: 'Numbers 1-10',
    phrase: 'Uno, dos, tres',
    translation: 'One, two, three',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    tips: [
      'The "u" in "Uno" is pronounced like "oo" in "moon"',
      'The "o" in "dos" is pronounced like "o" in "go"',
      'The "e" in "tres" is pronounced like "e" in "bet"'
    ]
  }
};

// Sample skill data
const skillData = {
  1: { title: 'Reading Practice', phrase: 'El libro está en la mesa', translation: 'The book is on the table' },
  2: { title: 'Speaking Practice', phrase: '¿Cómo estás?', translation: 'How are you?' },
  3: { title: 'Listening Practice', phrase: 'Escucha con atención', translation: 'Listen carefully' },
  4: { title: 'Conversation Practice', phrase: '¿De dónde eres?', translation: 'Where are you from?' }
};

export default function PracticeScreen() {
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [lesson, setLesson] = useState(null);
  
  useEffect(() => {
    // Load lesson or skill data based on params
    if (params.lessonId) {
      setLesson(lessonData[params.lessonId]);
    } else if (params.skillId) {
      setLesson(skillData[params.skillId]);
    } else {
      // Default to first lesson if no params
      setLesson(lessonData[1]);
    }
  }, [params]);
  
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
      // Simulate checking pronunciation
      setTimeout(() => {
        setIsCorrect(Math.random() > 0.3); // 70% chance of being correct for demo
      }, 1000);
    } else {
      setIsRecording(true);
      setHasRecorded(false);
      setIsCorrect(null);
    }
  };
  
  const handleReset = () => {
    setHasRecorded(false);
    setIsCorrect(null);
  };
  
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setHasRecorded(false);
      setIsCorrect(null);
    } else {
      // Complete the lesson and navigate back
      router.back();
    }
  };
  
  const handlePlayAudio = () => {
    // In a real app, this would play the audio
    console.log('Playing audio');
  };
  
  const goBack = () => {
    router.back();
  };
  
  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Practice Speaking</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentStep}/5</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{lesson.title || 'Listen and Repeat'}</Text>
          <Text style={styles.instruction}>Listen to the phrase and repeat it with correct pronunciation</Text>
          
          <View style={styles.phraseContainer}>
            <Image 
              source={{ uri: lesson.image || 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }}
              style={styles.flagImage}
            />
            <View style={styles.phraseContent}>
              <Text style={styles.phrase}>{lesson.phrase}</Text>
              <Text style={styles.translation}>{lesson.translation}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.playButton} onPress={handlePlayAudio}>
            <Volume2 size={24} color="#5046E5" />
            <Text style={styles.playButtonText}>Listen</Text>
          </TouchableOpacity>
          
          {isCorrect === true && (
            <View style={styles.feedbackContainer}>
              <View style={[styles.feedbackIcon, styles.correctFeedback]}>
                <Check size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.feedbackText}>Great pronunciation!</Text>
            </View>
          )}
          
          {isCorrect === false && (
            <View style={styles.feedbackContainer}>
              <View style={[styles.feedbackIcon, styles.incorrectFeedback]}>
                <X size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.feedbackText}>Try again with clearer pronunciation</Text>
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            {!hasRecorded ? (
              <TouchableOpacity 
                style={[styles.recordButton, isRecording && styles.recordingButton]} 
                onPress={handleRecord}
              >
                <Mic size={24} color={isRecording ? "#FFFFFF" : "#5046E5"} />
                <Text style={[styles.recordButtonText, isRecording && styles.recordingButtonText]}>
                  {isRecording ? "Recording..." : "Tap to Record"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <RotateCcw size={20} color="#6B7280" />
                  <Text style={styles.resetButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.nextButton, !isCorrect && styles.nextButtonDisabled]} 
                  onPress={handleNext}
                  disabled={!isCorrect}
                >
                  <Text style={styles.nextButtonText}>
                    {currentStep < 5 ? 'Continue' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Pronunciation Tips</Text>
          {lesson.tips ? (
            lesson.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Focus on clear pronunciation</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#5046E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  phraseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  flagImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  phraseContent: {
    flex: 1,
  },
  phrase: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  translation: {
    fontSize: 16,
    color: '#6B7280',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5046E5',
    marginLeft: 8,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  correctFeedback: {
    backgroundColor: '#10B981',
  },
  incorrectFeedback: {
    backgroundColor: '#EF4444',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  actionsContainer: {
    marginTop: 10,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
  },
  recordingButton: {
    backgroundColor: '#5046E5',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5046E5',
    marginLeft: 8,
  },
  recordingButtonText: {
    color: '#FFFFFF',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#5046E5',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5046E5',
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#4B5563',
  },
});