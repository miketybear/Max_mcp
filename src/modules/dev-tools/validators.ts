/**
 * Validators for Development Tools Module
 * Validation schemas for development tools
 */

import { z } from 'zod';

/**
 * Schema for connection test
 */
export const connectionTestSchema = z.object({
  environment: z.string().max(50).optional(),
});

/**
 * Schema for API exploration
 */
export const apiExploreSchema = z.object({
  objectStructure: z.string().max(50).optional(),
});

/**
 * Schema for schema inspection
 */
export const schemaInspectSchema = z.object({
  objectStructure: z.string().min(1).max(50),
});

/**
 * Schema for metadata retrieval
 */
export const metadataSchema = z.object({
  objectStructure: z.string().min(1).max(50),
});

/**
 * Type exports
 */
export type ConnectionTestInput = z.infer<typeof connectionTestSchema>;
export type ApiExploreInput = z.infer<typeof apiExploreSchema>;
export type SchemaInspectInput = z.infer<typeof schemaInspectSchema>;
export type MetadataInput = z.infer<typeof metadataSchema>;
