import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '../src/context/ThemeContext';
import { initDatabase, seedHabits } from '../src/database/database';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // Initialize the database and seed initial data
      const setupDatabase = async () => {
        try {
          await initDatabase();
          await seedHabits(); // Seed some initial habits if needed
          console.log('Database initialized successfully');
        } catch (error) {
          console.error('Error initializing database:', error);
        }
        // Hide splash screen after database is initialized
        SplashScreen.hideAsync();
      };
      
      setupDatabase();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
