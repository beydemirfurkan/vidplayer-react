import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoProgress } from '../../src/components/video-player/video-progress';

describe('VideoProgress', () => {
  it('renders with data attributes', () => {
    render(
      <VideoProgress 
        currentTime={60} 
        duration={300} 
        data-testid="progress" 
      />
    );
    
    const element = screen.getByTestId('progress');
    expect(element).toHaveAttribute('data-video-progress');
  });

  it('displays current time and duration', () => {
    render(
      <VideoProgress 
        currentTime={65} 
        duration={300} 
        showTime 
      />
    );
    
    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(
      <VideoProgress 
        currentTime={150} 
        duration={300} 
        data-testid="progress"
      />
    );
    
    const progressBar = screen.getByTestId('progress').querySelector('[data-slot="progress"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('shows buffered progress', () => {
    render(
      <VideoProgress 
        currentTime={60} 
        duration={300} 
        bufferedProgress={0.7}
        data-testid="progress"
      />
    );
    
    const bufferedBar = screen.getByTestId('progress').querySelector('[data-slot="buffered"]');
    expect(bufferedBar).toHaveStyle({ width: '70%' });
  });

  it('handles seek on mousedown', () => {
    const onSeek = vi.fn();
    render(
      <VideoProgress 
        currentTime={60} 
        duration={300} 
        onSeek={onSeek}
        data-testid="progress"
      />
    );
    
    const track = screen.getByTestId('progress').querySelector('[data-slot="track"]');
    
    // Mock getBoundingClientRect
    vi.spyOn(track as Element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    
    fireEvent.mouseDown(track!, { clientX: 50 });
    
    expect(onSeek).toHaveBeenCalledWith(150); // 50% of 300
  });

  it('handles zero duration gracefully', () => {
    render(
      <VideoProgress 
        currentTime={0} 
        duration={0} 
        showTime
        data-testid="progress"
      />
    );
    
    const progressBar = screen.getByTestId('progress').querySelector('[data-slot="progress"]');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('applies custom className', () => {
    render(
      <VideoProgress 
        currentTime={60} 
        duration={300} 
        className="custom-progress"
        data-testid="progress"
      />
    );
    
    const element = screen.getByTestId('progress');
    expect(element).toHaveClass('custom-progress');
  });
});
