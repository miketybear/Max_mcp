/**
 * MCP Tools for Development Tools Module
 * Defines 6 MCP tools for development and testing
 */

import { DevToolsOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DevToolsTools');

/**
 * Create MCP tools for development operations
 */
export function createDevTools(operations: DevToolsOperations) {
  return [
    // Tool 1: Test Connection
    {
      name: 'maximo_test_connection',
      description:
        'Test API connectivity to Maximo server. Returns connection status, response time, and authentication status.',
      inputSchema: {
        type: 'object',
        properties: {
          environment: {
            type: 'string',
            description: 'Environment name to test (optional)',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling test connection request');
          const result = await operations.testConnection(args.environment);
          return {
            success: result.success,
            data: result.data,
            message: result.data?.connected
              ? `Connected successfully (${result.data.responseTime}ms)`
              : 'Connection failed',
            error: result.error,
          };
        } catch (error) {
          logger.error('Test connection tool error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Explore API
    {
      name: 'maximo_explore_api',
      description:
        'Explore available API endpoints. Can list all endpoints or explore a specific object structure.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Specific object structure to explore (optional)',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling explore API request');
          const result = await operations.exploreApi(args.objectStructure);
          return {
            success: result.success,
            data: result.data,
            count: result.data?.length || 0,
            message: `Found ${result.data?.length || 0} endpoint(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Explore API tool error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Inspect Schema
    {
      name: 'maximo_inspect_schema',
      description:
        'Inspect the schema of a Maximo object structure. Returns field definitions, types, and relationships.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name to inspect',
          },
        },
        required: ['objectStructure'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling inspect schema request');
          const result = await operations.inspectSchema(args.objectStructure);
          return {
            success: result.success,
            data: result.data,
            fieldCount: result.data?.fields?.length || 0,
            message: `Schema has ${result.data?.fields?.length || 0} field(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Inspect schema tool error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Health Check
    {
      name: 'maximo_health_check',
      description:
        'Perform comprehensive health check on Maximo API. Tests connectivity, authentication, and overall system status.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          logger.info('Handling health check request');
          const result = await operations.healthCheck();
          return {
            success: result.success,
            data: result.data,
            message: `System status: ${result.data?.status}`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Health check tool error', { error });
          throw error;
        }
      },
    },

    // Tool 5: List Endpoints
    {
      name: 'maximo_list_endpoints',
      description:
        'List all available Maximo API endpoints with their supported methods and descriptions.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          logger.info('Handling list endpoints request');
          const result = await operations.listEndpoints();
          return {
            success: result.success,
            data: result.data,
            count: result.data?.length || 0,
            message: `Found ${result.data?.length || 0} endpoint(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('List endpoints tool error', { error });
          throw error;
        }
      },
    },

    // Tool 6: Get Metadata
    {
      name: 'maximo_get_metadata',
      description:
        'Get metadata information for a Maximo object structure including available operations and schema version.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name',
          },
        },
        required: ['objectStructure'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling get metadata request');
          const result = await operations.getMetadata(args.objectStructure);
          return {
            success: result.success,
            data: result.data,
            message: `Metadata retrieved for ${args.objectStructure}`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get metadata tool error', { error });
          throw error;
        }
      },
    },
  ];
}
