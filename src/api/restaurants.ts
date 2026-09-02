import { mockApiCall } from './mockDelay';
import { Restaurant } from '../types/restaurant';
import { DUMMY_RESTAURANTS, getRestaurantById } from '../lib/dummyData';

export const restaurantsApi = {
  async getRestaurants(query?: string): Promise<Restaurant[]> {
    return mockApiCall(() => {
      if (!query?.trim()) return DUMMY_RESTAURANTS.filter(r => r.isActive);
      const q = query.toLowerCase();
      return DUMMY_RESTAURANTS.filter(
        r =>
          r.isActive &&
          (r.name.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q)))
      );
    });
  },

  async getRestaurantById(id: string): Promise<Restaurant> {
    return mockApiCall(() => {
      const restaurant = getRestaurantById(id);
      if (!restaurant) throw new Error('Restaurant not found');
      if (!restaurant.isActive) throw new Error('Restaurant is not available');
      return restaurant;
    });
  },

  async getRestaurantByQR(qrContent: string): Promise<Restaurant> {
    return mockApiCall(() => {
      // Validate QR format: restaurantapp://restaurant/{id}
      const match = qrContent.match(/^restaurantapp:\/\/restaurant\/(.+)$/);
      if (!match) throw new Error('Invalid QR code format');

      const id = match[1];
      const restaurant = getRestaurantById(id);
      if (!restaurant) throw new Error('Restaurant not found');
      if (!restaurant.isActive) throw new Error('Restaurant is not available');
      return restaurant;
    });
  },
};
