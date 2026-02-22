/**
 * MCP Tools for Asset Module
 * Defines 9 MCP tools for comprehensive asset management
 */

import { AssetOperations } from './operations';
import {
  assetCreateSchema,
  assetUpdateSchema,
  assetSearchSchema,
  assetMoveSchema,
  meterReadingSchema,
  assetSpecSchema,
  assetIdentifierSchema,
  meterHistorySchema,
  assetStatusChangeSchema,
  downtimeHistorySchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AssetTools');

/**
 * Create MCP tools for asset operations
 * @param operations - AssetOperations instance
 * @returns Array of MCP tool definitions
 */
export function createAssetTools(operations: AssetOperations) {
  return [
    // Tool 1: Create Asset
    {
      name: 'maximo_create_asset',
      description:
        'Create a new asset in Maximo. Requires assetnum, description, siteid, and assettype. ' +
        'Optionally specify location, parent, serial number, manufacturer, purchase details, and more.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required, max 12 characters)',
          },
          description: {
            type: 'string',
            description: 'Asset description (required, max 100 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          assettype: {
            type: 'string',
            enum: ['IT', 'PRODUCTION', 'FACILITIES', 'TRANSPORTATION', 'INFRASTRUCTURE'],
            description: 'Asset type (required)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          location: {
            type: 'string',
            description: 'Location code (optional, max 12 characters)',
          },
          status: {
            type: 'string',
            enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'],
            description: 'Asset status (optional, defaults to OPERATING)',
          },
          parent: {
            type: 'string',
            description: 'Parent asset number for hierarchy (optional, max 12 characters)',
          },
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          serialnum: {
            type: 'string',
            description: 'Serial number (optional, max 64 characters)',
          },
          manufacturer: {
            type: 'string',
            description: 'Manufacturer name (optional, max 80 characters)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor code (optional, max 12 characters)',
          },
          model: {
            type: 'string',
            description: 'Model number (optional, max 20 characters)',
          },
          purchaseprice: {
            type: 'number',
            description: 'Purchase price (optional)',
            minimum: 0,
          },
          purchasedate: {
            type: 'string',
            description: 'Purchase date in ISO 8601 format (optional)',
          },
          installdate: {
            type: 'string',
            description: 'Installation date in ISO 8601 format (optional)',
          },
          warrantyexpdate: {
            type: 'string',
            description: 'Warranty expiration date in ISO 8601 format (optional)',
          },
          replacecost: {
            type: 'number',
            description: 'Replacement cost (optional)',
            minimum: 0,
          },
          failurecode: {
            type: 'string',
            description: 'Failure code (optional, max 8 characters)',
          },
          classstructureid: {
            type: 'string',
            description: 'Asset specification class (optional, max 20 characters)',
          },
          binnum: {
            type: 'string',
            description: 'Bin number (optional, max 8 characters)',
          },
          lotnum: {
            type: 'string',
            description: 'Lot number (optional, max 9 characters)',
          },
          itemnum: {
            type: 'string',
            description: 'Item number (optional, max 30 characters)',
          },
          isrotating: {
            type: 'boolean',
            description: 'Rotating item flag (optional)',
          },
          budgetcost: {
            type: 'number',
            description: 'Budgeted cost (optional)',
            minimum: 0,
          },
          ownership: {
            type: 'string',
            description: 'Ownership code (optional, max 12 characters)',
          },
          lease: {
            type: 'boolean',
            description: 'Lease/rent flag (optional)',
          },
          leaseexpdate: {
            type: 'string',
            description: 'Lease expiration date in ISO 8601 format (optional)',
          },
          leasecost: {
            type: 'number',
            description: 'Lease cost (optional)',
            minimum: 0,
          },
          leasecontractnum: {
            type: 'string',
            description: 'Lease contract number (optional, max 12 characters)',
          },
          leasevendor: {
            type: 'string',
            description: 'Lease vendor (optional, max 12 characters)',
          },
          capitalized: {
            type: 'boolean',
            description: 'Capitalized flag (optional)',
          },
          depreciationcode: {
            type: 'string',
            description: 'Depreciation code (optional, max 8 characters)',
          },
          salvagevalue: {
            type: 'number',
            description: 'Salvage value (optional)',
            minimum: 0,
          },
          expectedlife: {
            type: 'number',
            description: 'Expected life in years (optional)',
            minimum: 0,
          },
        },
        required: ['assetnum', 'description', 'siteid', 'assettype'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_asset', { assetnum: args.assetnum, siteid: args.siteid });
        const validated = assetCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get Asset
    {
      name: 'maximo_get_asset',
      description:
        'Retrieve asset details by asset number and site ID. ' +
        'Returns complete asset information including status, location, costs, specifications, and hierarchy.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['assetnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_asset', { assetnum: args.assetnum, siteid: args.siteid });
        const validated = assetIdentifierSchema.parse(args);
        const response = await operations.get(validated.assetnum, validated.siteid);
        return response;
      },
    },

    // Tool 3: Update Asset
    {
      name: 'maximo_update_asset',
      description:
        'Update asset fields. Specify assetnum and siteid to identify the asset, ' +
        'then provide any fields to update (description, status, location, costs, specifications, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: {
                type: 'string',
                description: 'Asset description (max 100 characters)',
              },
              status: {
                type: 'string',
                enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'],
                description: 'Asset status',
              },
              location: {
                type: 'string',
                description: 'Location code (max 12 characters)',
              },
              priority: {
                type: 'number',
                description: 'Priority level 1-5',
                minimum: 1,
                maximum: 5,
              },
              serialnum: {
                type: 'string',
                description: 'Serial number (max 64 characters)',
              },
              manufacturer: {
                type: 'string',
                description: 'Manufacturer name (max 80 characters)',
              },
              vendor: {
                type: 'string',
                description: 'Vendor code (max 12 characters)',
              },
              model: {
                type: 'string',
                description: 'Model number (max 20 characters)',
              },
              purchaseprice: {
                type: 'number',
                description: 'Purchase price',
                minimum: 0,
              },
              purchasedate: {
                type: 'string',
                description: 'Purchase date in ISO 8601 format',
              },
              installdate: {
                type: 'string',
                description: 'Installation date in ISO 8601 format',
              },
              warrantyexpdate: {
                type: 'string',
                description: 'Warranty expiration date in ISO 8601 format',
              },
              replacecost: {
                type: 'number',
                description: 'Replacement cost',
                minimum: 0,
              },
              failurecode: {
                type: 'string',
                description: 'Failure code (max 8 characters)',
              },
              isrunning: {
                type: 'boolean',
                description: 'Is running flag',
              },
              classstructureid: {
                type: 'string',
                description: 'Asset specification class (max 20 characters)',
              },
              binnum: {
                type: 'string',
                description: 'Bin number (max 8 characters)',
              },
              lotnum: {
                type: 'string',
                description: 'Lot number (max 9 characters)',
              },
              itemnum: {
                type: 'string',
                description: 'Item number (max 30 characters)',
              },
              budgetcost: {
                type: 'number',
                description: 'Budgeted cost',
                minimum: 0,
              },
              ownership: {
                type: 'string',
                description: 'Ownership code (max 12 characters)',
              },
              lease: {
                type: 'boolean',
                description: 'Lease/rent flag',
              },
              leaseexpdate: {
                type: 'string',
                description: 'Lease expiration date in ISO 8601 format',
              },
              leasecost: {
                type: 'number',
                description: 'Lease cost',
                minimum: 0,
              },
              leasecontractnum: {
                type: 'string',
                description: 'Lease contract number (max 12 characters)',
              },
              leasevendor: {
                type: 'string',
                description: 'Lease vendor (max 12 characters)',
              },
              capitalized: {
                type: 'boolean',
                description: 'Capitalized flag',
              },
              depreciationcode: {
                type: 'string',
                description: 'Depreciation code (max 8 characters)',
              },
              salvagevalue: {
                type: 'number',
                description: 'Salvage value',
                minimum: 0,
              },
              expectedlife: {
                type: 'number',
                description: 'Expected life in years',
                minimum: 0,
              },
              remaininglife: {
                type: 'number',
                description: 'Remaining life in years',
                minimum: 0,
              },
            },
          },
        },
        required: ['assetnum', 'siteid', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_asset', { assetnum: args.assetnum, siteid: args.siteid });
        const validated = assetIdentifierSchema.parse(args);
        const updates = assetUpdateSchema.parse(args.updates);
        const response = await operations.update(validated.assetnum, validated.siteid, updates);
        return response;
      },
    },

    // Tool 4: Delete Asset
    {
      name: 'maximo_delete_asset',
      description:
        'Delete an asset from Maximo. Requires asset number and site ID. ' +
        'This operation cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['assetnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_asset', { assetnum: args.assetnum, siteid: args.siteid });
        const validated = assetIdentifierSchema.parse(args);
        const response = await operations.delete(validated.assetnum, validated.siteid);
        return response;
      },
    },

    // Tool 5: Move Asset
    {
      name: 'maximo_move_asset',
      description:
        'Move an asset to a new location. Specify the asset, site, and new location. ' +
        'Optionally provide move date, memo, and new bin/lot numbers.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          newLocation: {
            type: 'string',
            description: 'New location code (required, max 12 characters)',
          },
          moveDate: {
            type: 'string',
            description: 'Move date in ISO 8601 format (optional, defaults to now)',
          },
          memo: {
            type: 'string',
            description: 'Move memo/reason (optional, max 50 characters)',
          },
          newBinnum: {
            type: 'string',
            description: 'New bin number (optional, max 8 characters)',
          },
          newLotnum: {
            type: 'string',
            description: 'New lot number (optional, max 9 characters)',
          },
        },
        required: ['assetnum', 'siteid', 'newLocation'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_move_asset', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          newLocation: args.newLocation,
        });
        const validated = assetMoveSchema.parse(args);
        const moveData = {
          newLocation: validated.newLocation,
          moveDate: validated.moveDate,
          memo: validated.memo,
          newBinnum: validated.newBinnum,
          newLotnum: validated.newLotnum,
        };
        const response = await operations.move(validated.assetnum, validated.siteid, moveData);
        return response;
      },
    },

    // Tool 6: Record Meter Reading
    {
      name: 'maximo_record_meter',
      description:
        'Record a meter reading for an asset. Specify asset, site, meter name, reading value, and date. ' +
        'Optionally provide inspector, remarks, and rollover flag.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          metername: {
            type: 'string',
            description: 'Meter name (required, max 10 characters)',
          },
          reading: {
            type: 'number',
            description: 'Reading value (required, must be non-negative)',
            minimum: 0,
          },
          readingdate: {
            type: 'string',
            description: 'Reading date in ISO 8601 format (required)',
          },
          inspector: {
            type: 'string',
            description: 'Inspector/person who took reading (optional, max 30 characters)',
          },
          remarks: {
            type: 'string',
            description: 'Remarks (optional, max 50 characters)',
          },
          newreading: {
            type: 'boolean',
            description: 'New reading flag (optional)',
          },
          rollover: {
            type: 'boolean',
            description: 'Rollover flag - indicates meter has rolled over (optional)',
          },
        },
        required: ['assetnum', 'siteid', 'metername', 'reading', 'readingdate'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_record_meter', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          metername: args.metername,
        });
        const validated = meterReadingSchema.parse(args);
        const reading = {
          metername: validated.metername,
          reading: validated.reading,
          readingdate: validated.readingdate,
          inspector: validated.inspector,
          remarks: validated.remarks,
          newreading: validated.newreading,
          rollover: validated.rollover,
        };
        const response = await operations.recordMeter(validated.assetnum, validated.siteid, reading);
        return response;
      },
    },

    // Tool 7: Get Asset Hierarchy
    {
      name: 'maximo_get_asset_hierarchy',
      description:
        'Get asset hierarchy including parent and children assets. ' +
        'Returns the asset, its parent (if exists), all child assets, hierarchy level, and path.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['assetnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_asset_hierarchy', {
          assetnum: args.assetnum,
          siteid: args.siteid,
        });
        const validated = assetIdentifierSchema.parse(args);
        const response = await operations.getHierarchy(validated.assetnum, validated.siteid);
        return response;
      },
    },

    // Tool 8: Update Asset Specification
    {
      name: 'maximo_update_asset_spec',
      description:
        'Update or add an asset specification attribute. Specify asset, site, attribute ID, and value. ' +
        'Values can be alphanumeric (alnvalue), numeric (numvalue), or table-based (tablevalue).',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          assetattrid: {
            type: 'string',
            description: 'Asset attribute ID (required, max 16 characters)',
          },
          alnvalue: {
            type: 'string',
            description: 'Alphanumeric value (optional, max 254 characters)',
          },
          numvalue: {
            type: 'number',
            description: 'Numeric value (optional)',
          },
          tablevalue: {
            type: 'string',
            description: 'Table value (optional, max 254 characters)',
          },
          section: {
            type: 'string',
            description: 'Section (optional, max 10 characters)',
          },
          measureunitid: {
            type: 'string',
            description: 'Measurement unit ID (optional, max 16 characters)',
          },
        },
        required: ['assetnum', 'siteid', 'assetattrid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_asset_spec', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          assetattrid: args.assetattrid,
        });
        const validated = assetSpecSchema.parse(args);
        const spec = {
          assetattrid: validated.assetattrid,
          alnvalue: validated.alnvalue,
          numvalue: validated.numvalue,
          tablevalue: validated.tablevalue,
          section: validated.section,
          measureunitid: validated.measureunitid,
        };
        const response = await operations.updateSpecification(
          validated.assetnum,
          validated.siteid,
          spec
        );
        return response;
      },
    },

    // Tool 9: Search Assets
    {
      name: 'maximo_search_assets',
      description:
        'Search assets with OSLC filters. Filter by status, type, location, parent, manufacturer, serial number, and more. ' +
        'Supports pagination, field selection, sorting, and date range filtering.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            oneOf: [
              {
                type: 'string',
                enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'],
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'],
                },
              },
            ],
            description: 'Filter by asset status (single value or array)',
          },
          assettype: {
            oneOf: [
              {
                type: 'string',
                enum: ['IT', 'PRODUCTION', 'FACILITIES', 'TRANSPORTATION', 'INFRASTRUCTURE'],
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['IT', 'PRODUCTION', 'FACILITIES', 'TRANSPORTATION', 'INFRASTRUCTURE'],
                },
              },
            ],
            description: 'Filter by asset type (single value or array)',
          },
          location: {
            type: 'string',
            description: 'Filter by location code',
          },
          parent: {
            type: 'string',
            description: 'Filter by parent asset number',
          },
          manufacturer: {
            type: 'string',
            description: 'Filter by manufacturer',
          },
          serialnum: {
            type: 'string',
            description: 'Filter by serial number',
          },
          siteid: {
            type: 'string',
            description: 'Filter by site identifier',
          },
          orgid: {
            type: 'string',
            description: 'Filter by organization identifier',
          },
          priority: {
            type: 'number',
            description: 'Filter by priority (1-5)',
            minimum: 1,
            maximum: 5,
          },
          failurecode: {
            type: 'string',
            description: 'Filter by failure code',
          },
          isrunning: {
            type: 'boolean',
            description: 'Filter by running status',
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
                enum: ['purchasedate', 'installdate', 'warrantyexpdate', 'statusdate', 'changedate'],
                description: 'Date field to filter on (defaults to statusdate)',
              },
            },
            required: ['start', 'end'],
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (1-1000, default 100)',
            minimum: 1,
            maximum: 1000,
          },
          page: {
            type: 'number',
            description: 'Page number (1-based, default 1)',
            minimum: 1,
          },
          select: {
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to return (OSLC select)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (OSLC orderBy, e.g., "+assetnum" or "-statusdate")',
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
        logger.info('Executing maximo_search_assets', { criteria: args });
        const validated = assetSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 10: Get Meter Reading History
    {
      name: 'maximo_get_meter_history',
      description:
        'Retrieve meter reading history for an asset. Returns chronological list of meter readings ' +
        'with values, dates, and inspector details. Optionally filter by meter name.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          metername: {
            type: 'string',
            description: 'Filter by specific meter name (optional, max 10 characters)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (1-1000, default 100)',
            minimum: 1,
            maximum: 1000,
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (OSLC orderBy, e.g., "-readingdate" for newest first). Defaults to "-readingdate".',
          },
        },
        required: ['assetnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_meter_history', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          metername: args.metername,
        });
        const validated = meterHistorySchema.parse(args);
        const response = await operations.getMeterHistory(
          validated.assetnum,
          validated.siteid,
          validated.metername,
          validated.pageSize,
          validated.orderBy
        );
        return response;
      },
    },

    // Tool 11: Change Asset Status
    {
      name: 'maximo_change_asset_status',
      description:
        'Change the status of an asset (e.g., OPERATING, NOT READY, DECOMMISSIONED, MISSING, SEALED). ' +
        'Optionally provide a memo explaining the reason for the status change.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          status: {
            type: 'string',
            enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'],
            description: 'New asset status (required)',
          },
          memo: {
            type: 'string',
            description: 'Reason for status change (optional, max 50 characters)',
          },
        },
        required: ['assetnum', 'siteid', 'status'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_change_asset_status', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          status: args.status,
        });
        const validated = assetStatusChangeSchema.parse(args);
        const response = await operations.changeStatus(
          validated.assetnum,
          validated.siteid,
          validated.status,
          validated.memo
        );
        return response;
      },
    },

    // Tool 12: Get Asset Downtime History
    {
      name: 'maximo_get_asset_downtime',
      description:
        'Retrieve downtime history for an asset. Returns downtime records with start/end dates, ' +
        'duration in hours, and reason codes. Optionally filter by date range. ' +
        'Includes total downtime hours across all records.',
      inputSchema: {
        type: 'object',
        properties: {
          assetnum: {
            type: 'string',
            description: 'Asset number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          startDate: {
            type: 'string',
            description: 'Filter downtime records starting from this date (ISO 8601 format, optional)',
          },
          endDate: {
            type: 'string',
            description: 'Filter downtime records up to this date (ISO 8601 format, optional)',
          },
        },
        required: ['assetnum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_asset_downtime', {
          assetnum: args.assetnum,
          siteid: args.siteid,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        const validated = downtimeHistorySchema.parse(args);
        const response = await operations.getDowntimeHistory(
          validated.assetnum,
          validated.siteid,
          validated.startDate,
          validated.endDate
        );
        return response;
      },
    },
  ];
}