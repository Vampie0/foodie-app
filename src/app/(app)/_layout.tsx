import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useRestaurantStore } from '../../stores/restaurantStore';

export default function AppLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const currentRestaurant = useRestaurantStore(s => s.currentRestaurant);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (!currentRestaurant) {
      router.replace('/(auth)/restaurant-selection');
    }
  }, [isAuthenticated, currentRestaurant]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="menu/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="checkout/index" />
      <Stack.Screen name="checkout/success" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/addresses" />
      <Stack.Screen name="profile/settings" />
      <Stack.Screen name="profile/favorites" />
      <Stack.Screen name="profile/switch-restaurant" />
      <Stack.Screen name="restaurant/qr-scanner" />
    </Stack>
  );
}
