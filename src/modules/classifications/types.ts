/**
 * Type definitions for Classification Module
 * Defines interfaces and types for classification management in Maximo
 */

/**
 * Classification interface
 */
export interface Classification {
  /** Classification structure ID */
  classstructureid: number;

  /** Classification code */
  classificationid: string;

  /** Classification description */
  description: string;

  /** Parent classification ID */
  parent?: number;

  /** Hierarchy level */
  hierarchylevel?: number;

  /** Site identifier */
  siteid?: string;

  /** Organization identifier */
  orgid?: string;

  /** Has children flag */
  haschildren?: boolean;
}

/**
 * Classification hierarchy
 */
export interface ClassificationHierarchy {
  /** Root classification */
  classification: Classification;

  /** Child classifications */
  children?: ClassificationHierarchy[];
}

/**
 * Classification specification attribute
 */
export interface ClassificationSpec {
  /** Attribute ID */
  attributeid: string;

  /** Attribute description */
  description: string;

  /** Data type */
  datatype: string;

  /** Required flag */
  required?: boolean;

  /** Default value */
  defaultvalue?: string;

  /** Allowed values */
  allowedvalues?: string[];
}

/**
 * Specification values update
 */
export interface SpecificationValuesUpdate {
  /** Object name (ASSET, WORKORDER, etc.) */
  objectname: string;

  /** Object ID */
  objectid: string;

  /** Specification attribute values */
  specifications: Record<string, any>;
}

/**
 * Classification operation result
 */
export interface ClassificationOperationResult {
  /** Success flag */
  success: boolean;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}
