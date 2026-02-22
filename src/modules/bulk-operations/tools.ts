/**
 * MCP Tools for Bulk Operations Module
 * Defines 4 MCP tools for bulk operations
 */

import { BulkOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('BulkOperationsTools');

/**
 * Create MCP tools for bulk operations
 */
export function createBulkOperationTools(operations: BulkOperations) {
  return [
    // Tool 1: Bulk Create
    {
      name: 'maximo_bulk_create',
      description:
        'Create multiple records in a single operation. Supports up to 100 records per request. ' +
        'Can continue processing on errors if continueOnError is true.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name (mxwodetail, mxasset, etc.)',
          },
          records: {
            type: 'array',
            description: 'Array of records to create (max 100)',
            items: {
              type: 'object',
              description: 'Record data',
            },
          },
          continueOnError: {
            type: 'boolean',
            description: 'Continue processing if errors occur (default: false)',
          },
        },
        required: ['objectStructure', 'records'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling bulk create request');
          const result = await operations.bulkCreate(args);
          return {
            success: result.success,
            data: result.data,
            message: `Bulk create: ${result.data?.successful}/${result.data?.total} successful`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Bulk create tool error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Bulk Update
    {
      name: 'maximo_bulk_update',
      description:
        'Update multiple records in a single operation. Supports up to 100 records per request.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name',
          },
          updates: {
            type: 'array',
            description: 'Array of updates (max 100)',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Record ID',
                },
                data: {
                  type: 'object',
                  description: 'Updated fields',
                },
              },
              required: ['id', 'data'],
            },
          },
          continueOnError: {
            type: 'boolean',
            description: 'Continue processing if errors occur (default: false)',
          },
        },
        required: ['objectStructure', 'updates'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling bulk update request');
          const result = await operations.bulkUpdate(args);
          return {
            success: result.success,
            data: result.data,
            message: `Bulk update: ${result.data?.successful}/${result.data?.total} successful`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Bulk update tool error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Bulk Delete
    {
      name: 'maximo_bulk_delete',
      description:
        'Delete multiple records in a single operation. Supports up to 100 records per request. ' +
        'WARNING: This action cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          objectStructure: {
            type: 'string',
            description: 'Object structure name',
          },
          ids: {
            type: 'array',
            description: 'Array of record IDs to delete (max 100)',
            items: {
              type: 'string',
            },
          },
          continueOnError: {
            type: 'boolean',
            description: 'Continue processing if errors occur (default: false)',
          },
        },
        required: ['objectStructure', 'ids'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling bulk delete request');
          const result = await operations.bulkDelete(args);
          return {
            success: result.success,
            data: result.data,
            message: `Bulk delete: ${result.data?.successful}/${result.data?.total} successful`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Bulk delete tool error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Batch Process
    {
      name: 'maximo_batch_process',
      description:
        'Process a batch of mixed operations (create, update, delete). ' +
        'Supports transactional mode where all operations roll back on any failure.',
      inputSchema: {
        type: 'object',
        properties: {
          operations: {
            type: 'array',
            description: 'Array of operations (max 50)',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['create', 'update', 'delete'],
                  description: 'Operation type',
                },
                objectStructure: {
                  type: 'string',
                  description: 'Object structure name',
                },
                data: {
                  description: 'Operation data',
                },
              },
              required: ['type', 'objectStructure', 'data'],
            },
          },
          transactional: {
            type: 'boolean',
            description: 'Use transactional mode (rollback all on failure)',
          },
        },
        required: ['operations'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling batch process request');
          const result = await operations.batchProcess(args);
          return {
            success: result.success,
            data: result.data,
            message: `Batch process: ${result.data?.successful}/${result.data?.total} successful${
              result.data?.rolledBack ? ' (rolled back)' : ''
            }`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Batch process tool error', { error });
          throw error;
        }
      },
    },
  ];
}
