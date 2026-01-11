# Requirements Document

## Introduction

Video player UI iyileştirmeleri - Play overlay tasarımının güncellenmesi ve progress bar üzerinde thumbnail preview özelliğinin eklenmesi.

## Glossary

- **Video_Player**: Ana video oynatıcı bileşeni
- **Play_Overlay**: Video duraklatıldığında ortada görünen oynat butonu
- **Progress_Bar**: Video ilerleme çubuğu
- **Thumbnail_Preview**: Progress bar üzerinde hover yapıldığında gösterilen küçük resim önizlemesi
- **Seek_Time**: Kullanıcının atlamak istediği video zamanı

## Requirements

### Requirement 1: Play Overlay Tasarımı

**User Story:** As a user, I want a cleaner and more modern play overlay, so that the video player looks more professional and less cluttered.

#### Acceptance Criteria

1. WHEN the video is paused, THE Play_Overlay SHALL display a simple, clean play button without heavy blur effects
2. WHEN the user hovers over the Play_Overlay, THE Video_Player SHALL show a subtle scale animation
3. THE Play_Overlay SHALL use a semi-transparent dark background without glassmorphism blur
4. THE Play_Overlay SHALL have smooth fade-in/fade-out transitions
5. THE Play_Overlay SHALL be centered on the video and have appropriate sizing (not too large, not too small)

### Requirement 2: Thumbnail Preview on Progress Bar

**User Story:** As a user, I want to see a thumbnail preview when hovering over the progress bar, so that I can quickly find the scene I'm looking for.

#### Acceptance Criteria

1. WHEN the user hovers over the Progress_Bar, THE Video_Player SHALL display a thumbnail preview of that timestamp
2. THE Thumbnail_Preview SHALL follow the cursor position along the progress bar
3. THE Thumbnail_Preview SHALL display the timestamp below or above the thumbnail image
4. THE Thumbnail_Preview SHALL have a smooth appearance animation
5. WHEN the user moves the cursor away from the Progress_Bar, THE Thumbnail_Preview SHALL disappear smoothly
6. IF thumbnail generation is not supported, THEN THE Video_Player SHALL only show the time tooltip (graceful degradation)
7. THE Thumbnail_Preview SHALL be generated from the video using canvas capture
8. THE Thumbnail_Preview SHALL have a 16:9 aspect ratio with rounded corners

### Requirement 3: Performance Considerations

**User Story:** As a developer, I want the thumbnail preview to be performant, so that it doesn't cause lag or stuttering.

#### Acceptance Criteria

1. THE Video_Player SHALL use a hidden video element for thumbnail generation to avoid affecting playback
2. THE Video_Player SHALL cache generated thumbnails to avoid regenerating the same frames
3. THE Video_Player SHALL debounce thumbnail generation requests to prevent excessive processing
4. WHEN generating thumbnails, THE Video_Player SHALL not block the main thread
