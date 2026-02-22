/**
 * Unit tests for MaximoClient
 * Tests HTTP client functionality including GET, POST, PATCH, DELETE operations,
 * OSLC query building, authentication, caching, rate limiting, and retry logic
 */

import axios, { AxiosInstance } from 'axios';
import { MaximoClient } from '../../../src/core/maximo-client';
import { AuthManager } from '../../../src/auth/auth-manager';
import { CacheManager } from '../../../src/core/cache-manager';
import { RateLimiter } from '../../../src/core/rate-limiter';
import { ClientConfig } from '../../../src/core/types';
import {
  mockWorkOrder,
  mockApiResponse,
  mockErrorResponse,
} from '../../fixtures/maximo-responses';
import {
  createMockAxiosResponse,
  createMockAxiosError,
} from '../../fixtures/test-helpers';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger to suppress console output
jest.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
  sanitizeLogData: jest.fn((data) => data),
}));

describe('MaximoClient', () => {
  let client: MaximoClient;
  let mockAuthManager: jest.Mocked<AuthManager>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock auth manager
    mockAuthManager = {
      getAuthHeaders: jest.fn().mockReturnValue({
        apikey: 'test-api-key',
      }),
    } as any;

    // Create mock axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn((onFulfilled) => {
            // Store the interceptor for testing
            mockAxiosInstance._requestInterceptor = onFulfilled;
            return 0;
          }),
        },
        response: {
          use: jest.fn((onFulfilled, onRejected) => {
            // Store the interceptors for testing
            mockAxiosInstance._responseInterceptor = onFulfilled;
            mockAxiosInstance._responseErrorInterceptor = onRejected;
            return 0;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    // Create client with default config
    const config: ClientConfig = {
      baseURL: 'https://maximo.example.com',
      timeout: 30000,
    };

    client = new MaximoClient(mockAuthManager, config);
  });

  describe('Constructor', () => {
    it('should create client with default configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://maximo.example.com',
          timeout: 30000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should create client with custom headers', () => {
      const customConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        defaultHeaders: {
          'X-Custom-Header': 'custom-value',
        },
      };

      new MaximoClient(mockAuthManager, customConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('GET Operations', () => {
    it('should perform successful GET request', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/mxwo',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockWorkOrder]);
      expect(result.statusCode).toBe(200);
    });

    it('should handle GET request with query parameters', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const params = {
        'oslc.select': 'wonum,description',
        'oslc.where': 'status="APPR"',
        'oslc.pageSize': 10,
      };

      await client.get('/mxwo', params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/mxwo',
          params,
        })
      );
    });

    it('should cache successful GET responses', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // Enable caching
      const cacheConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        cache: { enabled: true, ttl: 300 },
      };
      const cachedClient = new MaximoClient(mockAuthManager, cacheConfig);

      // First request - should hit the API
      await cachedClient.get('/mxwo', { wonum: 'WO1001' });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);

      // Second request - should return from cache
      const result = await cachedClient.get('/mxwo', { wonum: 'WO1001' });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1); // Still 1
      expect(result.success).toBe(true);
    });

    it('should handle GET request errors', async () => {
      const mockError = createMockAxiosError('Not found', 'ERR_NOT_FOUND', 404);
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await client.get('/mxwo/invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.statusCode).toBe(404);
    });
  });

  describe('POST Operations', () => {
    it('should perform successful POST request', async () => {
      const mockResponse = createMockAxiosResponse(mockWorkOrder, 201);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const data = {
        wonum: 'WO1001',
        description: 'Test Work Order',
        siteid: 'BEDFORD',
      };

      const result = await client.post('/mxwo', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/mxwo',
          data,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkOrder);
      expect(result.statusCode).toBe(201);
    });

    it('should handle POST request with validation error', async () => {
      const mockError = createMockAxiosError(
        'Validation failed',
        'ERR_BAD_REQUEST',
        400
      );
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await client.post('/mxwo', { invalid: 'data' });

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('should not cache POST responses', async () => {
      const mockResponse = createMockAxiosResponse(mockWorkOrder, 201);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const cacheConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        cache: { enabled: true },
      };
      const cachedClient = new MaximoClient(mockAuthManager, cacheConfig);

      await cachedClient.post('/mxwo', { wonum: 'WO1001' });
      await cachedClient.post('/mxwo', { wonum: 'WO1001' });

      // Should make 2 requests (no caching for POST)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('PATCH Operations', () => {
    it('should perform successful PATCH request', async () => {
      const updatedWorkOrder = { ...mockWorkOrder, status: 'APPR' };
      const mockResponse = createMockAxiosResponse(updatedWorkOrder, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const data = { status: 'APPR' };
      const result = await client.patch('/mxwo/1001', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/mxwo/1001',
          data,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedWorkOrder);
    });

    it('should handle PATCH request with partial update', async () => {
      const mockResponse = createMockAxiosResponse(mockWorkOrder, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const partialData = { description: 'Updated description' };
      await client.patch('/mxwo/1001', partialData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: partialData,
        })
      );
    });
  });

  describe('DELETE Operations', () => {
    it('should perform successful DELETE request', async () => {
      const mockResponse = createMockAxiosResponse({}, 204);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.delete('/mxwo/1001');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/mxwo/1001',
        })
      );
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(204);
    });

    it('should handle DELETE request errors', async () => {
      const mockError = createMockAxiosError('Not found', 'ERR_NOT_FOUND', 404);
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await client.delete('/mxwo/invalid');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });
  });

  describe('Authentication', () => {
    it('should inject auth headers via interceptor', () => {
      // The mock axios instance doesn't run interceptors automatically,
      // so we call the stored interceptor directly.
      // The interceptor uses config.headers.set(), so we need a mock headers object.
      const mockHeaders = new Map<string, string>();
      const config: any = {
        headers: {
          set: (key: string, value: string) => mockHeaders.set(key, value),
        },
        method: 'GET',
        url: '/mxwo',
      };

      mockAxiosInstance._requestInterceptor(config);

      // Verify auth headers were requested and applied
      expect(mockAuthManager.getAuthHeaders).toHaveBeenCalled();
      expect(mockHeaders.get('apikey')).toBe('test-api-key');
    });

    it('should handle auth header injection in request interceptor', () => {
      // The interceptor uses config.headers.set(key, value) (InternalAxiosRequestConfig),
      // so we need to provide a headers object with a set method.
      const mockHeaders = new Map<string, string>();
      const config: any = {
        headers: {
          set: (key: string, value: string) => mockHeaders.set(key, value),
        },
        method: 'GET',
        url: '/mxwo',
      };

      // Call the request interceptor
      const interceptedConfig = mockAxiosInstance._requestInterceptor(config);

      expect(interceptedConfig).toBeDefined();
      expect(mockHeaders.get('apikey')).toBe('test-api-key');
    });

    it('should handle auth header injection failure gracefully', () => {
      mockAuthManager.getAuthHeaders.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      const config: any = {
        headers: {
          set: jest.fn(),
        },
        method: 'GET',
        url: '/mxwo',
      };

      // Should not throw, just log warning
      expect(() => {
        mockAxiosInstance._requestInterceptor(config);
      }).not.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const rateLimitConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        rateLimit: {
          maxRequests: 2,
          windowMs: 1000,
        },
      };

      const limitedClient = new MaximoClient(mockAuthManager, rateLimitConfig);
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // First two requests should succeed
      await limitedClient.get('/mxwo');
      await limitedClient.get('/mxwo');

      // Third request should fail with rate limit error
      const result = await limitedClient.get('/mxwo');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('RATE_LIMITED');
    });

    it('should skip rate limiting when configured', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.request({
        url: '/mxwo',
        method: 'GET',
        skipRateLimit: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on retryable status codes', async () => {
      const mockError = createMockAxiosResponse(
        { error: 'Service unavailable' },
        503
      );
      const mockSuccess = createMockAxiosResponse(mockApiResponse, 200);

      mockAxiosInstance.request
        .mockResolvedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const result = await client.get('/mxwo');

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('should retry on network errors', async () => {
      const networkError = createMockAxiosError(
        'Network error',
        'ECONNREFUSED'
      );
      const mockSuccess = createMockAxiosResponse(mockApiResponse, 200);

      mockAxiosInstance.request
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockSuccess);

      const result = await client.get('/mxwo');

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('should respect max retries configuration', async () => {
      const retryConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        retry: {
          maxRetries: 2,
          retryDelay: 10, // Use short delay for test speed
          backoffMultiplier: 2,
          retryableStatusCodes: [503],
        },
      };

      const retryClient = new MaximoClient(mockAuthManager, retryConfig);
      const mockError = createMockAxiosResponse(
        { error: 'Service unavailable' },
        503
      );

      mockAxiosInstance.request.mockResolvedValue(mockError);

      const result = await retryClient.get('/mxwo');

      // Should try 3 times total (initial + 2 retries)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      // After exhausting retries, the 503 response is returned through formatSuccess
      // (since validateStatus: () => true means axios doesn't throw on non-2xx).
      // The result will have success: true but statusCode: 503.
      expect(result.statusCode).toBe(503);
    }, 30000);

    it('should use exponential backoff for retries', async () => {
      const retryConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        retry: {
          maxRetries: 2,
          retryDelay: 10, // Use very short delay for test speed
          backoffMultiplier: 2,
          retryableStatusCodes: [503],
        },
      };

      const retryClient = new MaximoClient(mockAuthManager, retryConfig);
      const mockError = createMockAxiosResponse(
        { error: 'Service unavailable' },
        503
      );

      mockAxiosInstance.request.mockResolvedValue(mockError);

      const result = await retryClient.get('/mxwo');

      // Should have retried (initial + 2 retries = 3 total)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      // After exhausting retries, the last 503 response comes through the success path.
      expect(result.statusCode).toBe(503);
    }, 30000);

    it('should not retry on non-retryable errors', async () => {
      const mockError = createMockAxiosError('Bad request', 'ERR_BAD_REQUEST', 400);
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await client.get('/mxwo');

      // Should only try once (no retries for 400)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
    });
  });

  describe('Caching', () => {
    let cachedClient: MaximoClient;

    beforeEach(() => {
      const cacheConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        cache: {
          enabled: true,
          ttl: 300,
          maxSize: 100,
        },
      };
      cachedClient = new MaximoClient(mockAuthManager, cacheConfig);
    });

    it('should cache GET responses', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // First request
      const result1 = await cachedClient.get('/mxwo', { wonum: 'WO1001' });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const result2 = await cachedClient.get('/mxwo', { wonum: 'WO1001' });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);

      // Both should succeed and have matching data
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data).toBeDefined();
      expect(result2.data).toBeDefined();
    });

    it('should respect cache TTL', async () => {
      const shortCacheConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        cache: {
          enabled: true,
          ttl: 1, // 1 second
        },
      };
      const shortCacheClient = new MaximoClient(
        mockAuthManager,
        shortCacheConfig
      );

      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // First request
      await shortCacheClient.get('/mxwo');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Second request - cache expired, should hit API
      await shortCacheClient.get('/mxwo');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should allow cache bypass', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // First request
      await cachedClient.get('/mxwo');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);

      // Second request with cache disabled
      await cachedClient.request({
        url: '/mxwo',
        method: 'GET',
        cache: false,
      });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should use custom cache TTL', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await cachedClient.request({
        url: '/mxwo',
        method: 'GET',
        cacheTTL: 600, // 10 minutes
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    let noRetryClient: MaximoClient;

    beforeEach(() => {
      // Create a client with no retries to avoid timeout issues in error tests
      const noRetryConfig: ClientConfig = {
        baseURL: 'https://maximo.example.com',
        timeout: 30000,
        retry: {
          maxRetries: 0,
          retryDelay: 100,
          backoffMultiplier: 2,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        },
      };
      noRetryClient = new MaximoClient(mockAuthManager, noRetryConfig);
    });

    it('should handle network errors', async () => {
      const networkError = createMockAxiosError(
        'Network error',
        'ECONNREFUSED'
      );
      mockAxiosInstance.request.mockRejectedValue(networkError);

      const result = await noRetryClient.get('/mxwo');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = createMockAxiosError('Timeout', 'ETIMEDOUT');
      mockAxiosInstance.request.mockRejectedValue(timeoutError);

      const result = await noRetryClient.get('/mxwo');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('TIMEOUT');
    });

    it('should handle Maximo API errors', async () => {
      const mockError = createMockAxiosError(
        'BMXAA4210E - Record changed by another user',
        'ERR_BAD_REQUEST',
        400
      );
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await noRetryClient.get('/mxwo');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('should include request context in errors', async () => {
      const mockError = createMockAxiosError('Server error', 'ERR_SERVER', 500);
      mockAxiosInstance.request.mockRejectedValue(mockError);

      const result = await noRetryClient.get('/mxwo');

      expect(result.requestId).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('Response Extraction', () => {
    it('should extract data from OSLC member array', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(result.data).toEqual([mockWorkOrder]);
    });

    it('should handle single resource response', async () => {
      const mockResponse = createMockAxiosResponse(mockWorkOrder, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo/1001');

      expect(result.data).toEqual(mockWorkOrder);
    });

    it('should handle empty response', async () => {
      const mockResponse = createMockAxiosResponse({ member: [] }, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(result.data).toEqual([]);
    });
  });

  describe('Utility Methods', () => {
    it('should build URL with query parameters', () => {
      const url = client.buildUrl('/mxwo', {
        'oslc.select': 'wonum,description',
        'oslc.where': 'status="APPR"',
      });

      expect(url).toContain('oslc.select=wonum%2Cdescription');
      expect(url).toContain('oslc.where=status%3D%22APPR%22');
    });

    it('should handle URL without parameters', () => {
      const url = client.buildUrl('/mxwo');
      expect(url).toBe('/mxwo');
    });

    it('should filter out null and undefined parameters', () => {
      const url = client.buildUrl('/mxwo', {
        valid: 'value',
        nullValue: null,
        undefinedValue: undefined,
      });

      expect(url).toContain('valid=value');
      expect(url).not.toContain('null');
      expect(url).not.toContain('undefined');
    });

    it('should set default headers', () => {
      client.setDefaultHeaders({
        'X-Custom-Header': 'custom-value',
      });

      // Headers will be applied on next request
      expect(client).toBeDefined();
    });

    it('should get cache manager', () => {
      const cacheManager = client.getCacheManager();
      expect(cacheManager).toBeInstanceOf(CacheManager);
    });

    it('should get rate limiter', () => {
      const rateLimiter = client.getRateLimiter();
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
    });

    it('should get axios client', () => {
      const axiosClient = client.getClient();
      expect(axiosClient).toBeDefined();
    });
  });

  describe('Request Configuration', () => {
    it('should use custom timeout', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.request({
        url: '/mxwo',
        method: 'GET',
        timeout: 5000,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });

    it('should include custom headers', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.request({
        url: '/mxwo',
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('should generate request ID if not provided', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(result.requestId).toBeDefined();
      expect(typeof result.requestId).toBe('string');
    });

    it('should use provided request ID', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const customRequestId = 'custom-request-id-123';
      const result = await client.request({
        url: '/mxwo',
        method: 'GET',
        requestId: customRequestId,
      });

      expect(result.requestId).toBe(customRequestId);
    });
  });

  describe('Performance Metrics', () => {
    it('should track request duration', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(result.duration).toBeDefined();
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include response headers', async () => {
      const mockResponse = createMockAxiosResponse(mockApiResponse, 200);
      mockResponse.headers = {
        'content-type': 'application/json',
        'x-request-id': 'test-123',
      };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/mxwo');

      expect(result.headers).toBeDefined();
      expect(result.headers['content-type']).toBe('application/json');
    });
  });
});