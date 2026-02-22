/**
 * Validation schemas for Asset Module
 * Uses Zod for runtime validation of asset data
 */

import { z } from 'zod';
import { ASSET_STATUSES } from '../../config/constants';

/**
 * Asset status enum schema
 */
export const assetStatusSchema = z.enum([
  'OPERATING',
  'NOT READY',
  'DECOMMISSIONED',
  'MISSING',
  'SEALED',
]);

/**
 * Asset type enum schema
 */
export const assetTypeSchema = z.enum([
  'IT',
  'PRODUCTION',
  'FACILITIES',
  'TRANSPORTATION',
  'INFRASTRUCTURE',
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
 * Priority schema (1-5, where 1 is highest)
 */
export const prioritySchema = z.number().int().min(1).max(5);

/**
 * Asset number schema
 */
export const assetNumSchema = z.string().min(1, 'Asset number is required').max(12);

/**
 * Asset creation schema
 */
export const assetCreateSchema = z.object({
  assetnum: assetNumSchema,
  description: z.string().min(1, 'Description is required').max(100),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  assettype: assetTypeSchema,
  orgid: z.string().max(8).optional(),
  location: z.string().max(12).optional(),
  status: assetStatusSchema.optional(),
  parent: z.string().max(12).optional(),
  priority: prioritySchema.optional(),
  serialnum: z.string().max(64).optional(),
  manufacturer: z.string().max(80).optional(),
  vendor: z.string().max(12).optional(),
  model: z.string().max(20).optional(),
  purchaseprice: z.number().min(0).optional(),
  purchasedate: isoDateSchema.optional(),
  installdate: isoDateSchema.optional(),
  warrantyexpdate: isoDateSchema.optional(),
  replacecost: z.number().min(0).optional(),
  failurecode: z.string().max(8).optional(),
  classstructureid: z.string().max(20).optional(),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  itemnum: z.string().max(30).optional(),
  isrotating: z.boolean().optional(),
  budgetcost: z.number().min(0).optional(),
  ownership: z.string().max(12).optional(),
  lease: z.boolean().optional(),
  leaseexpdate: isoDateSchema.optional(),
  leasecost: z.number().min(0).optional(),
  leasecontractnum: z.string().max(12).optional(),
  leasevendor: z.string().max(12).optional(),
  capitalized: z.boolean().optional(),
  depreciationcode: z.string().max(8).optional(),
  salvagevalue: z.number().min(0).optional(),
  expectedlife: z.number().min(0).optional(),
}).refine(
  (data) => {
    // Validate purchase and install date relationship
    if (data.purchasedate && data.installdate) {
      const purchase = new Date(data.purchasedate);
      const install = new Date(data.installdate);
      return purchase <= install;
    }
    return true;
  },
  {
    message: 'Installation date must be after purchase date',
    path: ['installdate'],
  }
).refine(
  (data) => {
    // Validate warranty expiration is after purchase date
    if (data.purchasedate && data.warrantyexpdate) {
      const purchase = new Date(data.purchasedate);
      const warranty = new Date(data.warrantyexpdate);
      return purchase <= warranty;
    }
    return true;
  },
  {
    message: 'Warranty expiration date must be after purchase date',
    path: ['warrantyexpdate'],
  }
).refine(
  (data) => {
    // Validate lease expiration is provided if lease flag is true
    if (data.lease && !data.leaseexpdate) {
      return false;
    }
    return true;
  },
  {
    message: 'Lease expiration date is required when lease flag is true',
    path: ['leaseexpdate'],
  }
);

/**
 * Asset update schema
 */
export const assetUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  status: assetStatusSchema.optional(),
  location: z.string().max(12).optional(),
  priority: prioritySchema.optional(),
  serialnum: z.string().max(64).optional(),
  manufacturer: z.string().max(80).optional(),
  vendor: z.string().max(12).optional(),
  model: z.string().max(20).optional(),
  purchaseprice: z.number().min(0).optional(),
  purchasedate: isoDateSchema.optional(),
  installdate: isoDateSchema.optional(),
  warrantyexpdate: isoDateSchema.optional(),
  replacecost: z.number().min(0).optional(),
  failurecode: z.string().max(8).optional(),
  isrunning: z.boolean().optional(),
  classstructureid: z.string().max(20).optional(),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  itemnum: z.string().max(30).optional(),
  budgetcost: z.number().min(0).optional(),
  ownership: z.string().max(12).optional(),
  lease: z.boolean().optional(),
  leaseexpdate: isoDateSchema.optional(),
  leasecost: z.number().min(0).optional(),
  leasecontractnum: z.string().max(12).optional(),
  leasevendor: z.string().max(12).optional(),
  capitalized: z.boolean().optional(),
  depreciationcode: z.string().max(8).optional(),
  salvagevalue: z.number().min(0).optional(),
  expectedlife: z.number().min(0).optional(),
  remaininglife: z.number().min(0).optional(),
}).refine(
  (data) => {
    // Validate purchase and install date relationship
    if (data.purchasedate && data.installdate) {
      const purchase = new Date(data.purchasedate);
      const install = new Date(data.installdate);
      return purchase <= install;
    }
    return true;
  },
  {
    message: 'Installation date must be after purchase date',
    path: ['installdate'],
  }
).refine(
  (data) => {
    // Validate warranty expiration is after purchase date
    if (data.purchasedate && data.warrantyexpdate) {
      const purchase = new Date(data.purchasedate);
      const warranty = new Date(data.warrantyexpdate);
      return purchase <= warranty;
    }
    return true;
  },
  {
    message: 'Warranty expiration date must be after purchase date',
    path: ['warrantyexpdate'],
  }
);

/**
 * Asset search schema
 */
export const assetSearchSchema = z.object({
  status: z.union([
    assetStatusSchema,
    z.array(assetStatusSchema),
  ]).optional(),
  assettype: z.union([
    assetTypeSchema,
    z.array(assetTypeSchema),
  ]).optional(),
  location: z.string().max(12).optional(),
  parent: z.string().max(12).optional(),
  manufacturer: z.string().max(80).optional(),
  serialnum: z.string().max(64).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  priority: prioritySchema.optional(),
  failurecode: z.string().max(8).optional(),
  isrunning: z.boolean().optional(),
  dateRange: z.object({
    start: isoDateSchema,
    end: isoDateSchema,
    field: z.enum([
      'purchasedate',
      'installdate',
      'warrantyexpdate',
      'statusdate',
      'changedate',
    ]).optional(),
  }).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  page: z.number().int().min(1).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  searchTerms: z.string().optional(),
}).refine(
  (data) => {
    // Validate date range if provided
    if (data.dateRange) {
      const start = new Date(data.dateRange.start);
      const end = new Date(data.dateRange.end);
      return start <= end;
    }
    return true;
  },
  {
    message: 'Date range end must be after start',
    path: ['dateRange', 'end'],
  }
);

/**
 * Asset move schema
 */
export const assetMoveSchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  newLocation: z.string().min(1, 'New location is required').max(12),
  moveDate: isoDateSchema.optional(),
  memo: z.string().max(50).optional(),
  newBinnum: z.string().max(8).optional(),
  newLotnum: z.string().max(9).optional(),
});

/**
 * Meter reading schema
 */
export const meterReadingSchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  metername: z.string().min(1, 'Meter name is required').max(10),
  reading: z.number().min(0, 'Reading must be non-negative'),
  readingdate: isoDateSchema,
  inspector: z.string().max(30).optional(),
  remarks: z.string().max(50).optional(),
  newreading: z.boolean().optional(),
  rollover: z.boolean().optional(),
});

/**
 * Asset specification schema
 */
export const assetSpecSchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  assetattrid: z.string().min(1, 'Asset attribute ID is required').max(16),
  alnvalue: z.string().max(254).optional(),
  numvalue: z.number().optional(),
  tablevalue: z.string().max(254).optional(),
  section: z.string().max(10).optional(),
  measureunitid: z.string().max(16).optional(),
}).refine(
  (data) => {
    // At least one value field must be provided
    return !!(data.alnvalue || data.numvalue !== undefined || data.tablevalue);
  },
  {
    message: 'At least one value field (alnvalue, numvalue, or tablevalue) must be provided',
  }
);

/**
 * Asset identifier schema (for get/delete operations)
 */
export const assetIdentifierSchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Validate asset status
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function validateAssetStatus(status: string): boolean {
  return ASSET_STATUSES.includes(status as any);
}

/**
 * Validate asset number format
 * @param assetnum - Asset number to validate
 * @returns True if valid, false otherwise
 */
export function validateAssetNum(assetnum: string): boolean {
  return assetnum.length > 0 && assetnum.length <= 12;
}

/**
 * Validate priority value
 * @param priority - Priority to validate (1-5)
 * @returns True if valid, false otherwise
 */
export function validatePriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 1 && priority <= 5;
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
 * Validate asset hierarchy (no circular references)
 * @param assetnum - Asset number
 * @param parent - Parent asset number
 * @returns True if valid, false if circular reference detected
 */
export function validateAssetHierarchy(assetnum: string, parent?: string): boolean {
  // Cannot be its own parent
  if (parent && assetnum === parent) {
    return false;
  }
  return true;
}

/**
 * Validate meter reading value
 * @param reading - Reading value
 * @param rollover - Whether this is a rollover reading
 * @returns True if valid, false otherwise
 */
export function validateMeterReading(reading: number, rollover?: boolean): boolean {
  // Reading must be non-negative
  if (reading < 0) {
    return false;
  }
  
  // If rollover, reading should typically be small (starting over)
  // This is a business rule that can be adjusted
  if (rollover && reading > 1000000) {
    return false;
  }
  
  return true;
}

/**
 * Validate cost values
 * @param cost - Cost value to validate
 * @returns True if valid, false otherwise
 */
export function validateCost(cost: number): boolean {
  return cost >= 0 && Number.isFinite(cost);
}

/**
 * Meter history query schema
 */
export const meterHistorySchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  metername: z.string().max(10).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  orderBy: z.string().optional(),
});

/**
 * Asset status change schema
 */
export const assetStatusChangeSchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  status: assetStatusSchema,
  memo: z.string().max(50).optional(),
});

/**
 * Downtime history query schema
 */
export const downtimeHistorySchema = z.object({
  assetnum: assetNumSchema,
  siteid: z.string().min(1, 'Site ID is required').max(8),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
}).refine(
  (data) => {
    // Validate date range if both dates provided
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
 * Type exports for Zod inferred types
 */
export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;
export type AssetSearchInput = z.infer<typeof assetSearchSchema>;
export type AssetMoveInput = z.infer<typeof assetMoveSchema>;
export type MeterReadingInput = z.infer<typeof meterReadingSchema>;
export type AssetSpecInput = z.infer<typeof assetSpecSchema>;
export type AssetIdentifierInput = z.infer<typeof assetIdentifierSchema>;
export type MeterHistoryInput = z.infer<typeof meterHistorySchema>;
export type AssetStatusChangeInput = z.infer<typeof assetStatusChangeSchema>;
export type DowntimeHistoryInput = z.infer<typeof downtimeHistorySchema>;