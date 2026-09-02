import { useRef, useCallback } from 'react';

/**
 * Returns a wrapped function that prevents double-tap/rapid repeat calls.
 * Use for critical actions: Place Order, Delete, Logout, etc.
 */
export function usePreventDoubleTap<T extends unknown[]>(
  fn: (...args: T) => void | Promise<void>,
  cooldownMs = 1000
): (...args: T) => void {
  const lastCallTime = useRef(0);
  const isPending = useRef(false);

  return useCallback(
    (...args: T) => {
      const now = Date.now();
      if (isPending.current) return;
      if (now - lastCallTime.current < cooldownMs) return;

      lastCallTime.current = now;
      isPending.current = true;

      const result = fn(...args);
      if (result instanceof Promise) {
        result.finally(() => {
          isPending.current = false;
        });
      } else {
        isPending.current = false;
      }
    },
    [fn, cooldownMs]
  );
}
