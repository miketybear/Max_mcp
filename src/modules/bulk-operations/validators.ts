/**
 * Validators for Bulk Operations Module
 * Validation schemas for bulk operations
 */

import { z } from 'zod';

/**
 * Schema for bulk create
 */
export const bulkCreateSchema = z.object({
  objectStructure: z.string().min(1).max(50),
  records: z.array(z.record(z.any())).min(1).max(100),
  continueOnError: z.boolean().optional(),
});

/**
 * Schema for bulk update
 */
export const bulkUpdateSchema = z.object({
  objectStructure: z.string().min(1).max(50),
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        data: z.record(z.any()),
      })
    )
    .min(1)
    .max(100),
  continueOnError: z.boolean().optional(),
});

/**
 * Schema for bulk delete
 */
export const bulkDeleteSchema = z.object({
  objectStructure: z.string().min(1).max(50),
  ids: z.array(z.string().min(1)).min(1).max(100),
  continueOnError: z.boolean().optional(),
});

/**
 * Schema for batch operation
 */
export const batchOperationSchema = z.object({
  type: z.enum(['create', 'update', 'delete']),
  objectStructure: z.string().min(1).max(50),
  data: z.any(),
});

/**
 * Schema for batch process
 */
export const batchProcessSchema = z.object({
  operations: z.array(batchOperationSchema).min(1).max(50),
  transactional: z.boolean().optional(),
});

/**
 * Type exports
 */
export type BulkCreateInput = z.infer<typeof bulkCreateSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BatchProcessInput = z.infer<typeof batchProcessSchema>;
