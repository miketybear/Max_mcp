/**
 * Type definitions for the Authentication Module
 * Defines interfaces and types for Maximo API authentication
 */

/**
 * Connection status for Maximo API
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

/**
 * Authentication method types
 */
export type AuthMethod = 'apikey' | 'basic' | 'custom';

/**
 * Maximo credentials configuration
 * Supports both API key and username/password authentication
 */
export interface MaximoCredentials {
  /**
   * Maximo host URL (e.g., https://maximo.example.com)
   */
  host: string;

  /**
   * API key for apikey header authentication (preferred method)
   */
  apiKey?: string;

  /**
   * Username for basic authentication (fallback method)
   */
  username?: string;

  /**
   * Password for basic authentication (fallback method)
   */
  password?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom authentication headers (optional)
   */
  customHeaders?: Record<string, string>;
}

/**
 * Result of an authentication attempt
 */
export interface AuthenticationResult {
  /**
   * Whether authentication was successful
   */
  success: boolean;

  /**
   * Authentication token (if applicable)
   */
  token?: string;

  /**
   * Error message if authentication failed
   */
  error?: string;

  /**
   * Error code for programmatic error handling
   */
  errorCode?: string;

  /**
   * Token expiration timestamp (if applicable)
   */
  expiresAt?: Date;

  /**
   * Authentication method used
   */
  method?: AuthMethod;
}

/**
 * Configuration options for authentication
 */
export interface AuthConfig {
  /**
   * Enable automatic token refresh
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Token refresh threshold in seconds before expiration
   * @default 300 (5 minutes)
   */
  refreshThreshold?: number;

  /**
   * Enable retry logic for failed authentication attempts
   * @default true
   */
  enableRetry?: boolean;

  /**
   * Base delay for exponential backoff in milliseconds
   * @default 1000
   */
  retryBaseDelay?: number;

  /**
   * Maximum delay for exponential backoff in milliseconds
   * @default 10000
   */
  retryMaxDelay?: number;

  /**
   * Validate SSL certificates
   * @default true
   */
  validateSSL?: boolean;
}

/**
 * Authentication error types
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_HOST = 'INVALID_HOST',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Custom error class for invalid credentials
 */
export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid credentials provided', details?: Record<string, unknown>) {
    super(message, AuthErrorCode.INVALID_CREDENTIALS, 401, details);
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

/**
 * Custom error class for connection errors
 */
export class ConnectionError extends AuthenticationError {
  constructor(message: string = 'Failed to connect to Maximo API', details?: Record<string, unknown>) {
    super(message, AuthErrorCode.CONNECTION_FAILED, undefined, details);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

/**
 * Authentication headers for API requests
 */
export interface AuthHeaders {
  /**
   * apikey header for API key authentication
   */
  apikey?: string;

  /**
   * Authorization header for basic authentication
   */
  Authorization?: string;

  /**
   * Custom headers
   */
  [key: string]: string | undefined;
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  /**
   * Whether the connection test was successful
   */
  success: boolean;

  /**
   * Response time in milliseconds
   */
  responseTime?: number;

  /**
   * Maximo version information
   */
  version?: string;

  /**
   * Error message if test failed
   */
  error?: string;

  /**
   * Additional details about the connection
   */
  details?: Record<string, unknown>;
}

/**
 * API key validation result
 */
export interface ApiKeyValidationResult {
  /**
   * Whether the API key is valid
   */
  valid: boolean;

  /**
   * Reason for validation failure
   */
  reason?: string;

  /**
   * Suggestions for fixing invalid API key
   */
  suggestions?: string[];
}