import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { normalizeError } from '../utils/error';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const appError = normalizeError(error);
        // Don't retry auth or not-found errors
        if (appError.code === 'UNAUTHORIZED' || appError.code === 'NOT_FOUND') return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
