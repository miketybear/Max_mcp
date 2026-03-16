/**
 * Type definitions for Security Module
 * Defines interfaces for security groups, user assignments, and access control
 */

/**
 * Security group definition
 */
export interface SecurityGroup {
  /** Security group name */
  groupname: string;

  /** Group description */
  description?: string;

  /** Whether group is active */
  active?: boolean;

  /** Application authorizations */
  independent?: boolean;

  /** Site ID for site-level groups */
  siteid?: string;

  /** Organization ID */
  orgid?: string;

  /** Group type */
  grouptype?: string;

  /** Database role */
  dbRole?: string;

  /** Starting application */
  dfltapp?: string;

  /** Storeroom site */
  storeroom?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Security group creation DTO
 */
export interface SecurityGroupCreate {
  /** Group name (required) */
  groupname: string;

  /** Group description */
  description?: string;

  /** Whether group is active */
  active?: boolean;

  /** Whether access is independent */
  independent?: boolean;

  /** Site ID restriction */
  siteid?: string;

  /** Organization ID */
  orgid?: string;

  /** Default starting application */
  dfltapp?: string;
}

/**
 * Security group update DTO
 */
export interface SecurityGroupUpdate {
  /** Group description */
  description?: string;

  /** Whether group is active */
  active?: boolean;

  /** Whether access is independent */
  independent?: boolean;

  /** Default starting application */
  dfltapp?: string;
}

/**
 * Security group search criteria
 */
export interface SecurityGroupSearch {
  /** Filter by group name pattern */
  groupname?: string;

  /** Filter by active status */
  active?: boolean;

  /** Filter by site */
  siteid?: string;

  /** Filter by organization */
  orgid?: string;

  /** Page size */
  pageSize?: number;

  /** Page number */
  page?: number;

  /** Fields to select */
  select?: string[];

  /** Sort order */
  orderBy?: string;

  /** Custom OSLC where clause */
  where?: string;
}

/**
 * User-to-group assignment
 */
export interface UserGroupAssignment {
  /** Person ID */
  personid: string;

  /** Group name */
  groupname: string;

  /** Site ID */
  siteid?: string;
}

/**
 * Group user listing
 */
export interface GroupUser {
  /** Person ID */
  personid: string;

  /** Display name */
  displayname?: string;

  /** Status */
  status?: string;
}
