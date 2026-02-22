/**
 * MCP Tools for Work Order Module
 * Defines 11 MCP tools for comprehensive work order management
 */

import { WorkOrderOperations } from './operations';
import {
  workOrderCreateSchema,
  workOrderUpdateSchema,
  workOrderSearchSchema,
  statusChangeSchema,
  laborTransactionSchema,
  materialTransactionSchema,
  serviceEntrySchema,
  workLogSchema,
  assignmentSchema,
  workOrderIdentifierSchema,
  taskSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('WorkOrderTools');

/**
 * Create MCP tools for work order operations
 * @param operations - WorkOrderOperations instance
 * @returns Array of MCP tool definitions
 */
export function createWorkOrderTools(operations: WorkOrderOperations) {
  return [
    // Tool 1: Create Work Order
    {
      name: 'maximo_create_workorder',
      description:
        'Create a new work order in Maximo. Requires description, siteid, and worktype. ' +
        'Optionally specify asset, location, priority, schedule dates, and assignments.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Work order description (required, max 100 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          worktype: {
            type: 'string',
            enum: ['CM', 'PM', 'EM', 'CAL', 'INS'],
            description: 'Work type: CM (Corrective Maintenance), PM (Preventive Maintenance), EM (Emergency), CAL (Calibration), INS (Inspection)',
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
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          schedstart: {
            type: 'string',
            description: 'Scheduled start date in ISO 8601 format (optional)',
          },
          schedfinish: {
            type: 'string',
            description: 'Scheduled finish date in ISO 8601 format (optional)',
          },
          targstartdate: {
            type: 'string',
            description: 'Target start date in ISO 8601 format (optional)',
          },
          targcompdate: {
            type: 'string',
            description: 'Target completion date in ISO 8601 format (optional)',
          },
          reportedby: {
            type: 'string',
            description: 'Person who reported the work order (optional)',
          },
          owner: {
            type: 'string',
            description: 'Work order owner (optional)',
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group (optional)',
          },
          supervisor: {
            type: 'string',
            description: 'Supervisor (optional)',
          },
          lead: {
            type: 'string',
            description: 'Lead person (optional)',
          },
          wopriority: {
            type: 'number',
            description: 'Work order priority 1-5 (optional)',
            minimum: 1,
            maximum: 5,
          },
          estdur: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
          },
          description_longdescription: {
            type: 'string',
            description: 'Long description (optional)',
          },
          failurecode: {
            type: 'string',
            description: 'Failure code (optional)',
          },
          problemcode: {
            type: 'string',
            description: 'Problem code (optional)',
          },
          woclass: {
            type: 'string',
            description: 'Work order class (optional)',
          },
          glaccount: {
            type: 'string',
            description: 'GL debit account (optional)',
          },
          parent: {
            type: 'string',
            description: 'Parent work order number (optional)',
          },
          crewworkgroup: {
            type: 'string',
            description: 'Crew work group (optional)',
          },
          jpnum: {
            type: 'string',
            description: 'Job plan number (optional)',
          },
          externalrefid: {
            type: 'string',
            description: 'External reference ID (optional)',
          },
        },
        required: ['description', 'siteid', 'worktype'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_workorder', { siteid: args.siteid });
        const validated = workOrderCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get Work Order
    {
      name: 'maximo_get_workorder',
      description:
        'Retrieve work order details by work order number and site ID. ' +
        'Returns complete work order information including status, dates, costs, and assignments.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_workorder', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderIdentifierSchema.parse(args);
        const response = await operations.get(validated.wonum, validated.siteid);
        return response;
      },
    },

    // Tool 3: Update Work Order
    {
      name: 'maximo_update_workorder',
      description:
        'Update work order fields. Specify wonum and siteid to identify the work order, ' +
        'then provide any fields to update (description, asset, location, dates, assignments, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: { type: 'string', description: 'Work order description' },
              assetnum: { type: 'string', description: 'Asset number' },
              location: { type: 'string', description: 'Location code' },
              priority: { type: 'number', description: 'Priority 1-5', minimum: 1, maximum: 5 },
              schedstart: { type: 'string', description: 'Scheduled start date (ISO 8601)' },
              schedfinish: { type: 'string', description: 'Scheduled finish date (ISO 8601)' },
              actstart: { type: 'string', description: 'Actual start date (ISO 8601)' },
              actfinish: { type: 'string', description: 'Actual finish date (ISO 8601)' },
              targstartdate: { type: 'string', description: 'Target start date (ISO 8601)' },
              targcompdate: { type: 'string', description: 'Target completion date (ISO 8601)' },
              owner: { type: 'string', description: 'Work order owner' },
              ownergroup: { type: 'string', description: 'Owner group' },
              supervisor: { type: 'string', description: 'Supervisor' },
              lead: { type: 'string', description: 'Lead person' },
              wopriority: { type: 'number', description: 'Work order priority 1-5' },
              estdur: { type: 'number', description: 'Estimated duration in hours' },
              description_longdescription: { type: 'string', description: 'Long description' },
              failurecode: { type: 'string', description: 'Failure code' },
              problemcode: { type: 'string', description: 'Problem code' },
              woclass: { type: 'string', description: 'Work order class' },
              glaccount: { type: 'string', description: 'GL debit account' },
              crewworkgroup: { type: 'string', description: 'Crew work group' },
              externalrefid: { type: 'string', description: 'External reference ID' },
            },
          },
        },
        required: ['wonum', 'siteid', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_workorder', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderUpdateSchema.parse(args.updates);
        const response = await operations.update(args.wonum, args.siteid, validated);
        return response;
      },
    },

    // Tool 4: Delete Work Order
    {
      name: 'maximo_delete_workorder',
      description:
        'Delete a work order from Maximo. Requires work order number and site ID. ' +
        'This operation cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_workorder', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderIdentifierSchema.parse(args);
        const response = await operations.delete(validated.wonum, validated.siteid);
        return response;
      },
    },

    // Tool 5: Change Work Order Status
    {
      name: 'maximo_change_workorder_status',
      description:
        'Change work order status following Maximo workflow: WAPPR → APPR → WSCH → INPRG → COMP → CLOSE. ' +
        'Status transitions are validated. Optionally include a memo for the status change.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          status: {
            type: 'string',
            enum: ['WAPPR', 'APPR', 'WSCH', 'INPRG', 'COMP', 'CLOSE', 'CAN'],
            description: 'New status: WAPPR (Waiting Approval), APPR (Approved), WSCH (Waiting Schedule), INPRG (In Progress), COMP (Complete), CLOSE (Closed), CAN (Cancelled)',
          },
          memo: {
            type: 'string',
            description: 'Status change memo (optional, max 50 characters)',
          },
        },
        required: ['wonum', 'siteid', 'status'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_change_workorder_status', {
          wonum: args.wonum,
          siteid: args.siteid,
          status: args.status,
        });
        const validated = statusChangeSchema.parse(args);
        const response = await operations.changeStatus(
          validated.wonum,
          validated.siteid,
          validated.status,
          validated.memo
        );
        return response;
      },
    },

    // Tool 6: Add Labor
    {
      name: 'maximo_add_labor',
      description:
        'Add labor transaction to a work order. Records labor hours, craft, and costs. ' +
        'Requires work order number, site ID, labor code, hours, and transaction date.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          laborcode: {
            type: 'string',
            description: 'Labor code (required)',
          },
          hours: {
            type: 'number',
            description: 'Hours worked (required, must be > 0)',
            minimum: 0.01,
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (required)',
          },
          starttime: {
            type: 'string',
            description: 'Start time in ISO 8601 format (optional)',
          },
          finishtime: {
            type: 'string',
            description: 'Finish time in ISO 8601 format (optional)',
          },
          regularhrs: {
            type: 'number',
            description: 'Regular hours (optional)',
          },
          premiumpayhours: {
            type: 'number',
            description: 'Premium pay hours (optional)',
          },
          craft: {
            type: 'string',
            description: 'Craft code (optional)',
          },
          skilllevel: {
            type: 'string',
            description: 'Skill level (optional)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor (optional)',
          },
          contractnum: {
            type: 'string',
            description: 'Contract number (optional)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (optional)',
          },
          taskid: {
            type: 'string',
            description: 'Task ID (optional)',
          },
          geolocation: {
            type: 'string',
            description: 'Geolocation (optional)',
          },
        },
        required: ['wonum', 'siteid', 'laborcode', 'hours', 'transdate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_labor', {
          wonum: args.wonum,
          siteid: args.siteid,
          laborcode: args.laborcode,
        });
        const validated = laborTransactionSchema.parse(args);
        const { wonum, siteid, ...laborData } = validated;
        const response = await operations.addLabor(wonum, siteid, laborData as any);
        return response;
      },
    },

    // Tool 7: Add Material
    {
      name: 'maximo_add_material',
      description:
        'Add material usage to a work order. Records material consumption from inventory. ' +
        'Requires work order number, site ID, item number, and quantity.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          itemnum: {
            type: 'string',
            description: 'Item number (required)',
          },
          quantity: {
            type: 'number',
            description: 'Quantity (required, must be > 0)',
            minimum: 0.01,
          },
          storeroom: {
            type: 'string',
            description: 'Storeroom location (optional)',
          },
          binnum: {
            type: 'string',
            description: 'Bin number (optional)',
          },
          lotnum: {
            type: 'string',
            description: 'Lot number (optional)',
          },
          issuetype: {
            type: 'string',
            description: 'Issue type (optional)',
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (optional)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (optional)',
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional)',
          },
          taskid: {
            type: 'string',
            description: 'Task ID (optional)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional)',
          },
          glcreditacct: {
            type: 'string',
            description: 'GL credit account (optional)',
          },
          conversion: {
            type: 'number',
            description: 'Conversion factor (optional)',
          },
          issueunit: {
            type: 'string',
            description: 'Issue unit (optional)',
          },
        },
        required: ['wonum', 'siteid', 'itemnum', 'quantity'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_material', {
          wonum: args.wonum,
          siteid: args.siteid,
          itemnum: args.itemnum,
        });
        const validated = materialTransactionSchema.parse(args);
        const { wonum, siteid, ...materialData } = validated;
        const response = await operations.addMaterial(wonum, siteid, materialData as any);
        return response;
      },
    },

    // Tool 8: Add Service
    {
      name: 'maximo_add_service',
      description:
        'Add service entry to a work order. Records external service costs. ' +
        'Requires work order number, site ID, description, and line cost.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          description: {
            type: 'string',
            description: 'Service description (required, max 100 characters)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (required, must be >= 0)',
            minimum: 0,
          },
          vendor: {
            type: 'string',
            description: 'Vendor (optional)',
          },
          contractnum: {
            type: 'string',
            description: 'Contract number (optional)',
          },
          ponum: {
            type: 'string',
            description: 'Purchase order number (optional)',
          },
          polinenum: {
            type: 'number',
            description: 'Purchase order line number (optional)',
          },
          taskid: {
            type: 'string',
            description: 'Task ID (optional)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional)',
          },
          enterdate: {
            type: 'string',
            description: 'Entry date in ISO 8601 format (optional)',
          },
          enterby: {
            type: 'string',
            description: 'Entered by (optional)',
          },
        },
        required: ['wonum', 'siteid', 'description', 'linecost'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_service', { wonum: args.wonum, siteid: args.siteid });
        const validated = serviceEntrySchema.parse(args);
        const { wonum, siteid, ...serviceData } = validated;
        const response = await operations.addService(wonum, siteid, serviceData as any);
        return response;
      },
    },

    // Tool 9: Add Work Log
    {
      name: 'maximo_add_worklog',
      description:
        'Add work log entry to a work order. Records notes, updates, and communications. ' +
        'Requires work order number, site ID, and description.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          description: {
            type: 'string',
            description: 'Log description/summary (required, max 100 characters)',
          },
          logtype: {
            type: 'string',
            enum: ['WORK', 'UPDATE', 'CLIENTNOTE', 'MODDATE'],
            description: 'Log type: WORK (Work Log), UPDATE (Update), CLIENTNOTE (Client Note), MODDATE (Modification Date)',
          },
          description_longdescription: {
            type: 'string',
            description: 'Detailed log text (optional)',
          },
          createdate: {
            type: 'string',
            description: 'Create date in ISO 8601 format (optional)',
          },
          createby: {
            type: 'string',
            description: 'Created by (optional)',
          },
          clientviewable: {
            type: 'boolean',
            description: 'Client viewable flag (optional)',
          },
          class: {
            type: 'string',
            description: 'Work log class (optional)',
          },
        },
        required: ['wonum', 'siteid', 'description'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_worklog', { wonum: args.wonum, siteid: args.siteid });
        const validated = workLogSchema.parse(args);
        const { wonum, siteid, ...worklogData } = validated;
        const response = await operations.addWorkLog(wonum, siteid, worklogData as any);
        return response;
      },
    },

    // Tool 10: Assign Work Order
    {
      name: 'maximo_assign_workorder',
      description:
        'Assign work order to person, group, or crew. Updates ownership and responsibility. ' +
        'At least one assignment field must be provided.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          owner: {
            type: 'string',
            description: 'Assigned owner (optional)',
          },
          ownergroup: {
            type: 'string',
            description: 'Assigned owner group (optional)',
          },
          supervisor: {
            type: 'string',
            description: 'Assigned supervisor (optional)',
          },
          lead: {
            type: 'string',
            description: 'Assigned lead person (optional)',
          },
          crewworkgroup: {
            type: 'string',
            description: 'Assigned crew work group (optional)',
          },
          assignmentdate: {
            type: 'string',
            description: 'Assignment date in ISO 8601 format (optional)',
          },
          scheduledate: {
            type: 'string',
            description: 'Schedule date in ISO 8601 format (optional)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_assign_workorder', { wonum: args.wonum, siteid: args.siteid });
        const validated = assignmentSchema.parse(args);
        const { wonum, siteid, ...assignmentData } = validated;
        const response = await operations.assign(wonum, siteid, assignmentData as any);
        return response;
      },
    },

    // Tool 11: Search Work Orders
    {
      name: 'maximo_search_workorders',
      description:
        'Search work orders with flexible filters. Supports filtering by status, asset, location, ' +
        'work type, priority, owner, dates, and more. Returns paginated results.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            oneOf: [
              { type: 'string', enum: ['WAPPR', 'APPR', 'WSCH', 'INPRG', 'COMP', 'CLOSE', 'CAN'] },
              {
                type: 'array',
                items: { type: 'string', enum: ['WAPPR', 'APPR', 'WSCH', 'INPRG', 'COMP', 'CLOSE', 'CAN'] },
              },
            ],
            description: 'Filter by status (single value or array)',
          },
          assetnum: {
            type: 'string',
            description: 'Filter by asset number',
          },
          location: {
            type: 'string',
            description: 'Filter by location',
          },
          worktype: {
            oneOf: [
              { type: 'string', enum: ['CM', 'PM', 'EM', 'CAL', 'INS'] },
              { type: 'array', items: { type: 'string', enum: ['CM', 'PM', 'EM', 'CAL', 'INS'] } },
            ],
            description: 'Filter by work type (single value or array)',
          },
          priority: {
            type: 'number',
            description: 'Filter by priority (1-5)',
            minimum: 1,
            maximum: 5,
          },
          owner: {
            type: 'string',
            description: 'Filter by owner',
          },
          ownergroup: {
            type: 'string',
            description: 'Filter by owner group',
          },
          supervisor: {
            type: 'string',
            description: 'Filter by supervisor',
          },
          siteid: {
            type: 'string',
            description: 'Filter by site',
          },
          orgid: {
            type: 'string',
            description: 'Filter by organization',
          },
          dateRange: {
            type: 'object',
            description: 'Filter by date range',
            properties: {
              start: {
                type: 'string',
                description: 'Start date in ISO 8601 format',
              },
              end: {
                type: 'string',
                description: 'End date in ISO 8601 format',
              },
              field: {
                type: 'string',
                enum: ['schedstart', 'schedfinish', 'actstart', 'actfinish', 'statusdate', 'targstartdate', 'targcompdate'],
                description: 'Date field to filter on (default: statusdate)',
              },
            },
            required: ['start', 'end'],
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
            description: 'Sort order (OSLC orderBy), e.g., "+wonum" or "-statusdate"',
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
        logger.info('Executing maximo_search_workorders', { criteria: args });
        const validated = workOrderSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 12: Add Task
    {
      name: 'maximo_add_task',
      description:
        'Add a task (child activity) to a work order. Tasks represent individual steps or activities ' +
        'within a work order. Requires work order number, site ID, task description, and task ID (sequence number).',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          description: {
            type: 'string',
            description: 'Task description (required, max 100 characters)',
          },
          taskid: {
            type: 'number',
            description: 'Task ID / sequence number (required, positive integer)',
            minimum: 1,
          },
          estdur: {
            type: 'number',
            description: 'Estimated duration in hours (optional)',
            minimum: 0,
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group for the task (optional)',
          },
          owner: {
            type: 'string',
            description: 'Task owner (optional)',
          },
        },
        required: ['wonum', 'siteid', 'description', 'taskid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_task', {
          wonum: args.wonum,
          siteid: args.siteid,
          taskid: args.taskid,
        });
        const validated = taskSchema.parse(args);
        const { wonum, siteid, ...taskData } = validated;
        const response = await operations.addTask(wonum, siteid, taskData as any);
        return response;
      },
    },

    // Tool 13: Get Tasks
    {
      name: 'maximo_get_tasks',
      description:
        'Retrieve all tasks (child activities) for a work order. Returns the woactivity array ' +
        'containing task details such as description, task ID, estimated duration, and assignments.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_tasks', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderIdentifierSchema.parse(args);
        const response = await operations.getTasks(validated.wonum, validated.siteid);
        return response;
      },
    },

    // Tool 14: Get Work Logs
    {
      name: 'maximo_get_worklogs',
      description:
        'Retrieve all work log entries for a work order. Returns the worklog array ' +
        'containing log details such as description, log type, timestamps, and long descriptions.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_worklogs', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderIdentifierSchema.parse(args);
        const response = await operations.getWorkLogs(validated.wonum, validated.siteid);
        return response;
      },
    },

    // Tool 15: Close Work Order
    {
      name: 'maximo_close_workorder',
      description:
        'Close a work order. The work order must be in COMP (Completed) status before it can be closed. ' +
        'This is a convenience method that validates the current status and transitions to CLOSE.',
      inputSchema: {
        type: 'object',
        properties: {
          wonum: {
            type: 'string',
            description: 'Work order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          memo: {
            type: 'string',
            description: 'Close memo (optional, max 50 characters)',
          },
        },
        required: ['wonum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_close_workorder', { wonum: args.wonum, siteid: args.siteid });
        const validated = workOrderIdentifierSchema.parse(args);
        const response = await operations.close(validated.wonum, validated.siteid, args.memo);
        return response;
      },
    },
  ];
}