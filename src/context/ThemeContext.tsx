import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define theme types
type Mode = 'growth' | 'action';
type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

// Define theme colors for each mode
const themes = {
  growth: {
    primary: '#8BC34A',
    background: '#F5F8F2',
    text: '#333333',
    accent: '#4CAF50',
    card: '#FFFFFF',
    border: '#DCEDC8',
  },
  action: {
    primary: '#FF5722',
    background: '#2B2B2B',
    text: '#F5F5F5',
    accent: '#FF9800',
    card: '#3E3E3E',
    border: '#4A4A4A',
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

// Theme context type definition
interface ThemeContextType {
  theme: typeof themes.growth;
  mode: Mode;
  timeOfDay: TimeOfDay;
  toggleMode: () => Promise<void>;
  audioEnabled: boolean;
  toggleAudio: () => void;
  isAudioPlaying: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props type
interface ThemeProviderProps {
  children: ReactNode;
}

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
  const colorScheme = useColorScheme();
  
  // Initialize from in-memory preferences
  useEffect(() => {
    try {
      // Start with defaults from in-memory object
      setMode(userPreferences.currentMode);
      setAudioEnabled(userPreferences.audioEnabled);
      
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
  
  // Toggle between modes
  const toggleMode = async () => {
    const newMode = mode === 'growth' ? 'action' : 'growth';
    setMode(newMode);
    
    // Update audio when mode changes
    if (audioEnabled) {
      await audioManager.playModeAudio(newMode);
      setIsAudioPlaying(true);
    }
    
    // Save to in-memory preferences
    userPreferences = {
      ...userPreferences,
      currentMode: newMode,
      lastUpdated: Date.now()
    };
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
      mode,
      timeOfDay, 
      toggleMode,
      audioEnabled,
      toggleAudio,
      isAudioPlaying
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

