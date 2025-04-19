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

// Category options
const categories = [
  { id: 'meditation', icon: 'leaf-outline', label: 'Meditation' },
  { id: 'exercise', icon: 'fitness-outline', label: 'Exercise' },
  { id: 'learning', icon: 'book-outline', label: 'Learning' },
  { id: 'productivity', icon: 'checkbox-outline', label: 'Productivity' },
  { id: 'health', icon: 'heart-outline', label: 'Health' },
  { id: 'creativity', icon: 'color-palette-outline', label: 'Creativity' },
];

// Frequency options
const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
];

// Priority options
const priorities = [
  { id: 'high', label: 'High Priority', color: '#E53935' },
  { id: 'medium', label: 'Medium Priority', color: '#FB8C00' },
  { id: 'low', label: 'Low Priority', color: '#43A047' },
];

// Days of week for weekly habits
const daysOfWeek = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { theme, mode } = useTheme();
  
  const [showTitleModal, setShowTitleModal] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meditation');
  const [frequency, setFrequency] = useState('daily');
  const [selectedMode, setSelectedMode] = useState(mode);
  const [priority, setPriority] = useState('medium');
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Default to Mon, Wed, Fri
  const [preferences, setPreferences] = useState({
    idealTimeOfDay: '',
    suggestedDuration: '',
    notes: ''
  });
  
  // Initial prompt for title and description
  const handleTitleSubmit = () => {
    if (title.trim() === '') {
      Alert.alert('Missing Information', 'Please enter a habit title');
      return;
    }
    setShowTitleModal(false);
  };
  
  const toggleDaySelection = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
    triggerHaptic('impact');
  };
  
  const saveHabit = () => {
    // Validate
    if (title.trim() === '') {
      Alert.alert('Missing Information', 'Please enter a habit title');
      return;
    }
    
    // Create habit data with preferences
    const habitData = {
      title: title.trim(),
      description: description.trim(),
      category,
      frequency,
      mode: selectedMode,
      priority,
      preferences: {
        idealTimeOfDay: preferences.idealTimeOfDay,
        suggestedDuration: preferences.suggestedDuration ? parseInt(preferences.suggestedDuration, 10) : null,
        notes: preferences.notes,
        priority
      }
    };
    
    // Add days of week for weekly habits
    if (frequency === 'weekly') {
      habitData.daysOfWeek = selectedDays;
    }
    
    try {
      // Create the habit with all data including preferences
      const newHabit = DataStore.createHabit(habitData);
      
      // Trigger haptic feedback safely
      triggerHaptic('success');
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Unable to create habit');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title & Description Modal */}
      <Modal
        visible={showTitleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => router.back()}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Habit</Text>
            
            <Text style={[styles.modalLabel, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.background,
                color: theme.text,
              }]}
              placeholder="What habit do you want to build?"
              placeholderTextColor={theme.text + '70'}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              autoFocus
            />
            
            <Text style={[styles.modalLabel, { color: theme.text }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.modalTextArea, { 
                backgroundColor: theme.background,
                color: theme.text, 
              }]}
              placeholder="Add details about this habit..."
              placeholderTextColor={theme.text + '70'}
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              maxLength={200}
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
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={saveHabit}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Habit Title</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.text + '20'
            }]}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: theme.card,
              color: theme.text, 
              borderColor: theme.text + '20'
            }]}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            maxLength={200}
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
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Frequency</Text>
          <View style={styles.frequencyRow}>
            {frequencies.map(freq => (
              <TouchableOpacity
                key={freq.id}
                style={[
                  styles.frequencyItem,
                  { 
                    backgroundColor: frequency === freq.id 
                      ? theme.primary 
                      : theme.card,
                  }
                ]}
                onPress={() => {
                  setFrequency(freq.id);
                  triggerHaptic('impact');
                }}
              >
                <Text 
                  style={[
                    styles.frequencyText,
                    { color: frequency === freq.id ? 'white' : theme.text }
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {frequency === 'weekly' && (
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
        )}
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
          <View style={styles.optionsList}>
            {priorities.map(pri => (
              <TouchableOpacity
                key={pri.id}
                style={[
                  styles.priorityItem,
                  { 
                    backgroundColor: priority === pri.id 
                      ? pri.color 
                      : theme.card,
                    borderColor: pri.color,
                    borderWidth: priority === pri.id ? 0 : 1,
                  }
                ]}
                onPress={() => {
                  setPriority(pri.id);
                  triggerHaptic('impact');
                }}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { 
                      color: priority === pri.id 
                        ? 'white' 
                        : theme.text
                    }
                  ]}
                >
                  {pri.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
          
          <Text style={[styles.label, { color: theme.text }]}>Ideal Time of Day</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.text + '20'
            }]}
            placeholder="e.g. Morning, Evening"
            placeholderTextColor={theme.text + '70'}
            value={preferences.idealTimeOfDay}
            onChangeText={(text) => setPreferences({...preferences, idealTimeOfDay: text})}
          />
          
          <Text style={[styles.label, { color: theme.text }]}>Suggested Duration (minutes)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.text + '20'
            }]}
            placeholder="e.g. 10, 30, 60"
            placeholderTextColor={theme.text + '70'}
            keyboardType="numeric"
            value={preferences.suggestedDuration}
            onChangeText={(text) => setPreferences({...preferences, suggestedDuration: text})}
          />
          
          <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: theme.card,
              color: theme.text, 
              borderColor: theme.text + '20'
            }]}
            placeholder="Any additional notes or preferences"
            placeholderTextColor={theme.text + '70'}
            value={preferences.notes}
            onChangeText={(text) => setPreferences({...preferences, notes: text})}
            multiline={true}
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Mode</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeItem,
                { 
                  backgroundColor: selectedMode === 'growth' 
                    ? '#8BC34A' 
                    : theme.card,
                }
              ]}
              onPress={() => {
                setSelectedMode('growth');
                triggerHaptic('impact');
              }}
            >
              <Ionicons 
                name="leaf" 
                size={24} 
                color={selectedMode === 'growth' ? 'white' : '#8BC34A'} 
              />
              <Text 
                style={[
                  styles.modeText,
                  { color: selectedMode === 'growth' ? 'white' : '#8BC34A' }
                ]}
              >
                Growth
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeItem,
                { 
                  backgroundColor: selectedMode === 'action' 
                    ? '#FF5722' 
                    : theme.card,
                }
              ]}
              onPress={() => {
                setSelectedMode('action');
                triggerHaptic('impact');
              }}
            >
              <Ionicons 
                name="flash" 
                size={24} 
                color={selectedMode === 'action' ? 'white' : '#FF5722'} 
              />
              <Text 
                style={[
                  styles.modeText,
                  { color: selectedMode === 'action' ? 'white' : '#FF5722' }
                ]}
              >
                Action
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryItem: {
    width: '30%',
    margin: '1.66%',
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
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  priorityItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionLabel: {
    fontWeight: '500',
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyItem: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  frequencyText: {
    fontWeight: '500',
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
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeItem: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontWeight: '600',
    marginLeft: 8,
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
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    height: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
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
  },
});