/**
 * Validation schemas for Purchase Order Module
 * Uses Zod for runtime validation of purchase order data
 */

import { z } from 'zod';

/**
 * Purchase order status enum schema
 */
export const purchaseOrderStatusSchema = z.enum(['WAPPR', 'APPR', 'PCH', 'CLOSE', 'CAN']);

/**
 * Purchase order type enum schema
 */
export const purchaseOrderTypeSchema = z.enum(['STANDARD', 'BLANKET', 'CONTRACT']);

/**
 * ISO 8601 date string schema
 */
export const isoDateSchema = z.string().refine(
  (date) => {
    try {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  },
  { message: 'Invalid ISO 8601 date format' }
);

/**
 * Purchase order line creation schema
 */
export const purchaseOrderLineCreateSchema = z.object({
  itemnum: z.string().max(20).optional(),
  description: z.string().min(1, 'Description is required').max(100),
  orderqty: z.number().positive('Quantity must be positive'),
  orderunit: z.string().max(10).optional(),
  unitcost: z.number().min(0).optional(),
  storeloc: z.string().max(8).optional(),
  reqdate: isoDateSchema.optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  wonum: z.string().max(10).optional(),
});

/**
 * Purchase order creation schema
 */
export const purchaseOrderCreateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  vendor: z.string().min(1, 'Vendor is required').max(8),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  orgid: z.string().max(8).optional(),
  potype: purchaseOrderTypeSchema.optional(),
  orderdate: isoDateSchema.optional(),
  reqdate: isoDateSchema.optional(),
  buyer: z.string().max(30).optional(),
  termsconditions: z.string().optional(),
  shipvia: z.string().max(20).optional(),
  fob: z.string().max(20).optional(),
  taxcode: z.string().max(8).optional(),
  refnum: z.string().max(20).optional(),
  comments: z.string().optional(),
  poline: z.array(purchaseOrderLineCreateSchema).optional(),
}).refine(
  (data) => {
    // Validate date ranges if both dates are provided
    if (data.orderdate && data.reqdate) {
      const order = new Date(data.orderdate);
      const req = new Date(data.reqdate);
      return order <= req;
    }
    return true;
  },
  {
    message: 'Requested date must be after order date',
    path: ['reqdate'],
  }
);

/**
 * Purchase order update schema
 */
export const purchaseOrderUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  vendor: z.string().min(1).max(8).optional(),
  potype: purchaseOrderTypeSchema.optional(),
  orderdate: isoDateSchema.optional(),
  reqdate: isoDateSchema.optional(),
  buyer: z.string().max(30).optional(),
  termsconditions: z.string().optional(),
  shipvia: z.string().max(20).optional(),
  fob: z.string().max(20).optional(),
  taxcode: z.string().max(8).optional(),
  refnum: z.string().max(20).optional(),
  comments: z.string().optional(),
}).refine(
  (data) => {
    // Validate date ranges if both dates are provided
    if (data.orderdate && data.reqdate) {
      const order = new Date(data.orderdate);
      const req = new Date(data.reqdate);
      return order <= req;
    }
    return true;
  },
  {
    message: 'Requested date must be after order date',
    path: ['reqdate'],
  }
);

/**
 * Purchase order search schema
 */
export const purchaseOrderSearchSchema = z.object({
  status: z.union([purchaseOrderStatusSchema, z.array(purchaseOrderStatusSchema)]).optional(),
  vendor: z.string().max(8).optional(),
  siteid: z.string().max(8).optional(),
  potype: z.union([purchaseOrderTypeSchema, z.array(purchaseOrderTypeSchema)]).optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  buyer: z.string().max(30).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  pageNum: z.number().int().min(1).optional(),
}).refine(
  (data) => {
    // Validate date range if both dates are provided
    if (data.dateFrom && data.dateTo) {
      const from = new Date(data.dateFrom);
      const to = new Date(data.dateTo);
      return from <= to;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['dateTo'],
  }
);

/**
 * Purchase order identifier schema
 */
export const purchaseOrderIdentifierSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().max(8).optional(),
});

/**
 * Purchase order receipt schema
 */
export const purchaseOrderReceiptSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  polinenum: z.number().int().positive('Line number must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  receiptdate: isoDateSchema.optional(),
  tostoreloc: z.string().max(8).optional(),
  siteid: z.string().max(8).optional(),
  comments: z.string().optional(),
});

/**
 * Purchase order approval schema
 */
export const purchaseOrderApprovalSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  memo: z.string().optional(),
  siteid: z.string().max(8).optional(),
});

/**
 * Validate purchase order status
 */
export function validatePurchaseOrderStatus(status: string): boolean {
  return purchaseOrderStatusSchema.safeParse(status).success;
}

/**
 * Validate purchase order type
 */
export function validatePurchaseOrderType(type: string): boolean {
  return purchaseOrderTypeSchema.safeParse(type).success;
}

/**
 * Validate ISO date string
 */
export function validateISODate(date: string): boolean {
  try {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
}

/**
 * Validate dates (ensure end date is after start date)
 */
export function validateDates(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) {
    return true;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * Validate cost (must be non-negative)
 */
export function validateCost(cost?: number): boolean {
  if (cost === undefined) {
    return true;
  }
  return cost >= 0;
}

/**
 * Validate quantity (must be positive)
 */
export function validateQuantity(quantity: number): boolean {
  return quantity > 0;
}

/**
 * Add line item schema
 */
export const purchaseOrderAddLineItemSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  itemnum: z.string().max(20).optional(),
  description: z.string().min(1, 'Description is required').max(100),
  orderqty: z.number().positive('Quantity must be positive'),
  unitcost: z.number().min(0).optional(),
  orderunit: z.string().max(10).optional(),
  storeloc: z.string().max(8).optional(),
  gldebitacct: z.string().max(30).optional(),
});

/**
 * Update line item schema
 */
export const purchaseOrderUpdateLineItemSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  polinenum: z.number().int().positive('Line number must be positive'),
  orderqty: z.number().positive('Quantity must be positive').optional(),
  unitcost: z.number().min(0).optional(),
  description: z.string().min(1).max(100).optional(),
  orderunit: z.string().max(10).optional(),
  storeloc: z.string().max(8).optional(),
  gldebitacct: z.string().max(30).optional(),
});

/**
 * Remove line item schema
 */
export const purchaseOrderRemoveLineItemSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  polinenum: z.number().int().positive('Line number must be positive'),
});

/**
 * Submit for approval schema
 */
export const purchaseOrderSubmitForApprovalSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  memo: z.string().max(500).optional(),
});

/**
 * Reject purchase order schema
 */
export const purchaseOrderRejectSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});

/**
 * Receive line item schema
 */
export const purchaseOrderReceiveLineItemSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  polinenum: z.number().int().positive('Line number must be positive'),
  receiveqty: z.number().positive('Receive quantity must be positive'),
  inspected: z.boolean().optional(),
  acceptedqty: z.number().min(0).optional(),
});

/**
 * Get receipts schema
 */
export const purchaseOrderGetReceiptsSchema = z.object({
  ponum: z.string().min(1, 'PO number is required').max(20),
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Input types for validators (inferred from schemas)
 */
export type PurchaseOrderCreateInput = z.infer<typeof purchaseOrderCreateSchema>;
export type PurchaseOrderUpdateInput = z.infer<typeof purchaseOrderUpdateSchema>;
export type PurchaseOrderSearchInput = z.infer<typeof purchaseOrderSearchSchema>;
export type PurchaseOrderIdentifierInput = z.infer<typeof purchaseOrderIdentifierSchema>;
export type PurchaseOrderReceiptInput = z.infer<typeof purchaseOrderReceiptSchema>;
export type PurchaseOrderApprovalInput = z.infer<typeof purchaseOrderApprovalSchema>;
export type PurchaseOrderAddLineItemInput = z.infer<typeof purchaseOrderAddLineItemSchema>;
export type PurchaseOrderUpdateLineItemInput = z.infer<typeof purchaseOrderUpdateLineItemSchema>;
export type PurchaseOrderRemoveLineItemInput = z.infer<typeof purchaseOrderRemoveLineItemSchema>;
export type PurchaseOrderSubmitForApprovalInput = z.infer<typeof purchaseOrderSubmitForApprovalSchema>;
export type PurchaseOrderRejectInput = z.infer<typeof purchaseOrderRejectSchema>;
export type PurchaseOrderReceiveLineItemInput = z.infer<typeof purchaseOrderReceiveLineItemSchema>;
export type PurchaseOrderGetReceiptsInput = z.infer<typeof purchaseOrderGetReceiptsSchema>;
