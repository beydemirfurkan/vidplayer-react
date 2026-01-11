# Implementation Plan: Video Library Enhancement

## Overview

Bu plan, video-library kütüphanesinin yeniden adlandırılması, performans optimizasyonları, tasarım tutarlılığı iyileştirmeleri ve Next.js uyumluluğunun sağlanması için adım adım implementasyon görevlerini içerir.

## Tasks

- [x] 1. Paket Yapılandırması ve Yeniden Adlandırma
  - [x] 1.1 package.json'da paket ismini güncelle
    - Yeni isim seç (örn: `vidplayer-react` veya `@scope/video-kit`)
    - `name`, `description`, `keywords` alanlarını güncelle
    - `repository`, `bugs`, `homepage` alanlarını ekle
    - _Requirements: 1.1, 2.1_
  - [x] 1.2 LICENSE dosyası oluştur
    - MIT lisansı ekle
    - _Requirements: 2.2_
  - [x] 1.3 README.md'yi güncelle
    - Yeni paket ismiyle örnekleri güncelle
    - Next.js kullanım örneği ekle
    - _Requirements: 2.3, 8.5_

- [x] 2. SSR-Safe Utilities Oluşturma
  - [x] 2.1 src/utils/ssr-safe.ts dosyası oluştur
    - `isBrowser` constant'ı ekle
    - `getDocument()` ve `getWindow()` helper'ları ekle
    - `useBrowserEffect` hook'u ekle
    - `useFullscreenState` hook'u ekle
    - _Requirements: 5.2_
  - [ ]* 2.2 SSR utility'leri için property test yaz
    - **Property 8: SSR Safety**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 2.3 Mevcut hook'lara "use client" direktifi ekle
    - src/hooks/*.ts dosyalarına ekle
    - src/components/**/*.tsx dosyalarına ekle
    - _Requirements: 5.1_

- [x] 3. Checkpoint - SSR altyapısı tamamlandı
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. VideoProvider Context Oluşturma
  - [x] 4.1 src/context/video-provider.tsx dosyası oluştur
    - `VideoProviderConfig` interface'i tanımla
    - `VideoContext` oluştur
    - `VideoProvider` component'i implement et
    - `useVideoConfig` hook'u implement et
    - _Requirements: 6.1_
  - [ ]* 4.2 VideoProvider için property test yaz
    - **Property 9: VideoProvider Context Propagation**
    - **Validates: Requirements 6.1**
  - [x] 4.3 Context'i src/index.ts'den export et
    - _Requirements: 6.1_

- [x] 5. Performans Optimizasyonları
  - [x] 5.1 src/components/video-player/styles.ts dosyası oluştur
    - Statik stil objelerini module scope'a taşı
    - `useControlStyles(accentColor)` hook'u oluştur
    - CSS custom properties tanımla
    - _Requirements: 3.1, 4.3_
  - [x] 5.2 Global CSS singleton pattern implement et
    - src/utils/inject-styles.ts dosyası oluştur
    - `injectGlobalStyles()` fonksiyonu implement et
    - `removeGlobalStyles()` fonksiyonu implement et
    - _Requirements: 3.2_
  - [ ]* 5.3 Style singleton için property test yaz
    - **Property 2: Style Singleton Injection**
    - **Validates: Requirements 3.2**

- [x] 6. VideoControls Refactoring
  - [x] 6.1 VideoControls'u memoized styles kullanacak şekilde güncelle
    - Inline style objelerini styles.ts'den import et
    - `useControlStyles` hook'unu kullan
    - accentColor prop'unu CSS variable olarak uygula
    - _Requirements: 3.1, 4.2_
  - [x] 6.2 Custom icon desteği ekle
    - `icons` prop'u ekle
    - `useVideoConfig` ile context'ten icon'ları al
    - Default icon'ları react-icons'dan kullan
    - _Requirements: 4.5, 6.2_
  - [ ]* 6.3 Custom icon rendering için property test yaz
    - **Property 7: Custom Icon Rendering**
    - **Validates: Requirements 4.5, 6.2**

- [x] 7. Checkpoint - Performans optimizasyonları tamamlandı
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. VideoPlayer SSR Uyumluluğu
  - [x] 8.1 VideoPlayer'ı SSR-safe hale getir
    - `mounted` state ekle
    - SSR placeholder render et
    - `injectGlobalStyles()` çağrısını useEffect'e taşı
    - Browser-only API'leri `useBrowserEffect` ile wrap et
    - _Requirements: 5.2, 5.3_
  - [x] 8.2 Fullscreen state'i SSR-safe yap
    - `useFullscreenState` hook'unu kullan
    - `document.fullscreenElement` erişimlerini güvenli hale getir
    - _Requirements: 5.2_
  - [ ]* 8.3 SSR rendering için property test yaz
    - **Property 8: SSR Safety**
    - **Validates: Requirements 5.2, 5.3**

- [x] 9. Data Attributes Tutarlılığı
  - [x] 9.1 Tüm bileşenlerde data-attributes standardize et
    - VideoPlayer: `data-video-player`, `data-playing`, `data-buffering`, `data-fullscreen`
    - VideoControls: `data-video-controls`
    - VideoThumbnail: `data-video-thumbnail`, `data-selected`, `data-loaded`
    - _Requirements: 4.1_
  - [ ]* 9.2 Data attribute tutarlılığı için property test yaz
    - **Property 5: Data Attribute Consistency**
    - **Validates: Requirements 4.1**

- [x] 10. Error Handling İyileştirmeleri
  - [x] 10.1 VideoError type'ı oluştur
    - src/types/index.ts'e `VideoErrorCode` ve `VideoError` ekle
    - _Requirements: 6.5_
  - [x] 10.2 useVideoPlayer'da error handling'i geliştir
    - Detaylı error mesajları ekle
    - Error code'ları ekle
    - _Requirements: 6.5_
  - [ ]* 10.3 Error handling için property test yaz
    - **Property 11: Error Message Quality**
    - **Validates: Requirements 6.5**

- [x] 11. Checkpoint - Core implementasyon tamamlandı
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Generic VideoItem Type
  - [x] 12.1 VideoItem'ı generic yap
    - `VideoItemBase` interface'i oluştur
    - `VideoItem<T>` generic type'ı oluştur
    - Hook option type'larını güncelle
    - _Requirements: 6.3_

- [x] 13. Ref Forwarding
  - [x] 13.1 VideoPlayer'a ref forwarding ekle
    - `forwardRef` kullanımını doğrula
    - Container div'e ref attach et
    - _Requirements: 6.4_
  - [x] 13.2 VideoThumbnail'a ref forwarding ekle
    - `forwardRef` ile wrap et
    - Root div'e ref attach et
    - _Requirements: 6.4_
  - [ ]* 13.3 Ref forwarding için property test yaz
    - **Property 10: Ref Forwarding**
    - **Validates: Requirements 6.4**

- [x] 14. API Export Kontrolü
  - [x] 14.1 Tüm export'ları doğrula
    - src/index.ts'deki export'ları kontrol et
    - Yeni eklenen export'ları ekle (VideoProvider, useVideoConfig, vb.)
    - _Requirements: 1.3_
  - [ ]* 14.2 API export tutarlılığı için property test yaz
    - **Property 1: API Export Consistency**
    - **Validates: Requirements 1.3**

- [x] 15. Thumbnail Preloading Optimizasyonu
  - [x] 15.1 preloadThumbnails fonksiyonunu basitleştir
    - Promise yönetimini sadeleştir
    - Concurrency kontrolünü iyileştir
    - _Requirements: 3.4_
  - [ ]* 15.2 Concurrent loading için property test yaz
    - **Property 4: Concurrent Thumbnail Loading**
    - **Validates: Requirements 3.4**

- [x] 16. Checkpoint - Tüm özellikler tamamlandı
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Test Coverage Artırma
  - [x] 17.1 Eksik utility testlerini yaz
    - debounce/throttle testleri
    - intersection-observer testleri
    - video-preloader testleri
    - _Requirements: 7.1_
  - [x] 17.2 Eksik hook testlerini yaz
    - useVideoPlayer testleri
    - useVideoSearch testleri
    - useKeyboardNav testleri
    - _Requirements: 7.2_
  - [x] 17.3 Component testlerini yaz
    - VideoPlayer testleri
    - VideoControls testleri
    - VideoThumbnail testleri
    - _Requirements: 7.3_

- [x] 18. Storybook Güncellemeleri
  - [x] 18.1 Mevcut story'leri güncelle
    - Yeni prop'ları story'lere ekle
    - Custom icon örneği ekle
    - _Requirements: 8.2_
  - [x] 18.2 VideoProvider story'si ekle
    - Global config örneği
    - _Requirements: 8.2_

- [x] 19. Next.js Örnek Projesi
  - [x] 19.1 examples/nextjs klasörü oluştur
    - Basit Next.js App Router örneği
    - SSR ve client component kullanımı
    - _Requirements: 5.4, 5.5, 8.5_

- [x] 20. Final Checkpoint - Proje tamamlandı
  - Ensure all tests pass, ask the user if questions arise.
  - npm publish için hazır

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Test framework: Vitest with fast-check for property-based testing

