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

// Priority options
const priorities = [
  { id: 'high', label: 'High Priority', color: '#E53935' },
  { id: 'medium', label: 'Medium Priority', color: '#FB8C00' },
  { id: 'low', label: 'Low Priority', color: '#43A047' },
];

// Days of week for weekly habits
const daysOfWeek = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { theme, mode } = useTheme();
  
  const [showTitleModal, setShowTitleModal] = useState(true);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meditation');
  const [priority, setPriority] = useState('medium');
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Default to Mon, Wed, Fri
  const [preferences, setPreferences] = useState({
    idealTimeOfDay: '',
    suggestedDuration: '',
    notes: ''
  });
  
  // Initial prompt for title and description
  const handleTitleSubmit = () => {
    setShowTitleModal(false);
  };
  
  const toggleDaySelection = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays([]); // Deselect if already selected
    } else {
      setSelectedDays([dayId]); // Select only the tapped day
    }
    triggerHaptic('impact');
  };
  
  const saveHabit = async () => {
    // Create habit data with preferences
    try {
      const eventData = {
        description: 'Morning Workout',
        start: '07:00',
        end: '08:00',
        days: ['Monday', 'Wednesday', 'Friday'], // Or use abbreviated: ['Mon', 'Wed', 'Fri']
      };
    
      const response = await fetch('http://localhost:5000/schedule_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    
      const result = await response.json();
      console.log('Event scheduled:', result);
      triggerHaptic('success');
      router.back();
    } catch (error) {
      console.error('Error scheduling event:', error);
      triggerHaptic('error');
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
            onPress={() => router.replace('/(tabs)/habits')}
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
        
        {/* Description */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '20' }]}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            maxLength={200}
          />
        </View>

        {/* Priority */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
          <View style={styles.optionsList}>
            {priorities.map(pri => (
              <TouchableOpacity
                key={pri.id}
                style={[
                  styles.optionItem,
                  { backgroundColor: priority === pri.id ? pri.color : theme.card }
                ]}
                onPress={() => setPriority(pri.id)}
              >
                <Text style={[styles.optionLabel, { color: priority === pri.id ? 'white' : pri.color }]}>{pri.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preference (Suggested Duration) */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Preference</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '20' }]}
            placeholder="Suggested Duration (minutes)"
            value={preferences.suggestedDuration}
            onChangeText={t => setPreferences({ ...preferences, suggestedDuration: t })}
            keyboardType="numeric"
          />
        </View>

        {/* Category (health, learning, creativity, productivity, meditation) */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories
              .filter(cat => ['health', 'learning', 'creativity', 'productivity', 'meditation'].includes(cat.id))
              .map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: category === cat.id ? theme.primary : theme.card }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons name={cat.icon} size={20} color={category === cat.id ? 'white' : theme.primary} />
                  <Text style={{ color: category === cat.id ? 'white' : theme.text, marginLeft: 4 }}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Days of the Week Selection */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Days</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  { backgroundColor: selectedDays.includes(day.id) ? theme.primary : theme.card }
                ]}
                onPress={() => toggleDaySelection(day.id)}
              >
                <Text style={{ color: selectedDays.includes(day.id) ? 'white' : theme.text, fontWeight: 'bold' }}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time (Ideal Time of Day) */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Time</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '20' }]}
            placeholder="Ideal Time of Day (e.g. Morning)"
            value={preferences.idealTimeOfDay}
            onChangeText={t => setPreferences({ ...preferences, idealTimeOfDay: t })}
          />
        </View>

        {/* Remark (notes) */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Remark</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '20' }]}
            value={preferences.notes}
            onChangeText={t => setPreferences({ ...preferences, notes: t })}
            multiline={true}
            numberOfLines={2}
            maxLength={100}
          />
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
  dayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
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