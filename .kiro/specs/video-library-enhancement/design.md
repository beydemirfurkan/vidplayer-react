# Design Document: Video Library Enhancement

## Overview

Bu tasarım dokümanı, `video-library` React kütüphanesinin yeniden adlandırılması, performans optimizasyonları, tasarım tutarlılığı iyileştirmeleri ve Next.js uyumluluğunun sağlanması için teknik çözümleri detaylandırır.

### Önerilen Yeni İsim: `@mantine/video` veya `react-vidstack-lite` veya `headless-video-react`

Alternatif isim önerileri:
- `vidplayer-react` - Kısa ve akılda kalıcı
- `react-video-headless` - Headless yaklaşımı vurgular
- `@scope/video-kit` - Scoped package olarak

## Architecture

### Mevcut Mimari

```
video-library/
├── src/
│   ├── components/     # React bileşenleri
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility fonksiyonları
├── dist/               # Build çıktıları (ESM, CJS, DTS)
└── tests/              # Test dosyaları
```

### Önerilen Mimari Değişiklikleri

```
{new-package-name}/
├── src/
│   ├── components/
│   │   ├── video-player/
│   │   │   ├── video-player.tsx      # "use client" eklenmeli
│   │   │   ├── video-controls.tsx    # Style refactoring
│   │   │   ├── video-progress.tsx
│   │   │   └── styles.ts             # Memoized styles (YENİ)
│   │   └── video-thumbnail/
│   ├── hooks/
│   │   └── *.ts                      # SSR-safe hooks
│   ├── context/
│   │   └── video-provider.tsx        # Global config context (YENİ)
│   ├── types/
│   │   └── index.ts                  # Generic VideoItem<T>
│   └── utils/
│       ├── ssr-safe.ts               # SSR utility helpers (YENİ)
│       └── *.ts
├── tests/
│   ├── ssr/                          # SSR tests (YENİ)
│   └── *.test.ts
└── examples/
    └── nextjs/                       # Next.js example (YENİ)
```

## Components and Interfaces

### 1. VideoProvider Context (Yeni)

```typescript
interface VideoProviderConfig {
  /** Default accent color for all components */
  accentColor?: string;
  /** Custom icon components */
  icons?: {
    play?: React.ComponentType<{ size?: number }>;
    pause?: React.ComponentType<{ size?: number }>;
    volumeHigh?: React.ComponentType<{ size?: number }>;
    volumeLow?: React.ComponentType<{ size?: number }>;
    volumeMute?: React.ComponentType<{ size?: number }>;
    fullscreen?: React.ComponentType<{ size?: number }>;
    fullscreenExit?: React.ComponentType<{ size?: number }>;
    settings?: React.ComponentType<{ size?: number }>;
    skipForward?: React.ComponentType<{ size?: number }>;
    skipBackward?: React.ComponentType<{ size?: number }>;
    pip?: React.ComponentType<{ size?: number }>;
  };
  /** Default keyboard shortcuts enabled */
  keyboardShortcuts?: boolean;
  /** Default skip duration in seconds */
  skipDuration?: number;
  /** Playback rate options */
  playbackRateOptions?: number[];
}

interface VideoContextValue extends VideoProviderConfig {
  // Internal state if needed
}

const VideoContext = createContext<VideoContextValue | null>(null);

export function VideoProvider({ 
  children, 
  ...config 
}: PropsWithChildren<VideoProviderConfig>) {
  const value = useMemo(() => config, [/* deps */]);
  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoConfig(): VideoContextValue {
  const context = useContext(VideoContext);
  return context ?? defaultConfig;
}
```

### 2. SSR-Safe Utilities (Yeni)

```typescript
// src/utils/ssr-safe.ts

/**
 * Check if code is running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Safe document access
 */
export function getDocument(): Document | null {
  return isBrowser ? document : null;
}

/**
 * Safe window access
 */
export function getWindow(): Window | null {
  return isBrowser ? window : null;
}

/**
 * Hook for browser-only effects
 */
export function useBrowserEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  useEffect(() => {
    if (isBrowser) {
      return effect();
    }
  }, deps);
}

/**
 * Hook for safe fullscreen state
 */
export function useFullscreenState(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useBrowserEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);
  
  return isFullscreen;
}
```

### 3. Memoized Styles Pattern

```typescript
// src/components/video-player/styles.ts

import { useMemo } from 'react';

const baseStyles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    background: '#000',
    overflow: 'hidden',
  },
  // ... diğer statik stiller
} as const;

export function useControlStyles(accentColor: string) {
  return useMemo(() => ({
    progressFilled: {
      ...baseStyles.progressFilled,
      background: accentColor,
    },
    progressThumb: {
      ...baseStyles.progressThumb,
      background: accentColor,
    },
  }), [accentColor]);
}

// CSS-in-JS yerine CSS custom properties kullanımı
export const cssVariables = {
  '--video-accent-color': 'var(--video-accent-color, #ef4444)',
  '--video-control-bg': 'var(--video-control-bg, rgba(0,0,0,0.85))',
  '--video-progress-height': 'var(--video-progress-height, 4px)',
} as const;
```

### 4. Global CSS Singleton Pattern

```typescript
// src/utils/inject-styles.ts

let stylesInjected = false;

const globalStyles = `
  @keyframes video-player-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  [data-video-player][data-fullscreen] {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100vh !important;
  }
  
  [data-video-player] video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export function injectGlobalStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-video-player-styles', '');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
  
  stylesInjected = true;
}

export function removeGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  
  const existing = document.querySelector('[data-video-player-styles]');
  if (existing) {
    existing.remove();
    stylesInjected = false;
  }
}
```

### 5. Custom Icons Support

```typescript
// src/components/video-player/video-controls.tsx

interface VideoControlsProps {
  // ... existing props
  
  /** Custom icon components (overrides VideoProvider icons) */
  icons?: Partial<VideoProviderConfig['icons']>;
}

function VideoControls({ icons: propIcons, ...props }: VideoControlsProps) {
  const config = useVideoConfig();
  
  // Merge icons: prop icons > context icons > default icons
  const icons = useMemo(() => ({
    play: propIcons?.play ?? config.icons?.play ?? MdPlayArrow,
    pause: propIcons?.pause ?? config.icons?.pause ?? MdPause,
    // ... diğer ikonlar
  }), [propIcons, config.icons]);
  
  const PlayIcon = icons.play;
  const PauseIcon = icons.pause;
  
  return (
    <button onClick={onTogglePlay}>
      {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
    </button>
  );
}
```

### 6. Generic VideoItem Type

```typescript
// src/types/index.ts

/**
 * Base video item interface
 */
export interface VideoItemBase {
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

/**
 * Generic VideoItem that can be extended with custom properties
 */
export type VideoItem<TExtension = object> = VideoItemBase & TExtension;

/**
 * Hook options with generic support
 */
export interface UseVideoLibraryOptions<T = object> {
  videos: VideoItem<T>[];
  sortBy?: VideoSortField;
  sortOrder?: SortOrder;
  filterTags?: string[];
  searchQuery?: string;
}
```

## Data Models

### VideoItem (Mevcut - Değişiklik Yok)

```typescript
interface VideoItem {
  id: string;           // Required: Unique identifier
  src: string;          // Required: Video source URL
  title?: string;       // Optional: Display title
  description?: string; // Optional: Description text
  duration?: number;    // Optional: Duration in seconds
  thumbnail?: string;   // Optional: Thumbnail URL
  tags?: string[];      // Optional: Categorization tags
  createdAt?: string;   // Optional: ISO date string
  views?: number;       // Optional: View count
  progress?: number;    // Optional: Playback progress (0-1)
}
```

### VideoProviderConfig (Yeni)

```typescript
interface VideoProviderConfig {
  accentColor?: string;                    // Default: '#ef4444'
  icons?: Record<string, ComponentType>;   // Custom icon components
  keyboardShortcuts?: boolean;             // Default: true
  skipDuration?: number;                   // Default: 10
  playbackRateOptions?: number[];          // Default: [0.25...4]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Export Consistency

*For any* previously exported symbol from the library, after renaming the package, that symbol SHALL still be exported with the same name and type signature.

**Validates: Requirements 1.3**

### Property 2: Style Singleton Injection

*For any* number of VideoPlayer component instances rendered simultaneously, the global CSS styles SHALL be injected into the document exactly once.

**Validates: Requirements 3.2**

### Property 3: Render Optimization

*For any* VideoControls component, when props remain unchanged between renders, the component SHALL not trigger unnecessary re-renders of child elements.

**Validates: Requirements 3.1, 3.5**

### Property 4: Concurrent Thumbnail Loading

*For any* array of videos with thumbnails, the preloadThumbnails function SHALL load at most N thumbnails concurrently (where N is the concurrency limit) and eventually load all thumbnails.

**Validates: Requirements 3.4**

### Property 5: Data Attribute Consistency

*For any* component in the library that accepts user interaction, that component SHALL expose appropriate data-attributes for styling (data-selected, data-playing, data-buffering, etc.).

**Validates: Requirements 4.1**

### Property 6: Accent Color Application

*For any* VideoPlayer or VideoControls component with an accentColor prop, the accent color SHALL be applied to progress bar, thumb, and active state indicators.

**Validates: Requirements 4.2, 4.3**

### Property 7: Custom Icon Rendering

*For any* VideoPlayer component with custom icon props provided, those custom icons SHALL be rendered instead of the default react-icons.

**Validates: Requirements 4.5, 6.2**

### Property 8: SSR Safety

*For any* component or hook in the library, when rendered on the server (without window/document), the code SHALL not throw errors and SHALL return safe default values.

**Validates: Requirements 5.2, 5.3**

### Property 9: VideoProvider Context Propagation

*For any* component wrapped in VideoProvider, the component SHALL receive and use the configuration values from the nearest VideoProvider ancestor.

**Validates: Requirements 6.1**

### Property 10: Ref Forwarding

*For any* interactive component (VideoPlayer, VideoThumbnail), when a ref is passed, the ref SHALL be attached to the appropriate DOM element.

**Validates: Requirements 6.4**

### Property 11: Error Message Quality

*For any* error condition in the library (invalid video source, playback failure, etc.), the error callback SHALL receive an Error object with a descriptive message.

**Validates: Requirements 6.5**

## Error Handling

### Video Playback Errors

```typescript
// Error types
type VideoErrorCode = 
  | 'MEDIA_ERR_ABORTED'
  | 'MEDIA_ERR_NETWORK'
  | 'MEDIA_ERR_DECODE'
  | 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  | 'UNKNOWN';

interface VideoError extends Error {
  code: VideoErrorCode;
  originalError?: MediaError;
}

// Error handling in useVideoPlayer
const handleError = useCallback(() => {
  const videoElement = videoRef.current;
  if (!videoElement?.error) return;
  
  const errorCodes: Record<number, VideoErrorCode> = {
    1: 'MEDIA_ERR_ABORTED',
    2: 'MEDIA_ERR_NETWORK',
    3: 'MEDIA_ERR_DECODE',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
  };
  
  const code = errorCodes[videoElement.error.code] ?? 'UNKNOWN';
  const message = getErrorMessage(code, videoElement.error);
  
  const error = new Error(message) as VideoError;
  error.code = code;
  error.originalError = videoElement.error;
  
  onError?.(error);
}, [onError]);

function getErrorMessage(code: VideoErrorCode, mediaError: MediaError): string {
  const messages: Record<VideoErrorCode, string> = {
    MEDIA_ERR_ABORTED: 'Video playback was aborted.',
    MEDIA_ERR_NETWORK: 'A network error occurred while loading the video.',
    MEDIA_ERR_DECODE: 'The video could not be decoded.',
    MEDIA_ERR_SRC_NOT_SUPPORTED: 'The video format is not supported.',
    UNKNOWN: `An unknown error occurred: ${mediaError.message}`,
  };
  return messages[code];
}
```

### SSR Error Prevention

```typescript
// Wrap browser-only code
function VideoPlayer(props: VideoPlayerProps) {
  // Safe initialization
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    injectGlobalStyles();
  }, []);
  
  // Return placeholder during SSR
  if (!mounted) {
    return (
      <div 
        className={props.className}
        data-video-player
        data-ssr-placeholder
        style={{ aspectRatio: '16/9', background: '#000' }}
      />
    );
  }
  
  // Full component after hydration
  return <VideoPlayerClient {...props} />;
}
```

## Testing Strategy

### Unit Tests

Unit testler belirli örnekleri ve edge case'leri doğrular:

1. **Utility Functions**
   - `formatDuration` - edge cases (0, negative, Infinity)
   - `parseDuration` - invalid inputs
   - `formatViewCount` - boundary values (999, 1000, 999999, 1000000)
   - `debounce/throttle` - timing behavior

2. **Hooks**
   - `useVideoLibrary` - sorting, filtering, search
   - `useVideoPagination` - page navigation, edge cases
   - `useVideoSearch` - debouncing, empty queries

### Property-Based Tests

Property testler evrensel özellikleri doğrular:

1. **Round-trip Properties**
   - `formatDuration(parseDuration(str)) === str` for valid duration strings
   
2. **Invariant Properties**
   - Pagination: `paginatedVideos.length <= pageSize`
   - Search: `results.length <= videos.length`
   - Sort: sorted array maintains all original elements

3. **Idempotence Properties**
   - `injectGlobalStyles()` called multiple times = called once

### SSR Tests

```typescript
// tests/ssr/video-player.test.tsx
import { renderToString } from 'react-dom/server';

describe('VideoPlayer SSR', () => {
  it('should render without errors on server', () => {
    expect(() => {
      renderToString(<VideoPlayer video={mockVideo} />);
    }).not.toThrow();
  });
  
  it('should render placeholder during SSR', () => {
    const html = renderToString(<VideoPlayer video={mockVideo} />);
    expect(html).toContain('data-ssr-placeholder');
  });
});
```

### Test Configuration

- **Framework**: Vitest
- **Property Testing**: fast-check
- **Minimum iterations**: 100 per property test
- **Coverage target**: 80%

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

