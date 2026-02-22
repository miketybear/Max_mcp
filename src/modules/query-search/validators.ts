/**
 * Validators for Query and Search Module
 * Validation schemas for query operations
 */

import { z } from 'zod';

/**
 * Schema for OSLC query
 */
export const oslcQuerySchema = z.object({
  objectStructure: z.string().min(1).max(50),
  select: z.string().optional(),
  where: z.string().optional(),
  orderBy: z.string().optional(),
  pageSize: z.number().int().positive().max(1000).optional(),
  pageNum: z.number().int().positive().optional(),
  searchTerms: z.string().optional(),
});

/**
 * Schema for search filter
 */
export const searchFilterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['=', '!=', '<', '>', '<=', '>=', 'in', 'like']),
  value: z.any(),
});

/**
 * Schema for advanced search
 */
export const advancedSearchSchema = z.object({
  objectStructure: z.string().min(1).max(50),
  filters: z.array(searchFilterSchema).min(1),
  operator: z.enum(['AND', 'OR']).optional(),
  select: z.string().optional(),
  pageSize: z.number().int().positive().max(1000).optional(),
  pageNum: z.number().int().positive().optional(),
});

/**
 * Schema for saved query
 */
export const savedQuerySchema = z.object({
  queryname: z.string().min(1).max(50),
  parameters: z.record(z.any()).optional(),
  pageSize: z.number().int().positive().max(1000).optional(),
  pageNum: z.number().int().positive().optional(),
});

/**
 * Schema for query builder
 */
export const queryBuilderSchema = z.object({
  objectStructure: z.string().min(1).max(50),
  interactive: z.boolean().optional(),
  conditions: z.array(searchFilterSchema).optional(),
});

/**
 * Type exports
 */
export type OSLCQueryInput = z.infer<typeof oslcQuerySchema>;
export type AdvancedSearchInput = z.infer<typeof advancedSearchSchema>;
export type SavedQueryInput = z.infer<typeof savedQuerySchema>;
export type QueryBuilderInput = z.infer<typeof queryBuilderSchema>;
