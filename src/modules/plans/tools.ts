/**
 * MCP Tools for Job Plans (PLANS) Module
 * Defines 11 MCP tools for comprehensive job plan management
 */

import { JobPlanOperations } from './operations';
import {
  jobPlanCreateSchema,
  jobPlanUpdateSchema,
  jobPlanSearchSchema,
  jobPlanIdentifierSchema,
  jobPlanTaskSchema,
  jobPlanLaborSchema,
  jobPlanMaterialSchema,
  jobPlanServiceSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('JobPlanTools');

/**
 * Create MCP tools for job plan operations
 * @param operations - JobPlanOperations instance
 * @returns Array of MCP tool definitions
 */
export function createJobPlanTools(operations: JobPlanOperations) {
  return [
    // Tool 1: Create Job Plan
    {
      name: 'maximo_create_jobplan',
      description:
        'Create a new job plan (MXJP) in Maximo. Job plans are reusable templates that define tasks, ' +
        'labor, materials, and services needed for work orders. Requires jpnum and description.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required, max 10 characters)',
          },
          description: {
            type: 'string',
            description: 'Job plan description (required, max 100 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional for org-level plans, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'REVISED'],
            description: 'Job plan status (optional, defaults to DRAFT)',
          },
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          duration: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
            minimum: 0,
          },
          interruptible: {
            type: 'boolean',
            description: 'Whether work can be interrupted (optional)',
          },
          downtime: {
            type: 'boolean',
            description: 'Whether asset downtime is required (optional)',
          },
          description_longdescription: {
            type: 'string',
            description: 'Long description (optional)',
          },
          worktype: {
            type: 'string',
            description: 'Work type (optional, max 5 characters)',
          },
          craft: {
            type: 'string',
            description: 'Craft associated with the job plan (optional)',
          },
          templatetype: {
            type: 'string',
            description: 'Template type (optional)',
          },
          safetyplanid: {
            type: 'string',
            description: 'Safety plan identifier (optional)',
          },
          failurecode: {
            type: 'string',
            description: 'Failure code (optional)',
          },
          glaccount: {
            type: 'string',
            description: 'GL debit account (optional)',
          },
          flowcontrolled: {
            type: 'boolean',
            description: 'Whether flow control is enabled (optional)',
          },
        },
        required: ['jpnum', 'description'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_jobplan', { jpnum: args.jpnum });
        const validated = jobPlanCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get Job Plan
    {
      name: 'maximo_get_jobplan',
      description:
        'Retrieve job plan details by job plan number. Optionally filter by site ID. ' +
        'Returns complete job plan information including status, duration, and configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional, for site-specific plans)',
          },
        },
        required: ['jpnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_jobplan', { jpnum: args.jpnum, siteid: args.siteid });
        const validated = jobPlanIdentifierSchema.parse(args);
        const response = await operations.get(validated.jpnum, validated.siteid);
        return response;
      },
    },

    // Tool 3: Update Job Plan
    {
      name: 'maximo_update_jobplan',
      description:
        'Update job plan fields. Specify jpnum and siteid to identify the job plan, ' +
        'then provide any fields to update (description, status, priority, duration, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: { type: 'string', description: 'Job plan description' },
              status: {
                type: 'string',
                enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'REVISED'],
                description: 'Job plan status',
              },
              priority: { type: 'number', description: 'Priority 1-5', minimum: 1, maximum: 5 },
              duration: { type: 'number', description: 'Estimated duration in hours', minimum: 0 },
              interruptible: { type: 'boolean', description: 'Whether work can be interrupted' },
              downtime: { type: 'boolean', description: 'Whether asset downtime is required' },
              description_longdescription: { type: 'string', description: 'Long description' },
              worktype: { type: 'string', description: 'Work type' },
              craft: { type: 'string', description: 'Craft code' },
              templatetype: { type: 'string', description: 'Template type' },
              safetyplanid: { type: 'string', description: 'Safety plan identifier' },
              failurecode: { type: 'string', description: 'Failure code' },
              glaccount: { type: 'string', description: 'GL debit account' },
              flowcontrolled: { type: 'boolean', description: 'Flow control flag' },
            },
          },
        },
        required: ['jpnum', 'siteid', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_jobplan', { jpnum: args.jpnum, siteid: args.siteid });
        const validated = jobPlanUpdateSchema.parse(args.updates);
        const response = await operations.update(args.jpnum, args.siteid, validated);
        return response;
      },
    },

    // Tool 4: Delete Job Plan
    {
      name: 'maximo_delete_jobplan',
      description:
        'Delete a job plan from Maximo. Requires job plan number. Optionally specify site ID. ' +
        'This operation cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['jpnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_jobplan', { jpnum: args.jpnum, siteid: args.siteid });
        const validated = jobPlanIdentifierSchema.parse(args);
        const response = await operations.delete(validated.jpnum, validated.siteid);
        return response;
      },
    },

    // Tool 5: Search Job Plans
    {
      name: 'maximo_search_jobplans',
      description:
        'Search job plans with flexible filters. Supports filtering by jpnum, status, site, ' +
        'organization, priority, work type, and craft. Returns paginated results.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Filter by job plan number (supports % wildcard)',
          },
          status: {
            oneOf: [
              { type: 'string', enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'REVISED'] },
              {
                type: 'array',
                items: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'REVISED'] },
              },
            ],
            description: 'Filter by status (single value or array)',
          },
          siteid: {
            type: 'string',
            description: 'Filter by site',
          },
          orgid: {
            type: 'string',
            description: 'Filter by organization',
          },
          priority: {
            type: 'number',
            description: 'Filter by priority (1-5)',
            minimum: 1,
            maximum: 5,
          },
          worktype: {
            type: 'string',
            description: 'Filter by work type',
          },
          craft: {
            type: 'string',
            description: 'Filter by craft',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
          page: {
            type: 'number',
            description: 'Page number (1-based, default: 1)',
            minimum: 1,
          },
          select: {
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to return (OSLC select)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (OSLC orderBy), e.g., "+jpnum" or "-status"',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause',
          },
          searchTerms: {
            type: 'string',
            description: 'Search terms for full-text search',
          },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_search_jobplans', { criteria: args });
        const validated = jobPlanSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 6: Add Task to Job Plan
    {
      name: 'maximo_add_jobplan_task',
      description:
        'Add a task to a job plan. Tasks define individual steps or activities within the plan. ' +
        'Requires job plan number, task number (jptask), and description.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          jptask: {
            type: 'number',
            description: 'Task number / sequence (required, positive integer)',
            minimum: 1,
          },
          description: {
            type: 'string',
            description: 'Task description (required, max 100 characters)',
          },
          metername: {
            type: 'string',
            description: 'Meter name for condition-based task (optional)',
          },
          interruptible: {
            type: 'boolean',
            description: 'Whether the task can be interrupted (optional)',
          },
          duration: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
            minimum: 0,
          },
          sequence: {
            type: 'number',
            description: 'Task sequence for ordering (optional)',
            minimum: 1,
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group for the task (optional)',
          },
          craft: {
            type: 'string',
            description: 'Craft code (optional)',
          },
          description_longdescription: {
            type: 'string',
            description: 'Long description for the task (optional)',
          },
        },
        required: ['jpnum', 'jptask', 'description'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_jobplan_task', {
          jpnum: args.jpnum,
          siteid: args.siteid,
          jptask: args.jptask,
        });
        const validated = jobPlanTaskSchema.parse(args);
        const { jpnum, siteid, ...taskData } = validated;
        const response = await operations.addTask(jpnum, siteid, taskData as any);
        return response;
      },
    },

    // Tool 7: Get Job Plan Tasks
    {
      name: 'maximo_get_jobplan_tasks',
      description:
        'Retrieve all tasks for a job plan. Returns the jobtask array containing task details ' +
        'such as task number, description, duration, sequence, and craft.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['jpnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_jobplan_tasks', { jpnum: args.jpnum, siteid: args.siteid });
        const validated = jobPlanIdentifierSchema.parse(args);
        const response = await operations.getTasks(validated.jpnum, validated.siteid);
        return response;
      },
    },

    // Tool 8: Add Labor to Job Plan
    {
      name: 'maximo_add_jobplan_labor',
      description:
        'Add labor requirement to a job plan. Defines craft, quantity, and hours needed. ' +
        'Requires job plan number, craft code, quantity, and hours.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          craft: {
            type: 'string',
            description: 'Craft code (required)',
          },
          quantity: {
            type: 'number',
            description: 'Number of labor resources required (required, min 1)',
            minimum: 1,
          },
          hours: {
            type: 'number',
            description: 'Hours per labor resource (required, must be > 0)',
            minimum: 0.01,
          },
          rate: {
            type: 'number',
            description: 'Hourly rate (optional)',
            minimum: 0,
          },
          skilllevel: {
            type: 'string',
            description: 'Skill level required (optional)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor for outside labor (optional)',
          },
          contractnum: {
            type: 'string',
            description: 'Contract number (optional)',
          },
        },
        required: ['jpnum', 'craft', 'quantity', 'hours'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_jobplan_labor', {
          jpnum: args.jpnum,
          siteid: args.siteid,
          craft: args.craft,
        });
        const validated = jobPlanLaborSchema.parse(args);
        const { jpnum, siteid, ...laborData } = validated;
        const response = await operations.addLabor(jpnum, siteid, laborData as any);
        return response;
      },
    },

    // Tool 9: Add Material to Job Plan
    {
      name: 'maximo_add_jobplan_material',
      description:
        'Add material requirement to a job plan. Defines items and quantities needed. ' +
        'Requires job plan number, item number, and quantity.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          itemnum: {
            type: 'string',
            description: 'Item number (required)',
          },
          itemqty: {
            type: 'number',
            description: 'Quantity required (required, must be > 0)',
            minimum: 0.01,
          },
          description: {
            type: 'string',
            description: 'Item description (optional)',
          },
          conditioncode: {
            type: 'string',
            description: 'Condition code for the material (optional)',
          },
          storeroom: {
            type: 'string',
            description: 'Storeroom location (optional)',
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional)',
            minimum: 0,
          },
          directreq: {
            type: 'boolean',
            description: 'Direct issue flag (optional)',
          },
          linetype: {
            type: 'string',
            description: 'Line type (optional)',
          },
        },
        required: ['jpnum', 'itemnum', 'itemqty'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_jobplan_material', {
          jpnum: args.jpnum,
          siteid: args.siteid,
          itemnum: args.itemnum,
        });
        const validated = jobPlanMaterialSchema.parse(args);
        const { jpnum, siteid, ...materialData } = validated;
        const response = await operations.addMaterial(jpnum, siteid, materialData as any);
        return response;
      },
    },

    // Tool 10: Add Service to Job Plan
    {
      name: 'maximo_add_jobplan_service',
      description:
        'Add service requirement to a job plan. Defines external services needed. ' +
        'Requires job plan number and service description.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          description: {
            type: 'string',
            description: 'Service description (required, max 100 characters)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor code (optional)',
          },
          linecost: {
            type: 'number',
            description: 'Estimated line cost (optional)',
            minimum: 0,
          },
          contractnum: {
            type: 'string',
            description: 'Contract number (optional)',
          },
          linetype: {
            type: 'string',
            description: 'Line type (optional)',
          },
        },
        required: ['jpnum', 'description'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_jobplan_service', {
          jpnum: args.jpnum,
          siteid: args.siteid,
        });
        const validated = jobPlanServiceSchema.parse(args);
        const { jpnum, siteid, ...serviceData } = validated;
        const response = await operations.addService(jpnum, siteid, serviceData as any);
        return response;
      },
    },

    // Tool 11: Get Associated Work Orders
    {
      name: 'maximo_get_jobplan_workorders',
      description:
        'Retrieve work orders that reference a specific job plan. Returns a list of work orders ' +
        'with their number, description, status, and schedule dates.',
      inputSchema: {
        type: 'object',
        properties: {
          jpnum: {
            type: 'string',
            description: 'Job plan number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['jpnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_jobplan_workorders', {
          jpnum: args.jpnum,
          siteid: args.siteid,
        });
        const validated = jobPlanIdentifierSchema.parse(args);
        const response = await operations.getAssociatedWorkOrders(validated.jpnum, validated.siteid);
        return response;
      },
    },
  ];
}
