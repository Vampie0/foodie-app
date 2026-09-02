/**
 * Centralized money/pricing utilities.
 * All monetary calculations go here — never scattered in components.
 */

import { CartItem, CartPricingSummary } from '../types/cart';
import { MenuItem, VariantGroup } from '../types/restaurant';

/** Round to 2 decimal places to avoid floating-point drift */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Calculate the unit price of a cart item (base + variants + addons) */
export function calculateUnitPrice(item: Omit<CartItem, 'unitPrice' | 'totalPrice'>): number {
  const variantTotal = item.selectedVariants.reduce(
    (sum, v) => sum + v.priceModifier,
    0
  );
  const addOnTotal = item.selectedAddOns.reduce(
    (sum, a) => sum + a.price,
    0
  );
  return roundMoney(item.basePrice + variantTotal + addOnTotal);
}

/** Calculate the total price for a cart item */
export function calculateItemTotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity);
}

/** Calculate full cart pricing summary */
export function calculateCartPricing(
  items: CartItem[],
  taxRate: number,
  deliveryFee: number,
  discountAmount = 0,
  orderType: 'delivery' | 'takeaway' = 'delivery'
): CartPricingSummary {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.totalPrice, 0)
  );
  const effectiveDeliveryFee = orderType === 'takeaway' ? 0 : deliveryFee;
  const taxAmount = roundMoney(subtotal * taxRate);
  const total = roundMoney(
    subtotal + taxAmount + effectiveDeliveryFee - discountAmount
  );

  return {
    subtotal,
    taxAmount,
    taxRate,
    deliveryFee: effectiveDeliveryFee,
    discountAmount,
    total: Math.max(0, total),
  };
}

/** Calculate discount amount from a deal */
export function calculateDealDiscount(
  subtotal: number,
  dealType: 'percentage' | 'fixed' | 'bogo' | 'free_delivery',
  dealValue: number,
  deliveryFee: number
): number {
  switch (dealType) {
    case 'percentage':
      return roundMoney((subtotal * dealValue) / 100);
    case 'fixed':
      return Math.min(dealValue, subtotal);
    case 'free_delivery':
      return deliveryFee;
    case 'bogo':
      // Simple BOGO: half of cheapest applicable item
      return 0; // Backend handles BOGO authoritatively
    default:
      return 0;
  }
}

/** Format price for display */
export function formatPrice(amount: number, currency = 'PKR'): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${formatted}`;
}

/** Check if minimum order amount is met */
export function meetsMinimumOrder(subtotal: number, minimumOrderAmount: number): boolean {
  return subtotal >= minimumOrderAmount;
}

/** Get the display price for a menu item (base price) */
export function getBaseDisplayPrice(item: MenuItem): number {
  return item.basePrice;
}

/** Get min-max price range for a menu item considering variants */
export function getItemPriceRange(item: MenuItem): { min: number; max: number } {
  if (item.variantGroups.length === 0) {
    return { min: item.basePrice, max: item.basePrice };
  }

  const defaultVariantExtra = item.variantGroups.reduce((total, group) => {
    const defaultVariant = group.variants.find(v => v.isDefault);
    return total + (defaultVariant?.priceModifier ?? 0);
  }, 0);

  const maxVariantExtra = item.variantGroups.reduce((total, group) => {
    const maxMod = Math.max(...group.variants.map(v => v.priceModifier));
    return total + maxMod;
  }, 0);

  return {
    min: roundMoney(item.basePrice + defaultVariantExtra),
    max: roundMoney(item.basePrice + maxVariantExtra),
  };
}
