/**
 * Centralized TanStack Query key factory.
 * All restaurant-dependent keys include restaurantId.
 */
export const queryKeys = {
  // Auth
  profile: () => ['profile'] as const,

  // Restaurants
  restaurants: () => ['restaurants'] as const,
  restaurantSearch: (query: string) => ['restaurants', 'search', query] as const,
  restaurant: (id: string) => ['restaurants', id] as const,

  // Menu (always scoped to restaurant)
  menu: (restaurantId: string) => ['menu', restaurantId] as const,
  menuCategories: (restaurantId: string) => ['menu', restaurantId, 'categories'] as const,
  menuItems: (restaurantId: string) => ['menu', restaurantId, 'items'] as const,
  menuItem: (restaurantId: string, itemId: string) =>
    ['menu', restaurantId, 'items', itemId] as const,
  menuSearch: (restaurantId: string, query: string) =>
    ['menu', restaurantId, 'search', query] as const,

  // Deals
  deals: (restaurantId: string) => ['deals', restaurantId] as const,

  // Orders
  orders: () => ['orders'] as const,
  activeOrders: () => ['orders', 'active'] as const,
  orderHistory: () => ['orders', 'history'] as const,
  order: (id: string) => ['orders', id] as const,

  // Addresses
  addresses: () => ['addresses'] as const,

  // Favorites
  favorites: (restaurantId: string) => ['favorites', restaurantId] as const,
} as const;
