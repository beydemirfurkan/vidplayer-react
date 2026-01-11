import { useMemo, useCallback } from 'react';
import type {
  VideoItem,
  UseVideoLibraryOptions,
  UseVideoLibraryReturn,
  VideoSortField,
  SortOrder,
} from '../types';

/**
 * Compares two values for sorting
 */
function compareValues<T>(a: T, b: T, order: SortOrder): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return order === 'asc' ? 1 : -1;
  if (b === undefined || b === null) return order === 'asc' ? -1 : 1;

  const result = a < b ? -1 : 1;
  return order === 'asc' ? result : -result;
}

/**
 * Gets the sortable value from a video based on the sort field
 */
function getSortValue(video: VideoItem, field: VideoSortField): string | number | undefined {
  switch (field) {
    case 'title':
      return video.title?.toLowerCase();
    case 'createdAt':
      return video.createdAt ? new Date(video.createdAt).getTime() : undefined;
    case 'views':
      return video.views;
    case 'duration':
      return video.duration;
    default:
      return undefined;
  }
}

/**
 * Checks if a video matches the search query
 */
function matchesSearch(video: VideoItem, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return true;

  const searchableText = [
    video.title ?? '',
    video.description ?? '',
    ...(video.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

/**
 * Checks if a video matches the tag filter
 */
function matchesTags(video: VideoItem, filterTags: string[]): boolean {
  if (filterTags.length === 0) return true;
  if (!video.tags || video.tags.length === 0) return false;

  const videoTagsLower = video.tags.map((t) => t.toLowerCase());
  return filterTags.some((tag) => videoTagsLower.includes(tag.toLowerCase()));
}

/**
 * Hook for managing a video library collection
 *
 * Provides filtering, sorting, and lookup functionality for videos.
 * Follows controlled component pattern - all state is derived from props.
 *
 * @param options - Library configuration options
 * @returns Library state and helper functions
 *
 * @example
 * const { sortedVideos, getVideoById, allTags } = useVideoLibrary({
 *   videos: myVideos,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   searchQuery: searchTerm,
 *   filterTags: selectedTags,
 * });
 */
export function useVideoLibrary(options: UseVideoLibraryOptions): UseVideoLibraryReturn {
  const {
    videos,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    filterTags = [],
    searchQuery = '',
  } = options;

  // Extract all unique tags from videos
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    videos.forEach((video) => {
      video.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [videos]);

  // Filter videos by search query and tags
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      return matchesSearch(video, searchQuery) && matchesTags(video, filterTags);
    });
  }, [videos, searchQuery, filterTags]);

  // Sort filtered videos
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      return compareValues(aValue, bValue, sortOrder);
    });
  }, [filteredVideos, sortBy, sortOrder]);

  // Lookup function for getting video by ID
  const getVideoById = useCallback(
    (id: string): VideoItem | undefined => {
      return videos.find((video) => video.id === id);
    },
    [videos]
  );

  return {
    filteredVideos,
    sortedVideos,
    totalCount: filteredVideos.length,
    getVideoById,
    allTags,
  };
}
