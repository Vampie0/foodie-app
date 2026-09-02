export interface SelectedVariant {
  groupId: string;
  groupName: string;
  variantId: string;
  variantName: string;
  priceModifier: number;
}

export interface SelectedAddOn {
  groupId: string;
  groupName: string;
  addOnId: string;
  addOnName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart entry ID (uuid)
  restaurantId: string;
  menuItemId: string;
  name: string;
  image?: string;
  basePrice: number;
  selectedVariants: SelectedVariant[];
  selectedAddOns: SelectedAddOn[];
  quantity: number;
  notes?: string;
  unitPrice: number; // basePrice + variant modifiers + addons
  totalPrice: number; // unitPrice * quantity
}

export interface CartCoupon {
  code: string;
  dealId: string;
  discountAmount: number;
  description: string;
}

export interface Cart {
  restaurantId: string;
  items: CartItem[];
  coupon?: CartCoupon;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

export interface CartPricingSummary {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
}
