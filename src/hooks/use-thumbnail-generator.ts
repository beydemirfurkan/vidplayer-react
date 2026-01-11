'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { isBrowser } from '../utils/ssr-safe';

/** Thumbnail dimensions */
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

/** Cache configuration */
const MAX_CACHE_SIZE = 50;
const TIME_PRECISION = 1; // Round to 1 second

/** Debounce delay in ms */
const DEBOUNCE_DELAY = 100;

/**
 * LRU Cache for thumbnails
 */
export class ThumbnailLRUCache {
  private cache: Map<string, string>;
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): string | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: string): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        const oldValue = this.cache.get(oldestKey);
        // Revoke old blob URL to free memory
        if (oldValue?.startsWith('blob:')) {
          URL.revokeObjectURL(oldValue);
        }
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    // Revoke all blob URLs
    this.cache.forEach((value) => {
      if (value.startsWith('blob:')) {
        URL.revokeObjectURL(value);
      }
    });
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Round time to specified precision for cache key
 */
function roundTime(time: number, precision: number = TIME_PRECISION): number {
  return Math.round(time / precision) * precision;
}

/**
 * Generate cache key from video source and time
 */
function getCacheKey(videoSrc: string, time: number): string {
  return `${videoSrc}:${roundTime(time)}`;
}

export interface UseThumbnailGeneratorOptions {
  /** Video source URL */
  videoSrc: string | undefined;
  /** Whether thumbnail generation is enabled */
  enabled?: boolean;
}

export interface UseThumbnailGeneratorReturn {
  /** Generate thumbnail for a specific time */
  generateThumbnail: (time: number) => void;
  /** Current thumbnail URL (data URL or blob URL) */
  thumbnailUrl: string | null;
  /** Whether thumbnail is being generated */
  isLoading: boolean;
  /** Error message if generation failed */
  error: string | null;
  /** Clear all cached thumbnails */
  clearCache: () => void;
}

/**
 * Hook for generating video thumbnails at specific timestamps
 */
export function useThumbnailGenerator({
  videoSrc,
  enabled = true,
}: UseThumbnailGeneratorOptions): UseThumbnailGeneratorReturn {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for internal state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheRef = useRef<ThumbnailLRUCache>(new ThumbnailLRUCache());
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingTimeRef = useRef<number | null>(null);
  const currentVideoSrcRef = useRef<string | undefined>(undefined);

  // Create hidden video and canvas elements
  useEffect(() => {
    if (!isBrowser || !enabled) return;

    // Create hidden video element
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.style.display = 'none';
    videoRef.current = video;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    canvasRef.current = canvas;

    return () => {
      // Cleanup
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current = null;
      }
      canvasRef.current = null;
      cacheRef.current.clear();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled]);

  // Update video source when it changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc || !enabled) return;

    if (currentVideoSrcRef.current !== videoSrc) {
      currentVideoSrcRef.current = videoSrc;
      videoRef.current.src = videoSrc;
      // Clear cache when video changes
      cacheRef.current.clear();
      setThumbnailUrl(null);
      setError(null);
    }
  }, [videoSrc, enabled]);

  /**
   * Capture thumbnail at current video time
   */
  const captureThumbnail = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    try {
      ctx.drawImage(video, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch {
      // CORS or other error
      return null;
    }
  }, []);

  /**
   * Generate thumbnail for a specific time
   */
  const generateThumbnail = useCallback(
    (time: number) => {
      if (!enabled || !videoSrc || !isBrowser) {
        return;
      }

      // Clear previous debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Store pending time
      pendingTimeRef.current = time;

      // Debounce the request
      debounceTimeoutRef.current = setTimeout(() => {
        const requestedTime = pendingTimeRef.current;
        if (requestedTime === null) return;

        const cacheKey = getCacheKey(videoSrc, requestedTime);

        // Check cache first
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setThumbnailUrl(cached);
          setIsLoading(false);
          setError(null);
          return;
        }

        // Generate new thumbnail
        const video = videoRef.current;
        if (!video) {
          setError('Video element not available');
          return;
        }

        setIsLoading(true);
        setError(null);

        // Seek to time and capture
        const handleSeeked = () => {
          const thumbnail = captureThumbnail();
          if (thumbnail) {
            cacheRef.current.set(cacheKey, thumbnail);
            setThumbnailUrl(thumbnail);
            setError(null);
          } else {
            setError('Failed to capture thumbnail');
            setThumbnailUrl(null);
          }
          setIsLoading(false);
          video.removeEventListener('seeked', handleSeeked);
          video.removeEventListener('error', handleError);
        };

        const handleError = () => {
          setError('Failed to load video for thumbnail');
          setThumbnailUrl(null);
          setIsLoading(false);
          video.removeEventListener('seeked', handleSeeked);
          video.removeEventListener('error', handleError);
        };

        video.addEventListener('seeked', handleSeeked, { once: true });
        video.addEventListener('error', handleError, { once: true });

        // Seek to requested time
        video.currentTime = roundTime(requestedTime);
      }, DEBOUNCE_DELAY);
    },
    [enabled, videoSrc, captureThumbnail]
  );

  /**
   * Clear all cached thumbnails
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setThumbnailUrl(null);
  }, []);

  return {
    generateThumbnail,
    thumbnailUrl,
    isLoading,
    error,
    clearCache,
  };
}
