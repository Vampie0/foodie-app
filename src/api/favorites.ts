import { mockApiCall } from './mockDelay';

// Mock in-memory favorites store (restaurantId → Set of itemIds)
const mockFavorites: Map<string, Set<string>> = new Map();

export const favoritesApi = {
  async getFavorites(restaurantId: string): Promise<string[]> {
    return mockApiCall(() => {
      return Array.from(mockFavorites.get(restaurantId) ?? []);
    });
  },

  async addFavorite(restaurantId: string, itemId: string): Promise<void> {
    return mockApiCall(() => {
      const set = mockFavorites.get(restaurantId) ?? new Set();
      set.add(itemId);
      mockFavorites.set(restaurantId, set);
    });
  },

  async removeFavorite(restaurantId: string, itemId: string): Promise<void> {
    return mockApiCall(() => {
      mockFavorites.get(restaurantId)?.delete(itemId);
    });
  },
};
