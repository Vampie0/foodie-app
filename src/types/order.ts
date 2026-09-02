import { CartItem, CartCoupon } from './cart';
import { Address } from './user';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'delivery' | 'takeaway';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Valid order status transitions
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['out_for_delivery', 'delivered'], // delivered for takeaway
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export interface StatusUpdate {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem extends CartItem {
  // Snapshot at time of order
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  userId: string;
  items: OrderItem[];
  type: OrderType;
  deliveryAddress?: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  coupon?: CartCoupon;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  statusHistory: StatusUpdate[];
  estimatedDeliveryTime?: string;
  notes?: string;
  rating?: number;
  review?: string;
  isRated: boolean;
  clientOrderRequestId: string; // idempotency key
  createdAt: string;
  updatedAt: string;
}

export interface CancellationReason {
  id: string;
  label: string;
}

export const CANCELLATION_REASONS: CancellationReason[] = [
  { id: 'changed_mind', label: 'Changed my mind' },
  { id: 'wrong_order', label: 'Ordered by mistake' },
  { id: 'too_long', label: 'Waiting too long' },
  { id: 'found_better', label: 'Found better option' },
  { id: 'other', label: 'Other reason' },
];
