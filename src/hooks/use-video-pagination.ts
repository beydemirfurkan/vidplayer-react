import { useState, useMemo, useCallback, useEffect } from 'react';
import type { VideoItem, UseVideoPaginationOptions, UseVideoPaginationReturn } from '../types';

/**
 * Hook for paginating videos
 *
 * Provides pagination controls for navigating through a video collection.
 * Automatically resets to page 1 when the video list changes.
 *
 * @param options - Pagination configuration options
 * @returns Pagination state and control functions
 *
 * @example
 * const {
 *   paginatedVideos,
 *   currentPage,
 *   totalPages,
 *   hasNext,
 *   hasPrev,
 *   nextPage,
 *   prevPage,
 * } = useVideoPagination({
 *   videos: filteredVideos,
 *   pageSize: 12,
 * });
 *
 * return (
 *   <div>
 *     <VideoGrid videos={paginatedVideos} />
 *     <button onClick={prevPage} disabled={!hasPrev}>Previous</button>
 *     <span>Page {currentPage} of {totalPages}</span>
 *     <button onClick={nextPage} disabled={!hasNext}>Next</button>
 *   </div>
 * );
 */
export function useVideoPagination(options: UseVideoPaginationOptions): UseVideoPaginationReturn {
  const { videos, pageSize, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(videos.length / pageSize));
  }, [videos.length, pageSize]);

  // Reset to page 1 when videos change (e.g., new search results)
  useEffect(() => {
    setCurrentPage(1);
  }, [videos.length, pageSize]);

  // Clamp current page to valid range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Get videos for current page
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return videos.slice(startIndex, endIndex);
  }, [videos, currentPage, pageSize]);

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clampedPage);
    },
    [totalPages]
  );

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedVideos,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

/**
 * Hook for infinite scroll pagination
 *
 * Instead of discrete pages, accumulates videos as user scrolls.
 *
 * @param videos - All videos to paginate
 * @param pageSize - Number of items to load at a time
 * @returns Accumulated videos and load more function
 *
 * @example
 * const { visibleVideos, loadMore, hasMore, isLoading } = useInfiniteVideos(
 *   allVideos,
 *   12
 * );
 *
 * return (
 *   <div>
 *     <VideoGrid videos={visibleVideos} />
 *     {hasMore && (
 *       <button onClick={loadMore}>
 *         {isLoading ? 'Loading...' : 'Load More'}
 *       </button>
 *     )}
 *   </div>
 * );
 */
export function useInfiniteVideos(
  videos: VideoItem[],
  pageSize: number
): {
  visibleVideos: VideoItem[];
  loadMore: () => void;
  hasMore: boolean;
  reset: () => void;
  loadedCount: number;
} {
  const [loadedCount, setLoadedCount] = useState(pageSize);

  // Reset when videos change
  useEffect(() => {
    setLoadedCount(pageSize);
  }, [videos.length, pageSize]);

  const visibleVideos = useMemo(() => {
    return videos.slice(0, loadedCount);
  }, [videos, loadedCount]);

  const hasMore = loadedCount < videos.length;

  const loadMore = useCallback(() => {
    setLoadedCount((prev) => Math.min(prev + pageSize, videos.length));
  }, [pageSize, videos.length]);

  const reset = useCallback(() => {
    setLoadedCount(pageSize);
  }, [pageSize]);

  return {
    visibleVideos,
    loadMore,
    hasMore,
    reset,
    loadedCount,
  };
}
