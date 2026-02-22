/**
 * Type definitions for Preventive Maintenance Module
 * Defines interfaces and types for preventive maintenance management in Maximo
 */

/**
 * PM status values
 */
export type PMStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPEND';

/**
 * Frequency unit values
 */
export type FrequencyUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS' | 'HOURS' | 'METERS' | 'MILES' | 'KILOMETERS';

/**
 * Job plan status values
 */
export type JobPlanStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

/**
 * Complete PM interface with all Maximo fields
 */
export interface PreventiveMaintenance {
  /** PM number (unique identifier) */
  pmnum: string;

  /** PM description */
  description: string;

  /** Current status */
  status: PMStatus;

  /** Status change date (ISO 8601 format) */
  statusdate: string;

  /** Asset number */
  assetnum?: string;

  /** Location code */
  location?: string;

  /** Site identifier */
  siteid: string;

  /** Organization identifier */
  orgid: string;

  /** Frequency value */
  frequency: number;

  /** Frequency unit */
  frequnit: FrequencyUnit;

  /** Next due date (ISO 8601 format) */
  nextdate?: string;

  /** Last completion date (ISO 8601 format) */
  lastcompdate?: string;

  /** Job plan number */
  jpnum?: string;

  /** Work type */
  worktype?: string;

  /** Priority */
  priority?: number;

  /** Estimated duration in hours */
  estdur?: number;

  /** Lead craft */
  leadcraft?: string;

  /** Lead craft skill level */
  leadcraftskill?: string;

  /** Route */
  route?: string;

  /** Route sequence */
  routeseq?: number;

  /** Meter-based flag */
  meterbased?: boolean;

  /** Meter name */
  metername?: string;

  /** Meter reading threshold */
  meterreading?: number;

  /** Calendar */
  calendar?: string;

  /** Comments */
  comments?: string;
}

/**
 * Job plan interface
 */
export interface JobPlan {
  /** Job plan number (unique identifier) */
  jpnum: string;

  /** Job plan description */
  description: string;

  /** Current status */
  status: JobPlanStatus;

  /** Site identifier */
  siteid: string;

  /** Organization identifier */
  orgid: string;

  /** Estimated duration in hours */
  estdur?: number;

  /** Work type */
  worktype?: string;

  /** Priority */
  priority?: number;

  /** Lead craft */
  leadcraft?: string;

  /** Comments */
  comments?: string;

  /** Job plan tasks */
  jptask?: JobPlanTask[];
}

/**
 * Job plan task interface
 */
export interface JobPlanTask {
  /** Task number */
  taskid: number;

  /** Task description */
  description: string;

  /** Task type */
  tasktype?: string;

  /** Estimated duration in hours */
  estdur?: number;

  /** Sequence number */
  seqnum?: number;
}

/**
 * PM creation data
 */
export interface PMCreate {
  /** PM description (required) */
  description: string;

  /** Site identifier (required) */
  siteid: string;

  /** Frequency value (required) */
  frequency: number;

  /** Frequency unit (required) */
  frequnit: FrequencyUnit;

  /** Organization identifier (optional) */
  orgid?: string;

  /** Asset number (optional) */
  assetnum?: string;

  /** Location code (optional) */
  location?: string;

  /** Next due date (optional, ISO 8601 format) */
  nextdate?: string;

  /** Job plan number (optional) */
  jpnum?: string;

  /** Work type (optional) */
  worktype?: string;

  /** Priority (optional) */
  priority?: number;

  /** Estimated duration in hours (optional) */
  estdur?: number;

  /** Lead craft (optional) */
  leadcraft?: string;

  /** Route (optional) */
  route?: string;

  /** Meter-based flag (optional) */
  meterbased?: boolean;

  /** Meter name (optional) */
  metername?: string;

  /** Meter reading threshold (optional) */
  meterreading?: number;

  /** Calendar (optional) */
  calendar?: string;

  /** Comments (optional) */
  comments?: string;
}

/**
 * PM update data
 */
export interface PMUpdate {
  /** Description (optional) */
  description?: string;

  /** Frequency value (optional) */
  frequency?: number;

  /** Frequency unit (optional) */
  frequnit?: FrequencyUnit;

  /** Next due date (optional, ISO 8601 format) */
  nextdate?: string;

  /** Asset number (optional) */
  assetnum?: string;

  /** Location code (optional) */
  location?: string;

  /** Job plan number (optional) */
  jpnum?: string;

  /** Work type (optional) */
  worktype?: string;

  /** Priority (optional) */
  priority?: number;

  /** Estimated duration in hours (optional) */
  estdur?: number;

  /** Lead craft (optional) */
  leadcraft?: string;

  /** Route (optional) */
  route?: string;

  /** Meter-based flag (optional) */
  meterbased?: boolean;

  /** Meter name (optional) */
  metername?: string;

  /** Meter reading threshold (optional) */
  meterreading?: number;

  /** Calendar (optional) */
  calendar?: string;

  /** Comments (optional) */
  comments?: string;

  /** Status (optional) */
  status?: PMStatus;
}

/**
 * PM search parameters
 */
export interface PMSearch {
  /** Asset number filter (optional) */
  assetnum?: string;

  /** Location code filter (optional) */
  location?: string;

  /** Status filter (optional) */
  status?: PMStatus | PMStatus[];

  /** Site identifier filter (optional) */
  siteid?: string;

  /** Job plan number filter (optional) */
  jpnum?: string;

  /** Work type filter (optional) */
  worktype?: string;

  /** Page size (optional) */
  pageSize?: number;

  /** Page number (optional) */
  pageNum?: number;
}

/**
 * Job plan creation data
 */
export interface JobPlanCreate {
  /** Job plan number (required) */
  jpnum: string;

  /** Job plan description (required) */
  description: string;

  /** Site identifier (required) */
  siteid: string;

  /** Organization identifier (optional) */
  orgid?: string;

  /** Estimated duration in hours (optional) */
  estdur?: number;

  /** Work type (optional) */
  worktype?: string;

  /** Priority (optional) */
  priority?: number;

  /** Lead craft (optional) */
  leadcraft?: string;

  /** Comments (optional) */
  comments?: string;

  /** Job plan tasks (optional) */
  jptask?: JobPlanTaskCreate[];
}

/**
 * Job plan task creation data
 */
export interface JobPlanTaskCreate {
  /** Task description (required) */
  description: string;

  /** Task type (optional) */
  tasktype?: string;

  /** Estimated duration in hours (optional) */
  estdur?: number;

  /** Sequence number (optional) */
  seqnum?: number;
}

/**
 * PM work order generation data
 */
export interface PMWorkOrderGeneration {
  /** PM number (required) */
  pmnum: string;

  /** Target generation date (optional, ISO 8601 format) */
  targetdate?: string;

  /** Site identifier (optional) */
  siteid?: string;
}

/**
 * PM list response
 */
export interface PMListResponse {
  /** List of PM records */
  member: PreventiveMaintenance[];

  /** Total count */
  totalCount?: number;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * PM operation result
 */
export interface PMOperationResult {
  /** Success flag */
  success: boolean;

  /** PM number */
  pmnum?: string;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * PM work order generation result
 */
export interface PMWorkOrderGenerationResult {
  /** Success flag */
  success: boolean;

  /** Generated work orders */
  workOrders?: string[];

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Time-based frequency unit values (for schedule calculation)
 */
export type TimeFrequencyUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

/**
 * PM completion data
 */
export interface PMCompletion {
  /** PM number (required) */
  pmnum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Completion date (optional, ISO 8601 format, defaults to current date) */
  completionDate?: string;

  /** Completion memo (optional) */
  memo?: string;
}

/**
 * PM history query parameters
 */
export interface PMHistoryParams {
  /** PM number (required) */
  pmnum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Page size (optional, default: 100) */
  pageSize?: number;
}

/**
 * PM history work order entry
 */
export interface PMHistoryWorkOrder {
  /** Work order number */
  wonum: string;

  /** Work order status */
  status: string;

  /** Actual start date (ISO 8601 format) */
  actstart?: string;

  /** Actual finish date (ISO 8601 format) */
  actfinish?: string;

  /** Work order description */
  description?: string;
}

/**
 * PM history response
 */
export interface PMHistoryResponse {
  /** List of work orders generated from this PM */
  member: PMHistoryWorkOrder[];

  /** Total count */
  totalCount?: number;
}

/**
 * PM schedule query parameters
 */
export interface PMScheduleParams {
  /** PM number (required) */
  pmnum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Number of projected dates to return (optional, default: 5) */
  count?: number;
}

/**
 * PM projected schedule entry
 */
export interface PMScheduleEntry {
  /** Sequence number (1-based) */
  sequence: number;

  /** Projected date (ISO 8601 format) */
  date: string;
}

/**
 * PM schedule response
 */
export interface PMScheduleResponse {
  /** PM number */
  pmnum: string;

  /** Current frequency */
  frequency: number;

  /** Current frequency unit */
  frequnit: FrequencyUnit;

  /** Next scheduled date */
  nextdate: string;

  /** Projected schedule dates */
  projectedDates: PMScheduleEntry[];
}

/**
 * PM frequency update data
 */
export interface PMFrequencyUpdate {
  /** PM number (required) */
  pmnum: string;

  /** Site identifier (required) */
  siteid: string;

  /** New frequency value (required) */
  frequency: number;

  /** New frequency unit (required) */
  frequnit: TimeFrequencyUnit;
}

/**
 * PM status change data
 */
export interface PMStatusChange {
  /** PM number (required) */
  pmnum: string;

  /** Site identifier (required) */
  siteid: string;
}
