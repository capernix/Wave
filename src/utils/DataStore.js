// src/utils/DataStore.js
import { v4 as uuidv4 } from 'uuid';

class DataStore {
  constructor() {
    this._habits = [];
    this._completions = [];
    this._preferences = { 
      currentMode: 'growth',
      habitPreferences: {} // Store user preferences for habits
    };
    
    // Initialize with empty data instead of mock data
    this.initializeEmptyData();
  }
  
  initializeEmptyData() {
    this._habits = [];
    this._completions = [];
    this._preferences = { 
      currentMode: 'growth',
      habitPreferences: {}
    };
  }
  
  // HABITS - Completely remade implementation
  getAllHabits() {
    return [...this._habits];
  }
  
  getHabitsByMode(mode) {
    return this._habits.filter(habit => habit.mode === mode);
  }
  
  getHabitById(id) {
    return this._habits.find(habit => habit.id === id);
  }
  
  // Delete all habits and associated data
  deleteAllHabits() {
    this._habits = [];
    this._completions = [];
    this._preferences.habitPreferences = {};
    return true;
  }
  
  // Create a new habit with preferences and priorities
  createHabit(habitData) {
    if (!habitData.title) {
      throw new Error("Title is required for a new habit");
    }
    
    const newHabit = {
      id: uuidv4(),
      title: habitData.title,
      description: habitData.description || '',
      category: habitData.category || 'general',
      frequency: habitData.frequency || 'daily', // Default to daily
      mode: habitData.mode || this._preferences.currentMode,
      priority: habitData.priority || 'medium', // Default to medium priority
      createdAt: Date.now(),
      lastCompletedAt: null
    };
    
    // Add day of week selections for weekly habits
    if (habitData.frequency === 'weekly' && habitData.daysOfWeek) {
      newHabit.daysOfWeek = habitData.daysOfWeek;
    }
    
    this._habits.push(newHabit);
    
    // If preferences are provided, save them
    if (habitData.preferences) {
      this.setHabitPreferences(newHabit.id, habitData.preferences);
    }
    
    return newHabit;
  }
  
  updateHabit(id, updates) {
    const index = this._habits.findIndex(h => h.id === id);
    if (index === -1) return null;
    
    this._habits[index] = { ...this._habits[index], ...updates };
    return this._habits[index];
  }
  
  deleteHabit(id) {
    const index = this._habits.findIndex(h => h.id === id);
    if (index === -1) return false;
    
    this._habits.splice(index, 1);
    // Also delete related completions and preferences
    this._completions = this._completions.filter(c => c.habitId !== id);
    if (this._preferences.habitPreferences[id]) {
      delete this._preferences.habitPreferences[id];
    }
    return true;
  }
  
  // COMPLETIONS
  completeHabit(habitId, notes = '') {
    const habit = this.getHabitById(habitId);
    if (!habit) return null;
    
    const now = Date.now();
    const newCompletion = {
      id: uuidv4(),
      habitId,
      completedAt: now,
      notes
    };
    
    // Update last completed date on the habit
    this.updateHabit(habitId, { lastCompletedAt: now });
    
    this._completions.push(newCompletion);
    return newCompletion;
  }
  
  getCompletionsForHabit(habitId) {
    return this._completions.filter(c => c.habitId === habitId);
  }
  
  getTodayCompletions() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    return this._completions.filter(c => 
      c.completedAt >= startOfDay.getTime()
    );
  }
  
  // Enhanced HABIT PREFERENCES
  getHabitPreferences(habitId) {
    return this._preferences.habitPreferences[habitId] || null;
  }
  
  setHabitPreferences(habitId, preferences) {
    if (!this.getHabitById(habitId)) return false;
    
    this._preferences.habitPreferences[habitId] = {
      idealTimeOfDay: preferences.idealTimeOfDay || '',
      suggestedDuration: preferences.suggestedDuration || null,
      notes: preferences.notes || '',
      priority: preferences.priority || 'medium',
      updatedAt: Date.now()
    };
    
    return true;
  }
  
  // Update habit with new preferences
  updateHabitWithPreferences(habitId, habitData, preferences) {
    // First update the habit
    const updatedHabit = this.updateHabit(habitId, habitData);
    if (!updatedHabit) return null;
    
    // Then update the preferences
    this.setHabitPreferences(habitId, preferences);
    
    return updatedHabit;
  }
  
  // Check if a habit is due today based on frequency and last completion
  isHabitDueToday(habitId) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // For weekly habits, check if today is a scheduled day
    if (habit.frequency === 'weekly' && habit.daysOfWeek) {
      if (!habit.daysOfWeek.includes(dayOfWeek)) {
        return false; // Not scheduled for today
      }
    }
    
    // If never completed, it's due
    if (!habit.lastCompletedAt) return true;
    
    // Check if already completed today
    const lastCompletedDate = new Date(habit.lastCompletedAt);
    if (lastCompletedDate.toDateString() === today.toDateString()) {
      return false;
    }
    
    // Daily habits are always due if not completed today
    if (habit.frequency === 'daily') {
      return true;
    }
    
    // For weekly habits that are scheduled today
    if (habit.frequency === 'weekly') {
      return true; // If it's scheduled today and not completed today, it's due
    }
    
    // For biweekly habits
    if (habit.frequency === 'biweekly') {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);
      return habit.lastCompletedAt < twoWeeksAgo.getTime();
    }
    
    // For monthly habits
    if (habit.frequency === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return habit.lastCompletedAt < oneMonthAgo.getTime();
    }
    
    return true;
  }
  
  // Get habits due today
  getHabitsDueToday() {
    return this._habits.filter(habit => this.isHabitDueToday(habit.id));
  }
  
  // Get habits by priority
  getHabitsByPriority(priority) {
    return this._habits.filter(habit => habit.priority === priority);
  }
  
  // USER PREFERENCES
  getCurrentMode() {
    return this._preferences.currentMode;
  }
  
  updateCurrentMode(mode) {
    if (mode !== 'growth' && mode !== 'action') {
      return false;
    }
    
    this._preferences.currentMode = mode;
    return true;
  }
  
  // SAVE/LOAD (could use AsyncStorage later)
  saveToStorage() {
    // For future implementation with AsyncStorage
    console.log('Data would be saved to storage if implemented');
    return true;
  }
  
  loadFromStorage() {
    // For future implementation with AsyncStorage
    console.log('Data would be loaded from storage if implemented');
    return true;
  }
}

export default new DataStore();