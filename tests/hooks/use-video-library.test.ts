import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVideoLibrary } from '../../src/hooks/use-video-library';
import type { VideoItem } from '../../src/types';

const mockVideos: VideoItem[] = [
  {
    id: '1',
    src: 'video1.mp4',
    title: 'Introduction to React',
    description: 'Learn the basics of React',
    duration: 300,
    tags: ['react', 'tutorial'],
    createdAt: '2024-01-15T10:00:00Z',
    views: 1000,
  },
  {
    id: '2',
    src: 'video2.mp4',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript',
    duration: 600,
    tags: ['typescript', 'advanced'],
    createdAt: '2024-01-20T10:00:00Z',
    views: 500,
  },
  {
    id: '3',
    src: 'video3.mp4',
    title: 'React Hooks Tutorial',
    description: 'Understanding React hooks',
    duration: 450,
    tags: ['react', 'hooks'],
    createdAt: '2024-01-10T10:00:00Z',
    views: 2000,
  },
];

describe('useVideoLibrary', () => {
  describe('basic functionality', () => {
    it('returns all videos when no filters applied', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({ videos: mockVideos })
      );

      expect(result.current.filteredVideos).toHaveLength(3);
      expect(result.current.sortedVideos).toHaveLength(3);
      expect(result.current.totalCount).toBe(3);
    });

    it('extracts all unique tags', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({ videos: mockVideos })
      );

      expect(result.current.allTags).toEqual([
        'advanced',
        'hooks',
        'react',
        'tutorial',
        'typescript',
      ]);
    });

    it('finds video by id', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({ videos: mockVideos })
      );

      const video = result.current.getVideoById('2');
      expect(video?.title).toBe('Advanced TypeScript');

      const notFound = result.current.getVideoById('999');
      expect(notFound).toBeUndefined();
    });
  });

  describe('sorting', () => {
    it('sorts by createdAt descending by default', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({ videos: mockVideos })
      );

      expect(result.current.sortedVideos[0]?.id).toBe('2'); // Most recent
      expect(result.current.sortedVideos[2]?.id).toBe('3'); // Oldest
    });

    it('sorts by createdAt ascending', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        })
      );

      expect(result.current.sortedVideos[0]?.id).toBe('3'); // Oldest
      expect(result.current.sortedVideos[2]?.id).toBe('2'); // Most recent
    });

    it('sorts by title', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          sortBy: 'title',
          sortOrder: 'asc',
        })
      );

      expect(result.current.sortedVideos[0]?.title).toBe('Advanced TypeScript');
      expect(result.current.sortedVideos[2]?.title).toBe('React Hooks Tutorial');
    });

    it('sorts by views', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          sortBy: 'views',
          sortOrder: 'desc',
        })
      );

      expect(result.current.sortedVideos[0]?.id).toBe('3'); // 2000 views
      expect(result.current.sortedVideos[2]?.id).toBe('2'); // 500 views
    });

    it('sorts by duration', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          sortBy: 'duration',
          sortOrder: 'asc',
        })
      );

      expect(result.current.sortedVideos[0]?.id).toBe('1'); // 300s
      expect(result.current.sortedVideos[2]?.id).toBe('2'); // 600s
    });
  });

  describe('filtering', () => {
    it('filters by search query in title', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          searchQuery: 'react',
        })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
      expect(result.current.filteredVideos.map((v) => v.id)).toEqual(['1', '3']);
    });

    it('filters by search query in description', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          searchQuery: 'deep dive',
        })
      );

      expect(result.current.filteredVideos).toHaveLength(1);
      expect(result.current.filteredVideos[0]?.id).toBe('2');
    });

    it('filters by search query in tags', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          searchQuery: 'hooks',
        })
      );

      // 'hooks' tag is in video 3
      expect(result.current.filteredVideos).toHaveLength(1);
      expect(result.current.filteredVideos[0]?.id).toBe('3');
    });

    it('filters by tags', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          filterTags: ['react'],
        })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
      expect(result.current.filteredVideos.map((v) => v.id)).toEqual(['1', '3']);
    });

    it('filters by multiple tags (OR logic)', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          filterTags: ['typescript', 'hooks'],
        })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
      expect(result.current.filteredVideos.map((v) => v.id)).toEqual(['2', '3']);
    });

    it('combines search query and tag filters', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          searchQuery: 'react',
          filterTags: ['hooks'],
        })
      );

      expect(result.current.filteredVideos).toHaveLength(1);
      expect(result.current.filteredVideos[0]?.id).toBe('3');
    });
  });

  describe('edge cases', () => {
    it('handles empty video array', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({ videos: [] })
      );

      expect(result.current.filteredVideos).toHaveLength(0);
      expect(result.current.sortedVideos).toHaveLength(0);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.allTags).toEqual([]);
    });

    it('handles videos without optional fields', () => {
      const minimalVideos: VideoItem[] = [
        { id: '1', src: 'video.mp4' },
        { id: '2', src: 'video2.mp4' },
      ];

      const { result } = renderHook(() =>
        useVideoLibrary({ videos: minimalVideos })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
      expect(result.current.allTags).toEqual([]);
    });

    it('handles case-insensitive search', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          searchQuery: 'REACT',
        })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
    });

    it('handles case-insensitive tag filtering', () => {
      const { result } = renderHook(() =>
        useVideoLibrary({
          videos: mockVideos,
          filterTags: ['REACT'],
        })
      );

      expect(result.current.filteredVideos).toHaveLength(2);
    });
  });
});
