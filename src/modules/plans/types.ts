/**
 * Type definitions for Job Plans (PLANS) Module
 * Defines interfaces and types for job plan management in Maximo
 *
 * Job Plans (MXJP) are reusable templates that define the tasks, labor,
 * materials, and services needed to complete work orders. They are critical
 * for preventive maintenance workflows.
 */

/**
 * Job plan status values
 */
export type JobPlanStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'REVISED';

/**
 * Complete job plan interface with all Maximo fields
 */
export interface JobPlan {
  /** Job plan number (unique identifier) */
  jpnum: string;

  /** Job plan description */
  description: string;

  /** Revision number for plus-based revisioning */
  pluscrevnum?: number;

  /** Site identifier */
  siteid?: string;

  /** Organization identifier */
  orgid?: string;

  /** Current status */
  status?: JobPlanStatus;

  /** Priority (1-5, where 1 is highest) */
  priority?: number;

  /** Estimated duration in hours */
  duration?: number;

  /** Whether work can be interrupted */
  interruptible?: boolean;

  /** Whether asset downtime is required */
  downtime?: boolean;

  /** Long description */
  description_longdescription?: string;

  /** Work type */
  worktype?: string;

  /** Craft associated with the job plan */
  craft?: string;

  /** Template type */
  templatetype?: string;

  /** Safety plan identifier */
  safetyplanid?: string;

  /** Failure class */
  failurecode?: string;

  /** GL debit account */
  glaccount?: string;

  /** Person who created the job plan */
  changeby?: string;

  /** Date when the job plan was last changed (ISO 8601 format) */
  changedate?: string;

  /** Flow control flag */
  flowcontrolled?: boolean;

  /** Nested child collections (when selected) */
  jobtask?: JobPlanTask[];
  joblabor?: JobPlanLabor[];
  jobmaterial?: JobPlanMaterial[];
  jobservice?: JobPlanService[];

  /** Job plan href (OSLC link) */
  href?: string;
}

/**
 * Job plan task interface
 * Tasks represent individual steps or activities within a job plan
 */
export interface JobPlanTask {
  /** Task sequence number */
  jptask: number;

  /** Task description */
  description: string;

  /** Meter name for condition-based task */
  metername?: string;

  /** Whether the task can be interrupted */
  interruptible?: boolean;

  /** Estimated duration in hours */
  duration?: number;

  /** Task sequence for ordering */
  sequence?: number;

  /** Owner group */
  ownergroup?: string;

  /** Craft */
  craft?: string;

  /** Long description */
  description_longdescription?: string;
}

/**
 * Job plan labor requirement interface
 * Defines labor resources needed for the job plan
 */
export interface JobPlanLabor {
  /** Craft code */
  craft: string;

  /** Number of labor resources required */
  quantity: number;

  /** Hours per labor resource */
  hours: number;

  /** Hourly rate */
  rate?: number;

  /** Skill level required */
  skilllevel?: string;

  /** Vendor for outside labor */
  vendor?: string;

  /** Contract number */
  contractnum?: string;
}

/**
 * Job plan material requirement interface
 * Defines materials needed for the job plan
 */
export interface JobPlanMaterial {
  /** Item number */
  itemnum: string;

  /** Quantity required */
  itemqty: number;

  /** Item description */
  description?: string;

  /** Condition code for the material */
  conditioncode?: string;

  /** Storeroom location */
  storeroom?: string;

  /** Unit of measure */
  unitcost?: number;

  /** Direct issue flag */
  directreq?: boolean;

  /** Line type */
  linetype?: string;
}

/**
 * Job plan service requirement interface
 * Defines external services needed for the job plan
 */
export interface JobPlanService {
  /** Service description */
  description: string;

  /** Vendor code */
  vendor?: string;

  /** Estimated line cost */
  linecost?: number;

  /** Contract number */
  contractnum?: string;

  /** Line type */
  linetype?: string;
}

/**
 * Job plan creation interface (required fields)
 */
export interface JobPlanCreate {
  /** Job plan number (required) */
  jpnum: string;

  /** Job plan description (required) */
  description: string;

  /** Site identifier (optional for org-level plans) */
  siteid?: string;

  /** Organization identifier */
  orgid?: string;

  /** Status (defaults to DRAFT) */
  status?: JobPlanStatus;

  /** Priority (1-5) */
  priority?: number;

  /** Estimated duration in hours */
  duration?: number;

  /** Whether work can be interrupted */
  interruptible?: boolean;

  /** Whether asset downtime is required */
  downtime?: boolean;

  /** Long description */
  description_longdescription?: string;

  /** Work type */
  worktype?: string;

  /** Craft */
  craft?: string;

  /** Template type */
  templatetype?: string;

  /** Safety plan identifier */
  safetyplanid?: string;

  /** Failure class */
  failurecode?: string;

  /** GL debit account */
  glaccount?: string;

  /** Flow control flag */
  flowcontrolled?: boolean;
}

/**
 * Job plan update interface (partial update fields)
 */
export interface JobPlanUpdate {
  /** Job plan description */
  description?: string;

  /** Status */
  status?: JobPlanStatus;

  /** Priority (1-5) */
  priority?: number;

  /** Estimated duration in hours */
  duration?: number;

  /** Whether work can be interrupted */
  interruptible?: boolean;

  /** Whether asset downtime is required */
  downtime?: boolean;

  /** Long description */
  description_longdescription?: string;

  /** Work type */
  worktype?: string;

  /** Craft */
  craft?: string;

  /** Template type */
  templatetype?: string;

  /** Safety plan identifier */
  safetyplanid?: string;

  /** Failure class */
  failurecode?: string;

  /** GL debit account */
  glaccount?: string;

  /** Flow control flag */
  flowcontrolled?: boolean;
}

/**
 * Job plan search criteria
 */
export interface JobPlanSearch {
  /** Filter by job plan number (supports wildcards) */
  jpnum?: string;

  /** Filter by status */
  status?: JobPlanStatus | JobPlanStatus[];

  /** Filter by site */
  siteid?: string;

  /** Filter by organization */
  orgid?: string;

  /** Filter by priority */
  priority?: number;

  /** Filter by work type */
  worktype?: string;

  /** Filter by craft */
  craft?: string;

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
 * Job plan list response with pagination
 */
export interface JobPlanListResponse {
  /** Array of job plans */
  jobPlans: JobPlan[];

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
