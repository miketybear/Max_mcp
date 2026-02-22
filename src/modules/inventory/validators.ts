/**
 * Validation schemas for Inventory Module
 * Uses Zod for runtime validation of inventory data
 */

import { z } from 'zod';

/**
 * Item type enum schema
 */
export const itemTypeSchema = z.enum(['ITEM', 'TOOL', 'SERVICE', 'SPECIAL']);

/**
 * Item status enum schema
 */
export const itemStatusSchema = z.enum(['ACTIVE', 'PENDING', 'PENDOBS', 'OBSOLETE']);

/**
 * Lot type enum schema
 */
export const lotTypeSchema = z.enum(['LOT', 'NOLOT']);

/**
 * Transaction type enum schema
 */
export const transactionTypeSchema = z.enum([
  'ISSUE',
  'RETURN',
  'TRANSFER',
  'ADJUSTMENT',
  'RECEIPT',
  'VOIDRECEIPT',
  'VOIDISSUE',
]);

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
 * Item number schema
 */
export const itemNumSchema = z.string().min(1, 'Item number is required').max(30);

/**
 * Storeroom location schema
 */
export const storeroomSchema = z.string().min(1, 'Storeroom location is required').max(12);

/**
 * Quantity schema (must be positive)
 */
export const quantitySchema = z.number().positive('Quantity must be greater than 0');

/**
 * Cost schema (must be non-negative)
 */
export const costSchema = z.number().min(0, 'Cost must be non-negative');

/**
 * Item creation schema
 */
export const itemCreateSchema = z.object({
  itemnum: itemNumSchema,
  description: z.string().min(1, 'Description is required').max(100),
  itemtype: itemTypeSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  orgid: z.string().max(8).optional(),
  status: itemStatusSchema.optional(),
  orderunit: z.string().max(16).optional(),
  issueunit: z.string().max(16).optional(),
  avgcost: costSchema.optional(),
  stdcost: costSchema.optional(),
  lastcost: costSchema.optional(),
  lottype: lotTypeSchema.optional(),
  rotating: z.boolean().optional(),
  conditionenabled: z.boolean().optional(),
  manufacturer: z.string().max(80).optional(),
  modelnum: z.string().max(20).optional(),
  commoditygroup: z.string().max(8).optional(),
  commodity: z.string().max(8).optional(),
  gldebitacct: z.string().max(23).optional(),
  glcreditacct: z.string().max(23).optional(),
  conversion: z.number().positive().optional(),
  issuetype: z.string().max(12).optional(),
  capitalized: z.boolean().optional(),
  taxexempt: z.boolean().optional(),
  inspectionrequired: z.boolean().optional(),
  vendor: z.string().max(12).optional(),
  catalogcode: z.string().max(8).optional(),
}).refine(
  (data) => {
    // If rotating is true, lottype should be NOLOT
    if (data.rotating && data.lottype === 'LOT') {
      return false;
    }
    return true;
  },
  {
    message: 'Rotating items cannot use lot tracking',
    path: ['lottype'],
  }
);

/**
 * Inventory search schema
 */
export const inventorySearchSchema = z.object({
  itemtype: z.union([
    itemTypeSchema,
    z.array(itemTypeSchema),
  ]).optional(),
  status: z.union([
    itemStatusSchema,
    z.array(itemStatusSchema),
  ]).optional(),
  commoditygroup: z.string().max(8).optional(),
  manufacturer: z.string().max(80).optional(),
  description: z.string().optional(),
  location: z.string().max(12).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  rotating: z.boolean().optional(),
  conditionenabled: z.boolean().optional(),
  vendor: z.string().max(12).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  page: z.number().int().min(1).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  searchTerms: z.string().optional(),
});

/**
 * Issue transaction schema
 */
export const issueTransactionSchema = z.object({
  itemnum: itemNumSchema,
  location: storeroomSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  quantity: quantitySchema,
  wonum: z.string().max(10).optional(),
  assetnum: z.string().max(12).optional(),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  gldebitacct: z.string().max(23).optional(),
  glcreditacct: z.string().max(23).optional(),
  transdate: isoDateSchema.optional(),
  memo: z.string().max(50).optional(),
  issuetype: z.string().max(12).optional(),
  taskid: z.string().max(10).optional(),
  linecost: costSchema.optional(),
  unitcost: costSchema.optional(),
  conversion: z.number().positive().optional(),
  issueunit: z.string().max(16).optional(),
  enterby: z.string().max(30).optional(),
}).refine(
  (data) => {
    // Either wonum or assetnum should be provided for issue transactions
    if (!data.wonum && !data.assetnum) {
      return false;
    }
    return true;
  },
  {
    message: 'Either work order number (wonum) or asset number (assetnum) must be provided',
    path: ['wonum'],
  }
);

/**
 * Return transaction schema
 */
export const returnTransactionSchema = z.object({
  itemnum: itemNumSchema,
  location: storeroomSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  quantity: quantitySchema,
  wonum: z.string().max(10).optional(),
  rotassetnum: z.string().max(12).optional(),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  transdate: isoDateSchema.optional(),
  memo: z.string().max(50).optional(),
  linecost: costSchema.optional(),
  unitcost: costSchema.optional(),
  conversion: z.number().positive().optional(),
  issueunit: z.string().max(16).optional(),
  enterby: z.string().max(30).optional(),
  conditioncode: z.string().max(30).optional(),
});

/**
 * Transfer transaction schema
 */
export const transferTransactionSchema = z.object({
  itemnum: itemNumSchema,
  fromstoreloc: storeroomSchema,
  tostoreloc: z.string().min(1, 'To storeroom location is required').max(12),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  quantity: quantitySchema,
  frombinnum: z.string().max(8).optional(),
  tobinnum: z.string().max(8).optional(),
  fromlotnum: z.string().max(9).optional(),
  tolotnum: z.string().max(9).optional(),
  transdate: isoDateSchema.optional(),
  memo: z.string().max(50).optional(),
  linecost: costSchema.optional(),
  unitcost: costSchema.optional(),
  enterby: z.string().max(30).optional(),
}).refine(
  (data) => {
    // From and to storerooms must be different
    if (data.fromstoreloc === data.tostoreloc) {
      return false;
    }
    return true;
  },
  {
    message: 'From and to storeroom locations must be different',
    path: ['tostoreloc'],
  }
);

/**
 * Adjustment transaction schema
 */
export const adjustmentTransactionSchema = z.object({
  itemnum: itemNumSchema,
  location: storeroomSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  physcnt: z.number().min(0, 'Physical count must be non-negative'),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  transdate: isoDateSchema.optional(),
  reason: z.string().max(50).optional(),
  gldebitacct: z.string().max(23).optional(),
  glcreditacct: z.string().max(23).optional(),
  enterby: z.string().max(30).optional(),
  reconciled: z.boolean().optional(),
});

/**
 * Get inventory schema
 */
export const getInventorySchema = z.object({
  itemnum: itemNumSchema,
  location: storeroomSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Get transactions schema
 */
export const getTransactionsSchema = z.object({
  itemnum: itemNumSchema,
  location: storeroomSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  page: z.number().int().min(1).optional(),
}).refine(
  (data) => {
    // Validate date range if both dates are provided
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Validate item number format
 * @param itemnum - Item number to validate
 * @returns True if valid, false otherwise
 */
export function validateItemNum(itemnum: string): boolean {
  return itemnum.length > 0 && itemnum.length <= 30;
}

/**
 * Validate quantity (must be positive)
 * @param quantity - Quantity to validate
 * @returns True if valid, false otherwise
 */
export function validateQuantity(quantity: number): boolean {
  return quantity > 0 && Number.isFinite(quantity);
}

/**
 * Validate storeroom location format
 * @param location - Storeroom location to validate
 * @returns True if valid, false otherwise
 */
export function validateStoreroom(location: string): boolean {
  return location.length > 0 && location.length <= 12;
}

/**
 * Validate transaction type
 * @param type - Transaction type to validate
 * @returns True if valid, false otherwise
 */
export function validateTransactionType(type: string): boolean {
  const validTypes = ['ISSUE', 'RETURN', 'TRANSFER', 'ADJUSTMENT', 'RECEIPT', 'VOIDRECEIPT', 'VOIDISSUE'];
  return validTypes.includes(type);
}

/**
 * Validate item type
 * @param itemtype - Item type to validate
 * @returns True if valid, false otherwise
 */
export function validateItemType(itemtype: string): boolean {
  const validTypes = ['ITEM', 'TOOL', 'SERVICE', 'SPECIAL'];
  return validTypes.includes(itemtype);
}

/**
 * Validate item status
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function validateItemStatus(status: string): boolean {
  const validStatuses = ['ACTIVE', 'PENDING', 'PENDOBS', 'OBSOLETE'];
  return validStatuses.includes(status);
}

/**
 * Validate cost value
 * @param cost - Cost value to validate
 * @returns True if valid, false otherwise
 */
export function validateCost(cost: number): boolean {
  return cost >= 0 && Number.isFinite(cost);
}

/**
 * Validate ISO 8601 date string
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function validateISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Validate date range
 * @param start - Start date (ISO 8601 format)
 * @param end - End date (ISO 8601 format)
 * @returns True if valid, false otherwise
 */
export function validateDates(start: string, end: string): boolean {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }
    
    return startDate <= endDate;
  } catch {
    return false;
  }
}

/**
 * Validate lot number format
 * @param lotnum - Lot number to validate
 * @returns True if valid, false otherwise
 */
export function validateLotNum(lotnum: string): boolean {
  return lotnum.length > 0 && lotnum.length <= 9;
}

/**
 * Validate bin number format
 * @param binnum - Bin number to validate
 * @returns True if valid, false otherwise
 */
export function validateBinNum(binnum: string): boolean {
  return binnum.length > 0 && binnum.length <= 8;
}

/**
 * Validate GL account format
 * @param account - GL account to validate
 * @returns True if valid, false otherwise
 */
export function validateGLAccount(account: string): boolean {
  return account.length > 0 && account.length <= 23;
}

/**
 * Validate physical count (must be non-negative)
 * @param physcnt - Physical count to validate
 * @returns True if valid, false otherwise
 */
export function validatePhysicalCount(physcnt: number): boolean {
  return physcnt >= 0 && Number.isFinite(physcnt);
}

/**
 * Validate conversion factor (must be positive)
 * @param conversion - Conversion factor to validate
 * @returns True if valid, false otherwise
 */
export function validateConversion(conversion: number): boolean {
  return conversion > 0 && Number.isFinite(conversion);
}

/**
 * Validate rotating item configuration
 * @param rotating - Rotating flag
 * @param lottype - Lot type
 * @returns True if valid, false otherwise
 */
export function validateRotatingConfig(rotating: boolean, lottype?: string): boolean {
  // Rotating items cannot use lot tracking
  if (rotating && lottype === 'LOT') {
    return false;
  }
  return true;
}

/**
 * Validate issue transaction requirements
 * @param wonum - Work order number
 * @param assetnum - Asset number
 * @returns True if valid, false otherwise
 */
export function validateIssueRequirements(wonum?: string, assetnum?: string): boolean {
  // Either wonum or assetnum must be provided
  return !!(wonum || assetnum);
}

/**
 * Validate transfer locations
 * @param fromstoreloc - From storeroom location
 * @param tostoreloc - To storeroom location
 * @returns True if valid, false otherwise
 */
export function validateTransferLocations(fromstoreloc: string, tostoreloc: string): boolean {
  // From and to locations must be different
  return fromstoreloc !== tostoreloc;
}

/**
 * Update reorder point schema
 */
export const updateReorderPointSchema = z.object({
  itemnum: itemNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  location: storeroomSchema,
  reorder: z.number().min(0, 'Reorder point must be non-negative').optional(),
  minlevel: z.number().min(0, 'Minimum level must be non-negative').optional(),
  maxlevel: z.number().min(0, 'Maximum level must be non-negative').optional(),
  orderqty: z.number().min(0, 'Order quantity must be non-negative').optional(),
}).refine(
  (data) => {
    // At least one reorder field must be provided
    return data.reorder !== undefined || data.minlevel !== undefined ||
           data.maxlevel !== undefined || data.orderqty !== undefined;
  },
  {
    message: 'At least one of reorder, minlevel, maxlevel, or orderqty must be provided',
    path: ['reorder'],
  }
).refine(
  (data) => {
    // If both minlevel and maxlevel are provided, maxlevel must be >= minlevel
    if (data.minlevel !== undefined && data.maxlevel !== undefined) {
      return data.maxlevel >= data.minlevel;
    }
    return true;
  },
  {
    message: 'Maximum level must be greater than or equal to minimum level',
    path: ['maxlevel'],
  }
);

/**
 * Get stock levels schema
 */
export const getStockLevelsSchema = z.object({
  itemnum: itemNumSchema,
  siteid: z.string().max(8).optional(),
  includeAllStorerooms: z.boolean().optional(),
});

/**
 * Get items below reorder point schema
 */
export const getItemsBelowReorderSchema = z.object({
  siteid: z.string().max(8).optional(),
  location: z.string().max(12).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
});

/**
 * Type exports for Zod inferred types
 */
export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type InventorySearchInput = z.infer<typeof inventorySearchSchema>;
export type IssueTransactionInput = z.infer<typeof issueTransactionSchema>;
export type ReturnTransactionInput = z.infer<typeof returnTransactionSchema>;
export type TransferTransactionInput = z.infer<typeof transferTransactionSchema>;
export type AdjustmentTransactionInput = z.infer<typeof adjustmentTransactionSchema>;
export type GetInventoryInput = z.infer<typeof getInventorySchema>;
export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;
export type UpdateReorderPointInput = z.infer<typeof updateReorderPointSchema>;
export type GetStockLevelsInput = z.infer<typeof getStockLevelsSchema>;
export type GetItemsBelowReorderInput = z.infer<typeof getItemsBelowReorderSchema>;