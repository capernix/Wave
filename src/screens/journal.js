// src/screens/journal.js
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import AudioVisualizer from '../components/AudioVisualizer';
import { useTheme } from '../contexts/ThemeContext';

// Mock AI service (replace with real API call when backend is ready)
const mockAnalyzeMood = (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock implementation
      const keywords = {
        growth: ['calm', 'peace', 'relax', 'mindful', 'grateful', 'learn'],
        action: ['energy', 'productive', 'focus', 'achieve', 'goal', 'work']
      };
      
      const lowercaseText = text.toLowerCase();
      let growthScore = 0;
      let actionScore = 0;
      
      keywords.growth.forEach(word => {
        if (lowercaseText.includes(word)) growthScore++;
      });
      
      keywords.action.forEach(word => {
        if (lowercaseText.includes(word)) actionScore++;
      });
      
      const suggestedMode = growthScore > actionScore ? 'growth' : 
                            actionScore > growthScore ? 'action' : null;
      
      resolve({
        suggestedMode,
        confidence: Math.abs(growthScore - actionScore) * 0.2
      });
    }, 1500); // Simulate API delay
  });
};

export default function JournalScreen() {
  const { theme, mode, toggleMode } = useTheme();
  const [journalText, setJournalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const lastModeChangeTime = useRef(Date.now());
  
  const handleAnalyze = async () => {
    if (journalText.length < 10) {
      Alert.alert(
        'Too Short',
        'Please write a bit more for accurate analysis.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackType.Medium);
    setAnalyzing(true);
    setAnalysis(null);
    
    try {
      // In a real implementation, this would call your Flask backend
      const result = await mockAnalyzeMood(journalText);
      
      setAnalysis(result);
      
      // If there's a mode suggestion and it's different from current
      // Add debounce to prevent rapid mode toggling
      const now = Date.now();
      const timeSinceLastChange = now - lastModeChangeTime.current;
      
      if (result.suggestedMode && 
          result.suggestedMode !== mode && 
          timeSinceLastChange > 5000) { // 5 second debounce
        Alert.alert(
          'Mode Suggestion',
          `Based on your journal, would you like to switch to ${result.suggestedMode} mode?`,
          [
            { text: 'No thanks', style: 'cancel' },
            { 
              text: 'Switch',
              onPress: () => {
                toggleMode();
                lastModeChangeTime.current = Date.now();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          ]
        );
      } else if (result.suggestedMode) {
        Alert.alert(
          'Analysis Complete',
          'Your current mode matches your mood!',
          [{ text: 'Great' }]
        );
      } else {
        Alert.alert(
          'Analysis Complete',
          "I couldn't determine a clear mode preference from your journal.",
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze your journal at the moment.',
        [{ text: 'OK' }]
      );
    } finally {
      setAnalyzing(false);
    }
  };
  
  const clearJournal = () => {
    if (journalText.length > 0) {
      Alert.alert(
        'Clear Journal',
        'Are you sure you want to clear your journal entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear',
            onPress: () => setJournalText(''),
            style: 'destructive'
          }
        ]
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Sound-Enhanced Journal</Text>
        
        <Text style={[styles.subtitle, { color: theme.text + 'CC' }]}>
          Write how you feel while the soundscape adapts to your mood
        </Text>
        
        <AudioVisualizer />
        
        <View style={[styles.journalCard, { backgroundColor: theme.card }]}>
          <TextInput
            style={[
              styles.journalInput,
              { color: theme.text }
            ]}
            placeholder="How are you feeling today?"
            placeholderTextColor={theme.text + '80'}
            multiline={true}
            value={journalText}
            onChangeText={setJournalText}
            maxLength={1000}
          />
          
          <Text style={[styles.charCount, { color: theme.text + '80' }]}>
            {journalText.length}/1000
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: theme.text + '40' }]}
              onPress={clearJournal}
            >
              <Text style={[styles.clearButtonText, { color: theme.text }]}>
                Clear
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
              onPress={handleAnalyze}
              disabled={analyzing || journalText.length < 10}
            >
              {analyzing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.analyzeButtonText}>
                  Analyze Mood
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {analysis && (
          <View style={[styles.analysisCard, { backgroundColor: theme.card }]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="analytics-outline" size={20} color={theme.primary} />
              <Text style={[styles.analysisTitle, { color: theme.text }]}>
                Analysis Results
              </Text>
            </View>
            
            <Text style={[styles.analysisText, { color: theme.text }]}>
              {analysis.suggestedMode 
                ? `Your journal suggests you're in a ${analysis.suggestedMode} mindset.` 
                : "Your journal shows a balanced mindset."}
            </Text>
            
            {analysis.suggestedMode && (
              <View style={styles.modeDescription}>
                {analysis.suggestedMode === 'growth' ? (
                  <Text style={[styles.modeText, { color: theme.text + 'CC' }]}>
                    Growth mode focuses on mindfulness, learning, and long-term improvement.
                  </Text>
                ) : (
                  <Text style={[styles.modeText, { color: theme.text + 'CC' }]}>
                    Action mode focuses on productivity, energy, and achieving immediate results.
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  journalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  journalInput: {
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontWeight: '500',
  },
  analyzeButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  analysisCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modeDescription: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000015',
  },
  modeText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  }
});