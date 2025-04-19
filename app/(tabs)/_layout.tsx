import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '../../components/HapticTab';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { theme, mode } = useTheme();

  // Get tab color based on current mode
  const tabColor = mode === 'growth' ? theme.primary : theme.accent;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
            backgroundColor: theme.background,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome size={size || 24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => <FontAwesome size={size || 24} name="list-ul" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <FontAwesome size={size || 24} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <FontAwesome size={size || 24} name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
