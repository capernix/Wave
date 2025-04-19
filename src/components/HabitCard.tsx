import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Habit } from '../database/database';
import AudioVisualizer from './AudioVisualizer';

type HabitCardProps = {
  habit: Habit;
  completed?: boolean;
  streak?: number;
  onToggleComplete?: () => void;
  onPress?: () => void;
  preferences?: any;
};

/**
 * A card component for displaying a habit
 */
const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completed = false,
  streak = 0,
  onToggleComplete,
  onPress,
  preferences
}) => {
  const { theme, mode } = useTheme();
  const [animatedValue] = useState(new Animated.Value(0));
  const [pressAnimatedValue] = useState(new Animated.Value(1));

  // Start animation when pressed
  const handlePress = () => {
    // Scale down animation
    Animated.sequence([
      Animated.timing(pressAnimatedValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressAnimatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    // Call onPress callback if provided
    if (onPress) {
      onPress();
    }
  };

  // Handle completion toggle with animation
  const handleToggleComplete = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Call the toggle callback after animation
    if (onToggleComplete) {
      onToggleComplete();
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    const category = habit.category?.toLowerCase() || '';
    
    switch (category) {
      case 'mindfulness':
      case 'meditation':
        return 'leaf';
      case 'exercise':
      case 'fitness':
        return 'heartbeat';
      case 'learning':
      case 'education':
        return 'book';
      case 'productivity':
      case 'work':
        return 'briefcase';
      case 'planning':
      case 'organization':
        return 'calendar-check-o';
      case 'reflection':
        return 'pencil';
      case 'creativity':
        return 'paint-brush';
      case 'health':
        return 'medkit';
      default:
        return 'star';
    }
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (habit.priority) {
      case 'high':
        return '#E53935'; // Red
      case 'medium':
        return '#FB8C00'; // Orange
      case 'low':
        return '#43A047'; // Green
      default:
        return '#FB8C00'; // Default to medium priority (orange)
    }
  };

  // Format days of week for display
  const formatDaysOfWeek = () => {
    if (!habit.daysOfWeek || habit.frequency !== 'weekly') return '';
    
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return habit.daysOfWeek.map(day => dayLabels[day]).join(', ');
  };

  // Determine if this is a mode-matched habit
  const isMatchingMode = habit.mode === mode;
  
  // Card background color based on mode and completion
  let cardBackgroundColor = isMatchingMode 
    ? theme.card 
    : mode === 'growth' 
      ? 'rgba(140, 195, 74, 0.1)' 
      : 'rgba(255, 87, 34, 0.1)';
      
  if (completed) {
    cardBackgroundColor = isMatchingMode 
      ? (mode === 'growth' ? 'rgba(140, 195, 74, 0.2)' : 'rgba(255, 87, 34, 0.2)')
      : 'rgba(128, 128, 128, 0.1)';
  }

  // Style for the completion checkbox
  const checkboxColor = completed 
    ? (mode === 'growth' ? theme.primary : theme.accent)
    : 'rgba(128, 128, 128, 0.3)';
    
  // Text color based on match and completion
  const textColor = completed 
    ? 'rgba(128, 128, 128, 0.8)' 
    : isMatchingMode 
      ? theme.text
      : 'rgba(128, 128, 128, 0.8)';

  // Priority indicator color
  const priorityColor = getPriorityColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: cardBackgroundColor,
          borderColor: completed ? 'transparent' : theme.border,
          transform: [{ scale: pressAnimatedValue }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <View style={styles.priorityIndicator}>
          <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome 
              name={getCategoryIcon()} 
              size={24} 
              color={isMatchingMode ? (mode === 'growth' ? theme.primary : theme.accent) : 'rgba(128, 128, 128, 0.5)'} 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title, 
                { 
                  color: textColor,
                  textDecorationLine: completed ? 'line-through' : 'none'
                }
              ]}
              numberOfLines={1}
            >
              {habit.title}
            </Text>
            
            {habit.description ? (
              <Text 
                style={[
                  styles.description, 
                  { 
                    color: textColor,
                    opacity: completed ? 0.6 : 0.8
                  }
                ]}
                numberOfLines={2}
              >
                {habit.description}
              </Text>
            ) : null}
            
            <View style={styles.statsRow}>
              {streak > 0 && (
                <View style={styles.streakContainer}>
                  <FontAwesome 
                    name="fire" 
                    size={12} 
                    color={mode === 'growth' ? '#FF9800' : '#FF5722'} 
                  />
                  <Text style={styles.streakText}>
                    {streak} {streak === 1 ? 'day' : 'days'}
                  </Text>
                </View>
              )}
              
              {/* Display frequency */}
              <View style={styles.frequencyContainer}>
                <Text style={[styles.frequencyText, { color: textColor }]}>
                  {habit.frequency === 'weekly' ? 'Weekly' : 'Daily'}
                </Text>
                
                {habit.frequency === 'weekly' && habit.daysOfWeek && (
                  <Text style={[styles.daysText, { color: textColor }]}>
                    {formatDaysOfWeek()}
                  </Text>
                )}
              </View>
              
              {/* Preference indicator */}
              {preferences && preferences.idealTimeOfDay && (
                <View style={styles.preferenceContainer}>
                  <FontAwesome name="clock-o" size={12} color={textColor} style={styles.preferenceIcon} />
                  <Text style={[styles.preferenceText, { color: textColor }]}>
                    {preferences.idealTimeOfDay}
                  </Text>
                </View>
              )}
              
              {isMatchingMode && !completed && (
                <View style={styles.audioVisualizerContainer}>
                  <AudioVisualizer 
                    type={mode === 'growth' ? 'wave' : 'bars'} 
                    size={20}
                    intensity={0.3}
                  />
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.checkboxContainer,
              { borderColor: checkboxColor }
            ]}
            onPress={handleToggleComplete}
          >
            {completed && (
              <Animated.View
                style={[
                  styles.checkboxFill,
                  {
                    backgroundColor: mode === 'growth' ? theme.primary : theme.accent,
                    transform: [
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2]
                        })
                      }
                    ]
                  }
                ]}
              >
                <FontAwesome name="check" size={14} color="#fff" />
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexDirection: 'row',
  },
  priorityIndicator: {
    width: 4,
  },
  priorityBar: {
    width: 4,
    height: '100%',
  },
  touchable: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  streakText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#FF9800',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  frequencyText: {
    fontSize: 12,
    opacity: 0.6,
    marginRight: 4,
  },
  daysText: {
    fontSize: 12,
    opacity: 0.6,
  },
  preferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  preferenceIcon: {
    marginRight: 4,
  },
  preferenceText: {
    fontSize: 12,
    opacity: 0.6,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  checkboxFill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioVisualizerContainer: {
    marginLeft: 12,
  },
});

export default HabitCard;