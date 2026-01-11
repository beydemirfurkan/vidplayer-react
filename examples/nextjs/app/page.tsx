import { VideoGallery } from './components/video-gallery';

// Sample video data (could come from a CMS or API)
const videos = [
  {
    id: '1',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Big Buck Bunny',
    description: 'Big Buck Bunny tells the story of a giant rabbit.',
    duration: 596,
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    tags: ['animation', 'comedy'],
  },
  {
    id: '2',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Elephants Dream',
    description: 'The first Blender Open Movie from 2006.',
    duration: 653,
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    tags: ['animation', 'sci-fi'],
  },
  {
    id: '3',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'For Bigger Blazes',
    description: 'HBO GO promotional video.',
    duration: 15,
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    tags: ['promo'],
  },
];

export default function Home() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '8px' }}>vidplayer-react + Next.js</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Example of using vidplayer-react with Next.js App Router (SSR-safe)
      </p>
      
      {/* Client component handles all video interactions */}
      <VideoGallery videos={videos} />
    </main>
  );
}
