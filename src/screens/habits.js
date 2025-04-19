// src/screens/habits.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router'; // Import useFocusEffect
import React, { useCallback, useState } from 'react'; // Import useCallback
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
import {
  addCompletion,
  deleteHabit
} from '../database/database';
// Import Flask service for backend persistence
import * as FlaskServer from '../services/FlaskServer';

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
  const [useFlaskBackend, setUseFlaskBackend] = useState(true); // Flag to use Flask backend
  
  // Get current day of the week
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  
  // Get current time period (Morning, Afternoon, Evening)
  const getCurrentTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    return 'Evening';
  };

  // Load habits function (wrapped in useCallback for useFocusEffect)
  const loadHabits = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
        setLoading(true); // Show loading indicator only on initial load/focus, not refresh
    }
    console.log(`[loadHabits] Fetching habits for mode: ${mode}, refreshing: ${isRefreshing}`); // Frontend Log 1
    try {
      const typeMap = {
        'growth': 'Learning',
        'action': 'Productivity'
      };
      let habitType = typeMap[mode];
      
      let fetchedHabits = [];
      
      if (useFlaskBackend) {
        try {
          fetchedHabits = await FlaskServer.getHabits(habitType);
          console.log(`[loadHabits] Fetched ${fetchedHabits.length} habits from Flask.`); // Frontend Log 2
          // No need to map here if FlaskServer.getHabits already normalizes
        } catch (error) {
          console.error('[loadHabits] Error loading habits from Flask:', error);
          setUseFlaskBackend(false); // Fallback on error
          // Fallback logic (if needed, ensure it maps correctly)
          // const habitResults = await getHabits(habitType); 
          // fetchedHabits = habitResults.map(...); 
          // console.log('[loadHabits] Fetched habits from local DB (fallback).');
        }
      } else {
        // Local DB logic (ensure it maps correctly)
        // const habitResults = await getHabits(habitType);
        // fetchedHabits = habitResults.map(...);
        // console.log('[loadHabits] Fetched habits from local DB.');
      }

      // Ensure fetchedHabits is always an array
      if (!Array.isArray(fetchedHabits)) {
          console.error('[loadHabits] Fetched data is not an array:', fetchedHabits);
          fetchedHabits = [];
      }

      // Sort habits (ensure priority and time exist and are valid)
      fetchedHabits.sort((a, b) => {
        const priorityA = typeof a.priority === 'number' ? a.priority : 0;
        const priorityB = typeof b.priority === 'number' ? a.priority : 0;
        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }
        const timeAValue = a.time ? new Date(`1970-01-01T${a.time}:00`).getTime() : Infinity;
        const timeBValue = b.time ? new Date(`1970-01-01T${b.time}:00`).getTime() : Infinity;
        if (!isFinite(timeAValue) && !isFinite(timeBValue)) return 0;
        if (!isFinite(timeAValue)) return 1;
        if (!isFinite(timeBValue)) return -1;
        return timeAValue - timeBValue;
      });
      
      // Load completions (ensure habit.id exists)
      const completions = {};
      for (const habit of fetchedHabits) {
        if (habit && habit.id) { // Add check for habit object itself
          const habitIdStr = String(habit.id);
          const habitIdInt = parseInt(habitIdStr);
          if (isNaN(habitIdInt)) {
             console.warn(`[loadHabits] Invalid habit ID found: ${habit.id}`);
             continue;
          }
          if (useFlaskBackend) {
            try {
              const stats = await FlaskServer.getHabitStats(habitIdInt);
              completions[habitIdStr] = stats && stats.total > 0 ? [{ completed_at: Date.now(), streakDays: stats.streakDays }] : [];
            } catch (error) {
              console.error(`[loadHabits] Error getting stats for habit ${habitIdStr} from Flask:`, error);
              completions[habitIdStr] = []; // Default to empty on error
              // Fallback to local completions if needed
              // const localCompletions = await getCompletions(habitIdStr);
              // completions[habitIdStr] = localCompletions;
            }
          } else {
            // Local completions logic
            // const localCompletions = await getCompletions(habitIdStr);
            // completions[habitIdStr] = localCompletions;
          }
        } else {
           console.warn("[loadHabits] Habit found with missing ID or invalid habit object:", habit);
        }
      }
      
      console.log(`[loadHabits] Setting ${fetchedHabits.length} habits.`); // Frontend Log 3
      console.log('[loadHabits] Setting completions:', completions); // Debug Log 5: Log completions before setting state
      setHabits(fetchedHabits);
      setHabitCompletions(completions);
      
    } catch (error) {
      console.error('[loadHabits] General error loading habits:', error);
      Alert.alert("Error", "Failed to load habits. Please try again.");
    } finally {
       setLoading(false);
       setRefreshing(false);
       console.log('[loadHabits] Finished loading.'); // Frontend Log 4
    }
  }, [mode, useFlaskBackend]); // Add dependencies for useCallback
  
  // Use useFocusEffect to load habits when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[useFocusEffect] Screen focused, loading habits.');
      loadHabits();
      // Optional: Return a cleanup function if needed
      return () => {
        console.log('[useFocusEffect] Screen unfocused.');
      };
    }, [loadHabits]) // Dependency array includes loadHabits
  );

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadHabits(true); // Pass true to indicate it's a refresh
  };
  
  // Complete a habit
  const completeHabit = async (habitId) => {
    try {
      if (useFlaskBackend) {
        // Use Flask backend
        await FlaskServer.addHabitCompletion(parseInt(habitId));
      } else {
        // Use in-memory database
        await addCompletion({
          habit_id: habitId,
          completed_at: Date.now(),
          notes: ''
        });
      }
      
      // Refresh the habit list
      loadHabits();
      
      // Provide haptic feedback
      triggerHaptic('success');
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };
  
  // Check if habit was completed today
  const isCompletedToday = (habitId) => {
    const completions = habitCompletions[habitId] || [];
    const today = new Date().setHours(0, 0, 0, 0);
    console.log(`[isCompletedToday] Checking habit ${habitId}. Today: ${new Date(today).toDateString()}. Completions:`, completions); // Debug Log 1

    const completed = completions.some(c => {
      if (!c || !c.completed_at) {
        console.warn(`[isCompletedToday] Invalid completion object for habit ${habitId}:`, c); // Debug Log 2
        return false;
      }
      const completionDate = new Date(c.completed_at).setHours(0, 0, 0, 0);
      const isToday = completionDate === today;
      console.log(`[isCompletedToday] Habit ${habitId} - Completion Date: ${new Date(c.completed_at).toDateString()}, Is Today: ${isToday}`); // Debug Log 3
      return isToday;
    });

    console.log(`[isCompletedToday] Habit ${habitId} completed today: ${completed}`); // Debug Log 4
    return completed;
  };
  
  // Calculate streak for a habit
  const calculateStreak = (completions) => {
    if (!completions || completions.length === 0) return 0;
    
    // If we have streakDays directly from Flask backend
    if (completions[0] && completions[0].streakDays !== undefined) {
      return completions[0].streakDays;
    }
    
    // Otherwise calculate from completion history
    // Sort completions by date
    const sortedCompletions = [...completions].sort(
      (a, b) => b.completed_at - a.completed_at
    );
    
    // Start from the most recent completion
    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].completed_at);
    
    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i].completed_at);
      
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
  
  // Go to add habit screen
  const goToAddHabit = () => {
    // Trigger haptic feedback safely
    triggerHaptic('impact');
    
    // Navigate to add habit screen
    router.push('/add-habit');
  };
  
  // Delete a habit
  const deleteHabitHandler = (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              if (useFlaskBackend) {
                // Use Flask backend to delete the habit
                await FlaskServer.deleteHabit(parseInt(habitId));
              } else {
                await deleteHabit(habitId);
              }
              
              loadHabits();
              triggerHaptic('warning');
            } catch (error) {
              console.error('Error deleting habit:', error);
            }
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
  
  // Render habit item
  const renderHabit = ({ item }) => {
    console.log('[renderHabit] Rendering item:', item); // Frontend Log 5
    if (!item || !item.id) {
       console.warn("[renderHabit] Attempting to render invalid habit item:", item);
       return null;
    }
    const completed = isCompletedToday(item.id);
    const habitCompletionsList = habitCompletions[item.id] || [];
    const streak = calculateStreak(habitCompletionsList);
    
    // Create adapted habit object for the HabitCard component
    const adaptedHabit = {
      id: item.id,
      title: item.desc || 'Untitled Habit', // Use desc as title, provide fallback
      description: `Priority: ${item.priority}, Type: ${item.type}`, // Create description
      category: item.type, // Map type to category
      frequency: item.days && item.days.length === 7 ? 'daily' : 'weekly', // Daily if all days are selected
      daysOfWeek: item.days || [], // Pass days array, provide fallback
      priority: item.priority >= 3 ? 'high' : item.priority === 2 ? 'medium' : 'low', // Map priority number to string
      mode: mode, // Use current mode
      time: item.time // Pass the time for sorting/display
    };
    
    // Create preferences object
    const preferences = {
      // Ensure times is an array before accessing index 0
      idealTimeOfDay: Array.isArray(item.times) && item.times.length > 0 ? item.times[0] : null 
    };
    
    return (
      <HabitCard
        habit={adaptedHabit}
        completed={completed}
        streak={streak}
        preferences={preferences}
        onToggleComplete={() => completeHabit(item.id)}
        onPress={() => goToHabitFocus(item.id)}
        // Add onDelete prop if HabitCard supports it
        // onDelete={() => deleteHabitHandler(item.id)} 
      />
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Current Habits 
        </Text>
        {useFlaskBackend && (
          <View style={styles.backendBadge}>
            <Text style={styles.backendText}>SQLite</Text>
          </View>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
          {/* Debug log for habit count */}
          {console.log(`[Debug] Rendering ${habits.length} total habits, ${habits.filter(habit => habit && habit.id && !isCompletedToday(habit.id)).length} uncompleted habits`)}
          
          <FlatList
            style={{ flex: 1, width: '100%' }} // Ensure FlatList takes full width and available height
            data={habits} // Show all habits, not just uncompleted ones
            renderItem={renderHabit}
            keyExtractor={(item, index) => item.id ? `habit_${item.id}` : `habit_${index}_${Math.random()}`}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            scrollEnabled={true} // Explicitly enable scrolling
            initialNumToRender={10} // Render more items initially
            windowSize={5} // Increase window size for better rendering
            removeClippedSubviews={false} // Prevent items from disappearing
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={mode === 'growth' ? "leaf-outline" : "flash-outline"} 
                  size={60} 
                  color={theme.text + '50'} 
                />
                <Text style={[styles.emptyText, { color: theme.text + '99', marginTop: 10 }]}>No habits available. Tap the '+' button to create one!</Text>
              </View>
            )}
          />
        </View>
      )}
      
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
    width: '100%', // Ensure full width
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust as needed for safe area
    paddingBottom: 15, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)', // Consider theme color: theme.border
  },
  title: {
    fontSize: 28, // Slightly larger title
    fontWeight: 'bold',
  },
  backendBadge: {
    backgroundColor: '#4a90e2', // Consider theme color: theme.secondary
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  backendText: {
    color: 'white', // Consider theme color: theme.secondaryText
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 100, // Increased padding to ensure last items are visible above FAB
    minHeight: '100%', // Ensure content container is at least full height
  },
  emptySection: { // Renamed from emptyContainer if it's used in ListEmptyComponent now
    flex: 1, // Allow it to take space
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Add padding
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16, // Slightly larger empty text
    textAlign: 'center',
    marginTop: 15, // Space below icon
  },
  emptyContainer: { // Keep this if used for the main empty state
     flex: 1, // Allow it to take space
     alignItems: 'center',
     justifyContent: 'center',
     paddingHorizontal: 20,
     paddingBottom: 60, // Space from bottom
   },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20, // Increased margin
  },
  emptyButtonText: {
    color: 'white', // Consider theme color: theme.primaryText
    fontWeight: '600',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30, // Adjusted position
    right: 30, // Adjusted position
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Increased elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});