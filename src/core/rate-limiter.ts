/**
 * Rate Limiter
 * Implements rate limiting using sliding window algorithm
 */

import { createLogger } from '../utils/logger';
import { RateLimitConfig, RateLimitState, RateLimitError } from './types';

const logger = createLogger('RateLimiter');

/**
 * Request record for tracking
 */
interface RequestRecord {
  timestamp: number;
  key: string;
}

/**
 * Rate Limiter class
 * Implements sliding window rate limiting
 */
export class RateLimiter {
  private requests: Map<string, RequestRecord[]>;
  private config: Required<RateLimitConfig>;
  private cleanupInterval?: ReturnType<typeof setInterval>;

  /**
   * Create a new Rate Limiter
   * @param config - Rate limiting configuration
   */
  constructor(config?: Partial<RateLimitConfig>) {
    this.requests = new Map();
    this.config = {
      maxRequests: config?.maxRequests || 100,
      windowMs: config?.windowMs || 60000, // 1 minute default
      endpointLimits: config?.endpointLimits || {},
    };

    logger.info('RateLimiter initialized', {
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
      endpointLimitsCount: Object.keys(this.config.endpointLimits).length,
    });

    // Clean up old requests periodically
    this.startCleanupInterval();
  }

  /**
   * Check if a request is within rate limit
   * @param key - Rate limit key (e.g., endpoint or user ID)
   * @returns True if within limit, throws RateLimitError if exceeded
   */
  public checkLimit(key: string): boolean {
    const limit = this.getLimit(key);
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Get requests for this key
    const keyRequests = this.requests.get(key) || [];

    // Filter to only requests within the current window
    const recentRequests = keyRequests.filter(
      (req) => req.timestamp > windowStart
    );

    // Check if limit exceeded
    if (recentRequests.length >= limit.maxRequests) {
      const oldestRequest = recentRequests[0];
      if (!oldestRequest) {
        throw new RateLimitError('Rate limit exceeded');
      }
      const resetTime = oldestRequest.timestamp + limit.windowMs - now;
      const retryAfter = Math.ceil(resetTime / 1000);

      logger.warn('Rate limit exceeded', {
        key,
        requestCount: recentRequests.length,
        maxRequests: limit.maxRequests,
        retryAfter,
      });

      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${limit.maxRequests} requests per ${limit.windowMs / 1000} seconds.`,
        retryAfter,
        undefined,
        {
          key,
          requestCount: recentRequests.length,
          maxRequests: limit.maxRequests,
          windowMs: limit.windowMs,
        }
      );
    }

    logger.debug('Rate limit check passed', {
      key,
      requestCount: recentRequests.length,
      maxRequests: limit.maxRequests,
      remaining: limit.maxRequests - recentRequests.length,
    });

    return true;
  }

  /**
   * Record a request
   * @param key - Rate limit key
   */
  public recordRequest(key: string): void {
    const now = Date.now();
    const limit = this.getLimit(key);
    const windowStart = now - limit.windowMs;

    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];

    // Filter to only requests within the current window
    keyRequests = keyRequests.filter((req) => req.timestamp > windowStart);

    // Add new request
    keyRequests.push({
      timestamp: now,
      key,
    });

    // Update map
    this.requests.set(key, keyRequests);

    logger.debug('Request recorded', {
      key,
      requestCount: keyRequests.length,
      maxRequests: limit.maxRequests,
    });
  }

  /**
   * Get remaining requests in the current window
   * @param key - Rate limit key
   * @returns Number of remaining requests
   */
  public getRemainingRequests(key: string): number {
    const limit = this.getLimit(key);
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Get requests for this key
    const keyRequests = this.requests.get(key) || [];

    // Filter to only requests within the current window
    const recentRequests = keyRequests.filter(
      (req) => req.timestamp > windowStart
    );

    return Math.max(0, limit.maxRequests - recentRequests.length);
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   * @param key - Rate limit key
   * @returns Milliseconds until reset, or 0 if not limited
   */
  public getResetTime(key: string): number {
    const limit = this.getLimit(key);
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Get requests for this key
    const keyRequests = this.requests.get(key) || [];

    // Filter to only requests within the current window
    const recentRequests = keyRequests.filter(
      (req) => req.timestamp > windowStart
    );

    // If not at limit, no reset needed
    if (recentRequests.length < limit.maxRequests) {
      return 0;
    }

    // Calculate time until oldest request expires
    const oldestRequest = recentRequests[0];
    if (!oldestRequest) {
      return 0;
    }
    return Math.max(0, oldestRequest.timestamp + limit.windowMs - now);
  }

  /**
   * Get rate limit state for a key
   * @param key - Rate limit key
   * @returns Rate limit state
   */
  public getState(key: string): RateLimitState {
    const limit = this.getLimit(key);
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Get requests for this key
    const keyRequests = this.requests.get(key) || [];

    // Filter to only requests within the current window
    const recentRequests = keyRequests.filter(
      (req) => req.timestamp > windowStart
    );

    const requestCount = recentRequests.length;
    const remaining = Math.max(0, limit.maxRequests - requestCount);
    const resetTime = this.getResetTime(key);

    return {
      requestCount,
      windowStart,
      remaining,
      resetTime,
    };
  }

  /**
   * Clear all rate limit tracking
   */
  public clearLimits(): void {
    logger.info('Clearing all rate limits');
    this.requests.clear();
  }

  /**
   * Clear rate limit for a specific key
   * @param key - Rate limit key to clear
   */
  public clearLimit(key: string): void {
    logger.debug('Clearing rate limit for key', { key });
    this.requests.delete(key);
  }

  /**
   * Get limit configuration for a key
   * @param key - Rate limit key
   * @returns Limit configuration
   */
  private getLimit(key: string): { maxRequests: number; windowMs: number } {
    // Check for endpoint-specific limit
    const endpointLimit = this.config.endpointLimits[key];
    if (endpointLimit) {
      return endpointLimit;
    }

    // Return global limit
    return {
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
    };
  }

  /**
   * Start periodic cleanup of old requests
   */
  private startCleanupInterval(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval && typeof this.cleanupInterval === 'object' && 'unref' in this.cleanupInterval) {
      this.cleanupInterval.unref();
    }
  }
  
  /**
   * Stop the cleanup interval
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Clean up old requests outside the window
   */
  private cleanup(): void {
    const now = Date.now();
    let totalRemoved = 0;

    for (const [key, keyRequests] of this.requests.entries()) {
      const limit = this.getLimit(key);
      const windowStart = now - limit.windowMs;

      // Filter to only requests within the current window
      const recentRequests = keyRequests.filter(
        (req) => req.timestamp > windowStart
      );

      const removed = keyRequests.length - recentRequests.length;
      totalRemoved += removed;

      if (recentRequests.length === 0) {
        // Remove key if no recent requests
        this.requests.delete(key);
      } else if (removed > 0) {
        // Update with filtered requests
        this.requests.set(key, recentRequests);
      }
    }

    if (totalRemoved > 0) {
      logger.debug('Cleaned up old requests', {
        removed: totalRemoved,
        remainingKeys: this.requests.size,
      });
    }
  }

  /**
   * Get statistics about rate limiting
   * @returns Statistics object
   */
  public getStats(): {
    totalKeys: number;
    totalRequests: number;
    keyStats: Record<string, { requests: number; remaining: number }>;
  } {
    const keyStats: Record<string, { requests: number; remaining: number }> = {};
    let totalRequests = 0;

    for (const [key, keyRequests] of this.requests.entries()) {
      const limit = this.getLimit(key);
      const now = Date.now();
      const windowStart = now - limit.windowMs;

      const recentRequests = keyRequests.filter(
        (req) => req.timestamp > windowStart
      );

      const requestCount = recentRequests.length;
      totalRequests += requestCount;

      keyStats[key] = {
        requests: requestCount,
        remaining: Math.max(0, limit.maxRequests - requestCount),
      };
    }

    return {
      totalKeys: this.requests.size,
      totalRequests,
      keyStats,
    };
  }
}

/**
 * Default rate limiter instance
 */
export const rateLimiter = new RateLimiter();