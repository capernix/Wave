import * as SQLite from 'expo-sqlite';

// Database connection - Fixed to use the correct SQLite API for newer versions
export const db = SQLite.default.openDatabase('habits.db');

// Habit type definition
export interface Habit {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  frequency?: string;
  mode: 'growth' | 'action';
  created_at: number;
}

// Completion type definition
export interface Completion {
  id?: number;
  habit_id: number;
  completed_at: number;
  notes?: string;
}

// Initialize database tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        // Create habits table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            frequency TEXT,
            mode TEXT NOT NULL,
            created_at INTEGER NOT NULL
          );`,
          [],
          () => {},
          (_, error) => {
            console.error('Error creating habits table:', error);
            reject(error);
            return false;
          }
        );
        
        // Create completions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            completed_at INTEGER NOT NULL,
            notes TEXT,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
          );`,
          [],
          () => {},
          (_, error) => {
            console.error('Error creating completions table:', error);
            reject(error);
            return false;
          }
        );
        
        // Create user preferences table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            current_mode TEXT NOT NULL,
            audio_enabled INTEGER NOT NULL,
            last_updated INTEGER NOT NULL
          );`,
          [],
          () => {},
          (_, error) => {
            console.error('Error creating user_preferences table:', error);
            reject(error);
            return false;
          }
        );
        
        // Check if preferences exist, insert default if not
        tx.executeSql(
          `SELECT * FROM user_preferences WHERE id = 1;`,
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              // Insert default preferences
              const now = Date.now();
              tx.executeSql(
                `INSERT INTO user_preferences (id, current_mode, audio_enabled, last_updated)
                 VALUES (1, ?, ?, ?);`,
                ['growth', 1, now],
                () => {
                  resolve();
                },
                (_, error) => {
                  console.error('Error inserting default preferences:', error);
                  reject(error);
                  return false;
                }
              );
            } else {
              resolve();
            }
          },
          (_, error) => {
            console.error('Error checking preferences:', error);
            reject(error);
            return false;
          }
        );
      });
    } catch (error) {
      console.error("Database initialization error:", error);
      reject(error);
    }
  });
};

// CRUD operations for habits

// Create new habit
export const createHabit = (habit: Habit): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO habits (title, description, category, frequency, mode, created_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          habit.title,
          habit.description || null,
          habit.category || null,
          habit.frequency || null,
          habit.mode,
          habit.created_at
        ],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          console.error('Error creating habit:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get all habits
export const getHabits = (mode?: 'growth' | 'action'): Promise<Habit[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = 'SELECT * FROM habits';
      const params: any[] = [];
      
      if (mode) {
        query += ' WHERE mode = ?';
        params.push(mode);
      }
      
      query += ' ORDER BY created_at DESC;';
      
      tx.executeSql(
        query,
        params,
        (_, { rows }) => {
          const habits: Habit[] = [];
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

// Get habit by ID
export const getHabitById = (id: number): Promise<Habit | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM habits WHERE id = ?;',
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error getting habit by ID:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Update habit
export const updateHabit = (habit: Habit): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!habit.id) {
      reject(new Error('Habit ID is required for update'));
      return;
    }
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE habits
         SET title = ?, description = ?, category = ?, frequency = ?, mode = ?
         WHERE id = ?;`,
        [
          habit.title,
          habit.description || null,
          habit.category || null,
          habit.frequency || null,
          habit.mode,
          habit.id
        ],
        () => {
          resolve();
        },
        (_, error) => {
          console.error('Error updating habit:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Delete habit
export const deleteHabit = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Delete related completions first
      tx.executeSql(
        'DELETE FROM completions WHERE habit_id = ?;',
        [id],
        () => {
          // Then delete the habit
          tx.executeSql(
            'DELETE FROM habits WHERE id = ?;',
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              console.error('Error deleting habit:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error deleting habit completions:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// CRUD operations for completions

// Add completion
export const addCompletion = (completion: Completion): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO completions (habit_id, completed_at, notes)
         VALUES (?, ?, ?);`,
        [
          completion.habit_id,
          completion.completed_at,
          completion.notes || null
        ],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          console.error('Error adding completion:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get completions for a habit
export const getCompletions = (habitId: number): Promise<Completion[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM completions WHERE habit_id = ? ORDER BY completed_at DESC;',
        [habitId],
        (_, { rows }) => {
          const completions: Completion[] = [];
          for (let i = 0; i < rows.length; i++) {
            completions.push(rows.item(i));
          }
          resolve(completions);
        },
        (_, error) => {
          console.error('Error getting completions:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Delete completion
export const deleteCompletion = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM completions WHERE id = ?;',
        [id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error('Error deleting completion:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get habit stats
export const getHabitStats = (habitId: number): Promise<{ total: number, streakDays: number }> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as total FROM completions WHERE habit_id = ?;',
        [habitId],
        (_, { rows }) => {
          const total = rows.item(0).total;
          
          // Calculate streak (consecutive days)
          tx.executeSql(
            `SELECT completed_at FROM completions 
             WHERE habit_id = ? 
             ORDER BY completed_at DESC;`,
            [habitId],
            (_, { rows }) => {
              let streakDays = 0;
              let lastDate: Date | null = null;
              
              for (let i = 0; i < rows.length; i++) {
                const completedDate = new Date(rows.item(i).completed_at);
                const currentDateStr = completedDate.toDateString();
                
                if (i === 0) {
                  streakDays = 1;
                  lastDate = completedDate;
                } else if (lastDate) {
                  // Check if this is a different day than the last one we counted
                  if (currentDateStr !== lastDate.toDateString()) {
                    // Check if it's the previous day
                    const dayDiff = Math.round((lastDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 1) {
                      streakDays++;
                      lastDate = completedDate;
                    } else {
                      // Break in the streak
                      break;
                    }
                  }
                }
              }
              
              resolve({ total, streakDays });
            },
            (_, error) => {
              console.error('Error calculating streak:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error getting habit stats:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Seed function to add some initial habits for testing
export const seedHabits = async (): Promise<void> => {
  try {
    // Check if we already have habits
    const existingHabits = await getHabits();
    
    // Only seed if we have no habits
    if (existingHabits.length === 0) {
      console.log('Seeding initial habits...');
      
      // Growth mode habits
      await createHabit({
        title: 'Morning Meditation',
        description: 'Start your day with 5-10 minutes of mindful meditation',
        category: 'Mindfulness',
        frequency: 'Daily',
        mode: 'growth',
        created_at: Date.now()
      });
      
      await createHabit({
        title: 'Gratitude Journal',
        description: 'Write down 3 things you are grateful for today',
        category: 'Reflection',
        frequency: 'Daily',
        mode: 'growth',
        created_at: Date.now() - 86400000 // 1 day ago
      });
      
      await createHabit({
        title: 'Read for Growth',
        description: 'Read something educational or inspiring for at least 15 minutes',
        category: 'Learning',
        frequency: 'Daily',
        mode: 'growth',
        created_at: Date.now() - 172800000 // 2 days ago
      });
      
      // Action mode habits
      await createHabit({
        title: 'Morning Exercise',
        description: '10 minutes of high-intensity exercise to start the day',
        category: 'Exercise',
        frequency: 'Daily',
        mode: 'action',
        created_at: Date.now()
      });
      
      await createHabit({
        title: 'Task Prioritization',
        description: 'List and prioritize your top 3 tasks for the day',
        category: 'Productivity',
        frequency: 'Daily',
        mode: 'action',
        created_at: Date.now() - 86400000 // 1 day ago
      });
      
      console.log('Seed completed successfully');
    } else {
      console.log('Database already contains habits, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding habits:', error);
  }
};