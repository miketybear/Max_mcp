/**
 * Unit tests for Cache Manager
 */

import { CacheManager } from '../../../src/core/cache-manager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({ enabled: true, ttl: 60, maxSize: 100 });
  });

  afterEach(() => {
    cacheManager.clear();
    cacheManager.close();
  });

  describe('constructor', () => {
    it('should create cache manager with default config', () => {
      const manager = new CacheManager();
      expect(manager).toBeInstanceOf(CacheManager);
      expect(manager.isEnabled()).toBe(true);
    });

    it('should create cache manager with custom config', () => {
      const manager = new CacheManager({ enabled: false, ttl: 120, maxSize: 500 });
      expect(manager.isEnabled()).toBe(false);
      const config = manager.getConfig();
      expect(config.ttl).toBe(120);
      expect(config.maxSize).toBe(500);
    });
  });

  describe('get and set', () => {
    it('should store and retrieve value', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      cacheManager.set(key, value);
      const retrieved = cacheManager.get(key);
      
      expect(retrieved).toEqual(value);
    });

    it('should return undefined for non-existent key', () => {
      const retrieved = cacheManager.get('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should return undefined when cache is disabled', () => {
      cacheManager.disable();
      cacheManager.set('key', 'value');
      const retrieved = cacheManager.get('key');
      expect(retrieved).toBeUndefined();
    });

    it('should handle different data types', () => {
      cacheManager.set('string', 'value');
      cacheManager.set('number', 123);
      cacheManager.set('boolean', true);
      cacheManager.set('object', { a: 1 });
      cacheManager.set('array', [1, 2, 3]);
      
      expect(cacheManager.get('string')).toBe('value');
      expect(cacheManager.get('number')).toBe(123);
      expect(cacheManager.get('boolean')).toBe(true);
      expect(cacheManager.get('object')).toEqual({ a: 1 });
      expect(cacheManager.get('array')).toEqual([1, 2, 3]);
    });

    it('should respect custom TTL', () => {
      cacheManager.set('key', 'value', 1); // 1 second TTL
      expect(cacheManager.get('key')).toBe('value');
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cacheManager.set('key', 'value');
      const deleted = cacheManager.delete('key');
      
      expect(deleted).toBe(1);
      expect(cacheManager.get('key')).toBeUndefined();
    });

    it('should return 0 for non-existent key', () => {
      const deleted = cacheManager.delete('non-existent');
      expect(deleted).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all cached values', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');
      
      cacheManager.clear();
      
      expect(cacheManager.get('key1')).toBeUndefined();
      expect(cacheManager.get('key2')).toBeUndefined();
      expect(cacheManager.get('key3')).toBeUndefined();
    });

    it('should reset statistics', () => {
      cacheManager.set('key', 'value');
      cacheManager.get('key'); // hit
      cacheManager.get('missing'); // miss
      
      cacheManager.clear();
      const stats = cacheManager.getStats();
      
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cacheManager.set('key', 'value');
      expect(cacheManager.has('key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cacheManager.has('non-existent')).toBe(false);
    });

    it('should return false when cache is disabled', () => {
      cacheManager.set('key', 'value');
      cacheManager.disable();
      expect(cacheManager.has('key')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should track cache hits', () => {
      cacheManager.set('key', 'value');
      cacheManager.get('key');
      cacheManager.get('key');
      
      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(2);
    });

    it('should track cache misses', () => {
      cacheManager.get('missing1');
      cacheManager.get('missing2');
      
      const stats = cacheManager.getStats();
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate', () => {
      cacheManager.set('key', 'value');
      cacheManager.get('key'); // hit
      cacheManager.get('missing'); // miss
      
      const stats = cacheManager.getStats();
      expect(stats.hitRate).toBe(0.5);
    });

    it('should return 0 hit rate when no requests', () => {
      const stats = cacheManager.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('getKeys', () => {
    it('should return all cache keys', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');
      
      const keys = cacheManager.getKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array when cache is empty', () => {
      const keys = cacheManager.getKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('getTTL', () => {
    it('should return TTL for existing key', () => {
      cacheManager.set('key', 'value', 60);
      const ttl = cacheManager.getTTL('key');
      
      expect(ttl).toBeDefined();
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    it('should return undefined for non-existent key', () => {
      const ttl = cacheManager.getTTL('non-existent');
      expect(ttl).toBeUndefined();
    });
  });

  describe('updateTTL', () => {
    it('should update TTL for existing key', () => {
      cacheManager.set('key', 'value', 60);
      const updated = cacheManager.updateTTL('key', 120);
      
      expect(updated).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const updated = cacheManager.updateTTL('non-existent', 60);
      expect(updated).toBe(false);
    });
  });

  describe('getMultiple', () => {
    it('should get multiple values', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');
      
      const values = cacheManager.getMultiple(['key1', 'key2', 'key3']);
      
      expect(values).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });

    it('should skip non-existent keys', () => {
      cacheManager.set('key1', 'value1');
      
      const values = cacheManager.getMultiple(['key1', 'missing']);
      
      expect(values).toEqual({ key1: 'value1' });
    });
  });

  describe('setMultiple', () => {
    it('should set multiple values', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];
      
      const result = cacheManager.setMultiple(entries);
      
      expect(result).toBe(true);
      expect(cacheManager.get('key1')).toBe('value1');
      expect(cacheManager.get('key2')).toBe('value2');
      expect(cacheManager.get('key3')).toBe('value3');
    });

    it('should set multiple values with custom TTL', () => {
      const entries = [
        { key: 'key1', value: 'value1', ttl: 30 },
        { key: 'key2', value: 'value2', ttl: 60 },
      ];
      
      cacheManager.setMultiple(entries);
      
      expect(cacheManager.get('key1')).toBe('value1');
      expect(cacheManager.get('key2')).toBe('value2');
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple keys', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');
      
      const deleted = cacheManager.deleteMultiple(['key1', 'key2']);
      
      expect(deleted).toBe(2);
      expect(cacheManager.get('key1')).toBeUndefined();
      expect(cacheManager.get('key2')).toBeUndefined();
      expect(cacheManager.get('key3')).toBe('value3');
    });
  });

  describe('generateKey', () => {
    it('should generate key from URL only', () => {
      const key = cacheManager.generateKey('/api/workorders');
      expect(key).toBe('/api/workorders');
    });

    it('should generate key from URL and params', () => {
      const key = cacheManager.generateKey('/api/workorders', { status: 'WAPPR', siteid: 'BEDFORD' });
      expect(key).toContain('/api/workorders?');
      expect(key).toContain('siteid');
      expect(key).toContain('status');
    });

    it('should generate consistent keys for same params', () => {
      const key1 = cacheManager.generateKey('/api/workorders', { a: 1, b: 2 });
      const key2 = cacheManager.generateKey('/api/workorders', { b: 2, a: 1 });
      expect(key1).toBe(key2);
    });
  });

  describe('enable and disable', () => {
    it('should enable caching', () => {
      cacheManager.disable();
      cacheManager.enable();
      expect(cacheManager.isEnabled()).toBe(true);
    });

    it('should disable caching', () => {
      cacheManager.disable();
      expect(cacheManager.isEnabled()).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      cacheManager.updateConfig({ ttl: 300, maxSize: 2000 });
      const config = cacheManager.getConfig();
      
      expect(config.ttl).toBe(300);
      expect(config.maxSize).toBe(2000);
    });
  });
});