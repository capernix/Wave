import { Account, Client, Databases, ID } from 'appwrite';

const client = new Client()
.setEndpoint('https://syd.cloud.appwrite.io/v1')
.setProject('68012f0e001c7a8ad83d')
.setPlatform('com.vectors.wave'); // Replace with your actual project ID

export const account = new Account(client);
export const databases = new Databases(client);

// Database ID
export const DATABASE_ID = 'wave-db';

// Collection IDs
export const HABITS_COLLECTION = 'habits';
export const HABIT_DAYS_COLLECTION = 'habit_days';
export const HABIT_TIMES_COLLECTION = 'habit_times';
export const COMPLETIONS_COLLECTION = 'completions';
export const JOURNAL_COLLECTION = 'journals';

// Export ID for convenience
export { ID };

