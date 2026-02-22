/**
 * Type definitions for Scheduler Module
 * Defines interfaces and types for work scheduling and resource allocation in Maximo
 */

/**
 * A scheduled work order entry with assignment and timing details
 */
export interface WorkScheduleEntry {
  /** Work order number */
  wonum: string;

  /** Work order description */
  description: string;

  /** Scheduled start date (ISO 8601 format) */
  schedstart: string;

  /** Scheduled finish date (ISO 8601 format) */
  schedfinish: string;

  /** Person assigned to the work order (owner) */
  assignedTo?: string;

  /** Priority level (1-5, where 1 is highest) */
  priority?: number;

  /** Current work order status */
  status: string;

  /** Site identifier */
  siteid: string;

  /** Asset number */
  assetnum?: string;

  /** Location code */
  location?: string;

  /** Work type (CM, PM, EM, etc.) */
  worktype?: string;

  /** Estimated duration in hours */
  estdur?: number;
}

/**
 * Labor availability for a person including utilization metrics
 */
export interface LaborAvailability {
  /** Person identifier */
  personid: string;

  /** Craft / trade */
  craft?: string;

  /** Available hours in the period (capacity minus assigned) */
  availableHours: number;

  /** Hours assigned to scheduled work orders */
  assignedHours: number;

  /** Utilization percentage (assignedHours / capacity * 100) */
  utilizationPercent: number;

  /** Display name of the person */
  displayname?: string;

  /** Skill level */
  skilllevel?: string;

  /** Status of the person */
  status?: string;
}

/**
 * A schedule conflict where two work orders overlap for the same person
 */
export interface ScheduleConflict {
  /** Person identifier with the conflict */
  personid: string;

  /** First conflicting work order number */
  wonum1: string;

  /** First work order description */
  description1: string;

  /** First work order scheduled start */
  schedstart1: string;

  /** First work order scheduled finish */
  schedfinish1: string;

  /** Second conflicting work order number */
  wonum2: string;

  /** Second work order description */
  description2: string;

  /** Second work order scheduled start */
  schedstart2: string;

  /** Second work order scheduled finish */
  schedfinish2: string;

  /** Overlap duration in hours */
  overlapHours: number;
}

/**
 * A work order that is missing scheduled dates
 */
export interface UnscheduledWork {
  /** Work order number */
  wonum: string;

  /** Work order description */
  description: string;

  /** Priority level */
  priority?: number;

  /** Current status */
  status: string;

  /** Site identifier */
  siteid: string;

  /** Assigned owner */
  owner?: string;

  /** Work type */
  worktype?: string;

  /** Asset number */
  assetnum?: string;

  /** Location code */
  location?: string;

  /** Estimated duration in hours */
  estdur?: number;

  /** Date the work order was reported */
  reportdate?: string;
}

/**
 * Summary of unscheduled and unassigned work by priority
 */
export interface WorkBacklog {
  /** Site identifier */
  siteid: string;

  /** Total count of unscheduled work orders */
  totalUnscheduled: number;

  /** Total count of unassigned work orders */
  totalUnassigned: number;

  /** Breakdown by priority level */
  byPriority: WorkBacklogPriorityBucket[];

  /** Breakdown by status */
  byStatus: WorkBacklogStatusBucket[];
}

/**
 * Backlog count for a single priority level
 */
export interface WorkBacklogPriorityBucket {
  /** Priority level (1-5) or 0 for unset */
  priority: number;

  /** Count of work orders at this priority */
  count: number;
}

/**
 * Backlog count for a single status
 */
export interface WorkBacklogStatusBucket {
  /** Work order status */
  status: string;

  /** Count of work orders in this status */
  count: number;
}

/**
 * Upcoming PM (Preventive Maintenance) schedule entry
 */
export interface UpcomingPM {
  /** PM number */
  pmnum: string;

  /** PM description */
  description: string;

  /** Next due date (ISO 8601 format) */
  nextdate: string;

  /** Asset number */
  assetnum?: string;

  /** Location code */
  location?: string;

  /** Frequency value */
  frequency?: number;

  /** Frequency unit */
  frequnit?: string;

  /** Site identifier */
  siteid: string;

  /** Lead time in days */
  leadtime?: number;

  /** Priority */
  priority?: number;
}

/**
 * Parameters for schedule queries
 */
export interface ScheduleQuery {
  /** Site identifier (required) */
  siteid: string;

  /** Start of the date range (ISO 8601 format) */
  startDate: string;

  /** End of the date range (ISO 8601 format) */
  endDate: string;

  /** Filter by specific person */
  personid?: string;

  /** Filter by craft / trade */
  craft?: string;

  /** Page size for results */
  pageSize?: number;
}

/**
 * Schedule query result wrapper
 */
export interface WorkScheduleResponse {
  /** List of scheduled work entries */
  entries: WorkScheduleEntry[];

  /** Total count of matching entries */
  totalCount: number;

  /** Query date range start */
  startDate: string;

  /** Query date range end */
  endDate: string;

  /** Site identifier */
  siteid: string;
}

/**
 * Labor availability query result wrapper
 */
export interface LaborAvailabilityResponse {
  /** List of labor availability records */
  availability: LaborAvailability[];

  /** Date for which availability was calculated */
  date?: string;

  /** Site identifier */
  siteid: string;
}

/**
 * Schedule conflicts result wrapper
 */
export interface ScheduleConflictsResponse {
  /** List of detected conflicts */
  conflicts: ScheduleConflict[];

  /** Total number of conflicts found */
  totalConflicts: number;

  /** Query date range start */
  startDate: string;

  /** Query date range end */
  endDate: string;

  /** Site identifier */
  siteid: string;
}

/**
 * Unscheduled work result wrapper
 */
export interface UnscheduledWorkResponse {
  /** List of unscheduled work orders */
  workOrders: UnscheduledWork[];

  /** Total count of unscheduled work orders */
  totalCount: number;

  /** Site identifier */
  siteid: string;
}

/**
 * Upcoming PMs result wrapper
 */
export interface UpcomingPMsResponse {
  /** List of upcoming PM entries */
  pms: UpcomingPM[];

  /** Total count */
  totalCount: number;

  /** Number of days in the lookahead window */
  days: number;

  /** Site identifier */
  siteid: string;
}
