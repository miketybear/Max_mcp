/**
 * Type definitions for the Core HTTP Client
 * Defines interfaces and types for HTTP communication with Maximo API
 */

/**
 * HTTP methods supported by the client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration for HTTP requests
 */
export interface RequestConfig {
  /**
   * Request URL (relative to base URL or absolute)
   */
  url: string;

  /**
   * HTTP method
   */
  method: HttpMethod;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Query parameters
   */
  params?: Record<string, unknown>;

  /**
   * Request body data
   */
  data?: unknown;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  retries?: number;

  /**
   * Enable response caching
   * @default false
   */
  cache?: boolean;

  /**
   * Cache TTL in seconds (if caching enabled)
   * @default 300
   */
  cacheTTL?: number;

  /**
   * Skip rate limiting for this request
   * @default false
   */
  skipRateLimit?: boolean;

  /**
   * Custom request ID for tracking
   */
  requestId?: string;
}

/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /**
   * Whether the request was successful
   */
  success: boolean;

  /**
   * Response data (if successful)
   */
  data?: T;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Error code for programmatic handling
   */
  errorCode?: string;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Response headers
   */
  headers: Record<string, unknown>;

  /**
   * Unique request ID for tracking
   */
  requestId: string;

  /**
   * Request duration in milliseconds
   */
  duration?: number;

  /**
   * Pagination metadata (if applicable)
   */
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Total number of items
   */
  totalCount: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Whether there is a next page
   */
  hasNext: boolean;

  /**
   * Whether there is a previous page
   */
  hasPrevious: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries: number;

  /**
   * Initial retry delay in milliseconds
   * @default 1000
   */
  retryDelay: number;

  /**
   * Backoff multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier: number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes: number[];

  /**
   * Maximum retry delay in milliseconds
   * @default 30000
   */
  maxRetryDelay?: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Enable caching
   * @default false
   */
  enabled: boolean;

  /**
   * Default TTL in seconds
   * @default 300
   */
  ttl: number;

  /**
   * Cache key (auto-generated if not provided)
   */
  key?: string;

  /**
   * Maximum cache size in entries
   * @default 1000
   */
  maxSize?: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 100
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs: number;

  /**
   * Per-endpoint rate limits (overrides global limit)
   */
  endpointLimits?: Record<string, { maxRequests: number; windowMs: number }>;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  /**
   * Base URL for API requests
   */
  baseURL?: string;

  /**
   * Default request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Default headers for all requests
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Retry configuration
   */
  retry?: Partial<RetryConfig>;

  /**
   * Cache configuration
   */
  cache?: Partial<CacheConfig>;

  /**
   * Rate limiting configuration
   */
  rateLimit?: Partial<RateLimitConfig>;

  /**
   * Enable request/response logging
   * @default true
   */
  enableLogging?: boolean;

  /**
   * Validate SSL certificates
   * @default true
   */
  validateSSL?: boolean;

  /**
   * Connection pool configuration
   */
  connectionPool?: {
    /**
     * Enable HTTP keep-alive
     * @default true
     */
    keepAlive?: boolean;

    /**
     * Maximum number of sockets per host
     * @default 10
     */
    maxSockets?: number;

    /**
     * Maximum number of free sockets per host
     * @default 5
     */
    maxFreeSockets?: number;
  };
}

/**
 * HTTP error class
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, unknown>,
    public requestId?: string
  ) {
    super(message);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends HttpError {
  constructor(message: string = 'Request timeout', requestId?: string, details?: Record<string, unknown>) {
    super(message, 408, 'TIMEOUT', details, requestId);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends HttpError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number,
    requestId?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 429, 'RATE_LIMITED', details, requestId);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends HttpError {
  constructor(message: string, requestId?: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details, requestId);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error codes for standardized error handling
 */
export enum ErrorCode {
  // Authentication errors (from auth module)
  AUTH_FAILED = 'AUTH_FAILED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // HTTP errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * OSLC query parameters
 */
export interface OSLCQueryParams {
  /**
   * Select specific fields
   * Example: 'wonum,description,status'
   */
  'oslc.select'?: string;

  /**
   * Filter results
   * Example: 'status="APPR"'
   */
  'oslc.where'?: string;

  /**
   * Sort results
   * Example: '+wonum' (ascending) or '-wonum' (descending)
   */
  'oslc.orderBy'?: string;

  /**
   * Page size for pagination
   * @default 100
   */
  'oslc.pageSize'?: number;

  /**
   * Search terms
   */
  'oslc.searchTerms'?: string;

  /**
   * Additional OSLC parameters
   */
  [key: string]: string | number | undefined;
}

/**
 * OSLC response format
 */
export interface OSLCResponse<T = unknown> {
  /**
   * Response metadata
   */
  responseInfo?: {
    href?: string;
    pagenum?: number;
    nextPage?: {
      href: string;
    };
    previousPage?: {
      href: string;
    };
    totalPages?: number;
    totalCount?: number;
  };

  /**
   * Array of member resources
   */
  member?: T[];

  /**
   * Direct resource data (for single resource responses)
   */
  [key: string]: unknown;
}

/**
 * Request context for logging and tracking
 */
export interface RequestContext {
  /**
   * Unique request ID
   */
  requestId: string;

  /**
   * Request method
   */
  method: HttpMethod;

  /**
   * Request URL
   */
  url: string;

  /**
   * Request start time
   */
  startTime: number;

  /**
   * Retry attempt number
   */
  retryCount?: number;

  /**
   * Whether request came from cache
   */
  fromCache?: boolean;
}

/**
 * Cache entry
 */
export interface CacheEntry<T = unknown> {
  /**
   * Cached data
   */
  data: T;

  /**
   * Timestamp when cached
   */
  timestamp: number;

  /**
   * TTL in seconds
   */
  ttl: number;

  /**
   * Cache key
   */
  key: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /**
   * Number of cache hits
   */
  hits: number;

  /**
   * Number of cache misses
   */
  misses: number;

  /**
   * Current cache size
   */
  size: number;

  /**
   * Cache hit rate (0-1)
   */
  hitRate: number;
}

/**
 * Rate limit state
 */
export interface RateLimitState {
  /**
   * Number of requests made in current window
   */
  requestCount: number;

  /**
   * Window start timestamp
   */
  windowStart: number;

  /**
   * Remaining requests in window
   */
  remaining: number;

  /**
   * Time until window resets (milliseconds)
   */
  resetTime: number;
}