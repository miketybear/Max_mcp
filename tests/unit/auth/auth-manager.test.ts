/**
 * Unit tests for Authentication Manager
 */

import axios from 'axios';
import { AuthManager } from '../../../src/auth/auth-manager';
import { ApiKeyProvider } from '../../../src/auth/api-key-provider';
import {
  MaximoCredentials,
  InvalidCredentialsError,
  ConnectionError,
  AuthenticationError,
  AuthErrorCode,
} from '../../../src/auth/types';
import {
  createMockCredentials,
  createMockAxiosResponse,
  createMockAxiosError,
} from '../../fixtures/test-helpers';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios> & { isAxiosError: jest.Mock };

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
  sanitizeLogData: jest.fn((data) => data),
}));

describe('AuthManager', () => {
  let authManager: AuthManager;
  let mockApiKeyProvider: jest.Mocked<ApiKeyProvider>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock API key provider
    mockApiKeyProvider = {
      validateApiKey: jest.fn().mockReturnValue({ valid: true }),
      getApiKey: jest.fn(),
      rotateApiKey: jest.fn(),
      isExpired: jest.fn().mockReturnValue(false),
      clearApiKey: jest.fn(),
      getKeyInfo: jest.fn(),
      loadFromEnvironment: jest.fn(),
      ensureValidKey: jest.fn(),
    } as any;

    // Create mock axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    // Mock axios.isAxiosError to detect our mock errors
    (mockedAxios.isAxiosError as jest.Mock) = jest.fn((error: any) => error?.isAxiosError === true);

    authManager = new AuthManager(mockApiKeyProvider);
  });

  describe('constructor', () => {
    it('should create AuthManager with default provider', () => {
      const manager = new AuthManager();
      expect(manager).toBeInstanceOf(AuthManager);
    });

    it('should create AuthManager with custom provider', () => {
      const manager = new AuthManager(mockApiKeyProvider);
      expect(manager).toBeInstanceOf(AuthManager);
    });

    it('should create AuthManager with custom config', () => {
      const manager = new AuthManager(mockApiKeyProvider, {
        autoRefresh: false,
        refreshThreshold: 600,
      });
      expect(manager).toBeInstanceOf(AuthManager);
    });
  });

  describe('authenticate', () => {
    describe('with API key', () => {
      it('should authenticate successfully with API key', async () => {
        const credentials = createMockCredentials();
        mockAxiosInstance.request.mockResolvedValue(
          createMockAxiosResponse({ userName: 'testuser' }, 200)
        );

        const result = await authManager.authenticate(credentials);

        expect(result.success).toBe(true);
        expect(result.method).toBe('apikey');
        expect(result.token).toBe(credentials.apiKey);
        expect(mockAxiosInstance.request).toHaveBeenCalled();
      });

      it('should fail authentication with invalid API key', async () => {
        const credentials = createMockCredentials();
        mockAxiosInstance.request.mockResolvedValue(
          createMockAxiosResponse({}, 401)
        );

        const result = await authManager.authenticate(credentials);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      });
    });

    describe('with basic auth', () => {
      it('should authenticate successfully with username/password', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
          username: 'testuser',
          password: 'testpass',
        });
        mockAxiosInstance.request.mockResolvedValue(
          createMockAxiosResponse({ userName: 'testuser' }, 200)
        );

        const result = await authManager.authenticate(credentials);

        expect(result.success).toBe(true);
        expect(result.method).toBe('basic');
        expect(result.token).toBeDefined();
      });

      it('should fail authentication with invalid credentials', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
          username: 'testuser',
          password: 'wrongpass',
        });
        mockAxiosInstance.request.mockResolvedValue(
          createMockAxiosResponse({}, 401)
        );

        const result = await authManager.authenticate(credentials);

        expect(result.success).toBe(false);
      });
    });

    describe('with custom headers', () => {
      it('should authenticate successfully with custom headers', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
          customHeaders: { 'X-Custom-Auth': 'custom-token' },
        });
        mockAxiosInstance.request.mockResolvedValue(
          createMockAxiosResponse({ userName: 'testuser' }, 200)
        );

        const result = await authManager.authenticate(credentials);

        expect(result.success).toBe(true);
        expect(result.method).toBe('custom');
      });
    });

    describe('validation', () => {
      it('should throw error for missing host', async () => {
        const credentials = { ...createMockCredentials(), host: '' };

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });

      it('should throw error for invalid host URL', async () => {
        const credentials = { ...createMockCredentials(), host: 'not-a-url' };

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });

      it('should throw error when no auth method provided', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
        });

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });

      it('should throw error for invalid API key format', async () => {
        const credentials = createMockCredentials({ apiKey: 'short' });
        mockApiKeyProvider.validateApiKey.mockReturnValue({
          valid: false,
          reason: 'API key is too short',
        });

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });

      it('should throw error when username provided without password', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
          username: 'testuser',
          password: undefined,
        });

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });

      it('should throw error when password provided without username', async () => {
        const credentials = createMockCredentials({
          apiKey: undefined,
          username: undefined,
          password: 'testpass',
        });

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          InvalidCredentialsError
        );
      });
    });

    describe('error handling', () => {
      it('should handle connection refused error', async () => {
        const credentials = createMockCredentials();
        mockAxiosInstance.request.mockRejectedValue(
          createMockAxiosError('Connection refused', 'ECONNREFUSED')
        );

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          ConnectionError
        );
      });

      it('should handle timeout error', async () => {
        const credentials = createMockCredentials();
        mockAxiosInstance.request.mockRejectedValue(
          createMockAxiosError('Timeout', 'ETIMEDOUT')
        );

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          AuthenticationError
        );
      });

      it('should handle 403 forbidden error', async () => {
        const credentials = createMockCredentials();
        mockAxiosInstance.request.mockRejectedValue(
          createMockAxiosError('Forbidden', undefined, 403)
        );

        await expect(authManager.authenticate(credentials)).rejects.toThrow(
          AuthenticationError
        );
      });
    });
  });

  describe('getAuthHeaders', () => {
    it('should throw error when not authenticated', () => {
      expect(() => authManager.getAuthHeaders()).toThrow(
        InvalidCredentialsError
      );
    });

    it('should return API key header', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      const headers = authManager.getAuthHeaders();

      expect(headers.apikey).toBe(credentials.apiKey);
    });

    it('should return basic auth header', async () => {
      const credentials = createMockCredentials({
        apiKey: undefined,
        username: 'testuser',
        password: 'testpass',
      });
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      const headers = authManager.getAuthHeaders();

      expect(headers.Authorization).toContain('Basic ');
    });

    it('should include custom headers', async () => {
      const credentials = createMockCredentials({
        customHeaders: { 'X-Custom': 'value' },
      });
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      const headers = authManager.getAuthHeaders();

      expect(headers['X-Custom']).toBe('value');
    });
  });

  describe('refreshToken', () => {
    it('should return false when not authenticated', async () => {
      const result = await authManager.refreshToken();
      expect(result).toBe(false);
    });

    it('should return true when token is not close to expiration', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      const result = await authManager.refreshToken();

      expect(result).toBe(true);
    });

    it('should refresh token when close to expiration', async () => {
      const credentials = createMockCredentials();
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 100); // 100 seconds from now

      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      
      // Manually set expiration
      const authResult = authManager.getAuthResult();
      if (authResult) {
        authResult.expiresAt = futureDate;
      }

      const result = await authManager.refreshToken();
      expect(result).toBe(true);
    });

    it('should return false when refresh fails', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request
        .mockResolvedValueOnce(createMockAxiosResponse({ userName: 'testuser' }, 200))
        .mockRejectedValueOnce(new Error('Refresh failed'));

      await authManager.authenticate(credentials);
      const result = await authManager.refreshToken();

      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should clear authentication state', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      authManager.disconnect();

      expect(authManager.getConnectionStatus()).toBe('disconnected');
      expect(authManager.isAuthenticated()).toBe(false);
      expect(() => authManager.getAuthHeaders()).toThrow();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return disconnected initially', () => {
      expect(authManager.getConnectionStatus()).toBe('disconnected');
    });

    it('should return connected after successful authentication', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      expect(authManager.getConnectionStatus()).toBe('connected');
    });

    it('should return error after failed authentication', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Auth failed', undefined, 401)
      );

      try {
        await authManager.authenticate(credentials);
      } catch (error) {
        // Expected
      }

      expect(authManager.getConnectionStatus()).toBe('error');
    });
  });

  describe('testConnection', () => {
    it('should return error when not authenticated', async () => {
      const result = await authManager.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('should return success for valid connection', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({
          userName: 'testuser',
          maximoVersion: '7.6.1.2',
        }, 200)
      );

      await authManager.authenticate(credentials);
      const result = await authManager.testConnection();

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.version).toBe('7.6.1.2');
    });

    it('should return error for failed connection', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request
        .mockResolvedValueOnce(createMockAxiosResponse({ userName: 'testuser' }, 200))
        .mockRejectedValueOnce(new Error('Connection failed'));

      await authManager.authenticate(credentials);
      const result = await authManager.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false initially', () => {
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should return true after successful authentication', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('should return false after disconnect', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      authManager.disconnect();
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      const credentials = createMockCredentials({ maxRetries: 2 });
      mockAxiosInstance.request
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockAxiosResponse({ userName: 'testuser' }, 200));

      const result = await authManager.authenticate(credentials);

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
    }, 30000);

    it('should not retry on 401 errors', async () => {
      const credentials = createMockCredentials({ maxRetries: 2 });
      const error401 = createMockAxiosError('Unauthorized', undefined, 401);
      mockAxiosInstance.request.mockRejectedValue(error401);

      await expect(authManager.authenticate(credentials)).rejects.toThrow();
      // The auth manager checks axios.isAxiosError && response?.status === 401
      // to skip retries on 401 errors
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    }, 30000);

    it('should fail after max retries', async () => {
      const credentials = createMockCredentials({ maxRetries: 2 });
      mockAxiosInstance.request.mockRejectedValue(new Error('Network error'));

      await expect(authManager.authenticate(credentials)).rejects.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 30000);
  });

  describe('getAxiosInstance', () => {
    it('should return null before authentication', () => {
      expect(authManager.getAxiosInstance()).toBeNull();
    });

    it('should return axios instance after authentication', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      expect(authManager.getAxiosInstance()).toBe(mockAxiosInstance);
    });
  });

  describe('getAuthResult', () => {
    it('should return null before authentication', () => {
      expect(authManager.getAuthResult()).toBeNull();
    });

    it('should return auth result after authentication', async () => {
      const credentials = createMockCredentials();
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ userName: 'testuser' }, 200)
      );

      await authManager.authenticate(credentials);
      const result = authManager.getAuthResult();

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
    });
  });
});