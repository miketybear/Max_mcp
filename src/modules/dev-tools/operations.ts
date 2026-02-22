/**
 * Development Tools Operations
 * Business logic for development and testing tools
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse } from '../../core/types';
import { API_ENDPOINTS } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  ConnectionTestResult,
  ApiEndpointInfo,
  SchemaInfo,
  HealthCheckResult,
  MetadataInfo,
} from './types';
import {
  connectionTestSchema,
  apiExploreSchema,
  schemaInspectSchema,
  metadataSchema,
} from './validators';

const logger = createLogger('DevToolsOperations');

/**
 * Development Tools Operations class
 */
export class DevToolsOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('DevToolsOperations initialized');
  }

  /**
   * Test API connection
   */
  async testConnection(environment?: string): Promise<ApiResponse<ConnectionTestResult>> {
    logger.info('Testing connection', { environment });

    try {
      connectionTestSchema.parse({ environment });

      const startTime = Date.now();
      const response = await this.client.get('/maximo/api/whoami');
      const responseTime = Date.now() - startTime;

      const result: ConnectionTestResult = {
        connected: response.success,
        responseTime,
        authenticated: response.success,
        version: (response.data as any)?.maximoversion,
        error: response.error,
      };

      logger.info('Connection test completed', result);

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `conn-test-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Connection test failed', { error });
      throw error;
    }
  }

  /**
   * Explore API endpoints
   */
  async exploreApi(objectStructure?: string): Promise<ApiResponse<ApiEndpointInfo[]>> {
    logger.info('Exploring API', { objectStructure });

    try {
      apiExploreSchema.parse({ objectStructure });

      const endpoints: ApiEndpointInfo[] = [];

      if (objectStructure) {
        // Explore specific object structure
        endpoints.push({
          path: `/maximo/api/os/${objectStructure}`,
          methods: ['GET', 'POST'],
          description: `Query and create ${objectStructure} records`,
          objectStructure,
        });
      } else {
        // List all known endpoints
        Object.entries(API_ENDPOINTS).forEach(([key, path]) => {
          endpoints.push({
            path,
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            description: `${key} operations`,
            objectStructure: path.split('/').pop(),
          });
        });
      }

      logger.info('API exploration completed', { count: endpoints.length });

      return {
        success: true,
        data: endpoints,
        statusCode: 200,
        headers: {},
        requestId: `api-explore-${Date.now()}`,
      };
    } catch (error) {
      logger.error('API exploration failed', { error });
      throw error;
    }
  }

  /**
   * Inspect object structure schema
   */
  async inspectSchema(objectStructure: string): Promise<ApiResponse<SchemaInfo>> {
    logger.info('Inspecting schema', { objectStructure });

    try {
      const validated = schemaInspectSchema.parse({ objectStructure });

      // Query for schema metadata
      const response = await this.client.get(
        `/maximo/api/os/${validated.objectStructure}?oslc.pageSize=1`
      );

      const schema: SchemaInfo = {
        objectStructure: validated.objectStructure,
        fields: [],
      };

      // Extract field information from sample record
      if (response.success && (response.data as any)?.member?.[0]) {
        const sample = (response.data as any).member[0];
        schema.fields = Object.keys(sample).map((key) => ({
          name: key,
          type: typeof sample[key],
          description: `Field: ${key}`,
        }));
      }

      logger.info('Schema inspection completed');

      return {
        success: true,
        data: schema,
        statusCode: 200,
        headers: {},
        requestId: `schema-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Schema inspection failed', { error });
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<HealthCheckResult>> {
    logger.info('Performing health check');

    try {
      const checks: HealthCheckResult['checks'] = [];
      const startTime = Date.now();

      // Check API connectivity
      const connResult = await this.testConnection();
      checks.push({
        name: 'API Connectivity',
        status: connResult.data?.connected || false,
        message: connResult.data?.error,
      });

      // Check authentication
      checks.push({
        name: 'Authentication',
        status: connResult.data?.authenticated || false,
      });

      const responseTime = Date.now() - startTime;
      const allHealthy = checks.every((c) => c.status);

      const result: HealthCheckResult = {
        status: allHealthy ? 'healthy' : 'unhealthy',
        apiConnectivity: checks[0]?.status || false,
        authenticationStatus: checks[1]?.status || false,
        responseTime,
        checks,
        timestamp: new Date().toISOString(),
      };

      logger.info('Health check completed', result);

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `health-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Health check failed', { error });
      throw error;
    }
  }

  /**
   * Get metadata for object structure
   */
  async getMetadata(objectStructure: string): Promise<ApiResponse<MetadataInfo>> {
    logger.info('Getting metadata', { objectStructure });

    try {
      const validated = metadataSchema.parse({ objectStructure });

      const result: MetadataInfo = {
        objectStructure: validated.objectStructure,
        metadata: {
          endpoint: `/maximo/api/os/${validated.objectStructure}`,
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
        operations: ['query', 'create', 'update', 'delete'],
      };

      logger.info('Metadata retrieved successfully');

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `metadata-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get metadata', { error });
      throw error;
    }
  }

  /**
   * List available endpoints
   */
  async listEndpoints(): Promise<ApiResponse<ApiEndpointInfo[]>> {
    return this.exploreApi();
  }
}
