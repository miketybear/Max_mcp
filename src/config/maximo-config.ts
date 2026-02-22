/**
 * Maximo Configuration for Maximo MCP Server
 *
 * This module handles Maximo-specific configuration including
 * connection settings, authentication, and API endpoint management.
 */

import { z } from 'zod';
import { MaximoConfig } from './types.js';

// Declare global process for Node.js environment
declare const process: {
  env: Record<string, string | undefined>;
};
import {
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_API_VERSION,
} from './constants.js';

/**
 * Zod schema for Maximo configuration validation
 */
const maximoConfigSchema = z.object({
  host: z.string().url('Host must be a valid URL'),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  timeout: z.number().positive('Timeout must be positive'),
  maxRetries: z.number().min(0, 'Max retries must be non-negative'),
  validateSSL: z.boolean(),
  apiVersion: z.string().min(1, 'API version cannot be empty'),
}).refine(
  (data) => {
    // Either API key OR username+password must be provided
    const hasApiKey = data.apiKey && data.apiKey.trim() !== '';
    const hasCredentials =
      data.username && data.username.trim() !== '' &&
      data.password && data.password.trim() !== '';
    return hasApiKey || hasCredentials;
  },
  {
    message: 'Either apiKey or both username and password must be provided',
  }
);

/**
 * Maximo Configuration class
 * Manages Maximo server connection and API settings
 */
export class MaximoConfiguration {
  private config: MaximoConfig;

  /**
   * Create a new Maximo configuration
   * 
   * @param config - Partial configuration object (missing values use defaults)
   * @throws Error if configuration is invalid
   */
  constructor(config?: Partial<MaximoConfig>) {
    // Build complete configuration with defaults
    this.config = {
      host: config?.host || '',
      apiKey: config?.apiKey,
      username: config?.username,
      password: config?.password,
      timeout: config?.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config?.maxRetries ?? DEFAULT_MAX_RETRIES,
      validateSSL: config?.validateSSL ?? true,
      apiVersion: config?.apiVersion || DEFAULT_API_VERSION,
    };

    // Validate configuration
    this.validate();
  }

  /**
   * Get the Maximo host URL
   * 
   * @returns Maximo server URL
   */
  public getHost(): string {
    return this.config.host;
  }

  /**
   * Get the API key (if configured)
   * 
   * @returns API key or undefined
   */
  public getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Get username/password credentials (if configured)
   * 
   * @returns Object with username and password, or undefined if not configured
   */
  public getCredentials(): { username: string; password: string } | undefined {
    if (this.config.username && this.config.password) {
      return {
        username: this.config.username,
        password: this.config.password,
      };
    }
    return undefined;
  }

  /**
   * Get the request timeout in milliseconds
   * 
   * @returns Timeout value
   */
  public getTimeout(): number {
    return this.config.timeout;
  }

  /**
   * Get the maximum number of retry attempts
   * 
   * @returns Max retry attempts
   */
  public getMaxRetries(): number {
    return this.config.maxRetries;
  }

  /**
   * Check if SSL certificate validation is enabled
   * 
   * @returns True if SSL validation is enabled
   */
  public shouldValidateSSL(): boolean {
    return this.config.validateSSL;
  }

  /**
   * Get the Maximo API version
   * 
   * @returns API version string
   */
  public getApiVersion(): string {
    return this.config.apiVersion;
  }

  /**
   * Build a full API endpoint URL for a given resource
   * 
   * @param resource - Resource path (e.g., '/maximo/api/os/mxwodetail')
   * @returns Complete URL for the resource
   * 
   * @example
   * ```typescript
   * const config = new MaximoConfiguration({ host: 'https://maximo.example.com' });
   * const url = config.getApiEndpoint('/maximo/api/os/mxwodetail');
   * // Returns: 'https://maximo.example.com/maximo/api/os/mxwodetail'
   * ```
   */
  public getApiEndpoint(resource: string): string {
    // Remove trailing slash from host if present
    const host = this.config.host.replace(/\/$/, '');
    
    // Ensure resource starts with /
    const path = resource.startsWith('/') ? resource : `/${resource}`;
    
    return `${host}${path}`;
  }

  /**
   * Validate the configuration
   * 
   * @throws Error if configuration is invalid
   */
  public validate(): void {
    try {
      maximoConfigSchema.parse(this.config);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err: z.ZodIssue) =>
          `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        throw new Error(`Maximo configuration validation failed:\n${errors}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown validation error');
    }
  }

  /**
   * Export configuration as JSON (sanitized - no credentials)
   * 
   * @returns Sanitized configuration object
   */
  public toJSON(): Record<string, unknown> {
    return {
      host: this.config.host,
      hasApiKey: !!this.config.apiKey,
      hasCredentials: !!(this.config.username && this.config.password),
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      validateSSL: this.config.validateSSL,
      apiVersion: this.config.apiVersion,
    };
  }

  /**
   * Get the complete configuration (internal use only)
   * WARNING: Contains sensitive data
   * 
   * @internal
   * @returns Complete configuration object
   */
  public getConfig(): MaximoConfig {
    return { ...this.config };
  }

  /**
   * Update configuration values
   * 
   * @param updates - Partial configuration to update
   * @throws Error if updated configuration is invalid
   */
  public update(updates: Partial<MaximoConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    this.validate();
  }

  /**
   * Check if using API key authentication
   * 
   * @returns True if API key is configured
   */
  public isUsingApiKey(): boolean {
    return !!this.config.apiKey && this.config.apiKey.trim() !== '';
  }

  /**
   * Check if using basic authentication (username/password)
   * 
   * @returns True if username and password are configured
   */
  public isUsingBasicAuth(): boolean {
    return !!(
      this.config.username && 
      this.config.username.trim() !== '' &&
      this.config.password && 
      this.config.password.trim() !== ''
    );
  }

  /**
   * Create a MaximoConfiguration from environment variables
   *
   * @param env - Environment variables object
   * @returns New MaximoConfiguration instance
   */
  public static fromEnvironment(env?: Record<string, string | undefined>): MaximoConfiguration {
    const envVars = env || (typeof process !== 'undefined' ? process.env : {});
    return new MaximoConfiguration({
      host: envVars['MAXIMO_HOST'],
      apiKey: envVars['MAXIMO_API_KEY'],
      username: envVars['MAXIMO_USERNAME'],
      password: envVars['MAXIMO_PASSWORD'],
      timeout: envVars['MAXIMO_TIMEOUT'] ? parseInt(envVars['MAXIMO_TIMEOUT'], 10) : undefined,
      maxRetries: envVars['MAXIMO_MAX_RETRIES'] ? parseInt(envVars['MAXIMO_MAX_RETRIES'], 10) : undefined,
      validateSSL: envVars['MAXIMO_VALIDATE_SSL'] ? envVars['MAXIMO_VALIDATE_SSL'].toLowerCase() === 'true' : undefined,
      apiVersion: envVars['MAXIMO_API_VERSION'],
    });
  }
}