/**
 * Validation schemas for Work Order Module
 * Uses Zod for runtime validation of work order data
 */

import { z } from 'zod';
import { WORK_ORDER_STATUSES } from '../../config/constants';

/**
 * Work order status enum schema
 */
export const workOrderStatusSchema = z.enum([
  'WAPPR',
  'APPR',
  'WSCH',
  'INPRG',
  'COMP',
  'CLOSE',
  'CAN',
]);

/**
 * Work order type enum schema
 */
export const workOrderTypeSchema = z.enum(['CM', 'PM', 'EM', 'CAL', 'INS']);

/**
 * Work log type enum schema
 */
export const workLogTypeSchema = z.enum(['WORK', 'UPDATE', 'CLIENTNOTE', 'MODDATE']);

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
 * Work order creation schema
 */
export const workOrderCreateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  worktype: workOrderTypeSchema,
  orgid: z.string().max(8).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  priority: prioritySchema.optional(),
  schedstart: isoDateSchema.optional(),
  schedfinish: isoDateSchema.optional(),
  targstartdate: isoDateSchema.optional(),
  targcompdate: isoDateSchema.optional(),
  reportedby: z.string().max(30).optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  supervisor: z.string().max(30).optional(),
  lead: z.string().max(30).optional(),
  wopriority: prioritySchema.optional(),
  estdur: z.number().min(0).optional(),
  description_longdescription: z.string().optional(),
  failurecode: z.string().max(8).optional(),
  problemcode: z.string().max(8).optional(),
  woclass: z.string().max(16).optional(),
  glaccount: z.string().max(23).optional(),
  parent: z.string().max(10).optional(),
  crewworkgroup: z.string().max(8).optional(),
  jpnum: z.string().max(10).optional(),
  externalrefid: z.string().max(10).optional(),
}).refine(
  (data) => {
    // Validate date ranges if both dates are provided
    if (data.schedstart && data.schedfinish) {
      const start = new Date(data.schedstart);
      const finish = new Date(data.schedfinish);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Scheduled finish date must be after scheduled start date',
    path: ['schedfinish'],
  }
).refine(
  (data) => {
    // Validate target date ranges if both dates are provided
    if (data.targstartdate && data.targcompdate) {
      const start = new Date(data.targstartdate);
      const comp = new Date(data.targcompdate);
      return start <= comp;
    }
    return true;
  },
  {
    message: 'Target completion date must be after target start date',
    path: ['targcompdate'],
  }
);

/**
 * Work order update schema
 */
export const workOrderUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  priority: prioritySchema.optional(),
  schedstart: isoDateSchema.optional(),
  schedfinish: isoDateSchema.optional(),
  actstart: isoDateSchema.optional(),
  actfinish: isoDateSchema.optional(),
  targstartdate: isoDateSchema.optional(),
  targcompdate: isoDateSchema.optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  supervisor: z.string().max(30).optional(),
  lead: z.string().max(30).optional(),
  wopriority: prioritySchema.optional(),
  estdur: z.number().min(0).optional(),
  description_longdescription: z.string().optional(),
  failurecode: z.string().max(8).optional(),
  problemcode: z.string().max(8).optional(),
  woclass: z.string().max(16).optional(),
  glaccount: z.string().max(23).optional(),
  crewworkgroup: z.string().max(8).optional(),
  externalrefid: z.string().max(10).optional(),
}).refine(
  (data) => {
    // Validate scheduled date ranges if both dates are provided
    if (data.schedstart && data.schedfinish) {
      const start = new Date(data.schedstart);
      const finish = new Date(data.schedfinish);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Scheduled finish date must be after scheduled start date',
    path: ['schedfinish'],
  }
).refine(
  (data) => {
    // Validate actual date ranges if both dates are provided
    if (data.actstart && data.actfinish) {
      const start = new Date(data.actstart);
      const finish = new Date(data.actfinish);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Actual finish date must be after actual start date',
    path: ['actfinish'],
  }
).refine(
  (data) => {
    // Validate target date ranges if both dates are provided
    if (data.targstartdate && data.targcompdate) {
      const start = new Date(data.targstartdate);
      const comp = new Date(data.targcompdate);
      return start <= comp;
    }
    return true;
  },
  {
    message: 'Target completion date must be after target start date',
    path: ['targcompdate'],
  }
);

/**
 * Work order search schema
 */
export const workOrderSearchSchema = z.object({
  status: z.union([
    workOrderStatusSchema,
    z.array(workOrderStatusSchema),
  ]).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  worktype: z.union([
    workOrderTypeSchema,
    z.array(workOrderTypeSchema),
  ]).optional(),
  priority: prioritySchema.optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  supervisor: z.string().max(30).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  dateRange: z.object({
    start: isoDateSchema,
    end: isoDateSchema,
    field: z.enum([
      'schedstart',
      'schedfinish',
      'actstart',
      'actfinish',
      'statusdate',
      'targstartdate',
      'targcompdate',
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
 * Status change schema
 */
export const statusChangeSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  status: workOrderStatusSchema,
  memo: z.string().max(50).optional(),
  statusdate: isoDateSchema.optional(),
});

/**
 * Labor transaction schema
 */
export const laborTransactionSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  laborcode: z.string().min(1, 'Labor code is required').max(8),
  hours: z.number().min(0.01, 'Hours must be greater than 0'),
  transdate: isoDateSchema,
  starttime: isoDateSchema.optional(),
  finishtime: isoDateSchema.optional(),
  regularhrs: z.number().min(0).optional(),
  premiumpayhours: z.number().min(0).optional(),
  craft: z.string().max(8).optional(),
  skilllevel: z.string().max(8).optional(),
  vendor: z.string().max(12).optional(),
  contractnum: z.string().max(8).optional(),
  linecost: z.number().min(0).optional(),
  taskid: z.string().max(10).optional(),
  geolocation: z.string().optional(),
}).refine(
  (data) => {
    // Validate time range if both times are provided
    if (data.starttime && data.finishtime) {
      const start = new Date(data.starttime);
      const finish = new Date(data.finishtime);
      return start < finish;
    }
    return true;
  },
  {
    message: 'Finish time must be after start time',
    path: ['finishtime'],
  }
);

/**
 * Material transaction schema
 */
export const materialTransactionSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  itemnum: z.string().min(1, 'Item number is required').max(30),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  storeroom: z.string().max(12).optional(),
  binnum: z.string().max(8).optional(),
  lotnum: z.string().max(9).optional(),
  issuetype: z.string().max(12).optional(),
  transdate: isoDateSchema.optional(),
  linecost: z.number().min(0).optional(),
  unitcost: z.number().min(0).optional(),
  taskid: z.string().max(10).optional(),
  gldebitacct: z.string().max(23).optional(),
  glcreditacct: z.string().max(23).optional(),
  conversion: z.number().min(0).optional(),
  issueunit: z.string().max(16).optional(),
});

/**
 * Service entry schema
 */
export const serviceEntrySchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  description: z.string().min(1, 'Description is required').max(100),
  linecost: z.number().min(0, 'Line cost must be non-negative'),
  vendor: z.string().max(12).optional(),
  contractnum: z.string().max(8).optional(),
  ponum: z.string().max(9).optional(),
  polinenum: z.number().int().min(1).optional(),
  taskid: z.string().max(10).optional(),
  gldebitacct: z.string().max(23).optional(),
  enterdate: isoDateSchema.optional(),
  enterby: z.string().max(30).optional(),
});

/**
 * Work log schema
 */
export const workLogSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  description: z.string().min(1, 'Description is required').max(100),
  logtype: workLogTypeSchema.optional(),
  description_longdescription: z.string().optional(),
  createdate: isoDateSchema.optional(),
  createby: z.string().max(30).optional(),
  clientviewable: z.boolean().optional(),
  class: z.string().max(16).optional(),
});

/**
 * Assignment schema
 */
export const assignmentSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  supervisor: z.string().max(30).optional(),
  lead: z.string().max(30).optional(),
  crewworkgroup: z.string().max(8).optional(),
  assignmentdate: isoDateSchema.optional(),
  scheduledate: isoDateSchema.optional(),
}).refine(
  (data) => {
    // At least one assignment field must be provided
    return !!(
      data.owner ||
      data.ownergroup ||
      data.supervisor ||
      data.lead ||
      data.crewworkgroup
    );
  },
  {
    message: 'At least one assignment field must be provided',
  }
);

/**
 * Work order identifier schema (for get/delete operations)
 */
export const workOrderIdentifierSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Task creation schema
 */
export const taskSchema = z.object({
  wonum: z.string().min(1, 'Work order number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  description: z.string().min(1, 'Task description is required').max(100),
  taskid: z.number().int().min(1, 'Task ID must be a positive integer'),
  estdur: z.number().min(0).optional(),
  ownergroup: z.string().max(8).optional(),
  owner: z.string().max(30).optional(),
});

/**
 * Validate work order status
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function validateWorkOrderStatus(status: string): boolean {
  return WORK_ORDER_STATUSES.includes(status as any);
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
 * @param finish - Finish date (ISO 8601 format)
 * @returns True if valid, false otherwise
 */
export function validateDates(start: string, finish: string): boolean {
  try {
    const startDate = new Date(start);
    const finishDate = new Date(finish);
    
    if (isNaN(startDate.getTime()) || isNaN(finishDate.getTime())) {
      return false;
    }
    
    return startDate <= finishDate;
  } catch {
    return false;
  }
}

/**
 * Validate status transition
 * @param currentStatus - Current work order status
 * @param newStatus - New status to transition to
 * @returns True if transition is valid, false otherwise
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  // Define valid status transitions
  const validTransitions: Record<string, string[]> = {
    WAPPR: ['APPR', 'CAN'],
    APPR: ['WSCH', 'CAN'],
    WSCH: ['INPRG', 'CAN'],
    INPRG: ['COMP', 'CAN'],
    COMP: ['CLOSE'],
    CLOSE: [], // Cannot transition from CLOSE
    CAN: [], // Cannot transition from CAN
  };
  
  const allowedTransitions = validTransitions[currentStatus];
  if (!allowedTransitions) {
    return false;
  }
  
  return allowedTransitions.includes(newStatus);
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
 * Type exports for Zod inferred types
 */
export type WorkOrderCreateInput = z.infer<typeof workOrderCreateSchema>;
export type WorkOrderUpdateInput = z.infer<typeof workOrderUpdateSchema>;
export type WorkOrderSearchInput = z.infer<typeof workOrderSearchSchema>;
export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
export type LaborTransactionInput = z.infer<typeof laborTransactionSchema>;
export type MaterialTransactionInput = z.infer<typeof materialTransactionSchema>;
export type ServiceEntryInput = z.infer<typeof serviceEntrySchema>;
export type WorkLogInput = z.infer<typeof workLogSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type WorkOrderIdentifierInput = z.infer<typeof workOrderIdentifierSchema>;
export type TaskInput = z.infer<typeof taskSchema>;