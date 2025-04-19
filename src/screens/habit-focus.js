// src/screens/habit-focus.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import DataStore from '../utils/DataStore';

export default function HabitFocusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const habitId = params.habitId ? String(params.habitId) : null;
  const { theme } = useTheme();
  const [habit, setHabit] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Animation value for breathing guide
  const breathAnim = useRef(new Animated.Value(0)).current;
  
  // Load habit data
  useEffect(() => {
    if (habitId) {
      try {
        const habitData = DataStore.getHabitById(habitId);
        if (habitData) {
          setHabit(habitData);
        } else {
          console.error('Habit not found for ID:', habitId);
          Alert.alert('Error', 'Habit not found');
          router.replace('/(tabs)/habits');
        }
      } catch (error) {
        console.error('Error loading habit:', error);
        Alert.alert('Error', 'Failed to load habit data');
        router.replace('/(tabs)/habits');
      }
    } else {
      console.error('No habitId provided');
      Alert.alert('Error', 'No habit selected');
      router.replace('/(tabs)/habits');
    }
  }, [habitId]);
  
  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => backHandler.remove();
  }, [isActive, isCompleted]);
  
  const handleBackPress = () => {
    if (isActive && !isCompleted) {
      Alert.alert(
        'Exit Focus',
        'Are you sure you want to exit the focus session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => router.replace('/(tabs)/habits') }
        ]
      );
      return true;
    }
    return false;
  };
  
  // Set up timer
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isCompleted]);
  
  // Breathing animation
  useEffect(() => {
    if (!isCompleted) {
      startBreathingAnimation();
    }
    
    return () => {
      breathAnim.stopAnimation();
    };
  }, [isCompleted]);
  
  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        // Inhale
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        // Hold
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        // Exhale
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
        // Pause
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const togglePause = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackType.Medium);
      setIsActive(prevActive => !prevActive);
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };
  
  const completeHabit = () => {
    try {
      // Complete the habit in the data store
      if (habit && !isCompleted) {
        DataStore.completeHabit(habit.id);
        setIsCompleted(true);
        setIsActive(false);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Navigate back after a short delay
        setTimeout(() => {
          router.replace('/(tabs)/habits');
        }, 3000);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      Alert.alert('Error', 'Failed to complete habit. Please try again.');
    }
  };
  
  // Circle size animation for breathing
  const circleSize = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 200],
  });
  
  // Text opacity for breathing guidance
  const inhaleOpacity = breathAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });
  
  const exhaleOpacity = breathAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  
  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading...
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isCompleted ? 'Habit Completed!' : habit.title}
        </Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Breathing Circle */}
        <View style={styles.breathingContainer}>
          <Animated.View 
            style={[
              styles.breathCircle,
              { 
                width: circleSize,
                height: circleSize,
                backgroundColor: isCompleted 
                  ? theme.primary + '30'
                  : theme.primary + '15'
              }
            ]}
          />
          
          {isCompleted ? (
            <View style={styles.completionIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
              <Text style={[styles.completedText, { color: theme.text }]}>
                Great job!
              </Text>
            </View>
          ) : (
            <>
              <Animated.Text style={[
                styles.breathText, 
                { opacity: inhaleOpacity, color: theme.text }
              ]}>
                Inhale...
              </Animated.Text>
              <Animated.Text style={[
                styles.breathText, 
                { opacity: exhaleOpacity, color: theme.text }
              ]}>
                Exhale...
              </Animated.Text>
            </>
          )}
        </View>
        
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: theme.text }]}>
            {formatTime(timeElapsed)}
          </Text>
          <Text style={[styles.timerLabel, { color: theme.text + '99' }]}>
            Focus Time
          </Text>
        </View>
        
        {/* Controls */}
        {!isCompleted && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.card }]}
              onPress={togglePause}
            >
              <Ionicons 
                name={isActive ? 'pause-circle' : 'play-circle'} 
                size={32} 
                color={theme.primary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: theme.primary }]}
              onPress={completeHabit}
            >
              <Text style={styles.completeButtonText}>Complete Habit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  breathCircle: {
    borderRadius: 150,
    position: 'absolute',
  },
  breathText: {
    fontSize: 20,
    fontWeight: '300',
  },
  completionIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
  },
  timerLabel: {
    fontSize: 16,
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 40,
  },
  controlButton: {
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  completeButton: {
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});