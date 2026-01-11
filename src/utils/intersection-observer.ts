/**
 * Options for creating an intersection observer
 */
export interface IntersectionObserverOptions {
  /** Root element for intersection */
  root?: Element | null;
  /** Margin around root */
  rootMargin?: string;
  /** Visibility threshold(s) */
  threshold?: number | number[];
  /** Whether to disconnect after first intersection */
  once?: boolean;
}

/**
 * Callback type for intersection observer
 */
export type IntersectionCallback = (
  entry: IntersectionObserverEntry,
  observer: IntersectionObserver
) => void;

/**
 * Creates a managed intersection observer for lazy loading
 *
 * @param callback - Called when element intersects
 * @param options - IntersectionObserver options
 * @returns Object with observe, unobserve, and disconnect methods
 *
 * @example
 * const observer = createIntersectionObserver((entry) => {
 *   if (entry.isIntersecting) {
 *     loadImage(entry.target);
 *   }
 * }, { threshold: 0.1, once: true });
 *
 * observer.observe(imageElement);
 */
export function createIntersectionObserver(
  callback: IntersectionCallback,
  options: IntersectionObserverOptions = {}
): {
  observe: (element: Element) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
} {
  const { root = null, rootMargin = '0px', threshold = 0, once = false } = options;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        callback(entry, obs);

        if (once && entry.isIntersecting) {
          obs.unobserve(entry.target);
        }
      });
    },
    { root, rootMargin, threshold }
  );

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Check if IntersectionObserver is supported
 */
export function isIntersectionObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Creates a lazy loading helper for images
 *
 * @param options - IntersectionObserver options
 * @returns Object with methods to manage lazy loading
 *
 * @example
 * const lazyLoader = createLazyLoader({ rootMargin: '100px' });
 *
 * // In component
 * useEffect(() => {
 *   if (imgRef.current) {
 *     lazyLoader.observe(imgRef.current, () => {
 *       imgRef.current.src = actualSrc;
 *     });
 *   }
 *   return () => lazyLoader.unobserve(imgRef.current);
 * }, []);
 */
export function createLazyLoader(
  options: Omit<IntersectionObserverOptions, 'once'> = {}
): {
  observe: (element: Element, onLoad: () => void) => void;
  unobserve: (element: Element | null) => void;
  disconnect: () => void;
} {
  const callbacks = new Map<Element, () => void>();

  const observer = createIntersectionObserver(
    (entry, obs) => {
      if (entry.isIntersecting) {
        const onLoad = callbacks.get(entry.target);
        if (onLoad) {
          onLoad();
          callbacks.delete(entry.target);
        }
        obs.unobserve(entry.target);
      }
    },
    { ...options, once: true }
  );

  return {
    observe: (element: Element, onLoad: () => void) => {
      callbacks.set(element, onLoad);
      observer.observe(element);
    },
    unobserve: (element: Element | null) => {
      if (element) {
        callbacks.delete(element);
        observer.unobserve(element);
      }
    },
    disconnect: () => {
      callbacks.clear();
      observer.disconnect();
    },
  };
}
