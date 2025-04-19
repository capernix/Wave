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
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  type = 'bars',
  intensity = 0.5,
  size = 50,
  style = {},
}) => {
  const { theme, mode } = useTheme();
  const { isAnimating, pulseAnim, barsAnim, waveAnim } = useAudioVisualization(type, intensity);
  
  // Calculate dimensions based on size prop
  const width = size;
  const height = size;
  const barWidth = Math.max(3, width / 10);
  const barGap = Math.max(2, width / 20);
  
  // Render nothing if not animating
  if (!isAnimating) {
    return (
      <View style={[styles.container, style, { width, height }]} />
    );
  }
  
  // Choose color based on mode
  const visualizerColor = mode === 'growth' ? theme.primary : theme.accent;
  
  // Render based on visualization type
  if (type === 'circle') {
    return (
      <View style={[styles.container, style, { width, height }]}>
        <Animated.View 
          style={[
            styles.circle,
            { 
              width, 
              height, 
              borderRadius: width / 2,
              borderColor: visualizerColor,
              transform: [{ scale: pulseAnim }],
            },
          ]} 
        />
      </View>
    );
  }
  
  if (type === 'wave') {
    // Create wave points
    const numPoints = 20;
    const points = Array.from({ length: numPoints }, (_, i) => {
      const x = (i / (numPoints - 1)) * width;
      return (
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
    });
    
    return (
      <View style={[styles.container, style, { width, height }]}>
        {points}
      </View>
    );
  }
  
  // Default: bars visualization
  const totalBarsWidth = (barWidth * barsAnim.length) + (barGap * (barsAnim.length - 1));
  const startX = (width - totalBarsWidth) / 2;
  
  return (
    <View style={[styles.container, style, { width, height }]}>
      {barsAnim.map((anim, index) => (
        <Animated.View
          key={`bar-${index}`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: startX + index * (barWidth + barGap),
            width: barWidth,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [height * 0.1, height]
            }),
            backgroundColor: visualizerColor,
            borderRadius: barWidth / 2,
          }}
        />
      ))}
    </View>
  );
};

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