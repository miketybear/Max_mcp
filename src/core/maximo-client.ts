/**
 * Maximo HTTP Client
 * Main HTTP client for communicating with Maximo API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import https from 'https';
import http from 'http';
import { createLogger, sanitizeLogData } from '../utils/logger';

// Declare global setTimeout for TypeScript
declare const setTimeout: (callback: () => void, ms: number) => NodeJS.Timeout;
import { AuthManager } from '../auth/auth-manager';
import { ErrorHandler } from './error-handler';
import { ResponseFormatter } from './response-formatter';
import { RateLimiter } from './rate-limiter';
import { CacheManager } from './cache-manager';
import {
  RequestConfig,
  ApiResponse,
  ClientConfig,
  RetryConfig,
  RequestContext,
} from './types';

const logger = createLogger('MaximoClient');

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  maxRetryDelay: 30000,
};

/**
 * Default client configuration
 */
const DEFAULT_CLIENT_CONFIG: Required<Omit<ClientConfig, 'baseURL' | 'defaultHeaders'>> = {
  timeout: 30000,
  retry: DEFAULT_RETRY_CONFIG,
  cache: {
    enabled: false,
    ttl: 300,
    maxSize: 1000,
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  enableLogging: true,
  validateSSL: true,
  connectionPool: {
    keepAlive: true,
    maxSockets: 10,
    maxFreeSockets: 5,
  },
};

/**
 * Maximo HTTP Client class
 * Provides HTTP communication with Maximo API
 */
export class MaximoClient {
  private authManager: AuthManager;
  private axiosInstance: AxiosInstance;
  private errorHandler: ErrorHandler;
  private responseFormatter: ResponseFormatter;
  private rateLimiter: RateLimiter;
  private cacheManager: CacheManager;
  private config: Required<Omit<ClientConfig, 'baseURL' | 'defaultHeaders'>>;
  private defaultHeaders: Record<string, string>;

  /**
   * Create a new Maximo HTTP Client
   * @param authManager - Authentication manager instance
   * @param config - Optional client configuration
   */
  constructor(authManager: AuthManager, config?: ClientConfig) {
    this.authManager = authManager;
    this.config = {
      ...DEFAULT_CLIENT_CONFIG,
      ...config,
      retry: { ...DEFAULT_CLIENT_CONFIG.retry, ...config?.retry },
      cache: { ...DEFAULT_CLIENT_CONFIG.cache, ...config?.cache },
      rateLimit: { ...DEFAULT_CLIENT_CONFIG.rateLimit, ...config?.rateLimit },
      connectionPool: {
        ...DEFAULT_CLIENT_CONFIG.connectionPool,
        ...config?.connectionPool,
      },
    };

    this.defaultHeaders = config?.defaultHeaders || {};

    // Initialize utility classes
    this.errorHandler = new ErrorHandler();
    this.responseFormatter = new ResponseFormatter();
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
    this.cacheManager = new CacheManager(this.config.cache);

    // Create axios instance
    this.axiosInstance = this.createAxiosInstance(config?.baseURL);

    // Set up interceptors
    this.setupInterceptors();

    logger.info('MaximoClient initialized', {
      config: sanitizeLogData(this.config as unknown as Record<string, unknown>),
    });
  }

  /**
   * Make an HTTP request with full control
   * @param config - Request configuration
   * @returns API response
   */
  public async request<T = unknown>(config: RequestConfig): Promise<ApiResponse<T>> {
    const requestId = config.requestId || this.responseFormatter.generateRequestId();
    const startTime = Date.now();

    const context: RequestContext = {
      requestId,
      method: config.method,
      url: config.url,
      startTime,
    };

    try {
      // Check rate limit (unless skipped)
      if (!config.skipRateLimit) {
        const rateLimitKey = this.getRateLimitKey(config.url);
        this.rateLimiter.checkLimit(rateLimitKey);
      }

      // Check cache for GET requests
      if (config.method === 'GET' && config.cache !== false) {
        const cacheKey = this.cacheManager.generateKey(config.url, config.params);
        const cached = this.cacheManager.get<T>(cacheKey);

        if (cached !== undefined) {
          logger.debug('Returning cached response', { requestId, url: config.url });
          return this.responseFormatter.formatSuccess(
            cached,
            200,
            {},
            requestId,
            Date.now() - startTime
          );
        }
      }

      // Make the request with retry logic
      const response = await this.makeRequestWithRetry<T>(config, context);

      // Record request for rate limiting
      if (!config.skipRateLimit) {
        const rateLimitKey = this.getRateLimitKey(config.url);
        this.rateLimiter.recordRequest(rateLimitKey);
      }

      // Cache successful GET responses
      if (
        config.method === 'GET' &&
        config.cache !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        const cacheKey = this.cacheManager.generateKey(config.url, config.params);
        const cacheTTL = config.cacheTTL || this.config.cache.ttl;
        this.cacheManager.set(cacheKey, response.data, cacheTTL);
      }

      // Format and return response
      const duration = Date.now() - startTime;
      const extractedData = this.responseFormatter.extractData<T>(response);

      return this.responseFormatter.formatSuccess(
        extractedData,
        response.status,
        response.headers as Record<string, unknown>,
        requestId,
        duration
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const handledError = this.errorHandler.handleError(error, {
        url: config.url,
        method: config.method,
        requestId,
      });

      logger.error('Request failed', {
        requestId,
        url: config.url,
        method: config.method,
        error: handledError.message,
        duration,
      });

      return this.responseFormatter.formatError(
        handledError,
        handledError.statusCode,
        requestId
      );
    }
  }

  /**
   * Make a GET request
   * @param url - Request URL
   * @param params - Query parameters
   * @param config - Optional request configuration
   * @returns API response
   */
  public async get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config,
    });
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns API response
   */
  public async post<T>(
    url: string,
    data: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns API response
   */
  public async put<T>(
    url: string,
    data: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config,
    });
  }

  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns API response
   */
  public async patch<T>(
    url: string,
    data: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config,
    });
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns API response
   */
  public async delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }

  /**
   * Build a full URL with query parameters
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Full URL with query string
   */
  public buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');

    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}${queryString}`;
  }

  /**
   * Set default headers for all requests
   * @param headers - Headers to set
   */
  public setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    logger.debug('Default headers updated', {
      headers: sanitizeLogData(headers),
    });
  }

  /**
   * Get the underlying axios instance
   * @returns Axios instance
   */
  public getClient(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Get cache manager instance
   * @returns Cache manager
   */
  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Get rate limiter instance
   * @returns Rate limiter
   */
  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  /**
   * Create axios instance with configuration
   * @param baseURL - Optional base URL
   * @returns Axios instance
   */
  private createAxiosInstance(baseURL?: string): AxiosInstance {
    const httpsAgent = new https.Agent({
      keepAlive: this.config.connectionPool.keepAlive,
      maxSockets: this.config.connectionPool.maxSockets,
      maxFreeSockets: this.config.connectionPool.maxFreeSockets,
      rejectUnauthorized: this.config.validateSSL,
    });

    const httpAgent = new http.Agent({
      keepAlive: this.config.connectionPool.keepAlive,
      maxSockets: this.config.connectionPool.maxSockets,
      maxFreeSockets: this.config.connectionPool.maxFreeSockets,
    });

    return axios.create({
      baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.defaultHeaders,
      },
      httpsAgent,
      httpAgent,
      validateStatus: () => true, // Don't throw on any status code
    });
  }

  /**
   * Set up request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication headers
        try {
          const authHeaders = this.authManager.getAuthHeaders();
          Object.entries(authHeaders).forEach(([key, value]) => {
            if (value !== undefined) {
              config.headers.set(key, value);
            }
          });
        } catch (error) {
          logger.warn('Failed to add auth headers', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Log request
        if (this.config.enableLogging) {
          logger.debug('Outgoing request', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params ? sanitizeLogData(config.params as Record<string, unknown>) : undefined,
          });
        }

        return config;
      },
      (error: unknown) => {
        logger.error('Request interceptor error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response
        if (this.config.enableLogging) {
          logger.debug('Incoming response', {
            status: response.status,
            url: response.config.url,
          });
        }

        return response;
      },
      (error: unknown) => {
        // Log error
        if (this.config.enableLogging) {
          const axiosError = error as { message?: string; response?: { status?: number }; config?: { url?: string } };
          logger.error('Response error', {
            message: axiosError.message,
            status: axiosError.response?.status,
            url: axiosError.config?.url,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make request with retry logic
   * @param config - Request configuration
   * @param context - Request context
   * @returns Axios response
   */
  private async makeRequestWithRetry<T>(
    config: RequestConfig,
    context: RequestContext
  ): Promise<AxiosResponse<T>> {
    const maxRetries = config.retries ?? this.config.retry?.maxRetries ?? 3;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        context.retryCount = attempt;

        // Build axios config
        const axiosConfig: AxiosRequestConfig = {
          method: config.method,
          url: config.url,
          headers: config.headers,
          params: config.params,
          data: config.data,
          timeout: config.timeout || this.config.timeout,
        };

        // Make request
        const response = await this.axiosInstance.request<T>(axiosConfig);

        // Check if response indicates success
        if (response.status >= 200 && response.status < 300) {
          return response;
        }

        // Check if we should retry based on status code
        const retryableStatusCodes = this.config.retry?.retryableStatusCodes ?? [408, 429, 500, 502, 503, 504];
        if (
          attempt < maxRetries &&
          retryableStatusCodes.includes(response.status)
        ) {
          const delay = this.calculateRetryDelay(attempt);
          logger.warn('Request failed, retrying', {
            requestId: context.requestId,
            attempt: attempt + 1,
            maxRetries,
            status: response.status,
            delay,
          });
          await this.sleep(delay);
          continue;
        }

        // Return response even if not successful (will be handled as error)
        return response;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt < maxRetries && this.errorHandler.isRetryableError(error)) {
          const delay = this.calculateRetryDelay(attempt);
          logger.warn('Request failed, retrying', {
            requestId: context.requestId,
            attempt: attempt + 1,
            maxRetries,
            error: error instanceof Error ? error.message : 'Unknown error',
            delay,
          });
          await this.sleep(delay);
          continue;
        }

        // No more retries, throw error
        throw error;
      }
    }

    // All retries exhausted
    throw lastError as Error;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param attempt - Current attempt number (0-based)
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(attempt: number): number {
    const retryDelay = this.config.retry?.retryDelay ?? 1000;
    const backoffMultiplier = this.config.retry?.backoffMultiplier ?? 2;
    const maxRetryDelay = this.config.retry?.maxRetryDelay ?? 30000;
    
    const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxRetryDelay);
  }

  /**
   * Sleep for specified duration
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      // Prevent timer from keeping process alive
      if (timer && typeof timer === 'object' && 'unref' in timer) {
        timer.unref();
      }
    });
  }

  /**
   * Get rate limit key for a URL
   * @param url - Request URL
   * @returns Rate limit key
   */
  private getRateLimitKey(url: string): string {
    // Extract endpoint path for rate limiting
    try {
      // Use simple string parsing instead of URL constructor
      const pathMatch = url.match(/^(?:https?:\/\/[^/]+)?([^?#]*)/);
      return pathMatch && pathMatch[1] ? pathMatch[1] : url;
    } catch {
      return url;
    }
  }
}