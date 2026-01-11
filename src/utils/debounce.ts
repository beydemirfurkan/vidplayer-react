/**
 * Creates a debounced version of a function
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching:', query);
 * }, 300);
 *
 * debouncedSearch('hello');
 * debouncedSearch('world'); // Only this one fires after 300ms
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled version of a function
 *
 * @param fn - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function with cancel method
 *
 * @example
 * const throttledUpdate = throttle((value: number) => {
 *   console.log('Value:', value);
 * }, 100);
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastArgs: unknown[] | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = ((...args: unknown[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          throttled(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
    lastArgs = null;
  };

  return throttled;
}
