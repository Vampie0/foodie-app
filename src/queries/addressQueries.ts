import { useQuery } from '@tanstack/react-query';
import { addressesApi } from '../api/addresses';
import { queryKeys } from './queryKeys';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses(),
    queryFn: () => addressesApi.getAddresses(),
    staleTime: 5 * 60 * 1000,
  });
}
