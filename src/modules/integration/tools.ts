/**
 * MCP Tools for Integration/Dev Utilities Module
 * Defines 8 MCP tools for Maximo object structures, system properties, and measurement units
 */

import { IntegrationOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('IntegrationTools');

/**
 * Create MCP tools for integration operations
 */
export function createIntegrationTools(operations: IntegrationOperations) {
  return [
    // Tool 1: Get Object Structure
    {
      name: 'maximo_get_object_structure',
      description:
        'Retrieve a Maximo object structure definition. Returns object details including class, entity, table, and module information. Essential for MAS 9 development.',
      inputSchema: {
        type: 'object',
        properties: {
          objectname: {
            type: 'string',
            description: 'Maximo object name (e.g., WORKORDER, ASSET, PERSON)',
          },
        },
        required: ['objectname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting object structure', { objectname: args.objectname });
          const result = await operations.getObjectStructure(args.objectname);
          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? `Object '${args.objectname}' retrieved`
              : `Object '${args.objectname}' not found`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get object structure error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Search Objects
    {
      name: 'maximo_search_objects',
      description:
        'Search Maximo object definitions. Filter by name, module, and persistent flag. Useful for discovering available API objects for MAS 9 development.',
      inputSchema: {
        type: 'object',
        properties: {
          objectname: {
            type: 'string',
            description: 'Filter by object name pattern',
          },
          module: {
            type: 'string',
            description: 'Filter by module (e.g., ASSET, WO, PM)',
          },
          persistent: {
            type: 'boolean',
            description: 'Filter by persistent flag (true = database-backed objects)',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (default: 20)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Searching objects');
          const result = await operations.searchObjects(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} object(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Search objects error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Get System Properties
    {
      name: 'maximo_get_system_properties',
      description:
        'Read Maximo system properties (maxvars). These control system behavior, feature flags, and configuration. Filter by name and type.',
      inputSchema: {
        type: 'object',
        properties: {
          varname: {
            type: 'string',
            description: 'Filter by property name pattern',
          },
          vartype: {
            type: 'string',
            description: 'Filter by property type',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (default: 20)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting system properties');
          const result = await operations.getSystemProperties(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} property/properties`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get system properties error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Update System Property
    {
      name: 'maximo_update_system_property',
      description:
        'Update a Maximo system property value. WARNING: Changing system properties can affect system behavior. Use with caution.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'System property resource ID',
          },
          varvalue: {
            type: 'string',
            description: 'New property value',
          },
          description: {
            type: 'string',
            description: 'Updated description',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          const { id, ...updateData } = args;
          logger.info('Updating system property', { id });
          const result = await operations.updateSystemProperty(id, updateData);
          return {
            success: result.success,
            data: result.data,
            message: 'System property updated successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Update system property error', { error });
          throw error;
        }
      },
    },

    // Tool 5: Get Measurement Units
    {
      name: 'maximo_get_measure_units',
      description:
        'List measurement units configured in Maximo. Used for inventory, work order, and asset measurements.',
      inputSchema: {
        type: 'object',
        properties: {
          pageSize: {
            type: 'number',
            description: 'Results per page (default: 20)',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting measurement units');
          const result = await operations.getMeasureUnits(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} measurement unit(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get measure units error', { error });
          throw error;
        }
      },
    },

    // Tool 6: Manage Measurement Units
    {
      name: 'maximo_manage_measure_unit',
      description:
        'Manage measurement unit definitions. Supports list, create, update, and delete operations.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'create', 'update', 'delete'],
            description: 'Action to perform',
          },
          id: {
            type: 'string',
            description: 'Resource ID (for update/delete)',
          },
          data: {
            type: 'object',
            description: 'Measurement unit data. Fields: measureunitid, description, abbreviation',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing measurement unit', { action: args.action });
          const result = await operations.manageMeasureUnit(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Measurement unit ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage measure unit error', { error });
          throw error;
        }
      },
    },
  ];
}
