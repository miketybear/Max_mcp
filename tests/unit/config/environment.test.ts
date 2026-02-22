/**
 * Unit tests for Environment Configuration
 */

import { EnvironmentConfig } from '../../../src/config/environment';

describe('EnvironmentConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Reset singleton
    EnvironmentConfig.reset();
    
    // Set minimal required env vars
    process.env.MAXIMO_HOST = 'https://maximo.example.com';
    process.env.MAXIMO_API_KEY = 'test-api-key-12345678901234567890';
    
    // Load environment
    EnvironmentConfig.load();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    EnvironmentConfig.reset();
  });

  describe('load', () => {
    it('should load environment variables', () => {
      process.env.TEST_VAR = 'test-value';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.get('TEST_VAR')).toBe('test-value');
    });
  });

  describe('get', () => {
    it('should get environment variable', () => {
      process.env.TEST_KEY = 'test-value';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.get('TEST_KEY')).toBe('test-value');
    });

    it('should return default value when variable not set', () => {
      expect(EnvironmentConfig.get('NON_EXISTENT', 'default')).toBe('default');
    });

    it('should return undefined when variable not set and no default', () => {
      expect(EnvironmentConfig.get('NON_EXISTENT')).toBeUndefined();
    });
  });

  describe('getRequired', () => {
    it('should get required environment variable', () => {
      process.env.REQUIRED_VAR = 'value';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getRequired('REQUIRED_VAR')).toBe('value');
    });

    it('should throw error when required variable not set', () => {
      expect(() => {
        EnvironmentConfig.getRequired('NON_EXISTENT');
      }).toThrow('Required environment variable NON_EXISTENT is not set');
    });

    it('should throw error when required variable is empty', () => {
      process.env.EMPTY_VAR = '';
      EnvironmentConfig.load();
      
      expect(() => {
        EnvironmentConfig.getRequired('EMPTY_VAR');
      }).toThrow();
    });
  });

  describe('getNumber', () => {
    it('should parse number from environment variable', () => {
      process.env.NUMBER_VAR = '42';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getNumber('NUMBER_VAR', 0)).toBe(42);
    });

    it('should return default for non-numeric value', () => {
      process.env.INVALID_NUMBER = 'not-a-number';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getNumber('INVALID_NUMBER', 10)).toBe(10);
    });

    it('should return default when variable not set', () => {
      expect(EnvironmentConfig.getNumber('NON_EXISTENT', 99)).toBe(99);
    });

    it('should parse negative numbers', () => {
      process.env.NEGATIVE = '-5';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getNumber('NEGATIVE', 0)).toBe(-5);
    });
  });

  describe('getBoolean', () => {
    it('should parse "true" as true', () => {
      process.env.BOOL_VAR = 'true';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', false)).toBe(true);
    });

    it('should parse "1" as true', () => {
      process.env.BOOL_VAR = '1';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', false)).toBe(true);
    });

    it('should parse "yes" as true', () => {
      process.env.BOOL_VAR = 'yes';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', false)).toBe(true);
    });

    it('should parse "on" as true', () => {
      process.env.BOOL_VAR = 'on';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', false)).toBe(true);
    });

    it('should be case-insensitive', () => {
      process.env.BOOL_VAR = 'TRUE';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', false)).toBe(true);
    });

    it('should parse other values as false', () => {
      process.env.BOOL_VAR = 'false';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getBoolean('BOOL_VAR', true)).toBe(false);
    });

    it('should return default when variable not set', () => {
      expect(EnvironmentConfig.getBoolean('NON_EXISTENT', true)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate successfully with API key', () => {
      process.env.MAXIMO_HOST = 'https://maximo.example.com';
      process.env.MAXIMO_API_KEY = 'test-key-12345678901234567890';
      EnvironmentConfig.load();
      
      expect(() => EnvironmentConfig.validate()).not.toThrow();
    });

    it('should validate successfully with username/password', () => {
      process.env.MAXIMO_HOST = 'https://maximo.example.com';
      process.env.MAXIMO_USERNAME = 'testuser';
      process.env.MAXIMO_PASSWORD = 'testpass';
      delete process.env.MAXIMO_API_KEY;
      EnvironmentConfig.load();
      
      expect(() => EnvironmentConfig.validate()).not.toThrow();
    });

    it('should throw error when MAXIMO_HOST is missing', () => {
      delete process.env.MAXIMO_HOST;
      EnvironmentConfig.load();
      
      expect(() => EnvironmentConfig.validate()).toThrow();
    });

    it('should throw error when MAXIMO_HOST is invalid URL', () => {
      process.env.MAXIMO_HOST = 'not-a-url';
      EnvironmentConfig.load();
      
      expect(() => EnvironmentConfig.validate()).toThrow();
    });

    it('should throw error when no authentication provided', () => {
      process.env.MAXIMO_HOST = 'https://maximo.example.com';
      delete process.env.MAXIMO_API_KEY;
      delete process.env.MAXIMO_USERNAME;
      delete process.env.MAXIMO_PASSWORD;
      EnvironmentConfig.load();
      
      expect(() => EnvironmentConfig.validate()).toThrow(/Authentication configuration error/);
    });

    it('should not validate twice', () => {
      EnvironmentConfig.validate();
      // Second call should not throw or re-validate
      expect(() => EnvironmentConfig.validate()).not.toThrow();
    });
  });

  describe('getEnvironment', () => {
    it('should return development by default', () => {
      delete process.env.NODE_ENV;
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getEnvironment()).toBe('development');
    });

    it('should return production when set', () => {
      process.env.NODE_ENV = 'production';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getEnvironment()).toBe('production');
    });

    it('should return test when set', () => {
      process.env.NODE_ENV = 'test';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getEnvironment()).toBe('test');
    });

    it('should return staging when set', () => {
      process.env.NODE_ENV = 'staging';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getEnvironment()).toBe('staging');
    });

    it('should default to development for invalid values', () => {
      process.env.NODE_ENV = 'invalid';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getEnvironment()).toBe('development');
    });
  });

  describe('environment checks', () => {
    it('isProduction should return true in production', () => {
      process.env.NODE_ENV = 'production';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.isProduction()).toBe(true);
      expect(EnvironmentConfig.isDevelopment()).toBe(false);
    });

    it('isDevelopment should return true in development', () => {
      process.env.NODE_ENV = 'development';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.isDevelopment()).toBe(true);
      expect(EnvironmentConfig.isProduction()).toBe(false);
    });

    it('isTest should return true in test', () => {
      process.env.NODE_ENV = 'test';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.isTest()).toBe(true);
      expect(EnvironmentConfig.isProduction()).toBe(false);
    });

    it('isStaging should return true in staging', () => {
      process.env.NODE_ENV = 'staging';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.isStaging()).toBe(true);
      expect(EnvironmentConfig.isProduction()).toBe(false);
    });
  });

  describe('getLogLevel', () => {
    it('should return info by default', () => {
      delete process.env.LOG_LEVEL;
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getLogLevel()).toBe('info');
    });

    it('should return configured log level', () => {
      process.env.LOG_LEVEL = 'debug';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getLogLevel()).toBe('debug');
    });

    it('should default to info for invalid log level', () => {
      process.env.LOG_LEVEL = 'invalid';
      EnvironmentConfig.load();
      
      expect(EnvironmentConfig.getLogLevel()).toBe('info');
    });

    const validLevels = ['error', 'warn', 'info', 'debug', 'verbose'];
    validLevels.forEach((level) => {
      it(`should accept ${level} as valid log level`, () => {
        process.env.LOG_LEVEL = level;
        EnvironmentConfig.load();
        
        expect(EnvironmentConfig.getLogLevel()).toBe(level);
      });
    });
  });

  describe('getAll', () => {
    it('should return all environment variables', () => {
      process.env.TEST_VAR = 'test-value';
      EnvironmentConfig.load();
      
      const all = EnvironmentConfig.getAll();
      expect(all.TEST_VAR).toBe('test-value');
    });

    it('should mask sensitive values', () => {
      process.env.MAXIMO_API_KEY = 'secret-key';
      process.env.MAXIMO_PASSWORD = 'secret-pass';
      EnvironmentConfig.load();
      
      const all = EnvironmentConfig.getAll();
      expect(all.MAXIMO_API_KEY).toBe('***REDACTED***');
      expect(all.MAXIMO_PASSWORD).toBe('***REDACTED***');
    });

    it('should not include undefined values', () => {
      EnvironmentConfig.load();
      const all = EnvironmentConfig.getAll();
      
      // Check that all values are strings
      Object.values(all).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('reset', () => {
    it('should reset singleton instance', () => {
      EnvironmentConfig.validate();
      EnvironmentConfig.reset();
      
      // After reset, should be able to load again
      EnvironmentConfig.load();
      expect(() => EnvironmentConfig.validate()).not.toThrow();
    });
  });
});