import type { Meta, StoryObj } from '@storybook/react';
import { MdPlayCircle, MdPauseCircle, MdVolumeUp, MdVolumeOff, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { VideoProvider, useVideoConfig } from '../context/video-provider';
import { VideoPlayer } from '../components/video-player/video-player';
import { singleVideo, sampleVideos } from './mock-data';

const meta: Meta<typeof VideoProvider> = {
  title: 'Context/VideoProvider',
  component: VideoProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VideoProvider>;

/**
 * Display current config values using useVideoConfig hook.
 */
function ConfigDisplay() {
  const config = useVideoConfig();
  
  return (
    <div style={{
      marginTop: '16px',
      padding: '12px',
      background: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'monospace',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>Current Config:</div>
      <div>accentColor: {config.accentColor}</div>
      <div>skipDuration: {config.skipDuration}s</div>
      <div>keyboardShortcuts: {config.keyboardShortcuts ? 'enabled' : 'disabled'}</div>
      <div>playbackRates: [{config.playbackRateOptions.join(', ')}]</div>
    </div>
  );
}

/**
 * Default VideoProvider with no custom config.
 * Uses default values for all settings.
 */
export const Default: Story = {
  render: () => (
    <VideoProvider>
      <div style={{ width: '800px' }}>
        <VideoPlayer video={singleVideo} showControls />
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Custom accent color applied globally.
 */
export const CustomAccentColor: Story = {
  render: () => (
    <VideoProvider config={{ accentColor: '#8b5cf6' }}>
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Purple accent color applied to all players
        </p>
        <VideoPlayer video={singleVideo} showControls />
        <div style={{ marginTop: '16px' }}>
          <VideoPlayer video={sampleVideos[1]} showControls />
        </div>
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Custom skip duration and playback rates.
 */
export const CustomPlaybackSettings: Story = {
  render: () => (
    <VideoProvider
      config={{
        skipDuration: 15,
        playbackRateOptions: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3],
      }}
    >
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          15 second skip, extended playback rates (0.25x - 3x)
        </p>
        <VideoPlayer video={singleVideo} showControls />
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Keyboard shortcuts disabled globally.
 */
export const KeyboardShortcutsDisabled: Story = {
  render: () => (
    <VideoProvider config={{ keyboardShortcuts: false }}>
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Keyboard shortcuts are disabled - try pressing Space or arrow keys
        </p>
        <VideoPlayer video={singleVideo} showControls />
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Custom icons applied globally via VideoProvider.
 */
export const CustomIcons: Story = {
  render: () => (
    <VideoProvider
      config={{
        accentColor: '#f59e0b',
        icons: {
          play: MdPlayCircle,
          pause: MdPauseCircle,
          volumeHigh: MdVolumeUp,
          volumeMuted: MdVolumeOff,
          fullscreen: MdFullscreen,
          fullscreenExit: MdFullscreenExit,
        },
      }}
    >
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Custom Material Design icons with amber accent
        </p>
        <VideoPlayer video={singleVideo} showControls />
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Full configuration example with all options.
 */
export const FullConfiguration: Story = {
  render: () => (
    <VideoProvider
      config={{
        accentColor: '#10b981',
        skipDuration: 5,
        playbackRateOptions: [0.5, 1, 1.5, 2],
        keyboardShortcuts: true,
        icons: {
          play: MdPlayCircle,
          pause: MdPauseCircle,
        },
      }}
    >
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Full configuration: emerald accent, 5s skip, custom rates, custom icons
        </p>
        <VideoPlayer video={singleVideo} showControls />
        <ConfigDisplay />
      </div>
    </VideoProvider>
  ),
};

/**
 * Nested providers - inner provider overrides outer.
 */
export const NestedProviders: Story = {
  render: () => (
    <VideoProvider config={{ accentColor: '#ef4444' }}>
      <div style={{ width: '800px' }}>
        <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
          Outer provider: Red accent
        </p>
        <VideoPlayer video={singleVideo} showControls />
        
        <VideoProvider config={{ accentColor: '#3b82f6' }}>
          <div style={{ marginTop: '24px' }}>
            <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
              Inner provider: Blue accent (overrides outer)
            </p>
            <VideoPlayer video={sampleVideos[1]} showControls />
          </div>
        </VideoProvider>
      </div>
    </VideoProvider>
  ),
};
