import { create } from 'zustand';
import { Cart, CartItem, CartCoupon } from '../types/cart';
import { SelectedVariant, SelectedAddOn } from '../types/cart';
import {
  calculateUnitPrice,
  calculateItemTotal,
  calculateCartPricing,
  roundMoney,
} from '../utils/money';

interface CartState {
  carts: Record<string, Cart>; // restaurantId → Cart
  activeRestaurantId: string | null;

  // Computed
  getCart: (restaurantId: string) => Cart;
  getActiveCart: () => Cart | null;

  // Actions
  setActiveRestaurant: (restaurantId: string, taxRate: number, deliveryFee: number) => void;
  addItem: (
    restaurantId: string,
    item: {
      menuItemId: string;
      name: string;
      image?: string;
      basePrice: number;
      selectedVariants: SelectedVariant[];
      selectedAddOns: SelectedAddOn[];
      quantity: number;
      notes?: string;
    },
    taxRate: number,
    deliveryFee: number
  ) => void;
  removeItem: (restaurantId: string, cartItemId: string, taxRate: number, deliveryFee: number) => void;
  updateQuantity: (restaurantId: string, cartItemId: string, quantity: number, taxRate: number, deliveryFee: number) => void;
  updateNotes: (restaurantId: string, cartItemId: string, notes: string) => void;
  applyCoupon: (restaurantId: string, coupon: CartCoupon, taxRate: number, deliveryFee: number) => void;
  removeCoupon: (restaurantId: string, taxRate: number, deliveryFee: number) => void;
  clearCart: (restaurantId: string) => void;
  clearAllCarts: () => void;
}

function makeEmptyCart(restaurantId: string): Cart {
  return {
    restaurantId,
    items: [],
    coupon: undefined,
    subtotal: 0,
    taxAmount: 0,
    deliveryFee: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,
  };
}

function recalcCart(cart: Cart, taxRate: number, deliveryFee: number): Cart {
  const pricing = calculateCartPricing(
    cart.items,
    taxRate,
    deliveryFee,
    cart.coupon?.discountAmount ?? 0
  );
  return {
    ...cart,
    ...pricing,
    itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  carts: {},
  activeRestaurantId: null,

  getCart: (restaurantId: string) => {
    return get().carts[restaurantId] ?? makeEmptyCart(restaurantId);
  },

  getActiveCart: () => {
    const id = get().activeRestaurantId;
    if (!id) return null;
    return get().carts[id] ?? null;
  },

  setActiveRestaurant: (restaurantId: string, taxRate: number, deliveryFee: number) => {
    set(state => {
      const existing = state.carts[restaurantId] ?? makeEmptyCart(restaurantId);
      return {
        activeRestaurantId: restaurantId,
        carts: {
          ...state.carts,
          [restaurantId]: recalcCart(existing, taxRate, deliveryFee),
        },
      };
    });
  },

  addItem: (restaurantId, itemData, taxRate, deliveryFee) => {
    set(state => {
      const cart = state.carts[restaurantId] ?? makeEmptyCart(restaurantId);

      const unitPrice = calculateUnitPrice({
        id: '',
        restaurantId,
        ...itemData,
      });
      const totalPrice = calculateItemTotal(unitPrice, itemData.quantity);

      // Check if same item + same variants/addons already in cart
      const existingIdx = cart.items.findIndex(
        i =>
          i.menuItemId === itemData.menuItemId &&
          JSON.stringify(i.selectedVariants) === JSON.stringify(itemData.selectedVariants) &&
          JSON.stringify(i.selectedAddOns) === JSON.stringify(itemData.selectedAddOns)
      );

      let newItems: CartItem[];
      if (existingIdx >= 0) {
        newItems = cart.items.map((item, idx) => {
          if (idx === existingIdx) {
            const newQty = item.quantity + itemData.quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: calculateItemTotal(item.unitPrice, newQty),
              notes: itemData.notes ?? item.notes,
            };
          }
          return item;
        });
      } else {
        const newItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          restaurantId,
          menuItemId: itemData.menuItemId,
          name: itemData.name,
          image: itemData.image,
          basePrice: itemData.basePrice,
          selectedVariants: itemData.selectedVariants,
          selectedAddOns: itemData.selectedAddOns,
          quantity: itemData.quantity,
          notes: itemData.notes,
          unitPrice,
          totalPrice,
        };
        newItems = [...cart.items, newItem];
      }

      const updatedCart = recalcCart(
        { ...cart, items: newItems },
        taxRate,
        deliveryFee
      );

      return {
        carts: { ...state.carts, [restaurantId]: updatedCart },
      };
    });
  },

  removeItem: (restaurantId, cartItemId, taxRate, deliveryFee) => {
    set(state => {
      const cart = state.carts[restaurantId];
      if (!cart) return state;

      const newItems = cart.items.filter(i => i.id !== cartItemId);
      const updatedCart = recalcCart(
        { ...cart, items: newItems },
        taxRate,
        deliveryFee
      );

      return { carts: { ...state.carts, [restaurantId]: updatedCart } };
    });
  },

  updateQuantity: (restaurantId, cartItemId, quantity, taxRate, deliveryFee) => {
    set(state => {
      const cart = state.carts[restaurantId];
      if (!cart) return state;

      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = cart.items.filter(i => i.id !== cartItemId);
      } else {
        newItems = cart.items.map(item =>
          item.id === cartItemId
            ? {
                ...item,
                quantity,
                totalPrice: calculateItemTotal(item.unitPrice, quantity),
              }
            : item
        );
      }

      const updatedCart = recalcCart(
        { ...cart, items: newItems },
        taxRate,
        deliveryFee
      );

      return { carts: { ...state.carts, [restaurantId]: updatedCart } };
    });
  },

  updateNotes: (restaurantId, cartItemId, notes) => {
    set(state => {
      const cart = state.carts[restaurantId];
      if (!cart) return state;

      const newItems = cart.items.map(item =>
        item.id === cartItemId ? { ...item, notes } : item
      );

      return {
        carts: {
          ...state.carts,
          [restaurantId]: { ...cart, items: newItems },
        },
      };
    });
  },

  applyCoupon: (restaurantId, coupon, taxRate, deliveryFee) => {
    set(state => {
      const cart = state.carts[restaurantId];
      if (!cart) return state;

      const updatedCart = recalcCart(
        { ...cart, coupon },
        taxRate,
        deliveryFee
      );

      return { carts: { ...state.carts, [restaurantId]: updatedCart } };
    });
  },

  removeCoupon: (restaurantId, taxRate, deliveryFee) => {
    set(state => {
      const cart = state.carts[restaurantId];
      if (!cart) return state;

      const updatedCart = recalcCart(
        { ...cart, coupon: undefined },
        taxRate,
        deliveryFee
      );

      return { carts: { ...state.carts, [restaurantId]: updatedCart } };
    });
  },

  clearCart: (restaurantId: string) => {
    set(state => ({
      carts: {
        ...state.carts,
        [restaurantId]: makeEmptyCart(restaurantId),
      },
    }));
  },

  clearAllCarts: () => {
    set({ carts: {}, activeRestaurantId: null });
  },
}));
