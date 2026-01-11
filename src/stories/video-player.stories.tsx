import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MdPlayCircle, MdPauseCircle, MdVolumeUp, MdVolumeOff, MdFullscreen, MdFullscreenExit, MdForward10, MdReplay10, MdPictureInPictureAlt, MdSettings } from 'react-icons/md';
import { VideoPlayer } from '../components/video-player/video-player';
import { VideoProvider } from '../context/video-provider';
import { singleVideo, sampleVideos } from './mock-data';
import type { VideoItem, VideoControlsProps, VideoQualityOption } from '../types';

const meta: Meta<typeof VideoPlayer> = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    autoPlay: {
      control: 'boolean',
      description: 'Auto-play when video changes',
    },
    muted: {
      control: 'boolean',
      description: 'Start muted',
    },
    loop: {
      control: 'boolean',
      description: 'Loop playback',
    },
    showControls: {
      control: 'boolean',
      description: 'Show built-in controls',
    },
    skipDuration: {
      control: { type: 'number', min: 5, max: 30, step: 5 },
      description: 'Skip duration in seconds (default: 10)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

/**
 * Default video player with modern controls including:
 * - Play/pause button
 * - Skip forward/backward (10 seconds)
 * - Progress bar with hover preview
 * - Volume control with slider
 * - Fullscreen toggle
 * - Picture-in-Picture support
 */
export const Default: Story = {
  args: {
    video: singleVideo,
    showControls: true,
    skipDuration: 10,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Video player with quality selection options.
 * Users can switch between different video qualities.
 */
export const WithQualitySelection: Story = {
  render: () => {
    const [quality, setQuality] = useState<VideoQualityOption | null>(null);

    const qualityOptions: VideoQualityOption[] = [
      { label: '1080p', src: singleVideo.src },
      { label: '720p', src: singleVideo.src },
      { label: '480p', src: singleVideo.src },
      { label: 'Auto', src: singleVideo.src },
    ];

    return (
      <div style={{ width: '800px' }}>
        <VideoPlayer
          video={singleVideo}
          showControls
          skipDuration={10}
          qualityOptions={qualityOptions}
          onQualityChange={(q) => {
            setQuality(q);
            console.log('Quality changed to:', q.label);
          }}
        />
        {quality && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '14px',
          }}>
            Selected quality: <strong>{quality.label}</strong>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Custom skip duration - 5 seconds instead of default 10.
 */
export const CustomSkipDuration: Story = {
  args: {
    video: singleVideo,
    showControls: true,
    skipDuration: 5,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Skip buttons set to 5 seconds
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Auto-play with muted audio (required for autoplay in browsers).
 */
export const AutoPlay: Story = {
  args: {
    video: sampleVideos[2],
    autoPlay: true,
    muted: true,
    showControls: true,
    skipDuration: 10,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Auto-plays muted (browser requirement)
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Loop mode - video restarts when it ends.
 */
export const Loop: Story = {
  args: {
    video: sampleVideos[2],
    loop: true,
    showControls: true,
    skipDuration: 10,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          This video will loop continuously
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Without built-in controls - click overlay to play/pause.
 */
export const NoControls: Story = {
  args: {
    video: singleVideo,
    showControls: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Click the video or overlay to play/pause
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Empty state when no video is selected.
 */
export const NoVideo: Story = {
  args: {
    video: null,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Custom controls using renderControls prop.
 * You can completely replace the built-in controls with your own UI.
 */
export const CustomControls: Story = {
  args: {
    video: singleVideo,
    showControls: true,
    renderControls: (props: VideoControlsProps) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
      }}>
        {/* Skip Backward */}
        <button
          onClick={props.onSkipBackward}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          -10
        </button>

        {/* Play/Pause */}
        <button
          onClick={props.onTogglePlay}
          style={{
            background: '#ef4444',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          {props.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Skip Forward */}
        <button
          onClick={props.onSkipForward}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          +10
        </button>

        {/* Time */}
        <div style={{ flex: 1, color: 'white', fontSize: '13px', fontFamily: 'monospace' }}>
          {Math.floor(props.currentTime)}s / {Math.floor(props.duration)}s
        </div>

        {/* Volume */}
        <button
          onClick={props.onToggleMute}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          {props.isMuted ? '🔇' : '🔊'}
        </button>

        {/* Fullscreen */}
        <button
          onClick={props.onToggleFullscreen}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          {props.isFullscreen ? '⊙' : '⛶'}
        </button>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Custom controls using renderControls prop
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Playlist example with auto-advance to next video on end.
 */
export const WithPlaylist: Story = {
  render: () => {
    const [currentVideo, setCurrentVideo] = useState<VideoItem>(sampleVideos[0]!);
    const [currentIndex, setCurrentIndex] = useState(0);

    const playNext = () => {
      const nextIndex = (currentIndex + 1) % sampleVideos.length;
      setCurrentIndex(nextIndex);
      setCurrentVideo(sampleVideos[nextIndex]!);
    };

    const playPrev = () => {
      const prevIndex = (currentIndex - 1 + sampleVideos.length) % sampleVideos.length;
      setCurrentIndex(prevIndex);
      setCurrentVideo(sampleVideos[prevIndex]!);
    };

    return (
      <div style={{ width: '800px' }}>
        <VideoPlayer
          video={currentVideo}
          showControls
          skipDuration={10}
          onEnded={playNext}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          padding: '12px 16px',
          background: '#f3f4f6',
          borderRadius: '8px',
        }}>
          <button
            onClick={playPrev}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ← Previous
          </button>

          <span style={{ fontWeight: 600, color: '#374151' }}>
            {currentIndex + 1} / {sampleVideos.length}: {currentVideo.title}
          </span>

          <button
            onClick={playNext}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Next →
          </button>
        </div>

        {/* Mini playlist */}
        <div style={{
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0',
        }}>
          {sampleVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => {
                setCurrentIndex(index);
                setCurrentVideo(video);
              }}
              style={{
                flexShrink: 0,
                width: '120px',
                padding: '8px',
                background: index === currentIndex ? '#3b82f6' : '#e5e7eb',
                color: index === currentIndex ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: index === currentIndex ? 600 : 400,
              }}
            >
              {video.title}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Full featured example with quality selection and all controls.
 */
export const FullFeatured: Story = {
  render: () => {
    const [eventLog, setEventLog] = useState<string[]>([]);

    const qualityOptions: VideoQualityOption[] = [
      { label: '1080p HD', src: singleVideo.src },
      { label: '720p', src: singleVideo.src },
      { label: '480p', src: singleVideo.src },
      { label: '360p', src: singleVideo.src },
    ];

    const logEvent = (event: string) => {
      setEventLog(prev => [event, ...prev.slice(0, 4)]);
    };

    return (
      <div style={{ width: '900px' }}>
        <VideoPlayer
          video={singleVideo}
          showControls
          skipDuration={10}
          qualityOptions={qualityOptions}
          onTimeUpdate={(time) => {
            if (Math.floor(time) % 5 === 0 && time > 0) {
              // Log every 5 seconds
            }
          }}
          onQualityChange={(q) => logEvent(`Quality: ${q.label}`)}
          onEnded={() => logEvent('Video ended')}
          onError={(err) => logEvent(`Error: ${err.message}`)}
        />

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#1f2937',
          borderRadius: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          <div style={{ color: '#6b7280', marginBottom: '8px' }}>Event Log:</div>
          {eventLog.length === 0 ? (
            <div>No events yet - try changing quality or playing the video</div>
          ) : (
            eventLog.map((event, i) => (
              <div key={i} style={{ color: '#d1d5db' }}>{event}</div>
            ))
          )}
        </div>
      </div>
    );
  },
};


/**
 * Thumbnail preview on progress bar hover.
 * Hover over the progress bar to see a preview of that timestamp.
 * This feature uses canvas capture from a hidden video element.
 */
export const ThumbnailPreview: Story = {
  args: {
    video: singleVideo,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Hover over the progress bar to see thumbnail preview of that timestamp
        </p>
        <Story />
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#4b5563',
        }}>
          <strong>Features:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>160x90px thumbnail preview (16:9 aspect ratio)</li>
            <li>LRU cache for generated thumbnails (max 50 entries)</li>
            <li>100ms debounce to prevent excessive generation</li>
            <li>Graceful fallback to time-only display on CORS errors</li>
          </ul>
        </div>
      </div>
    ),
  ],
};

/**
 * Clean play overlay design.
 * The play overlay uses a simple, modern design without glassmorphism effects.
 */
export const CleanPlayOverlay: Story = {
  args: {
    video: singleVideo,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Clean play overlay with subtle hover animation (no glassmorphism)
        </p>
        <Story />
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#4b5563',
        }}>
          <strong>Design:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>White circle with black play icon</li>
            <li>Semi-transparent dark background (no blur)</li>
            <li>Subtle scale animation on hover (1.1x)</li>
            <li>Smooth fade transitions</li>
          </ul>
        </div>
      </div>
    ),
  ],
};

/**
 * Custom accent color - change the primary color of controls.
 */
export const CustomAccentColor: Story = {
  args: {
    video: singleVideo,
    showControls: true,
    accentColor: '#8b5cf6', // Purple
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Purple accent color (#8b5cf6)
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Custom playback rate options.
 */
export const CustomPlaybackRates: Story = {
  args: {
    video: singleVideo,
    showControls: true,
    playbackRateOptions: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Extended playback rates: 0.25x to 3x
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Using VideoProvider for global configuration.
 * All VideoPlayer components inside the provider inherit these settings.
 */
export const WithVideoProvider: Story = {
  render: () => (
    <VideoProvider
      config={{
        accentColor: '#10b981', // Emerald green
        skipDuration: 15,
        playbackRateOptions: [0.5, 1, 1.5, 2],
        keyboardShortcuts: true,
      }}
    >
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Global config via VideoProvider: emerald accent, 15s skip, custom rates
        </p>
        <VideoPlayer video={singleVideo} showControls />
      </div>
    </VideoProvider>
  ),
};

/**
 * Custom icons using the icons prop.
 * You can replace any icon with your own component.
 */
export const CustomIcons: Story = {
  render: () => (
    <div style={{ width: '800px' }}>
      <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
        Custom icons from react-icons (Material Design filled variants)
      </p>
      <VideoPlayer
        video={singleVideo}
        showControls
        icons={{
          play: MdPlayCircle,
          pause: MdPauseCircle,
          volumeHigh: MdVolumeUp,
          volumeMuted: MdVolumeOff,
          fullscreen: MdFullscreen,
          fullscreenExit: MdFullscreenExit,
          skipForward: MdForward10,
          skipBackward: MdReplay10,
          pip: MdPictureInPictureAlt,
          settings: MdSettings,
        }}
      />
    </div>
  ),
};

/**
 * VideoProvider with custom icons applied globally.
 */
export const ProviderWithCustomIcons: Story = {
  render: () => (
    <VideoProvider
      config={{
        accentColor: '#f59e0b', // Amber
        icons: {
          play: MdPlayCircle,
          pause: MdPauseCircle,
          volumeHigh: MdVolumeUp,
          volumeMuted: MdVolumeOff,
        },
      }}
    >
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          VideoProvider with amber accent and custom icons
        </p>
        <VideoPlayer video={singleVideo} showControls />
        
        <div style={{ marginTop: '24px' }}>
          <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
            Second player inherits the same config
          </p>
          <VideoPlayer video={sampleVideos[1]} showControls />
        </div>
      </div>
    </VideoProvider>
  ),
};
