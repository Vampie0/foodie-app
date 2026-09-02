import { useQuery } from '@tanstack/react-query';
import { dealsApi } from '../api/deals';
import { queryKeys } from './queryKeys';

export function useDeals(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.deals(restaurantId),
    queryFn: () => dealsApi.getDeals(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 10 * 60 * 1000, // 10 min
  });
}
