// src/screens/habits.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import HabitCard from '../components/HabitCard';
import { useTheme } from '../context/ThemeContext';
import DataStore from '../utils/DataStore';

// Helper function to safely trigger haptic feedback
const triggerHaptic = (type) => {
  // Skip haptics on web platform
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    if (type === 'impact') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    console.log('Haptic feedback error:', error);
  }
};

export default function HabitsScreen() {
  const router = useRouter();
  const { theme, mode } = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [habitCompletions, setHabitCompletions] = useState({});
  const [habitPreferences, setHabitPreferences] = useState({});
  
  // Load habits based on current mode
  const loadHabits = () => {
    const modeHabits = DataStore.getHabitsByMode(mode);
    
    // Sort habits by priority (high → medium → low)
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sortedHabits = [...modeHabits].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    // Load completions for each habit
    const completions = {};
    sortedHabits.forEach(habit => {
      completions[habit.id] = DataStore.getCompletionsForHabit(habit.id);
    });
    
    // Load preferences for each habit
    const preferences = {};
    sortedHabits.forEach(habit => {
      preferences[habit.id] = DataStore.getHabitPreferences(habit.id);
    });
    
    setHabits(sortedHabits);
    setHabitCompletions(completions);
    setHabitPreferences(preferences);
    setLoading(false);
    setRefreshing(false);
  };
  
  // Initial load
  useEffect(() => {
    loadHabits();
  }, [mode]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadHabits();
  };
  
  // Complete a habit
  const completeHabit = (habitId) => {
    // Complete the habit
    DataStore.completeHabit(habitId, '');
    
    // Refresh the habit list
    loadHabits();
    
    // Provide haptic feedback (safely)
    triggerHaptic('success');
  };
  
  // Check if habit was completed today
  const isCompletedToday = (habitId) => {
    const todayCompletions = DataStore.getTodayCompletions();
    return todayCompletions.some(c => c.habitId === habitId);
  };
  
  // Calculate streak for a habit
  const calculateStreak = (completions) => {
    if (!completions || completions.length === 0) return 0;
    
    // Sort completions by date
    const sortedCompletions = [...completions].sort(
      (a, b) => b.completedAt - a.completedAt
    );
    
    // Start from the most recent completion
    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].completedAt);
    
    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i].completedAt);
      
      // Check if this completion is the previous day
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else if (dayDiff > 1) {
        // Break in the streak
        break;
      }
    }
    
    return streak;
  };
  
  // Go to add habit screen - Fixed haptic feedback type
  const goToAddHabit = () => {
    // Trigger haptic feedback safely
    triggerHaptic('impact');
    
    // Navigate to add habit screen
    router.push('/add-habit');
  };
  
  // Delete a habit
  const deleteHabit = (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            DataStore.deleteHabit(habitId);
            loadHabits();
            triggerHaptic('warning');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  // Go to habit focus screen
  const goToHabitFocus = (habitId) => {
    router.push(`/habit-focus?habitId=${habitId}`);
  };
  
  // Filter habits by frequency
  const filterHabits = (frequency) => {
    return habits.filter(habit => habit.frequency === frequency);
  };

  // Render habit item
  const renderHabit = ({ item }) => {
    const completed = isCompletedToday(item.id);
    const habitCompletionsList = habitCompletions[item.id] || [];
    const streak = calculateStreak(habitCompletionsList);
    const preferences = habitPreferences[item.id];
    
    return (
      <HabitCard
        habit={item}
        completed={completed}
        streak={streak}
        preferences={preferences}
        onToggleComplete={() => completeHabit(item.id)}
        onPress={() => goToHabitFocus(item.id)}
      />
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {mode === 'growth' ? 'Growth Habits' : 'Action Habits'}
        </Text>
        
        {/* Removed duplicate add button from header */}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <>
          {/* Daily Habits Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
          </View>
          
          <FlatList
            data={filterHabits('daily')}
            renderItem={renderHabit}
            keyExtractor={item => 'daily_' + item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                  No daily habits yet
                </Text>
              </View>
            )}
          />
          
          {/* Weekly Habits Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Weekly Habits
            </Text>
          </View>
          
          <FlatList
            data={filterHabits('weekly')}
            renderItem={renderHabit}
            keyExtractor={item => 'weekly_' + item.id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={() => (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                  No weekly habits yet
                </Text>
              </View>
            )}
            ListFooterComponent={habits.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={mode === 'growth' ? "leaf-outline" : "flash-outline"} 
                  size={60} 
                  color={theme.text + '50'} 
                />
                <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                  No {mode} habits yet
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                  onPress={goToAddHabit}
                >
                  <Text style={styles.emptyButtonText}>Create Your First Habit</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
      
      {/* Keep only this single floating action button */}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: theme.primary }]}
        onPress={goToAddHabit}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptySection: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});