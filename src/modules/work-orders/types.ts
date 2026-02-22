/**
 * Type definitions for Work Order Module
 * Defines interfaces and types for work order management in Maximo
 */

/**
 * Work order status values
 */
export type WorkOrderStatus = 'WAPPR' | 'APPR' | 'WSCH' | 'INPRG' | 'COMP' | 'CLOSE' | 'CAN';

/**
 * Work order type values
 */
export type WorkOrderType = 'CM' | 'PM' | 'EM' | 'CAL' | 'INS';

/**
 * Work log type values
 */
export type WorkLogType = 'WORK' | 'UPDATE' | 'CLIENTNOTE' | 'MODDATE';

/**
 * Complete work order interface with all Maximo fields
 */
export interface WorkOrder {
  /** Work order number (unique identifier) */
  wonum: string;
  
  /** Work order description */
  description: string;
  
  /** Current status */
  status: WorkOrderStatus;
  
  /** Status change date (ISO 8601 format) */
  statusdate: string;
  
  /** Work type */
  worktype: WorkOrderType;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Organization identifier */
  orgid: string;
  
  /** Priority (1-5, where 1 is highest) */
  priority?: number;
  
  /** Scheduled start date (ISO 8601 format) */
  schedstart?: string;
  
  /** Scheduled finish date (ISO 8601 format) */
  schedfinish?: string;
  
  /** Actual start date (ISO 8601 format) */
  actstart?: string;
  
  /** Actual finish date (ISO 8601 format) */
  actfinish?: string;
  
  /** Person who reported the work order */
  reportedby?: string;
  
  /** Work order owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Lead person */
  lead?: string;
  
  /** Work order priority */
  wopriority?: number;
  
  /** Target start date (ISO 8601 format) */
  targstartdate?: string;
  
  /** Target completion date (ISO 8601 format) */
  targcompdate?: string;
  
  /** Estimated duration in hours */
  estdur?: number;
  
  /** Actual labor cost */
  actlabcost?: number;
  
  /** Actual material cost */
  actmatcost?: number;
  
  /** Actual service cost */
  actservcost?: number;
  
  /** Actual tool cost */
  acttoolcost?: number;
  
  /** Actual labor hours */
  actlabhrs?: number;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Problem code */
  problemcode?: string;
  
  /** Work order class */
  woclass?: string;
  
  /** GL debit account */
  glaccount?: string;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Change by person */
  changeby?: string;
  
  /** Parent work order */
  parent?: string;
  
  /** Has children flag */
  haschildren?: boolean;
  
  /** Is task flag */
  istask?: boolean;
  
  /** Crew work group */
  crewworkgroup?: string;
  
  /** Work package */
  workpackage?: string;
  
  /** Route stop ID */
  routestopid?: number;
  
  /** Calendar number */
  calnum?: string;
  
  /** Job plan number */
  jpnum?: string;
  
  /** Downtime flag */
  downtime?: boolean;
  
  /** External reference ID */
  externalrefid?: string;
  
  /** Send as notification flag */
  sendersysid?: string;
  
  /** Internal priority */
  internalpriority?: number;
  
  /** Response time in hours */
  respondby?: number;
  
  /** Completion time in hours */
  completeby?: number;
  
  /** Work order href (OSLC link) */
  href?: string;
}

/**
 * Work order creation interface (required fields)
 */
export interface WorkOrderCreate {
  /** Work order description (required) */
  description: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Work type (required) */
  worktype: WorkOrderType;
  
  /** Organization identifier (optional, defaults to site's org) */
  orgid?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Priority (1-5) */
  priority?: number;
  
  /** Scheduled start date (ISO 8601 format) */
  schedstart?: string;
  
  /** Scheduled finish date (ISO 8601 format) */
  schedfinish?: string;
  
  /** Target start date (ISO 8601 format) */
  targstartdate?: string;
  
  /** Target completion date (ISO 8601 format) */
  targcompdate?: string;
  
  /** Person who reported the work order */
  reportedby?: string;
  
  /** Work order owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Lead person */
  lead?: string;
  
  /** Work order priority */
  wopriority?: number;
  
  /** Estimated duration in hours */
  estdur?: number;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Problem code */
  problemcode?: string;
  
  /** Work order class */
  woclass?: string;
  
  /** GL debit account */
  glaccount?: string;
  
  /** Parent work order */
  parent?: string;
  
  /** Crew work group */
  crewworkgroup?: string;
  
  /** Job plan number */
  jpnum?: string;
  
  /** External reference ID */
  externalrefid?: string;
}

/**
 * Work order update interface (partial update fields)
 */
export interface WorkOrderUpdate {
  /** Work order status */
  status?: WorkOrderStatus;
  
  /** Work order description */
  description?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Location code */
  location?: string;
  
  /** Priority (1-5) */
  priority?: number;
  
  /** Scheduled start date (ISO 8601 format) */
  schedstart?: string;
  
  /** Scheduled finish date (ISO 8601 format) */
  schedfinish?: string;
  
  /** Actual start date (ISO 8601 format) */
  actstart?: string;
  
  /** Actual finish date (ISO 8601 format) */
  actfinish?: string;
  
  /** Target start date (ISO 8601 format) */
  targstartdate?: string;
  
  /** Target completion date (ISO 8601 format) */
  targcompdate?: string;
  
  /** Work order owner */
  owner?: string;
  
  /** Owner group */
  ownergroup?: string;
  
  /** Supervisor */
  supervisor?: string;
  
  /** Lead person */
  lead?: string;
  
  /** Work order priority */
  wopriority?: number;
  
  /** Estimated duration in hours */
  estdur?: number;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Problem code */
  problemcode?: string;
  
  /** Work order class */
  woclass?: string;
  
  /** GL debit account */
  glaccount?: string;
  
  /** Crew work group */
  crewworkgroup?: string;
  
  /** External reference ID */
  externalrefid?: string;
}

/**
 * Work order search criteria
 */
export interface WorkOrderSearch {
  /** Filter by status */
  status?: WorkOrderStatus | WorkOrderStatus[];
  
  /** Filter by asset number */
  assetnum?: string;
  
  /** Filter by location */
  location?: string;
  
  /** Filter by work type */
  worktype?: WorkOrderType | WorkOrderType[];
  
  /** Filter by priority */
  priority?: number;
  
  /** Filter by owner */
  owner?: string;
  
  /** Filter by owner group */
  ownergroup?: string;
  
  /** Filter by supervisor */
  supervisor?: string;
  
  /** Filter by site */
  siteid?: string;
  
  /** Filter by organization */
  orgid?: string;
  
  /** Date range filter */
  dateRange?: {
    /** Start date (ISO 8601 format) */
    start: string;
    /** End date (ISO 8601 format) */
    end: string;
    /** Date field to filter on */
    field?: 'schedstart' | 'schedfinish' | 'actstart' | 'actfinish' | 'statusdate' | 'targstartdate' | 'targcompdate';
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
 * Labor transaction interface
 */
export interface LaborTransaction {
  /** Labor code */
  laborcode: string;
  
  /** Hours worked */
  hours: number;
  
  /** Transaction date (ISO 8601 format) */
  transdate: string;
  
  /** Start time (ISO 8601 format) */
  starttime?: string;
  
  /** Finish time (ISO 8601 format) */
  finishtime?: string;
  
  /** Regular hours */
  regularhrs?: number;
  
  /** Premium pay code */
  premiumpayhours?: number;
  
  /** Craft */
  craft?: string;
  
  /** Skill level */
  skilllevel?: string;
  
  /** Vendor */
  vendor?: string;
  
  /** Contract number */
  contractnum?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Task ID */
  taskid?: string;
  
  /** Geolocation */
  geolocation?: string;
}

/**
 * Material transaction interface
 */
export interface MaterialTransaction {
  /** Item number */
  itemnum: string;
  
  /** Quantity */
  quantity: number;
  
  /** Storeroom location */
  storeroom?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Issue type */
  issuetype?: string;
  
  /** Transaction date (ISO 8601 format) */
  transdate?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Unit cost */
  unitcost?: number;
  
  /** Task ID */
  taskid?: string;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Conversion factor */
  conversion?: number;
  
  /** Issue unit */
  issueunit?: string;
}

/**
 * Service entry interface
 */
export interface ServiceEntry {
  /** Service description */
  description: string;
  
  /** Line cost */
  linecost: number;
  
  /** Vendor */
  vendor?: string;
  
  /** Contract number */
  contractnum?: string;
  
  /** Purchase order number */
  ponum?: string;
  
  /** Purchase order line number */
  polinenum?: number;
  
  /** Task ID */
  taskid?: string;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** Entered date (ISO 8601 format) */
  enterdate?: string;
  
  /** Entered by */
  enterby?: string;
}

/**
 * Work log entry interface
 */
export interface WorkLog {
  /** Log description/summary */
  description: string;
  
  /** Detailed log text */
  logtype?: WorkLogType;
  
  /** Long description */
  description_longdescription?: string;
  
  /** Create date (ISO 8601 format) */
  createdate?: string;
  
  /** Created by */
  createby?: string;
  
  /** Client viewable flag */
  clientviewable?: boolean;
  
  /** Work log class */
  class?: string;
}

/**
 * Work order assignment interface
 */
export interface WorkOrderAssignment {
  /** Assigned owner */
  owner?: string;
  
  /** Assigned owner group */
  ownergroup?: string;
  
  /** Assigned supervisor */
  supervisor?: string;
  
  /** Assigned lead */
  lead?: string;
  
  /** Assigned crew work group */
  crewworkgroup?: string;
  
  /** Assignment date (ISO 8601 format) */
  assignmentdate?: string;
  
  /** Schedule date (ISO 8601 format) */
  scheduledate?: string;
}

/**
 * Status change request interface
 */
export interface StatusChangeRequest {
  /** New status */
  status: WorkOrderStatus;
  
  /** Status change memo */
  memo?: string;
  
  /** Status change date (ISO 8601 format, defaults to now) */
  statusdate?: string;
}

/**
 * Work order response with pagination
 */
export interface WorkOrderListResponse {
  /** Array of work orders */
  workOrders: WorkOrder[];
  
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
 * Work order task (child activity) interface
 */
export interface WorkOrderTask {
  /** Task description */
  description: string;

  /** Task ID (sequence number) */
  taskid: number;

  /** Estimated duration in hours */
  estdur?: number;

  /** Owner group */
  ownergroup?: string;

  /** Task owner */
  owner?: string;
}

/**
 * Work order operation result
 */
export interface WorkOrderOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Work order data (if successful) */
  workOrder?: WorkOrder;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}