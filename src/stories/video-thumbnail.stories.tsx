import type { Meta, StoryObj } from '@storybook/react';
import { VideoThumbnail } from '../components/video-thumbnail/video-thumbnail';
import { singleVideo, sampleVideos } from './mock-data';

const meta: Meta<typeof VideoThumbnail> = {
  title: 'Components/VideoThumbnail',
  component: VideoThumbnail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    aspectRatio: {
      control: { type: 'number', min: 0.5, max: 2, step: 0.1 },
    },
    isSelected: {
      control: 'boolean',
    },
    lazy: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoThumbnail>;

export const Default: Story = {
  args: {
    video: singleVideo,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Selected: Story = {
  args: {
    video: singleVideo,
    isSelected: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <style>{`
          [data-selected] {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
            border-radius: 8px;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
};

export const WithProgress: Story = {
  args: {
    video: { ...singleVideo, progress: 0.65 },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <style>{`
          [data-slot="progress-track"] {
            background: rgba(255, 255, 255, 0.3);
          }
          [data-slot="progress-bar"] {
            background: #ef4444;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
};

export const Completed: Story = {
  args: {
    video: sampleVideos[2], // progress: 1
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <style>{`
          [data-slot="progress-track"] {
            background: rgba(255, 255, 255, 0.3);
          }
          [data-slot="progress-bar"] {
            background: #22c55e;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
};

export const NoThumbnail: Story = {
  args: {
    video: {
      id: 'no-thumb',
      src: 'video.mp4',
      title: 'Video Without Thumbnail',
      duration: 120,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <style>{`
          [data-slot="fallback"] {
            background: #1f2937;
            color: white;
            font-size: 48px;
            font-weight: bold;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
};

export const CustomAspectRatio: Story = {
  args: {
    video: singleVideo,
    aspectRatio: 1, // Square
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Styled: Story = {
  args: {
    video: singleVideo,
    onClick: (video) => console.log('Clicked:', video.title),
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <style>{`
        .styled-thumbnail {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .styled-thumbnail:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
        .styled-thumbnail [data-slot="duration"] {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
        }
        .styled-thumbnail [data-slot="progress-track"] {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
        }
        .styled-thumbnail [data-slot="progress-bar"] {
          background: #ef4444;
        }
      `}</style>
      <VideoThumbnail {...args} className="styled-thumbnail" />
    </div>
  ),
};
