import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Simple chart component implementation without external dependencies
const SimpleBarChart = ({ data, maxValue, barColor }: { 
  data: { label: string; value: number }[];
  maxValue: number;
  barColor: string;
}) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <ThemedText style={styles.barLabel}>{item.label}</ThemedText>
          <View style={styles.barWrapper}>
            <View 
              style={{
                backgroundColor: barColor,
                height: 20,
                width: `${(item.value / maxValue) * 100}%`,
                borderRadius: 4
              }} 
            />
          </View>
          <ThemedText style={styles.barValue}>{item.value}</ThemedText>
        </View>
      ))}
    </View>
  );
};

export default function StatsScreen() {
  const accentColor = useThemeColor({}, 'tint');
  
  // Sample data for the chart
  const weeklyData = [
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 5 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 7 },
    { label: 'Sat', value: 3 },
    { label: 'Sun', value: 2 },
  ];
  
  // Find the max value for scaling the bars
  const maxValue = Math.max(...weeklyData.map(item => item.value));

  // Data for type distribution chart
  const typeData = [
    { label: 'Health', value: 5 },
    { label: 'Learning', value: 3 },
    { label: 'Creativity', value: 2 },
    { label: 'Productivity', value: 4 },
  ];
  
  const maxTypeValue = Math.max(...typeData.map(item => item.value));

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>Your Progress</ThemedText>
        
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Weekly Activity</ThemedText>
          <SimpleBarChart 
            data={weeklyData} 
            maxValue={maxValue} 
            barColor={accentColor} 
          />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Habit Types</ThemedText>
          <SimpleBarChart 
            data={typeData} 
            maxValue={maxTypeValue} 
            barColor={accentColor} 
          />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Weekly Summary</ThemedText>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Total Habits Completed</ThemedText>
            <ThemedText style={styles.statValue}>21</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Streak Days</ThemedText>
            <ThemedText style={styles.statValue}>5</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Completion Rate</ThemedText>
            <ThemedText style={styles.statValue}>87%</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 40,
    marginRight: 8,
    fontSize: 12,
  },
  barWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    width: 20,
    textAlign: 'right',
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});