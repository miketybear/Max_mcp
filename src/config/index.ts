/**
 * Configuration Module for Maximo MCP Server
 * 
 * This module provides centralized configuration management for the entire application.
 * It exports all configuration types, classes, and constants.
 * 
 * @module config
 */

// Export all types
export type {
  Environment,
  LogLevel,
  MaximoConfig,
  CacheConfig,
  RateLimitConfig,
  LoggingConfig,
  AppConfig,
} from './types.js';

// Export constants
export {
  API_ENDPOINTS,
  WORK_ORDER_STATUSES,
  ASSET_STATUSES,
  SR_STATUSES,
  OSLC_OPERATORS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_CACHE_TTL,
  DEFAULT_RATE_LIMIT,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_API_VERSION,
  DEFAULT_MCP_PORT,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_LOG_FILE_PATH,
  HTTP_STATUS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  ERROR_CODES,
} from './constants.js';

// Export type aliases from constants
export type {
  WorkOrderStatus,
  AssetStatus,
  ServiceRequestStatus,
  OslcOperator,
  ApiEndpoint,
  HttpStatusCode,
  ErrorCode,
} from './constants.js';

// Export configuration classes
export { EnvironmentConfig } from './environment.js';
export { MaximoConfiguration } from './maximo-config.js';
export { ConfigManager } from './config-manager.js';

// Export ConfigManager as default
export { default } from './config-manager.js';