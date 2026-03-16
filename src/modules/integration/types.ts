/**
 * Type definitions for Integration/Dev Utilities Module
 * Defines interfaces for Maximo object structures, system properties, and measurement units
 */

/**
 * Maximo object definition
 */
export interface MaxObject {
  /** Object name */
  objectname: string;

  /** Description */
  description?: string;

  /** Class name */
  classname?: string;

  /** Entity name */
  entityname?: string;

  /** Whether persistent */
  persistent?: boolean;

  /** Service name */
  servicename?: string;

  /** Module */
  module?: string;

  /** Main table */
  maintbname?: string;

  /** Internal */
  internal?: boolean;

  /** Imported */
  imported?: boolean;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * System variable / property
 */
export interface MaxVar {
  /** Variable name */
  varname: string;

  /** Variable value */
  varvalue?: string;

  /** Description */
  description?: string;

  /** Variable type */
  vartype?: string;

  /** Max type */
  maxtype?: string;

  /** Default value */
  defaultvalue?: string;

  /** Site specific */
  sitespecific?: boolean;

  /** Organization specific */
  orgspecific?: boolean;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Measurement unit
 */
export interface MeasureUnit {
  /** Unit name */
  measureunitid: string;

  /** Description */
  description?: string;

  /** Abbreviation */
  abbreviation?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Object search criteria
 */
export interface MaxObjectSearch {
  /** Filter by object name */
  objectname?: string;

  /** Filter by module */
  module?: string;

  /** Filter by persistent flag */
  persistent?: boolean;

  /** Page size */
  pageSize?: number;

  /** Sort order */
  orderBy?: string;

  /** Custom OSLC where clause */
  where?: string;

  /** Fields to select */
  select?: string;
}

/**
 * System property search criteria
 */
export interface MaxVarSearch {
  /** Filter by variable name */
  varname?: string;

  /** Filter by variable type */
  vartype?: string;

  /** Page size */
  pageSize?: number;

  /** Sort order */
  orderBy?: string;

  /** Custom OSLC where clause */
  where?: string;

  /** Fields to select */
  select?: string;
}
