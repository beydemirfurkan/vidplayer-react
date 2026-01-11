import { useRef, useState, useCallback, useEffect } from 'react';
import type { UseVideoPlayerOptions, UseVideoPlayerReturn } from '../types';
import { createVideoError } from '../types';

/**
 * Hook for controlling video playback
 *
 * Provides comprehensive video player controls including play/pause,
 * seeking, volume, fullscreen, and Picture-in-Picture support.
 *
 * @param options - Player configuration options
 * @returns Player state and control functions
 *
 * @example
 * const {
 *   videoRef,
 *   isPlaying,
 *   currentTime,
 *   duration,
 *   toggle,
 *   seek,
 * } = useVideoPlayer({
 *   video: selectedVideo,
 *   autoPlay: false,
 *   onEnded: () => playNext(),
 * });
 *
 * return <video ref={videoRef} />;
 */
export function useVideoPlayer(options: UseVideoPlayerOptions): UseVideoPlayerReturn {
  const {
    video,
    autoPlay = false,
    muted = false,
    loop = false,
    preload = 'metadata',
    onTimeUpdate,
    onEnded,
    onError,
    onPlayStateChange,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);

  // Callback ref to track when video element is mounted
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    setVideoElement(element);
  }, []);

  // Update video source when video changes or element mounts
  useEffect(() => {
    if (!videoElement) return;

    if (video) {
      // Only update src if it's different
      if (videoElement.src !== video.src) {
        videoElement.src = video.src;
        videoElement.load();
      }

      if (autoPlay) {
        videoElement.play().catch(() => {
          // Autoplay was prevented, handle silently
        });
      }
    } else {
      videoElement.src = '';
      videoElement.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [video?.src, autoPlay, videoElement]);

  // Set up video element properties
  useEffect(() => {
    if (!videoElement) return;

    videoElement.muted = isMuted;
    videoElement.loop = loop;
    videoElement.preload = preload;
    videoElement.volume = volume;
  }, [isMuted, loop, preload, volume, videoElement]);

  // Set up event listeners
  useEffect(() => {
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      onTimeUpdate?.(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      onEnded?.();
    };

    const handleError = () => {
      const error = createVideoError(videoElement.error ?? null);
      onError?.(error);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (videoElement.buffered.length > 0 && videoElement.duration > 0) {
        const buffered = videoElement.buffered.end(videoElement.buffered.length - 1);
        setBufferedProgress(buffered / videoElement.duration);
      }
    };

    const handleVolumeChange = () => {
      setVolumeState(videoElement.volume);
      setIsMuted(videoElement.muted);
    };

    const handleEnterpip = () => {
      setIsPiPActive(true);
    };

    const handleLeavepip = () => {
      setIsPiPActive(false);
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('progress', handleProgress);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('enterpictureinpicture', handleEnterpip);
    videoElement.addEventListener('leavepictureinpicture', handleLeavepip);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('progress', handleProgress);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('enterpictureinpicture', handleEnterpip);
      videoElement.removeEventListener('leavepictureinpicture', handleLeavepip);
    };
  }, [videoElement, onTimeUpdate, onEnded, onError, onPlayStateChange]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {
      // Play was prevented
    });
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const clampedTime = Math.max(0, Math.min(time, videoElement.duration || 0));
      videoElement.currentTime = clampedTime;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const clampedVol = Math.max(0, Math.min(1, vol));
      videoElement.volume = clampedVol;
      if (clampedVol > 0 && videoElement.muted) {
        videoElement.muted = false;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Exit fullscreen failed
      });
    } else {
      videoElement.requestFullscreen().catch(() => {
        // Request fullscreen failed
      });
    }
  }, []);

  const requestPiP = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement && 'requestPictureInPicture' in videoElement) {
      (videoElement as HTMLVideoElement).requestPictureInPicture().catch(() => {
        // PiP request failed
      });
    }
  }, []);

  const exitPiP = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {
        // Exit PiP failed
      });
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const changeQuality = useCallback((newSrc: string, preserveTime = true) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const wasPlaying = !videoElement.paused;
    const savedTime = videoElement.currentTime;
    const savedRate = videoElement.playbackRate;

    videoElement.src = newSrc;
    videoElement.load();

    const handleLoadedMetadata = () => {
      if (preserveTime && savedTime > 0) {
        videoElement.currentTime = savedTime;
      }
      videoElement.playbackRate = savedRate;

      if (wasPlaying) {
        videoElement.play().catch(() => {});
      }
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  return {
    videoRef: setVideoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isBuffering,
    bufferedProgress,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    requestPiP,
    exitPiP,
    isPiPActive,
    playbackRate,
    setPlaybackRate,
    changeQuality,
  };
}
