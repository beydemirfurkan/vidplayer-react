import { useState } from 'react';
import {
  useVideoLibrary,
  useVideoSearch,
  useVideoPagination,
  VideoGrid,
  VideoList,
  VideoPlayer,
  formatViewCount,
  type VideoItem,
} from 'video-library';

// Sample video data
const sampleVideos: VideoItem[] = [
  {
    id: '1',
    src: 'https://example.com/video1.mp4',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React including components, props, and state.',
    duration: 720,
    thumbnail: 'https://example.com/thumb1.jpg',
    tags: ['react', 'javascript', 'tutorial'],
    createdAt: '2024-01-15T10:00:00Z',
    views: 15000,
    progress: 0.5,
  },
  {
    id: '2',
    src: 'https://example.com/video2.mp4',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript features and patterns.',
    duration: 1200,
    thumbnail: 'https://example.com/thumb2.jpg',
    tags: ['typescript', 'advanced'],
    createdAt: '2024-01-20T10:00:00Z',
    views: 8500,
  },
  {
    id: '3',
    src: 'https://example.com/video3.mp4',
    title: 'React Hooks Deep Dive',
    description: 'Understanding useEffect, useCallback, useMemo, and custom hooks.',
    duration: 900,
    thumbnail: 'https://example.com/thumb3.jpg',
    tags: ['react', 'hooks', 'advanced'],
    createdAt: '2024-01-10T10:00:00Z',
    views: 25000,
  },
];

/**
 * Basic example with grid layout
 */
export function BasicGridExample() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const { sortedVideos } = useVideoLibrary({
    videos: sampleVideos,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Video Grid */}
      <div style={{ flex: 1 }}>
        <VideoGrid
          videos={sortedVideos}
          selectedId={selectedVideo?.id ?? null}
          onSelect={setSelectedVideo}
          columns={2}
          gap={16}
          enableKeyboardNav
        />
      </div>

      {/* Video Player */}
      <div style={{ width: '480px' }}>
        <VideoPlayer
          video={selectedVideo}
          showControls
          autoPlay={false}
        />
        {selectedVideo && (
          <div>
            <h2>{selectedVideo.title}</h2>
            <p>{selectedVideo.description}</p>
            <span>{formatViewCount(selectedVideo.views ?? 0)} views</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Search and filter example
 */
export function SearchAndFilterExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const { sortedVideos, allTags } = useVideoLibrary({
    videos: sampleVideos,
    sortBy: 'views',
    sortOrder: 'desc',
    filterTags: selectedTags,
    searchQuery,
  });

  const { results, isSearching } = useVideoSearch({
    videos: sortedVideos,
    query: searchQuery,
    debounceMs: 300,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div>
      {/* Search Input */}
      <div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos..."
        />
        {isSearching && <span>Searching...</span>}
      </div>

      {/* Tag Filters */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            style={{
              background: selectedTags.includes(tag) ? '#3b82f6' : '#e5e7eb',
              color: selectedTags.includes(tag) ? 'white' : 'black',
              padding: '4px 12px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ marginTop: '24px' }}>
        <p>{results.length} videos found</p>
        <VideoList
          videos={results}
          selectedId={selectedVideo?.id ?? null}
          onSelect={setSelectedVideo}
          variant="detailed"
        />
      </div>
    </div>
  );
}

/**
 * Pagination example
 */
export function PaginationExample() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const { sortedVideos } = useVideoLibrary({
    videos: sampleVideos,
  });

  const {
    paginatedVideos,
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
  } = useVideoPagination({
    videos: sortedVideos,
    pageSize: 2,
  });

  return (
    <div>
      <VideoGrid
        videos={paginatedVideos}
        selectedId={selectedVideo?.id ?? null}
        onSelect={setSelectedVideo}
        columns={2}
      />

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
        <button onClick={prevPage} disabled={!hasPrev}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={!hasNext}>
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Custom rendering example
 */
export function CustomRenderingExample() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  return (
    <VideoGrid
      videos={sampleVideos}
      selectedId={selectedVideo?.id ?? null}
      onSelect={setSelectedVideo}
      columns={3}
      renderItem={(video, { isSelected, isFocused }) => (
        <div
          style={{
            border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            outline: isFocused ? '2px solid #f59e0b' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Custom thumbnail */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            {/* Custom progress bar */}
            {video.progress !== undefined && video.progress > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '4px',
                  width: `${video.progress * 100}%`,
                  background: '#ef4444',
                }}
              />
            )}
          </div>

          {/* Custom content */}
          <div style={{ padding: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              {video.title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
              {formatViewCount(video.views ?? 0)} views
            </p>
          </div>
        </div>
      )}
    />
  );
}
