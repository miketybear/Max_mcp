/**
 * Preventive Maintenance Module
 * Main entry point for preventive maintenance management functionality
 */

// Export all types
export type {
  PreventiveMaintenance,
  PMCreate,
  PMUpdate,
  PMSearch,
  PMWorkOrderGeneration,
  JobPlan,
  JobPlanCreate,
  JobPlanTask,
  PMListResponse,
  PMOperationResult,
  PMWorkOrderGenerationResult,
  PMStatus,
  FrequencyUnit,
  JobPlanStatus,
  TimeFrequencyUnit,
  PMCompletion,
  PMHistoryParams,
  PMHistoryWorkOrder,
  PMHistoryResponse,
  PMScheduleParams,
  PMScheduleEntry,
  PMScheduleResponse,
  PMFrequencyUpdate,
  PMStatusChange,
} from './types';

// Export operations class
export { PMOperations } from './operations';

// Export tool creation function
export { createPMTools } from './tools';

// Export validators
export {
  pmCreateSchema,
  pmUpdateSchema,
  pmSearchSchema,
  pmIdentifierSchema,
  pmWorkOrderGenerationSchema,
  jobPlanCreateSchema,
  pmStatusSchema,
  frequencyUnitSchema,
  jobPlanStatusSchema,
  timeFrequencyUnitSchema,
  pmCompletionSchema,
  pmHistoryParamsSchema,
  pmScheduleParamsSchema,
  pmFrequencyUpdateSchema,
  pmStatusChangeSchema,
  validatePMStatus,
  validateFrequencyUnit,
  validateISODate,
  validateDates,
  validateFrequency,
} from './validators';

// Export validator input types
export type {
  PMCreateInput,
  PMUpdateInput,
  PMSearchInput,
  PMIdentifierInput,
  PMWorkOrderGenerationInput,
  JobPlanCreateInput,
  PMCompletionInput,
  PMHistoryParamsInput,
  PMScheduleParamsInput,
  PMFrequencyUpdateInput,
  PMStatusChangeInput,
} from './validators';
