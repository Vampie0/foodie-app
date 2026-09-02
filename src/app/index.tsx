import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useRestaurantStore } from '../stores/restaurantStore';

/**
 * Root redirect — determines where to send the user on launch.
 * Auth logic is centralized here, not scattered across layouts.
 */
export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const currentRestaurant = useRestaurantStore(s => s.currentRestaurant);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!currentRestaurant) {
    return <Redirect href="/(auth)/restaurant-selection" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
