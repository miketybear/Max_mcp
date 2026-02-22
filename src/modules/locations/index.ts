/**
 * Location Module
 * Main entry point for location management functionality
 */

// Export all types
export type {
  Location,
  LocationCreate,
  LocationUpdate,
  LocationSearch,
  LocationHierarchy,
  LocationSearchResult,
  LocationDeleteResult,
  LocationStatus,
  LocationType,
} from './types';

// Export operations class
export { LocationOperations } from './operations';

// Export tool creation function
export { createLocationTools } from './tools';

// Export validators
export {
  locationCreateSchema,
  locationUpdateSchema,
  locationSearchSchema,
  locationGetSchema,
  locationDeleteSchema,
  locationHierarchySchema,
  validateLocationCode,
  validateLocationType,
  validateLocationStatus,
  validatePriority,
} from './validators';

// Export validated input types
export type {
  ValidatedLocationCreate,
  ValidatedLocationUpdate,
  ValidatedLocationSearch,
  ValidatedLocationGet,
  ValidatedLocationDelete,
  ValidatedLocationHierarchy,
} from './validators';