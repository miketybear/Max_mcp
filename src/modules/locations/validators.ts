/**
 * Location Module Validators
 * 
 * Zod validation schemas for location operations.
 * Ensures data integrity and provides clear validation error messages.
 */

import { z } from 'zod';
import type { LocationStatus, LocationType } from './types';

/**
 * Valid location status values
 */
const VALID_STATUSES: LocationStatus[] = ['OPERATING', 'NOT READY', 'DECOMMISSIONED'];

/**
 * Valid location type values
 */
const VALID_TYPES: LocationType[] = [
  'OPERATING',
  'STOREROOM',
  'VENDOR',
  'COURIER',
  'LABOR',
  'HOLDING',
  'REPAIR',
  'FLEET',
  'WAREHOUSE'
];

/**
 * Location code validation regex
 * Allows alphanumeric characters, hyphens, and underscores
 * Length: 1-30 characters
 */
const LOCATION_CODE_REGEX = /^[A-Z0-9_-]{1,30}$/i;

/**
 * Validate location code format
 * 
 * @param location - Location code to validate
 * @returns True if valid, false otherwise
 */
export function validateLocationCode(location: string): boolean {
  return LOCATION_CODE_REGEX.test(location);
}

/**
 * Validate location type
 * 
 * @param type - Location type to validate
 * @returns True if valid, false otherwise
 */
export function validateLocationType(type: string): boolean {
  return VALID_TYPES.includes(type as LocationType);
}

/**
 * Validate location status
 * 
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function validateLocationStatus(status: string): boolean {
  return VALID_STATUSES.includes(status as LocationStatus);
}

/**
 * Validate priority value
 * Priority must be between 1 (highest) and 5 (lowest)
 * 
 * @param priority - Priority value to validate
 * @returns True if valid, false otherwise
 */
export function validatePriority(priority: number): boolean {
  return Number.isInteger(priority) && priority >= 1 && priority <= 5;
}

/**
 * Base location code schema
 */
const locationCodeSchema = z.string()
  .min(1, 'Location code is required')
  .max(30, 'Location code must not exceed 30 characters')
  .regex(LOCATION_CODE_REGEX, 'Location code must contain only alphanumeric characters, hyphens, and underscores')
  .transform((val: string) => val.toUpperCase());

/**
 * Site ID schema
 */
const siteIdSchema = z.string()
  .min(1, 'Site ID is required')
  .max(8, 'Site ID must not exceed 8 characters');

/**
 * Organization ID schema
 */
const orgIdSchema = z.string()
  .min(1, 'Organization ID is required')
  .max(8, 'Organization ID must not exceed 8 characters');

/**
 * Location status schema
 */
const statusSchema = z.enum(VALID_STATUSES as [LocationStatus, ...LocationStatus[]], {
  errorMap: () => ({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
});

/**
 * Location type schema
 */
const typeSchema = z.enum(VALID_TYPES as [LocationType, ...LocationType[]], {
  errorMap: () => ({ message: `Type must be one of: ${VALID_TYPES.join(', ')}` })
});

/**
 * Priority schema (1-5)
 */
const prioritySchema = z.number()
  .int('Priority must be an integer')
  .min(1, 'Priority must be at least 1')
  .max(5, 'Priority must not exceed 5');

/**
 * Description schema
 */
const descriptionSchema = z.string()
  .min(1, 'Description is required')
  .max(100, 'Description must not exceed 100 characters');

/**
 * GL account schema
 */
const glAccountSchema = z.string()
  .max(23, 'GL account must not exceed 23 characters')
  .optional();

/**
 * Coordinate schema (latitude/longitude)
 */
const coordinateSchema = z.number()
  .min(-180, 'Coordinate must be between -180 and 180')
  .max(180, 'Coordinate must be between -180 and 180');

/**
 * Validation schema for creating a new location
 */
export const locationCreateSchema = z.object({
  location: locationCodeSchema,
  description: descriptionSchema,
  siteid: siteIdSchema,
  type: typeSchema,
  orgid: orgIdSchema.optional(),
  status: statusSchema.optional(),
  parent: locationCodeSchema.optional(),
  priority: prioritySchema.optional(),
  glaccount: glAccountSchema,
  failurecode: z.string().max(8, 'Failure code must not exceed 8 characters').optional(),
  replacecost: z.number().nonnegative('Replacement cost must be non-negative').optional(),
  systemid: z.string().max(20, 'System ID must not exceed 20 characters').optional(),
  locoper: locationCodeSchema.optional(),
  classstructureid: z.string().max(20, 'Classification ID must not exceed 20 characters').optional(),
  latitude: coordinateSchema.optional(),
  longitude: coordinateSchema.optional(),
  addressline1: z.string().max(50, 'Address line 1 must not exceed 50 characters').optional(),
  addressline2: z.string().max(50, 'Address line 2 must not exceed 50 characters').optional(),
  city: z.string().max(50, 'City must not exceed 50 characters').optional(),
  stateprovince: z.string().max(20, 'State/province must not exceed 20 characters').optional(),
  postalcode: z.string().max(12, 'Postal code must not exceed 12 characters').optional(),
  country: z.string().max(50, 'Country must not exceed 50 characters').optional()
}).strict();

/**
 * Validation schema for updating a location
 */
export const locationUpdateSchema = z.object({
  description: descriptionSchema.optional(),
  status: statusSchema.optional(),
  type: typeSchema.optional(),
  parent: locationCodeSchema.optional(),
  priority: prioritySchema.optional(),
  glaccount: glAccountSchema,
  failurecode: z.string().max(8, 'Failure code must not exceed 8 characters').optional(),
  replacecost: z.number().nonnegative('Replacement cost must be non-negative').optional(),
  systemid: z.string().max(20, 'System ID must not exceed 20 characters').optional(),
  locoper: locationCodeSchema.optional(),
  disabled: z.boolean().optional(),
  classstructureid: z.string().max(20, 'Classification ID must not exceed 20 characters').optional(),
  latitude: coordinateSchema.optional(),
  longitude: coordinateSchema.optional(),
  addressline1: z.string().max(50, 'Address line 1 must not exceed 50 characters').optional(),
  addressline2: z.string().max(50, 'Address line 2 must not exceed 50 characters').optional(),
  city: z.string().max(50, 'City must not exceed 50 characters').optional(),
  stateprovince: z.string().max(20, 'State/province must not exceed 20 characters').optional(),
  postalcode: z.string().max(12, 'Postal code must not exceed 12 characters').optional(),
  country: z.string().max(50, 'Country must not exceed 50 characters').optional()
}).strict()
  .refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  });

/**
 * Validation schema for location search criteria
 */
export const locationSearchSchema = z.object({
  status: statusSchema.optional(),
  type: typeSchema.optional(),
  parent: locationCodeSchema.optional(),
  systemid: z.string().max(20, 'System ID must not exceed 20 characters').optional(),
  siteid: siteIdSchema.optional(),
  description: z.string().max(100, 'Description must not exceed 100 characters').optional(),
  disabled: z.boolean().optional(),
  classstructureid: z.string().max(20, 'Classification ID must not exceed 20 characters').optional(),
  pageSize: z.number()
    .int('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(1000, 'Page size must not exceed 1000')
    .optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional()
}).strict();

/**
 * Validation schema for getting a location by code
 */
export const locationGetSchema = z.object({
  location: locationCodeSchema,
  siteid: siteIdSchema
}).strict();

/**
 * Validation schema for deleting a location
 */
export const locationDeleteSchema = z.object({
  location: locationCodeSchema,
  siteid: siteIdSchema
}).strict();

/**
 * Validation schema for getting location hierarchy
 */
export const locationHierarchySchema = z.object({
  location: locationCodeSchema,
  siteid: siteIdSchema
}).strict();

/**
 * Type exports for validated data
 */
export type ValidatedLocationCreate = z.infer<typeof locationCreateSchema>;
export type ValidatedLocationUpdate = z.infer<typeof locationUpdateSchema>;
export type ValidatedLocationSearch = z.infer<typeof locationSearchSchema>;
export type ValidatedLocationGet = z.infer<typeof locationGetSchema>;
export type ValidatedLocationDelete = z.infer<typeof locationDeleteSchema>;
export type ValidatedLocationHierarchy = z.infer<typeof locationHierarchySchema>;