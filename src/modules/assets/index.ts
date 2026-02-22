/**
 * Asset Module
 * Main entry point for asset management functionality
 */

// Export all types
export type {
  Asset,
  AssetCreate,
  AssetUpdate,
  AssetSearch,
  AssetMove,
  MeterReading,
  AssetSpecification,
  AssetHierarchy,
  AssetListResponse,
  AssetOperationResult,
  MeterReadingResult,
  AssetSpecificationResult,
  AssetStatus,
  AssetType,
  MeterHistoryEntry,
  MeterHistoryResponse,
  AssetStatusChange,
  DowntimeEntry,
  DowntimeHistoryResponse,
} from './types';

// Export operations class
export { AssetOperations } from './operations';

// Export tool creation function
export { createAssetTools } from './tools';

// Export validators
export {
  assetCreateSchema,
  assetUpdateSchema,
  assetSearchSchema,
  assetMoveSchema,
  meterReadingSchema,
  assetSpecSchema,
  assetIdentifierSchema,
  assetStatusSchema,
  assetTypeSchema,
  meterHistorySchema,
  assetStatusChangeSchema,
  downtimeHistorySchema,
  validateAssetStatus,
  validateAssetNum,
  validatePriority,
  validateDates,
  validateISODate,
  validateAssetHierarchy,
  validateMeterReading,
  validateCost,
} from './validators';

// Export validator input types
export type {
  AssetCreateInput,
  AssetUpdateInput,
  AssetSearchInput,
  AssetMoveInput,
  MeterReadingInput,
  AssetSpecInput,
  AssetIdentifierInput,
  MeterHistoryInput,
  AssetStatusChangeInput,
  DowntimeHistoryInput,
} from './validators';