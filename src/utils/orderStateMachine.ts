import { OrderStatus, VALID_ORDER_TRANSITIONS } from '../types/order';

/**
 * Order state machine — centralized transition validation.
 * The UI uses this for display; the backend enforces it authoritatively.
 */

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_ORDER_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return VALID_ORDER_TRANSITIONS[status].length === 0;
}

export function isCancellable(status: OrderStatus): boolean {
  return canTransition(status, 'cancelled');
}

export function isActiveOrder(status: OrderStatus): boolean {
  return !isTerminalStatus(status);
}

export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export function getStatusDescription(status: OrderStatus): string {
  const descriptions: Record<OrderStatus, string> = {
    pending: 'Waiting for restaurant confirmation',
    confirmed: 'Restaurant has accepted your order',
    preparing: 'Your order is being prepared',
    ready: 'Your order is ready!',
    out_for_delivery: 'Your order is on the way',
    delivered: 'Order delivered — enjoy!',
    cancelled: 'Order was cancelled',
  };
  return descriptions[status];
}

export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 0.1,
    confirmed: 0.25,
    preparing: 0.5,
    ready: 0.75,
    out_for_delivery: 0.9,
    delivered: 1.0,
    cancelled: 0,
  };
  return progressMap[status];
}
