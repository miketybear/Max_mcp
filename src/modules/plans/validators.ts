/**
 * Validation schemas for Job Plans (PLANS) Module
 * Uses Zod for runtime validation of job plan data
 */

import { z } from 'zod';

/**
 * Job plan status enum schema
 */
export const jobPlanStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'REVISED',
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
 * Job plan creation schema
 */
export const jobPlanCreateSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  description: z.string().min(1, 'Description is required').max(100),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  status: jobPlanStatusSchema.optional(),
  priority: prioritySchema.optional(),
  duration: z.number().min(0).optional(),
  interruptible: z.boolean().optional(),
  downtime: z.boolean().optional(),
  description_longdescription: z.string().optional(),
  worktype: z.string().max(5).optional(),
  craft: z.string().max(8).optional(),
  templatetype: z.string().max(10).optional(),
  safetyplanid: z.string().max(8).optional(),
  failurecode: z.string().max(8).optional(),
  glaccount: z.string().max(23).optional(),
  flowcontrolled: z.boolean().optional(),
});

/**
 * Job plan update schema
 */
export const jobPlanUpdateSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  status: jobPlanStatusSchema.optional(),
  priority: prioritySchema.optional(),
  duration: z.number().min(0).optional(),
  interruptible: z.boolean().optional(),
  downtime: z.boolean().optional(),
  description_longdescription: z.string().optional(),
  worktype: z.string().max(5).optional(),
  craft: z.string().max(8).optional(),
  templatetype: z.string().max(10).optional(),
  safetyplanid: z.string().max(8).optional(),
  failurecode: z.string().max(8).optional(),
  glaccount: z.string().max(23).optional(),
  flowcontrolled: z.boolean().optional(),
});

/**
 * Job plan search schema
 */
export const jobPlanSearchSchema = z.object({
  jpnum: z.string().max(10).optional(),
  status: z.union([
    jobPlanStatusSchema,
    z.array(jobPlanStatusSchema),
  ]).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  priority: prioritySchema.optional(),
  worktype: z.string().max(5).optional(),
  craft: z.string().max(8).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  page: z.number().int().min(1).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  searchTerms: z.string().optional(),
});

/**
 * Job plan identifier schema (for get/delete operations)
 */
export const jobPlanIdentifierSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  siteid: z.string().max(8).optional(),
});

/**
 * Job plan task creation schema
 */
export const jobPlanTaskSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  siteid: z.string().max(8).optional(),
  jptask: z.number().int().min(1, 'Task number must be a positive integer'),
  description: z.string().min(1, 'Task description is required').max(100),
  metername: z.string().max(10).optional(),
  interruptible: z.boolean().optional(),
  duration: z.number().min(0).optional(),
  sequence: z.number().int().min(1).optional(),
  ownergroup: z.string().max(8).optional(),
  craft: z.string().max(8).optional(),
  description_longdescription: z.string().optional(),
});

/**
 * Job plan labor requirement schema
 */
export const jobPlanLaborSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  siteid: z.string().max(8).optional(),
  craft: z.string().min(1, 'Craft code is required').max(8),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  hours: z.number().min(0.01, 'Hours must be greater than 0'),
  rate: z.number().min(0).optional(),
  skilllevel: z.string().max(15).optional(),
  vendor: z.string().max(12).optional(),
  contractnum: z.string().max(8).optional(),
});

/**
 * Job plan material requirement schema
 */
export const jobPlanMaterialSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  siteid: z.string().max(8).optional(),
  itemnum: z.string().min(1, 'Item number is required').max(30),
  itemqty: z.number().min(0.01, 'Quantity must be greater than 0'),
  description: z.string().max(100).optional(),
  conditioncode: z.string().max(8).optional(),
  storeroom: z.string().max(12).optional(),
  unitcost: z.number().min(0).optional(),
  directreq: z.boolean().optional(),
  linetype: z.string().max(15).optional(),
});

/**
 * Job plan service requirement schema
 */
export const jobPlanServiceSchema = z.object({
  jpnum: z.string().min(1, 'Job plan number is required').max(10),
  siteid: z.string().max(8).optional(),
  description: z.string().min(1, 'Service description is required').max(100),
  vendor: z.string().max(12).optional(),
  linecost: z.number().min(0).optional(),
  contractnum: z.string().max(8).optional(),
  linetype: z.string().max(15).optional(),
});

/**
 * Type exports for Zod inferred types
 */
export type JobPlanCreateInput = z.infer<typeof jobPlanCreateSchema>;
export type JobPlanUpdateInput = z.infer<typeof jobPlanUpdateSchema>;
export type JobPlanSearchInput = z.infer<typeof jobPlanSearchSchema>;
export type JobPlanIdentifierInput = z.infer<typeof jobPlanIdentifierSchema>;
export type JobPlanTaskInput = z.infer<typeof jobPlanTaskSchema>;
export type JobPlanLaborInput = z.infer<typeof jobPlanLaborSchema>;
export type JobPlanMaterialInput = z.infer<typeof jobPlanMaterialSchema>;
export type JobPlanServiceInput = z.infer<typeof jobPlanServiceSchema>;
