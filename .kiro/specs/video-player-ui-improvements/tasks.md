# Implementation Plan: Video Player UI Improvements

## Overview

Play overlay tasarımının güncellenmesi ve progress bar üzerinde thumbnail preview özelliğinin eklenmesi.

## Tasks

- [x] 1. Update Play Overlay Design
  - [x] 1.1 Remove glassmorphism effects from play overlay styles
    - Remove `backdropFilter` and `WebkitBackdropFilter` from `playOverlayIcon`
    - Update background to simple semi-transparent dark (`rgba(0,0,0,0.4)`)
    - Change play button to white circle with black icon
    - _Requirements: 1.1, 1.3_

  - [x] 1.2 Update play overlay hover effects
    - Simplify hover animation to subtle scale (1.1x)
    - Remove complex box-shadow changes
    - Keep smooth transitions
    - _Requirements: 1.2, 1.4_

  - [x] 1.3 Update accent color integration for play overlay
    - Remove accent color border from play overlay
    - Keep accent color for progress bar and active states only
    - _Requirements: 1.3, 1.5_

- [x] 2. Implement Thumbnail Generator Hook
  - [x] 2.1 Create `use-thumbnail-generator.ts` hook
    - Create new file in `src/hooks/`
    - Implement hidden video element management
    - Implement canvas capture logic
    - _Requirements: 2.7, 3.1_

  - [x] 2.2 Implement LRU cache for thumbnails
    - Create `ThumbnailLRUCache` class
    - Max 50 entries with automatic eviction
    - Key by rounded time (1 second precision)
    - _Requirements: 3.2_

  - [x] 2.3 Write property test for thumbnail cache round-trip
    - **Property 4: Thumbnail Cache Round-Trip**
    - **Validates: Requirements 3.2**

  - [x] 2.4 Implement debounce for thumbnail requests
    - 100ms debounce window
    - Cancel pending requests on new request
    - _Requirements: 3.3_

  - [x] 2.5 Write property test for debounce behavior
    - **Property 5: Thumbnail Request Debouncing**
    - **Validates: Requirements 3.3**

- [x] 3. Implement Thumbnail Preview Component
  - [x] 3.1 Create `ThumbnailPreview` component in video-controls
    - 160x90px container (16:9 aspect ratio)
    - Rounded corners (6px)
    - Position follows cursor
    - Shows loading state while generating
    - _Requirements: 2.1, 2.8_

  - [x] 3.2 Write property test for aspect ratio invariant
    - **Property 3: Thumbnail Aspect Ratio Invariant**
    - **Validates: Requirements 2.8**

  - [x] 3.3 Implement position clamping logic
    - Keep preview within player bounds
    - Handle edge cases (near start/end of progress bar)
    - _Requirements: 2.2_

  - [x] 3.4 Write property test for position bounds
    - **Property 6: Preview Position Bounds**
    - **Validates: Requirements 2.2**

- [x] 4. Integrate Thumbnail Preview with VideoControls
  - [x] 4.1 Add thumbnail preview state to VideoControls
    - Track hover position
    - Track thumbnail URL
    - Track loading state
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Connect thumbnail generator to progress bar hover
    - Call generator on hover position change
    - Update preview with generated thumbnail
    - Handle errors gracefully (show time only)
    - _Requirements: 2.1, 2.5, 2.6_

  - [x] 4.3 Add thumbnail preview styles
    - Update `styles.ts` with thumbnail preview styles
    - Add animation keyframes for smooth appearance
    - _Requirements: 2.3, 2.4_

- [x] 5. Update VideoPlayer Component
  - [x] 5.1 Pass video source to controls for thumbnail generation
    - Add `videoSrc` prop to VideoControls
    - Enable/disable thumbnail based on video availability
    - _Requirements: 2.1_

  - [x] 5.2 Handle CORS and error cases
    - Detect CORS restrictions
    - Fallback to time-only preview
    - Log warnings for debugging
    - _Requirements: 2.6_

- [x] 6. Checkpoint - Verify all features work
  - Ensure play overlay has new clean design
  - Ensure thumbnail preview appears on hover
  - Ensure caching works correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Update Storybook Stories
  - [x] 7.1 Add story demonstrating thumbnail preview
    - Show hover behavior
    - Show different video sources
    - _Requirements: 2.1_

  - [x] 7.2 Update existing stories with new play overlay
    - Verify new design in all stories
    - _Requirements: 1.1_

- [x] 8. Final Checkpoint
  - Run all tests
  - Verify visual changes in Storybook
  - Ensure no regressions
  - Ask the user if questions arise

## Notes

- All tasks including property-based tests are required
- Thumbnail generation requires same-origin video or CORS headers
- Cache uses LRU eviction to prevent memory issues
- Debounce prevents excessive thumbnail generation during fast scrubbing
