/**
 * Validation schemas for Service Request Module
 * Uses Zod for runtime validation of service request data
 */

import { z } from 'zod';

/**
 * Service request status enum schema
 */
export const serviceRequestStatusSchema = z.enum([
  'NEW',
  'QUEUED',
  'INPROG',
  'PENDING',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
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
 * Ticket ID schema
 */
export const ticketIdSchema = z.string().min(1, 'Ticket ID is required').max(10);

/**
 * Email schema
 */
export const emailSchema = z.string().email('Invalid email format').optional();

/**
 * Phone schema
 */
export const phoneSchema = z.string().max(20).optional();

/**
 * Service request creation schema
 */
export const serviceRequestCreateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  reportedby: z.string().min(1, 'Reported by is required').max(30),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  orgid: z.string().max(8).optional(),
  affectedperson: z.string().max(30).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  classstructureid: z.string().max(20).optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  targetstart: isoDateSchema.optional(),
  targetfinish: isoDateSchema.optional(),
  reportedpriority: prioritySchema.optional(),
  externalsystem: z.string().max(10).optional(),
  externalrefid: z.string().max(10).optional(),
  commodity: z.string().max(8).optional(),
  commoditygroup: z.string().max(8).optional(),
  description_longdescription: z.string().optional(),
  class: z.string().max(16).optional(),
  tickettype: z.string().max(16).optional(),
  contact: z.string().max(30).optional(),
  phone: phoneSchema,
  email: emailSchema,
  building: z.string().max(12).optional(),
  floor: z.string().max(12).optional(),
  room: z.string().max(12).optional(),
  supervisor: z.string().max(30).optional(),
  parentticket: z.string().max(10).optional(),
}).refine(
  (data) => {
    // Validate target date ranges if both dates are provided
    if (data.targetstart && data.targetfinish) {
      const start = new Date(data.targetstart);
      const finish = new Date(data.targetfinish);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Target finish date must be after target start date',
    path: ['targetfinish'],
  }
);

/**
 * Service request update schema
 */
export const serviceRequestUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  status: serviceRequestStatusSchema.optional(),
  affectedperson: z.string().max(30).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  classstructureid: z.string().max(20).optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  targetstart: isoDateSchema.optional(),
  targetfinish: isoDateSchema.optional(),
  actstart: isoDateSchema.optional(),
  actfinish: isoDateSchema.optional(),
  reportedpriority: prioritySchema.optional(),
  commodity: z.string().max(8).optional(),
  commoditygroup: z.string().max(8).optional(),
  description_longdescription: z.string().optional(),
  class: z.string().max(16).optional(),
  tickettype: z.string().max(16).optional(),
  contact: z.string().max(30).optional(),
  phone: phoneSchema,
  email: emailSchema,
  building: z.string().max(12).optional(),
  floor: z.string().max(12).optional(),
  room: z.string().max(12).optional(),
  supervisor: z.string().max(30).optional(),
  resolutioncode: z.string().max(8).optional(),
  solution: z.string().optional(),
}).refine(
  (data) => {
    // Validate target date ranges if both dates are provided
    if (data.targetstart && data.targetfinish) {
      const start = new Date(data.targetstart);
      const finish = new Date(data.targetfinish);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Target finish date must be after target start date',
    path: ['targetfinish'],
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
);

/**
 * Service request search schema
 */
export const serviceRequestSearchSchema = z.object({
  status: z.union([serviceRequestStatusSchema, z.array(serviceRequestStatusSchema)]).optional(),
  reportedby: z.string().max(30).optional(),
  affectedperson: z.string().max(30).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  reportedpriority: prioritySchema.optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  classstructureid: z.string().max(20).optional(),
  commodity: z.string().max(8).optional(),
  commoditygroup: z.string().max(8).optional(),
  tickettype: z.string().max(16).optional(),
  relatedwonum: z.string().max(10).optional(),
  dateRange: z.object({
    start: isoDateSchema,
    end: isoDateSchema,
    field: z.enum([
      'reportdate',
      'statusdate',
      'targetstart',
      'targetfinish',
      'actstart',
      'actfinish',
      'resolveddate',
      'closeddate',
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
    message: 'End date must be after start date',
    path: ['dateRange', 'end'],
  }
);

/**
 * Status change schema
 */
export const statusChangeSchema = z.object({
  status: serviceRequestStatusSchema,
  memo: z.string().max(255).optional(),
  statusdate: isoDateSchema.optional(),
  resolutioncode: z.string().max(8).optional(),
  solution: z.string().optional(),
}).refine(
  (data) => {
    // Require resolution code for RESOLVED or CLOSED status
    if ((data.status === 'RESOLVED' || data.status === 'CLOSED') && !data.resolutioncode) {
      return false;
    }
    return true;
  },
  {
    message: 'Resolution code is required for RESOLVED or CLOSED status',
    path: ['resolutioncode'],
  }
);

/**
 * Work order conversion schema
 */
export const workOrderConversionSchema = z.object({
  worktype: z.string().max(5).optional(),
  description: z.string().max(100).optional(),
  priority: prioritySchema.optional(),
  schedstart: isoDateSchema.optional(),
  schedfinish: isoDateSchema.optional(),
  owner: z.string().max(30).optional(),
  ownergroup: z.string().max(8).optional(),
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
);

/**
 * Validate service request status value
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function validateSRStatus(status: string): boolean {
  const validStatuses = ['NEW', 'QUEUED', 'INPROG', 'PENDING', 'RESOLVED', 'CLOSED', 'CANCELLED'];
  return validStatuses.includes(status);
}

/**
 * Validate ticket ID format
 * @param ticketid - Ticket ID to validate
 * @returns True if valid, false otherwise
 */
export function validateTicketId(ticketid: string): boolean {
  if (!ticketid || ticketid.length === 0 || ticketid.length > 10) {
    return false;
  }
  return true;
}

/**
 * Validate priority range (1-5)
 * @param priority - Priority to validate
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
 * Status transition validation map
 * Defines valid status transitions for service requests
 */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ['QUEUED', 'INPROG', 'CANCELLED'],
  QUEUED: ['INPROG', 'CANCELLED'],
  INPROG: ['PENDING', 'RESOLVED', 'CANCELLED'],
  PENDING: ['INPROG', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'INPROG'],
  CLOSED: [], // Cannot transition from CLOSED
  CANCELLED: [], // Cannot transition from CANCELLED
};

/**
 * Validate status transition
 * @param from - Current status
 * @param to - New status
 * @returns True if transition is valid, false otherwise
 */
export function validateStatusTransition(from: string, to: string): boolean {
  // Allow setting the same status (no-op)
  if (from === to) {
    return true;
  }
  
  // Check if transition is allowed
  const allowedTransitions = STATUS_TRANSITIONS[from];
  if (!allowedTransitions) {
    return false;
  }
  
  return allowedTransitions.includes(to);
}

/**
 * Get allowed status transitions for a given status
 * @param status - Current status
 * @returns Array of allowed next statuses
 */
export function getAllowedStatusTransitions(status: string): string[] {
  return STATUS_TRANSITIONS[status] || [];
}

/**
 * Service request work log type schema
 */
export const srWorkLogTypeSchema = z.enum(['CLIENTNOTE', 'WORK', 'UPDATE', 'MODDATE']);

/**
 * Service request work log schema
 */
export const srWorkLogSchema = z.object({
  ticketid: z.string().min(1, 'Ticket ID is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  description: z.string().min(1, 'Description is required').max(100),
  logtype: srWorkLogTypeSchema.optional(),
  description_longdescription: z.string().optional(),
  createdate: isoDateSchema.optional(),
  createby: z.string().max(30).optional(),
  clientviewable: z.boolean().optional(),
  class: z.string().max(16).optional(),
});

/**
 * Service request assignment schema
 */
export const srAssignSchema = z.object({
  ticketid: z.string().min(1, 'Ticket ID is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  owner: z.string().min(1, 'Owner is required').max(30),
  ownergroup: z.string().max(8).optional(),
});

/**
 * Service request escalation schema
 */
export const srEscalateSchema = z.object({
  ticketid: z.string().min(1, 'Ticket ID is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  newPriority: prioritySchema,
  escalationReason: z.string().min(1, 'Escalation reason is required').max(255),
  newOwnerGroup: z.string().max(8).optional(),
});

/**
 * Service request solution schema
 */
export const srSolutionSchema = z.object({
  ticketid: z.string().min(1, 'Ticket ID is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  solution: z.string().min(1, 'Solution is required'),
  autoResolve: z.boolean().optional(),
});

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic validation)
 * @param phone - Phone number to validate
 * @returns True if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  // Basic validation: allow digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phone.length <= 20 && phoneRegex.test(phone);
}