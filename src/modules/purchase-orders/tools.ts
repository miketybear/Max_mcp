/**
 * MCP Tools for Purchase Order Module
 * Defines 7 MCP tools for comprehensive purchase order management
 */

import { PurchaseOrderOperations } from './operations';
import {
  purchaseOrderCreateSchema,
  purchaseOrderUpdateSchema,
  purchaseOrderSearchSchema,
  purchaseOrderIdentifierSchema,
  purchaseOrderReceiptSchema,
  purchaseOrderApprovalSchema,
  purchaseOrderAddLineItemSchema,
  purchaseOrderUpdateLineItemSchema,
  purchaseOrderRemoveLineItemSchema,
  purchaseOrderSubmitForApprovalSchema,
  purchaseOrderRejectSchema,
  purchaseOrderReceiveLineItemSchema,
  purchaseOrderGetReceiptsSchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('PurchaseOrderTools');

/**
 * Create MCP tools for purchase order operations
 * @param operations - PurchaseOrderOperations instance
 * @returns Array of MCP tool definitions
 */
export function createPurchaseOrderTools(operations: PurchaseOrderOperations) {
  return [
    // Tool 1: Create Purchase Order
    {
      name: 'maximo_create_po',
      description:
        'Create a new purchase order in Maximo. Requires description, vendor, and siteid. ' +
        'Optionally specify order date, requested delivery date, buyer, terms, and line items.',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Purchase order description (required, max 100 characters)',
          },
          vendor: {
            type: 'string',
            description: 'Vendor code (required, max 8 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          potype: {
            type: 'string',
            enum: ['STANDARD', 'BLANKET', 'CONTRACT'],
            description: 'Purchase order type: STANDARD, BLANKET, or CONTRACT',
          },
          orderdate: {
            type: 'string',
            description: 'Order date in ISO 8601 format (optional)',
          },
          reqdate: {
            type: 'string',
            description: 'Requested delivery date in ISO 8601 format (optional)',
          },
          buyer: {
            type: 'string',
            description: 'Buyer (optional, max 30 characters)',
          },
          termsconditions: {
            type: 'string',
            description: 'Terms and conditions (optional)',
          },
          shipvia: {
            type: 'string',
            description: 'Ship via (optional, max 20 characters)',
          },
          fob: {
            type: 'string',
            description: 'FOB (optional, max 20 characters)',
          },
          taxcode: {
            type: 'string',
            description: 'Tax code (optional, max 8 characters)',
          },
          refnum: {
            type: 'string',
            description: 'Reference number (optional, max 20 characters)',
          },
          comments: {
            type: 'string',
            description: 'Comments (optional)',
          },
          poline: {
            type: 'array',
            description: 'Purchase order line items (optional)',
            items: {
              type: 'object',
              properties: {
                itemnum: { type: 'string', description: 'Item number (optional)' },
                description: { type: 'string', description: 'Item description (required)' },
                orderqty: { type: 'number', description: 'Quantity ordered (required)' },
                orderunit: { type: 'string', description: 'Unit of measure (optional)' },
                unitcost: { type: 'number', description: 'Unit cost (optional)' },
                storeloc: { type: 'string', description: 'Store location (optional)' },
                reqdate: { type: 'string', description: 'Requested delivery date (optional)' },
                assetnum: { type: 'string', description: 'Asset number (optional)' },
                location: { type: 'string', description: 'Location code (optional)' },
                wonum: { type: 'string', description: 'Work order number (optional)' },
              },
              required: ['description', 'orderqty'],
            },
          },
        },
        required: ['description', 'vendor', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_create_po', { vendor: args.vendor, siteid: args.siteid });
        const validated = purchaseOrderCreateSchema.parse(args);
        const response = await operations.create(validated);
        return response;
      },
    },

    // Tool 2: Get Purchase Order
    {
      name: 'maximo_get_po',
      description:
        'Retrieve purchase order details by purchase order number and optional site ID. ' +
        'Returns complete purchase order information including status, dates, costs, and line items.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['ponum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_po', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderIdentifierSchema.parse(args);
        const response = await operations.get(validated.ponum, validated.siteid);
        return response;
      },
    },

    // Tool 3: Update Purchase Order
    {
      name: 'maximo_update_po',
      description:
        'Update purchase order fields. Specify ponum and optional siteid to identify the purchase order, ' +
        'then provide any fields to update (description, vendor, dates, buyer, terms, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: { type: 'string', description: 'Purchase order description' },
              vendor: { type: 'string', description: 'Vendor code' },
              potype: {
                type: 'string',
                enum: ['STANDARD', 'BLANKET', 'CONTRACT'],
                description: 'Purchase order type',
              },
              orderdate: { type: 'string', description: 'Order date (ISO 8601)' },
              reqdate: { type: 'string', description: 'Requested delivery date (ISO 8601)' },
              buyer: { type: 'string', description: 'Buyer' },
              termsconditions: { type: 'string', description: 'Terms and conditions' },
              shipvia: { type: 'string', description: 'Ship via' },
              fob: { type: 'string', description: 'FOB' },
              taxcode: { type: 'string', description: 'Tax code' },
              refnum: { type: 'string', description: 'Reference number' },
              comments: { type: 'string', description: 'Comments' },
            },
          },
        },
        required: ['ponum', 'updates'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_po', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderUpdateSchema.parse(args.updates);
        const response = await operations.update(args.ponum, args.siteid, validated);
        return response;
      },
    },

    // Tool 4: Delete Purchase Order
    {
      name: 'maximo_delete_po',
      description:
        'Delete a purchase order. Specify ponum and optional siteid to identify the purchase order to delete.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['ponum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_delete_po', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderIdentifierSchema.parse(args);
        const response = await operations.delete(validated.ponum, validated.siteid);
        return response;
      },
    },

    // Tool 5: Receive Purchase Order Items
    {
      name: 'maximo_receive_po',
      description:
        'Receive purchase order items. Specify ponum, polinenum, and quantity received. ' +
        'Optionally specify receipt date, receiving storeroom, and comments.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          polinenum: {
            type: 'number',
            description: 'Purchase order line number (required)',
          },
          quantity: {
            type: 'number',
            description: 'Quantity received (required, must be positive)',
          },
          receiptdate: {
            type: 'string',
            description: 'Receipt date in ISO 8601 format (optional, defaults to current date)',
          },
          tostoreloc: {
            type: 'string',
            description: 'Receiving storeroom (optional, max 8 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
          comments: {
            type: 'string',
            description: 'Receipt comments (optional)',
          },
        },
        required: ['ponum', 'polinenum', 'quantity'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_receive_po', {
          ponum: args.ponum,
          polinenum: args.polinenum,
        });
        const validated = purchaseOrderReceiptSchema.parse(args);
        const response = await operations.receive(validated);
        return response;
      },
    },

    // Tool 6: Approve Purchase Order
    {
      name: 'maximo_approve_po',
      description:
        'Approve a purchase order. Specify ponum and optionally provide an approval memo. ' +
        'Changes the purchase order status to APPR.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          memo: {
            type: 'string',
            description: 'Approval memo (optional)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (optional)',
          },
        },
        required: ['ponum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_approve_po', { ponum: args.ponum });
        const validated = purchaseOrderApprovalSchema.parse(args);
        const response = await operations.approve(validated);
        return response;
      },
    },

    // Tool 7: Search Purchase Orders
    {
      name: 'maximo_search_pos',
      description:
        'Search purchase orders with filters. Filter by status, vendor, site, type, buyer, or date range. ' +
        'Supports pagination with pageSize and pageNum parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            oneOf: [
              {
                type: 'string',
                enum: ['WAPPR', 'APPR', 'PCH', 'CLOSE', 'CAN'],
                description: 'Purchase order status',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['WAPPR', 'APPR', 'PCH', 'CLOSE', 'CAN'],
                },
                description: 'Multiple status values',
              },
            ],
          },
          vendor: {
            type: 'string',
            description: 'Vendor code filter (optional)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier filter (optional)',
          },
          potype: {
            oneOf: [
              {
                type: 'string',
                enum: ['STANDARD', 'BLANKET', 'CONTRACT'],
                description: 'Purchase order type',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['STANDARD', 'BLANKET', 'CONTRACT'],
                },
                description: 'Multiple type values',
              },
            ],
          },
          dateFrom: {
            type: 'string',
            description: 'Date range start in ISO 8601 format (optional)',
          },
          dateTo: {
            type: 'string',
            description: 'Date range end in ISO 8601 format (optional)',
          },
          buyer: {
            type: 'string',
            description: 'Buyer filter (optional)',
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
        logger.info('Executing maximo_search_pos', { filters: Object.keys(args) });
        const validated = purchaseOrderSearchSchema.parse(args);
        const response = await operations.search(validated);
        return response;
      },
    },

    // Tool 8: Add Line Item to Purchase Order
    {
      name: 'maximo_add_po_line',
      description:
        'Add a line item to an existing purchase order. Requires ponum, siteid, description, and orderqty. ' +
        'Optionally specify itemnum, unitcost, orderunit, storeloc (storeroom), and gldebitacct (GL account).',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          itemnum: {
            type: 'string',
            description: 'Item number (optional, max 20 characters)',
          },
          description: {
            type: 'string',
            description: 'Line item description (required, max 100 characters)',
          },
          orderqty: {
            type: 'number',
            description: 'Quantity ordered (required, must be positive)',
          },
          unitcost: {
            type: 'number',
            description: 'Unit cost (optional, must be non-negative)',
          },
          orderunit: {
            type: 'string',
            description: 'Unit of measure (optional, max 10 characters)',
          },
          storeloc: {
            type: 'string',
            description: 'Store location / storeroom (optional, max 8 characters)',
          },
          gldebitacct: {
            type: 'string',
            description: 'GL debit account (optional, max 30 characters)',
          },
        },
        required: ['ponum', 'siteid', 'description', 'orderqty'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_add_po_line', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderAddLineItemSchema.parse(args);
        const response = await operations.addLineItem(validated);
        return response;
      },
    },

    // Tool 9: Get Line Items for Purchase Order
    {
      name: 'maximo_get_po_lines',
      description:
        'Retrieve all line items for a purchase order. Returns complete line item details ' +
        'including item numbers, quantities, costs, and receiving status.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['ponum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_po_lines', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderGetReceiptsSchema.parse(args);
        const response = await operations.getLineItems(validated.ponum, validated.siteid);
        return response;
      },
    },

    // Tool 10: Update Line Item on Purchase Order
    {
      name: 'maximo_update_po_line',
      description:
        'Update a specific line item on a purchase order. Specify ponum, siteid, and polinenum ' +
        'to identify the line, then provide fields to update (orderqty, unitcost, description, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          polinenum: {
            type: 'number',
            description: 'Purchase order line number to update (required)',
          },
          orderqty: {
            type: 'number',
            description: 'Updated quantity ordered (optional, must be positive)',
          },
          unitcost: {
            type: 'number',
            description: 'Updated unit cost (optional, must be non-negative)',
          },
          description: {
            type: 'string',
            description: 'Updated line item description (optional, max 100 characters)',
          },
          orderunit: {
            type: 'string',
            description: 'Updated unit of measure (optional, max 10 characters)',
          },
          storeloc: {
            type: 'string',
            description: 'Updated store location (optional, max 8 characters)',
          },
          gldebitacct: {
            type: 'string',
            description: 'Updated GL debit account (optional, max 30 characters)',
          },
        },
        required: ['ponum', 'siteid', 'polinenum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_update_po_line', {
          ponum: args.ponum,
          siteid: args.siteid,
          polinenum: args.polinenum,
        });
        const validated = purchaseOrderUpdateLineItemSchema.parse(args);
        const response = await operations.updateLineItem(validated);
        return response;
      },
    },

    // Tool 11: Remove Line Item from Purchase Order
    {
      name: 'maximo_remove_po_line',
      description:
        'Remove a specific line item from a purchase order. Specify ponum, siteid, and ' +
        'polinenum to identify the line item to remove.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          polinenum: {
            type: 'number',
            description: 'Purchase order line number to remove (required)',
          },
        },
        required: ['ponum', 'siteid', 'polinenum'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_remove_po_line', {
          ponum: args.ponum,
          siteid: args.siteid,
          polinenum: args.polinenum,
        });
        const validated = purchaseOrderRemoveLineItemSchema.parse(args);
        const response = await operations.removeLineItem(validated);
        return response;
      },
    },

    // Tool 12: Submit Purchase Order for Approval
    {
      name: 'maximo_submit_po_approval',
      description:
        'Submit a purchase order for approval workflow. Changes status to WAPPR (Waiting for Approval). ' +
        'Different from maximo_approve_po which actually approves the PO. Optionally include a memo.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          memo: {
            type: 'string',
            description: 'Submission memo (optional, max 500 characters)',
          },
        },
        required: ['ponum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_submit_po_approval', {
          ponum: args.ponum,
          siteid: args.siteid,
        });
        const validated = purchaseOrderSubmitForApprovalSchema.parse(args);
        const response = await operations.submitForApproval(validated);
        return response;
      },
    },

    // Tool 13: Reject Purchase Order
    {
      name: 'maximo_reject_po',
      description:
        'Reject a purchase order with a reason. Changes the status to CAN (Cancelled) and ' +
        'records the rejection reason in the comments. Requires a reason for the rejection.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          reason: {
            type: 'string',
            description: 'Rejection reason (required, max 500 characters)',
          },
        },
        required: ['ponum', 'siteid', 'reason'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_reject_po', { ponum: args.ponum, siteid: args.siteid });
        const validated = purchaseOrderRejectSchema.parse(args);
        const response = await operations.rejectPO(validated);
        return response;
      },
    },

    // Tool 14: Receive Specific Line Item
    {
      name: 'maximo_receive_po_line',
      description:
        'Receive a specific line item from a purchase order with partial receipt support. ' +
        'Specify the quantity received, and optionally whether items were inspected and the accepted quantity.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          polinenum: {
            type: 'number',
            description: 'Purchase order line number to receive (required)',
          },
          receiveqty: {
            type: 'number',
            description: 'Quantity received (required, must be positive)',
          },
          inspected: {
            type: 'boolean',
            description: 'Whether items have been inspected (optional)',
          },
          acceptedqty: {
            type: 'number',
            description: 'Accepted quantity after inspection (optional, must be non-negative)',
          },
        },
        required: ['ponum', 'siteid', 'polinenum', 'receiveqty'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_receive_po_line', {
          ponum: args.ponum,
          siteid: args.siteid,
          polinenum: args.polinenum,
        });
        const validated = purchaseOrderReceiveLineItemSchema.parse(args);
        const response = await operations.receiveLineItem(validated);
        return response;
      },
    },

    // Tool 15: Get Receipts for Purchase Order
    {
      name: 'maximo_get_po_receipts',
      description:
        'Retrieve all receipt records for a purchase order. Returns receipt details including ' +
        'quantities received, receipt dates, inspection status, and accepted quantities.',
      inputSchema: {
        type: 'object',
        properties: {
          ponum: {
            type: 'string',
            description: 'Purchase order number (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['ponum', 'siteid'],
      },
      handler: async (args: any) => {
        logger.info('Executing maximo_get_po_receipts', {
          ponum: args.ponum,
          siteid: args.siteid,
        });
        const validated = purchaseOrderGetReceiptsSchema.parse(args);
        const response = await operations.getReceipts(validated);
        return response;
      },
    },
  ];
}
