/**
 * MCP Tools for Preventive Maintenance Module
 * Defines 7 MCP tools for comprehensive preventive maintenance management
 */

import { PMOperations } from './operations';
import {
  pmCreateSchema,
  pmUpdateSchema,
  pmSearchSchema,
  pmIdentifierSchema,
  pmWorkOrderGenerationSchema,
  jobPlanCreateSchema,
  pmCompletionSchema,
  pmHistoryParamsSchema,
  pmScheduleParamsSchema,
  pmFrequencyUpdateSchema,
  pmStatusChangeSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('PMTools');

/**
 * Create MCP tools for PM operations
 * @param operations - PMOperations instance
 * @returns Array of MCP tool definitions
 */
export function createPMTools(operations: PMOperations) {
  return [
    // Tool 1: Create PM
    {
      name: 'maximo_create_pm',
      description:
        'Create a new preventive maintenance record in Maximo. Requires description, siteid, frequency, and frequnit. ' +
        'Optionally specify asset, location, next due date, job plan, work type, priority, and meter settings.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'PM description (required, max 100 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          frequency: {
            type: 'number',
            description: 'Frequency value (required, must be positive)',
          },
          frequnit: {
            type: 'string',
            enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS', 'HOURS', 'METERS', 'MILES', 'KILOMETERS'],
            description: 'Frequency unit (required)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          assetnum: {
            type: 'string',
            description: 'Asset number (optional, max 12 characters)',
          },
          location: {
            type: 'string',
            description: 'Location code (optional, max 12 characters)',
          },
          nextdate: {
            type: 'string',
            description: 'Next due date in ISO 8601 format (optional)',
          },
          jpnum: {
            type: 'string',
            description: 'Job plan number (optional, max 10 characters)',
          },
          worktype: {
            type: 'string',
            description: 'Work type (optional, max 4 characters)',
          },
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          estdur: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
          },
          leadcraft: {
            type: 'string',
            description: 'Lead craft (optional, max 8 characters)',
          },
          route: {
            type: 'string',
            description: 'Route (optional, max 8 characters)',
          },
          meterbased: {
            type: 'boolean',
            description: 'Meter-based flag (optional)',
          },
          metername: {
            type: 'string',
            description: 'Meter name (optional, max 8 characters)',
          },
          meterreading: {
            type: 'number',
            description: 'Meter reading threshold (optional)',
          },
          calendar: {
            type: 'string',
            description: 'Calendar (optional, max 8 characters)',
          },
          comments: {
            type: 'string',
            description: 'Comments (optional)',
          },
        },
        required: ['description', 'siteid', 'frequency', 'frequnit'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_pm', { siteid: args.siteid });
        const validated = pmCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get PM
    {
      name: 'maximo_get_pm',
      description:
        'Retrieve preventive maintenance record details by PM number and optional site ID. ' +
        'Returns complete PM information including status, frequency, next due date, and associated asset/location.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['pmnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmIdentifierSchema.parse(args);
        const response = await operations.get(validated.pmnum, validated.siteid);
        return response;
      },
    },

    // Tool 3: Update PM
    {
      name: 'maximo_update_pm',
      description:
        'Update preventive maintenance record fields. Specify pmnum and optional siteid to identify the PM, ' +
        'then provide any fields to update (description, frequency, next date, asset, location, status, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: { type: 'string', description: 'PM description' },
              frequency: { type: 'number', description: 'Frequency value' },
              frequnit: {
                type: 'string',
                enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS', 'HOURS', 'METERS', 'MILES', 'KILOMETERS'],
                description: 'Frequency unit',
              },
              nextdate: { type: 'string', description: 'Next due date (ISO 8601)' },
              assetnum: { type: 'string', description: 'Asset number' },
              location: { type: 'string', description: 'Location code' },
              jpnum: { type: 'string', description: 'Job plan number' },
              worktype: { type: 'string', description: 'Work type' },
              priority: { type: 'number', description: 'Priority 1-5' },
              estdur: { type: 'number', description: 'Estimated duration in hours' },
              leadcraft: { type: 'string', description: 'Lead craft' },
              route: { type: 'string', description: 'Route' },
              meterbased: { type: 'boolean', description: 'Meter-based flag' },
              metername: { type: 'string', description: 'Meter name' },
              meterreading: { type: 'number', description: 'Meter reading threshold' },
              calendar: { type: 'string', description: 'Calendar' },
              comments: { type: 'string', description: 'Comments' },
              status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE', 'SUSPEND'],
                description: 'PM status',
              },
            },
          },
        },
        required: ['pmnum', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmUpdateSchema.parse(args.updates);
        const response = await operations.update(args.pmnum, args.siteid, validated);
        return response;
      },
    },

    // Tool 4: Delete PM
    {
      name: 'maximo_delete_pm',
      description:
        'Delete a preventive maintenance record. Specify pmnum and optional siteid to identify the PM to delete.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['pmnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmIdentifierSchema.parse(args);
        const response = await operations.delete(validated.pmnum, validated.siteid);
        return response;
      },
    },

    // Tool 5: Generate PM Work Orders
    {
      name: 'maximo_generate_pm_wo',
      description:
        'Generate work orders from a preventive maintenance record. Specify pmnum and optionally provide a target date. ' +
        'Returns an array of generated work order numbers.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          targetdate: {
            type: 'string',
            description: 'Target generation date in ISO 8601 format (optional, defaults to current date)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['pmnum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_generate_pm_wo', { pmnum: args.pmnum });
        const validated = pmWorkOrderGenerationSchema.parse(args);
        const response = await operations.generateWorkOrders(validated);
        return response;
      },
    },

    // Tool 6: Create Job Plan
    {
      name: 'maximo_create_jobplan',
      description:
        'Create a new job plan in Maximo. Requires jpnum, description, and siteid. ' +
        'Optionally specify work type, priority, lead craft, and job plan tasks.',
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
            description: 'Site identifier (required, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          estdur: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
          },
          worktype: {
            type: 'string',
            description: 'Work type (optional, max 4 characters)',
          },
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          leadcraft: {
            type: 'string',
            description: 'Lead craft (optional, max 8 characters)',
          },
          comments: {
            type: 'string',
            description: 'Comments (optional)',
          },
          jptask: {
            type: 'array',
            description: 'Job plan tasks (optional)',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string', description: 'Task description (required)' },
                tasktype: { type: 'string', description: 'Task type (optional)' },
                estdur: { type: 'number', description: 'Estimated duration in hours (optional)' },
                seqnum: { type: 'number', description: 'Sequence number (optional)' },
              },
              required: ['description'],
            },
          },
        },
        required: ['jpnum', 'description', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_jobplan', { jpnum: args.jpnum, siteid: args.siteid });
        const validated = jobPlanCreateSchema.parse(args);
        const response = await operations.createJobPlan(validated);
        return response;
      },
    },

    // Tool 7: Search PMs
    {
      name: 'maximo_search_pms',
      description:
        'Search preventive maintenance records with filters. Filter by asset, location, status, site, job plan, or work type. ' +
        'Supports pagination with pageSize and pageNum parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number filter (optional)',
          },
          location: {
            type: 'string',
            description: 'Location code filter (optional)',
          },
          status: {
            oneOf: [
              {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE', 'SUSPEND'],
                description: 'PM status',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'SUSPEND'],
                },
                description: 'Multiple status values',
              },
            ],
          },
          siteid: {
            type: 'string',
            description: 'Site identifier filter (optional)',
          },
          jpnum: {
            type: 'string',
            description: 'Job plan number filter (optional)',
          },
          worktype: {
            type: 'string',
            description: 'Work type filter (optional)',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (optional, default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
          pageNum: {
            type: 'number',
            description: 'Page number (optional, default: 1)',
            minimum: 1,
          },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_search_pms', { filters: Object.keys(args) });
        const validated = pmSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 8: Complete PM
    {
      name: 'maximo_complete_pm',
      description:
        'Mark a preventive maintenance record as completed. Updates the last completion date and optionally adds a completion memo. ' +
        'Requires pmnum and siteid. Completion date defaults to current date if not specified.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          completionDate: {
            type: 'string',
            description: 'Completion date in ISO 8601 format (optional, defaults to current date)',
          },
          memo: {
            type: 'string',
            description: 'Completion memo or notes (optional, max 500 characters)',
          },
        },
        required: ['pmnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_complete_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmCompletionSchema.parse(args);
        const response = await operations.completePM(validated);
        return response;
      },
    },

    // Tool 9: Get PM History
    {
      name: 'maximo_get_pm_history',
      description:
        'Get the maintenance history for a preventive maintenance record. Retrieves work orders that were generated from this PM, ' +
        'including work order number, status, actual start/finish dates, and description. Results are sorted by most recent first.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of history records to return (optional, default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['pmnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_pm_history', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmHistoryParamsSchema.parse(args);
        const response = await operations.getPMHistory(validated);
        return response;
      },
    },

    // Tool 10: Get PM Schedule
    {
      name: 'maximo_get_pm_schedule',
      description:
        'Get the projected schedule for a preventive maintenance record. Calculates the next N scheduled dates based on the PM frequency ' +
        'and frequency unit (DAYS, WEEKS, MONTHS, YEARS). Only works for time-based PMs (not meter-based).',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          count: {
            type: 'number',
            description: 'Number of projected dates to calculate (optional, default: 5, max: 52)',
            minimum: 1,
            maximum: 52,
          },
        },
        required: ['pmnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_pm_schedule', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmScheduleParamsSchema.parse(args);
        const response = await operations.getPMSchedule(validated);
        return response;
      },
    },

    // Tool 11: Update PM Frequency
    {
      name: 'maximo_update_pm_frequency',
      description:
        'Update the frequency settings of a preventive maintenance record. Changes both the frequency value and frequency unit. ' +
        'Only time-based frequency units are supported: DAYS, WEEKS, MONTHS, YEARS.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          frequency: {
            type: 'number',
            description: 'New frequency value (required, must be positive)',
          },
          frequnit: {
            type: 'string',
            enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'],
            description: 'New frequency unit (required)',
          },
        },
        required: ['pmnum', 'siteid', 'frequency', 'frequnit'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_pm_frequency', {
          pmnum: args.pmnum,
          siteid: args.siteid,
          frequency: args.frequency,
          frequnit: args.frequnit,
        });
        const validated = pmFrequencyUpdateSchema.parse(args);
        const response = await operations.updatePMFrequency(validated);
        return response;
      },
    },

    // Tool 12: Activate PM
    {
      name: 'maximo_activate_pm',
      description:
        'Activate a preventive maintenance record by setting its status to ACTIVE. ' +
        'Requires pmnum and siteid to identify the PM record.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['pmnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_activate_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmStatusChangeSchema.parse(args);
        const response = await operations.activatePM(validated);
        return response;
      },
    },

    // Tool 13: Deactivate PM
    {
      name: 'maximo_deactivate_pm',
      description:
        'Deactivate a preventive maintenance record by setting its status to INACTIVE. ' +
        'Requires pmnum and siteid to identify the PM record.',
      inputSchema: {
        type: 'object',
        properties: {
          pmnum: {
            type: 'string',
            description: 'PM number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['pmnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_deactivate_pm', { pmnum: args.pmnum, siteid: args.siteid });
        const validated = pmStatusChangeSchema.parse(args);
        const response = await operations.deactivatePM(validated);
        return response;
      },
    },
  ];
}
