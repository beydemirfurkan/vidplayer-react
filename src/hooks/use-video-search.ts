import { useState, useEffect, useMemo } from 'react';
import type { VideoItem, UseVideoSearchOptions, UseVideoSearchReturn } from '../types';

/**
 * Default search fields
 */
const DEFAULT_SEARCH_FIELDS: Array<'title' | 'description' | 'tags'> = [
  'title',
  'description',
  'tags',
];

/**
 * Searches videos based on query
 */
function searchVideos(
  videos: VideoItem[],
  query: string,
  fields: Array<'title' | 'description' | 'tags'>
): VideoItem[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return videos;
  }

  return videos.filter((video) => {
    const searchableTexts: string[] = [];

    if (fields.includes('title') && video.title) {
      searchableTexts.push(video.title.toLowerCase());
    }

    if (fields.includes('description') && video.description) {
      searchableTexts.push(video.description.toLowerCase());
    }

    if (fields.includes('tags') && video.tags) {
      searchableTexts.push(...video.tags.map((t) => t.toLowerCase()));
    }

    return searchableTexts.some((text) => text.includes(normalizedQuery));
  });
}

/**
 * Hook for searching through videos with debouncing
 *
 * Provides debounced search functionality across video metadata.
 *
 * @param options - Search configuration options
 * @returns Search results and loading state
 *
 * @example
 * const [query, setQuery] = useState('');
 * const { results, isSearching } = useVideoSearch({
 *   videos: allVideos,
 *   query,
 *   debounceMs: 300,
 * });
 *
 * return (
 *   <div>
 *     <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *     {isSearching ? 'Searching...' : `${results.length} results`}
 *   </div>
 * );
 */
export function useVideoSearch(options: UseVideoSearchOptions): UseVideoSearchReturn {
  const {
    videos,
    query,
    debounceMs = 300,
    searchFields = DEFAULT_SEARCH_FIELDS,
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the query
  useEffect(() => {
    if (query === debouncedQuery) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debounceMs, debouncedQuery]);

  // Filter videos based on debounced query
  const results = useMemo(() => {
    return searchVideos(videos, debouncedQuery, searchFields);
  }, [videos, debouncedQuery, searchFields]);

  return {
    results,
    isSearching,
  };
}

/**
 * Hook for instant search (no debouncing)
 *
 * Use this when you want immediate search results, such as when
 * filtering is triggered by a button click rather than typing.
 *
 * @param videos - Videos to search through
 * @param query - Search query
 * @param searchFields - Fields to search in
 * @returns Filtered videos
 *
 * @example
 * const filteredVideos = useVideoSearchInstant(
 *   allVideos,
 *   searchQuery,
 *   ['title', 'tags']
 * );
 */
export function useVideoSearchInstant(
  videos: VideoItem[],
  query: string,
  searchFields: Array<'title' | 'description' | 'tags'> = DEFAULT_SEARCH_FIELDS
): VideoItem[] {
  return useMemo(() => {
    return searchVideos(videos, query, searchFields);
  }, [videos, query, searchFields]);
}
