import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModeToggleButton from '../../src/components/ModeToggleButton';
import ThemedText from '../../src/components/ThemedText';
import ThemedView from '../../src/components/ThemedView';
import { useTheme } from '../../src/context/ThemeContext';
import { generateEncouragementMessage } from '../../src/services/ApiService';

export default function HomeScreen() {
  const { theme, mode, audioEnabled, toggleAudio } = useTheme();
  const [message, setMessage] = React.useState<string>('');
  
  // Get encouragement message on load and when mode changes
  React.useEffect(() => {
    const fetchMessage = async () => {
      try {
        const encouragementMsg = await generateEncouragementMessage(mode, 0);
        setMessage(encouragementMsg);
      } catch (error) {
        console.error('Failed to fetch message:', error);
        setMessage(mode === 'growth' 
          ? 'Welcome to Growth mode.' 
          : 'Action mode activated. Let\'s get things done!');
      }
    };
    
    fetchMessage();
  }, [mode]);
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="header">Wave</ThemedText>
            <ThemedText variant="caption" style={styles.subtitle}>
              Rick & Morty Habit Tracker
            </ThemedText>
          </View>
          
          <View style={styles.modeSection}>
            <ModeToggleButton size={100} />
            
            <View style={styles.messageContainer}>
              <ThemedText style={styles.messageText}>{message}</ThemedText>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <ThemedText variant="subheader" color="primary">Today's Focus</ThemedText>
            <ThemedText>
              {mode === 'growth' 
                ? 'Focus on mindful growth activities today. Take time to reflect and develop.' 
                : 'Channel your energy into productive tasks. Take decisive action on your priorities.'}
            </ThemedText>
            
            <View style={styles.audioToggle}>
              <ThemedText variant="caption">
                Audio {audioEnabled ? 'On' : 'Off'}
              </ThemedText>
              <ThemedText 
                variant="caption" 
                color="primary" 
                style={styles.toggleText}
                onPress={toggleAudio}
              >
                {audioEnabled ? 'Turn off' : 'Turn on'}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 4,
  },
  modeSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  messageContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  messageText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoSection: {
    marginTop: 40,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  audioToggle: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});
