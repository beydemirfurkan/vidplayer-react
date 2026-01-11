import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoThumbnail } from '../../src/components/video-thumbnail/video-thumbnail';
import type { VideoItem } from '../../src/types';

const mockVideo: VideoItem = {
  id: '1',
  src: '/video.mp4',
  title: 'Test Video',
  thumbnail: '/thumb.jpg',
  duration: 125,
  progress: 0.5,
};

describe('VideoThumbnail', () => {
  it('renders with data attributes', () => {
    render(<VideoThumbnail video={mockVideo} data-testid="thumb" />);
    
    const element = screen.getByTestId('thumb');
    expect(element).toHaveAttribute('data-video-thumbnail');
  });

  it('renders video title as alt text', () => {
    render(<VideoThumbnail video={mockVideo} lazy={false} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test Video');
  });

  it('renders duration overlay', () => {
    render(<VideoThumbnail video={mockVideo} lazy={false} />);
    
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<VideoThumbnail video={mockVideo} onClick={onClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.click(element);
    
    expect(onClick).toHaveBeenCalledWith(mockVideo);
  });

  it('handles keyboard events', () => {
    const onClick = vi.fn();
    render(<VideoThumbnail video={mockVideo} onClick={onClick} />);
    
    const element = screen.getByRole('button');
    fireEvent.keyDown(element, { key: 'Enter' });
    
    expect(onClick).toHaveBeenCalledWith(mockVideo);
  });

  it('shows selected state', () => {
    render(<VideoThumbnail video={mockVideo} isSelected data-testid="thumb" />);
    
    const element = screen.getByTestId('thumb');
    expect(element).toHaveAttribute('data-selected');
  });

  it('renders fallback when no thumbnail', () => {
    const videoWithoutThumb: VideoItem = { id: '1', src: '/v.mp4', title: 'Test' };
    render(<VideoThumbnail video={videoWithoutThumb} />);
    
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    render(<VideoThumbnail video={mockVideo} lazy={false} data-testid="thumb" />);
    
    const progressBar = screen.getByTestId('thumb').querySelector('[data-slot="progress-bar"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('forwards ref to container', () => {
    const ref = vi.fn();
    render(<VideoThumbnail video={mockVideo} ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom className', () => {
    render(<VideoThumbnail video={mockVideo} className="custom-class" data-testid="thumb" />);
    
    const element = screen.getByTestId('thumb');
    expect(element).toHaveClass('custom-class');
  });

  it('renders placeholder when provided', () => {
    render(
      <VideoThumbnail 
        video={mockVideo} 
        placeholder={<div data-testid="placeholder">Loading...</div>}
        lazy={false}
      />
    );
    
    // Placeholder should be visible before image loads
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });
});
