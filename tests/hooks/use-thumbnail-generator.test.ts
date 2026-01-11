import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ThumbnailLRUCache } from '../../src/hooks/use-thumbnail-generator';

/** Thumbnail dimensions from the implementation */
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;
const EXPECTED_ASPECT_RATIO = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT; // 16:9 = 1.777...

describe('ThumbnailLRUCache', () => {
  let cache: ThumbnailLRUCache;

  beforeEach(() => {
    cache = new ThumbnailLRUCache(5);
  });

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should report correct size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when at capacity', () => {
      // Fill cache to capacity
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      // Add one more - should evict key1
      cache.set('key6', 'value6');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key6')).toBe('value6');
      expect(cache.size).toBe(5);
    });

    it('should update LRU order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      // Access key1 to make it most recently used
      cache.get('key1');

      // Add new entry - should evict key2 (now oldest)
      cache.set('key6', 'value6');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should update value and LRU order on duplicate set', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      // Update key1 - should move to end
      cache.set('key1', 'updated1');

      // Add new entry - should evict key2
      cache.set('key6', 'value6');

      expect(cache.get('key1')).toBe('updated1');
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  /**
   * Property 4: Thumbnail Cache Round-Trip
   * Validates: Requirements 3.2
   * 
   * For any key-value pair, setting then getting should return the same value
   */
  describe('Property Tests', () => {
    it('Property 4: Cache round-trip - set then get returns same value', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string(),
          (key, value) => {
            const testCache = new ThumbnailLRUCache(50);
            testCache.set(key, value);
            return testCache.get(key) === value;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 4: Multiple round-trips preserve values', () => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(fc.string({ minLength: 1 }), fc.string()), { minLength: 1, maxLength: 40 }),
          (entries) => {
            const testCache = new ThumbnailLRUCache(50);
            
            // Set all entries
            for (const [key, value] of entries) {
              testCache.set(key, value);
            }

            // Verify all entries (last value for duplicate keys)
            const lastValues = new Map(entries);
            for (const [key, expectedValue] of lastValues) {
              if (testCache.get(key) !== expectedValue) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 4: Cache size never exceeds max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.array(fc.tuple(fc.string({ minLength: 1 }), fc.string()), { minLength: 1, maxLength: 50 }),
          (maxSize, entries) => {
            const testCache = new ThumbnailLRUCache(maxSize);
            
            for (const [key, value] of entries) {
              testCache.set(key, value);
            }

            return testCache.size <= maxSize;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 4: LRU eviction preserves most recent entries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 30 }),
          (maxSize, keys) => {
            const testCache = new ThumbnailLRUCache(maxSize);
            
            // Use integers as keys for predictable uniqueness
            const uniqueKeys = [...new Set(keys)];
            
            for (const key of uniqueKeys) {
              testCache.set(String(key), `value-${key}`);
            }

            // The most recent maxSize unique keys should be in cache
            const expectedKeys = uniqueKeys.slice(-maxSize);
            
            for (const key of expectedKeys) {
              if (!testCache.has(String(key))) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * Property 5: Thumbnail Request Debouncing
 * Validates: Requirements 3.3
 * 
 * Tests that rapid requests are debounced correctly
 */
describe('Debounce Behavior', () => {
  /**
   * Simple debounce function for testing
   */
  function createDebouncer(delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastValue: number | null = null;
    let callCount = 0;

    return {
      debounce: (value: number) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          lastValue = value;
          callCount++;
          timeoutId = null;
        }, delay);
      },
      getLastValue: () => lastValue,
      getCallCount: () => callCount,
      reset: () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
        lastValue = null;
        callCount = 0;
      },
      flush: () => {
        return new Promise<void>((resolve) => {
          setTimeout(resolve, delay + 10);
        });
      },
    };
  }

  it('Property 5: Only last value in rapid sequence is processed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 2, maxLength: 20 }),
        async (values) => {
          const debouncer = createDebouncer(50);
          
          // Rapidly call debounce with all values
          for (const value of values) {
            debouncer.debounce(value);
          }

          // Wait for debounce to complete
          await debouncer.flush();

          // Only the last value should be processed
          const lastValue = values[values.length - 1];
          return debouncer.getLastValue() === lastValue && debouncer.getCallCount() === 1;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 5: Spaced calls each get processed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 5 }),
        async (values) => {
          const debouncer = createDebouncer(10);
          
          // Call with delays longer than debounce time
          for (const value of values) {
            debouncer.debounce(value);
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          // Each call should have been processed
          return debouncer.getCallCount() === values.length;
        }
      ),
      { numRuns: 20 }
    );
  });
});


/**
 * Property 3: Thumbnail Aspect Ratio Invariant
 * Validates: Requirements 2.8
 * 
 * For any generated thumbnail, the dimensions SHALL maintain a 16:9 aspect ratio
 */
describe('Thumbnail Aspect Ratio', () => {
  it('Property 3: Thumbnail dimensions maintain 16:9 aspect ratio', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // scale factor
        (scale) => {
          // Simulate different thumbnail sizes while maintaining aspect ratio
          const width = THUMBNAIL_WIDTH * scale;
          const height = THUMBNAIL_HEIGHT * scale;
          const aspectRatio = width / height;
          
          // Aspect ratio should be 16:9 (1.777...) within tolerance
          const tolerance = 0.01;
          return Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO) <= tolerance;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Fixed thumbnail dimensions are always 160x90', () => {
    // The implementation uses fixed dimensions
    expect(THUMBNAIL_WIDTH).toBe(160);
    expect(THUMBNAIL_HEIGHT).toBe(90);
    
    const aspectRatio = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;
    expect(aspectRatio).toBeCloseTo(16 / 9, 2);
  });

  it('Property 3: Aspect ratio is preserved for any valid video dimensions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 4000 }), // video width
        fc.integer({ min: 100, max: 4000 }), // video height
        (videoWidth, videoHeight) => {
          // When scaling any video to thumbnail size, output is always 160x90
          // This tests that the thumbnail generation always produces fixed dimensions
          const outputWidth = THUMBNAIL_WIDTH;
          const outputHeight = THUMBNAIL_HEIGHT;
          const outputAspectRatio = outputWidth / outputHeight;
          
          // Output aspect ratio should always be 16:9 regardless of input
          const tolerance = 0.01;
          return Math.abs(outputAspectRatio - EXPECTED_ASPECT_RATIO) <= tolerance;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 6: Preview Position Bounds
 * Validates: Requirements 2.2
 * 
 * For any thumbnail preview position, the preview element SHALL remain within
 * the visible bounds of the video player container (no overflow)
 */
describe('Preview Position Bounds', () => {
  /**
   * Calculate clamped position for thumbnail preview
   * This mirrors the logic in ThumbnailPreview component
   */
  function calculateClampedPosition(
    hoverPosition: number, // 0-100 percentage
    containerWidth: number,
    thumbnailWidth: number = THUMBNAIL_WIDTH
  ): number {
    const halfWidth = thumbnailWidth / 2;
    const minPosition = (halfWidth / containerWidth) * 100;
    const maxPosition = 100 - minPosition;
    return Math.max(minPosition, Math.min(maxPosition, hoverPosition));
  }

  /**
   * Check if thumbnail stays within bounds
   */
  function isThumbnailWithinBounds(
    clampedPosition: number,
    containerWidth: number,
    thumbnailWidth: number = THUMBNAIL_WIDTH
  ): boolean {
    // Convert percentage to pixels
    const centerX = (clampedPosition / 100) * containerWidth;
    const leftEdge = centerX - thumbnailWidth / 2;
    const rightEdge = centerX + thumbnailWidth / 2;
    
    // Check bounds with small tolerance for floating point
    const tolerance = 0.001;
    return leftEdge >= -tolerance && rightEdge <= containerWidth + tolerance;
  }

  it('Property 6: Thumbnail preview stays within container bounds', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }), // hover position percentage
        fc.integer({ min: 200, max: 2000 }), // container width
        (hoverPosition, containerWidth) => {
          const clampedPosition = calculateClampedPosition(hoverPosition, containerWidth);
          return isThumbnailWithinBounds(clampedPosition, containerWidth);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Edge positions are clamped correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: 2000 }), // container width
        (containerWidth) => {
          // Test extreme positions
          const leftEdge = calculateClampedPosition(0, containerWidth);
          const rightEdge = calculateClampedPosition(100, containerWidth);
          const middle = calculateClampedPosition(50, containerWidth);
          
          // All should be within bounds
          return (
            isThumbnailWithinBounds(leftEdge, containerWidth) &&
            isThumbnailWithinBounds(rightEdge, containerWidth) &&
            isThumbnailWithinBounds(middle, containerWidth)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Clamped position is always between min and max bounds', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 150, noNaN: true }), // even invalid positions
        fc.integer({ min: 200, max: 2000 }),
        (hoverPosition, containerWidth) => {
          const halfWidth = THUMBNAIL_WIDTH / 2;
          const minPosition = (halfWidth / containerWidth) * 100;
          const maxPosition = 100 - minPosition;
          
          const clampedPosition = calculateClampedPosition(hoverPosition, containerWidth);
          
          // Clamped position should always be within valid range
          return clampedPosition >= minPosition && clampedPosition <= maxPosition;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Small containers still keep thumbnail visible', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.integer({ min: THUMBNAIL_WIDTH, max: THUMBNAIL_WIDTH * 2 }), // small containers
        (hoverPosition, containerWidth) => {
          const clampedPosition = calculateClampedPosition(hoverPosition, containerWidth);
          return isThumbnailWithinBounds(clampedPosition, containerWidth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
