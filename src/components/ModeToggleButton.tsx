import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AudioVisualizer from './AudioVisualizer';

type ModeToggleButtonProps = {
  size?: number;
  onPress?: () => void;
};

/**
 * Button for toggling between Growth and Action modes with smooth animations
 */
const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({
  size = 80,
  onPress
}) => {
  const { theme, mode, toggleMode, audioEnabled, transitionProgress, isTransitioning, animatedTheme } = useTheme();
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotationAnim = useRef(new Animated.Value(0)).current;
  
  // Update animations when mode changes or transition occurs
  useEffect(() => {
    // Start rotation animation when transitioning
    if (isTransitioning) {
      // Button press effect - shrink and grow
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]).start();
      
      // Rotation animation - Fixed for Android compatibility
      // Get current value safely for Android
      let currentRotation = 0;
      rotateAnim.addListener(({ value }) => {
        currentRotation = value;
      });
      
      Animated.timing(rotateAnim, {
        toValue: currentRotation + 1,
        duration: 600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      // Icon flip animation
      Animated.timing(iconRotationAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        // Reset for next animation after completing
        iconRotationAnim.setValue(0);
      });
    }
  }, [isTransitioning, mode]);
  
  // Scale animation for press effect
  const handlePress = () => {
    // Make sure toggleMode is called even if animation fails
    if (onPress) {
      onPress();
    } else {
      toggleMode();
    }
    
    // Then animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Get icon based on current mode
  const getIcon = () => {
    if (mode === 'growth') {
      return 'leaf';
    } else {
      return 'bolt';
    }
  };
  
  // Calculate sizes based on provided size prop
  const buttonSize = size;
  const iconSize = size * 0.4;
  
  // Animated rotation interpolation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Animated icon rotation - flips the icon during transition
  const iconRotation = iconRotationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg']
  });
  
  // Interpolate the background color
  const backgroundColor = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.primary, theme.accent]
  });
  
  // Separate transforms for better Android compatibility
  const rotateTransform = { transform: [{ rotate: rotation }] };
  const scaleTransform = { transform: [{ scale: scaleAnim }] };
  const iconTransform = { transform: [{ rotateY: iconRotation }] };
  
  return (
    <View style={styles.container}>
      {/* Use nested Animated.Views for better Android compatibility */}
      <Animated.View style={scaleTransform}>
        <Animated.View style={rotateTransform}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            disabled={isTransitioning}
            style={[
              styles.button,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: backgroundColor
              }
            ]}
          >
            {/* Icon */}
            <Animated.View style={[
              styles.iconContainer,
              iconTransform,
              { backgroundColor: mode === 'growth' ? theme.primary : theme.accent }
            ]}>
              <FontAwesome 
                name={getIcon()} 
                size={iconSize} 
                color="#fff" 
              />
            </Animated.View>
            
            {/* Audio Visualizer */}
            {audioEnabled && (
              <View style={[
                styles.audioVisualizerContainer,
                mode === 'action' && styles.actionVisualizerContainer
              ]}>
                <AudioVisualizer 
                  key={`visualizer-${mode}`}
                  type={mode === 'growth' ? 'circle' : 'bars'}
                  size={buttonSize * 1.1}
                  intensity={0.7}
                />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      
      <Animated.Text style={[
        styles.modeText, 
        { color: animatedTheme.text }
      ]}>
        {mode === 'growth' ? 'GROWTH' : 'ACTION'}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden', // Important - constrains visualizer within the button
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'transparent', // Make sure this is transparent to let the button color show through
  },
  audioVisualizerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  actionVisualizerContainer: {
    bottom: -15, // Adjust for the bars visualizer to center it
  },
  modeText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  }
});

export default ModeToggleButton;