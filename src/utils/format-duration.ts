/**
 * Formats a duration in seconds to a human-readable string
 *
 * @param seconds - Duration in seconds
 * @param options - Formatting options
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(65) // "1:05"
 * formatDuration(3665) // "1:01:05"
 * formatDuration(65, { padMinutes: true }) // "01:05"
 */
export function formatDuration(
  seconds: number,
  options: {
    /** Always show hours even if zero */
    forceHours?: boolean;
    /** Pad minutes with leading zero */
    padMinutes?: boolean;
  } = {}
): string {
  const { forceHours = false, padMinutes = false } = options;

  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs.toString().padStart(2, '0');

  if (hours > 0 || forceHours) {
    const paddedMins = minutes.toString().padStart(2, '0');
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  const formattedMins = padMinutes ? minutes.toString().padStart(2, '0') : minutes.toString();
  return `${formattedMins}:${paddedSecs}`;
}

/**
 * Parses a duration string back to seconds
 *
 * @param duration - Duration string (e.g., "1:05", "1:01:05")
 * @returns Duration in seconds, or 0 if invalid
 *
 * @example
 * parseDuration("1:05") // 65
 * parseDuration("1:01:05") // 3665
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);

  if (parts.some((p) => !Number.isFinite(p) || p < 0)) {
    return 0;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return (minutes ?? 0) * 60 + (seconds ?? 0);
  }

  return parts[0] ?? 0;
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const timestamp = typeof date === 'string' ? new Date(date).getTime() : date.getTime();

  if (!Number.isFinite(timestamp)) {
    return '';
  }

  const diffMs = now - timestamp;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  }
  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }
  if (diffWeeks > 0) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }

  return 'Just now';
}

/**
 * Formats view count with abbreviations
 *
 * @param views - Number of views
 * @returns Formatted view count
 *
 * @example
 * formatViewCount(1234) // "1.2K"
 * formatViewCount(1234567) // "1.2M"
 */
export function formatViewCount(views: number): string {
  if (!Number.isFinite(views) || views < 0) {
    return '0';
  }

  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return views.toString();
}
