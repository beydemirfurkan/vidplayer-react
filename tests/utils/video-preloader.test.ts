import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { preloadThumbnail, preloadThumbnails } from '../../src/utils/video-preloader';
import type { VideoItem } from '../../src/types';

describe('preloadThumbnail', () => {
  let mockImage: { onload?: () => void; onerror?: () => void; src?: string };

  beforeEach(() => {
    mockImage = {};
    vi.spyOn(globalThis, 'Image').mockImplementation(() => mockImage as HTMLImageElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves when image loads successfully', async () => {
    const video: VideoItem = { id: '1', src: '/video.mp4', thumbnail: '/thumb.jpg' };
    
    const promise = preloadThumbnail(video);
    mockImage.onload?.();
    
    await expect(promise).resolves.toBeUndefined();
    expect(mockImage.src).toBe('/thumb.jpg');
  });

  it('rejects when image fails to load', async () => {
    const video: VideoItem = { id: '1', src: '/video.mp4', thumbnail: '/thumb.jpg' };
    
    const promise = preloadThumbnail(video);
    mockImage.onerror?.();
    
    await expect(promise).rejects.toThrow('Failed to preload thumbnail');
  });

  it('resolves immediately for videos without thumbnail', async () => {
    const video: VideoItem = { id: '1', src: '/video.mp4' };
    
    await expect(preloadThumbnail(video)).resolves.toBeUndefined();
    expect(globalThis.Image).not.toHaveBeenCalled();
  });
});

describe('preloadThumbnails', () => {
  let imageInstances: Array<{ onload?: () => void; onerror?: () => void; src?: string }>;

  beforeEach(() => {
    imageInstances = [];
    vi.spyOn(globalThis, 'Image').mockImplementation(() => {
      const img = { onload: undefined, onerror: undefined, src: undefined };
      imageInstances.push(img);
      return img as unknown as HTMLImageElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preloads multiple thumbnails', async () => {
    const videos: VideoItem[] = [
      { id: '1', src: '/v1.mp4', thumbnail: '/t1.jpg' },
      { id: '2', src: '/v2.mp4', thumbnail: '/t2.jpg' },
    ];

    const promise = preloadThumbnails(videos, 3);
    
    // Simulate all images loading
    await vi.waitFor(() => {
      imageInstances.forEach(img => img.onload?.());
    });

    await promise;
    expect(imageInstances).toHaveLength(2);
  });

  it('skips videos without thumbnails', async () => {
    const videos: VideoItem[] = [
      { id: '1', src: '/v1.mp4', thumbnail: '/t1.jpg' },
      { id: '2', src: '/v2.mp4' }, // No thumbnail
      { id: '3', src: '/v3.mp4', thumbnail: '/t3.jpg' },
    ];

    const promise = preloadThumbnails(videos, 3);
    
    await vi.waitFor(() => {
      imageInstances.forEach(img => img.onload?.());
    });

    await promise;
    expect(imageInstances).toHaveLength(2);
  });

  it('handles empty array', async () => {
    await expect(preloadThumbnails([])).resolves.toBeUndefined();
    expect(imageInstances).toHaveLength(0);
  });

  it('continues on individual failures', async () => {
    const videos: VideoItem[] = [
      { id: '1', src: '/v1.mp4', thumbnail: '/t1.jpg' },
      { id: '2', src: '/v2.mp4', thumbnail: '/t2.jpg' },
    ];

    const promise = preloadThumbnails(videos, 3);
    
    await vi.waitFor(() => {
      // First fails, second succeeds
      imageInstances[0]?.onerror?.();
      imageInstances[1]?.onload?.();
    });

    // Should not throw
    await expect(promise).resolves.toBeUndefined();
  });
});
