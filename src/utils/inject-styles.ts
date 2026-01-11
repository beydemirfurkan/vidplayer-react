import { isBrowser } from './ssr-safe';

/**
 * Tracks whether global styles have been injected
 */
let stylesInjected = false;

/**
 * Unique identifier for the style element
 */
const STYLE_ID = 'vidplayer-react-styles';

/**
 * Global CSS styles for video player
 * These are injected once and shared across all instances
 */
const globalStyles = `
  /* Keyframe animations */
  @keyframes video-player-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes video-player-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }

  @keyframes video-player-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes video-player-scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes video-player-ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  /* Fullscreen styles */
  [data-video-player][data-fullscreen] {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0 !important;
  }

  [data-video-player][data-fullscreen] video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  /* Play overlay hover effect */
  [data-video-player] [data-play-overlay]:hover [data-play-icon] {
    transform: scale(1.1);
    background: rgba(255,255,255,1);
  }

  /* Button hover effects */
  [data-video-controls] button:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  [data-video-controls] button:active {
    transform: scale(0.95);
  }

  /* Volume slider styles */
  [data-video-controls] input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }

  [data-video-controls] input[type="range"]::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 4px;
  }

  [data-video-controls] input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    margin-top: -5px;
    transition: transform 0.15s ease;
  }

  [data-video-controls] input[type="range"]:hover::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  [data-video-controls] input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: transform 0.15s ease;
  }

  [data-video-controls] input[type="range"]:hover::-moz-range-thumb {
    transform: scale(1.15);
  }

  /* Menu item hover styles */
  [data-video-controls] [data-menu-item]:hover {
    background: rgba(255,255,255,0.1);
  }

  /* Progress bar hover effect */
  [data-video-controls] [data-progress-container]:hover [data-progress-track] {
    height: 5px;
  }

  /* Focus styles for accessibility */
  [data-video-player]:focus {
    outline: none;
  }

  [data-video-player]:focus-visible {
    outline: 2px solid var(--video-accent-color, #ef4444);
    outline-offset: 2px;
  }

  [data-video-controls] button:focus-visible {
    outline: 2px solid var(--video-accent-color, #ef4444);
    outline-offset: 2px;
    border-radius: 8px;
  }

  /* Smooth scrollbar for menus */
  [data-video-controls] [data-menu]::-webkit-scrollbar {
    width: 6px;
  }

  [data-video-controls] [data-menu]::-webkit-scrollbar-track {
    background: transparent;
  }

  [data-video-controls] [data-menu]::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }

  [data-video-controls] [data-menu]::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3);
  }

  /* Double tap ripple effect */
  [data-video-player] [data-ripple] {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    animation: video-player-ripple 0.6s ease-out forwards;
    pointer-events: none;
  }
`;

/**
 * Injects global CSS styles into the document head
 * 
 * This function is idempotent - calling it multiple times
 * will only inject styles once.
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   injectGlobalStyles();
 * }, []);
 * ```
 */
export function injectGlobalStyles(): void {
  // Skip on server or if already injected
  if (!isBrowser || stylesInjected) {
    return;
  }

  // Check if styles already exist (e.g., from another instance)
  const existingStyles = document.getElementById(STYLE_ID);
  if (existingStyles) {
    stylesInjected = true;
    return;
  }

  // Create and inject style element
  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ID;
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);

  stylesInjected = true;
}

/**
 * Removes global CSS styles from the document
 * 
 * Useful for cleanup in tests or when unmounting all video players.
 * 
 * @example
 * ```tsx
 * // In test cleanup
 * afterEach(() => {
 *   removeGlobalStyles();
 * });
 * ```
 */
export function removeGlobalStyles(): void {
  if (!isBrowser) {
    return;
  }

  const existingStyles = document.getElementById(STYLE_ID);
  if (existingStyles) {
    existingStyles.remove();
    stylesInjected = false;
  }
}

/**
 * Check if global styles have been injected
 * 
 * @returns Whether styles are currently injected
 */
export function areStylesInjected(): boolean {
  if (!isBrowser) {
    return false;
  }
  return stylesInjected || document.getElementById(STYLE_ID) !== null;
}
