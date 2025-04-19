import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Animated, useColorScheme } from 'react-native';

// Define theme types
type Mode = 'growth' | 'action';
type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

// Define theme colors for each mode
const themes = {
  growth: {
    primary: '#6DB193',      // Green
    background: '#F9F9F9',   // Off-White
    text: '#333333',         // Dark text
    accent: '#6DB193',       // Green accent
    card: '#FFFFFF',         // White cards
    border: '#6DB193',       // Green border
  },
  action: {
    primary: '#FF9800',      // Orange
    background: '#37474F',   // Gray
    text: '#FFFFFF',         // White text
    accent: '#FF9800',       // Orange accent
    card: '#455A64',         // Lighter gray for cards
    border: '#263238',       // Darker gray for borders
  },
};

// Audio Manager Class
class AudioManager {
  soundObject: Audio.Sound | null = null;
  isPlaying: boolean = false;
  currentMode: Mode | null = null;
  timeOfDay: TimeOfDay = 'day';
  
  async playModeAudio(mode: Mode) {
    try {
      // Stop any current audio
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }
      
      // Determine time of day for audio selection
      this.updateTimeOfDay();
      
      // Audio file naming pattern: mode_timeofday.mp3
      const audioFile = `${mode}_${this.timeOfDay}.mp3`;
      
      // Create a new sound object
      this.soundObject = new Audio.Sound();
      
      // TODO: Replace with actual audio file path when available
      // For now using a placeholder approach
      console.log(`Would load audio: ${audioFile}`);
      
      // Set audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      // Record the current mode
      this.currentMode = mode;
      this.isPlaying = true;
      
      // Actual implementation would load and play the audio like:
      // await this.soundObject.loadAsync(require(`../assets/audio/${audioFile}`));
      // await this.soundObject.setIsLoopingAsync(true);
      // await this.soundObject.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
  
  updateTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      this.timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      this.timeOfDay = 'day';
    } else if (hour >= 17 && hour < 22) {
      this.timeOfDay = 'evening';
    } else {
      this.timeOfDay = 'night';
    }
  }
  
  async pauseAudio() {
    if (this.soundObject && this.isPlaying) {
      await this.soundObject.pauseAsync();
      this.isPlaying = false;
    }
  }
  
  async resumeAudio() {
    if (this.soundObject && !this.isPlaying) {
      await this.soundObject.playAsync();
      this.isPlaying = true;
    }
  }
  
  async unloadAudio() {
    if (this.soundObject) {
      await this.soundObject.unloadAsync();
      this.soundObject = null;
      this.isPlaying = false;
    }
  }
}

// Create the audio manager instance
const audioManager = new AudioManager();

// Theme context type definition with animation values
interface ThemeContextType {
  theme: typeof themes.growth;
  animatedTheme: {
    primary: Animated.AnimatedInterpolation<string>;
    background: Animated.AnimatedInterpolation<string>;
    text: Animated.AnimatedInterpolation<string>;
    accent: Animated.AnimatedInterpolation<string>;
    card: Animated.AnimatedInterpolation<string>;
    border: Animated.AnimatedInterpolation<string>;
  };
  mode: Mode;
  timeOfDay: TimeOfDay;
  toggleMode: () => Promise<void>;
  audioEnabled: boolean;
  toggleAudio: () => void;
  isAudioPlaying: boolean;
  transitionProgress: Animated.Value;
  nativeTransitionProgress: Animated.Value; // Add this line to expose nativeTransitionProgress
  isTransitioning: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props type
interface ThemeProviderProps {
  children: ReactNode;
}

// Helper function to convert hex color to rgb
const hexToRgb = (hex: string) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

// In-memory user preferences (no SQLite)
let userPreferences = {
  currentMode: 'growth' as Mode,
  audioEnabled: true,
  lastUpdated: Date.now()
};

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<Mode>('growth');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const colorScheme = useColorScheme();
  
  // Animation values
  const transitionProgress = useRef(new Animated.Value(0)).current;
  const nativeTransitionProgress = useRef(new Animated.Value(0)).current;
  
  // Initialize from in-memory preferences
  useEffect(() => {
    try {
      // Start with defaults from in-memory object
      setMode(userPreferences.currentMode);
      setAudioEnabled(userPreferences.audioEnabled);
      
      // Initialize animated values based on current mode
      const initialValue = userPreferences.currentMode === 'growth' ? 0 : 1;
      transitionProgress.setValue(initialValue);
      nativeTransitionProgress.setValue(initialValue);
      
      // Update time of day every hour
      const timeInterval = setInterval(() => {
        updateTimeOfDay();
      }, 60 * 60 * 1000);
      
      // Start audio if enabled
      if (userPreferences.audioEnabled) {
        audioManager.playModeAudio(userPreferences.currentMode);
        setIsAudioPlaying(true);
      }
      
      return () => {
        clearInterval(timeInterval);
        audioManager.unloadAudio();
      };
    } catch (e) {
      console.error("Error initializing ThemeProvider:", e);
    }
  }, []);
  
  // Update animated values based on transition progress
  const updateAnimatedValues = (value: number) => {
    transitionProgress.setValue(value);
  };
  
  // Interpolate colors for smooth transitions using string interpolation
  const interpolateColor = (
    value: Animated.Value,
    fromColor: string,
    toColor: string
  ) => {
    return value.interpolate({
      inputRange: [0, 1],
      outputRange: [fromColor, toColor],
      extrapolate: 'clamp'
    });
  };
  
  // Create animated theme object
  const animatedTheme = {
    primary: interpolateColor(
      transitionProgress, 
      themes.growth.primary, 
      themes.action.primary
    ),
    background: interpolateColor(
      transitionProgress,
      themes.growth.background,
      themes.action.background
    ),
    text: interpolateColor(
      transitionProgress,
      themes.growth.text,
      themes.action.text
    ),
    accent: interpolateColor(
      transitionProgress,
      themes.growth.accent,
      themes.action.accent
    ),
    card: interpolateColor(
      transitionProgress,
      themes.growth.card,
      themes.action.card
    ),
    border: interpolateColor(
      transitionProgress,
      themes.growth.border,
      themes.action.border
    ),
  };
  
  // Update time of day
  const updateTimeOfDay = () => {
    const hour = new Date().getHours();
    
    let newTimeOfDay: TimeOfDay = 'day';
    if (hour >= 5 && hour < 12) {
      newTimeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      newTimeOfDay = 'day';
    } else if (hour >= 17 && hour < 22) {
      newTimeOfDay = 'evening';
    } else {
      newTimeOfDay = 'night';
    }
    
    setTimeOfDay(newTimeOfDay);
    
    // Update audio if it's playing
    if (audioEnabled && audioManager.isPlaying && audioManager.currentMode) {
      audioManager.playModeAudio(audioManager.currentMode);
    }
  };
  
  // Toggle between modes with enhanced animation
  const toggleMode = async () => {
    try {
      const newMode = mode === 'growth' ? 'action' : 'growth';
      setIsTransitioning(true);
      
      const toValue = newMode === 'growth' ? 0 : 1;
      
      // Enhanced parallel animations for smoother transitions
      const animationPromise = new Promise<void>((resolve) => {
        Animated.parallel([
          // Color transition animation
          Animated.timing(transitionProgress, {
            toValue,
            duration: 400, // Slightly faster for colors
            useNativeDriver: false,
          }),
          // Transform and opacity animations
          Animated.timing(nativeTransitionProgress, {
            toValue,
            duration: 500, // Slightly longer for movement
            useNativeDriver: true,
          })
        ]).start(({ finished }) => {
          if (finished) {
            resolve();
          }
        });
      });
      
      await animationPromise;
      
      setMode(newMode);
      setIsTransitioning(false);
      
      // Update audio when mode changes
      if (audioEnabled) {
        audioManager.playModeAudio(newMode);
        setIsAudioPlaying(true);
      }
      
      // Save to in-memory preferences
      userPreferences = {
        ...userPreferences,
        currentMode: newMode,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error during mode transition:', error);
      const newMode = mode === 'growth' ? 'action' : 'growth';
      setMode(newMode);
      setIsTransitioning(false);
      
      userPreferences = {
        ...userPreferences,
        currentMode: newMode,
        lastUpdated: Date.now()
      };
    }
  };
  
  // Toggle audio on/off
  const toggleAudio = () => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    
    if (newAudioState) {
      audioManager.playModeAudio(mode);
      setIsAudioPlaying(true);
    } else {
      audioManager.pauseAudio();
      setIsAudioPlaying(false);
    }
    
    // Save to in-memory preferences
    userPreferences = {
      ...userPreferences,
      audioEnabled: newAudioState,
      lastUpdated: Date.now()
    };
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme: themes[mode], 
      animatedTheme,
      mode,
      timeOfDay, 
      toggleMode,
      audioEnabled,
      toggleAudio,
      isAudioPlaying,
      transitionProgress,
      nativeTransitionProgress,
      isTransitioning
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export audio manager for direct access if needed
export { audioManager };

