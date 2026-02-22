/**
 * MCP Tools for Person and Labor Module
 * Defines 6 MCP tools for comprehensive person and labor management
 */

import { PersonLaborOperations } from './operations';
import {
  personCreateSchema,
  personUpdateSchema,
  personSearchSchema,
  personIdentifierSchema,
  laborTransactionCreateSchema,
  laborTransactionSearchSchema,
  getCraftsSchema,
  addCraftSchema,
  getCrewsSchema,
  getCrewMembersSchema,
  qualifiedLaborSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('PersonLaborTools');

/**
 * Create MCP tools for person and labor operations
 * @param operations - PersonLaborOperations instance
 * @returns Array of MCP tool definitions
 */
export function createPersonLaborTools(operations: PersonLaborOperations) {
  return [
    {
      name: 'maximo_create_person',
      description:
        'Create a new person record in Maximo. Requires personid and displayname. ' +
        'Optionally specify email, status, labor code, contact information, department, and craft.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required, max 30 characters)' },
          displayname: { type: 'string', description: 'Display name (required, max 100 characters)' },
          primaryemail: { type: 'string', description: 'Primary email address (optional)' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'], description: 'Person status (optional)' },
          siteid: { type: 'string', description: 'Site identifier (optional)' },
          orgid: { type: 'string', description: 'Organization identifier (optional)' },
          laborcode: { type: 'string', description: 'Labor code (optional)' },
          phonenum: { type: 'string', description: 'Phone number (optional)' },
          mobilephone: { type: 'string', description: 'Mobile phone number (optional)' },
          department: { type: 'string', description: 'Department (optional)' },
          jobtitle: { type: 'string', description: 'Job title (optional)' },
          manager: { type: 'string', description: 'Manager person ID (optional)' },
          crewid: { type: 'string', description: 'Crew ID (optional)' },
          craft: { type: 'string', description: 'Craft (optional)' },
          skilllevel: { type: 'string', description: 'Skill level (optional)' },
          comments: { type: 'string', description: 'Comments (optional)' },
        },
        required: ['personid', 'displayname'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_person', { personid: args.personid });
        const validated = personCreateSchema.parse(args);
        return await operations.createPerson(validated);
      },
    },
    {
      name: 'maximo_get_person',
      description: 'Retrieve person details by person ID. Returns complete person information.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
        },
        required: ['personid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_person', { personid: args.personid });
        const validated = personIdentifierSchema.parse(args);
        return await operations.getPerson(validated.personid);
      },
    },
    {
      name: 'maximo_update_person',
      description: 'Update person record fields. Specify personid and provide fields to update.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              displayname: { type: 'string', description: 'Display name' },
              primaryemail: { type: 'string', description: 'Primary email address' },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'], description: 'Person status' },
              laborcode: { type: 'string', description: 'Labor code' },
              phonenum: { type: 'string', description: 'Phone number' },
              mobilephone: { type: 'string', description: 'Mobile phone number' },
              department: { type: 'string', description: 'Department' },
              jobtitle: { type: 'string', description: 'Job title' },
              manager: { type: 'string', description: 'Manager person ID' },
              crewid: { type: 'string', description: 'Crew ID' },
              craft: { type: 'string', description: 'Craft' },
              skilllevel: { type: 'string', description: 'Skill level' },
              comments: { type: 'string', description: 'Comments' },
            },
          },
        },
        required: ['personid', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_person', { personid: args.personid });
        const validated = personUpdateSchema.parse(args.updates);
        return await operations.updatePerson(args.personid, validated);
      },
    },
    {
      name: 'maximo_record_labor',
      description:
        'Record a labor transaction. Requires laborcode and transdate. ' +
        'Optionally specify work order reference, hours (regular/overtime/double), and transaction type.',
      inputSchema: {
        type: 'object',
        properties: {
          laborcode: { type: 'string', description: 'Labor code (required)' },
          refwo: { type: 'string', description: 'Reference work order (optional)' },
          transdate: { type: 'string', description: 'Transaction date in ISO 8601 format (required)' },
          regularhrs: { type: 'number', description: 'Regular hours (optional)' },
          overtimehrs: { type: 'number', description: 'Overtime hours (optional)' },
          doublehrs: { type: 'number', description: 'Double time hours (optional)' },
          transtype: {
            type: 'string',
            enum: ['REGULAR', 'OVERTIME', 'DOUBLE', 'VACATION', 'SICK', 'HOLIDAY'],
            description: 'Transaction type (optional)',
          },
          startdate: { type: 'string', description: 'Start date/time in ISO 8601 format (optional)' },
          finishdate: { type: 'string', description: 'Finish date/time in ISO 8601 format (optional)' },
          payrate: { type: 'number', description: 'Pay rate (optional)' },
          comments: { type: 'string', description: 'Comments (optional)' },
        },
        required: ['laborcode', 'transdate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_record_labor', { laborcode: args.laborcode });
        const validated = laborTransactionCreateSchema.parse(args);
        return await operations.recordLabor(validated);
      },
    },
    {
      name: 'maximo_get_labor_transactions',
      description:
        'Get labor transaction history. Filter by labor code, work order, date range, or transaction type. ' +
        'Supports pagination with pageSize and pageNum parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          laborcode: { type: 'string', description: 'Labor code filter (optional)' },
          refwo: { type: 'string', description: 'Work order filter (optional)' },
          dateFrom: { type: 'string', description: 'Date range start in ISO 8601 format (optional)' },
          dateTo: { type: 'string', description: 'Date range end in ISO 8601 format (optional)' },
          transtype: {
            type: 'string',
            enum: ['REGULAR', 'OVERTIME', 'DOUBLE', 'VACATION', 'SICK', 'HOLIDAY'],
            description: 'Transaction type filter (optional)',
          },
          pageSize: { type: 'number', description: 'Results per page (optional, default: 100, max: 1000)', minimum: 1, maximum: 1000 },
          pageNum: { type: 'number', description: 'Page number (optional, default: 1)', minimum: 1 },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_labor_transactions', { filters: Object.keys(args) });
        const validated = laborTransactionSearchSchema.parse(args);
        return await operations.getLaborTransactions(validated);
      },
    },
    {
      name: 'maximo_search_persons',
      description:
        'Search persons with filters. Filter by status, display name, site, department, craft, or crew. ' +
        'Supports pagination with pageSize and pageNum parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            oneOf: [
              { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'], description: 'Person status' },
              { type: 'array', items: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'] }, description: 'Multiple status values' },
            ],
          },
          displayname: { type: 'string', description: 'Display name search (optional)' },
          siteid: { type: 'string', description: 'Site identifier filter (optional)' },
          department: { type: 'string', description: 'Department filter (optional)' },
          craft: { type: 'string', description: 'Craft filter (optional)' },
          crewid: { type: 'string', description: 'Crew ID filter (optional)' },
          pageSize: { type: 'number', description: 'Results per page (optional, default: 100, max: 1000)', minimum: 1, maximum: 1000 },
          pageNum: { type: 'number', description: 'Page number (optional, default: 1)', minimum: 1 },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_search_persons', { filters: Object.keys(args) });
        const validated = personSearchSchema.parse(args);
        return await operations.searchPersons(validated);
      },
    },
    {
      name: 'maximo_get_person_crafts',
      description:
        'Get all crafts/skills assigned to a person. Returns craft code, skill level, rate, and standard rate ' +
        'from the PERSONCRAFTRATE child objects.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
          siteid: { type: 'string', description: 'Site identifier (optional)' },
        },
        required: ['personid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_person_crafts', { personid: args.personid });
        const validated = getCraftsSchema.parse(args);
        return await operations.getCrafts(validated.personid, validated.siteid);
      },
    },
    {
      name: 'maximo_add_person_craft',
      description:
        'Add a craft/skill to a person. Creates a PERSONCRAFTRATE record linked to the person. ' +
        'Requires personid, craft code, and skill level. Optionally specify a pay rate.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
          craft: { type: 'string', description: 'Craft code (required, max 8 characters)' },
          skilllevel: {
            type: 'string',
            enum: ['APPRENTICE', 'SEMISKILLED', 'SKILLED', 'EXPERT'],
            description: 'Skill level (required)',
          },
          rate: { type: 'number', description: 'Pay rate (optional)', minimum: 0 },
        },
        required: ['personid', 'craft', 'skilllevel'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_person_craft', {
          personid: args.personid,
          craft: args.craft,
        });
        const validated = addCraftSchema.parse(args);
        return await operations.addCraft(validated);
      },
    },
    {
      name: 'maximo_get_labor_crews',
      description:
        'Get all labor crews. Optionally filter by site ID. Returns crew ID, description, ' +
        'crew type, calendar, organization, and site.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: { type: 'string', description: 'Site identifier filter (optional)' },
        },
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_labor_crews', { siteid: args.siteid });
        const validated = getCrewsSchema.parse(args);
        return await operations.getCrews(validated.siteid);
      },
    },
    {
      name: 'maximo_get_crew_members',
      description:
        'Get members of a labor crew. Returns both labor assignments (laborcrewlabor) and ' +
        'tool assignments (laborcrewtool) for the specified crew.',
      inputSchema: {
        type: 'object',
        properties: {
          laborcrewid: { type: 'string', description: 'Labor crew ID (required)' },
          siteid: { type: 'string', description: 'Site identifier (optional)' },
        },
        required: ['laborcrewid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_crew_members', { laborcrewid: args.laborcrewid });
        const validated = getCrewMembersSchema.parse(args);
        return await operations.getCrewMembers(validated.laborcrewid, validated.siteid);
      },
    },
    {
      name: 'maximo_get_labor_availability',
      description:
        'Check labor availability for a person within a date range. Queries work orders assigned ' +
        'to the person and calculates total capacity (8hr/day on business days), assigned hours, ' +
        'available hours, and utilization percentage.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
          startDate: { type: 'string', description: 'Start date in ISO 8601 format (required)' },
          endDate: { type: 'string', description: 'End date in ISO 8601 format (required)' },
        },
        required: ['personid', 'startDate', 'endDate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_labor_availability', {
          personid: args.personid,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        return await operations.getLaborAvailability(args.personid, args.startDate, args.endDate);
      },
    },
    {
      name: 'maximo_get_labor_cost_summary',
      description:
        'Get labor cost summary for a person. Queries labor transactions and aggregates total hours, ' +
        'total cost, and transaction count. Optionally filter by date range.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: { type: 'string', description: 'Person ID (required)' },
          startDate: { type: 'string', description: 'Start date in ISO 8601 format (optional)' },
          endDate: { type: 'string', description: 'End date in ISO 8601 format (optional)' },
        },
        required: ['personid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_labor_cost_summary', {
          personid: args.personid,
        });
        return await operations.getLaborCostSummary(args.personid, args.startDate, args.endDate);
      },
    },
    {
      name: 'maximo_get_qualified_labor',
      description:
        'Find all persons qualified for a specific craft. Searches persons with matching ' +
        'PERSONCRAFTRATE records. Optionally filter by skill level and site.',
      inputSchema: {
        type: 'object',
        properties: {
          craft: { type: 'string', description: 'Craft code to search for (required)' },
          skilllevel: {
            type: 'string',
            enum: ['APPRENTICE', 'SEMISKILLED', 'SKILLED', 'EXPERT'],
            description: 'Skill level filter (optional)',
          },
          siteid: { type: 'string', description: 'Site identifier filter (optional)' },
        },
        required: ['craft'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_qualified_labor', {
          craft: args.craft,
          skilllevel: args.skilllevel,
        });
        const validated = qualifiedLaborSchema.parse(args);
        return await operations.getQualifiedLabor(validated.craft, validated.skilllevel, validated.siteid);
      },
    },
  ];
}
