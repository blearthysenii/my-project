import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Play, Star } from 'lucide-react-native';
import { router } from 'expo-router';

const languages = [
  { id: 1, name: 'Spanish', flag: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', progress: 45 },
  { id: 2, name: 'French', flag: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', progress: 20 },
  { id: 3, name: 'German', flag: 'https://images.unsplash.com/photo-1527866512907-a35a62a0f6c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', progress: 10 },
  { id: 4, name: 'Italian', flag: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', progress: 5 },
  { id: 5, name: 'Japanese', flag: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', progress: 0 },
];

const dailyGoals = [
  { id: 1, day: 'Mon', completed: true },
  { id: 2, day: 'Tue', completed: true },
  { id: 3, day: 'Wed', completed: true },
  { id: 4, day: 'Thu', completed: false },
  { id: 5, day: 'Fri', completed: false },
  { id: 6, day: 'Sat', completed: false },
  { id: 7, day: 'Sun', completed: false },
];

export default function HomeScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  
  const navigateToLessons = () => {
    router.push('/lessons');
  };
  
  const navigateToLesson = (lessonId) => {
    router.push({
      pathname: '/practice',
      params: { lessonId }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, User!</Text>
            <Text style={styles.subtitle}>Ready to improve your language skills?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.streakContainer}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Your Streak</Text>
            <Text style={styles.streakCount}>3 days</Text>
          </View>
          <View style={styles.daysContainer}>
            {dailyGoals.map(day => (
              <View key={day.id} style={styles.dayItem}>
                <View style={[styles.dayCircle, day.completed && styles.dayCompleted]}>
                  {day.completed && <Star size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.dayText}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={navigateToLessons}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageCardsContainer}
        >
          {languages.map(language => (
            <TouchableOpacity 
              key={language.id} 
              style={[
                styles.languageCard, 
                selectedLanguage.id === language.id && styles.selectedLanguageCard
              ]}
              onPress={() => {
                setSelectedLanguage(language);
                router.push({
                  pathname: '/lessons',
                  params: { languageId: language.id }
                });
              }}
            >
              <Image source={{ uri: language.flag }} style={styles.languageFlag} />
              <Text style={styles.languageName}>{language.name}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${language.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{language.progress}%</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Lessons</Text>
        </View>
        
        <View style={styles.lessonsList}>
          <TouchableOpacity 
            style={styles.lessonCard}
            onPress={() => navigateToLesson(1)}
          >
            <View style={styles.lessonIconContainer}>
              <Play size={20} color="#5046E5" />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>Basic Greetings</Text>
              <Text style={styles.lessonSubtitle}>Learn how to say hello and introduce yourself</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.lessonCard}
            onPress={() => navigateToLesson(2)}
          >
            <View style={styles.lessonIconContainer}>
              <Play size={20} color="#5046E5" />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>Common Phrases</Text>
              <Text style={styles.lessonSubtitle}>Essential phrases for everyday conversations</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.lessonCard}
            onPress={() => navigateToLesson(3)}
          >
            <View style={styles.lessonIconContainer}>
              <Play size={20} color="#5046E5" />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>Numbers 1-10</Text>
              <Text style={styles.lessonSubtitle}>Learn to count in your target language</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  streakContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5046E5',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayCompleted: {
    backgroundColor: '#5046E5',
  },
  dayText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#5046E5',
    fontWeight: '600',
  },
  languageCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  selectedLanguageCard: {
    borderWidth: 2,
    borderColor: '#5046E5',
  },
  languageFlag: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#5046E5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  lessonsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});