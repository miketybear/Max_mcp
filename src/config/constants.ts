/**
 * Application Constants for Maximo MCP Server
 * 
 * This module defines all constant values used throughout the application,
 * including API endpoints, status codes, operators, and default values.
 */

/**
 * Maximo API endpoints
 * These are the standard Maximo REST API object structure endpoints
 */
export const API_ENDPOINTS = {
  WORK_ORDERS: '/maximo/api/os/mxwodetail',
  ASSETS: '/maximo/api/os/mxasset',
  INVENTORY: '/maximo/api/os/mxinventory',
  ITEMS: '/maximo/api/os/mxitem',
  INVTRANS: '/maximo/api/os/mxinvtrans',
  SERVICE_REQUESTS: '/maximo/api/os/mxsr',
  LOCATIONS: '/maximo/api/os/mxlocation',
  PERSONS: '/maximo/api/os/mxperson',
  LABOR: '/maximo/api/os/mxlabor',
  PURCHASE_ORDERS: '/maximo/api/os/mxpo',
  PM: '/maximo/api/os/mxpm',
  CLASSIFICATIONS: '/maximo/api/os/mxclassification',
  ATTACHMENTS: '/maximo/api/os/mxattachment',
} as const;

/**
 * Valid work order statuses in Maximo
 */
export const WORK_ORDER_STATUSES = [
  'WAPPR',  // Waiting on Approval
  'APPR',   // Approved
  'WSCH',   // Waiting to be Scheduled
  'INPRG',  // In Progress
  'COMP',   // Completed
  'CLOSE',  // Closed
  'CAN',    // Cancelled
] as const;

/**
 * Valid asset statuses in Maximo
 */
export const ASSET_STATUSES = [
  'OPERATING',      // Asset is operating normally
  'NOT READY',      // Asset is not ready for use
  'DECOMMISSIONED', // Asset has been decommissioned
  'MISSING',        // Asset is missing
  'SEALED',         // Asset is sealed
] as const;

/**
 * Valid service request statuses in Maximo
 */
export const SR_STATUSES = [
  'NEW',       // New service request
  'QUEUED',    // Queued for processing
  'INPROG',    // In progress
  'PENDING',   // Pending additional information
  'RESOLVED',  // Resolved
  'CLOSED',    // Closed
  'CANCELLED', // Cancelled
] as const;

/**
 * OSLC (Open Services for Lifecycle Collaboration) query operators
 * Used for building Maximo REST API queries
 */
export const OSLC_OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  LESS_THAN: '<',
  GREATER_THAN: '>',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN_OR_EQUAL: '>=',
  IN: 'in',
  AND: 'and',
  OR: 'or',
} as const;

/**
 * Default page size for paginated API requests
 */
export const DEFAULT_PAGE_SIZE = 100;

/**
 * Maximum page size allowed for paginated API requests
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Default cache time-to-live in seconds (5 minutes)
 */
export const DEFAULT_CACHE_TTL = 300;

/**
 * Default rate limit: maximum requests per minute
 */
export const DEFAULT_RATE_LIMIT = 100;

/**
 * Default request timeout in milliseconds (30 seconds)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Default maximum retry attempts for failed requests
 */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Default Maximo API version
 */
export const DEFAULT_API_VERSION = 'v1';

/**
 * Default MCP server port
 */
export const DEFAULT_MCP_PORT = 3000;

/**
 * Default cache maximum size (number of entries)
 */
export const DEFAULT_CACHE_MAX_SIZE = 1000;

/**
 * Default rate limit window in milliseconds (1 minute)
 */
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;

/**
 * Default log file path
 */
export const DEFAULT_LOG_FILE_PATH = './logs/maximo-mcp.log';

/**
 * HTTP status codes commonly used in the application
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common HTTP headers used in Maximo API requests
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  API_KEY: 'apikey',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
} as const;

/**
 * Error codes used throughout the application
 */
export const ERROR_CODES = {
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * Type exports for const assertions
 */
export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];
export type AssetStatus = typeof ASSET_STATUSES[number];
export type ServiceRequestStatus = typeof SR_STATUSES[number];
export type OslcOperator = typeof OSLC_OPERATORS[keyof typeof OSLC_OPERATORS];
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];