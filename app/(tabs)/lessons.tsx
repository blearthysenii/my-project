import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, BookOpen, MessageCircle, Headphones, Mic } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

const categories = [
  { id: 1, name: 'All', active: true },
  { id: 2, name: 'Beginner', active: false },
  { id: 3, name: 'Intermediate', active: false },
  { id: 4, name: 'Advanced', active: false },
];

const lessons = [
  {
    id: 1,
    title: 'Basics of Spanish',
    description: 'Learn fundamental Spanish vocabulary and phrases',
    image: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    level: 'Beginner',
    duration: '20 min',
    modules: 5,
  },
  {
    id: 2,
    title: 'Everyday Conversations',
    description: 'Practice common dialogues for daily situations',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    level: 'Beginner',
    duration: '25 min',
    modules: 6,
  },
  {
    id: 3,
    title: 'Travel Phrases',
    description: 'Essential vocabulary for traveling abroad',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    level: 'Intermediate',
    duration: '30 min',
    modules: 8,
  },
  {
    id: 4,
    title: 'Business Spanish',
    description: 'Professional vocabulary for workplace communication',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    level: 'Advanced',
    duration: '45 min',
    modules: 10,
  },
];

const skillCategories = [
  { id: 1, name: 'Reading', icon: BookOpen, color: '#EF4444' },
  { id: 2, name: 'Speaking', icon: Mic, color: '#3B82F6' },
  { id: 3, name: 'Listening', icon: Headphones, color: '#10B981' },
  { id: 4, name: 'Conversation', icon: MessageCircle, color: '#8B5CF6' },
];

export default function LessonsScreen() {
  const params = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [filteredLessons, setFilteredLessons] = useState(lessons);
  
  // Handle language selection from home screen
  useEffect(() => {
    if (params.languageId) {
      // In a real app, you would filter lessons based on the selected language
      console.log(`Selected language ID: ${params.languageId}`);
    }
  }, [params.languageId]);
  
  // Filter lessons based on category
  useEffect(() => {
    if (activeCategory === 1) { // All
      setFilteredLessons(lessons);
    } else {
      const categoryName = categories.find(cat => cat.id === activeCategory)?.name;
      setFilteredLessons(lessons.filter(lesson => lesson.level === categoryName));
    }
  }, [activeCategory]);
  
  const navigateToLesson = (lessonId) => {
    router.push({
      pathname: '/practice',
      params: { lessonId }
    });
  };
  
  const navigateToSkill = (skillId) => {
    router.push({
      pathname: '/practice',
      params: { skillId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Lessons</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Courses</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredLessons.map(lesson => (
          <TouchableOpacity 
            key={lesson.id} 
            style={styles.lessonCard}
            onPress={() => navigateToLesson(lesson.id)}
          >
            <Image source={{ uri: lesson.image }} style={styles.lessonImage} />
            <View style={styles.lessonContent}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <ChevronRight size={20} color="#6B7280" />
              </View>
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
              <View style={styles.lessonMeta}>
                <View style={styles.lessonMetaItem}>
                  <Text style={styles.lessonMetaLabel}>Level:</Text>
                  <Text style={styles.lessonMetaValue}>{lesson.level}</Text>
                </View>
                <View style={styles.lessonMetaItem}>
                  <Text style={styles.lessonMetaLabel}>Duration:</Text>
                  <Text style={styles.lessonMetaValue}>{lesson.duration}</Text>
                </View>
                <View style={styles.lessonMetaItem}>
                  <Text style={styles.lessonMetaLabel}>Modules:</Text>
                  <Text style={styles.lessonMetaValue}>{lesson.modules}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
        </View>

        <View style={styles.skillsGrid}>
          {skillCategories.map(skill => (
            <TouchableOpacity 
              key={skill.id} 
              style={styles.skillCard}
              onPress={() => navigateToSkill(skill.id)}
            >
              <View style={[styles.skillIconContainer, { backgroundColor: `${skill.color}20` }]}>
                <skill.icon size={24} color={skill.color} />
              </View>
              <Text style={styles.skillName}>{skill.name}</Text>
            </TouchableOpacity>
          ))}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  activeCategoryButton: {
    backgroundColor: '#5046E5',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
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
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  lessonImage: {
    width: '100%',
    height: 150,
  },
  lessonContent: {
    padding: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonMetaItem: {
    flexDirection: 'row',
  },
  lessonMetaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  lessonMetaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  skillCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  skillIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});