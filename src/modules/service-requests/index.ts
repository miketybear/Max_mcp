/**
 * Service Request Module
 * Main entry point for service request management functionality
 */

// Export all types
export type {
  ServiceRequest,
  ServiceRequestCreate,
  ServiceRequestUpdate,
  ServiceRequestSearch,
  StatusChangeRequest,
  WorkOrderConversionRequest,
  ServiceRequestListResponse,
  ServiceRequestOperationResult,
  WorkOrderConversionResult,
  ServiceRequestStatus,
  SRWorkLogType,
  SRWorkLog,
  SRAssignRequest,
  SREscalateRequest,
  SRSolutionRequest,
  SRRelatedWorkOrdersResponse,
} from './types';

// Export operations class
export { ServiceRequestOperations } from './operations';

// Export tool creation function
export { createServiceRequestTools } from './tools';

// Export validators
export {
  serviceRequestCreateSchema,
  serviceRequestUpdateSchema,
  serviceRequestSearchSchema,
  statusChangeSchema,
  workOrderConversionSchema,
  serviceRequestStatusSchema,
  isoDateSchema,
  prioritySchema,
  ticketIdSchema,
  emailSchema,
  phoneSchema,
  srWorkLogTypeSchema,
  srWorkLogSchema,
  srAssignSchema,
  srEscalateSchema,
  srSolutionSchema,
  validateSRStatus,
  validateTicketId,
  validatePriority,
  validateDates,
  validateStatusTransition,
  getAllowedStatusTransitions,
  validateEmail,
  validatePhone,
} from './validators';