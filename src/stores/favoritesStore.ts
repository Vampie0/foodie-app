import { create } from 'zustand';

interface FavoritesState {
  // restaurantId → Set of item IDs
  favorites: Record<string, Set<string>>;

  isFavorite: (restaurantId: string, itemId: string) => boolean;
  toggleFavorite: (restaurantId: string, itemId: string) => void;
  setFavorites: (restaurantId: string, itemIds: string[]) => void;
  clearRestaurantFavorites: (restaurantId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: {},

  isFavorite: (restaurantId: string, itemId: string) => {
    return get().favorites[restaurantId]?.has(itemId) ?? false;
  },

  toggleFavorite: (restaurantId: string, itemId: string) => {
    set(state => {
      const set_ = new Set(state.favorites[restaurantId] ?? []);
      if (set_.has(itemId)) {
        set_.delete(itemId);
      } else {
        set_.add(itemId);
      }
      return {
        favorites: { ...state.favorites, [restaurantId]: set_ },
      };
    });
  },

  setFavorites: (restaurantId: string, itemIds: string[]) => {
    set(state => ({
      favorites: { ...state.favorites, [restaurantId]: new Set(itemIds) },
    }));
  },

  clearRestaurantFavorites: (restaurantId: string) => {
    set(state => {
      const { [restaurantId]: _, ...rest } = state.favorites;
      return { favorites: rest };
    });
  },
}));
