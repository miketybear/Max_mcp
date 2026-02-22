/**
 * Environment Configuration Loader for Maximo MCP Server
 * 
 * This module handles loading and validating environment variables from
 * .env files and the system environment.
 */

import * as dotenv from 'dotenv';
import { z } from 'zod';
import { Environment, LogLevel } from './types.js';
import {
  DEFAULT_API_VERSION,
  DEFAULT_LOG_FILE_PATH,
} from './constants.js';

/**
 * Environment variable schema for validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // Maximo configuration (required)
  MAXIMO_HOST: z.string().url('MAXIMO_HOST must be a valid URL'),

  // Authentication (either API key OR username+password required)
  MAXIMO_API_KEY: z.string().optional(),
  MAXIMO_USERNAME: z.string().optional(),
  MAXIMO_PASSWORD: z.string().optional(),

  // Maximo optional settings
  MAXIMO_TIMEOUT: z.string().optional(),
  MAXIMO_MAX_RETRIES: z.string().optional(),
  MAXIMO_VALIDATE_SSL: z.string().optional(),
  MAXIMO_API_VERSION: z.string().default(DEFAULT_API_VERSION),

  // Cache configuration
  CACHE_ENABLED: z.string().optional(),
  CACHE_TTL: z.string().optional(),
  CACHE_MAX_SIZE: z.string().optional(),

  // Rate limiting configuration
  RATE_LIMIT_ENABLED: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),

  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  LOG_TO_CONSOLE: z.string().optional(),
  LOG_TO_FILE: z.string().optional(),
  LOG_FILE_PATH: z.string().default(DEFAULT_LOG_FILE_PATH),

  // MCP server configuration
  MCP_PORT: z.string().optional(),
});

/**
 * Environment configuration class
 * Handles loading, parsing, and validating environment variables
 */
export class EnvironmentConfig {
  private static instance: EnvironmentConfig | null = null;
  private env: Record<string, string | undefined>;
  private validated: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.env = {};
  }

  /**
   * Get the singleton instance
   */
  private static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Load environment variables from .env file and system environment
   * System environment variables take precedence over .env file
   */
  public static load(): void {
    const instance = EnvironmentConfig.getInstance();

    // Load from .env file (if exists)
    dotenv.config();

    // Store all environment variables
    instance.env = { ...process.env };
    instance.validated = false;
  }

  /**
   * Get an environment variable value
   * 
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value or default
   */
  public static get(key: string, defaultValue?: string): string | undefined {
    const instance = EnvironmentConfig.getInstance();
    const value = instance.env[key];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get a required environment variable
   * Throws an error if the variable is not set
   * 
   * @param key - Environment variable key
   * @returns Environment variable value
   * @throws Error if variable is not set
   */
  public static getRequired(key: string): string {
    const value = EnvironmentConfig.get(key);
    if (value === undefined || value === '') {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get an environment variable as a number
   * 
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found or invalid
   * @returns Parsed number value
   */
  public static getNumber(key: string, defaultValue: number): number {
    const value = EnvironmentConfig.get(key);
    if (value === undefined || value === '') {
      return defaultValue;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(`Environment variable ${key} is not a valid number, using default: ${defaultValue}`);
      return defaultValue;
    }

    return parsed;
  }

  /**
   * Get an environment variable as a boolean
   * Accepts: 'true', '1', 'yes', 'on' as true (case-insensitive)
   * Everything else is false
   * 
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Boolean value
   */
  public static getBoolean(key: string, defaultValue: boolean): boolean {
    const value = EnvironmentConfig.get(key);
    if (value === undefined || value === '') {
      return defaultValue;
    }

    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }

  /**
   * Validate all required environment variables
   * Throws an error if validation fails
   * 
   * @throws Error if validation fails
   */
  public static validate(): void {
    const instance = EnvironmentConfig.getInstance();

    if (instance.validated) {
      return; // Already validated
    }

    try {
      // Validate using zod schema
      const result = envSchema.safeParse(instance.env);

      if (!result.success) {
        const errors = result.error.errors.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join('\n');
        throw new Error(`Environment validation failed:\n${errors}`);
      }

      // Additional validation: ensure either API key OR username+password is provided
      const hasApiKey = instance.env['MAXIMO_API_KEY'] && instance.env['MAXIMO_API_KEY'].trim() !== '';
      const hasCredentials =
        instance.env['MAXIMO_USERNAME'] && instance.env['MAXIMO_USERNAME'].trim() !== '' &&
        instance.env['MAXIMO_PASSWORD'] && instance.env['MAXIMO_PASSWORD'].trim() !== '';

      if (!hasApiKey && !hasCredentials) {
        throw new Error(
          'Authentication configuration error: Either MAXIMO_API_KEY or both MAXIMO_USERNAME and MAXIMO_PASSWORD must be provided'
        );
      }

      instance.validated = true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Environment configuration error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the current environment
   * 
   * @returns Current environment (development, staging, production, or test)
   */
  public static getEnvironment(): Environment {
    const env = EnvironmentConfig.get('NODE_ENV', 'development');
    
    // Validate it's a valid environment
    if (env === 'development' || env === 'staging' || env === 'production' || env === 'test') {
      return env;
    }

    console.warn(`Invalid NODE_ENV value: ${env}, defaulting to 'development'`);
    return 'development';
  }

  /**
   * Check if running in production environment
   */
  public static isProduction(): boolean {
    return EnvironmentConfig.getEnvironment() === 'production';
  }

  /**
   * Check if running in development environment
   */
  public static isDevelopment(): boolean {
    return EnvironmentConfig.getEnvironment() === 'development';
  }

  /**
   * Check if running in test environment
   */
  public static isTest(): boolean {
    return EnvironmentConfig.getEnvironment() === 'test';
  }

  /**
   * Check if running in staging environment
   */
  public static isStaging(): boolean {
    return EnvironmentConfig.getEnvironment() === 'staging';
  }

  /**
   * Get log level from environment
   */
  public static getLogLevel(): LogLevel {
    const level = EnvironmentConfig.get('LOG_LEVEL', 'info');
    
    // Validate it's a valid log level
    const validLevels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'verbose'];
    if (validLevels.includes(level as LogLevel)) {
      return level as LogLevel;
    }

    console.warn(`Invalid LOG_LEVEL value: ${level}, defaulting to 'info'`);
    return 'info';
  }

  /**
   * Reset the singleton instance (useful for testing)
   * @internal
   */
  public static reset(): void {
    EnvironmentConfig.instance = null;
  }

  /**
   * Get all environment variables (for debugging)
   * Sensitive values are masked
   * 
   * @returns Sanitized environment variables
   */
  public static getAll(): Record<string, string> {
    const instance = EnvironmentConfig.getInstance();
    const sanitized: Record<string, string> = {};

    // List of sensitive keys to mask
    const sensitiveKeys = ['MAXIMO_API_KEY', 'MAXIMO_PASSWORD', 'PASSWORD', 'SECRET', 'TOKEN'];

    for (const [key, value] of Object.entries(instance.env)) {
      if (value === undefined) { continue; }

      // Mask sensitive values
      const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
      sanitized[key] = isSensitive ? '***REDACTED***' : value;
    }

    return sanitized;
  }
}

// Auto-load environment on module import
EnvironmentConfig.load();