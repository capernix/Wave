// In-memory database implementation without SQLite dependencies
import { v4 as uuidv4 } from 'uuid';

// Database interface types - keeping these for compatibility
export interface Habit {
  id?: string;
  desc: string;
  priority: number;
  preferences: number;
  type: 'Health' | 'Learning' | 'Creativity' | 'Productivity';
  time: string;
  remarks?: string; // Added remarks field
}

export interface HabitDay {
  habitId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
}

export interface HabitTime {
  habitId: string;
  time: 'Morning' | 'Afternoon' | 'Evening';
}

export interface Completion {
  id?: string;
  habit_id: string;
  completed_at: number;
  notes?: string;
}

export type HabitType = 'Health' | 'Learning' | 'Creativity' | 'Productivity';

// In-memory storage
const inMemoryDb = {
  habits: [] as Array<Habit & { id: string }>,
  habitDays: [] as HabitDay[],
  habitTimes: [] as HabitTime[],
  completions: [] as Array<Completion & { id: string }>
};

// Initialize database (just for API compatibility)
export const initDatabase = () => {
  // No initialization needed for in-memory storage
  console.log('Using in-memory database implementation');
  return true;
};

// Get database - just for API compatibility
export const getDatabase = () => {
  return true;
};

// Initialize database tables (just for API compatibility)
export const initDatabaseTables = async (): Promise<void> => {
  // No tables to create for in-memory storage
  return Promise.resolve();
};

// Create new habit with its days and times
export const createHabit = async (habit: Habit, days: Partial<HabitDay>[], times: Partial<HabitTime>[]): Promise<string> => {
  // Generate a unique ID
  const habitId = uuidv4();
  
  // Store the habit
  inMemoryDb.habits.push({
    ...habit,
    id: habitId,
    remarks: habit.remarks || '' // Ensure remarks field exists
  });
  
  // Store habit days
  days.forEach(day => {
    inMemoryDb.habitDays.push({
      habitId,
      day: day.day as any
    });
  });
  
  // Store habit times
  times.forEach(time => {
    inMemoryDb.habitTimes.push({
      habitId,
      time: time.time as any
    });
  });
  
  return habitId;
};

// Get all habits with their associated days and times
export const getHabitsWithDetails = async (type?: HabitType): Promise<{habit: Habit, days: HabitDay[], times: HabitTime[]}[]> => {
  // Filter habits by type if provided
  const filteredHabits = type
    ? inMemoryDb.habits.filter(h => h.type === type)
    : inMemoryDb.habits;
    
  // Map habits to include days and times
  return filteredHabits.map(habit => {
    const habitId = habit.id;
    const days = inMemoryDb.habitDays.filter(d => d.habitId === habitId);
    const times = inMemoryDb.habitTimes.filter(t => t.habitId === habitId);
    
    return {
      habit,
      days,
      times
    };
  }).sort((a, b) => b.habit.priority - a.habit.priority);
};

// Get habits for a specific day and time period
export const getHabitsForDayAndTime = async (day: string, timeOfDay: string): Promise<Habit[]> => {
  // Find habit IDs that match the day
  const habitIdsForDay = inMemoryDb.habitDays
    .filter(d => d.day === day)
    .map(d => d.habitId);
  
  // Find habit IDs that match the time
  const habitIdsForTime = inMemoryDb.habitTimes
    .filter(t => t.time === timeOfDay)
    .map(t => t.habitId);
  
  // Find habits that match both day and time
  const matchingHabitIds = habitIdsForDay.filter(id => habitIdsForTime.includes(id));
  
  // Get the matching habits
  return inMemoryDb.habits
    .filter(habit => matchingHabitIds.includes(habit.id))
    .sort((a, b) => b.priority - a.priority);
};

// Add completion record for habit tracking
export const addCompletion = async (completion: Completion): Promise<string> => {
  const id = uuidv4();
  
  inMemoryDb.completions.push({
    ...completion,
    id
  });
  
  return id;
};

// Get habit completion statistics
export const getHabitStats = async (habitId: string): Promise<{ total: number, streakDays: number }> => {
  const completions = inMemoryDb.completions
    .filter(c => c.habit_id === habitId)
    .sort((a, b) => b.completed_at - a.completed_at);
  
  const total = completions.length;
  let streakDays = 0;
  let lastDate: Date | null = null;
  
  for (const completion of completions) {
    const completedDate = new Date(completion.completed_at);
    
    if (!lastDate) {
      streakDays = 1;
      lastDate = completedDate;
    } else {
      const dayDiff = Math.round((lastDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streakDays++;
        lastDate = completedDate;
      } else {
        break;
      }
    }
  }
  
  return { total, streakDays };
};

// Get aggregated habit statistics
export const getAggregatedStats = async () => {
  // Calculate type distribution
  const typeCount: Record<string, number> = {};
  inMemoryDb.habits.forEach(habit => {
    typeCount[habit.type] = (typeCount[habit.type] || 0) + 1;
  });
  
  const typeDistribution = Object.keys(typeCount).map(type => ({
    Type: type,
    count: typeCount[type]
  }));
  
  // Calculate priority distribution
  const priorityCount: Record<string, number> = {};
  inMemoryDb.habits.forEach(habit => {
    const priority = String(habit.priority);
    priorityCount[priority] = (priorityCount[priority] || 0) + 1;
  });
  
  const priorityDistribution = Object.keys(priorityCount).map(priority => ({
    Priority: Number(priority),
    count: priorityCount[priority]
  }));
  
  // Calculate completion distribution
  const completionDistribution = inMemoryDb.habits.map(habit => {
    const habitCompletions = inMemoryDb.completions.filter(c => c.habit_id === habit.id);
    
    return {
      ID: habit.id,
      Desc: habit.desc,
      completions: habitCompletions.length
    };
  });
  
  return {
    typeDistribution,
    priorityDistribution,
    completionDistribution
  };
};

// Delete habit and all related records
export const deleteHabit = async (id: string): Promise<void> => {
  // Remove habit
  const habitIndex = inMemoryDb.habits.findIndex(h => h.id === id);
  if (habitIndex !== -1) {
    inMemoryDb.habits.splice(habitIndex, 1);
  }
  
  // Remove habit days
  inMemoryDb.habitDays = inMemoryDb.habitDays.filter(d => d.habitId !== id);
  
  // Remove habit times
  inMemoryDb.habitTimes = inMemoryDb.habitTimes.filter(t => t.habitId !== id);
  
  // Remove completions
  inMemoryDb.completions = inMemoryDb.completions.filter(c => c.habit_id !== id);
};

// Seed initial habits data
export const seedHabits = async (): Promise<void> => {
  // Only seed if there are no habits
  if (inMemoryDb.habits.length === 0) {
    // Sample habits data
    const habits = [
      {
        desc: 'Morning Meditation',
        priority: 3,
        preferences: 2,
        type: 'Health' as HabitType,
        time: '07:00',
        days: ['Monday', 'Wednesday', 'Friday'],
        times: ['Morning']
      },
      {
        desc: 'Read a Book',
        priority: 2,
        preferences: 1,
        type: 'Learning' as HabitType,
        time: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        times: ['Evening']
      },
      {
        desc: 'Exercise',
        priority: 3,
        preferences: 2,
        type: 'Health' as HabitType,
        time: '18:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        times: ['Evening']
      }
    ];
    
    // Insert each habit
    for (const habit of habits) {
      const habitDays = habit.days.map(day => ({ day }));
      const habitTimes = habit.times.map(time => ({ time }));
      
      await createHabit(
        {
          desc: habit.desc,
          priority: habit.priority,
          preferences: habit.preferences,
          type: habit.type,
          time: habit.time
        },
        habitDays,
        habitTimes
      );
    }
  }
};

// Get completions for a habit
export const getCompletions = async (habitId: string): Promise<Completion[]> => {
  return inMemoryDb.completions
    .filter(c => c.habit_id === habitId)
    .sort((a, b) => b.completed_at - a.completed_at);
};

// New function to update habit remarks
export const updateHabitRemarks = async (habitId: string, newRemark: string): Promise<string | null> => {
  // Find the habit
  const habit = inMemoryDb.habits.find(h => h.id === habitId);
  
  if (!habit) {
    return null;
  }
  
  // Update remarks
  const currentRemarks = habit.remarks || '';
  
  // Simple remark combining logic
  let combinedRemarks = newRemark;
  
  if (currentRemarks) {
    // Avoid duplication by checking if new remark is already part of existing remarks
    if (!newRemark.toLowerCase().includes(currentRemarks.toLowerCase()) && 
        !currentRemarks.toLowerCase().includes(newRemark.toLowerCase())) {
      combinedRemarks = `${currentRemarks}. ${newRemark}`;
    }
  }
  
  // Truncate to 20 words max
  const words = combinedRemarks.split(' ');
  if (words.length > 20) {
    combinedRemarks = words.slice(0, 20).join(' ');
  }
  
  // Update the habit
  habit.remarks = combinedRemarks;
  
  return combinedRemarks;
};