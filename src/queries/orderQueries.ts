import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { queryKeys } from './queryKeys';
import { isActiveOrder } from '../utils/orderStateMachine';

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders(),
    queryFn: () => ordersApi.getOrders(),
    staleTime: 30 * 1000, // 30s
  });
}

export function useActiveOrders() {
  return useQuery({
    queryKey: queryKeys.activeOrders(),
    queryFn: async () => {
      const orders = await ordersApi.getOrders();
      return orders.filter(o => isActiveOrder(o.status));
    },
    refetchInterval: 30 * 1000, // poll every 30s
    staleTime: 10 * 1000,
  });
}

export function useOrderHistory() {
  return useQuery({
    queryKey: queryKeys.orderHistory(),
    queryFn: async () => {
      const orders = await ordersApi.getOrders();
      return orders.filter(o => !isActiveOrder(o.status));
    },
    staleTime: 60 * 1000,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order) return false;
      return isActiveOrder(order.status) ? 15 * 1000 : false;
    },
    staleTime: 10 * 1000,
  });
}
