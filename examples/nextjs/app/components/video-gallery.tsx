'use client';

import { useState } from 'react';
import {
  VideoPlayer,
  VideoThumbnail,
  VideoProvider,
  useVideoLibrary,
  type VideoItem,
} from 'vidplayer-react';

interface VideoGalleryProps {
  videos: VideoItem[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(videos[0] ?? null);
  
  const { sortedVideos, allTags } = useVideoLibrary({
    videos,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  return (
    <VideoProvider
      config={{
        accentColor: '#3b82f6',
        skipDuration: 10,
        keyboardShortcuts: true,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main player */}
        <div>
          <VideoPlayer
            video={selectedVideo}
            showControls
            autoPlay={false}
            onEnded={() => {
              // Auto-advance to next video
              const currentIndex = sortedVideos.findIndex(v => v.id === selectedVideo?.id);
              const nextVideo = sortedVideos[currentIndex + 1];
              if (nextVideo) {
                setSelectedVideo(nextVideo);
              }
            }}
          />
          
          {selectedVideo && (
            <div style={{ marginTop: '16px' }}>
              <h2 style={{ margin: '0 0 8px 0' }}>{selectedVideo.title}</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{selectedVideo.description}</p>
              {selectedVideo.tags && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  {selectedVideo.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar with thumbnails */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
            Up Next
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedVideos.map(video => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: video.id === selectedVideo?.id ? '2px solid #3b82f6' : '2px solid transparent',
                }}
              >
                <VideoThumbnail
                  video={video}
                  isSelected={video.id === selectedVideo?.id}
                  lazy
                />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{video.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VideoProvider>
  );
}
