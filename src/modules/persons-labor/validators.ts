/**
 * Validation schemas for Person and Labor Module
 * Uses Zod for runtime validation of person and labor data
 */

import { z } from 'zod';

/**
 * Person status enum schema
 */
export const personStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']);

/**
 * Labor transaction type enum schema
 */
export const laborTransactionTypeSchema = z.enum([
  'REGULAR',
  'OVERTIME',
  'DOUBLE',
  'VACATION',
  'SICK',
  'HOLIDAY',
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
 * Email schema
 */
export const emailSchema = z.string().email('Invalid email format').optional();

/**
 * Person creation schema
 */
export const personCreateSchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
  displayname: z.string().min(1, 'Display name is required').max(100),
  primaryemail: emailSchema,
  status: personStatusSchema.optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  laborcode: z.string().max(8).optional(),
  phonenum: z.string().max(20).optional(),
  mobilephone: z.string().max(20).optional(),
  department: z.string().max(30).optional(),
  jobtitle: z.string().max(50).optional(),
  manager: z.string().max(30).optional(),
  crewid: z.string().max(8).optional(),
  craft: z.string().max(8).optional(),
  skilllevel: z.string().max(8).optional(),
  comments: z.string().optional(),
});

/**
 * Person update schema
 */
export const personUpdateSchema = z.object({
  displayname: z.string().min(1).max(100).optional(),
  primaryemail: emailSchema,
  status: personStatusSchema.optional(),
  laborcode: z.string().max(8).optional(),
  phonenum: z.string().max(20).optional(),
  mobilephone: z.string().max(20).optional(),
  department: z.string().max(30).optional(),
  jobtitle: z.string().max(50).optional(),
  manager: z.string().max(30).optional(),
  crewid: z.string().max(8).optional(),
  craft: z.string().max(8).optional(),
  skilllevel: z.string().max(8).optional(),
  comments: z.string().optional(),
});

/**
 * Person search schema
 */
export const personSearchSchema = z.object({
  status: z.union([personStatusSchema, z.array(personStatusSchema)]).optional(),
  displayname: z.string().max(100).optional(),
  siteid: z.string().max(8).optional(),
  department: z.string().max(30).optional(),
  craft: z.string().max(8).optional(),
  crewid: z.string().max(8).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  pageNum: z.number().int().min(1).optional(),
});

/**
 * Person identifier schema
 */
export const personIdentifierSchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
});

/**
 * Labor transaction creation schema
 */
export const laborTransactionCreateSchema = z.object({
  laborcode: z.string().min(1, 'Labor code is required').max(8),
  refwo: z.string().max(10).optional(),
  transdate: isoDateSchema,
  regularhrs: z.number().min(0).optional(),
  overtimehrs: z.number().min(0).optional(),
  doublehrs: z.number().min(0).optional(),
  transtype: laborTransactionTypeSchema.optional(),
  startdate: isoDateSchema.optional(),
  finishdate: isoDateSchema.optional(),
  payrate: z.number().min(0).optional(),
  comments: z.string().optional(),
}).refine(
  (data) => {
    // Validate date ranges if both dates are provided
    if (data.startdate && data.finishdate) {
      const start = new Date(data.startdate);
      const finish = new Date(data.finishdate);
      return start <= finish;
    }
    return true;
  },
  {
    message: 'Finish date must be after start date',
    path: ['finishdate'],
  }
);

/**
 * Labor transaction search schema
 */
export const laborTransactionSearchSchema = z.object({
  laborcode: z.string().max(8).optional(),
  refwo: z.string().max(10).optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  transtype: laborTransactionTypeSchema.optional(),
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
 * Validate person status
 */
export function validatePersonStatus(status: string): boolean {
  return personStatusSchema.safeParse(status).success;
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
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
 * Validate hours (must be non-negative)
 */
export function validateHours(hours?: number): boolean {
  if (hours === undefined) {
    return true;
  }
  return hours >= 0;
}

/**
 * Skill level enum schema
 */
export const skillLevelSchema = z.enum(['APPRENTICE', 'SEMISKILLED', 'SKILLED', 'EXPERT']);

/**
 * Get crafts schema
 */
export const getCraftsSchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
  siteid: z.string().max(8).optional(),
});

/**
 * Add craft schema
 */
export const addCraftSchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
  craft: z.string().min(1, 'Craft is required').max(8),
  skilllevel: skillLevelSchema,
  rate: z.number().min(0).optional(),
});

/**
 * Get crews schema
 */
export const getCrewsSchema = z.object({
  siteid: z.string().max(8).optional(),
});

/**
 * Get crew members schema
 */
export const getCrewMembersSchema = z.object({
  laborcrewid: z.string().min(1, 'Labor crew ID is required').max(30),
  siteid: z.string().max(8).optional(),
});

/**
 * Labor availability schema
 */
export const laborAvailabilitySchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Labor cost summary schema
 */
export const laborCostSummarySchema = z.object({
  personid: z.string().min(1, 'Person ID is required').max(30),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
}).refine(
  (data) => {
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
 * Qualified labor search schema
 */
export const qualifiedLaborSchema = z.object({
  craft: z.string().min(1, 'Craft is required').max(8),
  skilllevel: skillLevelSchema.optional(),
  siteid: z.string().max(8).optional(),
});

/**
 * Input types for validators (inferred from schemas)
 */
export type PersonCreateInput = z.infer<typeof personCreateSchema>;
export type PersonUpdateInput = z.infer<typeof personUpdateSchema>;
export type PersonSearchInput = z.infer<typeof personSearchSchema>;
export type PersonIdentifierInput = z.infer<typeof personIdentifierSchema>;
export type LaborTransactionCreateInput = z.infer<typeof laborTransactionCreateSchema>;
export type LaborTransactionSearchInput = z.infer<typeof laborTransactionSearchSchema>;
export type GetCraftsInput = z.infer<typeof getCraftsSchema>;
export type AddCraftInput = z.infer<typeof addCraftSchema>;
export type GetCrewsInput = z.infer<typeof getCrewsSchema>;
export type GetCrewMembersInput = z.infer<typeof getCrewMembersSchema>;
export type LaborAvailabilityInput = z.infer<typeof laborAvailabilitySchema>;
export type LaborCostSummaryInput = z.infer<typeof laborCostSummarySchema>;
export type QualifiedLaborInput = z.infer<typeof qualifiedLaborSchema>;
