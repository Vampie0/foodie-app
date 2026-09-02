import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../api/restaurants';
import { queryKeys } from './queryKeys';

export function useRestaurants(searchQuery = '') {
  return useQuery({
    queryKey: queryKeys.restaurantSearch(searchQuery),
    queryFn: () => restaurantsApi.getRestaurants(searchQuery || undefined),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurant(restaurantId),
    queryFn: () => restaurantsApi.getRestaurantById(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 5 * 60 * 1000,
  });
}
