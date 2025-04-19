// src/components/AudioControls.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AudioControls() {
  const { theme, audioEnabled, toggleAudio } = useTheme();
  
  const handleToggleAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackType.Medium);
    toggleAudio();
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.controlButton, 
          { backgroundColor: theme.card, borderColor: theme.primary }
        ]}
        onPress={handleToggleAudio}
      >
        <Ionicons 
          name={audioEnabled ? 'volume-high' : 'volume-mute'} 
          size={20} 
          color={theme.primary} 
        />
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {audioEnabled ? 'Sound On' : 'Sound Off'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 14,
  },
});