/**
 * MCP Tools for Inventory Module
 * Defines 11 MCP tools for comprehensive inventory and material management
 */

import { InventoryOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('InventoryTools');

/**
 * Create MCP tools for inventory operations
 * @param operations - InventoryOperations instance
 * @returns Array of MCP tool definitions
 */
export function createInventoryTools(operations: InventoryOperations) {
  return [
    // Tool 1: Create Item
    {
      name: 'maximo_create_item',
      description:
        'Create a new inventory item in Maximo. Requires itemnum, description, itemtype, and siteid. ' +
        'Optionally specify units of measure, costs, manufacturer, commodity group, and other item attributes.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          description: {
            type: 'string',
            description: 'Item description (required, max 100 characters)',
          },
          itemtype: {
            type: 'string',
            enum: ['ITEM', 'TOOL', 'SERVICE', 'SPECIAL'],
            description: 'Item type (required): ITEM (standard inventory), TOOL, SERVICE, or SPECIAL',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'PENDING', 'PENDOBS', 'OBSOLETE'],
            description: 'Item status (optional, defaults to ACTIVE)',
          },
          orderunit: {
            type: 'string',
            description: 'Order unit of measure (optional, max 16 characters)',
          },
          issueunit: {
            type: 'string',
            description: 'Issue unit of measure (optional, max 16 characters)',
          },
          avgcost: {
            type: 'number',
            description: 'Average cost (optional)',
            minimum: 0,
          },
          stdcost: {
            type: 'number',
            description: 'Standard cost (optional)',
            minimum: 0,
          },
          lastcost: {
            type: 'number',
            description: 'Last cost (optional)',
            minimum: 0,
          },
          lottype: {
            type: 'string',
            enum: ['LOT', 'NOLOT'],
            description: 'Lot type (optional): LOT (lot tracking enabled) or NOLOT',
          },
          rotating: {
            type: 'boolean',
            description: 'Rotating item flag (optional)',
          },
          conditionenabled: {
            type: 'boolean',
            description: 'Condition enabled flag (optional)',
          },
          manufacturer: {
            type: 'string',
            description: 'Manufacturer name (optional, max 80 characters)',
          },
          modelnum: {
            type: 'string',
            description: 'Model number (optional, max 20 characters)',
          },
          commoditygroup: {
            type: 'string',
            description: 'Commodity group code (optional, max 8 characters)',
          },
          commodity: {
            type: 'string',
            description: 'Commodity code (optional, max 8 characters)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional, max 23 characters)',
          },
          glcreditacct: {
            type: 'string',
            description: 'GL credit account (optional, max 23 characters)',
          },
          conversion: {
            type: 'number',
            description: 'Conversion factor between order and issue units (optional)',
            minimum: 0,
          },
          issuetype: {
            type: 'string',
            description: 'Issue type (optional, max 12 characters)',
          },
          capitalized: {
            type: 'boolean',
            description: 'Capitalized flag (optional)',
          },
          taxexempt: {
            type: 'boolean',
            description: 'Tax exempt flag (optional)',
          },
          inspectionrequired: {
            type: 'boolean',
            description: 'Inspection required flag (optional)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor code (optional, max 12 characters)',
          },
          catalogcode: {
            type: 'string',
            description: 'Catalog code (optional, max 8 characters)',
          },
        },
        required: ['itemnum', 'description', 'itemtype', 'siteid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Creating inventory item', { itemnum: args.itemnum });
          const response = await operations.createItem(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Inventory item created successfully',
                    item: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to create inventory item',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_create_item tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 2: Get Inventory
    {
      name: 'maximo_get_inventory',
      description:
        'Get inventory balance for an item in a storeroom. Returns current balance, physical count, ' +
        'costs, reorder information, and other inventory details.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
        },
        required: ['itemnum', 'location', 'siteid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting inventory balance', {
            itemnum: args.itemnum,
            location: args.location,
          });
          const response = await operations.getInventory(
            args.itemnum,
            args.location,
            args.siteid
          );
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    inventory: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Inventory balance not found',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_get_inventory tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 3: Issue Inventory
    {
      name: 'maximo_issue_inventory',
      description:
        'Issue inventory to a work order or asset. Reduces inventory balance and creates an issue transaction. ' +
        'Either wonum (work order) or assetnum must be provided.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          quantity: {
            type: 'number',
            description: 'Quantity to issue (required, must be positive)',
            minimum: 0.01,
          },
          wonum: {
            type: 'string',
            description: 'Work order number (optional, max 10 characters)',
          },
          assetnum: {
            type: 'string',
            description: 'Asset number (optional, max 12 characters)',
          },
          binnum: {
            type: 'string',
            description: 'Bin number (optional, max 8 characters)',
          },
          lotnum: {
            type: 'string',
            description: 'Lot number (optional, max 9 characters)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional, max 23 characters)',
          },
          glcreditacct: {
            type: 'string',
            description: 'GL credit account (optional, max 23 characters)',
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (optional, defaults to now)',
          },
          memo: {
            type: 'string',
            description: 'Memo/remarks (optional, max 50 characters)',
          },
          issuetype: {
            type: 'string',
            description: 'Issue type (optional, max 12 characters)',
          },
          taskid: {
            type: 'string',
            description: 'Task ID (optional, max 10 characters)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (optional)',
            minimum: 0,
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional)',
            minimum: 0,
          },
          conversion: {
            type: 'number',
            description: 'Conversion factor (optional)',
            minimum: 0,
          },
          issueunit: {
            type: 'string',
            description: 'Issue unit (optional, max 16 characters)',
          },
          enterby: {
            type: 'string',
            description: 'Entered by person (optional, max 30 characters)',
          },
        },
        required: ['itemnum', 'location', 'siteid', 'quantity'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Issuing inventory', {
            itemnum: args.itemnum,
            quantity: args.quantity,
          });
          const response = await operations.issueInventory(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Inventory issued successfully',
                    transaction: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to issue inventory',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_issue_inventory tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 4: Return Inventory
    {
      name: 'maximo_return_inventory',
      description:
        'Return inventory to storeroom. Increases inventory balance and creates a return transaction. ' +
        'Typically used to return unused materials from work orders.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          quantity: {
            type: 'number',
            description: 'Quantity to return (required, must be positive)',
            minimum: 0.01,
          },
          wonum: {
            type: 'string',
            description: 'Work order number (optional, max 10 characters)',
          },
          rotassetnum: {
            type: 'string',
            description: 'Rotating asset number (optional, max 12 characters)',
          },
          binnum: {
            type: 'string',
            description: 'Bin number (optional, max 8 characters)',
          },
          lotnum: {
            type: 'string',
            description: 'Lot number (optional, max 9 characters)',
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (optional, defaults to now)',
          },
          memo: {
            type: 'string',
            description: 'Memo/remarks (optional, max 50 characters)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (optional)',
            minimum: 0,
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional)',
            minimum: 0,
          },
          conversion: {
            type: 'number',
            description: 'Conversion factor (optional)',
            minimum: 0,
          },
          issueunit: {
            type: 'string',
            description: 'Issue unit (optional, max 16 characters)',
          },
          enterby: {
            type: 'string',
            description: 'Entered by person (optional, max 30 characters)',
          },
          conditioncode: {
            type: 'string',
            description: 'Condition code for condition-enabled items (optional, max 30 characters)',
          },
        },
        required: ['itemnum', 'location', 'siteid', 'quantity'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Returning inventory', {
            itemnum: args.itemnum,
            quantity: args.quantity,
          });
          const response = await operations.returnInventory(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Inventory returned successfully',
                    transaction: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to return inventory',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_return_inventory tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 5: Transfer Inventory
    {
      name: 'maximo_transfer_inventory',
      description:
        'Transfer inventory between storerooms. Reduces balance in source storeroom and increases balance ' +
        'in destination storeroom. Creates a transfer transaction.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          fromstoreloc: {
            type: 'string',
            description: 'From storeroom location (required, max 12 characters)',
          },
          tostoreloc: {
            type: 'string',
            description: 'To storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          quantity: {
            type: 'number',
            description: 'Quantity to transfer (required, must be positive)',
            minimum: 0.01,
          },
          frombinnum: {
            type: 'string',
            description: 'From bin number (optional, max 8 characters)',
          },
          tobinnum: {
            type: 'string',
            description: 'To bin number (optional, max 8 characters)',
          },
          fromlotnum: {
            type: 'string',
            description: 'From lot number (optional, max 9 characters)',
          },
          tolotnum: {
            type: 'string',
            description: 'To lot number (optional, max 9 characters)',
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (optional, defaults to now)',
          },
          memo: {
            type: 'string',
            description: 'Memo/remarks (optional, max 50 characters)',
          },
          linecost: {
            type: 'number',
            description: 'Line cost (optional)',
            minimum: 0,
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional)',
            minimum: 0,
          },
          enterby: {
            type: 'string',
            description: 'Entered by person (optional, max 30 characters)',
          },
        },
        required: ['itemnum', 'fromstoreloc', 'tostoreloc', 'siteid', 'quantity'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Transferring inventory', {
            itemnum: args.itemnum,
            fromstoreloc: args.fromstoreloc,
            tostoreloc: args.tostoreloc,
            quantity: args.quantity,
          });
          const response = await operations.transferInventory(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Inventory transferred successfully',
                    transaction: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to transfer inventory',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_transfer_inventory tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 6: Adjust Inventory
    {
      name: 'maximo_adjust_inventory',
      description:
        'Adjust inventory balance based on physical count. Used for cycle counting and inventory reconciliation. ' +
        'Creates an adjustment transaction to match physical count.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          physcnt: {
            type: 'number',
            description: 'Physical count (required, must be non-negative)',
            minimum: 0,
          },
          binnum: {
            type: 'string',
            description: 'Bin number (optional, max 8 characters)',
          },
          lotnum: {
            type: 'string',
            description: 'Lot number (optional, max 9 characters)',
          },
          transdate: {
            type: 'string',
            description: 'Transaction date in ISO 8601 format (optional, defaults to now)',
          },
          reason: {
            type: 'string',
            description: 'Reason for adjustment (optional, max 50 characters)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional, max 23 characters)',
          },
          glcreditacct: {
            type: 'string',
            description: 'GL credit account (optional, max 23 characters)',
          },
          enterby: {
            type: 'string',
            description: 'Entered by person (optional, max 30 characters)',
          },
          reconciled: {
            type: 'boolean',
            description: 'Reconciled flag (optional)',
          },
        },
        required: ['itemnum', 'location', 'siteid', 'physcnt'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Adjusting inventory', {
            itemnum: args.itemnum,
            physcnt: args.physcnt,
          });
          const response = await operations.adjustInventory(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Inventory adjusted successfully',
                    transaction: response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to adjust inventory',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_adjust_inventory tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 7: Get Inventory Transactions
    {
      name: 'maximo_get_inventory_transactions',
      description:
        'Get transaction history for an item in a storeroom. Returns all transactions (issues, returns, ' +
        'transfers, adjustments) with optional date range filtering.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          startDate: {
            type: 'string',
            description: 'Start date in ISO 8601 format (optional)',
          },
          endDate: {
            type: 'string',
            description: 'End date in ISO 8601 format (optional)',
          },
          pageSize: {
            type: 'number',
            description: 'Page size for pagination (optional, default 100, max 1000)',
            minimum: 1,
            maximum: 1000,
          },
          page: {
            type: 'number',
            description: 'Page number for pagination (optional, default 1)',
            minimum: 1,
          },
        },
        required: ['itemnum', 'location', 'siteid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting inventory transactions', {
            itemnum: args.itemnum,
            location: args.location,
          });
          const response = await operations.getTransactions(
            args.itemnum,
            args.location,
            args.siteid,
            args.startDate,
            args.endDate,
            args.pageSize,
            args.page
          );
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    ...response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to retrieve transactions',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_get_inventory_transactions tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 8: Search Items
    {
      name: 'maximo_search_items',
      description:
        'Search inventory items with OSLC filters. Supports filtering by item type, status, commodity group, ' +
        'manufacturer, description, and more. Returns paginated results.',
      inputSchema: {
        type: 'object',
        properties: {
          itemtype: {
            type: ['string', 'array'],
            description: 'Item type or array of types: ITEM, TOOL, SERVICE, SPECIAL (optional)',
          },
          status: {
            type: ['string', 'array'],
            description: 'Status or array of statuses: ACTIVE, PENDING, PENDOBS, OBSOLETE (optional)',
          },
          commoditygroup: {
            type: 'string',
            description: 'Commodity group code (optional, max 8 characters)',
          },
          manufacturer: {
            type: 'string',
            description: 'Manufacturer name (optional, max 80 characters)',
          },
          description: {
            type: 'string',
            description: 'Description partial match (optional)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (optional, max 12 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          rotating: {
            type: 'boolean',
            description: 'Filter by rotating items (optional)',
          },
          conditionenabled: {
            type: 'boolean',
            description: 'Filter by condition-enabled items (optional)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor code (optional, max 12 characters)',
          },
          pageSize: {
            type: 'number',
            description: 'Page size for pagination (optional, default 100, max 1000)',
            minimum: 1,
            maximum: 1000,
          },
          page: {
            type: 'number',
            description: 'Page number for pagination (optional, default 1)',
            minimum: 1,
          },
          select: {
            type: 'array',
            description: 'Array of field names to return (optional)',
            items: {
              type: 'string',
            },
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (optional, e.g., "itemnum", "-description")',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause (optional)',
          },
          searchTerms: {
            type: 'string',
            description: 'Search terms for full-text search (optional)',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Searching inventory items', { criteria: args });
          const response = await operations.searchItems(args);
          
          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    ...response.data,
                  }, null, 2),
                },
              ],
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to search items',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_search_items tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 9: Update Reorder Point
    {
      name: 'maximo_update_reorder_point',
      description:
        'Update reorder point and inventory planning fields for an item at a storeroom. ' +
        'Sets reorder point, minimum level, maximum level, and economic order quantity. ' +
        'At least one planning field must be provided.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (required, max 12 characters)',
          },
          reorder: {
            type: 'number',
            description: 'Reorder point - balance at which reorder is triggered (optional, must be non-negative)',
            minimum: 0,
          },
          minlevel: {
            type: 'number',
            description: 'Minimum stock level (optional, must be non-negative)',
            minimum: 0,
          },
          maxlevel: {
            type: 'number',
            description: 'Maximum stock level (optional, must be non-negative and >= minlevel)',
            minimum: 0,
          },
          orderqty: {
            type: 'number',
            description: 'Economic order quantity - quantity to order when reorder is triggered (optional, must be non-negative)',
            minimum: 0,
          },
        },
        required: ['itemnum', 'siteid', 'location'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Updating reorder point', {
            itemnum: args.itemnum,
            location: args.location,
          });
          const response = await operations.updateReorderPoint(args);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: 'Reorder point updated successfully',
                    inventory: response.data,
                  }, null, 2),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to update reorder point',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_update_reorder_point tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 10: Get Stock Levels
    {
      name: 'maximo_get_stock_levels',
      description:
        'Get current stock levels across storerooms for an item. Returns current balance, ' +
        'reorder point, min/max levels, and order quantity for each storeroom holding the item.',
      inputSchema: {
        type: 'object',
        properties: {
          itemnum: {
            type: 'string',
            description: 'Item number (required, max 30 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional, max 8 characters). Filters to storerooms in this site.',
          },
          includeAllStorerooms: {
            type: 'boolean',
            description: 'Include storerooms across all sites (optional, defaults to false). When true, siteid filter is ignored.',
          },
        },
        required: ['itemnum'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting stock levels', {
            itemnum: args.itemnum,
            siteid: args.siteid,
          });
          const response = await operations.getStockLevels(args);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    ...response.data,
                  }, null, 2),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to retrieve stock levels',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_get_stock_levels tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 11: Get Items Below Reorder Point
    {
      name: 'maximo_get_items_below_reorder',
      description:
        'Find all inventory items where the current balance is at or below the reorder point. ' +
        'Useful for identifying items that need to be reordered. Only includes items with a reorder point > 0.',
      inputSchema: {
        type: 'object',
        properties: {
          siteid: {
            type: 'string',
            description: 'Site identifier (optional, max 8 characters). Filters to a specific site.',
          },
          location: {
            type: 'string',
            description: 'Storeroom location (optional, max 12 characters). Filters to a specific storeroom.',
          },
          pageSize: {
            type: 'number',
            description: 'Page size for pagination (optional, default 100, max 1000)',
            minimum: 1,
            maximum: 1000,
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting items below reorder point', {
            siteid: args.siteid,
            location: args.location,
          });
          const response = await operations.getItemsBelowReorder(args);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    ...response.data,
                  }, null, 2),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: response.error || 'Failed to retrieve items below reorder point',
                  errorCode: response.errorCode,
                }, null, 2),
              },
            ],
            isError: true,
          };
        } catch (error: any) {
          logger.error('Error in maximo_get_items_below_reorder tool', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message || 'An unexpected error occurred',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      },
    },
  ];
}