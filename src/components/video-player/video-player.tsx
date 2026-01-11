'use client';

import { memo, forwardRef, useImperativeHandle, useState, useCallback, useRef, useEffect } from 'react';
import { MdPlayArrow, MdReplay10, MdForward10 } from 'react-icons/md';
import type { VideoPlayerProps, VideoControlsProps, VideoQualityOption } from '../../types';
import { useVideoPlayer } from '../../hooks/use-video-player';
import { usePlayerKeyboardShortcuts } from '../../hooks/use-keyboard-nav';
import { useVideoConfig, type VideoIconConfig } from '../../context';
import { useMounted, useBrowserEffect } from '../../utils/ssr-safe';
import { injectGlobalStyles } from '../../utils/inject-styles';
import { VideoControls, type VideoControlsExtendedProps } from './video-controls';
import { playerStyles, ICON_SIZES, CSS_VARIABLES, useAccentStyles } from './styles';

const DOUBLE_TAP_DELAY = 300;
const SHORTCUT_HINT_DURATION = 800;

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  requestPiP: () => void;
  exitPiP: () => void;
  skipForward: () => void;
  skipBackward: () => void;
}

export interface VideoPlayerExtendedProps extends VideoPlayerProps {
  icons?: Partial<VideoIconConfig>;
  /** Show video title overlay */
  showTitle?: boolean;
}

export const VideoPlayer = memo(
  forwardRef<VideoPlayerHandle, VideoPlayerExtendedProps>(function VideoPlayer(
    {
      video,
      autoPlay = false,
      muted = false,
      loop = false,
      preload = 'metadata',
      showControls = true,
      showTitle = false,
      skipDuration: propSkipDuration,
      qualityOptions,
      onTimeUpdate,
      onEnded,
      onError,
      onQualityChange,
      renderControls,
      poster,
      accentColor: propAccentColor,
      playbackRateOptions: propPlaybackRateOptions,
      onPlaybackRateChange,
      icons: propIcons,
      className,
      'data-testid': testId,
    },
    ref
  ) {
    const config = useVideoConfig();
    const accentColor = propAccentColor ?? config.accentColor;
    const skipDuration = propSkipDuration ?? config.skipDuration;
    const playbackRateOptions = propPlaybackRateOptions ?? config.playbackRateOptions;
    const keyboardShortcutsEnabled = config.keyboardShortcuts;

    const mounted = useMounted();
    const accentStyles = useAccentStyles(accentColor);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const lastTapRef = useRef<{ time: number; x: number } | null>(null);
    const shortcutHintTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    
    const [showControlsUI, setShowControlsUI] = useState(true);
    const [currentQuality, setCurrentQuality] = useState<string | undefined>(qualityOptions?.[0]?.label);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [doubleTapSide, setDoubleTapSide] = useState<'left' | 'right' | null>(null);
    const [shortcutHint, setShortcutHint] = useState<string | null>(null);
    const [isPlayOverlayHovered, setIsPlayOverlayHovered] = useState(false);

    const player = useVideoPlayer({
      video,
      autoPlay,
      muted,
      loop,
      preload,
      onTimeUpdate,
      onEnded,
      onError,
    });

    useBrowserEffect(() => {
      injectGlobalStyles();
    }, []);

    useBrowserEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
        setShowControlsUI(true);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Show keyboard shortcut hint
    const showShortcutHint = useCallback((hint: string) => {
      setShortcutHint(hint);
      if (shortcutHintTimeoutRef.current) clearTimeout(shortcutHintTimeoutRef.current);
      shortcutHintTimeoutRef.current = setTimeout(() => setShortcutHint(null), SHORTCUT_HINT_DURATION);
    }, []);

    const skipForward = useCallback(() => {
      player.seek(Math.min(player.currentTime + skipDuration, player.duration));
      showShortcutHint(`+${skipDuration}s`);
    }, [player, skipDuration, showShortcutHint]);

    const skipBackward = useCallback(() => {
      player.seek(Math.max(player.currentTime - skipDuration, 0));
      showShortcutHint(`-${skipDuration}s`);
    }, [player, skipDuration, showShortcutHint]);

    const volumeUp = useCallback(() => {
      const newVol = Math.min(player.volume + 0.1, 1);
      player.setVolume(newVol);
      showShortcutHint(`Volume: ${Math.round(newVol * 100)}%`);
    }, [player, showShortcutHint]);

    const volumeDown = useCallback(() => {
      const newVol = Math.max(player.volume - 0.1, 0);
      player.setVolume(newVol);
      showShortcutHint(`Volume: ${Math.round(newVol * 100)}%`);
    }, [player, showShortcutHint]);

    const handleTogglePlay = useCallback(() => {
      player.toggle();
      showShortcutHint(player.isPlaying ? '⏸ Paused' : '▶ Playing');
    }, [player, showShortcutHint]);

    const handleToggleMute = useCallback(() => {
      player.toggleMute();
      showShortcutHint(player.isMuted ? '🔊 Unmuted' : '🔇 Muted');
    }, [player, showShortcutHint]);

    const seekToPercent = useCallback((percent: number) => {
      if (player.duration > 0) player.seek((percent / 100) * player.duration);
    }, [player]);

    const seekToStart = useCallback(() => player.seek(0), [player]);
    const seekToEnd = useCallback(() => {
      if (player.duration > 0) player.seek(player.duration);
    }, [player]);

    const speedUp = useCallback(() => {
      const speeds = playbackRateOptions;
      const currentIndex = speeds.indexOf(player.playbackRate);
      if (currentIndex < speeds.length - 1) {
        const newRate = speeds[currentIndex + 1] ?? speeds[speeds.length - 1] ?? 1;
        player.setPlaybackRate(newRate);
        showShortcutHint(`Speed: ${newRate}x`);
      }
    }, [player, playbackRateOptions, showShortcutHint]);

    const speedDown = useCallback(() => {
      const speeds = playbackRateOptions;
      const currentIndex = speeds.indexOf(player.playbackRate);
      if (currentIndex > 0) {
        const newRate = speeds[currentIndex - 1] ?? speeds[0] ?? 1;
        player.setPlaybackRate(newRate);
        showShortcutHint(`Speed: ${newRate}x`);
      }
    }, [player, playbackRateOptions, showShortcutHint]);

    const handleQualityChange = useCallback((quality: VideoQualityOption) => {
      setCurrentQuality(quality.label);
      player.changeQuality(quality.src);
      onQualityChange?.(quality);
    }, [player, onQualityChange]);

    const handleToggleFullscreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        container.requestFullscreen().catch(() => {});
      }
    }, []);

    // Double tap to seek
    const handleVideoClick = useCallback((e: React.MouseEvent) => {
      const now = Date.now();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeftSide = x < rect.width / 3;
      const isRightSide = x > (rect.width * 2) / 3;

      if (lastTapRef.current && now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
        // Double tap detected
        if (isLeftSide) {
          skipBackward();
          setDoubleTapSide('left');
          setTimeout(() => setDoubleTapSide(null), 500);
        } else if (isRightSide) {
          skipForward();
          setDoubleTapSide('right');
          setTimeout(() => setDoubleTapSide(null), 500);
        }
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x };
        // Single tap - toggle play after delay if no double tap
        setTimeout(() => {
          if (lastTapRef.current && lastTapRef.current.time === now) {
            player.toggle();
            lastTapRef.current = null;
          }
        }, DOUBLE_TAP_DELAY);
      }
    }, [player, skipForward, skipBackward]);

    const handleKeyDown = usePlayerKeyboardShortcuts({
      onTogglePlay: handleTogglePlay,
      onSeekForward: skipForward,
      onSeekBackward: skipBackward,
      onVolumeUp: volumeUp,
      onVolumeDown: volumeDown,
      onToggleMute: handleToggleMute,
      onToggleFullscreen: handleToggleFullscreen,
      onSeekToPercent: seekToPercent,
      onSpeedUp: speedUp,
      onSpeedDown: speedDown,
      onHome: seekToStart,
      onEnd: seekToEnd,
      enabled: keyboardShortcutsEnabled && !!video,
    });

    const resetHideTimer = useCallback(() => {
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      setShowControlsUI(true);
      if (player.isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => setShowControlsUI(false), 3000);
      }
    }, [player.isPlaying]);

    useEffect(() => {
      resetHideTimer();
      return () => {
        if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      };
    }, [player.isPlaying, resetHideTimer]);

    useEffect(() => {
      return () => {
        if (shortcutHintTimeoutRef.current) clearTimeout(shortcutHintTimeoutRef.current);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: player.play,
      pause: player.pause,
      toggle: player.toggle,
      seek: player.seek,
      setVolume: player.setVolume,
      toggleMute: player.toggleMute,
      toggleFullscreen: handleToggleFullscreen,
      requestPiP: player.requestPiP,
      exitPiP: player.exitPiP,
      skipForward,
      skipBackward,
    }), [player, handleToggleFullscreen, skipForward, skipBackward]);

    const controlsProps: VideoControlsExtendedProps = {
      isPlaying: player.isPlaying,
      currentTime: player.currentTime,
      duration: player.duration,
      volume: player.volume,
      isMuted: player.isMuted,
      isFullscreen,
      bufferedProgress: player.bufferedProgress,
      isBuffering: player.isBuffering,
      onTogglePlay: player.toggle,
      onSeek: player.seek,
      onSkipForward: skipForward,
      onSkipBackward: skipBackward,
      onVolumeChange: player.setVolume,
      onToggleMute: player.toggleMute,
      onToggleFullscreen: handleToggleFullscreen,
      onTogglePiP: player.requestPiP,
      isPiPActive: player.isPiPActive,
      qualityOptions,
      currentQuality,
      onQualityChange: handleQualityChange,
      skipDuration,
      playbackRate: player.playbackRate,
      playbackRateOptions,
      onPlaybackRateChange: (rate: number) => {
        player.setPlaybackRate(rate);
        onPlaybackRateChange?.(rate);
      },
      accentColor,
      icons: propIcons,
      videoSrc: video?.src,
      enableThumbnailPreview: true,
    };

    if (!mounted) {
      return (
        <div
          className={className}
          data-testid={testId}
          data-video-player
          data-ssr-placeholder
          style={{ ...playerStyles.container, aspectRatio: '16/9' }}
        >
          <div style={playerStyles.emptyState}>
            <MdPlayArrow size={ICON_SIZES.xlarge} />
            <span>Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={className}
        data-testid={testId}
        data-video-player
        data-playing={player.isPlaying || undefined}
        data-buffering={player.isBuffering || undefined}
        data-fullscreen={isFullscreen || undefined}
        tabIndex={0}
        style={{
          ...playerStyles.container,
          [CSS_VARIABLES.accentColor]: accentColor,
          outline: 'none',
          ...(isFullscreen ? { background: '#000', height: '100vh', borderRadius: 0 } : {}),
        } as React.CSSProperties}
        onKeyDown={handleKeyDown}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => player.isPlaying && setShowControlsUI(false)}
      >
        <div style={isFullscreen ? { height: '100%' } : playerStyles.videoWrapper}>
          <video
            ref={player.videoRef}
            poster={poster ?? video?.thumbnail}
            playsInline
            onClick={handleVideoClick}
            style={{
              ...playerStyles.video,
              ...(isFullscreen ? { position: 'relative', height: '100%' } : {}),
            }}
          />

          {/* Video title overlay */}
          {showTitle && video?.title && (
            <div style={{
              ...playerStyles.titleOverlay,
              ...(showControlsUI || !player.isPlaying ? playerStyles.titleOverlayVisible : {}),
            }}>
              {video.title}
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {shortcutHint && (
            <div style={{ ...playerStyles.shortcutHint, ...playerStyles.shortcutHintVisible }}>
              {shortcutHint}
            </div>
          )}

          {/* Double tap indicators */}
          {doubleTapSide === 'left' && (
            <div style={{ ...playerStyles.doubleTapIndicator, ...playerStyles.doubleTapLeft }}>
              <MdReplay10 size={40} />
              <span>{skipDuration}s</span>
            </div>
          )}
          {doubleTapSide === 'right' && (
            <div style={{ ...playerStyles.doubleTapIndicator, ...playerStyles.doubleTapRight }}>
              <MdForward10 size={40} />
              <span>{skipDuration}s</span>
            </div>
          )}

          {/* Loading indicator */}
          {player.isBuffering && player.isPlaying && (
            <div style={playerStyles.loadingOverlay}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(255,255,255,0.2)',
                borderTopColor: accentColor,
                borderRadius: '50%',
                animation: 'video-player-spin 1s linear infinite',
              }} />
            </div>
          )}

          {/* Play overlay */}
          {!player.isPlaying && video && !player.isBuffering && (
            <div
              data-play-overlay
              style={playerStyles.playOverlay}
              onClick={handleVideoClick}
              onMouseEnter={() => setIsPlayOverlayHovered(true)}
              onMouseLeave={() => setIsPlayOverlayHovered(false)}
            >
              <div
                data-play-icon
                style={{
                  ...accentStyles.playOverlayIcon,
                  ...(isPlayOverlayHovered ? playerStyles.playOverlayIconHover : {}),
                }}
              >
                <MdPlayArrow size={ICON_SIZES.large} color="#000" />
              </div>
            </div>
          )}

          {/* Controls */}
          {showControls && video && (
            <div style={{
              ...playerStyles.controlsWrapper,
              ...(showControlsUI || !player.isPlaying ? playerStyles.controlsWrapperVisible : {}),
            }}>
              {renderControls ? renderControls(controlsProps as VideoControlsProps) : <VideoControls {...controlsProps} />}
            </div>
          )}

          {/* No video placeholder */}
          {!video && (
            <div style={playerStyles.emptyState}>
              <MdPlayArrow size={ICON_SIZES.xlarge} />
              <span>No video selected</span>
            </div>
          )}
        </div>
      </div>
    );
  })
);

VideoPlayer.displayName = 'VideoPlayer';
