/**
 * Type definitions for Service Request Module
 * Defines interfaces and types for service request management in Maximo
 */

/**
 * Service request status values
 */
export type ServiceRequestStatus = 
  | 'NEW' 
  | 'QUEUED' 
  | 'INPROG' 
  | 'PENDING' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'CANCELLED';

/**
 * Complete service request interface with all Maximo fields
 */
export interface ServiceRequest {
  /** Service request ticket ID (unique identifier) */
  ticketid: string;
  
  /** Service request description */
  description: string;
  
  /** Current status */
  status: ServiceRequestStatus;
  
  /** Status change date (ISO 8601 format) */
  statusdate: string;
  
  /** Person who reported the service request */
  reportedby: string;
  
  /** Report date (ISO 8601 format) */
  reportdate: string;
  
  /** Affected person */
  affectedperson?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Organization identifier */
  orgid: string;
  
  /** Classification structure ID */
  classstructureid?: string;
  
  /** Service request owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Target start date (ISO 8601 format) */
  targetstart?: string;
  
  /** Target finish date (ISO 8601 format) */
  targetfinish?: string;
  
  /** Actual start date (ISO 8601 format) */
  actstart?: string;
  
  /** Actual finish date (ISO 8601 format) */
  actfinish?: string;
  
  /** Reported priority (1-5, where 1 is highest) */
  reportedpriority?: number;
  
  /** Related work order number */
  relatedwonum?: string;
  
  /** External system identifier */
  externalsystem?: string;
  
  /** External reference ID */
  externalrefid?: string;
  
  /** Commodity code */
  commodity?: string;
  
  /** Commodity group */
  commoditygroup?: string;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Changed by person */
  changeby?: string;
  
  /** Service request class */
  class?: string;
  
  /** Service request type */
  tickettype?: string;
  
  /** Contact information */
  contact?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Email address */
  email?: string;
  
  /** Building */
  building?: string;
  
  /** Floor */
  floor?: string;
  
  /** Room */
  room?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Assigned date (ISO 8601 format) */
  assigneddate?: string;
  
  /** Resolved date (ISO 8601 format) */
  resolveddate?: string;
  
  /** Closed date (ISO 8601 format) */
  closeddate?: string;
  
  /** Resolution code */
  resolutioncode?: string;
  
  /** Solution */
  solution?: string;
  
  /** Has children flag */
  haschildren?: boolean;
  
  /** Parent ticket ID */
  parentticket?: string;
  
  /** Service request href (OSLC link) */
  href?: string;
}

/**
 * Service request creation interface (required fields)
 */
export interface ServiceRequestCreate {
  /** Service request description (required) */
  description: string;
  
  /** Person who reported the service request (required) */
  reportedby: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Organization identifier (optional, defaults to site's org) */
  orgid?: string;
  
  /** Affected person */
  affectedperson?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Classification structure ID */
  classstructureid?: string;
  
  /** Service request owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Target start date (ISO 8601 format) */
  targetstart?: string;
  
  /** Target finish date (ISO 8601 format) */
  targetfinish?: string;
  
  /** Reported priority (1-5) */
  reportedpriority?: number;
  
  /** External system identifier */
  externalsystem?: string;
  
  /** External reference ID */
  externalrefid?: string;
  
  /** Commodity code */
  commodity?: string;
  
  /** Commodity group */
  commoditygroup?: string;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Service request class */
  class?: string;
  
  /** Service request type */
  tickettype?: string;
  
  /** Contact information */
  contact?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Email address */
  email?: string;
  
  /** Building */
  building?: string;
  
  /** Floor */
  floor?: string;
  
  /** Room */
  room?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Parent ticket ID */
  parentticket?: string;
}

/**
 * Service request update interface (partial update fields)
 */
export interface ServiceRequestUpdate {
  /** Service request description */
  description?: string;
  
  /** Service request status */
  
  /** Status change date (ISO 8601 format) */
  statusdate?: string;
  status?: ServiceRequestStatus;
  
  /** Affected person */
  affectedperson?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Classification structure ID */
  classstructureid?: string;
  
  /** Service request owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Target start date (ISO 8601 format) */
  targetstart?: string;
  
  /** Target finish date (ISO 8601 format) */
  targetfinish?: string;
  
  /** Actual start date (ISO 8601 format) */
  actstart?: string;
  
  /** Actual finish date (ISO 8601 format) */
  actfinish?: string;
  
  /** Reported priority (1-5) */
  reportedpriority?: number;
  
  
  /** Related work order number */
  relatedwonum?: string;
  /** Commodity code */
  commodity?: string;
  
  /** Commodity group */
  commoditygroup?: string;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Service request class */
  class?: string;
  
  /** Service request type */
  tickettype?: string;
  
  /** Contact information */
  contact?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Email address */
  email?: string;
  
  /** Building */
  building?: string;
  
  /** Floor */
  floor?: string;
  
  /** Room */
  room?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Resolution code */
  resolutioncode?: string;
  
  /** Solution */
  solution?: string;
}

/**
 * Service request search criteria
 */
export interface ServiceRequestSearch {
  /** Filter by status */
  status?: ServiceRequestStatus | ServiceRequestStatus[];
  
  /** Filter by reported by person */
  reportedby?: string;
  
  /** Filter by affected person */
  affectedperson?: string;
  
  /** Filter by asset number */
  assetnum?: string;
  
  /** Filter by location */
  location?: string;
  
  /** Filter by reported priority */
  reportedpriority?: number;
  
  /** Filter by owner */
  owner?: string;
  
  /** Filter by owner group */
  ownergroup?: string;
  
  /** Filter by site */
  siteid?: string;
  
  /** Filter by organization */
  orgid?: string;
  
  /** Filter by classification */
  classstructureid?: string;
  
  /** Filter by commodity */
  commodity?: string;
  
  /** Filter by commodity group */
  commoditygroup?: string;
  
  /** Filter by ticket type */
  tickettype?: string;
  
  /** Filter by related work order */
  relatedwonum?: string;
  
  /** Date range filter */
  dateRange?: {
    /** Start date (ISO 8601 format) */
    start: string;
    /** End date (ISO 8601 format) */
    end: string;
    /** Date field to filter on */
    field?: 'reportdate' | 'statusdate' | 'targetstart' | 'targetfinish' | 'actstart' | 'actfinish' | 'resolveddate' | 'closeddate';
  };
  
  /** Page size for pagination */
  pageSize?: number;
  
  /** Page number (1-based) */
  page?: number;
  
  /** Fields to select (OSLC select) */
  select?: string[];
  
  /** Sort order (OSLC orderBy) */
  orderBy?: string;
  
  /** Custom OSLC where clause */
  where?: string;
  
  /** Search terms */
  searchTerms?: string;
}

/**
 * Status change request interface
 */
export interface StatusChangeRequest {
  /** New status */
  status: ServiceRequestStatus;
  
  /** Status change memo */
  memo?: string;
  
  /** Status change date (ISO 8601 format, defaults to now) */
  statusdate?: string;
  
  /** Resolution code (for RESOLVED/CLOSED status) */
  resolutioncode?: string;
  
  /** Solution (for RESOLVED/CLOSED status) */
  solution?: string;
}

/**
 * Work order conversion request interface
 */
export interface WorkOrderConversionRequest {
  /** Work type for the new work order */
  worktype?: string;
  
  /** Work order description (defaults to SR description) */
  description?: string;
  
  /** Work order priority (defaults to SR priority) */
  priority?: number;
  
  /** Scheduled start date (ISO 8601 format) */
  schedstart?: string;
  
  /** Scheduled finish date (ISO 8601 format) */
  schedfinish?: string;
  
  /** Work order owner (defaults to SR owner) */
  owner?: string;
  
  /** Owner group (defaults to SR owner group) */
  ownergroup?: string;
  
  /** Additional work order fields */
  [key: string]: any;
}

/**
 * Service request response with pagination
 */
export interface ServiceRequestListResponse {
  /** Array of service requests */
  serviceRequests: ServiceRequest[];
  
  /** Total count of matching records */
  totalCount: number;
  
  /** Current page number */
  page: number;
  
  /** Page size */
  pageSize: number;
  
  /** Total pages */
  totalPages: number;
  
  /** Has next page */
  hasNext: boolean;
  
  /** Has previous page */
  hasPrevious: boolean;
}

/**
 * Service request operation result
 */
export interface ServiceRequestOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Service request data (if successful) */
  serviceRequest?: ServiceRequest;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Work order conversion result
 */
export interface WorkOrderConversionResult {
  /** Success flag */
  success: boolean;

  /** Created work order number */
  wonum?: string;

  /** Work order details */
  workOrder?: any;

  /** Updated service request with related work order */
  serviceRequest?: ServiceRequest;

  /** Error message (if failed) */
  error?: string;

  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Work log type values for service requests
 */
export type SRWorkLogType = 'CLIENTNOTE' | 'WORK' | 'UPDATE' | 'MODDATE';

/**
 * Work log entry for a service request
 */
export interface SRWorkLog {
  /** Log description/summary (required) */
  description: string;

  /** Log type */
  logtype?: SRWorkLogType;

  /** Detailed log text */
  description_longdescription?: string;

  /** Create date (ISO 8601 format) */
  createdate?: string;

  /** Created by person */
  createby?: string;

  /** Client viewable flag */
  clientviewable?: boolean;

  /** Work log class */
  class?: string;
}

/**
 * Assignment request for a service request
 */
export interface SRAssignRequest {
  /** Person to assign as owner */
  owner: string;

  /** Owner group (optional) */
  ownergroup?: string;
}

/**
 * Escalation request for a service request
 */
export interface SREscalateRequest {
  /** New priority level (1-5, where 1 is highest) */
  newPriority: number;

  /** Reason for escalation (added as work log) */
  escalationReason: string;

  /** New owner group for escalation routing (optional) */
  newOwnerGroup?: string;
}

/**
 * Solution request for a service request
 */
export interface SRSolutionRequest {
  /** Solution text */
  solution: string;

  /** Automatically resolve the service request */
  autoResolve?: boolean;
}

/**
 * Related work orders response
 */
export interface SRRelatedWorkOrdersResponse {
  /** Array of related work orders */
  workOrders: any[];

  /** Total count */
  totalCount: number;

  /** Source ticket ID */
  ticketid: string;

  /** Source site ID */
  siteid: string;
}