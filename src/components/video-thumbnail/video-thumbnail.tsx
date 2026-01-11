'use client';

import { useRef, useState, useEffect, memo, forwardRef } from 'react';
import type { VideoThumbnailProps } from '../../types';
import { formatDuration } from '../../utils/format-duration';
import { isIntersectionObserverSupported } from '../../utils/intersection-observer';

/**
 * VideoThumbnail component
 *
 * Displays a video thumbnail with optional lazy loading and duration overlay.
 * Fully headless - no styles included, only className and data-attributes.
 * Supports ref forwarding to the root container element.
 *
 * @example
 * ```tsx
 * const thumbnailRef = useRef<HTMLDivElement>(null);
 * 
 * <VideoThumbnail
 *   ref={thumbnailRef}
 *   video={video}
 *   className="rounded-lg overflow-hidden"
 *   onClick={handleSelect}
 *   lazy
 * />
 * ```
 */
export const VideoThumbnail = memo(
  forwardRef<HTMLDivElement, VideoThumbnailProps>(function VideoThumbnail(
    {
      video,
      aspectRatio = 16 / 9,
      isSelected = false,
      onClick,
      lazy = true,
      placeholder,
      className,
      'data-testid': testId,
    },
    ref
  ) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy);
    const [hasError, setHasError] = useState(false);

    // Lazy loading with IntersectionObserver
    useEffect(() => {
      if (!lazy || !isIntersectionObserverSupported()) {
        setIsInView(true);
        return;
      }

      const element = imgRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px', threshold: 0 }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [lazy]);

    const handleClick = () => {
      onClick?.(video);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(video);
      }
    };

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
    };

    const paddingBottom = `${(1 / aspectRatio) * 100}%`;

    return (
      <div
        ref={ref}
        className={className}
        data-testid={testId}
        data-video-thumbnail
        data-selected={isSelected || undefined}
        data-loaded={isLoaded || undefined}
        data-error={hasError || undefined}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        style={{ position: 'relative' }}
      >
        {/* Aspect ratio container */}
        <div style={{ paddingBottom, position: 'relative' }}>
          {/* Placeholder */}
          {!isLoaded && !hasError && placeholder && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
              }}
              data-slot="placeholder"
            >
              {placeholder}
            </div>
          )}

          {/* Image */}
          {video.thumbnail && isInView && !hasError && (
            <img
              ref={imgRef}
              src={video.thumbnail}
              alt={video.title ?? 'Video thumbnail'}
              onLoad={handleLoad}
              onError={handleError}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
              data-slot="image"
            />
          )}

          {/* No thumbnail fallback */}
          {(!video.thumbnail || hasError) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              data-slot="fallback"
            >
              <span>{video.title?.charAt(0)?.toUpperCase() ?? '?'}</span>
            </div>
          )}

          {/* Duration overlay */}
          {video.duration !== undefined && video.duration > 0 && (
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
              }}
              data-slot="duration"
            >
              {formatDuration(video.duration)}
            </span>
          )}

          {/* Progress bar */}
          {video.progress !== undefined && video.progress > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
              }}
              data-slot="progress-track"
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(video.progress * 100, 100)}%`,
                }}
                data-slot="progress-bar"
              />
            </div>
          )}
        </div>
      </div>
    );
  })
);

VideoThumbnail.displayName = 'VideoThumbnail';
