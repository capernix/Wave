import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../../src/components/ThemedText';
import ThemedView from '../../src/components/ThemedView';
import { useTheme } from '../../src/context/ThemeContext';
import { analyzeMood } from '../../src/services/ApiService';

export default function JournalScreen() {
  const { theme, mode, toggleMode } = useTheme();
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [suggestedMode, setSuggestedMode] = useState<'growth' | 'action' | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  // Analyze the journal entry
  const handleAnalyze = async () => {
    if (!journalEntry.trim()) return;
    
    try {
      setAnalyzing(true);
      
      // Call API to analyze mood
      const moodResult = await analyzeMood(journalEntry);
      
      setSuggestedMode(moodResult.suggestedMode);
      setConfidence(moodResult.confidence);
      setAnalysis(moodResult.analysis);
    } catch (error) {
      console.error('Failed to analyze journal:', error);
      setAnalysis('Unable to analyze your entry. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Switch to the suggested mode
  const switchToSuggestedMode = async () => {
    if (suggestedMode && suggestedMode !== mode) {
      await toggleMode();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText variant="header">Journal</ThemedText>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.journalInput,
                { 
                  color: theme.text,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: theme.border
                }
              ]}
              placeholder="How are you feeling today? What's on your mind?"
              placeholderTextColor="rgba(128, 128, 128, 0.6)"
              multiline
              value={journalEntry}
              onChangeText={setJournalEntry}
            />
          </View>

          {analysis ? (
            <View style={[styles.analysisContainer, { borderColor: theme.border }]}>
              <ThemedText variant="subheader" color="primary">Analysis</ThemedText>
              <ThemedText style={styles.analysisText}>{analysis}</ThemedText>
              
              {suggestedMode && (
                <View style={styles.modeRecommendation}>
                  <ThemedText>
                    Based on your entry, we recommend {suggestedMode.toUpperCase()} mode.
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.confidenceText}>
                    Confidence: {Math.round(confidence * 100)}%
                  </ThemedText>
                  
                  {suggestedMode !== mode && (
                    <TouchableOpacity
                      style={[
                        styles.switchModeButton,
                        { backgroundColor: suggestedMode === 'growth' ? theme.primary : theme.accent }
                      ]}
                      onPress={switchToSuggestedMode}
                    >
                      <ThemedText style={{ color: '#fff' }}>
                        Switch to {suggestedMode.toUpperCase()}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.analyzeButton, { backgroundColor: mode === 'growth' ? theme.primary : theme.accent }]}
          onPress={handleAnalyze}
          disabled={analyzing || !journalEntry.trim()}
        >
          <ThemedText style={styles.buttonText}>
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  journalInput: {
    height: 200,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  analysisContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  analysisText: {
    marginVertical: 10,
  },
  modeRecommendation: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  confidenceText: {
    marginTop: 4,
    opacity: 0.7,
  },
  switchModeButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButton: {
    margin: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});