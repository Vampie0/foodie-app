import { API } from '../constants/api';

/** Simulate realistic API delay */
export function mockDelay(customMin?: number, customMax?: number): Promise<void> {
  const min = customMin ?? API.MOCK_DELAY_MIN;
  const max = customMax ?? API.MOCK_DELAY_MAX;
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Occasionally throw a mock error for testing error handling */
export function maybeFailure(message = 'Simulated network failure'): void {
  if (API.ENABLE_FAILURES && Math.random() < API.FAILURE_RATE) {
    throw new Error(message);
  }
}

export async function mockApiCall<T>(fn: () => T): Promise<T> {
  await mockDelay();
  maybeFailure();
  return fn();
}
