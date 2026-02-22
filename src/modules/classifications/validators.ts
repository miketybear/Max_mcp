/**
 * Validators for Classification Module
 * Validation schemas for classification operations
 */

import { z } from 'zod';

/**
 * Schema for classification identifier
 */
export const classificationIdentifierSchema = z.object({
  classstructureid: z.string().min(1).max(20),
});

/**
 * Schema for classification hierarchy request
 */
export const classificationHierarchySchema = z.object({
  classstructureid: z.string().min(1).max(20),
  levels: z.number().int().positive().max(10).optional(),
});

/**
 * Schema for updating specification values
 */
export const specificationValuesSchema = z.object({
  objectname: z.string().min(1).max(30),
  objectid: z.string().min(1).max(256),
  specifications: z.record(z.any()),
});

/**
 * Type exports
 */
export type ClassificationIdentifierInput = z.infer<typeof classificationIdentifierSchema>;
export type ClassificationHierarchyInput = z.infer<typeof classificationHierarchySchema>;
export type SpecificationValuesInput = z.infer<typeof specificationValuesSchema>;
