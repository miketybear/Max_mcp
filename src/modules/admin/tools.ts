/**
 * MCP Tools for Admin Module
 * Defines 12 MCP tools for automation scripts, cron tasks, endpoints, and actions
 */

import { AdminOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AdminTools');

/**
 * Create MCP tools for admin operations
 */
export function createAdminTools(operations: AdminOperations) {
  return [
    // Tool 1: Create Automation Script
    {
      name: 'maximo_create_autoscript',
      description:
        'Deploy a new automation script to Maximo. Supports Jython and JavaScript. Can include variables and launch points in a single request for CI/CD workflows.',
      inputSchema: {
        type: 'object',
        properties: {
          autoscript: {
            type: 'string',
            description: 'Unique script name (max 50 chars)',
          },
          description: {
            type: 'string',
            description: 'Script description',
          },
          scriptlanguage: {
            type: 'string',
            enum: ['jython', 'javascript', 'nashorn'],
            description: 'Scripting language',
          },
          source: {
            type: 'string',
            description: 'Script source code',
          },
          status: {
            type: 'string',
            description: 'Script status (e.g., "Draft", "Active")',
          },
          active: {
            type: 'boolean',
            description: 'Whether script is active (default: true)',
          },
          loglevel: {
            type: 'string',
            enum: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
            description: 'Script log level',
          },
          autoscriptvars: {
            type: 'array',
            description: 'Script variables (varname, varbindingtype, vartype, literaldatatype)',
            items: {
              type: 'object',
              properties: {
                varname: { type: 'string' },
                varbindingtype: { type: 'string' },
                vartype: { type: 'string', enum: ['IN', 'OUT', 'INOUT'] },
                literaldatatype: { type: 'string' },
                varbindingvalue: { type: 'string' },
              },
              required: ['varname'],
            },
          },
          scriptlaunchpoint: {
            type: 'array',
            description: 'Launch points (launchpointname, launchpointtype, objectname, eventtype)',
            items: {
              type: 'object',
              properties: {
                launchpointname: { type: 'string' },
                launchpointtype: { type: 'string', enum: ['OBJECT', 'ATTRIBUTE', 'ACTION', 'CUSTOM'] },
                objectname: { type: 'string' },
                attributename: { type: 'string' },
                eventtype: { type: 'string' },
                active: { type: 'boolean' },
              },
              required: ['launchpointname', 'launchpointtype'],
            },
          },
        },
        required: ['autoscript', 'scriptlanguage', 'source'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Creating automation script', { autoscript: args.autoscript });
          const result = await operations.createAutoscript(args);
          return {
            success: result.success,
            data: result.data,
            message: `Automation script '${args.autoscript}' deployed successfully`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Create autoscript error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Get Automation Script
    {
      name: 'maximo_get_autoscript',
      description:
        'Retrieve an automation script by name. Returns full details including source code, variables, and launch points.',
      inputSchema: {
        type: 'object',
        properties: {
          autoscript: {
            type: 'string',
            description: 'Automation script name',
          },
        },
        required: ['autoscript'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting automation script', { autoscript: args.autoscript });
          const result = await operations.getAutoscript(args.autoscript);
          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? `Script '${args.autoscript}' retrieved`
              : `Script '${args.autoscript}' not found`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get autoscript error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Update Automation Script
    {
      name: 'maximo_update_autoscript',
      description:
        'Update an existing automation script. Can update source code, status, active flag, and log level. Uses x-method-override PATCH for MAS 9 compatibility.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Script resource ID (from href or GET response)',
          },
          source: {
            type: 'string',
            description: 'Updated script source code',
          },
          description: {
            type: 'string',
            description: 'Updated description',
          },
          status: {
            type: 'string',
            description: 'Updated status',
          },
          active: {
            type: 'boolean',
            description: 'Updated active flag',
          },
          loglevel: {
            type: 'string',
            enum: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
            description: 'Updated log level',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          const { id, ...updateData } = args;
          logger.info('Updating automation script', { id });
          const result = await operations.updateAutoscript(id, updateData);
          return {
            success: result.success,
            data: result.data,
            message: 'Automation script updated successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Update autoscript error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Search Automation Scripts
    {
      name: 'maximo_search_autoscripts',
      description:
        'Search automation scripts. Filter by name, language, status, and active flag.',
      inputSchema: {
        type: 'object',
        properties: {
          autoscript: {
            type: 'string',
            description: 'Filter by script name pattern',
          },
          scriptlanguage: {
            type: 'string',
            description: 'Filter by language (jython, javascript)',
          },
          active: {
            type: 'boolean',
            description: 'Filter by active status',
          },
          status: {
            type: 'string',
            description: 'Filter by status',
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
          logger.info('Searching automation scripts');
          const result = await operations.searchAutoscripts(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} script(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Search autoscripts error', { error });
          throw error;
        }
      },
    },

    // Tool 5: Delete Automation Script
    {
      name: 'maximo_delete_autoscript',
      description:
        'Delete an automation script. WARNING: This removes the script and all its launch points.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Script resource ID to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Deleting automation script', { id: args.id });
          const result = await operations.deleteAutoscript(args.id);
          return {
            success: result.success,
            message: 'Automation script deleted successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Delete autoscript error', { error });
          throw error;
        }
      },
    },

    // Tool 6: Execute Automation Script
    {
      name: 'maximo_execute_script',
      description:
        'Execute an automation script by name. Pass input parameters as JSON. Returns script output variables. Uses the /oslc/script/:name endpoint.',
      inputSchema: {
        type: 'object',
        properties: {
          scriptName: {
            type: 'string',
            description: 'Name of the automation script to execute',
          },
          params: {
            type: 'object',
            description: 'Input parameters as key-value pairs',
            additionalProperties: true,
          },
        },
        required: ['scriptName'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Executing script', { scriptName: args.scriptName });
          const result = await operations.executeScript(args);
          return {
            success: result.success,
            data: result.data,
            message: result.data?.success
              ? `Script '${args.scriptName}' executed successfully`
              : `Script '${args.scriptName}' execution failed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Execute script error', { error });
          throw error;
        }
      },
    },

    // Tool 7: Manage Cron Tasks
    {
      name: 'maximo_manage_crontask',
      description:
        'Manage Maximo cron task definitions. Supports list, get, create, update, and delete actions for scheduled tasks.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete'],
            description: 'Action to perform',
          },
          id: {
            type: 'string',
            description: 'Cron task name or resource ID (for get/update/delete)',
          },
          data: {
            type: 'object',
            description: 'Cron task data (for create/update). Fields: crontaskname, description, classname, active, schedule, runasuser',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing cron task', { action: args.action });
          const result = await operations.manageCronTask(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Cron task ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage crontask error', { error });
          throw error;
        }
      },
    },

    // Tool 8: Manage Endpoints
    {
      name: 'maximo_manage_endpoint',
      description:
        'Manage Maximo integration endpoint definitions. Supports list, get, create, update, and delete actions.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete'],
            description: 'Action to perform',
          },
          id: {
            type: 'string',
            description: 'Endpoint name or resource ID (for get/update/delete)',
          },
          data: {
            type: 'object',
            description: 'Endpoint data (for create/update). Fields: endpointname, description, handlerclass, url, active',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing endpoint', { action: args.action });
          const result = await operations.manageEndpoint(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Endpoint ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage endpoint error', { error });
          throw error;
        }
      },
    },

    // Tool 9: Manage Actions
    {
      name: 'maximo_manage_action',
      description:
        'Manage Maximo custom action definitions. Supports list, get, create, update, and delete actions.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete'],
            description: 'CRUD action to perform',
          },
          id: {
            type: 'string',
            description: 'Action name or resource ID (for get/update/delete)',
          },
          data: {
            type: 'object',
            description: 'Action data (for create/update). Fields: action, description, objectname, type, active, value, parameter',
            additionalProperties: true,
          },
        },
        required: ['action'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Managing action', { action: args.action });
          const result = await operations.manageAction(args.action, args.data, args.id);
          return {
            success: result.success,
            data: result.data,
            message: `Action ${args.action} completed`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Manage action error', { error });
          throw error;
        }
      },
    },
  ];
}
