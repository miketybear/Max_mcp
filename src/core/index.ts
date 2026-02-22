/**
 * Core HTTP Client Module
 * Exports all public interfaces and classes for the HTTP client
 */

// Export types
export type {
  HttpMethod,
  RequestConfig,
  ApiResponse,
  PaginationMetadata,
  RetryConfig,
  CacheConfig,
  RateLimitConfig,
  ClientConfig,
  OSLCQueryParams,
  OSLCResponse,
  RequestContext,
  CacheEntry,
  CacheStats,
  RateLimitState,
} from './types';

// Export classes and enums (not types)
export {
  HttpError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  ErrorCode,
} from './types';

// Export error handler
export { ErrorHandler, errorHandler } from './error-handler';

// Export response formatter
export { ResponseFormatter, responseFormatter } from './response-formatter';

// Export rate limiter
export { RateLimiter, rateLimiter } from './rate-limiter';

// Export cache manager
export { CacheManager, cacheManager } from './cache-manager';

// Export main HTTP client
export { MaximoClient } from './maximo-client';