/**
 * Base video item interface with required fields
 * Use this as the foundation for custom video types
 */
export interface VideoItemBase {
  /** Unique identifier for the video */
  id: string;
  /** Video source URL */
  src: string;
}

/**
 * Default video item properties (optional fields)
 */
export interface VideoItemDefaults {
  /** Video title */
  title?: string;
  /** Video description */
  description?: string;
  /** Video duration in seconds */
  duration?: number;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Tags for categorization and filtering */
  tags?: string[];
  /** ISO date string of when the video was created */
  createdAt?: string;
  /** View count */
  views?: number;
  /** Playback progress (0-1) */
  progress?: number;
}

/**
 * Generic video item type that can be extended with custom properties
 * 
 * @typeParam T - Additional custom properties to include
 * 
 * @example
 * // Basic usage with default properties
 * const video: VideoItem = { id: '1', src: '/video.mp4' };
 * 
 * @example
 * // Extended with custom properties
 * interface CustomProps {
 *   author: string;
 *   category: 'tutorial' | 'demo';
 *   premium: boolean;
 * }
 * const customVideo: VideoItem<CustomProps> = {
 *   id: '1',
 *   src: '/video.mp4',
 *   author: 'John Doe',
 *   category: 'tutorial',
 *   premium: true
 * };
 */
export type VideoItem<T extends Record<string, unknown> = Record<string, never>> = 
  VideoItemBase & VideoItemDefaults & T;

/**
 * Legacy VideoItem type for backward compatibility
 * @deprecated Use VideoItem<T> for type-safe custom properties
 */
export type LegacyVideoItem = VideoItemBase & VideoItemDefaults;

/**
 * Sort field options for video library
 */
export type VideoSortField = 'createdAt' | 'title' | 'views' | 'duration';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Options for useVideoLibrary hook
 */
export interface UseVideoLibraryOptions {
  /** Array of videos to manage */
  videos: VideoItem[];
  /** Field to sort by */
  sortBy?: VideoSortField;
  /** Sort order */
  sortOrder?: SortOrder;
  /** Filter videos by tags (match any) */
  filterTags?: string[];
  /** Search query to filter videos */
  searchQuery?: string;
}

/**
 * Return type for useVideoLibrary hook
 */
export interface UseVideoLibraryReturn {
  /** Videos after applying filters */
  filteredVideos: VideoItem[];
  /** Videos after applying filters and sorting */
  sortedVideos: VideoItem[];
  /** Total count of filtered videos */
  totalCount: number;
  /** Get a video by its ID */
  getVideoById: (id: string) => VideoItem | undefined;
  /** Get all unique tags from videos */
  allTags: string[];
}

/**
 * Options for useVideoPlayer hook
 */
export interface UseVideoPlayerOptions {
  /** Video to play (null when no video selected) */
  video: VideoItem | null;
  /** Auto-play when video changes */
  autoPlay?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Loop video playback */
  loop?: boolean;
  /** Preload strategy */
  preload?: 'none' | 'metadata' | 'auto';
  /** Callback when time updates */
  onTimeUpdate?: (time: number) => void;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback on playback error */
  onError?: (error: Error) => void;
  /** Callback when playback state changes */
  onPlayStateChange?: (isPlaying: boolean) => void;
}

/**
 * Return type for useVideoPlayer hook
 */
export interface UseVideoPlayerReturn {
  /** Callback ref to attach to video element */
  videoRef: (element: HTMLVideoElement | null) => void;
  /** Whether video is currently playing */
  isPlaying: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether audio is muted */
  isMuted: boolean;
  /** Whether video is in fullscreen */
  isFullscreen: boolean;
  /** Whether video is buffering */
  isBuffering: boolean;
  /** Buffered time ranges as percentage (0-1) */
  bufferedProgress: number;
  /** Play the video */
  play: () => void;
  /** Pause the video */
  pause: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Seek to specific time in seconds */
  seek: (time: number) => void;
  /** Set volume (0-1) */
  setVolume: (vol: number) => void;
  /** Toggle mute state */
  toggleMute: () => void;
  /** Toggle fullscreen mode */
  toggleFullscreen: () => void;
  /** Request Picture-in-Picture mode */
  requestPiP: () => void;
  /** Exit Picture-in-Picture mode */
  exitPiP: () => void;
  /** Whether PiP is active */
  isPiPActive: boolean;
  /** Current playback rate (1 = normal speed) */
  playbackRate: number;
  /** Set playback rate */
  setPlaybackRate: (rate: number) => void;
  /** Change video source (for quality switching), preserving playback position */
  changeQuality: (newSrc: string, preserveTime?: boolean) => void;
}

/**
 * Options for useVideoSearch hook
 */
export interface UseVideoSearchOptions {
  /** Videos to search through */
  videos: VideoItem[];
  /** Search query */
  query: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Fields to search in */
  searchFields?: Array<'title' | 'description' | 'tags'>;
}

/**
 * Return type for useVideoSearch hook
 */
export interface UseVideoSearchReturn {
  /** Filtered videos matching the search */
  results: VideoItem[];
  /** Whether search is in progress (debouncing) */
  isSearching: boolean;
}

/**
 * Options for useVideoPagination hook
 */
export interface UseVideoPaginationOptions {
  /** Videos to paginate */
  videos: VideoItem[];
  /** Number of items per page */
  pageSize: number;
  /** Initial page number (1-indexed) */
  initialPage?: number;
}

/**
 * Return type for useVideoPagination hook
 */
export interface UseVideoPaginationReturn {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Videos for current page */
  paginatedVideos: VideoItem[];
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Reset to first page */
  reset: () => void;
}

/**
 * Common props for video display components
 */
export interface VideoComponentBaseProps {
  /** Additional CSS class name */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Props for VideoThumbnail component
 */
export interface VideoThumbnailProps extends VideoComponentBaseProps {
  /** Video item to display thumbnail for */
  video: VideoItem;
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number;
  /** Whether thumbnail is currently selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (video: VideoItem) => void;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Custom placeholder element */
  placeholder?: React.ReactNode;
}

/**
 * Props for VideoProgress component
 */
export interface VideoProgressProps extends VideoComponentBaseProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Buffered progress (0-1) */
  bufferedProgress?: number;
  /** Callback when user seeks */
  onSeek?: (time: number) => void;
  /** Show time display */
  showTime?: boolean;
}

/**
 * Video quality option
 */
export interface VideoQualityOption {
  /** Quality label (e.g., "1080p", "720p", "Auto") */
  label: string;
  /** Source URL for this quality */
  src: string;
  /** Whether this is the current quality */
  isActive?: boolean;
}

/**
 * Props for VideoControls component
 */
export interface VideoControlsProps extends VideoComponentBaseProps {
  /** Whether video is playing */
  isPlaying: boolean;
  /** Current playback time */
  currentTime: number;
  /** Total duration */
  duration: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether muted */
  isMuted: boolean;
  /** Whether in fullscreen */
  isFullscreen: boolean;
  /** Buffered progress (0-1) */
  bufferedProgress?: number;
  /** Whether video is buffering */
  isBuffering?: boolean;
  /** Play/pause handler */
  onTogglePlay: () => void;
  /** Seek handler */
  onSeek: (time: number) => void;
  /** Skip forward handler */
  onSkipForward?: () => void;
  /** Skip backward handler */
  onSkipBackward?: () => void;
  /** Volume change handler */
  onVolumeChange: (volume: number) => void;
  /** Mute toggle handler */
  onToggleMute: () => void;
  /** Fullscreen toggle handler */
  onToggleFullscreen: () => void;
  /** PiP toggle handler */
  onTogglePiP?: () => void;
  /** Whether PiP is active */
  isPiPActive?: boolean;
  /** Available quality options */
  qualityOptions?: VideoQualityOption[];
  /** Current quality label */
  currentQuality?: string;
  /** Quality change handler */
  onQualityChange?: (quality: VideoQualityOption) => void;
  /** Skip duration in seconds (default: 10) */
  skipDuration?: number;
  /** Current playback rate */
  playbackRate?: number;
  /** Available playback rate options */
  playbackRateOptions?: number[];
  /** Playback rate change handler */
  onPlaybackRateChange?: (rate: number) => void;
}

/**
 * Props for VideoPlayer component
 */
export interface VideoPlayerProps extends VideoComponentBaseProps {
  /** Video to play */
  video: VideoItem | null;
  /** Auto-play when video changes */
  autoPlay?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Preload strategy */
  preload?: 'none' | 'metadata' | 'auto';
  /** Show built-in controls */
  showControls?: boolean;
  /** Skip duration in seconds (default: 10) */
  skipDuration?: number;
  /** Available quality options */
  qualityOptions?: VideoQualityOption[];
  /** Callback when time updates */
  onTimeUpdate?: (time: number) => void;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when quality changes */
  onQualityChange?: (quality: VideoQualityOption) => void;
  /** Custom controls renderer */
  renderControls?: (props: VideoControlsProps) => React.ReactNode;
  /** Poster image URL (overrides video.thumbnail) */
  poster?: string;
  /** Accent color for controls (default: #ef4444) */
  accentColor?: string;
  /** Available playback rate options */
  playbackRateOptions?: number[];
  /** Callback when playback rate changes */
  onPlaybackRateChange?: (rate: number) => void;
}


/**
 * Video error codes
 */
export type VideoErrorCode =
  | 'MEDIA_ERR_ABORTED'
  | 'MEDIA_ERR_NETWORK'
  | 'MEDIA_ERR_DECODE'
  | 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  | 'UNKNOWN';

/**
 * Extended Error class for video playback errors
 */
export interface VideoError extends Error {
  /** Error code identifying the type of error */
  code: VideoErrorCode;
  /** Original MediaError from the video element */
  originalError?: MediaError;
}

/**
 * Error messages for each error code
 */
export const VIDEO_ERROR_MESSAGES: Record<VideoErrorCode, string> = {
  MEDIA_ERR_ABORTED: 'Video playback was aborted. Please try again.',
  MEDIA_ERR_NETWORK: 'A network error occurred while loading the video. Check your connection and try again.',
  MEDIA_ERR_DECODE: 'The video could not be decoded. The file may be corrupted or use an unsupported codec.',
  MEDIA_ERR_SRC_NOT_SUPPORTED: 'The video format is not supported by your browser.',
  UNKNOWN: 'An unknown error occurred during video playback.',
};

/**
 * Creates a VideoError from a MediaError
 */
export function createVideoError(mediaError: MediaError | null): VideoError {
  const errorCodes: Record<number, VideoErrorCode> = {
    1: 'MEDIA_ERR_ABORTED',
    2: 'MEDIA_ERR_NETWORK',
    3: 'MEDIA_ERR_DECODE',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
  };

  const code = mediaError ? (errorCodes[mediaError.code] ?? 'UNKNOWN') : 'UNKNOWN';
  const message = VIDEO_ERROR_MESSAGES[code];

  const error = new Error(message) as VideoError;
  error.code = code;
  error.name = 'VideoError';
  if (mediaError) {
    error.originalError = mediaError;
  }

  return error;
}
