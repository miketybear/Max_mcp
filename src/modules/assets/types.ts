/**
 * Type definitions for Asset Module
 * Defines interfaces and types for asset management in Maximo
 */

/**
 * Asset status values
 */
export type AssetStatus = 'OPERATING' | 'NOT READY' | 'DECOMMISSIONED' | 'MISSING' | 'SEALED';

/**
 * Asset type values
 */
export type AssetType = 'IT' | 'PRODUCTION' | 'FACILITIES' | 'TRANSPORTATION' | 'INFRASTRUCTURE';

/**
 * Complete asset interface with all Maximo fields
 */
export interface Asset {
  /** Asset number (unique identifier) */
  assetnum: string;
  
  /** Asset description */
  description: string;
  
  /** Current status */
  status: AssetStatus;
  
  /** Status change date (ISO 8601 format) */
  statusdate: string;
  
  /** Asset type */
  assettype: AssetType;
  
  /** Location code */
  location?: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Organization identifier */
  orgid: string;
  
  /** Parent asset for hierarchy */
  parent?: string;
  
  /** Priority (1-5, where 1 is highest) */
  priority?: number;
  
  /** Serial number */
  serialnum?: string;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Vendor */
  vendor?: string;
  
  /** Model */
  model?: string;
  
  /** Purchase price */
  purchaseprice?: number;
  
  /** Purchase date (ISO 8601 format) */
  purchasedate?: string;
  
  /** Installation date (ISO 8601 format) */
  installdate?: string;
  
  /** Warranty expiration date (ISO 8601 format) */
  warrantyexpdate?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** Year-to-date cost */
  ytdcost?: number;
  
  /** Total cost */
  totalcost?: number;
  
  /** Total downtime in hours */
  totdowntime?: number;
  
  /** Failure code */
  failurecode?: string;
  
  /** Is running flag */
  isrunning?: boolean;
  
  /** Moved flag */
  moved?: boolean;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Changed by person */
  changeby?: string;
  
  /** Asset UID (unique ID) */
  assetuid?: number;
  
  /** Asset specification class */
  classstructureid?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Item number */
  itemnum?: string;
  
  /** Item set ID */
  itemsetid?: string;
  
  /** Rotating item flag */
  isrotating?: boolean;
  
  /** Budgeted cost */
  budgetcost?: number;
  
  /** Ownership code */
  ownership?: string;
  
  /** Lease/rent flag */
  lease?: boolean;
  
  /** Lease expiration date (ISO 8601 format) */
  leaseexpdate?: string;
  
  /** Lease cost */
  leasecost?: number;
  
  /** Lease contract number */
  leasecontractnum?: string;
  
  /** Lease vendor */
  leasevendor?: string;
  
  /** Capitalized flag */
  capitalized?: boolean;
  
  /** Capitalized date (ISO 8601 format) */
  capitalizeddate?: string;
  
  /** Depreciation code */
  depreciationcode?: string;
  
  /** Salvage value */
  salvagevalue?: number;
  
  /** Expected life in years */
  expectedlife?: number;
  
  /** Remaining life in years */
  remaininglife?: number;
  
  /** Asset href (OSLC link) */
  href?: string;
}

/**
 * Asset creation interface (required fields)
 */
export interface AssetCreate {
  /** Asset number (required) */
  assetnum: string;
  
  /** Asset description (required) */
  description: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Asset type (required) */
  assettype: AssetType;
  
  /** Organization identifier (optional, defaults to site's org) */
  orgid?: string;
  
  /** Location code */
  location?: string;
  
  /** Status (defaults to OPERATING) */
  status?: AssetStatus;
  
  /** Parent asset for hierarchy */
  parent?: string;
  
  /** Priority (1-5) */
  priority?: number;
  
  /** Serial number */
  serialnum?: string;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Vendor */
  vendor?: string;
  
  /** Model */
  model?: string;
  
  /** Purchase price */
  purchaseprice?: number;
  
  /** Purchase date (ISO 8601 format) */
  purchasedate?: string;
  
  /** Installation date (ISO 8601 format) */
  installdate?: string;
  
  /** Warranty expiration date (ISO 8601 format) */
  warrantyexpdate?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** Failure code */
  failurecode?: string;
  
  /** Asset specification class */
  classstructureid?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Item number */
  itemnum?: string;
  
  /** Rotating item flag */
  isrotating?: boolean;
  
  /** Budgeted cost */
  budgetcost?: number;
  
  /** Ownership code */
  ownership?: string;
  
  /** Lease/rent flag */
  lease?: boolean;
  
  /** Lease expiration date (ISO 8601 format) */
  leaseexpdate?: string;
  
  /** Lease cost */
  leasecost?: number;
  
  /** Lease contract number */
  leasecontractnum?: string;
  
  /** Lease vendor */
  leasevendor?: string;
  
  /** Capitalized flag */
  capitalized?: boolean;
  
  /** Depreciation code */
  depreciationcode?: string;
  
  /** Salvage value */
  salvagevalue?: number;
  
  /** Expected life in years */
  expectedlife?: number;
}

/**
 * Asset update interface (partial update fields)
 */
export interface AssetUpdate {
  /** Asset description */
  description?: string;
  
  /** Asset status */
  status?: AssetStatus;
  
  /** Location code */
  location?: string;
  
  /** Priority (1-5) */
  priority?: number;
  
  /** Serial number */
  serialnum?: string;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Vendor */
  vendor?: string;
  
  /** Model */
  model?: string;
  
  /** Purchase price */
  purchaseprice?: number;
  
  /** Purchase date (ISO 8601 format) */
  purchasedate?: string;
  
  /** Installation date (ISO 8601 format) */
  installdate?: string;
  
  /** Warranty expiration date (ISO 8601 format) */
  warrantyexpdate?: string;
  
  /** Replacement cost */
  replacecost?: number;
  
  /** Failure code */
  failurecode?: string;
  
  /** Is running flag */
  isrunning?: boolean;
  
  /** Asset specification class */
  classstructureid?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Item number */
  itemnum?: string;
  
  /** Budgeted cost */
  budgetcost?: number;
  
  /** Ownership code */
  ownership?: string;
  
  /** Lease/rent flag */
  lease?: boolean;
  
  /** Lease expiration date (ISO 8601 format) */
  leaseexpdate?: string;
  
  /** Lease cost */
  leasecost?: number;
  
  /** Lease contract number */
  leasecontractnum?: string;
  
  /** Lease vendor */
  leasevendor?: string;
  
  /** Capitalized flag */
  capitalized?: boolean;
  
  /** Depreciation code */
  depreciationcode?: string;
  
  /** Salvage value */
  salvagevalue?: number;
  
  /** Expected life in years */
  expectedlife?: number;
  
  /** Remaining life in years */
  remaininglife?: number;
}

/**
 * Asset search criteria
 */
export interface AssetSearch {
  /** Filter by status */
  status?: AssetStatus | AssetStatus[];
  
  /** Filter by asset type */
  assettype?: AssetType | AssetType[];
  
  /** Filter by location */
  location?: string;
  
  /** Filter by parent asset */
  parent?: string;
  
  /** Filter by manufacturer */
  manufacturer?: string;
  
  /** Filter by serial number */
  serialnum?: string;
  
  /** Filter by site */
  siteid?: string;
  
  /** Filter by organization */
  orgid?: string;
  
  /** Filter by priority */
  priority?: number;
  
  /** Filter by failure code */
  failurecode?: string;
  
  /** Filter by running status */
  isrunning?: boolean;
  
  /** Date range filter */
  dateRange?: {
    /** Start date (ISO 8601 format) */
    start: string;
    /** End date (ISO 8601 format) */
    end: string;
    /** Date field to filter on */
    field?: 'purchasedate' | 'installdate' | 'warrantyexpdate' | 'statusdate' | 'changedate';
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
 * Asset move interface
 */
export interface AssetMove {
  /** New location code */
  newLocation: string;
  
  /** Move date (ISO 8601 format, defaults to now) */
  moveDate?: string;
  
  /** Move memo/reason */
  memo?: string;
  
  /** New bin number (if applicable) */
  newBinnum?: string;
  
  /** New lot number (if applicable) */
  newLotnum?: string;
}

/**
 * Meter reading interface
 */
export interface MeterReading {
  /** Meter name */
  metername: string;
  
  /** Reading value */
  reading: number;
  
  /** Reading date (ISO 8601 format) */
  readingdate: string;
  
  /** Inspector/person who took reading */
  inspector?: string;
  
  /** Remarks */
  remarks?: string;
  
  /** New reading flag */
  newreading?: boolean;
  
  /** Rollover flag */
  rollover?: boolean;
}

/**
 * Asset specification interface
 */
export interface AssetSpecification {
  /** Asset attribute ID */
  assetattrid: string;
  
  /** Alphanumeric value */
  alnvalue?: string;
  
  /** Numeric value */
  numvalue?: number;
  
  /** Table value */
  tablevalue?: string;
  
  /** Section */
  section?: string;
  
  /** Measurement unit */
  measureunitid?: string;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Changed by */
  changeby?: string;
}

/**
 * Asset hierarchy interface
 */
export interface AssetHierarchy {
  /** Current asset */
  asset: Asset;
  
  /** Parent asset (if exists) */
  parent?: Asset;
  
  /** Child assets */
  children: Asset[];
  
  /** Hierarchy level */
  level: number;
  
  /** Full hierarchy path */
  path: string[];
}

/**
 * Asset response with pagination
 */
export interface AssetListResponse {
  /** Array of assets */
  assets: Asset[];
  
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
 * Asset operation result
 */
export interface AssetOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Asset data (if successful) */
  asset?: Asset;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Meter reading result
 */
export interface MeterReadingResult {
  /** Success flag */
  success: boolean;
  
  /** Meter reading data (if successful) */
  reading?: MeterReading;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Asset specification result
 */
export interface AssetSpecificationResult {
  /** Success flag */
  success: boolean;

  /** Specification data (if successful) */
  specification?: AssetSpecification;

  /** Error message (if failed) */
  error?: string;

  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Meter history entry from asset meter readings
 */
export interface MeterHistoryEntry {
  /** Meter name */
  metername: string;

  /** Reading value */
  reading: number;

  /** Reading date (ISO 8601 format) */
  readingdate: string;

  /** Previous reading value */
  previousreading?: number;

  /** Previous reading date (ISO 8601 format) */
  previousreadingdate?: string;

  /** Inspector/person who took reading */
  inspector?: string;

  /** Remarks */
  remarks?: string;

  /** Rollover flag */
  rollover?: boolean;

  /** Delta between readings */
  readingdelta?: number;

  /** Asset number */
  assetnum?: string;

  /** Site identifier */
  siteid?: string;

  /** Href for the meter reading resource */
  href?: string;
}

/**
 * Meter history response with pagination
 */
export interface MeterHistoryResponse {
  /** Array of meter history entries */
  readings: MeterHistoryEntry[];

  /** Total count of matching records */
  totalCount: number;

  /** Page size */
  pageSize: number;
}

/**
 * Asset status change parameters
 */
export interface AssetStatusChange {
  /** New status for the asset */
  status: AssetStatus;

  /** Optional memo/reason for the status change */
  memo?: string;
}

/**
 * Downtime history entry
 */
export interface DowntimeEntry {
  /** Start date of the downtime (ISO 8601 format) */
  startdate: string;

  /** End date of the downtime (ISO 8601 format) */
  enddate?: string;

  /** Downtime duration in hours */
  downtime: number;

  /** Downtime code/reason */
  code?: string;

  /** Reported by */
  reportedby?: string;

  /** Status at time of downtime */
  statusatdowntime?: string;

  /** Is running flag at time of report */
  isrunning?: boolean;

  /** Href for the downtime resource */
  href?: string;
}

/**
 * Downtime history response
 */
export interface DowntimeHistoryResponse {
  /** Array of downtime entries */
  downtimeRecords: DowntimeEntry[];

  /** Total count of matching records */
  totalCount: number;

  /** Total downtime hours */
  totalDowntimeHours: number;
}