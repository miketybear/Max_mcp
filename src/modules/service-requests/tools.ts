/**
 * MCP Tools for Service Request Module
 * Defines 7 MCP tools for comprehensive service request management
 */

import { ServiceRequestOperations } from './operations';
import {
  serviceRequestCreateSchema,
  serviceRequestUpdateSchema,
  serviceRequestSearchSchema,
  srWorkLogSchema,
  srAssignSchema,
  srEscalateSchema,
  srSolutionSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ServiceRequestTools');

/**
 * Create MCP tools for service request operations
 * @param operations - ServiceRequestOperations instance
 * @returns Array of MCP tool definitions
 */
export function createServiceRequestTools(operations: ServiceRequestOperations) {
  return [
    // Tool 1: Create Service Request
    {
      name: 'maximo_create_sr',
      description:
        'Create a new service request in Maximo. Requires description, reportedby, and siteid. ' +
        'Optionally specify affected person, asset, location, priority, classification, and contact information.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Service request description (required, max 100 characters)',
          },
          reportedby: {
            type: 'string',
            description: 'Person who reported the service request (required, max 30 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          affectedperson: {
            type: 'string',
            description: 'Affected person (optional, max 30 characters)',
          },
          assetnum: {
            type: 'string',
            description: 'Asset number (optional, max 12 characters)',
          },
          location: {
            type: 'string',
            description: 'Location code (optional, max 12 characters)',
          },
          reportedpriority: {
            type: 'number',
            description: 'Reported priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          classstructureid: {
            type: 'string',
            description: 'Classification structure ID (optional, max 20 characters)',
          },
          owner: {
            type: 'string',
            description: 'Service request owner (optional, max 30 characters)',
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group (optional, max 8 characters)',
          },
          targetstart: {
            type: 'string',
            description: 'Target start date in ISO 8601 format (optional)',
          },
          targetfinish: {
            type: 'string',
            description: 'Target finish date in ISO 8601 format (optional)',
          },
          externalsystem: {
            type: 'string',
            description: 'External system identifier (optional, max 10 characters)',
          },
          externalrefid: {
            type: 'string',
            description: 'External reference ID (optional, max 10 characters)',
          },
          commodity: {
            type: 'string',
            description: 'Commodity code (optional, max 8 characters)',
          },
          commoditygroup: {
            type: 'string',
            description: 'Commodity group (optional, max 8 characters)',
          },
          description_longdescription: {
            type: 'string',
            description: 'Long description (optional)',
          },
          class: {
            type: 'string',
            description: 'Service request class (optional, max 16 characters)',
          },
          tickettype: {
            type: 'string',
            description: 'Service request type (optional, max 16 characters)',
          },
          contact: {
            type: 'string',
            description: 'Contact information (optional, max 30 characters)',
          },
          phone: {
            type: 'string',
            description: 'Phone number (optional, max 20 characters)',
          },
          email: {
            type: 'string',
            description: 'Email address (optional)',
          },
          building: {
            type: 'string',
            description: 'Building (optional, max 12 characters)',
          },
          floor: {
            type: 'string',
            description: 'Floor (optional, max 12 characters)',
          },
          room: {
            type: 'string',
            description: 'Room (optional, max 12 characters)',
          },
          supervisor: {
            type: 'string',
            description: 'Supervisor (optional, max 30 characters)',
          },
          parentticket: {
            type: 'string',
            description: 'Parent ticket ID (optional, max 10 characters)',
          },
        },
        required: ['description', 'reportedby', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_sr', { siteid: args.siteid, reportedby: args.reportedby });
        const validated = serviceRequestCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get Service Request
    {
      name: 'maximo_get_sr',
      description:
        'Retrieve service request details by ticket ID and site ID. ' +
        'Returns complete service request information including status, dates, assignments, and related work order.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['ticketid', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_sr', { ticketid: args.ticketid, siteid: args.siteid });
        const response = await operations.get(args.ticketid, args.siteid);
        return response;
      },
    },

    // Tool 3: Update Service Request
    {
      name: 'maximo_update_sr',
      description:
        'Update service request fields. Specify ticketid and siteid to identify the service request, ' +
        'then provide any fields to update (description, status, asset, location, priority, assignments, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: { type: 'string', description: 'Service request description' },
              status: {
                type: 'string',
                enum: ['NEW', 'QUEUED', 'INPROG', 'PENDING', 'RESOLVED', 'CLOSED', 'CANCELLED'],
                description: 'Service request status',
              },
              affectedperson: { type: 'string', description: 'Affected person' },
              assetnum: { type: 'string', description: 'Asset number' },
              location: { type: 'string', description: 'Location code' },
              classstructureid: { type: 'string', description: 'Classification structure ID' },
              owner: { type: 'string', description: 'Service request owner' },
              ownergroup: { type: 'string', description: 'Owner group' },
              targetstart: { type: 'string', description: 'Target start date (ISO 8601)' },
              targetfinish: { type: 'string', description: 'Target finish date (ISO 8601)' },
              actstart: { type: 'string', description: 'Actual start date (ISO 8601)' },
              actfinish: { type: 'string', description: 'Actual finish date (ISO 8601)' },
              reportedpriority: { type: 'number', description: 'Reported priority 1-5', minimum: 1, maximum: 5 },
              commodity: { type: 'string', description: 'Commodity code' },
              commoditygroup: { type: 'string', description: 'Commodity group' },
              description_longdescription: { type: 'string', description: 'Long description' },
              class: { type: 'string', description: 'Service request class' },
              tickettype: { type: 'string', description: 'Service request type' },
              contact: { type: 'string', description: 'Contact information' },
              phone: { type: 'string', description: 'Phone number' },
              email: { type: 'string', description: 'Email address' },
              building: { type: 'string', description: 'Building' },
              floor: { type: 'string', description: 'Floor' },
              room: { type: 'string', description: 'Room' },
              supervisor: { type: 'string', description: 'Supervisor' },
              resolutioncode: { type: 'string', description: 'Resolution code' },
              solution: { type: 'string', description: 'Solution' },
            },
          },
        },
        required: ['ticketid', 'siteid', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_sr', { ticketid: args.ticketid, siteid: args.siteid });
        const validated = serviceRequestUpdateSchema.parse(args.updates);
        const response = await operations.update(args.ticketid, args.siteid, validated);
        return response;
      },
    },

    // Tool 4: Delete Service Request
    {
      name: 'maximo_delete_sr',
      description:
        'Delete a service request from Maximo. Requires ticket ID and site ID. ' +
        'This operation cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['ticketid', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_sr', { ticketid: args.ticketid, siteid: args.siteid });
        const response = await operations.delete(args.ticketid, args.siteid);
        return response;
      },
    },

    // Tool 5: Change Service Request Status
    {
      name: 'maximo_change_sr_status',
      description:
        'Change service request status following the workflow: NEW → QUEUED → INPROG → PENDING → RESOLVED → CLOSED. ' +
        'Can also transition to CANCELLED from most statuses. Validates status transitions and requires resolution code for RESOLVED/CLOSED.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          status: {
            type: 'string',
            enum: ['NEW', 'QUEUED', 'INPROG', 'PENDING', 'RESOLVED', 'CLOSED', 'CANCELLED'],
            description: 'New status (required)',
          },
          memo: {
            type: 'string',
            description: 'Status change memo/reason (optional, max 255 characters)',
          },
          resolutioncode: {
            type: 'string',
            description: 'Resolution code (required for RESOLVED/CLOSED status, max 8 characters)',
          },
          solution: {
            type: 'string',
            description: 'Solution description (optional, for RESOLVED/CLOSED status)',
          },
        },
        required: ['ticketid', 'siteid', 'status'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_change_sr_status', {
          ticketid: args.ticketid,
          siteid: args.siteid,
          status: args.status,
        });
        const response = await operations.changeStatus(
          args.ticketid,
          args.siteid,
          args.status,
          args.memo
        );
        return response;
      },
    },

    // Tool 6: Convert Service Request to Work Order
    {
      name: 'maximo_convert_sr_to_wo',
      description:
        'Convert a service request to a work order. Creates a new work order with data from the service request ' +
        'and links it back to the service request. Optionally specify work type, description, priority, and schedule dates.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          worktype: {
            type: 'string',
            description: 'Work type for the new work order (optional, defaults to CM - Corrective Maintenance, max 5 characters)',
          },
          description: {
            type: 'string',
            description: 'Work order description (optional, defaults to SR description, max 100 characters)',
          },
          priority: {
            type: 'number',
            description: 'Work order priority 1-5 (optional, defaults to SR priority)',
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
          owner: {
            type: 'string',
            description: 'Work order owner (optional, defaults to SR owner)',
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group (optional, defaults to SR owner group)',
          },
        },
        required: ['ticketid', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_convert_sr_to_wo', {
          ticketid: args.ticketid,
          siteid: args.siteid,
          worktype: args.worktype,
        });
        const response = await operations.convertToWorkOrder(
          args.ticketid,
          args.siteid,
          args.worktype
        );
        return response;
      },
    },

    // Tool 7: Search Service Requests
    {
      name: 'maximo_search_srs',
      description:
        'Search service requests with flexible filtering options. Filter by status, reported by, affected person, ' +
        'asset, location, priority, owner, classification, commodity, date ranges, and more. Supports pagination and field selection.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            oneOf: [
              {
                type: 'string',
                enum: ['NEW', 'QUEUED', 'INPROG', 'PENDING', 'RESOLVED', 'CLOSED', 'CANCELLED'],
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['NEW', 'QUEUED', 'INPROG', 'PENDING', 'RESOLVED', 'CLOSED', 'CANCELLED'],
                },
              },
            ],
            description: 'Filter by status (single value or array)',
          },
          reportedby: {
            type: 'string',
            description: 'Filter by person who reported the service request',
          },
          affectedperson: {
            type: 'string',
            description: 'Filter by affected person',
          },
          assetnum: {
            type: 'string',
            description: 'Filter by asset number',
          },
          location: {
            type: 'string',
            description: 'Filter by location',
          },
          reportedpriority: {
            type: 'number',
            description: 'Filter by reported priority (1-5)',
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
          siteid: {
            type: 'string',
            description: 'Filter by site',
          },
          orgid: {
            type: 'string',
            description: 'Filter by organization',
          },
          classstructureid: {
            type: 'string',
            description: 'Filter by classification',
          },
          commodity: {
            type: 'string',
            description: 'Filter by commodity',
          },
          commoditygroup: {
            type: 'string',
            description: 'Filter by commodity group',
          },
          tickettype: {
            type: 'string',
            description: 'Filter by ticket type',
          },
          relatedwonum: {
            type: 'string',
            description: 'Filter by related work order number',
          },
          dateRange: {
            type: 'object',
            description: 'Filter by date range',
            properties: {
              start: {
                type: 'string',
                description: 'Start date in ISO 8601 format (required)',
              },
              end: {
                type: 'string',
                description: 'End date in ISO 8601 format (required)',
              },
              field: {
                type: 'string',
                enum: ['reportdate', 'statusdate', 'targetstart', 'targetfinish', 'actstart', 'actfinish', 'resolveddate', 'closeddate'],
                description: 'Date field to filter on (optional, defaults to reportdate)',
              },
            },
            required: ['start', 'end'],
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (optional, default 100, max 1000)',
            minimum: 1,
            maximum: 1000,
          },
          page: {
            type: 'number',
            description: 'Page number (optional, default 1)',
            minimum: 1,
          },
          select: {
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to return (optional, returns all fields if not specified)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (optional, e.g., "+ticketid" for ascending, "-reportdate" for descending)',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause (optional, for advanced filtering)',
          },
          searchTerms: {
            type: 'string',
            description: 'Search terms for full-text search (optional)',
          },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_search_srs', { criteria: args });
        const validated = serviceRequestSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 8: Add Work Log to Service Request
    {
      name: 'maximo_add_sr_worklog',
      description:
        'Add a work log entry to a service request. Records notes, updates, and communications. ' +
        'Requires ticket ID, site ID, and description. Optionally specify log type and detailed text.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
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
            enum: ['CLIENTNOTE', 'WORK', 'UPDATE', 'MODDATE'],
            description:
              'Log type: CLIENTNOTE (Client Note, default), WORK (Work Log), UPDATE (Update), MODDATE (Modification Date)',
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
            description: 'Created by person (optional, max 30 characters)',
          },
          clientviewable: {
            type: 'boolean',
            description: 'Client viewable flag (optional)',
          },
          class: {
            type: 'string',
            description: 'Work log class (optional, max 16 characters)',
          },
        },
        required: ['ticketid', 'siteid', 'description'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_sr_worklog', { ticketid: args.ticketid, siteid: args.siteid });
        const validated = srWorkLogSchema.parse(args);
        const { ticketid, siteid, ...worklogData } = validated;
        const response = await operations.addWorkLog(ticketid, siteid, worklogData as any);
        return response;
      },
    },

    // Tool 9: Assign Service Request
    {
      name: 'maximo_assign_sr',
      description:
        'Assign a service request to a person or group. Updates the owner and optionally the owner group. ' +
        'Requires ticket ID, site ID, and owner (person).',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          owner: {
            type: 'string',
            description: 'Person to assign as owner (required, max 30 characters)',
          },
          ownergroup: {
            type: 'string',
            description: 'Owner group (optional, max 8 characters)',
          },
        },
        required: ['ticketid', 'siteid', 'owner'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_assign_sr', { ticketid: args.ticketid, siteid: args.siteid });
        const validated = srAssignSchema.parse(args);
        const { ticketid, siteid, ...assignData } = validated;
        const response = await operations.assign(ticketid, siteid, assignData as any);
        return response;
      },
    },

    // Tool 10: Escalate Service Request
    {
      name: 'maximo_escalate_sr',
      description:
        'Escalate a service request by changing its priority and optionally reassigning to a different group. ' +
        'Adds escalation reason as a work log entry. Requires ticket ID, site ID, new priority (1-5), and escalation reason.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          newPriority: {
            type: 'number',
            description: 'New priority level 1-5, where 1 is highest (required)',
            minimum: 1,
            maximum: 5,
          },
          escalationReason: {
            type: 'string',
            description: 'Reason for escalation, added as work log entry (required, max 255 characters)',
          },
          newOwnerGroup: {
            type: 'string',
            description: 'New owner group for escalation routing (optional, max 8 characters)',
          },
        },
        required: ['ticketid', 'siteid', 'newPriority', 'escalationReason'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_escalate_sr', { ticketid: args.ticketid, siteid: args.siteid });
        const validated = srEscalateSchema.parse(args);
        const { ticketid, siteid, ...escalateData } = validated;
        const response = await operations.escalate(ticketid, siteid, escalateData as any);
        return response;
      },
    },

    // Tool 11: Get Related Work Orders
    {
      name: 'maximo_get_sr_related_wos',
      description:
        'Retrieve work orders that were created from a service request. ' +
        'Queries work orders linked to the specified service request ticket ID.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['ticketid', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_sr_related_wos', { ticketid: args.ticketid, siteid: args.siteid });
        const response = await operations.getRelatedWorkOrders(args.ticketid, args.siteid);
        return response;
      },
    },

    // Tool 12: Add Solution to Service Request
    {
      name: 'maximo_add_sr_solution',
      description:
        'Add a solution/resolution to a service request. Optionally auto-resolve the service request ' +
        'by setting autoResolve to true, which changes the status to RESOLVED.',
      inputSchema: {
        type: 'object',
        properties: {
          ticketid: {
            type: 'string',
            description: 'Service request ticket ID (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          solution: {
            type: 'string',
            description: 'Solution/resolution text (required)',
          },
          autoResolve: {
            type: 'boolean',
            description: 'If true, automatically changes status to RESOLVED (optional, default false)',
          },
        },
        required: ['ticketid', 'siteid', 'solution'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_sr_solution', { ticketid: args.ticketid, siteid: args.siteid });
        const validated = srSolutionSchema.parse(args);
        const { ticketid, siteid, ...solutionData } = validated;
        const response = await operations.addSolution(ticketid, siteid, solutionData as any);
        return response;
      },
    },
  ];
}