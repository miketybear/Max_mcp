/**
 * Cache Manager
 * Implements caching layer using node-cache
 */

import NodeCache from 'node-cache';
import { createLogger } from '../utils/logger';
import { CacheConfig, CacheStats } from './types';

const logger = createLogger('CacheManager');

/**
 * Cache Manager class
 * Provides caching functionality with TTL support
 */
export class CacheManager {
  private cache: NodeCache;
  private config: Required<Omit<CacheConfig, 'key'>>;
  private stats: {
    hits: number;
    misses: number;
  };

  /**
   * Create a new Cache Manager
   * @param config - Cache configuration
   */
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      ttl: config?.ttl || 300, // 5 minutes default
      maxSize: config?.maxSize || 1000,
    };

    this.cache = new NodeCache({
      stdTTL: this.config.ttl,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Don't clone objects for better performance
      maxKeys: this.config.maxSize,
    });

    this.stats = {
      hits: 0,
      misses: 0,
    };

    logger.info('CacheManager initialized', {
      enabled: this.config.enabled,
      ttl: this.config.ttl,
      maxSize: this.config.maxSize,
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  public get<T>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const value = this.cache.get<T>(key);

    if (value !== undefined) {
      this.stats.hits++;
      logger.debug('Cache hit', { key });
      return value;
    }

    this.stats.misses++;
    logger.debug('Cache miss', { key });
    return undefined;
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL in seconds (overrides default)
   * @returns True if successful
   */
  public set<T>(key: string, value: T, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const effectiveTTL = ttl !== undefined ? ttl : this.config.ttl;

    try {
      const success = this.cache.set(key, value, effectiveTTL);

      if (success) {
        logger.debug('Cache set', { key, ttl: effectiveTTL });
      } else {
        logger.warn('Cache set failed', { key });
      }

      return success;
    } catch (error) {
      logger.error('Error setting cache', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param key - Cache key
   * @returns Number of deleted entries
   */
  public delete(key: string): number {
    if (!this.config.enabled) {
      return 0;
    }

    const deleted = this.cache.del(key);
    logger.debug('Cache delete', { key, deleted });
    return deleted;
  }

  /**
   * Clear all cached values
   */
  public clear(): void {
    this.cache.flushAll();
    this.stats.hits = 0;
    this.stats.misses = 0;
    logger.info('Cache cleared');
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   * @returns True if key exists
   */
  public has(key: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  public getStats(): CacheStats {
    const keys = this.cache.keys();
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: keys.length,
      hitRate,
    };
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  public getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get TTL for a key
   * @param key - Cache key
   * @returns TTL in seconds, or undefined if key doesn't exist
   */
  public getTTL(key: string): number | undefined {
    const ttl = this.cache.getTtl(key);
    if (ttl === undefined) {
      return undefined;
    }

    // Convert from timestamp to seconds remaining
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((ttl - now) / 1000));
    return remaining;
  }

  /**
   * Update TTL for a key
   * @param key - Cache key
   * @param ttl - New TTL in seconds
   * @returns True if successful
   */
  public updateTTL(key: string, ttl: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return this.cache.ttl(key, ttl);
  }

  /**
   * Get multiple values from cache
   * @param keys - Array of cache keys
   * @returns Object with key-value pairs
   */
  public getMultiple<T>(keys: string[]): Record<string, T> {
    if (!this.config.enabled) {
      return {};
    }

    const result: Record<string, T> = {};

    for (const key of keys) {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Set multiple values in cache
   * @param entries - Array of key-value pairs with optional TTL
   * @returns True if all successful
   */
  public setMultiple<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>
  ): boolean {
    if (!this.config.enabled) {
      return false;
    }

    let allSuccessful = true;

    for (const entry of entries) {
      const success = this.set(entry.key, entry.value, entry.ttl);
      if (!success) {
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }

  /**
   * Delete multiple values from cache
   * @param keys - Array of cache keys
   * @returns Number of deleted entries
   */
  public deleteMultiple(keys: string[]): number {
    if (!this.config.enabled) {
      return 0;
    }

    return this.cache.del(keys);
  }

  /**
   * Generate a cache key from URL and parameters
   * @param url - Request URL
   * @param params - Request parameters
   * @returns Cache key
   */
  public generateKey(url: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');

    return `${url}?${sortedParams}`;
  }

  /**
   * Enable caching
   */
  public enable(): void {
    this.config.enabled = true;
    logger.info('Cache enabled');
  }

  /**
   * Disable caching
   */
  public disable(): void {
    this.config.enabled = false;
    logger.info('Cache disabled');
  }

  /**
   * Check if caching is enabled
   * @returns True if enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get cache configuration
   * @returns Cache configuration
   */
  public getConfig(): Required<Omit<CacheConfig, 'key'>> {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<CacheConfig>): void {
    if (config.enabled !== undefined) {
      this.config.enabled = config.enabled;
    }
    if (config.ttl !== undefined) {
      this.config.ttl = config.ttl;
    }
    if (config.maxSize !== undefined) {
      this.config.maxSize = config.maxSize;
    }

    logger.info('Cache configuration updated', this.config);
  }

  /**
   * Set up event listeners for cache events
   */
  private setupEventListeners(): void {
    // Listen for expired keys
    this.cache.on('expired', (key: string, _value: unknown) => {
      logger.debug('Cache key expired', { key });
    });

    // Listen for deleted keys
    this.cache.on('del', (key: string, _value: unknown) => {
      logger.debug('Cache key deleted', { key });
    });

    // Listen for flush events
    this.cache.on('flush', () => {
      logger.debug('Cache flushed');
    });
  }

  /**
   * Close the cache manager and clean up resources
   */
  public close(): void {
    this.cache.close();
    logger.info('CacheManager closed');
  }
}

/**
 * Default cache manager instance
 */
export const cacheManager = new CacheManager();