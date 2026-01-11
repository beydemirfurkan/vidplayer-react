import { useMemo, type CSSProperties } from 'react';

/**
 * CSS Custom Properties for video player theming
 */
export const CSS_VARIABLES = {
  accentColor: '--video-accent-color',
  controlBg: '--video-control-bg',
  progressHeight: '--video-progress-height',
  progressHoverHeight: '--video-progress-hover-height',
  thumbSize: '--video-thumb-size',
} as const;

/**
 * Default CSS variable values
 */
export const CSS_DEFAULTS = {
  [CSS_VARIABLES.accentColor]: '#ef4444',
  [CSS_VARIABLES.controlBg]: 'rgba(0,0,0,0.85)',
  [CSS_VARIABLES.progressHeight]: '3px',
  [CSS_VARIABLES.progressHoverHeight]: '5px',
  [CSS_VARIABLES.thumbSize]: '14px',
} as const;

/**
 * Animation keyframes (injected via inject-styles.ts)
 */
export const ANIMATIONS = {
  spin: 'video-player-spin',
  pulse: 'video-player-pulse',
  fadeIn: 'video-player-fade-in',
  scaleIn: 'video-player-scale-in',
} as const;

/**
 * Static styles for VideoPlayer container
 */
export const playerStyles = {
  container: {
    position: 'relative',
    width: '100%',
    background: '#000',
    overflow: 'hidden',
    borderRadius: '12px',
  } as CSSProperties,

  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%', // 16:9 aspect ratio
  } as CSSProperties,

  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,

  playOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  } as CSSProperties,

  playOverlayIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, background 0.15s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  } as CSSProperties,

  playOverlayIconHover: {
    transform: 'scale(1.1)',
    background: 'rgba(255,255,255,1)',
  } as CSSProperties,

  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    pointerEvents: 'none',
  } as CSSProperties,

  emptyState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#666',
    gap: '12px',
  } as CSSProperties,

  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  } as CSSProperties,

  controlsWrapperVisible: {
    opacity: 1,
  } as CSSProperties,

  // Video title overlay
  titleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '16px 16px 48px 16px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 500,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  } as CSSProperties,

  titleOverlayVisible: {
    opacity: 1,
  } as CSSProperties,

  // Double tap indicator
  doubleTapIndicator: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    opacity: 0,
    pointerEvents: 'none',
    animation: `${ANIMATIONS.fadeIn} 0.2s ease forwards`,
  } as CSSProperties,

  doubleTapLeft: {
    left: '15%',
  } as CSSProperties,

  doubleTapRight: {
    right: '15%',
  } as CSSProperties,

  // Keyboard shortcut hint
  shortcutHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '12px 20px',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    zIndex: 100,
  } as CSSProperties,

  shortcutHintVisible: {
    opacity: 1,
  } as CSSProperties,
} as const;

/**
 * Static styles for VideoControls
 */
export const controlStyles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
    padding: '48px 16px 12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    opacity: 1,
    transition: 'opacity 0.3s ease',
  } as CSSProperties,

  progressContainer: {
    width: '100%',
    position: 'relative',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '4px',
  } as CSSProperties,

  progressTrack: {
    width: '100%',
    height: `var(${CSS_VARIABLES.progressHeight}, 3px)`,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'height 0.15s ease, transform 0.15s ease',
  } as CSSProperties,

  progressTrackHover: {
    height: `var(${CSS_VARIABLES.progressHoverHeight}, 5px)`,
  } as CSSProperties,

  progressBuffered: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: 'rgba(255,255,255,0.35)',
    borderRadius: '4px',
    transition: 'width 0.1s linear',
  } as CSSProperties,

  progressFilled: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.1s linear',
  } as CSSProperties,

  progressThumb: {
    position: 'absolute',
    top: '50%',
    width: `var(${CSS_VARIABLES.thumbSize}, 14px)`,
    height: `var(${CSS_VARIABLES.thumbSize}, 14px)`,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%) scale(0)',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    border: '2px solid white',
  } as CSSProperties,

  progressThumbVisible: {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
  } as CSSProperties,

  hoverTime: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: '12px',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    color: 'white',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontVariantNumeric: 'tabular-nums',
    borderRadius: '6px',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  } as CSSProperties,

  // Thumbnail preview on hover
  thumbnailPreview: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: '8px',
    width: '160px',
    aspectRatio: '16/9',
    background: '#000',
    borderRadius: '6px',
    overflow: 'hidden',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    border: '2px solid rgba(255,255,255,0.2)',
  } as CSSProperties,

  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  } as CSSProperties,

  leftControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  } as CSSProperties,

  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  } as CSSProperties,

  button: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease, transform 0.1s ease, color 0.15s ease',
    position: 'relative',
  } as CSSProperties,

  buttonHover: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
  } as CSSProperties,

  playButton: {
    width: '44px',
    height: '44px',
  } as CSSProperties,

  // Tooltip for buttons
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease',
    zIndex: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  } as CSSProperties,

  tooltipVisible: {
    opacity: 1,
  } as CSSProperties,

  // Keyboard shortcut in tooltip
  tooltipShortcut: {
    marginLeft: '8px',
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as CSSProperties,

  timeDisplay: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '100px',
    marginLeft: '8px',
    letterSpacing: '0.02em',
  } as CSSProperties,

  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
  } as CSSProperties,

  volumeSliderContainer: {
    width: '0px',
    overflow: 'hidden',
    transition: 'width 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  } as CSSProperties,

  volumeSliderContainerOpen: {
    width: '80px',
  } as CSSProperties,

  volumeSlider: {
    width: '80px',
    height: '4px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
  } as CSSProperties,

  qualityMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: '8px',
    background: 'rgba(15,15,15,0.98)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '8px 0',
    minWidth: '200px',
    maxHeight: '320px',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    zIndex: 10,
  } as CSSProperties,

  qualityMenuHeader: {
    padding: '8px 16px 12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as CSSProperties,

  qualityOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  } as CSSProperties,

  qualityOptionHover: {
    background: 'rgba(255,255,255,0.1)',
  } as CSSProperties,

  qualityOptionActive: {
    fontWeight: 600,
  } as CSSProperties,

  loader: {
    animation: `${ANIMATIONS.spin} 1s linear infinite`,
  } as CSSProperties,

  // Chapter markers on progress bar
  chapterMarker: {
    position: 'absolute',
    top: '50%',
    width: '3px',
    height: '100%',
    background: 'rgba(255,255,255,0.5)',
    transform: 'translateY(-50%)',
    borderRadius: '1px',
    pointerEvents: 'none',
  } as CSSProperties,
} as const;

/**
 * Hook for dynamic styles based on accent color
 */
export function useAccentStyles(accentColor: string) {
  return useMemo(
    () => ({
      progressFilled: {
        ...controlStyles.progressFilled,
        background: `linear-gradient(90deg, ${accentColor} 0%, ${adjustColor(accentColor, 20)} 100%)`,
      } as CSSProperties,
      progressThumb: {
        ...controlStyles.progressThumb,
        background: accentColor,
      } as CSSProperties,
      activeButton: {
        color: accentColor,
      } as CSSProperties,
      volumeSliderFilled: (volume: number, isMuted: boolean) =>
        ({
          ...controlStyles.volumeSlider,
          background: `linear-gradient(to right, ${accentColor} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
        }) as CSSProperties,
      playOverlayIcon: {
        ...playerStyles.playOverlayIcon,
      } as CSSProperties,
    }),
    [accentColor]
  );
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, percent: number): string {
  // Simple hex color adjustment
  if (color.startsWith('#')) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

/**
 * Get CSS variables style object for a component
 */
export function getCSSVariablesStyle(accentColor?: string): CSSProperties {
  return {
    [CSS_VARIABLES.accentColor]: accentColor ?? CSS_DEFAULTS[CSS_VARIABLES.accentColor],
  } as CSSProperties;
}

/**
 * Icon sizes
 */
export const ICON_SIZES = {
  primary: 26,   // Play/Pause
  default: 22,   // All other controls
  small: 18,     // Menu items
  large: 36,     // Overlay play button
  xlarge: 48,    // Empty state
} as const;
