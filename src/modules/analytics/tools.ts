/**
 * MCP Tools for Analytics Module
 * Defines 7 MCP tools for reporting, KPI queries, and dashboard aggregation
 */

import { AnalyticsOperations } from './operations';
import {
  workOrderSummarySchema,
  assetHealthSchema,
  inventorySummarySchema,
  pmComplianceSchema,
  dashboardSchema,
  overdueWorkOrdersSchema,
  topDowntimeAssetsSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AnalyticsTools');

/**
 * Create MCP tools for analytics operations
 * @param operations - AnalyticsOperations instance
 * @returns Array of MCP tool definitions
 */
export function createAnalyticsTools(operations: AnalyticsOperations) {
  return [
    // Tool 1: Work Order Summary
    {
      name: 'maximo_wo_summary',
      description:
        'Get a work order summary with counts grouped by status (WAPPR, APPR, INPRG, COMP, CLOSE, etc.) for a site. ' +
        'Optionally filter by a date range on statusdate. Returns total count and per-status breakdown.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          dateRange: {
            type: 'object',
            description: 'Optional date range filter for work order status date',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO 8601 format',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO 8601 format',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_wo_summary', { siteid: args.siteid });
        const validated = workOrderSummarySchema.parse(args);
        const response = await operations.getWorkOrderSummary(
          validated.siteid,
          validated.dateRange
        );
        return response;
      },
    },

    // Tool 2: Asset Health Summary
    {
      name: 'maximo_asset_health',
      description:
        'Get an asset health summary for a site. Returns total assets, counts by status ' +
        '(OPERATING, NOT READY, DECOMMISSIONED), and number of assets with recorded downtime.',
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
        logger.info('Executing maximo_asset_health', { siteid: args.siteid });
        const validated = assetHealthSchema.parse(args);
        const response = await operations.getAssetHealthSummary(validated.siteid);
        return response;
      },
    },

    // Tool 3: Inventory Summary
    {
      name: 'maximo_inventory_summary',
      description:
        'Get an inventory summary for a site. Returns total inventory items, ' +
        'items below reorder point, and items that are out of stock.',
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
        logger.info('Executing maximo_inventory_summary', { siteid: args.siteid });
        const validated = inventorySummarySchema.parse(args);
        const response = await operations.getInventorySummary(validated.siteid);
        return response;
      },
    },

    // Tool 4: PM Compliance
    {
      name: 'maximo_pm_compliance',
      description:
        'Get preventive maintenance compliance for a site. Compares PM next dates to today ' +
        'to determine on-schedule vs overdue PMs. Returns total PMs, overdue count, on-schedule count, ' +
        'and compliance rate as a percentage.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          dateRange: {
            type: 'object',
            description: 'Optional date range filter for PM next date',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO 8601 format',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO 8601 format',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_pm_compliance', { siteid: args.siteid });
        const validated = pmComplianceSchema.parse(args);
        const response = await operations.getPMCompliance(
          validated.siteid,
          validated.dateRange
        );
        return response;
      },
    },

    // Tool 5: KPI Dashboard
    {
      name: 'maximo_dashboard',
      description:
        'Get a combined KPI dashboard for a site. Aggregates work order summary, asset health, ' +
        'inventory summary, and PM compliance into a single response. This is the go-to tool ' +
        'for a quick overview of site operations.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          dateRange: {
            type: 'object',
            description: 'Optional date range filter for time-bound queries (work orders and PM compliance)',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO 8601 format',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO 8601 format',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_dashboard', { siteid: args.siteid });
        const validated = dashboardSchema.parse(args);
        const response = await operations.getDashboard(
          validated.siteid,
          validated.dateRange
        );
        return response;
      },
    },

    // Tool 6: Overdue Work Orders
    {
      name: 'maximo_overdue_workorders',
      description:
        'Get work orders that are overdue (target start date is in the past and status is still open). ' +
        'Open statuses include WAPPR, APPR, WSCH, and INPRG. Results are sorted by target start date ascending.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results to return (default: 100, max: 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_overdue_workorders', { siteid: args.siteid });
        const validated = overdueWorkOrdersSchema.parse(args);
        const response = await operations.getOverdueWorkOrders(
          validated.siteid,
          validated.pageSize
        );
        return response;
      },
    },

    // Tool 7: Top Downtime Assets
    {
      name: 'maximo_top_downtime_assets',
      description:
        'Get the top assets by downtime hours for a site, sorted by total downtime descending. ' +
        'Useful for identifying assets that need the most attention or maintenance investment.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          limit: {
            type: 'number',
            description: 'Number of assets to return (default: 10, max: 100)',
            minimum: 1,
            maximum: 100,
          },
        },
        required: ['siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_top_downtime_assets', { siteid: args.siteid });
        const validated = topDowntimeAssetsSchema.parse(args);
        const response = await operations.getTopDowntimeAssets(
          validated.siteid,
          validated.limit
        );
        return response;
      },
    },
  ];
}
