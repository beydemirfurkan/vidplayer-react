# vidplayer-react Next.js Example

This example demonstrates how to use `vidplayer-react` with Next.js App Router.

## Key Points

1. **SSR Safety**: The library is fully SSR-safe. Components render a placeholder during server-side rendering and hydrate properly on the client.

2. **Client Components**: Video player interactions require client-side JavaScript. Use the `'use client'` directive for components that use the video player.

3. **VideoProvider**: Use `VideoProvider` to configure global settings like accent color, skip duration, and keyboard shortcuts.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the example.

## Project Structure

```
app/
├── layout.tsx          # Root layout (Server Component)
├── page.tsx            # Home page (Server Component)
└── components/
    └── video-gallery.tsx  # Video gallery (Client Component)
```

## Usage Pattern

```tsx
// page.tsx (Server Component)
import { VideoGallery } from './components/video-gallery';

export default function Page() {
  // Fetch video data on server
  const videos = await fetchVideos();
  
  return <VideoGallery videos={videos} />;
}

// components/video-gallery.tsx (Client Component)
'use client';

import { VideoPlayer, VideoProvider } from 'vidplayer-react';

export function VideoGallery({ videos }) {
  return (
    <VideoProvider config={{ accentColor: '#3b82f6' }}>
      <VideoPlayer video={videos[0]} showControls />
    </VideoProvider>
  );
}
```
