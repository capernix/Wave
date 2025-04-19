import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAudioVisualization } from '../hooks/useAudioVisualization';

type AudioVisualizerProps = {
  type?: 'bars' | 'circle' | 'wave';
  intensity?: number;
  size?: number;
  style?: ViewStyle;
};

/**
 * A component that visualizes audio with animations
 */
const AudioVisualizer = React.memo(({
  type = 'bars',
  intensity = 0.5,
  size = 50,
  style = {},
}: AudioVisualizerProps) => {
  const { theme, mode } = useTheme();
  const { isAnimating, pulseAnim, barsAnim, waveAnim } = useAudioVisualization(type, intensity);
  
  // Calculate dimensions based on size prop
  const width = size;
  const height = size;
  
  // Render nothing if not animating
  if (!isAnimating) {
    return (
      <View style={[styles.container, style, { width, height }]} />
    );
  }
  
  // Choose color based on mode
  const visualizerColor = mode === 'growth' ? theme.primary : theme.accent;
  
  // Circle visualization (for Growth mode)
  if (type === 'circle') {
    return (
      <View style={[styles.container, style, { width, height }]}>
        <Animated.View 
          style={[
            styles.circle,
            { 
              width: width * 0.9, 
              height: height * 0.9, 
              borderRadius: width / 2,
              borderColor: visualizerColor,
              transform: [{ scale: pulseAnim }],
            },
          ]} 
        />
      </View>
    );
  }
  
  // Wave visualization
  if (type === 'wave') {
    const numPoints = 20;
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * width;
      points.push(
        <Animated.View
          key={`wave-point-${i}`}
          style={{
            position: 'absolute',
            left: x,
            bottom: height / 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: visualizerColor,
            transform: [{
              translateY: waveAnim.interpolate({
                inputRange: [0, Math.PI * 2],
                outputRange: [
                  -Math.sin(i / numPoints * Math.PI * 4) * height * 0.4,
                  Math.sin(i / numPoints * Math.PI * 4) * height * 0.4
                ]
              })
            }]
          }}
        />
      );
    }
    
    return (
      <View style={[styles.container, style, { width, height }]}>
        {points}
      </View>
    );
  }
  
  // Bars visualization (for Action mode)
  // Use the exact array length from the hook
  const BAR_COUNT = barsAnim.length;
  const barWidth = Math.max(2, width / 20);
  const barGap = Math.max(2, width / 30);
  const totalWidth = (barWidth * BAR_COUNT) + (barGap * (BAR_COUNT - 1));
  const startX = (width - totalWidth) / 2;
  const maxBarHeight = height * 0.6;
  
  // Generate one bar for each animation value
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    // Instead of animating height directly, which isn't supported by native driver,
    // use scaleY transform and a fixed height container
    bars.push(
      <View
        key={`bar-${i}`}
        style={{
          position: 'absolute',
          bottom: 0,
          left: startX + (i * (barWidth + barGap)),
          width: barWidth,
          height: maxBarHeight, // Fixed maximum height
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={{
            width: barWidth,
            height: maxBarHeight,
            backgroundColor: visualizerColor,
            borderRadius: barWidth / 2,
            transform: [{
              scaleY: barsAnim[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 1] // Scale from 10% to 100%
              })
            }],
            // Position from the bottom
            position: 'absolute',
            bottom: 0,
          }}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style, { width, height }]}>
      {bars}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle: {
    borderWidth: 2,
    opacity: 0.7,
  },
});

export default AudioVisualizer;