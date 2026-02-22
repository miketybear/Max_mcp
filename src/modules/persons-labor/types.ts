/**
 * Type definitions for Person and Labor Module
 * Defines interfaces and types for person and labor management in Maximo
 */

/**
 * Person status values
 */
export type PersonStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';

/**
 * Labor transaction type values
 */
export type LaborTransactionType = 'REGULAR' | 'OVERTIME' | 'DOUBLE' | 'VACATION' | 'SICK' | 'HOLIDAY';

/**
 * Complete person interface with all Maximo fields
 */
export interface Person {
  /** Person ID (unique identifier) */
  personid: string;

  /** Display name */
  displayname: string;

  /** Primary email address */
  primaryemail?: string;

  /** Current status */
  status: PersonStatus;

  /** Status change date (ISO 8601 format) */
  statusdate?: string;

  /** Site identifier */
  siteid?: string;

  /** Organization identifier */
  orgid?: string;

  /** Labor code */
  laborcode?: string;

  /** Phone number */
  phonenum?: string;

  /** Mobile phone number */
  mobilephone?: string;

  /** Department */
  department?: string;

  /** Job title */
  jobtitle?: string;

  /** Manager person ID */
  manager?: string;

  /** Crew ID */
  crewid?: string;

  /** Craft */
  craft?: string;

  /** Skill level */
  skilllevel?: string;

  /** Comments */
  comments?: string;
}

/**
 * Labor transaction interface
 */
export interface LaborTransaction {
  /** Transaction ID (unique identifier) */
  labtransid: number;

  /** Labor code */
  laborcode: string;

  /** Reference work order */
  refwo?: string;

  /** Transaction date (ISO 8601 format) */
  transdate: string;

  /** Regular hours */
  regularhrs?: number;

  /** Overtime hours */
  overtimehrs?: number;

  /** Double time hours */
  doublehrs?: number;

  /** Transaction type */
  transtype?: LaborTransactionType;

  /** Start date/time (ISO 8601 format) */
  startdate?: string;

  /** Finish date/time (ISO 8601 format) */
  finishdate?: string;

  /** Pay rate */
  payrate?: number;

  /** Total cost */
  totalcost?: number;

  /** Comments */
  comments?: string;
}

/**
 * Person creation data
 */
export interface PersonCreate {
  /** Person ID (required) */
  personid: string;

  /** Display name (required) */
  displayname: string;

  /** Primary email address (optional) */
  primaryemail?: string;

  /** Status (optional, defaults to ACTIVE) */
  status?: PersonStatus;

  /** Site identifier (optional) */
  siteid?: string;

  /** Organization identifier (optional) */
  orgid?: string;

  /** Labor code (optional) */
  laborcode?: string;

  /** Phone number (optional) */
  phonenum?: string;

  /** Mobile phone number (optional) */
  mobilephone?: string;

  /** Department (optional) */
  department?: string;

  /** Job title (optional) */
  jobtitle?: string;

  /** Manager person ID (optional) */
  manager?: string;

  /** Crew ID (optional) */
  crewid?: string;

  /** Craft (optional) */
  craft?: string;

  /** Skill level (optional) */
  skilllevel?: string;

  /** Comments (optional) */
  comments?: string;
}

/**
 * Person update data
 */
export interface PersonUpdate {
  /** Display name (optional) */
  displayname?: string;

  /** Primary email address (optional) */
  primaryemail?: string;

  /** Status (optional) */
  status?: PersonStatus;

  /** Labor code (optional) */
  laborcode?: string;

  /** Phone number (optional) */
  phonenum?: string;

  /** Mobile phone number (optional) */
  mobilephone?: string;

  /** Department (optional) */
  department?: string;

  /** Job title (optional) */
  jobtitle?: string;

  /** Manager person ID (optional) */
  manager?: string;

  /** Crew ID (optional) */
  crewid?: string;

  /** Craft (optional) */
  craft?: string;

  /** Skill level (optional) */
  skilllevel?: string;

  /** Comments (optional) */
  comments?: string;
}

/**
 * Person search parameters
 */
export interface PersonSearch {
  /** Status filter (optional) */
  status?: PersonStatus | PersonStatus[];

  /** Display name search (optional) */
  displayname?: string;

  /** Site identifier filter (optional) */
  siteid?: string;

  /** Department filter (optional) */
  department?: string;

  /** Craft filter (optional) */
  craft?: string;

  /** Crew ID filter (optional) */
  crewid?: string;

  /** Page size (optional) */
  pageSize?: number;

  /** Page number (optional) */
  pageNum?: number;
}

/**
 * Labor transaction creation data
 */
export interface LaborTransactionCreate {
  /** Labor code (required) */
  laborcode: string;

  /** Reference work order (optional) */
  refwo?: string;

  /** Transaction date (required, ISO 8601 format) */
  transdate: string;

  /** Regular hours (optional) */
  regularhrs?: number;

  /** Overtime hours (optional) */
  overtimehrs?: number;

  /** Double time hours (optional) */
  doublehrs?: number;

  /** Transaction type (optional) */
  transtype?: LaborTransactionType;

  /** Start date/time (optional, ISO 8601 format) */
  startdate?: string;

  /** Finish date/time (optional, ISO 8601 format) */
  finishdate?: string;

  /** Pay rate (optional) */
  payrate?: number;

  /** Comments (optional) */
  comments?: string;
}

/**
 * Labor transaction search parameters
 */
export interface LaborTransactionSearch {
  /** Labor code filter (optional) */
  laborcode?: string;

  /** Reference work order filter (optional) */
  refwo?: string;

  /** Date range start (optional, ISO 8601 format) */
  dateFrom?: string;

  /** Date range end (optional, ISO 8601 format) */
  dateTo?: string;

  /** Transaction type filter (optional) */
  transtype?: LaborTransactionType;

  /** Page size (optional) */
  pageSize?: number;

  /** Page number (optional) */
  pageNum?: number;
}

/**
 * Person list response
 */
export interface PersonListResponse {
  /** List of persons */
  member: Person[];

  /** Total count */
  totalCount?: number;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * Labor transaction list response
 */
export interface LaborTransactionListResponse {
  /** List of labor transactions */
  member: LaborTransaction[];

  /** Total count */
  totalCount?: number;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * Person operation result
 */
export interface PersonOperationResult {
  /** Success flag */
  success: boolean;

  /** Person ID */
  personid?: string;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Labor transaction operation result
 */
export interface LaborTransactionOperationResult {
  /** Success flag */
  success: boolean;

  /** Transaction ID */
  labtransid?: number;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Skill level values for person craft rate
 */
export type SkillLevel = 'APPRENTICE' | 'SEMISKILLED' | 'SKILLED' | 'EXPERT';

/**
 * Person craft rate (child object of person)
 */
export interface PersonCraftRate {
  /** Craft code */
  craft: string;

  /** Skill level */
  skilllevel: string;

  /** Pay rate */
  rate?: number;

  /** Standard rate */
  standardrate?: number;
}

/**
 * Parameters for adding a craft to a person
 */
export interface AddCraftParams {
  /** Person ID */
  personid: string;

  /** Craft code */
  craft: string;

  /** Skill level */
  skilllevel: SkillLevel;

  /** Pay rate (optional) */
  rate?: number;
}

/**
 * Labor crew interface
 */
export interface LaborCrew {
  /** Labor crew ID */
  laborcrewid: string;

  /** Crew description */
  description?: string;

  /** Crew type */
  crewtype?: string;

  /** Calendar name */
  calnum?: string;

  /** Organization ID */
  orgid?: string;

  /** Site ID */
  siteid?: string;
}

/**
 * Labor crew list response
 */
export interface LaborCrewListResponse {
  /** List of labor crews */
  member: LaborCrew[];

  /** Total count */
  totalCount?: number;
}

/**
 * Labor crew member (labor assigned to a crew)
 */
export interface LaborCrewMember {
  /** Labor code */
  laborcode?: string;

  /** Craft */
  craft?: string;

  /** Skill level */
  skilllevel?: string;

  /** Position */
  position?: string;

  /** Effective date */
  effectivedate?: string;

  /** End date */
  enddate?: string;
}

/**
 * Labor crew tool (tool assigned to a crew)
 */
export interface LaborCrewTool {
  /** Item number */
  itemnum?: string;

  /** Description */
  description?: string;

  /** Quantity */
  quantity?: number;
}

/**
 * Labor crew members response (includes both labor and tools)
 */
export interface LaborCrewMembersResponse {
  /** Crew info */
  laborcrewid: string;

  /** Crew description */
  description?: string;

  /** Labor members */
  laborcrewlabor: LaborCrewMember[];

  /** Tool assignments */
  laborcrewtool: LaborCrewTool[];
}

/**
 * Labor availability result
 */
export interface LaborAvailability {
  /** Person ID */
  personid: string;

  /** Total capacity hours in the date range */
  totalCapacityHours: number;

  /** Total assigned hours from work orders */
  assignedHours: number;

  /** Available hours (capacity - assigned) */
  availableHours: number;

  /** Utilization percentage */
  utilizationPercent: number;
}

/**
 * Labor cost summary result
 */
export interface LaborCostSummary {
  /** Person ID */
  personid: string;

  /** Total hours worked */
  totalHours: number;

  /** Total cost */
  totalCost: number;

  /** Number of transactions */
  transactionCount: number;

  /** Date range start (if provided) */
  startDate?: string;

  /** Date range end (if provided) */
  endDate?: string;
}
