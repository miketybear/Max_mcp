/**
 * MCP Tools for Setup Module
 * Defines 9 MCP tools for domain management and configuration
 */

import { SetupOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SetupTools');

/**
 * Create MCP tools for setup operations
 */
export function createSetupTools(operations: SetupOperations) {
  return [
    // Tool 1: Create Domain
    {
      name: 'maximo_create_domain',
      description:
        'Create a new domain definition in Maximo. Domains control valid values for fields (ALN, TABLE, SYNONYM, NUMERIC, CROSSOVER types).',
      inputSchema: {
        type: 'object',
        properties: {
          domainid: {
            type: 'string',
            description: 'Unique domain name (max 18 chars)',
          },
          description: {
            type: 'string',
            description: 'Domain description',
          },
          domaintype: {
            type: 'string',
            enum: ['ALN', 'TABLE', 'SYNONYM', 'NUMERIC', 'CROSSOVER'],
            description: 'Domain type',
          },
          maxtype: {
            type: 'string',
            description: 'Maximum data type',
          },
          length: {
            type: 'number',
            description: 'Field length',
          },
        },
        required: ['domainid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Creating domain', { domainid: args.domainid });
          const result = await operations.createDomain(args);
          return {
            success: result.success,
            data: result.data,
            message: `Domain '${args.domainid}' created successfully`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Create domain error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Get Domain
    {
      name: 'maximo_get_domain',
      description:
        'Retrieve a domain definition by name. Returns domain details including type, length, and configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          domainid: {
            type: 'string',
            description: 'Domain name to retrieve',
          },
        },
        required: ['domainid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting domain', { domainid: args.domainid });
          const result = await operations.getDomain(args.domainid);
          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? `Domain '${args.domainid}' retrieved`
              : `Domain '${args.domainid}' not found`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get domain error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Search Domains
    {
      name: 'maximo_search_domains',
      description:
        'Search and filter domain definitions. Filter by name, type with OSLC query support.',
      inputSchema: {
        type: 'object',
        properties: {
          domainid: {
            type: 'string',
            description: 'Filter by domain name pattern',
          },
          domaintype: {
            type: 'string',
            description: 'Filter by domain type (ALN, TABLE, SYNONYM, etc.)',
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
          logger.info('Searching domains');
          const result = await operations.searchDomains(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} domain(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Search domains error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Update Domain
    {
      name: 'maximo_update_domain',
      description:
        'Update an existing domain definition.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Domain resource ID',
          },
          description: {
            type: 'string',
            description: 'Updated description',
          },
          maxtype: {
            type: 'string',
            description: 'Updated max type',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          const { id, ...updateData } = args;
          logger.info('Updating domain', { id });
          const result = await operations.updateDomain(id, updateData);
          return {
            success: result.success,
            data: result.data,
            message: 'Domain updated successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Update domain error', { error });
          throw error;
        }
      },
    },

    // Tool 5: Delete Domain
    {
      name: 'maximo_delete_domain',
      description:
        'Delete a domain definition. WARNING: Removes the domain and all its values.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Domain resource ID to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Deleting domain', { id: args.id });
          const result = await operations.deleteDomain(args.id);
          return {
            success: result.success,
            message: 'Domain deleted successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Delete domain error', { error });
          throw error;
        }
      },
    },

    // Tool 6: Manage ALN Domain Values
    {
      name: 'maximo_manage_aln_domain',
      description:
        'Manage alphanumeric (ALN) domain values. Supports list, create, update, and delete operations on ALN domain entries.',
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
            description: 'ALN domain data. Fields: domainid, value, description, siteid, orgid, ordernum',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing ALN domain', { action: args.action });
          const result = await operations.manageAlnDomain(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `ALN domain ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage ALN domain error', { error });
          throw error;
        }
      },
    },

    // Tool 7: Manage Table Domain Values
    {
      name: 'maximo_manage_table_domain',
      description:
        'Manage table domain values. Supports list, create, update, and delete operations. Table domains reference data from other Maximo tables.',
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
            description: 'Table domain data. Fields: domainid, objectname, validationwhereclause, listwhereclause, siteid, orgid',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing table domain', { action: args.action });
          const result = await operations.manageTableDomain(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Table domain ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage table domain error', { error });
          throw error;
        }
      },
    },

    // Tool 8: Manage Synonym Domain Values
    {
      name: 'maximo_manage_synonym_domain',
      description:
        'Manage synonym domain values. Supports list, create, update, and delete operations. Synonym domains map internal max values to display values.',
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
            description: 'Synonym domain data. Fields: domainid, maxvalue, value, description, defaults, siteid, orgid',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing synonym domain', { action: args.action });
          const result = await operations.manageSynonymDomain(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Synonym domain ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage synonym domain error', { error });
          throw error;
        }
      },
    },

    // Tool 9: Manage Document Types
    {
      name: 'maximo_manage_doctype',
      description:
        'Manage document type definitions. Supports list, create, update, and delete operations.',
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
            description: 'Document type data. Fields: doctype, description, app',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing doc type', { action: args.action });
          const result = await operations.manageDocType(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Document type ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage doc type error', { error });
          throw error;
        }
      },
    },
  ];
}
