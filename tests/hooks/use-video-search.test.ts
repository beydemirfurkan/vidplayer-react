import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoSearch, useVideoSearchInstant } from '../../src/hooks/use-video-search';
import type { VideoItem } from '../../src/types';

const mockVideos: VideoItem[] = [
  { id: '1', src: '/v1.mp4', title: 'React Tutorial', description: 'Learn React basics', tags: ['react', 'tutorial'] },
  { id: '2', src: '/v2.mp4', title: 'Vue Guide', description: 'Vue.js introduction', tags: ['vue', 'guide'] },
  { id: '3', src: '/v3.mp4', title: 'TypeScript Tips', description: 'Advanced TypeScript', tags: ['typescript', 'tips'] },
  { id: '4', src: '/v4.mp4', title: 'React Hooks', description: 'Using hooks effectively', tags: ['react', 'hooks'] },
];

describe('useVideoSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all videos when query is empty', () => {
    const { result } = renderHook(() =>
      useVideoSearch({ videos: mockVideos, query: '' })
    );

    expect(result.current.results).toHaveLength(4);
    expect(result.current.isSearching).toBe(false);
  });

  it('filters videos by title', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearch({ videos: mockVideos, query, debounceMs: 100 }),
      { initialProps: { query: '' } }
    );

    rerender({ query: 'React' });
    expect(result.current.isSearching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toHaveLength(2);
    expect(result.current.results.map(v => v.id)).toEqual(['1', '4']);
  });

  it('filters videos by description', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearch({ videos: mockVideos, query, debounceMs: 100 }),
      { initialProps: { query: '' } }
    );

    rerender({ query: 'Advanced' });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]?.id).toBe('3');
  });

  it('filters videos by tags', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearch({ videos: mockVideos, query, debounceMs: 100 }),
      { initialProps: { query: '' } }
    );

    rerender({ query: 'tutorial' });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]?.id).toBe('1');
  });

  it('is case insensitive', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearch({ videos: mockVideos, query, debounceMs: 100 }),
      { initialProps: { query: '' } }
    );

    rerender({ query: 'REACT' });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toHaveLength(2);
  });

  it('respects custom search fields', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearch({ 
        videos: mockVideos, 
        query, 
        debounceMs: 100,
        searchFields: ['title'] // Only search in title
      }),
      { initialProps: { query: '' } }
    );

    rerender({ query: 'Advanced' }); // This is in description, not title
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toHaveLength(0);
  });
});

describe('useVideoSearchInstant', () => {
  it('returns filtered results immediately', () => {
    const { result } = renderHook(() =>
      useVideoSearchInstant(mockVideos, 'React')
    );

    expect(result.current).toHaveLength(2);
  });

  it('returns all videos for empty query', () => {
    const { result } = renderHook(() =>
      useVideoSearchInstant(mockVideos, '')
    );

    expect(result.current).toHaveLength(4);
  });

  it('updates immediately when query changes', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useVideoSearchInstant(mockVideos, query),
      { initialProps: { query: 'React' } }
    );

    expect(result.current).toHaveLength(2);

    rerender({ query: 'Vue' });
    expect(result.current).toHaveLength(1);
  });
});
