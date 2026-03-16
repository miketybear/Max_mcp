/**
 * Type definitions for Setup Module
 * Defines interfaces for domains, document types, and measurement units
 */

/**
 * Domain definition (base type)
 */
export interface Domain {
  /** Domain name */
  domainid: string;

  /** Description */
  description?: string;

  /** Domain type (ALN, TABLE, SYNONYM, NUMERIC, CROSSOVER) */
  domaintype?: string;

  /** Maximum type */
  maxtype?: string;

  /** Length */
  length?: number;

  /** Internal */
  internal?: boolean;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Alphanumeric domain value
 */
export interface AlnDomainValue {
  /** Domain name */
  domainid: string;

  /** Value */
  value: string;

  /** Description */
  description?: string;

  /** Site ID */
  siteid?: string;

  /** Organization ID */
  orgid?: string;

  /** Order number */
  ordernum?: number;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Table domain value
 */
export interface TableDomainValue {
  /** Domain name */
  domainid: string;

  /** Object name */
  objectname?: string;

  /** Validation where clause */
  validationwhereclause?: string;

  /** List where clause */
  listwhereclause?: string;

  /** Site ID */
  siteid?: string;

  /** Organization ID */
  orgid?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Synonym domain value
 */
export interface SynonymDomainValue {
  /** Domain name */
  domainid: string;

  /** Max value */
  maxvalue: string;

  /** Value */
  value: string;

  /** Description */
  description?: string;

  /** Is default */
  defaults?: boolean;

  /** Site ID */
  siteid?: string;

  /** Organization ID */
  orgid?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Document type
 */
export interface DocType {
  /** Document type */
  doctype: string;

  /** Description */
  description?: string;

  /** Application */
  app?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Domain creation DTO
 */
export interface DomainCreate {
  /** Domain name */
  domainid: string;

  /** Description */
  description?: string;

  /** Domain type */
  domaintype?: string;

  /** Maximum type */
  maxtype?: string;

  /** Length */
  length?: number;
}

/**
 * Domain search criteria
 */
export interface DomainSearch {
  /** Filter by domain name pattern */
  domainid?: string;

  /** Filter by domain type */
  domaintype?: string;

  /** Page size */
  pageSize?: number;

  /** Sort order */
  orderBy?: string;

  /** Custom OSLC where clause */
  where?: string;

  /** Fields to select */
  select?: string;
}
