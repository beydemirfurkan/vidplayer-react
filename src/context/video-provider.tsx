'use client';

import { createContext, useContext, useMemo, type PropsWithChildren, type ComponentType } from 'react';

/**
 * Icon component props
 */
export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom icon components configuration
 */
export interface VideoIconConfig {
  /** Play icon component */
  play?: ComponentType<IconProps>;
  /** Pause icon component */
  pause?: ComponentType<IconProps>;
  /** Volume high icon component */
  volumeHigh?: ComponentType<IconProps>;
  /** Volume low icon component */
  volumeLow?: ComponentType<IconProps>;
  /** Volume mute/off icon component */
  volumeMute?: ComponentType<IconProps>;
  /** Fullscreen enter icon component */
  fullscreen?: ComponentType<IconProps>;
  /** Fullscreen exit icon component */
  fullscreenExit?: ComponentType<IconProps>;
  /** Settings icon component */
  settings?: ComponentType<IconProps>;
  /** Skip forward icon component */
  skipForward?: ComponentType<IconProps>;
  /** Skip backward icon component */
  skipBackward?: ComponentType<IconProps>;
  /** Picture-in-Picture icon component */
  pip?: ComponentType<IconProps>;
  /** Loading/spinner icon component */
  loading?: ComponentType<IconProps>;
  /** Speed icon component */
  speed?: ComponentType<IconProps>;
  /** Quality/tune icon component */
  quality?: ComponentType<IconProps>;
  /** Chevron right icon component */
  chevronRight?: ComponentType<IconProps>;
  /** Chevron left icon component */
  chevronLeft?: ComponentType<IconProps>;
}

/**
 * VideoProvider configuration options
 */
export interface VideoProviderConfig {
  /** Default accent color for all components (default: '#ef4444') */
  accentColor?: string;
  /** Custom icon components */
  icons?: VideoIconConfig;
  /** Enable keyboard shortcuts (default: true) */
  keyboardShortcuts?: boolean;
  /** Default skip duration in seconds (default: 10) */
  skipDuration?: number;
  /** Available playback rate options */
  playbackRateOptions?: number[];
}

/**
 * Internal context value type
 */
export interface VideoContextValue extends Required<Omit<VideoProviderConfig, 'icons'>> {
  icons: VideoIconConfig;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: VideoContextValue = {
  accentColor: '#ef4444',
  icons: {},
  keyboardShortcuts: true,
  skipDuration: 10,
  playbackRateOptions: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4],
};

/**
 * Video context for global configuration
 */
const VideoContext = createContext<VideoContextValue | null>(null);

/**
 * VideoProvider component
 * 
 * Provides global configuration for all video components in the tree.
 * 
 * @example
 * ```tsx
 * <VideoProvider 
 *   accentColor="#3b82f6"
 *   skipDuration={15}
 *   icons={{
 *     play: MyPlayIcon,
 *     pause: MyPauseIcon,
 *   }}
 * >
 *   <App />
 * </VideoProvider>
 * ```
 */
export function VideoProvider({
  children,
  accentColor,
  icons,
  keyboardShortcuts,
  skipDuration,
  playbackRateOptions,
}: PropsWithChildren<VideoProviderConfig>) {
  const value = useMemo<VideoContextValue>(
    () => ({
      accentColor: accentColor ?? DEFAULT_CONFIG.accentColor,
      icons: icons ?? DEFAULT_CONFIG.icons,
      keyboardShortcuts: keyboardShortcuts ?? DEFAULT_CONFIG.keyboardShortcuts,
      skipDuration: skipDuration ?? DEFAULT_CONFIG.skipDuration,
      playbackRateOptions: playbackRateOptions ?? DEFAULT_CONFIG.playbackRateOptions,
    }),
    [accentColor, icons, keyboardShortcuts, skipDuration, playbackRateOptions]
  );

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

/**
 * Hook to access video configuration from VideoProvider
 * 
 * Returns default configuration if used outside of VideoProvider.
 * 
 * @returns Video configuration object
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { accentColor, skipDuration, icons } = useVideoConfig();
 *   
 *   const PlayIcon = icons.play ?? DefaultPlayIcon;
 *   
 *   return (
 *     <button style={{ color: accentColor }}>
 *       <PlayIcon size={24} />
 *     </button>
 *   );
 * }
 * ```
 */
export function useVideoConfig(): VideoContextValue {
  const context = useContext(VideoContext);
  return context ?? DEFAULT_CONFIG;
}

/**
 * Hook to check if component is inside VideoProvider
 * 
 * @returns Whether the component is wrapped in VideoProvider
 */
export function useHasVideoProvider(): boolean {
  const context = useContext(VideoContext);
  return context !== null;
}

VideoProvider.displayName = 'VideoProvider';
