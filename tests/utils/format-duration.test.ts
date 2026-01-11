import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  parseDuration,
  formatRelativeTime,
  formatViewCount,
} from '../../src/utils/format-duration';

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(599)).toBe('9:59');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3665)).toBe('1:01:05');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('handles forceHours option', () => {
    expect(formatDuration(65, { forceHours: true })).toBe('0:01:05');
    expect(formatDuration(5, { forceHours: true })).toBe('0:00:05');
  });

  it('handles padMinutes option', () => {
    expect(formatDuration(65, { padMinutes: true })).toBe('01:05');
    expect(formatDuration(605, { padMinutes: true })).toBe('10:05');
  });

  it('handles invalid input', () => {
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
    expect(formatDuration(Infinity)).toBe('0:00');
  });
});

describe('parseDuration', () => {
  it('parses minutes:seconds format', () => {
    expect(parseDuration('1:05')).toBe(65);
    expect(parseDuration('10:30')).toBe(630);
    expect(parseDuration('0:59')).toBe(59);
  });

  it('parses hours:minutes:seconds format', () => {
    expect(parseDuration('1:01:05')).toBe(3665);
    expect(parseDuration('2:30:00')).toBe(9000);
  });

  it('handles invalid input', () => {
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('invalid')).toBe(0);
    expect(parseDuration('1:-5')).toBe(0);
  });
});

describe('formatRelativeTime', () => {
  it('formats recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Just now');

    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('formats hours ago', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');

    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
  });

  it('formats days ago', () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');

    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveDaysAgo)).toBe('5 days ago');
  });

  it('formats weeks ago', () => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
  });

  it('accepts ISO date strings', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1 hour ago');
  });

  it('handles invalid input', () => {
    expect(formatRelativeTime('invalid')).toBe('');
  });
});

describe('formatViewCount', () => {
  it('formats small numbers', () => {
    expect(formatViewCount(0)).toBe('0');
    expect(formatViewCount(1)).toBe('1');
    expect(formatViewCount(999)).toBe('999');
  });

  it('formats thousands', () => {
    expect(formatViewCount(1000)).toBe('1K');
    expect(formatViewCount(1234)).toBe('1.2K');
    expect(formatViewCount(10000)).toBe('10K');
    expect(formatViewCount(999999)).toBe('1000K');
  });

  it('formats millions', () => {
    expect(formatViewCount(1000000)).toBe('1M');
    expect(formatViewCount(1234567)).toBe('1.2M');
    expect(formatViewCount(10000000)).toBe('10M');
  });

  it('formats billions', () => {
    expect(formatViewCount(1000000000)).toBe('1B');
    expect(formatViewCount(1234567890)).toBe('1.2B');
  });

  it('handles invalid input', () => {
    expect(formatViewCount(-1)).toBe('0');
    expect(formatViewCount(NaN)).toBe('0');
  });
});
