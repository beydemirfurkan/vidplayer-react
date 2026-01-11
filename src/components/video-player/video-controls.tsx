'use client';

import { memo, useState, useRef, useEffect, type ComponentType } from 'react';
import {
  MdPlayArrow,
  MdPause,
  MdVolumeUp,
  MdVolumeDown,
  MdVolumeOff,
  MdFullscreen,
  MdFullscreenExit,
  MdSettings,
  MdReplay10,
  MdForward10,
  MdPictureInPictureAlt,
  MdSpeed,
  MdChevronRight,
  MdChevronLeft,
  MdTune,
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import type { VideoControlsProps } from '../../types';
import { formatDuration } from '../../utils/format-duration';
import { useVideoConfig, type IconProps, type VideoIconConfig } from '../../context';
import { useThumbnailGenerator } from '../../hooks/use-thumbnail-generator';
import { controlStyles, useAccentStyles, ICON_SIZES, CSS_VARIABLES } from './styles';

/** Thumbnail preview dimensions */
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

const DEFAULT_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4];

/** Keyboard shortcuts for tooltips */
const KEYBOARD_SHORTCUTS: Record<string, string> = {
  play: 'K',
  mute: 'M',
  fullscreen: 'F',
  skipForward: '→',
  skipBackward: '←',
  volumeUp: '↑',
  volumeDown: '↓',
};

/**
 * Extended props for VideoControls with icon customization
 */
export interface VideoControlsExtendedProps extends VideoControlsProps {
  icons?: Partial<VideoIconConfig>;
  accentColor?: string;
  /** Video source URL for thumbnail generation */
  videoSrc?: string;
  /** Enable thumbnail preview on progress bar hover */
  enableThumbnailPreview?: boolean;
}

/**
 * Default icon components from react-icons
 */
const defaultIcons: Required<VideoIconConfig> = {
  play: MdPlayArrow as ComponentType<IconProps>,
  pause: MdPause as ComponentType<IconProps>,
  volumeHigh: MdVolumeUp as ComponentType<IconProps>,
  volumeLow: MdVolumeDown as ComponentType<IconProps>,
  volumeMute: MdVolumeOff as ComponentType<IconProps>,
  fullscreen: MdFullscreen as ComponentType<IconProps>,
  fullscreenExit: MdFullscreenExit as ComponentType<IconProps>,
  settings: MdSettings as ComponentType<IconProps>,
  skipForward: MdForward10 as ComponentType<IconProps>,
  skipBackward: MdReplay10 as ComponentType<IconProps>,
  pip: MdPictureInPictureAlt as ComponentType<IconProps>,
  loading: AiOutlineLoading3Quarters as ComponentType<IconProps>,
  speed: MdSpeed as ComponentType<IconProps>,
  quality: MdTune as ComponentType<IconProps>,
  chevronRight: MdChevronRight as ComponentType<IconProps>,
  chevronLeft: MdChevronLeft as ComponentType<IconProps>,
};

interface TooltipButtonProps {
  onClick: () => void;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  style?: React.CSSProperties;
  isActive?: boolean;
  accentColor?: string;
}

/** Button with tooltip */
function TooltipButton({ onClick, label, shortcut, icon, style, isActive, accentColor }: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...controlStyles.button,
        ...style,
        ...(isActive ? { color: accentColor } : {}),
      }}
      aria-label={label}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {icon}
      {showTooltip && (
        <div style={{ ...controlStyles.tooltip, ...controlStyles.tooltipVisible }}>
          {label}
          {shortcut && <span style={controlStyles.tooltipShortcut}>{shortcut}</span>}
        </div>
      )}
    </button>
  );
}

interface ThumbnailPreviewProps {
  thumbnailUrl: string | null;
  isLoading: boolean;
  time: number;
  position: number;
  containerWidth: number;
}

/** Thumbnail preview component */
function ThumbnailPreview({ thumbnailUrl, isLoading, time, position, containerWidth }: ThumbnailPreviewProps) {
  // Clamp position to keep preview within bounds
  const halfWidth = THUMBNAIL_WIDTH / 2;
  const minPosition = (halfWidth / containerWidth) * 100;
  const maxPosition = 100 - minPosition;
  const clampedPosition = Math.max(minPosition, Math.min(maxPosition, position));

  return (
    <div
      style={{
        ...controlStyles.thumbnailPreview,
        left: `${clampedPosition}%`,
      }}
    >
      {isLoading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <AiOutlineLoading3Quarters
            size={24}
            style={{ animation: 'video-player-spin 1s linear infinite', color: 'white' }}
          />
        </div>
      ) : thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={`Preview at ${formatDuration(time)}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
          }}
        >
          {formatDuration(time)}
        </div>
      )}
    </div>
  );
}


/**
 * VideoControls component
 */
export const VideoControls = memo(function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  bufferedProgress = 0,
  isBuffering = false,
  onTogglePlay,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onTogglePiP,
  isPiPActive,
  qualityOptions,
  currentQuality,
  onQualityChange,
  skipDuration = 10,
  playbackRate = 1,
  playbackRateOptions = DEFAULT_PLAYBACK_RATES,
  onPlaybackRateChange,
  icons: propIcons,
  accentColor: propAccentColor,
  videoSrc,
  enableThumbnailPreview = true,
  className,
  'data-testid': testId,
}: VideoControlsExtendedProps) {
  const config = useVideoConfig();
  const accentColor = propAccentColor ?? config.accentColor;
  
  const icons = {
    ...defaultIcons,
    ...config.icons,
    ...propIcons,
  };

  const accentStyles = useAccentStyles(accentColor);

  // Thumbnail generator
  const {
    generateThumbnail,
    thumbnailUrl,
    isLoading: isThumbnailLoading,
  } = useThumbnailGenerator({
    videoSrc,
    enabled: enableThumbnailPreview && !!videoSrc,
  });

  // Local state
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<'closed' | 'main' | 'quality' | 'speed'>('closed');
  const [isDragging, setIsDragging] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  
  // Refs
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Computed values
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Icon components
  const PlayIcon = icons.play;
  const PauseIcon = icons.pause;
  const LoadingIcon = icons.loading;
  const SkipBackwardIcon = icons.skipBackward;
  const SkipForwardIcon = icons.skipForward;
  const SettingsIcon = icons.settings;
  const PiPIcon = icons.pip;
  const FullscreenIcon = icons.fullscreen;
  const FullscreenExitIcon = icons.fullscreenExit;
  const SpeedIcon = icons.speed;
  const QualityIcon = icons.quality;
  const ChevronRightIcon = icons.chevronRight;
  const ChevronLeftIcon = icons.chevronLeft;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return icons.volumeMute;
    if (volume < 0.5) return icons.volumeLow;
    return icons.volumeHigh;
  };
  const VolumeIcon = getVolumeIcon();

  // Event handlers
  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(percent * duration);
  };

  const handleProgressMouseMove = (e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    setHoverTime(time);
    setHoverPosition(percent * 100);
    setProgressWidth(rect.width);
    
    // Generate thumbnail for hover time
    if (enableThumbnailPreview && videoSrc) {
      generateThumbnail(time);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressClick(e);

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(percent * duration);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeEnter = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    setIsVolumeOpen(true);
  };

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => setIsVolumeOpen(false), 300);
  };

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenu('closed');
      }
    };

    if (settingsMenu !== 'closed') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [settingsMenu]);

  return (
    <div
      className={className}
      data-testid={testId}
      data-video-controls
      style={{
        ...controlStyles.container,
        [CSS_VARIABLES.accentColor]: accentColor,
      } as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress Bar */}
      <div
        ref={progressRef}
        data-progress-container
        style={controlStyles.progressContainer}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => {
          setIsHoveringProgress(false);
          setHoverTime(null);
        }}
        onMouseMove={handleProgressMouseMove}
        onMouseDown={handleProgressMouseDown}
      >
        {/* Thumbnail preview */}
        {hoverTime !== null && (isHoveringProgress || isDragging) && enableThumbnailPreview && videoSrc && (
          <ThumbnailPreview
            thumbnailUrl={thumbnailUrl}
            isLoading={isThumbnailLoading}
            time={hoverTime}
            position={hoverPosition}
            containerWidth={progressWidth || 1}
          />
        )}

        {/* Hover time tooltip */}
        {hoverTime !== null && (isHoveringProgress || isDragging) && (
          <div style={{ 
            ...controlStyles.hoverTime, 
            left: `${hoverPosition}%`,
            marginBottom: enableThumbnailPreview && videoSrc ? `${THUMBNAIL_HEIGHT + 16}px` : '12px',
          }}>
            {formatDuration(hoverTime)}
          </div>
        )}

        <div
          data-progress-track
          style={{
            ...controlStyles.progressTrack,
            ...(isHoveringProgress || isDragging ? controlStyles.progressTrackHover : {}),
          }}
        >
          {/* Buffered */}
          <div
            style={{
              ...controlStyles.progressBuffered,
              width: `${bufferedProgress * 100}%`,
            }}
          />
          {/* Progress */}
          <div
            style={{
              ...accentStyles.progressFilled,
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Thumb */}
        <div
          style={{
            ...accentStyles.progressThumb,
            left: `${progress}%`,
            ...(isHoveringProgress || isDragging ? controlStyles.progressThumbVisible : {}),
          }}
        />
      </div>

      {/* Controls Row */}
      <div style={controlStyles.controlsRow}>
        {/* Left Controls */}
        <div style={controlStyles.leftControls}>
          {/* Play/Pause */}
          <TooltipButton
            onClick={onTogglePlay}
            label={isPlaying ? 'Pause' : 'Play'}
            shortcut={KEYBOARD_SHORTCUTS.play}
            style={controlStyles.playButton}
            accentColor={accentColor}
            icon={
              isBuffering ? (
                <LoadingIcon size={ICON_SIZES.primary} style={controlStyles.loader} />
              ) : isPlaying ? (
                <PauseIcon size={ICON_SIZES.primary} />
              ) : (
                <PlayIcon size={ICON_SIZES.primary} />
              )
            }
          />

          {/* Skip Backward */}
          {onSkipBackward && (
            <TooltipButton
              onClick={onSkipBackward}
              label={`Rewind ${skipDuration}s`}
              shortcut={KEYBOARD_SHORTCUTS.skipBackward}
              accentColor={accentColor}
              icon={<SkipBackwardIcon size={ICON_SIZES.default} />}
            />
          )}

          {/* Skip Forward */}
          {onSkipForward && (
            <TooltipButton
              onClick={onSkipForward}
              label={`Forward ${skipDuration}s`}
              shortcut={KEYBOARD_SHORTCUTS.skipForward}
              accentColor={accentColor}
              icon={<SkipForwardIcon size={ICON_SIZES.default} />}
            />
          )}

          {/* Volume */}
          <div
            style={controlStyles.volumeContainer}
            onMouseEnter={handleVolumeEnter}
            onMouseLeave={handleVolumeLeave}
          >
            <TooltipButton
              onClick={onToggleMute}
              label={isMuted ? 'Unmute' : 'Mute'}
              shortcut={KEYBOARD_SHORTCUTS.mute}
              accentColor={accentColor}
              icon={<VolumeIcon size={ICON_SIZES.default} />}
            />

            <div
              style={{
                ...controlStyles.volumeSliderContainer,
                ...(isVolumeOpen ? controlStyles.volumeSliderContainerOpen : {}),
              }}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                style={accentStyles.volumeSliderFilled(volume, isMuted)}
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Time Display */}
          <div style={controlStyles.timeDisplay}>
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div style={controlStyles.rightControls}>
          {/* Settings Menu */}
          <div ref={settingsMenuRef} style={{ position: 'relative' }}>
            <TooltipButton
              onClick={() => setSettingsMenu(settingsMenu === 'closed' ? 'main' : 'closed')}
              label="Settings"
              accentColor={accentColor}
              icon={<SettingsIcon size={ICON_SIZES.default} />}
            />

            {settingsMenu !== 'closed' && (
              <div style={controlStyles.qualityMenu} data-menu>
                {/* Main Menu */}
                {settingsMenu === 'main' && (
                  <>
                    {onPlaybackRateChange && (
                      <button
                        type="button"
                        data-menu-item
                        onClick={() => setSettingsMenu('speed')}
                        style={controlStyles.qualityOption}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <SpeedIcon size={ICON_SIZES.small} />
                          Speed
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
                          {playbackRate}x
                          <ChevronRightIcon size={18} />
                        </span>
                      </button>
                    )}
                    {qualityOptions && qualityOptions.length > 0 && onQualityChange && (
                      <button
                        type="button"
                        data-menu-item
                        onClick={() => setSettingsMenu('quality')}
                        style={controlStyles.qualityOption}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <QualityIcon size={ICON_SIZES.small} />
                          Quality
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
                          {currentQuality || '—'}
                          <ChevronRightIcon size={18} />
                        </span>
                      </button>
                    )}
                  </>
                )}

                {/* Speed Submenu */}
                {settingsMenu === 'speed' && (
                  <>
                    <button
                      type="button"
                      data-menu-item
                      onClick={() => setSettingsMenu('main')}
                      style={{
                        ...controlStyles.qualityOption,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '4px',
                        paddingBottom: '12px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronLeftIcon size={ICON_SIZES.small} />
                        <SpeedIcon size={ICON_SIZES.small} />
                        Speed
                      </span>
                    </button>
                    {playbackRateOptions.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        data-menu-item
                        onClick={() => {
                          onPlaybackRateChange?.(rate);
                          setSettingsMenu('closed');
                        }}
                        style={{
                          ...controlStyles.qualityOption,
                          ...(rate === playbackRate ? { color: accentColor, fontWeight: 600 } : {}),
                        }}
                      >
                        {rate}x
                        {rate === playbackRate && ' ✓'}
                      </button>
                    ))}
                  </>
                )}

                {/* Quality Submenu */}
                {settingsMenu === 'quality' && (
                  <>
                    <button
                      type="button"
                      data-menu-item
                      onClick={() => setSettingsMenu('main')}
                      style={{
                        ...controlStyles.qualityOption,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '4px',
                        paddingBottom: '12px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronLeftIcon size={ICON_SIZES.small} />
                        <QualityIcon size={ICON_SIZES.small} />
                        Quality
                      </span>
                    </button>
                    {qualityOptions?.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        data-menu-item
                        onClick={() => {
                          onQualityChange?.(option);
                          setSettingsMenu('closed');
                        }}
                        style={{
                          ...controlStyles.qualityOption,
                          ...(option.label === currentQuality ? { color: accentColor, fontWeight: 600 } : {}),
                        }}
                      >
                        {option.label}
                        {option.label === currentQuality && ' ✓'}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* PiP */}
          {onTogglePiP && (
            <TooltipButton
              onClick={onTogglePiP}
              label={isPiPActive ? 'Exit PiP' : 'Picture in Picture'}
              isActive={isPiPActive}
              accentColor={accentColor}
              icon={<PiPIcon size={ICON_SIZES.default} />}
            />
          )}

          {/* Fullscreen */}
          <TooltipButton
            onClick={onToggleFullscreen}
            label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            shortcut={KEYBOARD_SHORTCUTS.fullscreen}
            accentColor={accentColor}
            icon={
              isFullscreen ? (
                <FullscreenExitIcon size={ICON_SIZES.default} />
              ) : (
                <FullscreenIcon size={ICON_SIZES.default} />
              )
            }
          />
        </div>
      </div>
    </div>
  );
});

VideoControls.displayName = 'VideoControls';
