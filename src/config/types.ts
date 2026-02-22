/**
 * Configuration Types for Maximo MCP Server
 * 
 * This module defines all TypeScript interfaces and types used throughout
 * the configuration management system.
 */

/**
 * Application environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Logging level types
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Maximo server configuration
 */
export interface MaximoConfig {
  /**
   * Maximo server URL (e.g., https://maximo.example.com)
   */
  host: string;

  /**
   * Optional API key for authentication
   */
  apiKey?: string;

  /**
   * Optional username for basic authentication
   */
  username?: string;

  /**
   * Optional password for basic authentication
   */
  password?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries: number;

  /**
   * Whether to validate SSL certificates
   * @default true
   */
  validateSSL: boolean;

  /**
   * Maximo API version
   * @default 'v1'
   */
  apiVersion: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Whether caching is enabled
   * @default true
   */
  enabled: boolean;

  /**
   * Default time-to-live for cache entries in seconds
   * @default 300
   */
  ttl: number;

  /**
   * Maximum number of entries in the cache
   * @default 1000
   */
  maxSize: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Whether rate limiting is enabled
   * @default true
   */
  enabled: boolean;

  /**
   * Maximum number of requests allowed in the time window
   * @default 100
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   * @default 60000
   */
  windowMs: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /**
   * Logging level
   * @default 'info'
   */
  level: LogLevel;

  /**
   * Whether to log to console
   * @default true
   */
  console: boolean;

  /**
   * Whether to log to file
   * @default true
   */
  file: boolean;

  /**
   * Path to log file (required if file logging is enabled)
   */
  filePath?: string;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  /**
   * Current application environment
   */
  environment: Environment;

  /**
   * Maximo server configuration
   */
  maximo: MaximoConfig;

  /**
   * Cache configuration
   */
  cache: CacheConfig;

  /**
   * Rate limiting configuration
   */
  rateLimit: RateLimitConfig;

  /**
   * Logging configuration
   */
  logging: LoggingConfig;

  /**
   * MCP server port
   * @default 3000
   */
  port: number;
}