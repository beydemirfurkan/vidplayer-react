# vidplayer-react

[![npm version](https://img.shields.io/npm/v/vidplayer-react.svg)](https://www.npmjs.com/package/vidplayer-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready, headless-first video player library for React 18+ with full SSR/Next.js support.

## Features

- **Headless-first** - All components are unstyled, using only `className` props and data attributes
- **Fully controlled** - Props-only state management, no internal state
- **Tree-shakeable** - Import only what you need
- **TypeScript** - Full type safety with comprehensive type definitions
- **SSR/Next.js Ready** - Works seamlessly with Server-Side Rendering and React Server Components
- **Performance optimized** - Lazy loading, memoization, thumbnail caching with LRU eviction
- **Accessible** - Keyboard navigation (YouTube-style), ARIA attributes, semantic HTML
- **Customizable Icons** - Use your own icon components or the built-in defaults
- **Thumbnail Preview** - YouTube-style thumbnail preview on progress bar hover

## Installation

```bash
npm install vidplayer-react
# or
pnpm add vidplayer-react
# or
yarn add vidplayer-react
```

## Quick Start

```tsx
import { VideoPlayer, useVideoLibrary } from 'vidplayer-react';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { sortedVideos } = useVideoLibrary({
    videos: myVideos,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <VideoPlayer
      video={selectedVideo}
      showControls
      className="aspect-video bg-black rounded-lg"
    />
  );
}
```

## Next.js Usage

### App Router (Recommended)

```tsx
// app/video/page.tsx
'use client';

import { VideoPlayer, VideoProvider } from 'vidplayer-react';

export default function VideoPage() {
  return (
    <VideoProvider accentColor="#3b82f6">
      <VideoPlayer
        video={myVideo}
        showControls
      />
    </VideoProvider>
  );
}
```

### Pages Router

```tsx
// pages/video.tsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('vidplayer-react').then((mod) => mod.VideoPlayer),
  { ssr: false }
);

export default function VideoPage() {
  return <VideoPlayer video={myVideo} showControls />;
}
```

## API Reference

### Components

#### `<VideoProvider />`

Global configuration provider for all video components.

```tsx
<VideoProvider
  accentColor="#ef4444"
  skipDuration={10}
  keyboardShortcuts={true}
  icons={{
    play: MyPlayIcon,
    pause: MyPauseIcon,
  }}
>
  {children}
</VideoProvider>
```

#### `<VideoPlayer />`

```tsx
<VideoPlayer
  video={VideoItem | null}
  autoPlay={boolean}
  muted={boolean}
  loop={boolean}
  showControls={boolean}
  skipDuration={number}
  qualityOptions={VideoQualityOption[]}
  accentColor={string}
  icons={IconProps}
  onTimeUpdate={(time) => void}
  onEnded={() => void}
  onError={(error) => void}
  className={string}
/>
```

#### `<VideoThumbnail />`

```tsx
<VideoThumbnail
  video={VideoItem}
  aspectRatio={number}
  isSelected={boolean}
  onClick={(video) => void}
  lazy={boolean}
  placeholder={ReactNode}
  className={string}
/>
```

### Hooks

#### `useVideoPlayer(options)`

Controls video playback with full state management.

```tsx
const {
  videoRef,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  play,
  pause,
  toggle,
  seek,
  setVolume,
  toggleMute,
  toggleFullscreen,
} = useVideoPlayer({
  video: VideoItem | null,
  autoPlay?: boolean,
  muted?: boolean,
  loop?: boolean,
  onTimeUpdate?: (time: number) => void,
  onEnded?: () => void,
});
```

#### `useVideoLibrary(options)`

Manages a video collection with filtering and sorting.

```tsx
const { sortedVideos, filteredVideos, totalCount, getVideoById, allTags } = useVideoLibrary({
  videos: VideoItem[],
  sortBy?: 'createdAt' | 'title' | 'views' | 'duration',
  sortOrder?: 'asc' | 'desc',
  filterTags?: string[],
  searchQuery?: string,
});
```

#### `useVideoSearch(options)`

Debounced search with loading state.

```tsx
const { results, isSearching } = useVideoSearch({
  videos: VideoItem[],
  query: string,
  debounceMs?: number,
  searchFields?: ('title' | 'description' | 'tags')[],
});
```

#### `useVideoPagination(options)`

Pagination with navigation controls.

```tsx
const {
  paginatedVideos,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  goToPage,
} = useVideoPagination({
  videos: VideoItem[],
  pageSize: number,
  initialPage?: number,
});
```

### Utilities

```tsx
import {
  formatDuration,
  parseDuration,
  formatRelativeTime,
  formatViewCount,
  debounce,
  throttle,
  createVideoPreloader,
} from 'vidplayer-react';

formatDuration(65);        // "1:05"
formatDuration(3665);      // "1:01:05"
formatViewCount(1234567);  // "1.2M"
```

## Keyboard Shortcuts

YouTube-style keyboard shortcuts are enabled by default:

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `←` / `J` | Seek backward |
| `→` / `L` | Seek forward |
| `↑` / `↓` | Volume up/down |
| `M` | Mute |
| `F` | Fullscreen |
| `Home` / `End` | Start/End |
| `>` / `<` | Speed up/down |
| `0-9` | Seek to 0%-90% |

## Styling

Components are headless and use data attributes for styling hooks:

```css
/* Style selected state */
[data-selected] {
  border: 2px solid blue;
}

/* Style playing state */
[data-playing] {
  /* ... */
}

/* Style buffering state */
[data-buffering] [data-slot="loading"] {
  display: block;
}

/* Use CSS custom properties */
[data-video-player] {
  --video-accent-color: #3b82f6;
  --video-control-bg: rgba(0, 0, 0, 0.85);
}
```

## Sub-package Imports

Import specific parts of the library for optimal tree-shaking:

```tsx
// Only hooks
import { useVideoLibrary, useVideoPlayer } from 'vidplayer-react/hooks';

// Only components
import { VideoPlayer, VideoThumbnail } from 'vidplayer-react/components';

// Only utilities
import { formatDuration, debounce } from 'vidplayer-react/utils';
```

## Types

```tsx
import type {
  VideoItem,
  VideoSortField,
  UseVideoLibraryOptions,
  UseVideoPlayerReturn,
  VideoPlayerProps,
} from 'vidplayer-react';

interface VideoItem {
  id: string;
  src: string;
  title?: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string;
  views?: number;
  progress?: number;
}
```

## License

MIT

## Author

Furkan Beydemir - [@beydemirfurkan](https://github.com/beydemirfurkan)
