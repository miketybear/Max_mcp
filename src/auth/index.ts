/**
 * Authentication Module
 * Exports all public interfaces and classes for Maximo API authentication
 */

// Export types and interfaces
export type {
  MaximoCredentials,
  AuthenticationResult,
  ConnectionStatus,
  AuthMethod,
  AuthConfig,
  AuthHeaders,
  ConnectionTestResult,
  ApiKeyValidationResult,
} from './types';

// Export enums and classes
export {
  AuthErrorCode,
  AuthenticationError,
  InvalidCredentialsError,
  ConnectionError,
} from './types';

// Export API Key Provider
export {
  ApiKeyProvider,
  getDefaultProvider,
  resetDefaultProvider,
} from './api-key-provider';

// Export Authentication Manager
export { AuthManager } from './auth-manager';

// Import for function return types
import { AuthManager } from './auth-manager';
import { ApiKeyProvider } from './api-key-provider';

/**
 * Create a new authentication manager with default configuration
 * @returns A new AuthManager instance
 */
export function createAuthManager(): AuthManager {
  return new AuthManager();
}

/**
 * Create a new authentication manager with custom API key provider
 * @param apiKeyProvider - Custom API key provider
 * @returns A new AuthManager instance
 */
export function createAuthManagerWithProvider(
  apiKeyProvider: ApiKeyProvider
): AuthManager {
  return new AuthManager(apiKeyProvider);
}