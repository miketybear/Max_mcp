/**
 * Work Order Module
 * Main entry point for work order management functionality
 */

// Export all types
export type {
  WorkOrder,
  WorkOrderCreate,
  WorkOrderUpdate,
  WorkOrderSearch,
  LaborTransaction,
  MaterialTransaction,
  ServiceEntry,
  WorkLog,
  WorkOrderAssignment,
  WorkOrderTask,
  StatusChangeRequest,
  WorkOrderListResponse,
  WorkOrderOperationResult,
  WorkOrderStatus,
  WorkOrderType,
  WorkLogType,
} from './types';

// Export operations class
export { WorkOrderOperations } from './operations';

// Export tool creation function
export { createWorkOrderTools } from './tools';

// Export validators
export {
  workOrderCreateSchema,
  workOrderUpdateSchema,
  workOrderSearchSchema,
  statusChangeSchema,
  laborTransactionSchema,
  materialTransactionSchema,
  serviceEntrySchema,
  workLogSchema,
  assignmentSchema,
  workOrderIdentifierSchema,
  taskSchema,
  workOrderStatusSchema,
  workOrderTypeSchema,
  workLogTypeSchema,
  validateWorkOrderStatus,
  validatePriority,
  validateDates,
  validateStatusTransition,
  validateISODate,
} from './validators';

// Export validator input types
export type {
  WorkOrderCreateInput,
  WorkOrderUpdateInput,
  WorkOrderSearchInput,
  StatusChangeInput,
  LaborTransactionInput,
  MaterialTransactionInput,
  ServiceEntryInput,
  WorkLogInput,
  AssignmentInput,
  WorkOrderIdentifierInput,
  TaskInput,
} from './validators';