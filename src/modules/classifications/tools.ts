/**
 * MCP Tools for Classification Module
 * Defines 4 MCP tools for classification management
 */

import { ClassificationOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ClassificationTools');

/**
 * Create MCP tools for classification operations
 * @param operations - ClassificationOperations instance
 * @returns Array of MCP tool definitions
 */
export function createClassificationTools(operations: ClassificationOperations) {
  return [
    // Tool 1: Get Classification
    {
      name: 'maximo_get_classification',
      description:
        'Get classification details by classification structure ID. Returns classification metadata, hierarchy level, and parent information.',
      inputSchema: {
        type: 'object',
        properties: {
          classstructureid: {
            type: 'string',
            description: 'Classification structure ID (required, max 20 characters)',
          },
        },
        required: ['classstructureid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling get classification request', {
            classstructureid: args.classstructureid,
          });

          const result = await operations.get(args.classstructureid);

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? 'Classification retrieved successfully'
              : 'Failed to retrieve classification',
            error: result.error,
          };
        } catch (error) {
          logger.error('Get classification tool error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Get Classification Hierarchy
    {
      name: 'maximo_get_class_hierarchy',
      description:
        'Get classification hierarchy tree starting from a root classification. ' +
        'Recursively retrieves child classifications up to specified levels.',
      inputSchema: {
        type: 'object',
        properties: {
          classstructureid: {
            type: 'string',
            description: 'Root classification structure ID',
          },
          levels: {
            type: 'number',
            description: 'Number of hierarchy levels to retrieve (optional, default: 3, max: 10)',
            minimum: 1,
            maximum: 10,
          },
        },
        required: ['classstructureid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling get classification hierarchy request', {
            classstructureid: args.classstructureid,
            levels: args.levels,
          });

          const result = await operations.getHierarchy(
            args.classstructureid,
            args.levels || 3
          );

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? 'Classification hierarchy retrieved successfully'
              : 'Failed to retrieve classification hierarchy',
            error: result.error,
          };
        } catch (error) {
          logger.error('Get classification hierarchy tool error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Get Classification Specification Template
    {
      name: 'maximo_get_class_spec',
      description:
        'Get classification specification template showing all available attributes, their data types, ' +
        'required status, and default values. Use this before updating specification values.',
      inputSchema: {
        type: 'object',
        properties: {
          classstructureid: {
            type: 'string',
            description: 'Classification structure ID',
          },
        },
        required: ['classstructureid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling get classification spec request', {
            classstructureid: args.classstructureid,
          });

          const result = await operations.getSpecifications(args.classstructureid);

          return {
            success: result.success,
            data: result.data,
            count: result.data?.length || 0,
            message: result.success
              ? `Retrieved ${result.data?.length || 0} specification attribute(s)`
              : 'Failed to retrieve classification specifications',
            error: result.error,
          };
        } catch (error) {
          logger.error('Get classification spec tool error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Update Specification Values
    {
      name: 'maximo_update_spec_values',
      description:
        'Update specification attribute values for an object (asset, work order, etc.). ' +
        'Provide object name, object ID, and a map of attribute values.',
      inputSchema: {
        type: 'object',
        properties: {
          objectname: {
            type: 'string',
            description: 'Object name (ASSET, WORKORDER, LOCATION, etc.)',
          },
          objectid: {
            type: 'string',
            description: 'Object identifier (assetnum, wonum, location, etc.)',
          },
          specifications: {
            type: 'object',
            description: 'Map of attribute IDs to values (e.g., {"MANUFACTURER": "ACME", "MODEL": "X100"})',
          },
        },
        required: ['objectname', 'objectid', 'specifications'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling update spec values request', {
            objectname: args.objectname,
            objectid: args.objectid,
          });

          const result = await operations.updateSpecifications(args);

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? 'Specification values updated successfully'
              : 'Failed to update specification values',
            error: result.error,
          };
        } catch (error) {
          logger.error('Update spec values tool error', { error });
          throw error;
        }
      },
    },
  ];
}
