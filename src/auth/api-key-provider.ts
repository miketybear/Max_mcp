/**
 * API Key Provider
 * Manages API key retrieval, validation, and rotation for Maximo authentication
 */

import { createLogger } from '../utils/logger';
import {
  ApiKeyValidationResult,
  InvalidCredentialsError,
  AuthErrorCode,
} from './types';

const logger = createLogger('ApiKeyProvider');

/**
 * API Key Provider class
 * Handles secure API key management and validation
 */
export class ApiKeyProvider {
  private apiKey: string | null = null;
  private keySetAt: Date | null = null;
  private readonly keyExpiryHours: number;

  /**
   * Create a new API Key Provider
   * @param keyExpiryHours - Hours until API key is considered expired (default: 24)
   */
  constructor(keyExpiryHours: number = 24) {
    this.keyExpiryHours = keyExpiryHours;
    logger.info('ApiKeyProvider initialized', { keyExpiryHours });
  }

  /**
   * Get API key from environment variables or stored value
   * @returns The API key or null if not available
   */
  public getApiKey(): string | null {
    // First check if we have a stored key
    if (this.apiKey) {
      logger.debug('Returning stored API key');
      return this.apiKey;
    }

    // Try to get from environment
    const envKey = process.env['MAXIMO_API_KEY'];
    if (envKey) {
      logger.info('API key retrieved from environment');
      this.apiKey = envKey;
      this.keySetAt = new Date();
      return envKey;
    }

    logger.warn('No API key available');
    return null;
  }

  /**
   * Validate API key format and structure
   * @param key - The API key to validate
   * @returns Validation result with details
   */
  public validateApiKey(key: string): ApiKeyValidationResult {
    logger.debug('Validating API key format');

    // Check if key is empty
    if (!key || key.trim().length === 0) {
      return {
        valid: false,
        reason: 'API key is empty',
        suggestions: ['Provide a non-empty API key'],
      };
    }

    // Check minimum length (typical API keys are at least 20 characters)
    if (key.length < 20) {
      return {
        valid: false,
        reason: 'API key is too short',
        suggestions: [
          'API keys are typically at least 20 characters long',
          'Verify you have the complete API key',
        ],
      };
    }

    // Check for whitespace
    if (key !== key.trim()) {
      return {
        valid: false,
        reason: 'API key contains leading or trailing whitespace',
        suggestions: ['Remove whitespace from the API key'],
      };
    }

    // Check for invalid characters (API keys typically use alphanumeric and some special chars)
    const validPattern = /^[A-Za-z0-9\-_=+/]+$/;
    if (!validPattern.test(key)) {
      return {
        valid: false,
        reason: 'API key contains invalid characters',
        suggestions: [
          'API keys typically contain only alphanumeric characters and -_=+/',
          'Verify the API key was copied correctly',
        ],
      };
    }

    // Check maximum length (reasonable upper bound)
    if (key.length > 500) {
      return {
        valid: false,
        reason: 'API key is unusually long',
        suggestions: ['Verify you have the correct API key'],
      };
    }

    logger.info('API key format validation passed');
    return {
      valid: true,
    };
  }

  /**
   * Set or rotate the API key
   * @param newKey - The new API key to use
   * @throws {InvalidCredentialsError} If the new key is invalid
   */
  public rotateApiKey(newKey: string): void {
    logger.info('Attempting to rotate API key');

    // Validate the new key
    const validation = this.validateApiKey(newKey);
    if (!validation.valid) {
      logger.error('API key rotation failed: invalid key format', {
        reason: validation.reason,
      });
      throw new InvalidCredentialsError(
        `Invalid API key: ${validation.reason}`,
        { suggestions: validation.suggestions }
      );
    }

    // Store the old key for logging (not the actual value)
    const hadPreviousKey = this.apiKey !== null;

    // Set the new key
    this.apiKey = newKey;
    this.keySetAt = new Date();

    logger.info('API key rotated successfully', {
      hadPreviousKey,
      setAt: this.keySetAt.toISOString(),
    });
  }

  /**
   * Check if the current API key is expired
   * @returns True if the key is expired or not set
   */
  public isExpired(): boolean {
    // No key set means it's "expired"
    if (!this.apiKey || !this.keySetAt) {
      logger.debug('No API key set, considering expired');
      return true;
    }

    // Calculate expiry time
    const expiryTime = new Date(this.keySetAt);
    expiryTime.setHours(expiryTime.getHours() + this.keyExpiryHours);

    const now = new Date();
    const isExpired = now >= expiryTime;

    if (isExpired) {
      logger.warn('API key has expired', {
        setAt: this.keySetAt.toISOString(),
        expiryTime: expiryTime.toISOString(),
        hoursOld: Math.floor((now.getTime() - this.keySetAt.getTime()) / (1000 * 60 * 60)),
      });
    }

    return isExpired;
  }

  /**
   * Clear the stored API key
   */
  public clearApiKey(): void {
    logger.info('Clearing stored API key');
    this.apiKey = null;
    this.keySetAt = null;
  }

  /**
   * Get information about the current API key (without exposing the key itself)
   * @returns Information about the API key status
   */
  public getKeyInfo(): {
    hasKey: boolean;
    setAt: Date | null;
    isExpired: boolean;
    hoursUntilExpiry: number | null;
  } {
    const hasKey = this.apiKey !== null;
    const isExpired = this.isExpired();

    let hoursUntilExpiry: number | null = null;
    if (this.keySetAt && !isExpired) {
      const expiryTime = new Date(this.keySetAt);
      expiryTime.setHours(expiryTime.getHours() + this.keyExpiryHours);
      const now = new Date();
      hoursUntilExpiry = Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    }

    return {
      hasKey,
      setAt: this.keySetAt,
      isExpired,
      hoursUntilExpiry,
    };
  }

  /**
   * Load API key from environment variables
   * @returns True if key was loaded successfully
   */
  public loadFromEnvironment(): boolean {
    const key = process.env['MAXIMO_API_KEY'];
    
    if (!key) {
      logger.warn('MAXIMO_API_KEY not found in environment');
      return false;
    }

    try {
      this.rotateApiKey(key);
      logger.info('API key loaded from environment successfully');
      return true;
    } catch (error) {
      logger.error('Failed to load API key from environment', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Validate that we have a usable API key
   * @throws {InvalidCredentialsError} If no valid API key is available
   */
  public ensureValidKey(): void {
    const key = this.getApiKey();
    
    if (!key) {
      throw new InvalidCredentialsError(
        'No API key available. Set MAXIMO_API_KEY environment variable or call rotateApiKey().',
        { code: AuthErrorCode.MISSING_CREDENTIALS }
      );
    }

    if (this.isExpired()) {
      throw new InvalidCredentialsError(
        'API key has expired. Please rotate the key.',
        { code: AuthErrorCode.TOKEN_EXPIRED }
      );
    }

    const validation = this.validateApiKey(key);
    if (!validation.valid) {
      throw new InvalidCredentialsError(
        `Invalid API key: ${validation.reason}`,
        { suggestions: validation.suggestions }
      );
    }
  }
}

/**
 * Create a singleton instance of ApiKeyProvider
 */
let defaultProvider: ApiKeyProvider | null = null;

/**
 * Get the default API key provider instance
 * @returns The default ApiKeyProvider instance
 */
export function getDefaultProvider(): ApiKeyProvider {
  if (!defaultProvider) {
    defaultProvider = new ApiKeyProvider();
    // Try to load from environment on first access
    defaultProvider.loadFromEnvironment();
  }
  return defaultProvider;
}

/**
 * Reset the default provider (useful for testing)
 */
export function resetDefaultProvider(): void {
  defaultProvider = null;
}