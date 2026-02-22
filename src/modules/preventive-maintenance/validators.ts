/**
 * Validation schemas for Preventive Maintenance Module
 * Uses Zod for runtime validation of PM data
 */

import { z } from 'zod';

/**
 * PM status enum schema
 */
export const pmStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPEND']);

/**
 * Frequency unit enum schema
 */
export const frequencyUnitSchema = z.enum([
  'DAYS',
  'WEEKS',
  'MONTHS',
  'YEARS',
  'HOURS',
  'METERS',
  'MILES',
  'KILOMETERS',
]);

/**
 * Job plan status enum schema
 */
export const jobPlanStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']);

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
 * Job plan task creation schema
 */
export const jobPlanTaskCreateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  tasktype: z.string().max(20).optional(),
  estdur: z.number().min(0).optional(),
  seqnum: z.number().int().min(1).optional(),
});

/**
 * Job plan creation schema
 */
export const jobPlanCreateSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  description: z.string().min(1, 'Description is required').max(100),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  orgid: z.string().max(8).optional(),
  estdur: z.number().min(0).optional(),
  worktype: z.string().max(4).optional(),
  priority: prioritySchema.optional(),
  leadcraft: z.string().max(8).optional(),
  comments: z.string().optional(),
  jptask: z.array(jobPlanTaskCreateSchema).optional(),
});

/**
 * PM creation schema
 */
export const pmCreateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  frequency: z.number().positive('Frequency must be positive'),
  frequnit: frequencyUnitSchema,
  orgid: z.string().max(8).optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  nextdate: isoDateSchema.optional(),
  jpnum: z.string().max(10).optional(),
  worktype: z.string().max(4).optional(),
  priority: prioritySchema.optional(),
  estdur: z.number().min(0).optional(),
  leadcraft: z.string().max(8).optional(),
  route: z.string().max(8).optional(),
  meterbased: z.boolean().optional(),
  metername: z.string().max(8).optional(),
  meterreading: z.number().min(0).optional(),
  calendar: z.string().max(8).optional(),
  comments: z.string().optional(),
});

/**
 * PM update schema
 */
export const pmUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  frequency: z.number().positive().optional(),
  frequnit: frequencyUnitSchema.optional(),
  nextdate: isoDateSchema.optional(),
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  jpnum: z.string().max(10).optional(),
  worktype: z.string().max(4).optional(),
  priority: prioritySchema.optional(),
  estdur: z.number().min(0).optional(),
  leadcraft: z.string().max(8).optional(),
  route: z.string().max(8).optional(),
  meterbased: z.boolean().optional(),
  metername: z.string().max(8).optional(),
  meterreading: z.number().min(0).optional(),
  calendar: z.string().max(8).optional(),
  comments: z.string().optional(),
  status: pmStatusSchema.optional(),
});

/**
 * PM search schema
 */
export const pmSearchSchema = z.object({
  assetnum: z.string().max(12).optional(),
  location: z.string().max(12).optional(),
  status: z.union([pmStatusSchema, z.array(pmStatusSchema)]).optional(),
  siteid: z.string().max(8).optional(),
  jpnum: z.string().max(10).optional(),
  worktype: z.string().max(4).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  pageNum: z.number().int().min(1).optional(),
});

/**
 * PM identifier schema
 */
export const pmIdentifierSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().max(8).optional(),
});

/**
 * PM work order generation schema
 */
export const pmWorkOrderGenerationSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  targetdate: isoDateSchema.optional(),
  siteid: z.string().max(8).optional(),
});

/**
 * Time-based frequency unit schema (for schedule calculation)
 */
export const timeFrequencyUnitSchema = z.enum(['DAYS', 'WEEKS', 'MONTHS', 'YEARS']);

/**
 * PM completion schema
 */
export const pmCompletionSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  completionDate: isoDateSchema.optional(),
  memo: z.string().max(500).optional(),
});

/**
 * PM history params schema
 */
export const pmHistoryParamsSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  pageSize: z.number().int().min(1).max(1000).optional(),
});

/**
 * PM schedule params schema
 */
export const pmScheduleParamsSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  count: z.number().int().min(1).max(52).optional(),
});

/**
 * PM frequency update schema
 */
export const pmFrequencyUpdateSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
  frequency: z.number().positive('Frequency must be positive'),
  frequnit: timeFrequencyUnitSchema,
});

/**
 * PM status change schema (activate/deactivate)
 */
export const pmStatusChangeSchema = z.object({
  pmnum: z.string().min(1, 'PM number is required').max(10),
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Validate PM status
 */
export function validatePMStatus(status: string): boolean {
  return pmStatusSchema.safeParse(status).success;
}

/**
 * Validate frequency unit
 */
export function validateFrequencyUnit(unit: string): boolean {
  return frequencyUnitSchema.safeParse(unit).success;
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
 * Validate frequency (must be positive)
 */
export function validateFrequency(frequency: number): boolean {
  return frequency > 0;
}

/**
 * Input types for validators (inferred from schemas)
 */
export type PMCreateInput = z.infer<typeof pmCreateSchema>;
export type PMUpdateInput = z.infer<typeof pmUpdateSchema>;
export type PMSearchInput = z.infer<typeof pmSearchSchema>;
export type PMIdentifierInput = z.infer<typeof pmIdentifierSchema>;
export type PMWorkOrderGenerationInput = z.infer<typeof pmWorkOrderGenerationSchema>;
export type JobPlanCreateInput = z.infer<typeof jobPlanCreateSchema>;
export type PMCompletionInput = z.infer<typeof pmCompletionSchema>;
export type PMHistoryParamsInput = z.infer<typeof pmHistoryParamsSchema>;
export type PMScheduleParamsInput = z.infer<typeof pmScheduleParamsSchema>;
export type PMFrequencyUpdateInput = z.infer<typeof pmFrequencyUpdateSchema>;
export type PMStatusChangeInput = z.infer<typeof pmStatusChangeSchema>;
