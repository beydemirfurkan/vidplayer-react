import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoPagination, useInfiniteVideos } from '../../src/hooks/use-video-pagination';
import type { VideoItem } from '../../src/types';

const createMockVideos = (count: number): VideoItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    src: `/video-${i + 1}.mp4`,
    title: `Video ${i + 1}`,
  }));

describe('useVideoPagination', () => {
  it('returns first page of videos', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedVideos).toHaveLength(10);
    expect(result.current.paginatedVideos[0]?.id).toBe('1');
  });

  it('navigates to next page', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedVideos[0]?.id).toBe('11');
  });

  it('navigates to previous page', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10, initialPage: 2 })
    );

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('goes to specific page', () => {
    const videos = createMockVideos(50);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedVideos[0]?.id).toBe('21');
  });

  it('clamps page to valid range', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    act(() => {
      result.current.goToPage(100);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.goToPage(-5);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('reports hasNext and hasPrev correctly', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrev).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrev).toBe(true);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrev).toBe(true);
  });

  it('resets to page 1', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10, initialPage: 3 })
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('handles last page with fewer items', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useVideoPagination({ videos, pageSize: 10 })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.paginatedVideos).toHaveLength(5);
  });

  it('handles empty video list', () => {
    const { result } = renderHook(() =>
      useVideoPagination({ videos: [], pageSize: 10 })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedVideos).toHaveLength(0);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrev).toBe(false);
  });
});

describe('useInfiniteVideos', () => {
  it('returns initial page of videos', () => {
    const videos = createMockVideos(50);
    const { result } = renderHook(() =>
      useInfiniteVideos(videos, 10)
    );

    expect(result.current.visibleVideos).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loadedCount).toBe(10);
  });

  it('loads more videos', () => {
    const videos = createMockVideos(50);
    const { result } = renderHook(() =>
      useInfiniteVideos(videos, 10)
    );

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleVideos).toHaveLength(20);
    expect(result.current.loadedCount).toBe(20);
  });

  it('stops loading when all videos are visible', () => {
    const videos = createMockVideos(25);
    const { result } = renderHook(() =>
      useInfiniteVideos(videos, 10)
    );

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(result.current.visibleVideos).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  it('resets to initial page size', () => {
    const videos = createMockVideos(50);
    const { result } = renderHook(() =>
      useInfiniteVideos(videos, 10)
    );

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(result.current.visibleVideos).toHaveLength(30);

    act(() => {
      result.current.reset();
    });

    expect(result.current.visibleVideos).toHaveLength(10);
  });

  it('handles empty video list', () => {
    const { result } = renderHook(() =>
      useInfiniteVideos([], 10)
    );

    expect(result.current.visibleVideos).toHaveLength(0);
    expect(result.current.hasMore).toBe(false);
  });
});
