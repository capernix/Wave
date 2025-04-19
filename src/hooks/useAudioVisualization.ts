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
  
  // Animation values - create fresh references to avoid duplication issues
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Create exactly 5 bar animations
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.7)).current;
  const bar4 = useRef(new Animated.Value(0.4)).current;
  const bar5 = useRef(new Animated.Value(0.6)).current;
  
  // Collect bars in an array for easier handling
  const barsAnim = [bar1, bar2, bar3, bar4, bar5];
  
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Start animation loops when audio is playing
  useEffect(() => {
    let animationCleanup: any = null;
    
    if (audioEnabled && isAudioPlaying) {
      setIsAnimating(true);
      
      // Different animations depending on type
      const speedMultiplier = mode === 'growth' ? 1 : 1.5;
      const amplitudeMultiplier = Math.min(1, Math.max(0.1, intensity));
      
      if (type === 'circle') {
        animationCleanup = startPulseAnimation(speedMultiplier, amplitudeMultiplier);
      } else if (type === 'bars') {
        animationCleanup = startBarsAnimation(speedMultiplier, amplitudeMultiplier);
      } else if (type === 'wave') {
        animationCleanup = startWaveAnimation(speedMultiplier, amplitudeMultiplier);
      }
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
      if (animationCleanup) {
        animationCleanup();
      }
      pulseAnim.stopAnimation();
      barsAnim.forEach(anim => anim.stopAnimation());
      waveAnim.stopAnimation();
    };
  }, [audioEnabled, isAudioPlaying, mode, type, intensity]);
  
  // Pulse animation for circle visualization
  const startPulseAnimation = (speed: number, amplitude: number) => {
    const animatePulse = () => {
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
        animatePulse();
      });
    };
    
    // Start the pulse animation
    animatePulse();
    
    // Return cleanup function
    return () => {};
  };
  
  // Bar animation for equalizer-style visualization
  const startBarsAnimation = (speed: number, amplitude: number) => {
    let shouldContinue = true;
    
    const animateBars = () => {
      if (!shouldContinue) return;
      
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
        if (shouldContinue) {
          animateBars();
        }
      });
    };
    
    // Start the bars animation
    animateBars();
    
    // Return cleanup function
    return () => {
      shouldContinue = false;
    };
  };
  
  // Wave animation
  const startWaveAnimation = (speed: number, amplitude: number) => {
    const animation = Animated.loop(
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
    );
    
    animation.start();
    
    // Return cleanup function
    return () => {
      animation.stop();
    };
  };
  
  return {
    isAnimating,
    pulseAnim,
    barsAnim,
    waveAnim
  };
};