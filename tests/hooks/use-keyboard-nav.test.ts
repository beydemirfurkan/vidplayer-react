import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlayerKeyboardShortcuts } from '../../src/hooks/use-keyboard-nav';

function createKeyboardEvent(key: string, target?: EventTarget): React.KeyboardEvent {
  return {
    key,
    target: target ?? document.createElement('div'),
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe('usePlayerKeyboardShortcuts', () => {
  it('calls onTogglePlay for space key', () => {
    const onTogglePlay = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onTogglePlay })
    );

    const event = createKeyboardEvent(' ');
    result.current(event);

    expect(onTogglePlay).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('calls onTogglePlay for k key', () => {
    const onTogglePlay = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onTogglePlay })
    );

    result.current(createKeyboardEvent('k'));
    expect(onTogglePlay).toHaveBeenCalled();
  });

  it('calls onSeekForward for ArrowRight', () => {
    const onSeekForward = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSeekForward })
    );

    result.current(createKeyboardEvent('ArrowRight'));
    expect(onSeekForward).toHaveBeenCalled();
  });

  it('calls onSeekForward for l key', () => {
    const onSeekForward = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSeekForward })
    );

    result.current(createKeyboardEvent('l'));
    expect(onSeekForward).toHaveBeenCalled();
  });

  it('calls onSeekBackward for ArrowLeft', () => {
    const onSeekBackward = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSeekBackward })
    );

    result.current(createKeyboardEvent('ArrowLeft'));
    expect(onSeekBackward).toHaveBeenCalled();
  });

  it('calls onSeekBackward for j key', () => {
    const onSeekBackward = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSeekBackward })
    );

    result.current(createKeyboardEvent('j'));
    expect(onSeekBackward).toHaveBeenCalled();
  });

  it('calls onVolumeUp for ArrowUp', () => {
    const onVolumeUp = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onVolumeUp })
    );

    result.current(createKeyboardEvent('ArrowUp'));
    expect(onVolumeUp).toHaveBeenCalled();
  });

  it('calls onVolumeDown for ArrowDown', () => {
    const onVolumeDown = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onVolumeDown })
    );

    result.current(createKeyboardEvent('ArrowDown'));
    expect(onVolumeDown).toHaveBeenCalled();
  });

  it('calls onToggleMute for m key', () => {
    const onToggleMute = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onToggleMute })
    );

    result.current(createKeyboardEvent('m'));
    expect(onToggleMute).toHaveBeenCalled();
  });

  it('calls onToggleFullscreen for f key', () => {
    const onToggleFullscreen = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onToggleFullscreen })
    );

    result.current(createKeyboardEvent('f'));
    expect(onToggleFullscreen).toHaveBeenCalled();
  });

  it('calls onSeekToPercent for number keys', () => {
    const onSeekToPercent = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSeekToPercent })
    );

    result.current(createKeyboardEvent('5'));
    expect(onSeekToPercent).toHaveBeenCalledWith(50);

    result.current(createKeyboardEvent('0'));
    expect(onSeekToPercent).toHaveBeenCalledWith(0);

    result.current(createKeyboardEvent('9'));
    expect(onSeekToPercent).toHaveBeenCalledWith(90);
  });

  it('calls onSpeedUp for > key', () => {
    const onSpeedUp = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSpeedUp })
    );

    result.current(createKeyboardEvent('>'));
    expect(onSpeedUp).toHaveBeenCalled();
  });

  it('calls onSpeedDown for < key', () => {
    const onSpeedDown = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onSpeedDown })
    );

    result.current(createKeyboardEvent('<'));
    expect(onSpeedDown).toHaveBeenCalled();
  });

  it('calls onHome for Home key', () => {
    const onHome = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onHome })
    );

    result.current(createKeyboardEvent('Home'));
    expect(onHome).toHaveBeenCalled();
  });

  it('calls onEnd for End key', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onEnd })
    );

    result.current(createKeyboardEvent('End'));
    expect(onEnd).toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const onTogglePlay = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onTogglePlay, enabled: false })
    );

    const event = createKeyboardEvent(' ');
    result.current(event);

    expect(onTogglePlay).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('ignores events from input elements', () => {
    const onTogglePlay = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onTogglePlay })
    );

    const input = document.createElement('input');
    const event = createKeyboardEvent(' ', input);
    result.current(event);

    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it('ignores events from textarea elements', () => {
    const onTogglePlay = vi.fn();
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({ onTogglePlay })
    );

    const textarea = document.createElement('textarea');
    const event = createKeyboardEvent(' ', textarea);
    result.current(event);

    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it('does not prevent default for unhandled keys', () => {
    const { result } = renderHook(() =>
      usePlayerKeyboardShortcuts({})
    );

    const event = createKeyboardEvent('x');
    result.current(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
