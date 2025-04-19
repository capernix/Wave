// SQLiteService.ts - Optional SQLite implementation based on App(1).py
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Flag to determine if we should use SQLite (true) or in-memory (false)
let USE_SQLITE = false;

// Database connection
let db: SQLite.WebSQLDatabase | null = null;

/**
 * Initialize SQLite database connection
 */
export const initSQLite = (forceSQLite = false): boolean => {
  if (!forceSQLite && Platform.OS === 'web') {
    console.log('SQLite not fully supported on web, using in-memory fallback');
    return false;
  }
  
  try {
    db = SQLite.openDatabase('wave.db');
    console.log('SQLite database connection established');
    createTables();
    USE_SQLITE = true;
    return true;
  } catch (error) {
    console.error('Error initializing SQLite:', error);
    USE_SQLITE = false;
    return false;
  }
};

/**
 * Check if SQLite is being used
 */
export const isSQLiteEnabled = (): boolean => {
  return USE_SQLITE && db !== null;
};

/**
 * Create database tables
 */
const createTables = () => {
  if (!db) return;
  
  // Create tables in a transaction
  db.transaction(tx => {
    // Create habits table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Habits (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Desc TEXT NOT NULL,
        Priority INTEGER NOT NULL,
        Prefernces INTEGER NOT NULL,
        Type TEXT NOT NULL CHECK (Type IN ('Health', 'Learning', 'Creativity', 'Productivity')),
        Time TEXT NOT NULL,
        Remarks TEXT
      );`
    );

    // Create HabitDays table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS HabitDays (
        HabitID INTEGER,
        Day TEXT CHECK (Day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
        FOREIGN KEY (HabitID) REFERENCES Habits(ID) ON DELETE CASCADE
      );`
    );

    // Create HabitTimes table - modified from App(1).py to match our schema
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS HabitTimes (
        HabitID INTEGER,
        Time TEXT CHECK (Time IN ('Morning', 'Afternoon', 'Evening')),
        No_of_days_Completed INTEGER DEFAULT 0,
        Total_no_of_days INTEGER DEFAULT 0,
        FOREIGN KEY (HabitID) REFERENCES Habits(ID) ON DELETE CASCADE
      );`
    );

    // Create completions table for tracking user behavior
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER,
        completed_at INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (habit_id) REFERENCES Habits(ID) ON DELETE CASCADE
      );`
    );
  }, 
  (error) => {
    console.error('Error creating tables:', error);
  });
};

/**
 * Insert a new habit with optional remarks
 */
export const insertHabit = async (
  desc: string, 
  priority: number, 
  preferences: number, 
  habitType: string, 
  time: string, 
  days: string[],
  times: string[],
  remarks?: string
): Promise<number | null> => {
  if (!USE_SQLITE || !db) return null;
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      // Insert the habit
      tx.executeSql(
        `INSERT INTO Habits (Desc, Priority, Prefernces, Type, Time, Remarks)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [desc, priority, preferences, habitType, time, remarks || ''],
        (_, result) => {
          const habitId = result.insertId;
          if (!habitId) {
            reject('Failed to insert habit');
            return;
          }
          
          // Insert habit days
          days.forEach(day => {
            tx.executeSql(
              'INSERT INTO HabitDays (HabitID, Day) VALUES (?, ?);',
              [habitId, day]
            );
          });
          
          // Insert habit times with default progress values
          times.forEach(timeOfDay => {
            tx.executeSql(
              'INSERT INTO HabitTimes (HabitID, Time, No_of_days_Completed, Total_no_of_days) VALUES (?, ?, ?, ?);',
              [habitId, timeOfDay, 0, 0]
            );
          });
          
          resolve(habitId);
        },
        (_, error) => {
          console.error('Error inserting habit:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Get a habit by ID
 */
export const getHabitById = async (habitId: number): Promise<any | null> => {
  if (!USE_SQLITE || !db) return null;
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Habits WHERE ID = ?;',
        [habitId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error getting habit:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Get all habits
 */
export const getAllHabits = async (): Promise<any[]> => {
  if (!USE_SQLITE || !db) return [];
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Habits;',
        [],
        (_, { rows }) => {
          const habits = [];
          for (let i = 0; i < rows.length; i++) {
            habits.push(rows.item(i));
          }
          resolve(habits);
        },
        (_, error) => {
          console.error('Error getting habits:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Update habit remarks using the AI remarker functionality
 * This is directly inspired by the Remarker function in App(1).py
 */
export const updateHabitRemark = async (habitId: number, newRemark: string): Promise<string | null> => {
  if (!USE_SQLITE || !db) return null;
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      // First get the existing remarks
      tx.executeSql(
        'SELECT Remarks FROM Habits WHERE ID = ?;',
        [habitId],
        async (_, { rows }) => {
          if (rows.length === 0) {
            reject('Habit not found');
            return;
          }
          
          const currentRemarks = rows.item(0).Remarks || '';
          
          // Use the AIService to generate a combined remark
          // This mimics the functionality of the Remarker function in App(1).py
          let combinedRemark;
          try {
            // Use our AIService for remark generation (simplified version of the LangChain implementation)
            combinedRemark = await import('./AIService').then(module => 
              module.generateHabitRemark(habitId.toString(), newRemark)
            );
          } catch (error) {
            console.error('Error generating AI remark:', error);
            // Fallback to simple concatenation if AI service fails
            combinedRemark = currentRemarks ? `${currentRemarks}. ${newRemark}` : newRemark;
            // Truncate to 20 words
            const words = combinedRemark.split(' ');
            if (words.length > 20) {
              combinedRemark = words.slice(0, 20).join(' ');
            }
          }
          
          // Update the habit with the new remarks
          tx.executeSql(
            'UPDATE Habits SET Remarks = ? WHERE ID = ?;',
            [combinedRemark, habitId],
            (_, updateResult) => {
              if (updateResult.rowsAffected > 0) {
                resolve(combinedRemark);
              } else {
                reject('Failed to update remarks');
              }
            },
            (_, error) => {
              console.error('Error updating remarks:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error getting existing remarks:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Update habit progress
 */
export const updateHabitProgress = async (habitId: number, completedDays: number, totalDays: number): Promise<boolean> => {
  if (!USE_SQLITE || !db) return false;
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      tx.executeSql(
        'UPDATE HabitTimes SET No_of_days_Completed = ?, Total_no_of_days = ? WHERE HabitID = ?;',
        [completedDays, totalDays, habitId],
        (_, { rowsAffected }) => {
          resolve(rowsAffected > 0);
        },
        (_, error) => {
          console.error('Error updating habit progress:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Get habit progress
 */
export const getHabitProgress = async (habitId: number): Promise<{completed: number, total: number} | null> => {
  if (!USE_SQLITE || !db) return null;
  
  return new Promise((resolve, reject) => {
    db?.transaction(tx => {
      tx.executeSql(
        'SELECT No_of_days_Completed, Total_no_of_days FROM HabitTimes WHERE HabitID = ?;',
        [habitId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const item = rows.item(0);
            resolve({
              completed: item.No_of_days_Completed,
              total: item.Total_no_of_days
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error getting habit progress:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};