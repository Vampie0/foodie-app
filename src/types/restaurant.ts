import { RestaurantTheme } from '../theme/theme';

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage?: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  theme: RestaurantTheme;
  primaryColor: string;
  openingHours: OpeningHours;
  isOpen: boolean;
  estimatedDeliveryTime: string; // "25-35 min"
  currency: string;
  taxRate: number; // 0.05 = 5%
  deliveryFee: number;
  minimumOrderAmount: number;
  rating: number;
  reviewCount: number;
  categories: Category[];
  menuItems: MenuItem[];
  deals: Deal[];
  isActive: boolean;
  distance?: number; // km
  tags: string[];
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  isAvailable: boolean;
}

export interface Variant {
  id: string;
  name: string; // e.g. "Small", "Regular", "Large"
  priceModifier: number; // adds to base price
  isDefault: boolean;
}

export interface VariantGroup {
  id: string;
  name: string; // e.g. "Size"
  isRequired: boolean;
  variants: Variant[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface AddOnGroup {
  id: string;
  name: string; // e.g. "Extras", "Sauces"
  isRequired: boolean;
  maxSelections: number;
  addOns: AddOn[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  image?: string;
  basePrice: number;
  calories?: number;
  prepTimeMinutes?: number;
  isAvailable: boolean;
  isPopular: boolean;
  isNew: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  variantGroups: VariantGroup[];
  addOnGroups: AddOnGroup[];
  tags: string[];
  sortOrder: number;
  allergens?: string[];
}

export type DealType = 'percentage' | 'fixed' | 'bogo' | 'free_delivery';

export interface Deal {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  image?: string;
  type: DealType;
  value: number; // percentage or fixed amount
  minOrderAmount?: number;
  couponCode?: string;
  validFrom: string; // ISO date
  validTo: string; // ISO date
  isActive: boolean;
  applicableItemIds?: string[]; // empty = all items
  usageLimit?: number;
  usageCount?: number;
}
