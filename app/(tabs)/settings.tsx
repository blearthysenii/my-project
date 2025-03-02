import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Globe, Moon, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('15 minutes');
  const [language, setLanguage] = useState('English');
  
  const navigateToProfile = () => {
    // In a real app, this would navigate to a profile screen
    alert('Navigate to profile screen');
  };
  
  const navigateToHelpCenter = () => {
    // In a real app, this would navigate to a help center screen
    alert('Navigate to help center');
  };
  
  const navigateToFeedback = () => {
    // In a real app, this would navigate to a feedback screen
    alert('Navigate to feedback screen');
  };
  
  const handleLogout = () => {
    // In a real app, this would handle logout logic
    alert('Logging out...');
    // After logout, navigate to login screen
    router.replace('/');
  };
  
  const handleDailyGoalChange = () => {
    // In a real app, this would open a picker or modal to select daily goal
    const goals = ['5 minutes', '10 minutes', '15 minutes', '20 minutes', '30 minutes'];
    const currentIndex = goals.indexOf(dailyGoal);
    const nextIndex = (currentIndex + 1) % goals.length;
    setDailyGoal(goals[nextIndex]);
  };
  
  const handleLanguageChange = () => {
    // In a real app, this would open a picker or modal to select language
    const languages = ['English', 'Spanish', 'French', 'German'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };
  
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { id: 'profile', title: 'Profile', icon: User, action: 'navigate', onPress: navigateToProfile },
        { id: 'notifications', title: 'Notifications', icon: Bell, action: 'toggle', value: notifications, onToggle: () => setNotifications(!notifications) },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'language', title: 'App Language', icon: Globe, action: 'select', value: language, onPress: handleLanguageChange },
        { id: 'darkMode', title: 'Dark Mode', icon: Moon, action: 'toggle', value: darkMode, onToggle: () => setDarkMode(!darkMode) },
        { id: 'dailyGoal', title: 'Daily Goal', icon: Bell, action: 'select', value: dailyGoal, onPress: handleDailyGoalChange },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Help Center', icon: HelpCircle, action: 'navigate', onPress: navigateToHelpCenter },
        { id: 'feedback', title: 'Send Feedback', icon: HelpCircle, action: 'navigate', onPress: navigateToFeedback },
      ],
    },
  ];
  
  const renderSettingItem = (item) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.settingItem}
        onPress={() => {
          if (item.action === 'toggle') {
            item.onToggle();
          } else if (item.onPress) {
            item.onPress();
          }
        }}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIconContainer}>
            <item.icon size={20} color="#5046E5" />
          </View>
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>
        
        {item.action === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={item.value ? '#5046E5' : '#9CA3AF'}
          />
        )}
        
        {item.action === 'select' && (
          <View style={styles.settingItemRight}>
            <Text style={styles.settingValue}>{item.value}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        )}
        
        {item.action === 'navigate' && (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        
        {settingsSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>SpeakUp v1.0.0</Text>
          <TouchableOpacity>
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.privacyText}>Terms of Service</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#5046E5',
    marginBottom: 8,
  },
});