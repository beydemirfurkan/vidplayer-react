import type { VideoItem } from '../types';

/**
 * Preload strategy options
 */
export type PreloadStrategy = 'none' | 'metadata' | 'auto' | 'full';

/**
 * Video preloader state
 */
export interface PreloadState {
  /** Video ID */
  id: string;
  /** Whether metadata is loaded */
  metadataLoaded: boolean;
  /** Whether video is fully loaded */
  fullyLoaded: boolean;
  /** Loading progress (0-1) */
  progress: number;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * Creates a video preloader for optimizing playback
 *
 * @returns Preloader instance with methods to preload videos
 *
 * @example
 * const preloader = createVideoPreloader();
 *
 * // Preload on hover
 * const handleHover = (video: VideoItem) => {
 *   preloader.preloadMetadata(video);
 * };
 *
 * // Cleanup
 * preloader.clear();
 */
export function createVideoPreloader(): {
  preloadMetadata: (video: VideoItem) => Promise<void>;
  preloadFull: (video: VideoItem) => Promise<void>;
  getState: (id: string) => PreloadState | undefined;
  clear: () => void;
  clearOne: (id: string) => void;
} {
  const cache = new Map<string, HTMLVideoElement>();
  const states = new Map<string, PreloadState>();

  const updateState = (id: string, update: Partial<PreloadState>) => {
    const current = states.get(id) ?? {
      id,
      metadataLoaded: false,
      fullyLoaded: false,
      progress: 0,
      error: null,
    };
    states.set(id, { ...current, ...update });
  };

  const preloadMetadata = async (video: VideoItem): Promise<void> => {
    if (cache.has(video.id)) {
      return;
    }

    const element = document.createElement('video');
    element.preload = 'metadata';
    element.muted = true;
    cache.set(video.id, element);
    updateState(video.id, { id: video.id });

    return new Promise((resolve, reject) => {
      element.onloadedmetadata = () => {
        updateState(video.id, { metadataLoaded: true });
        resolve();
      };

      element.onerror = () => {
        const error = new Error(`Failed to preload metadata for video: ${video.id}`);
        updateState(video.id, { error });
        reject(error);
      };

      element.src = video.src;
    });
  };

  const preloadFull = async (video: VideoItem): Promise<void> => {
    let element = cache.get(video.id);

    if (!element) {
      element = document.createElement('video');
      element.muted = true;
      cache.set(video.id, element);
      updateState(video.id, { id: video.id });
    }

    element.preload = 'auto';

    return new Promise((resolve, reject) => {
      element.onprogress = () => {
        if (element.buffered.length > 0) {
          const progress = element.buffered.end(element.buffered.length - 1) / element.duration;
          updateState(video.id, { progress: Number.isFinite(progress) ? progress : 0 });
        }
      };

      element.oncanplaythrough = () => {
        updateState(video.id, { fullyLoaded: true, progress: 1 });
        resolve();
      };

      element.onerror = () => {
        const error = new Error(`Failed to preload video: ${video.id}`);
        updateState(video.id, { error });
        reject(error);
      };

      if (!element.src) {
        element.src = video.src;
      }

      element.load();
    });
  };

  const getState = (id: string): PreloadState | undefined => {
    return states.get(id);
  };

  const clearOne = (id: string) => {
    const element = cache.get(id);
    if (element) {
      element.src = '';
      element.load();
      cache.delete(id);
    }
    states.delete(id);
  };

  const clear = () => {
    cache.forEach((element) => {
      element.src = '';
      element.load();
    });
    cache.clear();
    states.clear();
  };

  return {
    preloadMetadata,
    preloadFull,
    getState,
    clear,
    clearOne,
  };
}

/**
 * Preload a single video's thumbnail image
 *
 * @param video - Video with thumbnail to preload
 * @returns Promise that resolves when loaded
 */
export function preloadThumbnail(video: VideoItem): Promise<void> {
  const thumbnail = video.thumbnail;
  if (!thumbnail) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload thumbnail: ${thumbnail}`));
    img.src = thumbnail;
  });
}

/**
 * Preload multiple thumbnails with concurrency limit
 *
 * @param videos - Videos with thumbnails to preload
 * @param concurrency - Maximum concurrent loads (default: 3)
 * @returns Promise that resolves when all loaded
 * 
 * @example
 * ```ts
 * // Preload first 10 video thumbnails
 * await preloadThumbnails(videos.slice(0, 10));
 * 
 * // With custom concurrency
 * await preloadThumbnails(videos, 5);
 * ```
 */
export async function preloadThumbnails(videos: VideoItem[], concurrency = 3): Promise<void> {
  const videosWithThumbnails = videos.filter((v) => v.thumbnail);
  
  // Process in batches
  for (let i = 0; i < videosWithThumbnails.length; i += concurrency) {
    const batch = videosWithThumbnails.slice(i, i + concurrency);
    await Promise.allSettled(batch.map(preloadThumbnail));
  }
}
