import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioVisualizer from '../../src/components/AudioVisualizer';
import ThemedText from '../../src/components/ThemedText';
import ThemedView from '../../src/components/ThemedView';
import { useTheme } from '../../src/context/ThemeContext';

export default function StatsScreen() {
  const { theme, mode } = useTheme();
  
  // Placeholder stats data for demonstration
  const statsData = {
    growth: {
      totalHabits: 3,
      completions: 12,
      currentStreak: 3,
      longestStreak: 5
    },
    action: {
      totalHabits: 2,
      completions: 8,
      currentStreak: 1,
      longestStreak: 4
    }
  };
  
  // Get current mode stats
  const currentStats = mode === 'growth' ? statsData.growth : statsData.action;
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText variant="header">Stats & Progress</ThemedText>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.modeCard, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <ThemedText variant="subheader" color="primary">
              {mode === 'growth' ? 'Growth' : 'Action'} Mode
            </ThemedText>
            
            <View style={styles.visualizerContainer}>
              <AudioVisualizer 
                type={mode === 'growth' ? 'wave' : 'bars'} 
                size={100}
                intensity={0.7}
              />
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Habits"
                value={currentStats.totalHabits}
                icon="list"
              />
              <StatCard
                title="Total Completions"
                value={currentStats.completions}
                icon="check"
              />
            </View>
            
            <View style={styles.statsRow}>
              <StatCard
                title="Current Streak"
                value={`${currentStats.currentStreak} days`}
                icon="fire"
              />
              <StatCard
                title="Longest Streak"
                value={`${currentStats.longestStreak} days`}
                icon="trophy"
              />
            </View>
          </View>
          
          <View style={styles.modeToggleSection}>
            <ThemedText variant="subheader">View Stats For</ThemedText>
            <View style={styles.modeButtons}>
              <View 
                style={[
                  styles.modeButton, 
                  { 
                    backgroundColor: mode === 'growth' ? theme.primary : 'rgba(255,255,255,0.05)',
                    borderWidth: mode === 'growth' ? 0 : 1,
                    borderColor: theme.border
                  }
                ]}
              >
                <ThemedText style={{ color: mode === 'growth' ? '#fff' : theme.text }}>Growth</ThemedText>
              </View>
              
              <View 
                style={[
                  styles.modeButton, 
                  { 
                    backgroundColor: mode === 'action' ? theme.accent : 'rgba(255,255,255,0.05)',
                    borderWidth: mode === 'action' ? 0 : 1,
                    borderColor: theme.border
                  }
                ]}
              >
                <ThemedText style={{ color: mode === 'action' ? '#fff' : theme.text }}>Action</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.placeholder}>
            <ThemedText style={{ textAlign: 'center', opacity: 0.6 }}>
              More detailed statistics and charts will be available in future updates!
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// Stat card component
type StatCardIcon = 'list' | 'check' | 'fire' | 'trophy';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: StatCardIcon;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.statIconContainer}>
        <FontAwesome name={icon} size={24} color={theme.primary} />
      </View>
      <ThemedText variant="body" style={styles.statValue}>{value}</ThemedText>
      <ThemedText variant="caption">{title}</ThemedText>
    </View>
  );
};

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
    paddingBottom: 40,
  },
  modeCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  visualizerContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  modeToggleSection: {
    marginBottom: 20,
  },
  modeButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  placeholder: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
});