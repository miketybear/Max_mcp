/**
 * Person and Labor Module
 * Main entry point for person and labor management functionality
 */

// Export all types
export type {
  Person,
  PersonCreate,
  PersonUpdate,
  PersonSearch,
  LaborTransaction,
  LaborTransactionCreate,
  LaborTransactionSearch,
  PersonListResponse,
  LaborTransactionListResponse,
  PersonOperationResult,
  LaborTransactionOperationResult,
  PersonStatus,
  LaborTransactionType,
  SkillLevel,
  PersonCraftRate,
  AddCraftParams,
  LaborCrew,
  LaborCrewListResponse,
  LaborCrewMember,
  LaborCrewTool,
  LaborCrewMembersResponse,
  LaborAvailability,
  LaborCostSummary,
} from './types';

// Export operations class
export { PersonLaborOperations } from './operations';

// Export tool creation function
export { createPersonLaborTools } from './tools';

// Export validators
export {
  personCreateSchema,
  personUpdateSchema,
  personSearchSchema,
  personIdentifierSchema,
  laborTransactionCreateSchema,
  laborTransactionSearchSchema,
  personStatusSchema,
  laborTransactionTypeSchema,
  skillLevelSchema,
  getCraftsSchema,
  addCraftSchema,
  getCrewsSchema,
  getCrewMembersSchema,
  laborAvailabilitySchema,
  laborCostSummarySchema,
  qualifiedLaborSchema,
  validatePersonStatus,
  validateEmail,
  validateISODate,
  validateDates,
  validateHours,
} from './validators';

// Export validator input types
export type {
  PersonCreateInput,
  PersonUpdateInput,
  PersonSearchInput,
  PersonIdentifierInput,
  LaborTransactionCreateInput,
  LaborTransactionSearchInput,
  GetCraftsInput,
  AddCraftInput,
  GetCrewsInput,
  GetCrewMembersInput,
  LaborAvailabilityInput,
  LaborCostSummaryInput,
  QualifiedLaborInput,
} from './validators';
