/**
 * Configuration Manager for Maximo MCP Server
 * 
 * This module provides a centralized singleton configuration manager
 * that integrates environment configuration, Maximo settings, and
 * application-wide configuration.
 */

import { EnvironmentConfig } from './environment.js';
import { MaximoConfiguration } from './maximo-config.js';
import {
  AppConfig,
  Environment,
  CacheConfig,
  RateLimitConfig,
  LoggingConfig,
} from './types.js';
import {
  DEFAULT_CACHE_TTL,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_RATE_LIMIT,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_LOG_FILE_PATH,
  DEFAULT_MCP_PORT,
} from './constants.js';

/**
 * Configuration Manager (Singleton)
 * Provides centralized access to all application configuration
 */
export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config: AppConfig | null = null;
  private maximoConfig: MaximoConfiguration | null = null;
  private initialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor
  }

  /**
   * Get the singleton instance
   * 
   * @returns ConfigManager instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Initialize the configuration manager
   * Loads configuration from environment variables and applies overrides
   * 
   * @param overrides - Optional configuration overrides (useful for testing)
   * @throws Error if configuration is invalid
   */
  public initialize(overrides?: Partial<AppConfig>): void {
    // Load environment variables
    EnvironmentConfig.load();
    EnvironmentConfig.validate();

    // Build Maximo configuration
    this.maximoConfig = new MaximoConfiguration({
      host: EnvironmentConfig.getRequired('MAXIMO_HOST'),
      apiKey: EnvironmentConfig.get('MAXIMO_API_KEY'),
      username: EnvironmentConfig.get('MAXIMO_USERNAME'),
      password: EnvironmentConfig.get('MAXIMO_PASSWORD'),
      timeout: EnvironmentConfig.getNumber('MAXIMO_TIMEOUT', 30000),
      maxRetries: EnvironmentConfig.getNumber('MAXIMO_MAX_RETRIES', 3),
      validateSSL: EnvironmentConfig.getBoolean('MAXIMO_VALIDATE_SSL', true),
      apiVersion: EnvironmentConfig.get('MAXIMO_API_VERSION', 'v1'),
    });

    // Build cache configuration
    const cacheConfig: CacheConfig = {
      enabled: EnvironmentConfig.getBoolean('CACHE_ENABLED', true),
      ttl: EnvironmentConfig.getNumber('CACHE_TTL', DEFAULT_CACHE_TTL),
      maxSize: EnvironmentConfig.getNumber('CACHE_MAX_SIZE', DEFAULT_CACHE_MAX_SIZE),
    };

    // Build rate limit configuration
    const rateLimitConfig: RateLimitConfig = {
      enabled: EnvironmentConfig.getBoolean('RATE_LIMIT_ENABLED', true),
      maxRequests: EnvironmentConfig.getNumber('RATE_LIMIT_MAX_REQUESTS', DEFAULT_RATE_LIMIT),
      windowMs: EnvironmentConfig.getNumber('RATE_LIMIT_WINDOW_MS', DEFAULT_RATE_LIMIT_WINDOW_MS),
    };

    // Build logging configuration
    const loggingConfig: LoggingConfig = {
      level: EnvironmentConfig.getLogLevel(),
      console: EnvironmentConfig.getBoolean('LOG_TO_CONSOLE', true),
      file: EnvironmentConfig.getBoolean('LOG_TO_FILE', true),
      filePath: EnvironmentConfig.get('LOG_FILE_PATH', DEFAULT_LOG_FILE_PATH),
    };

    // Build complete application configuration
    this.config = {
      environment: EnvironmentConfig.getEnvironment(),
      maximo: this.maximoConfig.getConfig(),
      cache: cacheConfig,
      rateLimit: rateLimitConfig,
      logging: loggingConfig,
      port: EnvironmentConfig.getNumber('MCP_PORT', DEFAULT_MCP_PORT),
    };

    // Apply overrides if provided
    if (overrides) {
      this.config = {
        ...this.config,
        ...overrides,
        maximo: {
          ...this.config.maximo,
          ...(overrides.maximo || {}),
        },
        cache: {
          ...this.config.cache,
          ...(overrides.cache || {}),
        },
        rateLimit: {
          ...this.config.rateLimit,
          ...(overrides.rateLimit || {}),
        },
        logging: {
          ...this.config.logging,
          ...(overrides.logging || {}),
        },
      };

      // Update Maximo configuration if overridden
      if (overrides.maximo) {
        this.maximoConfig = new MaximoConfiguration(this.config.maximo);
      }
    }

    // Validate the complete configuration
    this.validate();

    this.initialized = true;
  }

  /**
   * Get the complete application configuration
   * 
   * @returns Complete application configuration
   * @throws Error if not initialized
   */
  public getConfig(): AppConfig {
    return { ...this.getInitializedConfig() };
  }

  /**
   * Get the Maximo configuration
   * 
   * @returns Maximo configuration instance
   * @throws Error if not initialized
   */
  public getMaximoConfig(): MaximoConfiguration {
    return this.getInitializedMaximoConfig();
  }

  /**
   * Get the cache configuration
   * 
   * @returns Cache configuration
   * @throws Error if not initialized
   */
  public getCacheConfig(): CacheConfig {
    return { ...this.getInitializedConfig().cache };
  }

  /**
   * Get the rate limit configuration
   * 
   * @returns Rate limit configuration
   * @throws Error if not initialized
   */
  public getRateLimitConfig(): RateLimitConfig {
    return { ...this.getInitializedConfig().rateLimit };
  }

  /**
   * Get the logging configuration
   * 
   * @returns Logging configuration
   * @throws Error if not initialized
   */
  public getLoggingConfig(): LoggingConfig {
    return { ...this.getInitializedConfig().logging };
  }

  /**
   * Get the current environment
   * 
   * @returns Current environment
   * @throws Error if not initialized
   */
  public getEnvironment(): Environment {
    return this.getInitializedConfig().environment;
  }

  /**
   * Check if running in production environment
   * 
   * @returns True if production
   */
  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Check if running in development environment
   * 
   * @returns True if development
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  /**
   * Check if running in test environment
   * 
   * @returns True if test
   */
  public isTest(): boolean {
    return this.getEnvironment() === 'test';
  }

  /**
   * Check if running in staging environment
   * 
   * @returns True if staging
   */
  public isStaging(): boolean {
    return this.getEnvironment() === 'staging';
  }

  /**
   * Reload configuration from environment
   * Useful for hot-reloading configuration changes
   * 
   * @param overrides - Optional configuration overrides
   */
  public reload(overrides?: Partial<AppConfig>): void {
    this.initialized = false;
    this.config = null;
    this.maximoConfig = null;
    this.initialize(overrides);
  }

  /**
   * Validate the entire configuration
   * 
   * @throws Error if configuration is invalid
   */
  public validate(): void {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    // Validate Maximo configuration
    if (this.maximoConfig) {
      this.maximoConfig.validate();
    }

    // Validate cache configuration
    if (this.config.cache.ttl <= 0) {
      throw new Error('Cache TTL must be positive');
    }
    if (this.config.cache.maxSize <= 0) {
      throw new Error('Cache max size must be positive');
    }

    // Validate rate limit configuration
    if (this.config.rateLimit.maxRequests <= 0) {
      throw new Error('Rate limit max requests must be positive');
    }
    if (this.config.rateLimit.windowMs <= 0) {
      throw new Error('Rate limit window must be positive');
    }

    // Validate port
    if (this.config.port <= 0 || this.config.port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }

    // Validate logging configuration
    if (this.config.logging.file && !this.config.logging.filePath) {
      throw new Error('Log file path must be specified when file logging is enabled');
    }
  }

  /**
   * Export configuration as JSON (sanitized - no credentials)
   * 
   * @returns Sanitized configuration object
   */
  public toJSON(): Record<string, unknown> {
    const cfg = this.getInitializedConfig();
    const maxCfg = this.getInitializedMaximoConfig();

    return {
      environment: cfg.environment,
      maximo: maxCfg.toJSON(),
      cache: cfg.cache,
      rateLimit: cfg.rateLimit,
      logging: {
        ...cfg.logging,
        // Don't expose file path in production
        filePath: this.isProduction() ? '***REDACTED***' : cfg.logging.filePath,
      },
      port: cfg.port,
    };
  }

  /**
   * Check if the configuration manager is initialized
   * 
   * @returns True if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Ensure the configuration manager is initialized and return config
   *
   * @throws Error if not initialized
   * @returns The non-null configuration
   */
  private getInitializedConfig(): AppConfig {
    if (!this.initialized || !this.config) {
      throw new Error('ConfigManager not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Ensure the configuration manager is initialized and return maximo config
   *
   * @throws Error if not initialized
   * @returns The non-null maximo configuration
   */
  private getInitializedMaximoConfig(): MaximoConfiguration {
    if (!this.initialized || !this.maximoConfig) {
      throw new Error('ConfigManager not initialized. Call initialize() first.');
    }
    return this.maximoConfig;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   * 
   * @internal
   */
  public static reset(): void {
    ConfigManager.instance = null;
    EnvironmentConfig.reset();
  }
}

// Export singleton instance getter as default
export default ConfigManager;