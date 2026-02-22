/**
 * Type definitions for Query and Search Module
 * Defines interfaces and types for OSLC queries and search operations
 */

/**
 * OSLC query parameters
 */
export interface OSLCQuery {
  /** Object structure to query */
  objectStructure: string;

  /** Fields to select (comma-separated) */
  select?: string;

  /** WHERE clause filter */
  where?: string;

  /** ORDER BY clause */
  orderBy?: string;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;

  /** Search terms */
  searchTerms?: string;
}

/**
 * Query result with pagination
 */
export interface QueryResult<T = any> {
  /** Result data */
  member: T[];

  /** Response info */
  responseInfo?: {
    totalCount?: number;
    pagenum?: number;
    nextPage?: string;
    previousPage?: string;
  };

  /** Total count */
  totalCount?: number;

  /** Current page */
  page?: number;

  /** Page size */
  pageSize?: number;

  /** Total pages */
  totalPages?: number;

  /** Has next page */
  hasNext?: boolean;

  /** Has previous page */
  hasPrevious?: boolean;
}

/**
 * Search filter condition
 */
export interface SearchFilter {
  /** Field name */
  field: string;

  /** Operator (=, !=, <, >, <=, >=, in, like) */
  operator: string;

  /** Value */
  value: any;
}

/**
 * Advanced search request
 */
export interface AdvancedSearch {
  /** Object structure */
  objectStructure: string;

  /** Array of filter conditions */
  filters: SearchFilter[];

  /** Logical operator (AND/OR) */
  operator?: 'AND' | 'OR';

  /** Fields to select */
  select?: string;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * Saved query parameters
 */
export interface SavedQueryRequest {
  /** Saved query name */
  queryname: string;

  /** Query parameters */
  parameters?: Record<string, any>;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * Query builder request
 */
export interface QueryBuilderRequest {
  /** Object structure */
  objectStructure: string;

  /** Interactive mode flag */
  interactive?: boolean;

  /** Predefined conditions */
  conditions?: SearchFilter[];
}

/**
 * Query builder response
 */
export interface QueryBuilderResponse {
  /** Generated OSLC query string */
  oslcQuery: string;

  /** Formatted WHERE clause */
  whereClause?: string;

  /** SELECT clause */
  selectClause?: string;

  /** ORDER BY clause */
  orderByClause?: string;

  /** Validation status */
  isValid: boolean;

  /** Validation errors */
  errors?: string[];
}
