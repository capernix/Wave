// FlaskServer.ts - Service for interacting with Flask backend
import { Platform } from 'react-native';
import type { HabitType } from '../database/database';

// Use appropriate base URL depending on platform
// For Android emulator, use 10.0.2.2 instead of localhost to connect to host machine
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000' 
  : 'http://localhost:5000';

// Interface for habit data structure matching the Flask/SQLite backend
interface FlaskHabit {
  ID?: number;  // Capital ID from SQLite
  id?: number;  // Lower case id for compatibility
  Desc?: string;  // Capital Desc from SQLite
  desc?: string;  // Lower case desc for compatibility
  title?: string; // Title field for simplified API
  priority: number;
  preferences?: number;
  Prefernces?: number; // Matching the typo in the database schema
  type?: HabitType;
  Type?: HabitType; // Capital Type from SQLite
  time?: string;
  Time?: string; // Capital Time from SQLite
  remarks?: string;
  Remarks?: string; // Capital Remarks from SQLite
  days: string[];
  times: string[] | {time: string}[];
}

interface HabitCompletion {
  id?: number;
  habit_id: number;
  completed_at: number;
  notes?: string;
}

interface HabitStats {
  total: number;
  streakDays: number;
}

/**
 * Get all habits or filter by type
 * @param {string} type Optional habit type filter
 * @returns {Promise<Array>} Array of habits
 */
export const getHabits = async (type?: string): Promise<any[]> => {
  try {
    const endpoint = '/api/get_habits';
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Normalize the data structure to ensure consistency
    const normalizedData = data.map(habit => {
      // Handle the capital/lowercase field inconsistency
      return {
        id: habit.ID || habit.id,
        desc: habit.Desc || habit.desc || habit.title || '',
        priority: habit.Priority || habit.priority || 1,
        preferences: habit.Prefernces || habit.preferences || 0,
        type: habit.Type || habit.type || 'Health',
        time: habit.Time || habit.time || 'Morning',
        remarks: habit.Remarks || habit.remarks || '',
        days: Array.isArray(habit.days) ? habit.days : [],
        // Make sure times is always an array of objects with a 'time' property
        times: Array.isArray(habit.times) 
          ? typeof habit.times[0] === 'string' 
            ? habit.times.map(time => ({ time }))
            : habit.times
          : [{ time: 'Morning' }]
      };
    });
    
    return normalizedData || [];
  } catch (error) {
    console.error('Error fetching habits from Flask server:', error);
    throw error;
  }
};

/**
 * Get habit by ID
 * @param {number} habitId Habit ID
 * @returns {Promise<Object>} Habit object
 */
export const getHabitById = async (habitId: number): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/get_habit_by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ habit_id: habitId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Normalize the data structure to ensure consistency
    const normalizedHabit = {
      id: data.ID || data.id,
      desc: data.Desc || data.desc || data.title || '',
      priority: data.Priority || data.priority || 1,
      preferences: data.Prefernces || data.preferences || 0,
      type: data.Type || data.type || 'Health',
      time: data.Time || data.time || 'Morning',
      remarks: data.Remarks || data.remarks || '',
      days: Array.isArray(data.days) ? data.days : [],
      // Make sure times is always an array of objects with a 'time' property
      times: Array.isArray(data.times) 
        ? typeof data.times[0] === 'string' 
          ? data.times.map(time => ({ time }))
          : data.times
        : [{ time: 'Morning' }]
    };
    
    return normalizedHabit;
  } catch (error) {
    console.error(`Error fetching habit ${habitId}:`, error);
    throw error;
  }
};

/**
 * Create a new habit with simplified structure
 * @param {string} title Habit title
 * @param {number} priority Priority level (1-3)
 * @param {string} type Habit type (Health, Learning, Creativity, Productivity)
 * @param {Array<string>} days Days of week for the habit
 * @param {string} time Time of day for the habit (Morning, Afternoon, Evening)
 * @returns {Promise<Object>} Created habit with ID
 */
export const createSimpleHabit = async (
  title: string,
  priority: number = 1,
  type: string = 'Health',
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  time: string = 'Morning'
): Promise<any> => {
  try {
    const habitData = {
      desc: title, // Using desc field to match the backend
      title,       // Also sending title for backward compatibility
      priority,
      type,
      days,
      time,
      times: [time]  // For backward compatibility
    };
    
    const response = await fetch(`${BASE_URL}/api/create_habit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      id: data.ID || data.id,
      desc: data.Desc || data.desc || title
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

/**
 * Create a new habit (legacy method)
 * @param {Object} habit Habit data
 * @param {Array<string>} days Days of week for habit
 * @param {Array<string>} times Times of day for habit
 * @returns {Promise<Object>} Created habit with ID
 */
export const createHabit = async (
  habit: {
    desc: string;
    priority: number;
    preferences: number;
    type: string;
    time: string;
    remarks?: string;
  },
  days: string[],
  times: string[]
): Promise<any> => {
  try {
    const habitData = {
      ...habit,
      days,
      times
    };
    
    const response = await fetch(`${BASE_URL}/api/create_habit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      id: data.ID || data.id,
      desc: data.Desc || data.desc || habit.desc
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

/**
 * Update existing habit
 * @param {number} habitId Habit ID
 * @param {Object} habit Updated habit data
 * @param {Array<string>} days Updated days list
 * @param {Array<string>} times Updated times list
 * @returns {Promise<Object>} Updated habit
 */
export const updateHabit = async (
  habitId: number,
  habit: {
    desc?: string;
    priority?: number;
    preferences?: number;
    type?: string;
    time?: string;
    remarks?: string;
  },
  days?: string[],
  times?: string[]
): Promise<any> => {
  try {
    const updateData = {
      habit_id: habitId,
      ...habit,
      days,
      times,
    };
    
    const response = await fetch(`${BASE_URL}/api/update_habit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating habit ${habitId}:`, error);
    throw error;
  }
};

/**
 * Delete a habit
 * @param {number} habitId Habit ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteHabit = async (habitId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/delete_habit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ habit_id: habitId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting habit ${habitId}:`, error);
    throw error;
  }
};

/**
 * Add completion record for habit
 * @param {number} habitId Habit ID
 * @param {string} notes Optional notes about completion
 * @returns {Promise<Object>} Completion record
 */
export const addHabitCompletion = async (habitId: number, notes: string = ''): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/add_completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        habit_id: habitId,
        completed_at: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
        notes,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error adding completion for habit ${habitId}:`, error);
    throw error;
  }
};

/**
 * Get completion history for a habit
 * @param {number} habitId Habit ID
 * @returns {Promise<Array>} Array of completion records
 */
export const getHabitCompletions = async (habitId: number): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/get_completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ habit_id: habitId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error(`Error getting completions for habit ${habitId}:`, error);
    throw error;
  }
};

/**
 * Get habit statistics (days completed, streaks, etc.)
 * @param {number} habitId Habit ID
 * @returns {Promise<Object>} Habit statistics
 */
export const getHabitStats = async (habitId: number): Promise<HabitStats> => {
  try {
    // First try the new endpoint that returns structured stats
    try {
      const response = await fetch(`${BASE_URL}/api/get_stats?id=${habitId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const stats = await response.json();
        return stats;
      }
    } catch (e) {
      console.log('New stats endpoint not available, falling back to legacy endpoint');
    }
    
    // Fall back to the legacy endpoint if the new one fails
    const response = await fetch(`${BASE_URL}/api/habit_no_of_days`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ habit_id: habitId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      total: data[0] || 0,
      streakDays: Math.min(data[0] || 0, 7) // Show max streak of 7 days
    };
  } catch (error) {
    console.error(`Error getting stats for habit ${habitId}:`, error);
    return { total: 0, streakDays: 0 };
  }
};

/**
 * Check if the Flask server is running
 * @returns {Promise<boolean>} True if the server is running
 */
export const pingServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error pinging Flask server:', error);
    return false;
  }
};