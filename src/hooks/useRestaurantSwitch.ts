import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useCartStore } from '../stores/cartStore';
import { restaurantsApi } from '../api/restaurants';
import { queryKeys } from '../queries/queryKeys';

/**
 * Handles the full restaurant switch flow:
 * 1. Clear old restaurant-scoped cart
 * 2. Invalidate old restaurant queries
 * 3. Fetch new restaurant
 * 4. Apply new theme
 * 5. Reset navigation to new restaurant Home
 */
export function useRestaurantSwitch() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setCurrentRestaurant, currentRestaurant, setLoading, setError } =
    useRestaurantStore();
  const { clearCart, setActiveRestaurant } = useCartStore();

  const switchToRestaurant = useCallback(
    async (newRestaurantId: string) => {
      const oldId = currentRestaurant?.id;

      // Clear old restaurant data
      if (oldId) {
        clearCart(oldId);
        queryClient.removeQueries({ queryKey: queryKeys.menu(oldId) });
        queryClient.removeQueries({ queryKey: queryKeys.deals(oldId) });
        queryClient.removeQueries({ queryKey: queryKeys.favorites(oldId) });
      }

      setLoading(true);
      setError(null);

      try {
        const restaurant = await restaurantsApi.getRestaurantById(newRestaurantId);
        setCurrentRestaurant(restaurant);
        setActiveRestaurant(newRestaurantId, restaurant.taxRate, restaurant.deliveryFee);

        // Navigate to new restaurant home, replacing history so back doesn't return to old restaurant
        router.replace('/(app)/(tabs)');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      }
    },
    [currentRestaurant, clearCart, queryClient, setCurrentRestaurant, setActiveRestaurant, setLoading, setError, router]
  );

  return { switchToRestaurant };
}
