/**
 * Type definitions for Bulk Operations Module
 * Defines interfaces and types for bulk operations in Maximo
 */

/**
 * Bulk create request
 */
export interface BulkCreateRequest {
  /** Object structure */
  objectStructure: string;

  /** Array of records to create */
  records: Array<Record<string, any>>;

  /** Continue processing on error */
  continueOnError?: boolean;
}

/**
 * Bulk update request
 */
export interface BulkUpdateRequest {
  /** Object structure */
  objectStructure: string;

  /** Array of record updates */
  updates: Array<{
    id: string;
    data: Record<string, any>;
  }>;

  /** Continue processing on error */
  continueOnError?: boolean;
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
  /** Object structure */
  objectStructure: string;

  /** Array of record IDs to delete */
  ids: string[];

  /** Continue processing on error */
  continueOnError?: boolean;
}

/**
 * Batch operation
 */
export interface BatchOperation {
  /** Operation type */
  type: 'create' | 'update' | 'delete';

  /** Object structure */
  objectStructure: string;

  /** Operation data */
  data: any;
}

/**
 * Batch process request
 */
export interface BatchProcessRequest {
  /** Array of operations */
  operations: BatchOperation[];

  /** Use transactions */
  transactional?: boolean;
}

/**
 * Operation result
 */
export interface OperationResult {
  /** Success flag */
  success: boolean;

  /** Record ID */
  id?: string;

  /** Error message */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  /** Total processed */
  total: number;

  /** Successful operations */
  successful: number;

  /** Failed operations */
  failed: number;

  /** Individual results */
  results: OperationResult[];

  /** Overall success flag */
  success: boolean;
}

/**
 * Batch process result
 */
export interface BatchProcessResult {
  /** Total operations */
  total: number;

  /** Successful operations */
  successful: number;

  /** Failed operations */
  failed: number;

  /** Operation results */
  results: Array<{
    operation: BatchOperation;
    result: OperationResult;
  }>;

  /** Overall success flag */
  success: boolean;

  /** Transaction rolled back */
  rolledBack?: boolean;
}
