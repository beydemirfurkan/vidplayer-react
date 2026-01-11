import { useEffect, useState, type EffectCallback, type DependencyList } from 'react';

/**
 * Check if code is running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Safe document access - returns null on server
 * 
 * @returns Document object or null if running on server
 * 
 * @example
 * const doc = getDocument();
 * if (doc) {
 *   doc.addEventListener('fullscreenchange', handler);
 * }
 */
export function getDocument(): Document | null {
  return isBrowser ? document : null;
}

/**
 * Safe window access - returns null on server
 * 
 * @returns Window object or null if running on server
 * 
 * @example
 * const win = getWindow();
 * if (win) {
 *   win.addEventListener('resize', handler);
 * }
 */
export function getWindow(): Window | null {
  return isBrowser ? window : null;
}

/**
 * Hook for browser-only effects
 * 
 * This hook only runs the effect callback in browser environment,
 * preventing SSR errors when accessing browser-only APIs.
 * 
 * @param effect - Effect callback to run
 * @param deps - Dependency array
 * 
 * @example
 * useBrowserEffect(() => {
 *   document.addEventListener('fullscreenchange', handler);
 *   return () => document.removeEventListener('fullscreenchange', handler);
 * }, []);
 */
export function useBrowserEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  useEffect(() => {
    if (isBrowser) {
      return effect();
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for tracking fullscreen state safely across SSR
 * 
 * Returns false during SSR and tracks actual fullscreen state in browser.
 * 
 * @returns Whether the document is currently in fullscreen mode
 * 
 * @example
 * const isFullscreen = useFullscreenState();
 * 
 * return (
 *   <button onClick={toggleFullscreen}>
 *     {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
 *   </button>
 * );
 */
export function useFullscreenState(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useBrowserEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Set initial state
    handleChange();

    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return isFullscreen;
}

/**
 * Hook for tracking if component has mounted (hydrated)
 * 
 * Useful for preventing hydration mismatches by rendering
 * different content on server vs client.
 * 
 * @returns Whether the component has mounted in the browser
 * 
 * @example
 * const mounted = useMounted();
 * 
 * if (!mounted) {
 *   return <div>Loading...</div>;
 * }
 * 
 * return <VideoPlayer />;
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Safe requestFullscreen with fallback
 * 
 * @param element - Element to make fullscreen
 * @returns Promise that resolves when fullscreen is entered
 */
export async function requestFullscreen(element: HTMLElement | null): Promise<void> {
  if (!element || !isBrowser) return;

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ('webkitRequestFullscreen' in element) {
      await (element as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
    }
  } catch {
    // Fullscreen request failed - user may have denied or browser doesn't support
  }
}

/**
 * Safe exitFullscreen with fallback
 * 
 * @returns Promise that resolves when fullscreen is exited
 */
export async function exitFullscreen(): Promise<void> {
  if (!isBrowser) return;

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ('webkitExitFullscreen' in document) {
      await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
    }
  } catch {
    // Exit fullscreen failed
  }
}

/**
 * Check if Picture-in-Picture is supported
 * 
 * @returns Whether PiP is supported in the current browser
 */
export function isPiPSupported(): boolean {
  return isBrowser && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;
}
