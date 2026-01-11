import { useCallback } from 'react';

/**
 * Hook for handling video player keyboard shortcuts
 *
 * Provides keyboard shortcuts for video playback control.
 *
 * @param options - Player control options
 * @returns Event handler to attach to video container
 *
 * @example
 * const handleKeyDown = usePlayerKeyboardShortcuts({
 *   onTogglePlay: toggle,
 *   onSeekForward: () => seek(currentTime + 10),
 *   onSeekBackward: () => seek(currentTime - 10),
 *   onVolumeUp: () => setVolume(Math.min(volume + 0.1, 1)),
 *   onVolumeDown: () => setVolume(Math.max(volume - 0.1, 0)),
 *   onToggleMute: toggleMute,
 *   onToggleFullscreen: toggleFullscreen,
 * });
 *
 * return (
 *   <div tabIndex={0} onKeyDown={handleKeyDown}>
 *     <video ref={videoRef} />
 *   </div>
 * );
 */
export function usePlayerKeyboardShortcuts(options: {
  onTogglePlay?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onToggleMute?: () => void;
  onToggleFullscreen?: () => void;
  onSeekToPercent?: (percent: number) => void;
  onSpeedUp?: () => void;
  onSpeedDown?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}): (event: React.KeyboardEvent) => void {
  const {
    onTogglePlay,
    onSeekForward,
    onSeekBackward,
    onVolumeUp,
    onVolumeDown,
    onToggleMute,
    onToggleFullscreen,
    onSeekToPercent,
    onSpeedUp,
    onSpeedDown,
    onHome,
    onEnd,
    enabled = true,
  } = options;

  return useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      const { key, target } = event;

      // Don't handle if user is typing in an input
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      let handled = true;

      switch (key) {
        case ' ':
        case 'k':
          onTogglePlay?.();
          break;

        case 'ArrowRight':
        case 'l':
          onSeekForward?.();
          break;

        case 'ArrowLeft':
        case 'j':
          onSeekBackward?.();
          break;

        case 'ArrowUp':
          onVolumeUp?.();
          break;

        case 'ArrowDown':
          onVolumeDown?.();
          break;

        case 'm':
          onToggleMute?.();
          break;

        case 'f':
          onToggleFullscreen?.();
          break;

        case 'Home':
          onHome?.();
          break;

        case 'End':
          onEnd?.();
          break;

        case '>':
          onSpeedUp?.();
          break;

        case '<':
          onSpeedDown?.();
          break;

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          onSeekToPercent?.(parseInt(key, 10) * 10);
          break;

        default:
          handled = false;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    },
    [
      enabled,
      onTogglePlay,
      onSeekForward,
      onSeekBackward,
      onVolumeUp,
      onVolumeDown,
      onToggleMute,
      onToggleFullscreen,
      onSeekToPercent,
      onSpeedUp,
      onSpeedDown,
      onHome,
      onEnd,
    ]
  );
}
