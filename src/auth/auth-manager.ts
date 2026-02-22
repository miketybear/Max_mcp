/**
 * Authentication Manager
 * Main authentication handler for Maximo API connections
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger, sanitizeLogData } from '../utils/logger';
import { ApiKeyProvider } from './api-key-provider';
import {
  MaximoCredentials,
  AuthenticationResult,
  ConnectionStatus,
  AuthConfig,
  AuthHeaders,
  ConnectionTestResult,
  AuthMethod,
  AuthenticationError,
  InvalidCredentialsError,
  ConnectionError,
  AuthErrorCode,
} from './types';

const logger = createLogger('AuthManager');

/**
 * Default authentication configuration
 */
const DEFAULT_AUTH_CONFIG: Required<AuthConfig> = {
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
  enableRetry: true,
  retryBaseDelay: 1000, // 1 second
  retryMaxDelay: 10000, // 10 seconds
  validateSSL: true,
};

/**
 * Authentication Manager class
 * Handles all authentication operations for Maximo API
 */
export class AuthManager {
  private credentials: MaximoCredentials | null = null;
  private apiKeyProvider: ApiKeyProvider;
  private axiosInstance: AxiosInstance | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private authResult: AuthenticationResult | null = null;
  private config: Required<AuthConfig>;

  /**
   * Create a new Authentication Manager
   * @param apiKeyProvider - Optional API key provider instance
   * @param config - Optional authentication configuration
   */
  constructor(
    apiKeyProvider?: ApiKeyProvider,
    config?: Partial<AuthConfig>
  ) {
    this.apiKeyProvider = apiKeyProvider || new ApiKeyProvider();
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config };
    logger.info('AuthManager initialized', {
      config: sanitizeLogData(this.config as unknown as Record<string, unknown>),
    });
  }

  /**
   * Authenticate with Maximo API
   * @param credentials - Maximo credentials
   * @returns Authentication result
   */
  public async authenticate(
    credentials: MaximoCredentials
  ): Promise<AuthenticationResult> {
    logger.info('Starting authentication', {
      host: credentials.host,
      hasApiKey: !!credentials.apiKey,
      hasUsername: !!credentials.username,
    });

    try {
      // Validate credentials
      this.validateCredentials(credentials);

      // Store credentials
      this.credentials = credentials;

      // Determine authentication method
      const method = this.determineAuthMethod(credentials);
      logger.info('Using authentication method', { method });

      // Create axios instance
      this.createAxiosInstance();

      // Perform authentication based on method
      let result: AuthenticationResult;
      if (method === 'apikey') {
        result = await this.authenticateWithApiKey(credentials);
      } else if (method === 'basic') {
        result = await this.authenticateWithBasicAuth(credentials);
      } else {
        result = await this.authenticateWithCustomHeaders(credentials);
      }

      // Update connection status
      this.connectionStatus = result.success ? 'connected' : 'error';
      this.authResult = result;

      if (result.success) {
        logger.info('Authentication successful', { method });
      } else {
        logger.error('Authentication failed', {
          method,
          error: result.error,
          errorCode: result.errorCode,
        });
      }

      return result;
    } catch (error) {
      this.connectionStatus = 'error';
      const authError = this.handleAuthError(error);
      this.authResult = {
        success: false,
        error: authError.message,
        errorCode: authError.code,
      };
      throw authError;
    }
  }

  /**
   * Get authentication headers for API requests
   * @returns Authentication headers
   */
  public getAuthHeaders(): AuthHeaders {
    if (!this.credentials) {
      throw new InvalidCredentialsError('Not authenticated. Call authenticate() first.');
    }

    const headers: AuthHeaders = {};

    // Add API key header if available
    if (this.credentials.apiKey) {
      headers.apikey = this.credentials.apiKey;
    }

    // Add basic auth header if username/password provided
    if (this.credentials.username && this.credentials.password) {
      const token = Buffer.from(
        `${this.credentials.username}:${this.credentials.password}`
      ).toString('base64');
      headers.Authorization = `Basic ${token}`;
    }

    // Add custom headers
    if (this.credentials.customHeaders) {
      Object.assign(headers, this.credentials.customHeaders);
    }

    return headers;
  }

  /**
   * Refresh authentication token if needed
   * @returns True if refresh was successful or not needed
   */
  public async refreshToken(): Promise<boolean> {
    logger.debug('Checking if token refresh is needed');

    if (!this.authResult || !this.authResult.success) {
      logger.warn('Cannot refresh token: not authenticated');
      return false;
    }

    // Check if token is close to expiration
    if (this.authResult.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(this.authResult.expiresAt);
      const secondsUntilExpiry = (expiresAt.getTime() - now.getTime()) / 1000;

      if (secondsUntilExpiry > this.config.refreshThreshold) {
        logger.debug('Token refresh not needed', { secondsUntilExpiry });
        return true;
      }

      logger.info('Token refresh needed', { secondsUntilExpiry });
    }

    // Re-authenticate
    if (!this.credentials) {
      logger.error('Cannot refresh: no credentials stored');
      return false;
    }

    try {
      const result = await this.authenticate(this.credentials);
      return result.success;
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Disconnect and clean up
   */
  public disconnect(): void {
    logger.info('Disconnecting from Maximo API');
    this.credentials = null;
    this.axiosInstance = null;
    this.connectionStatus = 'disconnected';
    this.authResult = null;
    logger.info('Disconnected successfully');
  }

  /**
   * Get current connection status
   * @returns Current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Test connection to Maximo API
   * @returns Connection test result
   */
  public async testConnection(): Promise<ConnectionTestResult> {
    logger.info('Testing connection to Maximo API');

    if (!this.credentials) {
      return {
        success: false,
        error: 'Not authenticated. Call authenticate() first.',
      };
    }

    const startTime = Date.now();

    try {
      // Make a simple request to the Maximo API
      const response = await this.makeRequest({
        method: 'GET',
        url: `${this.credentials.host}/maximo/api/whoami`,
        timeout: this.credentials.timeout || 30000,
      });

      const responseTime = Date.now() - startTime;
      const responseData = response.data as Record<string, unknown> | undefined;

      logger.info('Connection test successful', {
        responseTime,
        status: response.status,
      });

      return {
        success: true,
        responseTime,
        version: responseData?.['maximoVersion'] as string | undefined,
        details: {
          status: response.status,
          user: responseData?.['userName'] as string | undefined,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      logger.error('Connection test failed', {
        responseTime,
        error: errorMessage,
      });

      return {
        success: false,
        responseTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate credentials
   * @param credentials - Credentials to validate
   * @throws {InvalidCredentialsError} If credentials are invalid
   */
  private validateCredentials(credentials: MaximoCredentials): void {
    // Validate host
    if (!credentials.host || credentials.host.trim().length === 0) {
      throw new InvalidCredentialsError('Host URL is required');
    }

    // Validate host format
    try {
      new URL(credentials.host);
    } catch {
      throw new InvalidCredentialsError(
        'Invalid host URL format. Must be a valid URL (e.g., https://maximo.example.com)'
      );
    }

    // Validate that at least one authentication method is provided
    const hasApiKey = !!credentials.apiKey;
    const hasBasicAuth = !!(credentials.username && credentials.password);
    const hasCustomHeaders = !!(credentials.customHeaders && Object.keys(credentials.customHeaders).length > 0);

    if (!hasApiKey && !hasBasicAuth && !hasCustomHeaders) {
      throw new InvalidCredentialsError(
        'At least one authentication method is required (API key, username/password, or custom headers)'
      );
    }

    // Validate API key if provided
    if (credentials.apiKey) {
      const validation = this.apiKeyProvider.validateApiKey(credentials.apiKey);
      if (!validation.valid) {
        throw new InvalidCredentialsError(
          `Invalid API key: ${validation.reason}`,
          { suggestions: validation.suggestions }
        );
      }
    }

    // Validate username/password if provided
    if (credentials.username && !credentials.password) {
      throw new InvalidCredentialsError('Password is required when username is provided');
    }
    if (credentials.password && !credentials.username) {
      throw new InvalidCredentialsError('Username is required when password is provided');
    }
  }

  /**
   * Determine which authentication method to use
   * @param credentials - Credentials to check
   * @returns Authentication method
   */
  private determineAuthMethod(credentials: MaximoCredentials): AuthMethod {
    if (credentials.apiKey) {
      return 'apikey';
    }
    if (credentials.username && credentials.password) {
      return 'basic';
    }
    return 'custom';
  }

  /**
   * Create axios instance with configuration
   */
  private createAxiosInstance(): void {
    if (!this.credentials) {
      throw new InvalidCredentialsError('Credentials not set');
    }

    this.axiosInstance = axios.create({
      baseURL: this.credentials.host,
      timeout: this.credentials.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      httpsAgent: this.config.validateSSL ? undefined : { rejectUnauthorized: false },
    });

    logger.debug('Axios instance created', {
      baseURL: this.credentials.host,
      timeout: this.credentials.timeout || 30000,
    });
  }

  /**
   * Authenticate using API key
   * @param credentials - Credentials with API key
   * @returns Authentication result
   */
  private async authenticateWithApiKey(
    credentials: MaximoCredentials
  ): Promise<AuthenticationResult> {
    if (!credentials.apiKey) {
      throw new InvalidCredentialsError('API key is required');
    }

    try {
      // Test the API key by making a request
      const response = await this.makeRequest({
        method: 'GET',
        url: '/maximo/api/whoami',
        headers: {
          apikey: credentials.apiKey,
        },
      });

      logger.debug('API key auth response', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data as boolean,
      });

      if (response.status === 200) {
        return {
          success: true,
          method: 'apikey',
          token: credentials.apiKey,
        };
      }

      logger.warn('API key authentication failed - unexpected status', {
        status: response.status,
        statusText: response.statusText,
      });

      return {
        success: false,
        error: 'API key authentication failed',
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
        method: 'apikey',
      };
    } catch (error) {
      logger.error('API key authentication error', {
        error: this.extractErrorMessage(error),
      });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Authenticate using basic authentication
   * @param credentials - Credentials with username/password
   * @returns Authentication result
   */
  private async authenticateWithBasicAuth(
    credentials: MaximoCredentials
  ): Promise<AuthenticationResult> {
    if (!credentials.username || !credentials.password) {
      throw new InvalidCredentialsError('Username and password are required');
    }

    try {
      const token = Buffer.from(
        `${credentials.username}:${credentials.password}`
      ).toString('base64');

      const response = await this.makeRequest({
        method: 'GET',
        url: '/maximo/api/whoami',
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (response.status === 200) {
        return {
          success: true,
          method: 'basic',
          token,
        };
      }

      return {
        success: false,
        error: 'Basic authentication failed',
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
        method: 'basic',
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Authenticate using custom headers
   * @param credentials - Credentials with custom headers
   * @returns Authentication result
   */
  private async authenticateWithCustomHeaders(
    credentials: MaximoCredentials
  ): Promise<AuthenticationResult> {
    if (!credentials.customHeaders || Object.keys(credentials.customHeaders).length === 0) {
      throw new InvalidCredentialsError('Custom headers are required');
    }

    try {
      const response = await this.makeRequest({
        method: 'GET',
        url: `${credentials.host}/maximo/api/whoami`,
        headers: credentials.customHeaders,
      });

      if (response.status === 200) {
        return {
          success: true,
          method: 'custom',
        };
      }

      return {
        success: false,
        error: 'Custom header authentication failed',
        errorCode: AuthErrorCode.INVALID_CREDENTIALS,
        method: 'custom',
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Make an HTTP request with retry logic
   * @param config - Axios request configuration
   * @returns Axios response
   */
  private async makeRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (!this.axiosInstance) {
      this.createAxiosInstance();
    }

    const maxRetries = this.credentials?.maxRetries || 3;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (!this.axiosInstance) {
          throw new InvalidCredentialsError('Axios instance not initialized');
        }
        const response = await this.axiosInstance.request(config);
        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on authentication errors
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.retryBaseDelay * Math.pow(2, attempt),
          this.config.retryMaxDelay
        );

        logger.warn(`Request failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries,
          error: this.extractErrorMessage(error),
        });

        await this.sleep(delay);
      }
    }

    throw lastError as Error;
  }

  /**
   * Handle authentication errors
   * @param error - Error to handle
   * @returns AuthenticationError
   */
  private handleAuthError(error: unknown): AuthenticationError {
    if (error instanceof AuthenticationError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        return new ConnectionError(
          `Cannot connect to Maximo host: ${this.credentials?.host}`,
          { code: axiosError.code }
        );
      }

      if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
        return new AuthenticationError(
          'Request timeout',
          AuthErrorCode.TIMEOUT,
          undefined,
          { code: axiosError.code }
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;

        if (status === 401) {
          return new InvalidCredentialsError(
            'Invalid credentials',
            { statusCode: status }
          );
        }

        if (status === 403) {
          return new AuthenticationError(
            'Access forbidden',
            AuthErrorCode.FORBIDDEN,
            status
          );
        }

        return new AuthenticationError(
          `HTTP ${status}: ${axiosError.response.statusText}`,
          AuthErrorCode.UNKNOWN_ERROR,
          status
        );
      }

      return new ConnectionError(
        axiosError.message,
        { code: axiosError.code }
      );
    }

    if (error instanceof Error) {
      return new AuthenticationError(
        error.message,
        AuthErrorCode.UNKNOWN_ERROR,
        undefined,
        { originalError: error.name }
      );
    }

    return new AuthenticationError(
      'Unknown authentication error',
      AuthErrorCode.UNKNOWN_ERROR
    );
  }

  /**
   * Extract error message from various error types
   * @param error - Error to extract message from
   * @returns Error message
   */
  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  /**
   * Sleep for a specified duration
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the axios instance (for advanced usage)
   * @returns Axios instance or null if not created
   */
  public getAxiosInstance(): AxiosInstance | null {
    return this.axiosInstance;
  }

  /**
   * Get authentication result
   * @returns Last authentication result or null
   */
  public getAuthResult(): AuthenticationResult | null {
    return this.authResult;
  }

  /**
   * Check if currently authenticated
   * @returns True if authenticated
   */
  public isAuthenticated(): boolean {
    return this.connectionStatus === 'connected' && this.authResult?.success === true;
  }
}