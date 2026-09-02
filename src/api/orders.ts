import { mockApiCall, mockDelay } from './mockDelay';
import { Order, OrderStatus, VALID_ORDER_TRANSITIONS } from '../types/order';
import { Cart } from '../types/cart';
import { Address } from '../types/user';
import { DUMMY_ORDERS } from '../lib/dummyData';

// In-memory order store for mock
let mockOrders: Order[] = [...DUMMY_ORDERS];

export interface CreateOrderPayload {
  restaurantId: string;
  cart: Cart;
  type: 'delivery' | 'takeaway';
  deliveryAddress?: Address;
  paymentMethod: 'cash' | 'card' | 'wallet';
  notes?: string;
  clientOrderRequestId: string; // idempotency key
}

export const ordersApi = {
  async getOrders(restaurantId?: string): Promise<Order[]> {
    return mockApiCall(() => {
      if (restaurantId) {
        return mockOrders.filter(o => o.restaurantId === restaurantId);
      }
      return mockOrders;
    });
  },

  async getOrderById(orderId: string): Promise<Order> {
    return mockApiCall(() => {
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');
      return order;
    });
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return mockApiCall(() => {
      // Idempotency check
      const existing = mockOrders.find(
        o => o.clientOrderRequestId === payload.clientOrderRequestId
      );
      if (existing) return existing;

      const now = new Date().toISOString();
      const orderNumber = `${payload.restaurantId.slice(-2).toUpperCase()}-${Date.now()}`;

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber,
        restaurantId: payload.restaurantId,
        restaurantName: payload.cart.restaurantId,
        restaurantLogo: '',
        userId: 'user-1',
        items: payload.cart.items.map(item => ({ ...item })),
        type: payload.type,
        deliveryAddress: payload.deliveryAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'pending',
        subtotal: payload.cart.subtotal,
        taxAmount: payload.cart.taxAmount,
        taxRate: 0.05,
        deliveryFee: payload.cart.deliveryFee,
        discountAmount: payload.cart.discountAmount,
        total: payload.cart.total,
        coupon: payload.cart.coupon,
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: now }],
        isRated: false,
        clientOrderRequestId: payload.clientOrderRequestId,
        notes: payload.notes,
        createdAt: now,
        updatedAt: now,
      };

      mockOrders = [newOrder, ...mockOrders];
      return newOrder;
    });
  },

  async cancelOrder(
    orderId: string,
    reason: string,
    note?: string
  ): Promise<Order> {
    return mockApiCall(() => {
      const orderIdx = mockOrders.findIndex(o => o.id === orderId);
      if (orderIdx === -1) throw new Error('Order not found');

      const order = mockOrders[orderIdx];
      if (!VALID_ORDER_TRANSITIONS[order.status].includes('cancelled')) {
        throw new Error('This order cannot be cancelled');
      }

      const now = new Date().toISOString();
      const updated: Order = {
        ...order,
        status: 'cancelled',
        statusHistory: [
          ...order.statusHistory,
          { status: 'cancelled', timestamp: now, note: `${reason}${note ? `: ${note}` : ''}` },
        ],
        updatedAt: now,
      };

      mockOrders[orderIdx] = updated;
      return updated;
    });
  },

  async rateOrder(
    orderId: string,
    rating: number,
    review?: string
  ): Promise<Order> {
    return mockApiCall(() => {
      const orderIdx = mockOrders.findIndex(o => o.id === orderId);
      if (orderIdx === -1) throw new Error('Order not found');

      const order = mockOrders[orderIdx];
      if (order.isRated) throw new Error('Order has already been rated');
      if (order.status !== 'delivered') throw new Error('Can only rate delivered orders');

      const updated: Order = {
        ...order,
        rating,
        review,
        isRated: true,
        updatedAt: new Date().toISOString(),
      };

      mockOrders[orderIdx] = updated;
      return updated;
    });
  },

  async pollOrderStatus(orderId: string): Promise<Order> {
    await mockDelay(300, 600);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    return order;
  },
};
