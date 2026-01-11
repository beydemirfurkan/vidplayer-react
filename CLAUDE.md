# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `video-library`, a headless-first React video library designed for React 18+. It provides unstyled, fully controlled components and hooks for building video applications.

## Common Commands

```bash
# Development
npm run dev          # Watch mode with tsup
npm run build        # Production build with tsup

# Testing
npm run test         # Run vitest in watch mode
npm run test:run     # Run tests once

# Type checking and linting
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run lint         # ESLint on src directory

# Storybook
npm run storybook    # Start Storybook dev server on port 6006
npm run build-storybook
```

## Architecture

### Module Structure

The library is organized into four sub-packages with separate entry points for tree-shaking:

- **`/`** - Main entry point re-exporting everything from `src/index.ts`
- **`/hooks`** - React hooks for video state management
- **`/components`** - Headless React components
- **`/utils`** - Pure utility functions

### Components (`src/components/`)

- `VideoPlayer` - Main player with customizable controls, keyboard shortcuts, quality switching, playback rate
- `VideoControls` - Player controls (play/pause, volume, progress, settings menu with speed/quality)
- `VideoProgress` - Progress bar component
- `VideoThumbnail` - Single thumbnail with lazy loading

### Hooks (`src/hooks/`)

- `useVideoPlayer` - Playback state and controls (play, pause, seek, volume, fullscreen, PiP, playback rate, quality switching)
- `useVideoLibrary` - Collection management with sorting/filtering
- `useVideoSearch` / `useVideoSearchInstant` - Debounced and instant search
- `useVideoPagination` / `useInfiniteVideos` - Pagination and infinite scroll
- `usePlayerKeyboardShortcuts` - YouTube-style keyboard shortcuts

### Keyboard Shortcuts (YouTube-style)

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `←` / `J` | Seek backward |
| `→` / `L` | Seek forward |
| `↑` / `↓` | Volume up/down |
| `M` | Mute |
| `F` | Fullscreen |
| `Home` / `End` | Start/End |
| `>` / `<` | Speed up/down |
| `0-9` | Seek to 0%-90% |

### Key Patterns

- **Headless-first**: Components accept `className` props and expose `data-*` attributes for styling
- **Fully controlled**: No internal state; all state is managed via props
- **Custom rendering**: Components accept `renderControls` props for customization
- **Icons**: Uses `react-icons` (Material Design icons from `react-icons/md`)

### Types

All TypeScript interfaces are centralized in `src/types/index.ts`. The core data model is `VideoItem` with required `id` and `src` fields.

### Test Structure

Tests live in `tests/` directory (not co-located), mirroring src structure:
- `tests/hooks/` - Hook tests
- `tests/utils/` - Utility tests

Uses Vitest with jsdom environment and @testing-library/react.
