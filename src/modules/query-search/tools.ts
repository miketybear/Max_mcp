/**
 * MCP Tools for Query and Search Module
 * Defines 4 MCP tools for querying and searching Maximo data
 */

import { QuerySearchOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('QuerySearchTools');

/**
 * Create MCP tools for query and search operations
 */
export function createQuerySearchTools(operations: QuerySearchOperations) {
  return [
    // Tool 1: OSLC Query
    {
      name: 'maximo_query',
      description:
        'Execute OSLC query against any Maximo object structure. ' +
        'Supports SELECT, WHERE, ORDER BY, pagination, and search terms.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name (mxwodetail, mxasset, mxsr, etc.)',
          },
          select: {
            type: 'string',
            description: 'Comma-separated list of fields to return (optional)',
          },
          where: {
            type: 'string',
            description: 'OSLC WHERE clause filter (e.g., status="WAPPR" and priority<3)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (+field for ASC, -field for DESC)',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (optional, default: 100, max: 1000)',
          },
          pageNum: {
            type: 'number',
            description: 'Page number (optional, default: 1)',
          },
          searchTerms: {
            type: 'string',
            description: 'Search terms for full-text search (optional)',
          },
        },
        required: ['objectStructure'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling query request', { objectStructure: args.objectStructure });

          const result = await operations.query(args);

          return {
            success: result.success,
            data: result.data,
            count: result.data?.member?.length || 0,
            totalCount: result.data?.responseInfo?.totalCount || result.data?.totalCount,
            message: result.success
              ? `Query returned ${result.data?.member?.length || 0} result(s)`
              : 'Query failed',
            error: result.error,
          };
        } catch (error) {
          logger.error('Query tool error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Advanced Search
    {
      name: 'maximo_advanced_search',
      description:
        'Advanced search with multiple filter conditions. ' +
        'Combine multiple filters with AND/OR operators.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name',
          },
          filters: {
            type: 'array',
            description: 'Array of filter conditions',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  description: 'Field name',
                },
                operator: {
                  type: 'string',
                  enum: ['=', '!=', '<', '>', '<=', '>=', 'in', 'like'],
                  description: 'Comparison operator',
                },
                value: {
                  description: 'Value to compare (string, number, array for "in")',
                },
              },
              required: ['field', 'operator', 'value'],
            },
          },
          operator: {
            type: 'string',
            enum: ['AND', 'OR'],
            description: 'Logical operator to combine filters (default: AND)',
          },
          select: {
            type: 'string',
            description: 'Fields to select (optional)',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (optional)',
          },
        },
        required: ['objectStructure', 'filters'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling advanced search request');

          const result = await operations.advancedSearch(args);

          return {
            success: result.success,
            data: result.data,
            count: result.data?.member?.length || 0,
            message: result.success
              ? `Search returned ${result.data?.member?.length || 0} result(s)`
              : 'Search failed',
            error: result.error,
          };
        } catch (error) {
          logger.error('Advanced search tool error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Saved Query
    {
      name: 'maximo_saved_query',
      description:
        'Execute a saved query by name. Saved queries are predefined in Maximo configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          queryname: {
            type: 'string',
            description: 'Saved query name (as defined in Maximo)',
          },
          parameters: {
            type: 'object',
            description: 'Query parameters (optional, depends on saved query definition)',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (optional)',
          },
          pageNum: {
            type: 'number',
            description: 'Page number (optional)',
          },
        },
        required: ['queryname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling saved query request', { queryname: args.queryname });

          const result = await operations.savedQuery(args);

          return {
            success: result.success,
            data: result.data,
            count: result.data?.member?.length || 0,
            message: result.success
              ? `Saved query returned ${result.data?.member?.length || 0} result(s)`
              : 'Saved query failed',
            error: result.error,
          };
        } catch (error) {
          logger.error('Saved query tool error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Query Builder
    {
      name: 'maximo_build_query',
      description:
        'Interactive query builder to construct OSLC queries. ' +
        'Returns formatted query string and validation status.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name',
          },
          interactive: {
            type: 'boolean',
            description: 'Enable interactive mode (optional, default: false)',
          },
          conditions: {
            type: 'array',
            description: 'Predefined filter conditions (optional)',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                operator: {
                  type: 'string',
                  enum: ['=', '!=', '<', '>', '<=', '>=', 'in', 'like'],
                },
                value: {},
              },
              required: ['field', 'operator', 'value'],
            },
          },
        },
        required: ['objectStructure'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling query builder request');

          const result = await operations.buildQuery(args);

          return {
            success: result.success,
            data: result.data,
            message: result.success ? 'Query built successfully' : 'Query build failed',
            error: result.error,
          };
        } catch (error) {
          logger.error('Query builder tool error', { error });
          throw error;
        }
      },
    },
  ];
}
