import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';

import { QueryProvider } from '../providers/QueryProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ToastProvider } from '../components/ui/Toast';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useUIStore } from '../stores/uiStore';

// Prevent auto-hide until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const currentRestaurant = useRestaurantStore(s => s.currentRestaurant);
  const colorScheme = useUIStore(s => s.colorScheme);

  useEffect(() => {
    // Hide splash once layout is mounted
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider
            primaryColor={currentRestaurant?.primaryColor ?? '#FF6B35'}
            colorSchemeOverride={colorScheme}
          >
            <ToastProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
