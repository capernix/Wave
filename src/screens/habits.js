import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

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

  // Load habits from Flask backend
  const loadHabits = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/get_habits');
      const data = await response.json();
      console.log (JSON.stringify(data, null, 2))

      setHabits(data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      Alert.alert('Error', 'Could not load habits from the server.');
      setLoading(false);
      setRefreshing(false);
    }
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
  const completeHabit = async (habitId) => {
    try {
      // Call Flask endpoint to mark habit as completed (replace with actual endpoint)
      await fetch(`http://localhost:5000/update_habit/${habitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }), // Modify based on your backend logic
      });

      // Refresh the habit list
      loadHabits();

      // Provide haptic feedback (safely)
      triggerHaptic('success');
    } catch (error) {
      console.error('Error completing habit:', error);
      triggerHaptic('error');
    }
  };

  // Go to add habit screen
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
          onPress: async () => {
            try {
              // Call Flask endpoint to delete habit
              await fetch(`http://localhost:5000/delete_habit/${habitId}`, {
                method: 'DELETE',
              });

              loadHabits();
              triggerHaptic('warning');
            } catch (error) {
              console.error('Error deleting habit:', error);
              triggerHaptic('error');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // --- HabitBlock component for array-based habits ---
  const HabitBlockArray = ({ habit, onComplete }) => {
    const [showModal, setShowModal] = useState(false);
    return (
      <>
        <TouchableOpacity
          style={styles.habitBlock}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.habitTitle}>{habit[1]}</Text>
          <Text style={styles.habitTitle}>{habit[4]}</Text>
          <Text style={styles.habitTitle}>{habit[5]}</Text>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => onComplete(habit[0])}
          >
            <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Description:</Text>
              <Text style={styles.modalText}>{habit[2]}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  // --- HabitBlock component ---
  const HabitBlock = ({ habit, onComplete }) => {
    const [showModal, setShowModal] = useState(false);

    return (
      <>
        <TouchableOpacity
          style={styles.habitBlock}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.habitTitle}>{habit.name}</Text>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => onComplete(habit.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{habit.name}</Text>
              <Text style={styles.modalLabel}>Description:</Text>
              <Text style={styles.modalText}>{habit.description}</Text>
              <Text style={styles.modalLabel}>Frequency:</Text>
              <Text style={styles.modalText}>{habit.frequency}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  // --- Update renderHabit to display only the enhanced block ---
  const renderHabit = ({ item }) => (
    <HabitBlockArray habit={item} onComplete={handleCompleteHabit} />
  );

  // --- Update handleCompleteHabit for array-based habits ---
  const handleCompleteHabit = (habitId) => {
    setHabits(prev => prev.filter(h => h[0] !== habitId));
    // Optionally, call backend here
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {mode === 'growth' ? 'Growth Habits' : 'Action Habits'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
          </View>

          <FlatList
            data={habits} 
            renderItem={renderHabit}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={() => (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: theme.text + '99' }]}>
                  No daily habits yet
                </Text>
              </View>
            )}
          />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Weekly Habits
            </Text>
          </View>

          <FlatList
            data={habits.filter(habit => habit[3] === 'weekly')}
            renderItem={renderHabit}
            keyExtractor={item => 'weekly_' + item[0]}
            contentContainerStyle={styles.listContent}
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
  },
  habitBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  checkButton: {
    marginLeft: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalLabel: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
