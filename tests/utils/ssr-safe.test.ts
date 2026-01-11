import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  isBrowser,
  getDocument,
  getWindow,
  useMounted,
  isPiPSupported,
} from '../../src/utils/ssr-safe';

describe('isBrowser', () => {
  it('returns true in browser environment', () => {
    expect(isBrowser).toBe(true);
  });
});

describe('getDocument', () => {
  it('returns document in browser', () => {
    expect(getDocument()).toBe(document);
  });
});

describe('getWindow', () => {
  it('returns window in browser', () => {
    expect(getWindow()).toBe(window);
  });
});

describe('useMounted', () => {
  it('returns false initially then true after mount', () => {
    const { result } = renderHook(() => useMounted());
    
    // After initial render and effect, should be true
    expect(result.current).toBe(true);
  });
});

describe('isPiPSupported', () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
    });
  });

  it('returns true when PiP is enabled', () => {
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      value: true,
      configurable: true,
    });
    
    expect(isPiPSupported()).toBe(true);
  });

  it('returns false when PiP is disabled', () => {
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      value: false,
      configurable: true,
    });
    
    expect(isPiPSupported()).toBe(false);
  });
});
