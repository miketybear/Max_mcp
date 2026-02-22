/**
 * Location Module Types
 * 
 * Type definitions for Maximo location management operations.
 * Locations represent physical or logical places where assets are installed,
 * work is performed, or inventory is stored.
 */

/**
 * Location status values
 */
export type LocationStatus = 'OPERATING' | 'NOT READY' | 'DECOMMISSIONED';

/**
 * Location type values
 */
export type LocationType = 
  | 'OPERATING'    // Standard operating location
  | 'STOREROOM'    // Inventory storage location
  | 'VENDOR'       // Vendor location
  | 'COURIER'      // Courier location
  | 'LABOR'        // Labor location
  | 'HOLDING'      // Temporary holding location
  | 'REPAIR'       // Repair facility
  | 'FLEET'        // Fleet location
  | 'WAREHOUSE';   // Warehouse location

/**
 * Complete location object from Maximo
 */
export interface Location {
  /** Location code (primary key) */
  location: string;
  
  /** Location description */
  description: string;
  
  /** Current status */
  status: LocationStatus;
  
  /** Date when status was last changed (ISO 8601) */
  statusdate: string;
  
  /** Location type */
  type: LocationType;
  
  /** Site identifier */
  siteid: string;
  
  /** Organization identifier */
  orgid: string;
  
  /** Parent location code for hierarchy */
  parent?: string;
  
  /** Priority level (1-5, where 1 is highest) */
  priority?: number;
  
  /** General ledger account */
  glaccount?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** System identifier */
  systemid?: string;
  
  /** Operating location code */
  locoper?: string;
  
  /** Whether location is disabled */
  disabled?: boolean;
  
  /** User who last changed the location */
  changeby?: string;
  
  /** Date of last change (ISO 8601) */
  changedate?: string;
  
  /** Location hierarchy level */
  hierarchylevel?: number;
  
  /** Whether location has children */
  haschildren?: boolean;
  
  /** Location classification */
  classstructureid?: string;
  
  /** Latitude coordinate */
  latitude?: number;
  
  /** Longitude coordinate */
  longitude?: number;
  
  /** Address line 1 */
  addressline1?: string;
  
  /** Address line 2 */
  addressline2?: string;
  
  /** City */
  city?: string;
  
  /** State or province */
  stateprovince?: string;
  
  /** Postal code */
  postalcode?: string;
  
  /** Country */
  country?: string;
}

/**
 * Required fields for creating a new location
 */
export interface LocationCreate {
  /** Location code (must be unique within site) */
  location: string;
  
  /** Location description */
  description: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Location type */
  type: LocationType;
  
  /** Organization identifier (defaults to site's org if not provided) */
  orgid?: string;
  
  /** Initial status (defaults to OPERATING) */
  status?: LocationStatus;
  
  /** Parent location code */
  parent?: string;
  
  /** Priority level (1-5) */
  priority?: number;
  
  /** General ledger account */
  glaccount?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** System identifier */
  systemid?: string;
  
  /** Operating location code */
  locoper?: string;
  
  /** Location classification */
  classstructureid?: string;
  
  /** Latitude coordinate */
  latitude?: number;
  
  /** Longitude coordinate */
  longitude?: number;
  
  /** Address line 1 */
  addressline1?: string;
  
  /** Address line 2 */
  addressline2?: string;
  
  /** City */
  city?: string;
  
  /** State or province */
  stateprovince?: string;
  
  /** Postal code */
  postalcode?: string;
  
  /** Country */
  country?: string;
}

/**
 * Fields that can be updated on an existing location
 */
export interface LocationUpdate {
  /** Location description */
  description?: string;
  
  /** Location status */
  status?: LocationStatus;
  
  /** Location type */
  type?: LocationType;
  
  /** Parent location code */
  parent?: string;
  
  /** Priority level (1-5) */
  priority?: number;
  
  /** General ledger account */
  glaccount?: string;
  
  /** Failure code */
  failurecode?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** System identifier */
  systemid?: string;
  
  /** Operating location code */
  locoper?: string;
  
  /** Whether location is disabled */
  disabled?: boolean;
  
  /** Location classification */
  classstructureid?: string;
  
  /** Latitude coordinate */
  latitude?: number;
  
  /** Longitude coordinate */
  longitude?: number;
  
  /** Address line 1 */
  addressline1?: string;
  
  /** Address line 2 */
  addressline2?: string;
  
  /** City */
  city?: string;
  
  /** State or province */
  stateprovince?: string;
  
  /** Postal code */
  postalcode?: string;
  
  /** Country */
  country?: string;
}

/**
 * Search criteria for finding locations
 */
export interface LocationSearch {
  /** Filter by status */
  status?: LocationStatus;
  
  /** Filter by type */
  type?: LocationType;
  
  /** Filter by parent location */
  parent?: string;
  
  /** Filter by system ID */
  systemid?: string;
  
  /** Filter by site ID */
  siteid?: string;
  
  /** Search in description (partial match) */
  description?: string;
  
  /** Filter by disabled status */
  disabled?: boolean;
  
  /** Filter by classification */
  classstructureid?: string;
  
  /** Maximum number of results to return */
  pageSize?: number;
  
  /** Fields to include in response */
  select?: string[];
  
  /** Sort order (e.g., 'location', '-description') */
  orderBy?: string;
}

/**
 * Location hierarchy information
 */
export interface LocationHierarchy {
  /** The location itself */
  location: Location;
  
  /** Parent location (if exists) */
  parent?: Location;
  
  /** Child locations */
  children: Location[];
  
  /** Hierarchy level (0 = top level) */
  level: number;
  
  /** Full hierarchy path (e.g., 'SITE/BUILDING/FLOOR/ROOM') */
  path: string;
}

/**
 * Paginated location search results
 */
export interface LocationSearchResult {
  /** Array of locations matching search criteria */
  locations: Location[];
  
  /** Total number of matching locations */
  totalCount: number;
  
  /** Number of locations returned in this response */
  pageSize: number;
  
  /** Whether there are more results available */
  hasMore: boolean;
}

/**
 * Location deletion result
 */
export interface LocationDeleteResult {
  /** Whether deletion was successful */
  success: boolean;
  
  /** Location code that was deleted */
  location: string;
  
  /** Site ID */
  siteid: string;
  
  /** Deletion timestamp (ISO 8601) */
  deletedAt: string;
}