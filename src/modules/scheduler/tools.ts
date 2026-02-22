/**
 * MCP Tools for Scheduler Module
 * Defines 6 MCP tools for work scheduling and resource allocation queries
 */

import { SchedulerOperations } from './operations';
import {
  workScheduleQuerySchema,
  unscheduledWorkQuerySchema,
  laborAvailabilityQuerySchema,
  workBacklogQuerySchema,
  scheduleConflictsQuerySchema,
  upcomingPMsQuerySchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SchedulerTools');

/**
 * Create MCP tools for scheduler operations
 * @param operations - SchedulerOperations instance
 * @returns Array of MCP tool definitions
 */
export function createSchedulerTools(operations: SchedulerOperations) {
  return [
    // Tool 1: Get Work Schedule
    {
      name: 'maximo_get_work_schedule',
      description:
        'Get scheduled work orders within a date range for a site. Returns work orders that have ' +
        'scheduled start and finish dates in the specified range. Optionally filter by assigned person ' +
        'or craft. Results are sorted by scheduled start date.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          startDate: {
            type: 'string',
            description: 'Start of date range in ISO 8601 format (required)',
          },
          endDate: {
            type: 'string',
            description: 'End of date range in ISO 8601 format (required)',
          },
          personid: {
            type: 'string',
            description: 'Filter by assigned person ID (optional)',
          },
          craft: {
            type: 'string',
            description: 'Filter by craft/trade (optional)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['siteid', 'startDate', 'endDate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_work_schedule', {
          siteid: args.siteid,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        const validated = workScheduleQuerySchema.parse(args);
        const response = await operations.getWorkSchedule(
          validated.siteid,
          validated.startDate,
          validated.endDate,
          validated.personid,
          validated.craft,
          validated.pageSize
        );
        return response;
      },
    },

    // Tool 2: Get Unscheduled Work
    {
      name: 'maximo_get_unscheduled_work',
      description:
        'Find work orders in APPR, WSCH, or WAPPR status that do not have a scheduled start date. ' +
        'These represent the work backlog that needs to be scheduled. Results are sorted by priority ' +
        '(highest priority first).',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_unscheduled_work', { siteid: args.siteid });
        const validated = unscheduledWorkQuerySchema.parse(args);
        const response = await operations.getUnscheduledWork(
          validated.siteid,
          validated.pageSize
        );
        return response;
      },
    },

    // Tool 3: Get Labor Availability
    {
      name: 'maximo_get_labor_availability',
      description:
        'Query labor availability for a site. Calculates available hours, assigned hours, and ' +
        'utilization percentage for each active person. Assumes 8-hour daily capacity. ' +
        'Optionally filter by date and craft.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          date: {
            type: 'string',
            description: 'Date to check availability for in ISO 8601 format (optional, defaults to today)',
          },
          craft: {
            type: 'string',
            description: 'Filter by craft/trade (optional)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_labor_availability', {
          siteid: args.siteid,
          date: args.date,
        });
        const validated = laborAvailabilityQuerySchema.parse(args);
        const response = await operations.getLaborAvailability(
          validated.siteid,
          validated.date,
          validated.craft,
          validated.pageSize
        );
        return response;
      },
    },

    // Tool 4: Get Work Backlog
    {
      name: 'maximo_get_work_backlog',
      description:
        'Get a summary of the work backlog for a site. Returns counts of unscheduled and unassigned ' +
        'work orders broken down by priority level and status. Useful for capacity planning and ' +
        'scheduling decisions.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_work_backlog', { siteid: args.siteid });
        const validated = workBacklogQuerySchema.parse(args);
        const response = await operations.getWorkBacklog(validated.siteid);
        return response;
      },
    },

    // Tool 5: Find Schedule Conflicts
    {
      name: 'maximo_find_schedule_conflicts',
      description:
        'Find schedule conflicts where the same person is assigned to multiple work orders with ' +
        'overlapping scheduled times within a date range. Returns details of each conflict including ' +
        'the overlapping work orders and the duration of overlap in hours.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          startDate: {
            type: 'string',
            description: 'Start of date range in ISO 8601 format (required)',
          },
          endDate: {
            type: 'string',
            description: 'End of date range in ISO 8601 format (required)',
          },
        },
        required: ['siteid', 'startDate', 'endDate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_find_schedule_conflicts', {
          siteid: args.siteid,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        const validated = scheduleConflictsQuerySchema.parse(args);
        const response = await operations.findScheduleConflicts(
          validated.siteid,
          validated.startDate,
          validated.endDate
        );
        return response;
      },
    },

    // Tool 6: Get Upcoming PMs
    {
      name: 'maximo_get_upcoming_pms',
      description:
        'Get preventive maintenance (PM) schedules coming due within a specified number of days. ' +
        'Queries PMs with a next due date within the lookahead window. Defaults to 30 days. ' +
        'Results are sorted by next due date.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          days: {
            type: 'number',
            description: 'Number of days to look ahead (default: 30, max: 365)',
            minimum: 1,
            maximum: 365,
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_upcoming_pms', {
          siteid: args.siteid,
          days: args.days,
        });
        const validated = upcomingPMsQuerySchema.parse(args);
        const response = await operations.getUpcomingPMs(
          validated.siteid,
          validated.days
        );
        return response;
      },
    },
  ];
}
