/**
 * Unit tests for Rate Limiter
 */

import { RateLimiter } from '../../../src/core/rate-limiter';
import { RateLimitError } from '../../../src/core/types';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000, // 1 second for faster tests
    });
  });

  afterEach(() => {
    rateLimiter.stopCleanup();
  });

  describe('constructor', () => {
    it('should create rate limiter with default config', () => {
      const limiter = new RateLimiter();
      expect(limiter).toBeInstanceOf(RateLimiter);
      limiter.stopCleanup();
    });

    it('should create rate limiter with custom config', () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 5000,
      });
      expect(limiter).toBeInstanceOf(RateLimiter);
      limiter.stopCleanup();
    });

    it('should accept endpoint-specific limits', () => {
      const limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 60000,
        endpointLimits: {
          '/api/workorders': { maxRequests: 10, windowMs: 1000 },
        },
      });
      expect(limiter).toBeInstanceOf(RateLimiter);
      limiter.stopCleanup();
    });
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        expect(() => rateLimiter.checkLimit(key)).not.toThrow();
        rateLimiter.recordRequest(key);
      }
    });

    it('should throw RateLimitError when limit exceeded', () => {
      const key = 'test-key';

      // Record max requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      // Next check should throw
      expect(() => rateLimiter.checkLimit(key)).toThrow(RateLimitError);
    });

    it('should include retry-after in error', () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      try {
        rateLimiter.checkLimit(key);
        fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBeGreaterThan(0);
      }
    });

    it('should allow requests after window expires', async () => {
      const key = 'test-key';

      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      // Should be rate limited
      expect(() => rateLimiter.checkLimit(key)).toThrow(RateLimitError);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be allowed again
      expect(() => rateLimiter.checkLimit(key)).not.toThrow();
    });

    it('should track different keys independently', () => {
      const key1 = 'key-1';
      const key2 = 'key-2';

      // Fill up key1
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key1);
      }

      // key1 should be limited
      expect(() => rateLimiter.checkLimit(key1)).toThrow(RateLimitError);

      // key2 should still be allowed
      expect(() => rateLimiter.checkLimit(key2)).not.toThrow();
    });
  });

  describe('recordRequest', () => {
    it('should record a request', () => {
      const key = 'test-key';

      rateLimiter.recordRequest(key);
      const state = rateLimiter.getState(key);

      expect(state.requestCount).toBe(1);
      expect(state.remaining).toBe(4);
    });

    it('should increment request count', () => {
      const key = 'test-key';

      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      const state = rateLimiter.getState(key);
      expect(state.requestCount).toBe(3);
      expect(state.remaining).toBe(2);
    });

    it('should only count requests within window', async () => {
      const key = 'test-key';

      // Record 3 requests
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Record 2 more requests
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      const state = rateLimiter.getState(key);
      // Should only count the 2 recent requests
      expect(state.requestCount).toBe(2);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max requests initially', () => {
      const key = 'test-key';
      expect(rateLimiter.getRemainingRequests(key)).toBe(5);
    });

    it('should decrease as requests are recorded', () => {
      const key = 'test-key';

      rateLimiter.recordRequest(key);
      expect(rateLimiter.getRemainingRequests(key)).toBe(4);

      rateLimiter.recordRequest(key);
      expect(rateLimiter.getRemainingRequests(key)).toBe(3);
    });

    it('should return 0 when limit reached', () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      expect(rateLimiter.getRemainingRequests(key)).toBe(0);
    });

    it('should never return negative values', () => {
      const key = 'test-key';

      for (let i = 0; i < 10; i++) {
        rateLimiter.recordRequest(key);
      }

      expect(rateLimiter.getRemainingRequests(key)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getResetTime', () => {
    it('should return 0 when not at limit', () => {
      const key = 'test-key';
      rateLimiter.recordRequest(key);

      expect(rateLimiter.getResetTime(key)).toBe(0);
    });

    it('should return time until reset when at limit', () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      const resetTime = rateLimiter.getResetTime(key);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(1000);
    });

    it('should decrease over time', async () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      const resetTime1 = rateLimiter.getResetTime(key);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const resetTime2 = rateLimiter.getResetTime(key);

      expect(resetTime2).toBeLessThan(resetTime1);
    });
  });

  describe('getState', () => {
    it('should return complete state', () => {
      const key = 'test-key';
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      const state = rateLimiter.getState(key);

      expect(state.requestCount).toBe(2);
      expect(state.remaining).toBe(3);
      expect(state.windowStart).toBeGreaterThan(0);
      expect(state.resetTime).toBe(0);
    });

    it('should show reset time when at limit', () => {
      const key = 'test-key';

      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest(key);
      }

      const state = rateLimiter.getState(key);

      expect(state.requestCount).toBe(5);
      expect(state.remaining).toBe(0);
      expect(state.resetTime).toBeGreaterThan(0);
    });
  });

  describe('clearLimits', () => {
    it('should clear all rate limits', () => {
      const key1 = 'key-1';
      const key2 = 'key-2';

      rateLimiter.recordRequest(key1);
      rateLimiter.recordRequest(key2);

      rateLimiter.clearLimits();

      expect(rateLimiter.getRemainingRequests(key1)).toBe(5);
      expect(rateLimiter.getRemainingRequests(key2)).toBe(5);
    });
  });

  describe('clearLimit', () => {
    it('should clear rate limit for specific key', () => {
      const key1 = 'key-1';
      const key2 = 'key-2';

      rateLimiter.recordRequest(key1);
      rateLimiter.recordRequest(key1);
      rateLimiter.recordRequest(key2);

      rateLimiter.clearLimit(key1);

      expect(rateLimiter.getRemainingRequests(key1)).toBe(5);
      expect(rateLimiter.getRemainingRequests(key2)).toBe(4);
    });
  });

  describe('endpoint-specific limits', () => {
    it('should use endpoint-specific limit when configured', () => {
      const limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 60000,
        endpointLimits: {
          '/api/special': { maxRequests: 2, windowMs: 1000 },
        },
      });

      const key = '/api/special';

      // Should allow 2 requests
      limiter.recordRequest(key);
      limiter.recordRequest(key);

      // Third should be rate limited
      expect(() => limiter.checkLimit(key)).toThrow(RateLimitError);

      limiter.stopCleanup();
    });

    it('should use global limit for non-configured endpoints', () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
        endpointLimits: {
          '/api/special': { maxRequests: 10, windowMs: 1000 },
        },
      });

      const key = '/api/normal';

      // Should use global limit of 3
      limiter.recordRequest(key);
      limiter.recordRequest(key);
      limiter.recordRequest(key);

      expect(() => limiter.checkLimit(key)).toThrow(RateLimitError);

      limiter.stopCleanup();
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      const key1 = 'key-1';
      const key2 = 'key-2';

      rateLimiter.recordRequest(key1);
      rateLimiter.recordRequest(key1);
      rateLimiter.recordRequest(key2);

      const stats = rateLimiter.getStats();

      expect(stats.totalKeys).toBe(2);
      expect(stats.totalRequests).toBe(3);
      expect(stats.keyStats[key1].requests).toBe(2);
      expect(stats.keyStats[key1].remaining).toBe(3);
      expect(stats.keyStats[key2].requests).toBe(1);
      expect(stats.keyStats[key2].remaining).toBe(4);
    });

    it('should return empty stats initially', () => {
      const stats = rateLimiter.getStats();

      expect(stats.totalKeys).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(Object.keys(stats.keyStats)).toHaveLength(0);
    });
  });

  describe('sliding window algorithm', () => {
    it('should implement sliding window correctly', async () => {
      const key = 'test-key';

      // Record 3 requests at time 0
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      // Wait 600ms
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Record 2 more requests (total 5 in window)
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      // Should be at limit
      expect(() => rateLimiter.checkLimit(key)).toThrow(RateLimitError);

      // Wait another 500ms (total 1100ms from start)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // First 3 requests should have expired
      // Should be able to make more requests
      expect(() => rateLimiter.checkLimit(key)).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should clean up old requests periodically', async () => {
      const key = 'test-key';

      // Record some requests
      rateLimiter.recordRequest(key);
      rateLimiter.recordRequest(key);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Trigger cleanup by checking state
      const state = rateLimiter.getState(key);

      // Old requests should be cleaned up
      expect(state.requestCount).toBe(0);
    });
  });

  describe('concurrent requests', () => {
    it('should handle concurrent requests correctly', () => {
      const key = 'test-key';

      // Simulate concurrent requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            try {
              rateLimiter.checkLimit(key);
              rateLimiter.recordRequest(key);
              resolve();
            } catch (error) {
              resolve();
            }
          })
        );
      }

      return Promise.all(promises).then(() => {
        const state = rateLimiter.getState(key);
        // Should have recorded exactly 5 requests (the limit)
        expect(state.requestCount).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('stopCleanup', () => {
    it('should stop the cleanup interval', () => {
      const limiter = new RateLimiter();
      limiter.stopCleanup();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});