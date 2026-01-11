'use client';

import { useRef, useState, useCallback, memo } from 'react';
import type { VideoProgressProps } from '../../types';
import { formatDuration } from '../../utils/format-duration';

/**
 * VideoProgress component
 *
 * A seekable progress bar for video playback.
 * Fully headless - no styles included, only className and data-attributes.
 *
 * @example
 * <VideoProgress
 *   currentTime={currentTime}
 *   duration={duration}
 *   bufferedProgress={bufferedProgress}
 *   onSeek={seek}
 *   showTime
 *   className="h-1 bg-gray-200 rounded cursor-pointer"
 * />
 */
export const VideoProgress = memo(function VideoProgress({
  currentTime,
  duration,
  bufferedProgress = 0,
  onSeek,
  showTime = false,
  className,
  'data-testid': testId,
}: VideoProgressProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);

  const progress = duration > 0 ? currentTime / duration : 0;

  const getProgressFromEvent = useCallback(
    (event: React.MouseEvent | MouseEvent): number => {
      const track = trackRef.current;
      if (!track) return 0;

      const rect = track.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      return ratio;
    },
    []
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!onSeek) return;

      event.preventDefault();
      setIsDragging(true);

      const ratio = getProgressFromEvent(event);
      onSeek(ratio * duration);

      const handleMouseMove = (e: MouseEvent) => {
        const moveRatio = getProgressFromEvent(e);
        onSeek(moveRatio * duration);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onSeek, duration, getProgressFromEvent]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const ratio = getProgressFromEvent(event);
      setHoverProgress(ratio);
    },
    [getProgressFromEvent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverProgress(null);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!onSeek) return;

      const step = event.shiftKey ? 10 : 5; // 5 or 10 seconds

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onSeek(Math.max(0, currentTime - step));
          break;
        case 'ArrowRight':
          event.preventDefault();
          onSeek(Math.min(duration, currentTime + step));
          break;
        case 'Home':
          event.preventDefault();
          onSeek(0);
          break;
        case 'End':
          event.preventDefault();
          onSeek(duration);
          break;
      }
    },
    [onSeek, currentTime, duration]
  );

  return (
    <div
      className={className}
      data-testid={testId}
      data-video-progress
      data-dragging={isDragging || undefined}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {/* Current time */}
      {showTime && (
        <span data-slot="current-time" style={{ flexShrink: 0 }}>
          {formatDuration(currentTime)}
        </span>
      )}

      {/* Progress track */}
      <div
        ref={trackRef}
        data-slot="track"
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(duration)}`}
        tabIndex={onSeek ? 0 : -1}
        onMouseDown={onSeek ? handleMouseDown : undefined}
        onMouseMove={onSeek ? handleMouseMove : undefined}
        onMouseLeave={onSeek ? handleMouseLeave : undefined}
        onKeyDown={onSeek ? handleKeyDown : undefined}
        style={{
          position: 'relative',
          flex: 1,
          height: '100%',
          cursor: onSeek ? 'pointer' : 'default',
        }}
      >
        {/* Buffered progress */}
        <div
          data-slot="buffered"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${bufferedProgress * 100}%`,
            pointerEvents: 'none',
          }}
        />

        {/* Current progress */}
        <div
          data-slot="progress"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress * 100}%`,
            pointerEvents: 'none',
          }}
        />

        {/* Hover preview */}
        {hoverProgress !== null && (
          <div
            data-slot="hover"
            style={{
              position: 'absolute',
              top: '-24px',
              left: `${hoverProgress * 100}%`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            {formatDuration(hoverProgress * duration)}
          </div>
        )}

        {/* Thumb */}
        <div
          data-slot="thumb"
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progress * 100}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Duration */}
      {showTime && (
        <span data-slot="duration" style={{ flexShrink: 0 }}>
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
});

VideoProgress.displayName = 'VideoProgress';
