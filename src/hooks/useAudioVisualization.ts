import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type VisualizationType = 'circle' | 'bars' | 'wave';

/**
 * A hook that handles audio visualization animations
 * 
 * @param type The type of visualization to render
 * @param intensity How strong the animation should be (0.1-1.0)
 * @returns Animation values for visualization components
 */
export const useAudioVisualization = (
  type: VisualizationType = 'bars',
  intensity: number = 0.5
) => {
  const { mode, audioEnabled, isAudioPlaying } = useTheme();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barsAnim = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.7),
    new Animated.Value(0.4),
    new Animated.Value(0.6)
  ]).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Start animation loops when audio is playing
  useEffect(() => {
    if (audioEnabled && isAudioPlaying) {
      setIsAnimating(true);
      startAnimations();
    } else {
      setIsAnimating(false);
      // Reset animations
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      barsAnim.forEach(anim => {
        Animated.timing(anim, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
      
      Animated.timing(waveAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
    
    return () => {
      // Clean up animations
      pulseAnim.stopAnimation();
      barsAnim.forEach(anim => anim.stopAnimation());
      waveAnim.stopAnimation();
    };
  }, [audioEnabled, isAudioPlaying, mode]);
  
  // Initialize the animations
  const startAnimations = () => {
    // Adjust animation speed based on mode
    const speedMultiplier = mode === 'growth' ? 1 : 1.5;
    const amplitudeMultiplier = Math.min(1, Math.max(0.1, intensity));
    
    // Different animations depending on type
    switch (type) {
      case 'circle':
        animatePulse(speedMultiplier, amplitudeMultiplier);
        break;
      case 'bars':
        animateBars(speedMultiplier, amplitudeMultiplier);
        break;
      case 'wave':
        animateWave(speedMultiplier, amplitudeMultiplier);
        break;
      default:
        animateBars(speedMultiplier, amplitudeMultiplier);
    }
  };
  
  // Pulse animation for circle visualization
  const animatePulse = (speed: number, amplitude: number) => {
    if (!isAnimating) return;
    
    // Get random pulse size between 0.85 and 1.15
    const pulseSize = 1 + ((Math.random() * 0.3 - 0.15) * amplitude);
    const pulseDuration = (1000 + Math.random() * 500) / speed;
    
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: pulseSize,
        duration: pulseDuration,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: pulseDuration,
        useNativeDriver: true
      })
    ]).start(() => {
      if (isAnimating) {
        animatePulse(speed, amplitude);
      }
    });
  };
  
  // Bar animation for equalizer-style visualization
  const animateBars = (speed: number, amplitude: number) => {
    if (!isAnimating) return;
    
    // Animate each bar with a different random height
    const animations = barsAnim.map(anim => {
      // Random height between 0.2 and 1.0
      const barHeight = 0.2 + (Math.random() * 0.8 * amplitude);
      const barDuration = (200 + Math.random() * 300) / speed;
      
      return Animated.timing(anim, {
        toValue: barHeight,
        duration: barDuration,
        useNativeDriver: true
      });
    });
    
    // Run all animations in parallel, then call this function again
    Animated.parallel(animations).start(() => {
      if (isAnimating) {
        animateBars(speed, amplitude);
      }
    });
  };
  
  // Wave animation
  const animateWave = (speed: number, amplitude: number) => {
    if (!isAnimating) return;
    
    // Continuous loop for wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 2 * Math.PI,
          duration: 2000 / speed,
          useNativeDriver: true
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start();
  };
  
  return {
    isAnimating,
    pulseAnim,
    barsAnim,
    waveAnim
  };
};