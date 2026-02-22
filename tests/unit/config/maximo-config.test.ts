/**
 * Unit tests for Maximo Configuration
 */

import { MaximoConfiguration } from '../../../src/config/maximo-config';

describe('MaximoConfiguration', () => {
  describe('constructor', () => {
    it('should create configuration with valid settings', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-api-key-12345678901234567890',
      });

      expect(config).toBeInstanceOf(MaximoConfiguration);
    });

    it('should use default values for optional settings', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getTimeout()).toBe(30000);
      expect(config.getMaxRetries()).toBe(3);
      expect(config.shouldValidateSSL()).toBe(true);
    });

    it('should throw error for invalid host', () => {
      expect(() => {
        new MaximoConfiguration({
          host: 'not-a-url',
          apiKey: 'test-key-12345678901234567890',
        });
      }).toThrow(/validation failed/);
    });

    it('should throw error when no authentication provided', () => {
      expect(() => {
        new MaximoConfiguration({
          host: 'https://maximo.example.com',
        });
      }).toThrow(/apiKey or both username and password/);
    });

    it('should accept username/password authentication', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      expect(config).toBeInstanceOf(MaximoConfiguration);
    });
  });

  describe('getHost', () => {
    it('should return configured host', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getHost()).toBe('https://maximo.example.com');
    });
  });

  describe('getApiKey', () => {
    it('should return API key when configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getApiKey()).toBe('test-key-12345678901234567890');
    });

    it('should return undefined when not configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      expect(config.getApiKey()).toBeUndefined();
    });
  });

  describe('getCredentials', () => {
    it('should return credentials when configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      const creds = config.getCredentials();
      expect(creds).toEqual({
        username: 'testuser',
        password: 'testpass',
      });
    });

    it('should return undefined when not configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getCredentials()).toBeUndefined();
    });
  });

  describe('getTimeout', () => {
    it('should return configured timeout', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        timeout: 60000,
      });

      expect(config.getTimeout()).toBe(60000);
    });

    it('should return default timeout', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getTimeout()).toBe(30000);
    });
  });

  describe('getMaxRetries', () => {
    it('should return configured max retries', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        maxRetries: 5,
      });

      expect(config.getMaxRetries()).toBe(5);
    });

    it('should return default max retries', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getMaxRetries()).toBe(3);
    });
  });

  describe('shouldValidateSSL', () => {
    it('should return configured SSL validation', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        validateSSL: false,
      });

      expect(config.shouldValidateSSL()).toBe(false);
    });

    it('should return true by default', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.shouldValidateSSL()).toBe(true);
    });
  });

  describe('getApiVersion', () => {
    it('should return configured API version', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        apiVersion: 'v2',
      });

      expect(config.getApiVersion()).toBe('v2');
    });

    it('should return default API version', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.getApiVersion()).toBe('v1');
    });
  });

  describe('getApiEndpoint', () => {
    it('should build endpoint URL', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      const url = config.getApiEndpoint('/maximo/api/os/mxwodetail');
      expect(url).toBe('https://maximo.example.com/maximo/api/os/mxwodetail');
    });

    it('should handle trailing slash in host', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com/',
        apiKey: 'test-key-12345678901234567890',
      });

      const url = config.getApiEndpoint('/maximo/api/os/mxwodetail');
      expect(url).toBe('https://maximo.example.com/maximo/api/os/mxwodetail');
    });

    it('should handle resource without leading slash', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      const url = config.getApiEndpoint('maximo/api/os/mxwodetail');
      expect(url).toBe('https://maximo.example.com/maximo/api/os/mxwodetail');
    });
  });

  describe('validate', () => {
    it('should validate successfully with valid config', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(() => config.validate()).not.toThrow();
    });

    it('should throw error for negative timeout', () => {
      expect(() => {
        new MaximoConfiguration({
          host: 'https://maximo.example.com',
          apiKey: 'test-key-12345678901234567890',
          timeout: -1,
        });
      }).toThrow();
    });

    it('should throw error for negative max retries', () => {
      expect(() => {
        new MaximoConfiguration({
          host: 'https://maximo.example.com',
          apiKey: 'test-key-12345678901234567890',
          maxRetries: -1,
        });
      }).toThrow();
    });
  });

  describe('toJSON', () => {
    it('should export sanitized configuration', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'secret-key-12345678901234567890',
        timeout: 60000,
      });

      const json = config.toJSON();

      expect(json.host).toBe('https://maximo.example.com');
      expect(json.hasApiKey).toBe(true);
      expect(json.timeout).toBe(60000);
      expect(json).not.toHaveProperty('apiKey');
    });

    it('should indicate credentials presence', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      const json = config.toJSON();

      expect(json.hasCredentials).toBe(true);
      expect(json).not.toHaveProperty('username');
      expect(json).not.toHaveProperty('password');
    });
  });

  describe('getConfig', () => {
    it('should return complete configuration', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        timeout: 60000,
      });

      const fullConfig = config.getConfig();

      expect(fullConfig.host).toBe('https://maximo.example.com');
      expect(fullConfig.apiKey).toBe('test-key-12345678901234567890');
      expect(fullConfig.timeout).toBe(60000);
    });

    it('should return a copy of configuration', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      const fullConfig = config.getConfig();
      fullConfig.timeout = 99999;

      // Original should not be modified
      expect(config.getTimeout()).toBe(30000);
    });
  });

  describe('update', () => {
    it('should update configuration', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      config.update({ timeout: 60000 });

      expect(config.getTimeout()).toBe(60000);
    });

    it('should validate after update', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(() => {
        config.update({ timeout: -1 });
      }).toThrow();
    });

    it('should allow updating host', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      config.update({ host: 'https://new-maximo.example.com' });

      expect(config.getHost()).toBe('https://new-maximo.example.com');
    });
  });

  describe('isUsingApiKey', () => {
    it('should return true when API key is configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.isUsingApiKey()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      expect(config.isUsingApiKey()).toBe(false);
    });

    it('should return false for empty API key', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
        apiKey: '   ',
      });

      expect(config.isUsingApiKey()).toBe(false);
    });
  });

  describe('isUsingBasicAuth', () => {
    it('should return true when credentials are configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      expect(config.isUsingBasicAuth()).toBe(true);
    });

    it('should return false when credentials are not configured', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
      });

      expect(config.isUsingBasicAuth()).toBe(false);
    });

    it('should return false for empty credentials', () => {
      const config = new MaximoConfiguration({
        host: 'https://maximo.example.com',
        apiKey: 'test-key-12345678901234567890',
        username: '   ',
        password: '   ',
      });

      expect(config.isUsingBasicAuth()).toBe(false);
    });
  });

  describe('fromEnvironment', () => {
    it('should create configuration from environment variables', () => {
      const env = {
        MAXIMO_HOST: 'https://maximo.example.com',
        MAXIMO_API_KEY: 'test-key-12345678901234567890',
        MAXIMO_TIMEOUT: '60000',
        MAXIMO_MAX_RETRIES: '5',
        MAXIMO_VALIDATE_SSL: 'false',
        MAXIMO_API_VERSION: 'v2',
      };

      const config = MaximoConfiguration.fromEnvironment(env);

      expect(config.getHost()).toBe('https://maximo.example.com');
      expect(config.getApiKey()).toBe('test-key-12345678901234567890');
      expect(config.getTimeout()).toBe(60000);
      expect(config.getMaxRetries()).toBe(5);
      expect(config.shouldValidateSSL()).toBe(false);
      expect(config.getApiVersion()).toBe('v2');
    });

    it('should use process.env when no env provided', () => {
      // When process.env lacks required MAXIMO_HOST and auth settings,
      // fromEnvironment() will throw a validation error
      const originalHost = process.env.MAXIMO_HOST;
      const originalApiKey = process.env.MAXIMO_API_KEY;

      try {
        // Set required env vars for this test
        process.env.MAXIMO_HOST = 'https://test-maximo.example.com';
        process.env.MAXIMO_API_KEY = 'test-key-from-env-12345678901234567890';

        const config = MaximoConfiguration.fromEnvironment();
        expect(config).toBeInstanceOf(MaximoConfiguration);
        expect(config.getHost()).toBe('https://test-maximo.example.com');
      } finally {
        // Restore original values
        if (originalHost !== undefined) {
          process.env.MAXIMO_HOST = originalHost;
        } else {
          delete process.env.MAXIMO_HOST;
        }
        if (originalApiKey !== undefined) {
          process.env.MAXIMO_API_KEY = originalApiKey;
        } else {
          delete process.env.MAXIMO_API_KEY;
        }
      }
    });

    it('should handle username/password from environment', () => {
      const env = {
        MAXIMO_HOST: 'https://maximo.example.com',
        MAXIMO_USERNAME: 'testuser',
        MAXIMO_PASSWORD: 'testpass',
      };

      const config = MaximoConfiguration.fromEnvironment(env);

      expect(config.isUsingBasicAuth()).toBe(true);
      const creds = config.getCredentials();
      expect(creds?.username).toBe('testuser');
      expect(creds?.password).toBe('testpass');
    });
  });
});