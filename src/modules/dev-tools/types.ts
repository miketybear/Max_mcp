/**
 * Type definitions for Development Tools Module
 * Defines interfaces and types for development and testing tools
 */

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  /** Connection successful */
  connected: boolean;

  /** Response time in ms */
  responseTime: number;

  /** Maximo version */
  version?: string;

  /** Authentication status */
  authenticated: boolean;

  /** Error message if failed */
  error?: string;
}

/**
 * API endpoint info
 */
export interface ApiEndpointInfo {
  /** Endpoint path */
  path: string;

  /** HTTP methods supported */
  methods: string[];

  /** Description */
  description?: string;

  /** Object structure */
  objectStructure?: string;
}

/**
 * Schema info
 */
export interface SchemaInfo {
  /** Object structure name */
  objectStructure: string;

  /** Fields/attributes */
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
    maxLength?: number;
    description?: string;
  }>;

  /** Relationships */
  relationships?: Array<{
    name: string;
    type: string;
    target: string;
  }>;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** API connectivity */
  apiConnectivity: boolean;

  /** Authentication status */
  authenticationStatus: boolean;

  /** Response time in ms */
  responseTime: number;

  /** Checks performed */
  checks: Array<{
    name: string;
    status: boolean;
    message?: string;
  }>;

  /** Timestamp */
  timestamp: string;
}

/**
 * Metadata info
 */
export interface MetadataInfo {
  /** Object structure name */
  objectStructure: string;

  /** Metadata details */
  metadata: Record<string, any>;

  /** Available operations */
  operations?: string[];

  /** Schema version */
  version?: string;
}
