// src/utils/AudioManager.js
import { Audio } from 'expo-av';

class AudioManager {
  constructor() {
    this.soundObject = null;
    this.isPlaying = false;
    this.currentMode = null;
    this.timeOfDay = this.getTimeOfDay();
    
    // Flag to track if audio files are available
    this.hasAudioFiles = false;
    
    try {
      // Try to load audio files, but handle errors gracefully
      this._audioFiles = {
        growth: {
          morning: require('../assets/audio/growth_morning.mp3'),
          day: require('../assets/audio/growth_day.mp3'),
          evening: require('../assets/audio/growth_evening.mp3'),
          night: require('../assets/audio/growth_night.mp3'),
        },
        action: {
          morning: require('../assets/audio/action_morning.mp3'),
          day: require('../assets/audio/action_day.mp3'),
          evening: require('../assets/audio/action_evening.mp3'),
          night: require('../assets/audio/action_night.mp3'),
        }
      };
      this.hasAudioFiles = true;
      console.log('Audio files loaded successfully');
    } catch (error) {
      console.log('Audio files not found, audio functionality will be limited', error);
      this._audioFiles = null;
    }
    
    // Start time of day checking
    setInterval(() => {
      const newTimeOfDay = this.getTimeOfDay();
      if (newTimeOfDay !== this.timeOfDay) {
        this.timeOfDay = newTimeOfDay;
        if (this.isPlaying && this.currentMode) {
          this.playModeAudio(this.currentMode);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
  
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 17) return 'day';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }
  
  async playModeAudio(mode) {
    try {
      // If no audio files, just log and return
      if (!this.hasAudioFiles) {
        console.log(`Would play ${mode} audio for ${this.timeOfDay} time of day`);
        this.isPlaying = true;
        this.currentMode = mode;
        return;
      }
      
      // Stop current audio if playing
      if (this.soundObject) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
      }
      
      // Select audio file based on mode and time of day
      const audioFile = this._audioFiles[mode][this.timeOfDay];
      
      // Create and load audio
      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync(audioFile);
      await this.soundObject.setIsLoopingAsync(true);
      await this.soundObject.setVolumeAsync(0.7);
      await this.soundObject.playAsync();
      
      this.isPlaying = true;
      this.currentMode = mode;
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    }
  }
  
  async toggleAudio() {
    if (!this.soundObject && !this.hasAudioFiles) {
      // Just toggle the flag if we don't have audio files
      this.isPlaying = !this.isPlaying;
      return true;
    }
    
    if (!this.soundObject) return false;
    
    try {
      if (this.isPlaying) {
        await this.soundObject.pauseAsync();
        this.isPlaying = false;
      } else {
        await this.soundObject.playAsync();
        this.isPlaying = true;
      }
      return true;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  }
  
  async stopAudio() {
    if (!this.soundObject) {
      this.isPlaying = false;
      return;
    }
    
    try {
      await this.soundObject.stopAsync();
      await this.soundObject.unloadAsync();
      this.soundObject = null;
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }
}

export default new AudioManager();