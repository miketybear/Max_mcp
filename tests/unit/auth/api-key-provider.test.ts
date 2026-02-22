/**
 * Unit tests for API Key Provider
 */

import { ApiKeyProvider, resetDefaultProvider } from '../../../src/auth/api-key-provider';
import { InvalidCredentialsError, AuthErrorCode } from '../../../src/auth/types';

describe('ApiKeyProvider', () => {
  let provider: ApiKeyProvider;

  beforeEach(() => {
    provider = new ApiKeyProvider();
    // Clear environment variable
    delete process.env.MAXIMO_API_KEY;
  });

  afterEach(() => {
    resetDefaultProvider();
  });

  describe('constructor', () => {
    it('should create provider with default expiry hours', () => {
      const provider = new ApiKeyProvider();
      expect(provider).toBeInstanceOf(ApiKeyProvider);
    });

    it('should create provider with custom expiry hours', () => {
      const provider = new ApiKeyProvider(48);
      expect(provider).toBeInstanceOf(ApiKeyProvider);
    });
  });

  describe('getApiKey', () => {
    it('should return null when no API key is set', () => {
      const key = provider.getApiKey();
      expect(key).toBeNull();
    });

    it('should return API key from environment', () => {
      process.env.MAXIMO_API_KEY = 'test-api-key-from-env';
      const key = provider.getApiKey();
      expect(key).toBe('test-api-key-from-env');
    });

    it('should return stored API key', () => {
      provider.rotateApiKey('stored-api-key-12345678901234567890');
      const key = provider.getApiKey();
      expect(key).toBe('stored-api-key-12345678901234567890');
    });

    it('should prefer stored key over environment', () => {
      process.env.MAXIMO_API_KEY = 'env-key-12345678901234567890';
      provider.rotateApiKey('stored-key-12345678901234567890');
      const key = provider.getApiKey();
      expect(key).toBe('stored-key-12345678901234567890');
    });
  });

  describe('validateApiKey', () => {
    it('should reject empty API key', () => {
      const result = provider.validateApiKey('');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key is empty');
    });

    it('should reject API key with only whitespace', () => {
      const result = provider.validateApiKey('   ');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key is empty');
    });

    it('should reject API key that is too short', () => {
      const result = provider.validateApiKey('short');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key is too short');
    });

    it('should reject API key with leading/trailing whitespace', () => {
      const result = provider.validateApiKey(' valid-api-key-12345678901234567890 ');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key contains leading or trailing whitespace');
    });

    it('should reject API key with invalid characters', () => {
      const result = provider.validateApiKey('invalid@key#with$special%chars!');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key contains invalid characters');
    });

    it('should reject API key that is too long', () => {
      const longKey = 'a'.repeat(501);
      const result = provider.validateApiKey(longKey);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key is unusually long');
    });

    it('should accept valid API key with alphanumeric characters', () => {
      const result = provider.validateApiKey('valid-api-key-ABC123XYZ789');
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should accept valid API key with allowed special characters', () => {
      const result = provider.validateApiKey('valid-api_key+with=special/chars-123');
      expect(result.valid).toBe(true);
    });
  });

  describe('rotateApiKey', () => {
    it('should set new API key', () => {
      provider.rotateApiKey('new-api-key-12345678901234567890');
      const key = provider.getApiKey();
      expect(key).toBe('new-api-key-12345678901234567890');
    });

    it('should throw error for invalid API key', () => {
      expect(() => {
        provider.rotateApiKey('short');
      }).toThrow(InvalidCredentialsError);
    });

    it('should update keySetAt timestamp', () => {
      const before = new Date();
      provider.rotateApiKey('new-api-key-12345678901234567890');
      const info = provider.getKeyInfo();
      const after = new Date();

      expect(info.setAt).not.toBeNull();
      expect(info.setAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(info.setAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should replace existing API key', () => {
      provider.rotateApiKey('first-key-12345678901234567890');
      provider.rotateApiKey('second-key-12345678901234567890');
      const key = provider.getApiKey();
      expect(key).toBe('second-key-12345678901234567890');
    });
  });

  describe('isExpired', () => {
    it('should return true when no key is set', () => {
      expect(provider.isExpired()).toBe(true);
    });

    it('should return false for newly set key', () => {
      provider.rotateApiKey('new-key-12345678901234567890');
      expect(provider.isExpired()).toBe(false);
    });

    it('should return true for expired key', () => {
      const shortExpiryProvider = new ApiKeyProvider(0);
      shortExpiryProvider.rotateApiKey('key-12345678901234567890');
      
      // Wait a bit to ensure expiry
      setTimeout(() => {
        expect(shortExpiryProvider.isExpired()).toBe(true);
      }, 10);
    });
  });

  describe('clearApiKey', () => {
    it('should clear stored API key', () => {
      provider.rotateApiKey('key-to-clear-12345678901234567890');
      provider.clearApiKey();
      expect(provider.getApiKey()).toBeNull();
    });

    it('should clear keySetAt timestamp', () => {
      provider.rotateApiKey('key-12345678901234567890');
      provider.clearApiKey();
      const info = provider.getKeyInfo();
      expect(info.setAt).toBeNull();
    });
  });

  describe('getKeyInfo', () => {
    it('should return info when no key is set', () => {
      const info = provider.getKeyInfo();
      expect(info.hasKey).toBe(false);
      expect(info.setAt).toBeNull();
      expect(info.isExpired).toBe(true);
      expect(info.hoursUntilExpiry).toBeNull();
    });

    it('should return info for valid key', () => {
      provider.rotateApiKey('valid-key-12345678901234567890');
      const info = provider.getKeyInfo();
      expect(info.hasKey).toBe(true);
      expect(info.setAt).not.toBeNull();
      expect(info.isExpired).toBe(false);
      expect(info.hoursUntilExpiry).toBeGreaterThan(0);
    });
  });

  describe('loadFromEnvironment', () => {
    it('should return false when no environment variable', () => {
      const result = provider.loadFromEnvironment();
      expect(result).toBe(false);
    });

    it('should return true and load valid key from environment', () => {
      process.env.MAXIMO_API_KEY = 'env-key-12345678901234567890';
      const result = provider.loadFromEnvironment();
      expect(result).toBe(true);
      expect(provider.getApiKey()).toBe('env-key-12345678901234567890');
    });

    it('should return false for invalid key in environment', () => {
      process.env.MAXIMO_API_KEY = 'short';
      const result = provider.loadFromEnvironment();
      expect(result).toBe(false);
    });
  });

  describe('ensureValidKey', () => {
    it('should throw error when no key is available', () => {
      expect(() => {
        provider.ensureValidKey();
      }).toThrow(InvalidCredentialsError);
    });

    it('should throw error when key is expired', () => {
      const shortExpiryProvider = new ApiKeyProvider(0);
      shortExpiryProvider.rotateApiKey('key-12345678901234567890');
      
      setTimeout(() => {
        expect(() => {
          shortExpiryProvider.ensureValidKey();
        }).toThrow(InvalidCredentialsError);
      }, 10);
    });

    it('should not throw for valid key', () => {
      provider.rotateApiKey('valid-key-12345678901234567890');
      expect(() => {
        provider.ensureValidKey();
      }).not.toThrow();
    });
  });

  describe('getDefaultProvider', () => {
    it('should return singleton instance', () => {
      const { getDefaultProvider } = require('../../../src/auth/api-key-provider');
      const provider1 = getDefaultProvider();
      const provider2 = getDefaultProvider();
      expect(provider1).toBe(provider2);
    });
  });
});