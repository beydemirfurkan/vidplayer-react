// Types
export type {
  VideoItemBase,
  VideoItemDefaults,
  VideoItem,
  LegacyVideoItem,
  VideoSortField,
  SortOrder,
  UseVideoLibraryOptions,
  UseVideoLibraryReturn,
  UseVideoPlayerOptions,
  UseVideoPlayerReturn,
  UseVideoSearchOptions,
  UseVideoSearchReturn,
  UseVideoPaginationOptions,
  UseVideoPaginationReturn,
  VideoComponentBaseProps,
  VideoThumbnailProps,
  VideoProgressProps,
  VideoControlsProps,
  VideoPlayerProps,
  VideoErrorCode,
  VideoError,
} from './types';

export { VIDEO_ERROR_MESSAGES, createVideoError } from './types';

// Context
export {
  VideoProvider,
  useVideoConfig,
  useHasVideoProvider,
  type VideoProviderConfig,
  type VideoContextValue,
  type VideoIconConfig,
  type IconProps,
} from './context';

// Hooks
export {
  useVideoLibrary,
  useVideoPlayer,
  useVideoSearch,
  useVideoSearchInstant,
  useVideoPagination,
  useInfiniteVideos,
  usePlayerKeyboardShortcuts,
} from './hooks';

// Components
export {
  VideoThumbnail,
  VideoProgress,
  VideoControls,
  VideoPlayer,
  type VideoPlayerHandle,
} from './components';

// Utilities
export {
  formatDuration,
  parseDuration,
  formatRelativeTime,
  formatViewCount,
  debounce,
  throttle,
  createIntersectionObserver,
  createLazyLoader,
  isIntersectionObserverSupported,
  createVideoPreloader,
  preloadThumbnail,
  preloadThumbnails,
  // SSR utilities
  isBrowser,
  getDocument,
  getWindow,
  useBrowserEffect,
  useFullscreenState,
  useMounted,
  requestFullscreen,
  exitFullscreen,
  isPiPSupported,
  // Style injection
  injectGlobalStyles,
  removeGlobalStyles,
  areStylesInjected,
  type IntersectionObserverOptions,
  type IntersectionCallback,
  type PreloadStrategy,
  type PreloadState,
} from './utils';
