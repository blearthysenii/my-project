import { Tabs } from 'expo-router';
import { Chrome as Home, BookOpen, Mic, Award, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5046E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => <Mic size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}