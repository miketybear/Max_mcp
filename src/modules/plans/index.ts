/**
 * Job Plans (PLANS) Module
 * Main entry point for job plan management functionality
 *
 * Job Plans (MXJP) are reusable templates that define the tasks, labor,
 * materials, and services needed to complete work orders. They are critical
 * for preventive maintenance workflows.
 */

// Export all types
export type {
  JobPlan,
  JobPlanTask,
  JobPlanLabor,
  JobPlanMaterial,
  JobPlanService,
  JobPlanCreate,
  JobPlanUpdate,
  JobPlanSearch,
  JobPlanListResponse,
  JobPlanStatus,
} from './types';

// Export operations class
export { JobPlanOperations } from './operations';

// Export tool creation function
export { createJobPlanTools } from './tools';

// Export validators
export {
  jobPlanCreateSchema,
  jobPlanUpdateSchema,
  jobPlanSearchSchema,
  jobPlanIdentifierSchema,
  jobPlanTaskSchema,
  jobPlanLaborSchema,
  jobPlanMaterialSchema,
  jobPlanServiceSchema,
  jobPlanStatusSchema,
  prioritySchema,
  isoDateSchema,
} from './validators';

// Export validator input types
export type {
  JobPlanCreateInput,
  JobPlanUpdateInput,
  JobPlanSearchInput,
  JobPlanIdentifierInput,
  JobPlanTaskInput,
  JobPlanLaborInput,
  JobPlanMaterialInput,
  JobPlanServiceInput,
} from './validators';
