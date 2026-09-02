import { create } from 'zustand';
import { Restaurant } from '../types/restaurant';

interface RestaurantState {
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;

  setCurrentRestaurant: (restaurant: Restaurant) => void;
  clearCurrentRestaurant: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  currentRestaurant: null,
  isLoading: false,
  error: null,

  setCurrentRestaurant: (restaurant: Restaurant) =>
    set({ currentRestaurant: restaurant, error: null, isLoading: false }),

  clearCurrentRestaurant: () =>
    set({ currentRestaurant: null, error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error, isLoading: false }),
}));
