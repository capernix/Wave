import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HabitCard from '../../src/components/HabitCard';
import ThemedText from '../../src/components/ThemedText';
import ThemedView from '../../src/components/ThemedView';
import { useTheme } from '../../src/context/ThemeContext';

// Mock habit type definition
interface Habit {
  id: number;
  title: string;
  description?: string;
  category?: string;
  frequency?: string;
  mode: 'growth' | 'action';
  created_at: number;
}

// Mock data for habits
const MOCK_HABITS: Habit[] = [
  {
    id: 1,
    title: 'Morning Meditation',
    description: 'Start your day with 5-10 minutes of mindful meditation',
    category: 'Mindfulness',
    frequency: 'Daily',
    mode: 'growth',
    created_at: Date.now()
  },
  {
    id: 2,
    title: 'Gratitude Journal',
    description: 'Write down 3 things you are grateful for today',
    category: 'Reflection',
    frequency: 'Daily',
    mode: 'growth',
    created_at: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 3,
    title: 'Read for Growth',
    description: 'Read something educational or inspiring for at least 15 minutes',
    category: 'Learning',
    frequency: 'Daily',
    mode: 'growth',
    created_at: Date.now() - 172800000 // 2 days ago
  },
  {
    id: 4,
    title: 'Morning Exercise',
    description: '10 minutes of high-intensity exercise to start the day',
    category: 'Exercise',
    frequency: 'Daily',
    mode: 'action',
    created_at: Date.now()
  },
  {
    id: 5,
    title: 'Task Prioritization',
    description: 'List and prioritize your top 3 tasks for the day',
    category: 'Productivity',
    frequency: 'Daily',
    mode: 'action',
    created_at: Date.now() - 86400000 // 1 day ago
  }
];

export default function HabitsScreen() {
  const { theme, mode } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<number>>(new Set());
  const [habitStats, setHabitStats] = useState<Map<number, { total: number, streakDays: number }>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);

  // Load mock habits
  useEffect(() => {
    // Simulate loading delay
    const loadTimer = setTimeout(() => {
      setHabits(MOCK_HABITS);
      
      // Generate random completed habits and stats
      const newCompletedHabits = new Set<number>();
      const newHabitStats = new Map<number, { total: number, streakDays: number }>();
      
      MOCK_HABITS.forEach(habit => {
        // Randomly mark some habits as completed
        if (Math.random() > 0.5) {
          newCompletedHabits.add(habit.id);
        }
        
        // Generate random stats
        const randomTotal = Math.floor(Math.random() * 30);
        const randomStreak = Math.floor(Math.random() * 7);
        newHabitStats.set(habit.id, { 
          total: randomTotal, 
          streakDays: randomStreak 
        });
      });
      
      setCompletedHabits(newCompletedHabits);
      setHabitStats(newHabitStats);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(loadTimer);
  }, [mode]);

  // Toggle habit completion
  const toggleHabitCompletion = (habit: Habit) => {
    const isCompleted = completedHabits.has(habit.id);
    const newCompletedHabits = new Set(completedHabits);
    
    if (isCompleted) {
      newCompletedHabits.delete(habit.id);
    } else {
      newCompletedHabits.add(habit.id);
      
      // Update stats in real-time
      const currentStats = habitStats.get(habit.id) || { total: 0, streakDays: 0 };
      const newHabitStats = new Map(habitStats);
      newHabitStats.set(habit.id, {
        total: currentStats.total + 1,
        streakDays: currentStats.streakDays + 1, // This is simplified
      });
      
      setHabitStats(newHabitStats);
    }
    
    setCompletedHabits(newCompletedHabits);
  };

  // Render a habit item
  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isCompleted = completedHabits.has(item.id);
    const stats = habitStats.get(item.id);
    
    return (
      <HabitCard
        habit={item}
        completed={isCompleted}
        streak={stats?.streakDays || 0}
        onToggleComplete={() => toggleHabitCompletion(item)}
        onPress={() => {/* Navigate to habit details */}}
      />
    );
  };

  // Filter habits based on the current mode
  const filteredHabits = habits.filter(habit => habit.mode === mode);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText variant="header">My Habits</ThemedText>
          <View style={styles.modeWrapper}>
            <ThemedText variant="caption" style={styles.modeLabel}>
              {mode.toUpperCase()} MODE
            </ThemedText>
          </View>
        </View>

        <FlatList
          data={filteredHabits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => `habit-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {loading 
                  ? 'Loading habits...' 
                  : `No habits for ${mode} mode yet. Add your first one!`}
              </ThemedText>
            </View>
          }
        />

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: mode === 'growth' ? theme.primary : theme.accent }]}
          onPress={() => {/* Navigate to add habit screen */}}
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  modeWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modeLabel: {
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});