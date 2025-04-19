// src/screens/add-habit.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createHabit } from '../database/database';
// Import Flask service
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

// Category options using our database schema types
const categories = [
  { id: 'Health', icon: 'heart-outline', label: 'Health' },
  { id: 'Learning', icon: 'book-outline', label: 'Learning' },
  { id: 'Creativity', icon: 'color-palette-outline', label: 'Creativity' },
  { id: 'Productivity', icon: 'checkbox-outline', label: 'Productivity' },
];

// Time of day options
const timeOfDayOptions = [
  { id: 'Morning', label: 'Morning' },
  { id: 'Afternoon', label: 'Afternoon' },
  { id: 'Evening', label: 'Evening' },
];

// Days of week for habits
const daysOfWeek = [
  { id: 'Sunday', label: 'Sun' },
  { id: 'Monday', label: 'Mon' },
  { id: 'Tuesday', label: 'Tue' },
  { id: 'Wednesday', label: 'Wed' },
  { id: 'Thursday', label: 'Thu' },
  { id: 'Friday', label: 'Fri' },
  { id: 'Saturday', label: 'Sat' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [showTitleModal, setShowTitleModal] = useState(true);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [priority, setPriority] = useState(2); // Default to medium priority (1=low, 2=med, 3=high)
  const [preferences, setPreferences] = useState(1); // Preference level
  
  // Days and times state
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Friday']); // Default days
  const [selectedTimes, setSelectedTimes] = useState(['Morning']); // Default time
  const [specificTime, setSpecificTime] = useState('08:00'); // Default specific time
  const [useFlaskBackend, setUseFlaskBackend] = useState(true); // Flag to use Flask backend
  const [saving, setSaving] = useState(false);
  
  // Initial prompt for description
  const handleTitleSubmit = () => {
    if (description.trim() === '') {
      Alert.alert('Missing Information', 'Please enter a habit description');
      return;
    }
    setShowTitleModal(false);
  };
  
  // Toggle day selection
  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    triggerHaptic('impact');
  };
  
  // Toggle time of day selection
  const toggleTimeSelection = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
    triggerHaptic('impact');
  };
  
  const saveHabit = async () => {
    if (saving) return; // Prevent double submission
    
    if (description.trim() === '') {
      Alert.alert('Missing Information', 'Please enter a habit description');
      return;
    }
    
    if (selectedDays.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one day');
      return;
    }
    
    if (selectedTimes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one time of day');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create habit data object
      const habitData = {
        desc: description.trim(),
        priority: priority,
        preferences: preferences,
        type: category,
        time: specificTime,
        remarks: '' // Initialize with empty remarks
      };
      
      let newHabit;
      
      if (useFlaskBackend) {
        // Try to use Flask/SQLite backend
        try {
          // Convert time periods to array of strings
          const timePeriods = selectedTimes.map(time => time);
          
          // Save using Flask backend
          newHabit = await FlaskServer.createHabit(
            habitData,
            selectedDays,
            timePeriods
          );
          
          console.log('Habit created in Flask backend:', newHabit);
        } catch (error) {
          console.error('Error saving to Flask backend:', error);
          
          // Fallback to in-memory database
          setUseFlaskBackend(false);
          
          // Create day and time arrays for in-memory DB
          const habitDays = selectedDays.map(day => ({
            day: day
          }));
          
          const habitTimes = selectedTimes.map(time => ({
            time: time
          }));
          
          // Save using in-memory database
          newHabit = await createHabit(habitData, habitDays, habitTimes);
        }
      } else {
        // Use in-memory database directly
        const habitDays = selectedDays.map(day => ({
          day: day
        }));
        
        const habitTimes = selectedTimes.map(time => ({
          time: time
        }));
        
        newHabit = await createHabit(habitData, habitDays, habitTimes);
      }
      
      // Trigger success haptic feedback
      triggerHaptic('success');
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Unable to create habit. Please try again.');
      setSaving(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Description Modal */}
      <Modal
        visible={showTitleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => router.back()}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Habit</Text>
            
            <Text style={[styles.modalLabel, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.background,
                color: theme.text,
              }]}
              placeholder="What habit do you want to build?"
              placeholderTextColor={theme.text + '70'}
              value={description}
              onChangeText={setDescription}
              maxLength={50}
              autoFocus
            />
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleTitleSubmit}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => router.back()}
            >
              <Text style={{ color: theme.primary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Create New Habit
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { 
              backgroundColor: saving ? theme.primary + '80' : theme.primary 
            }]}
            onPress={saveHabit}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Habit Description</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.text + '20'
            }]}
            value={description}
            onChangeText={setDescription}
            maxLength={50}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  { 
                    backgroundColor: category === cat.id 
                      ? theme.primary 
                      : theme.card,
                  }
                ]}
                onPress={() => {
                  setCategory(cat.id);
                  triggerHaptic('impact');
                }}
              >
                <Ionicons 
                  name={cat.icon} 
                  size={24} 
                  color={category === cat.id ? 'white' : theme.text + 'CC'} 
                />
                <Text 
                  style={[
                    styles.categoryText,
                    { color: category === cat.id ? 'white' : theme.text }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {useFlaskBackend && (
            <View style={styles.backendIndicator}>
              <Ionicons name="server-outline" size={14} color={theme.primary} />
              <Text style={[styles.backendText, { color: theme.primary }]}>
                Using SQLite Persistence
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Days of Week</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayItem,
                  { 
                    backgroundColor: selectedDays.includes(day.id) 
                      ? theme.primary 
                      : theme.card,
                  }
                ]}
                onPress={() => toggleDaySelection(day.id)}
              >
                <Text 
                  style={[
                    styles.dayText,
                    { color: selectedDays.includes(day.id) ? 'white' : theme.text }
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Time of Day</Text>
          <View style={styles.timeContainer}>
            {timeOfDayOptions.map(timeOption => (
              <TouchableOpacity
                key={timeOption.id}
                style={[
                  styles.timeItem,
                  { 
                    backgroundColor: selectedTimes.includes(timeOption.id) 
                      ? theme.primary 
                      : theme.card,
                  }
                ]}
                onPress={() => toggleTimeSelection(timeOption.id)}
              >
                <Text 
                  style={[
                    styles.timeText,
                    { color: selectedTimes.includes(timeOption.id) ? 'white' : theme.text }
                  ]}
                >
                  {timeOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Specific Time</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.text + '20'
            }]}
            placeholder="e.g. 08:00"
            placeholderTextColor={theme.text + '70'}
            value={specificTime}
            onChangeText={setSpecificTime}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[
                styles.priorityItem,
                { 
                  backgroundColor: priority === 1 
                    ? '#43A047' 
                    : theme.card,
                  borderColor: '#43A047',
                  borderWidth: priority === 1 ? 0 : 1,
                }
              ]}
              onPress={() => {
                setPriority(1);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: priority === 1 ? 'white' : theme.text }
                ]}
              >
                Low Priority
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.priorityItem,
                { 
                  backgroundColor: priority === 2 
                    ? '#FB8C00' 
                    : theme.card,
                  borderColor: '#FB8C00',
                  borderWidth: priority === 2 ? 0 : 1,
                }
              ]}
              onPress={() => {
                setPriority(2);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: priority === 2 ? 'white' : theme.text }
                ]}
              >
                Medium Priority
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.priorityItem,
                { 
                  backgroundColor: priority === 3 
                    ? '#E53935' 
                    : theme.card,
                  borderColor: '#E53935',
                  borderWidth: priority === 3 ? 0 : 1,
                }
              ]}
              onPress={() => {
                setPriority(3);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: priority === 3 ? 'white' : theme.text }
                ]}
              >
                High Priority
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Preference Level</Text>
          <View style={styles.preferenceContainer}>
            <TouchableOpacity
              style={[
                styles.preferenceItem,
                { 
                  backgroundColor: preferences === 1 
                    ? theme.primary 
                    : theme.card,
                }
              ]}
              onPress={() => {
                setPreferences(1);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: preferences === 1 ? 'white' : theme.text }
                ]}
              >
                Low
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.preferenceItem,
                { 
                  backgroundColor: preferences === 2 
                    ? theme.primary 
                    : theme.card,
                }
              ]}
              onPress={() => {
                setPreferences(2);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: preferences === 2 ? 'white' : theme.text }
                ]}
              >
                Medium
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.preferenceItem,
                { 
                  backgroundColor: preferences === 3 
                    ? theme.primary 
                    : theme.card,
                }
              ]}
              onPress={() => {
                setPreferences(3);
                triggerHaptic('impact');
              }}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: preferences === 3 ? 'white' : theme.text }
                ]}
              >
                High
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryItem: {
    width: '45%',
    margin: '2.5%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  backendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 4,
  },
  backendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  dayText: {
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timeItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  timeText: {
    fontWeight: 'bold',
  },
  priorityContainer: {
    marginVertical: 10,
  },
  priorityItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  preferenceItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  optionLabel: {
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    marginBottom: 16,
  },
  modalButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelButton: {
    marginTop: 15,
    padding: 10,
  }
});