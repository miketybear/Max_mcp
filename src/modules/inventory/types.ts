/**
 * Type definitions for Inventory Module
 * Defines interfaces and types for inventory and material management in Maximo
 */

/**
 * Item type values
 */
export type ItemType = 'ITEM' | 'TOOL' | 'SERVICE' | 'SPECIAL';

/**
 * Item status values
 */
export type ItemStatus = 'ACTIVE' | 'PENDING' | 'PENDOBS' | 'OBSOLETE';

/**
 * Lot type values
 */
export type LotType = 'LOT' | 'NOLOT';

/**
 * Transaction type values
 */
export type TransactionType = 'ISSUE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT' | 'RECEIPT' | 'VOIDRECEIPT' | 'VOIDISSUE';

/**
 * Complete inventory item interface with all Maximo fields
 */
export interface InventoryItem {
  /** Item number (unique identifier) */
  itemnum: string;
  
  /** Item description */
  description: string;
  
  /** Item type */
  itemtype: ItemType;
  
  /** Current status */
  status: ItemStatus;
  
  /** Site identifier */
  siteid: string;
  
  /** Organization identifier */
  orgid: string;
  
  /** Order unit of measure */
  orderunit: string;
  
  /** Issue unit of measure */
  issueunit: string;
  
  /** Average cost */
  avgcost?: number;
  
  /** Standard cost */
  stdcost?: number;
  
  /** Last cost */
  lastcost?: number;
  
  /** Lot type */
  lottype?: LotType;
  
  /** Rotating item flag */
  rotating?: boolean;
  
  /** Condition enabled flag */
  conditionenabled?: boolean;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Model number */
  modelnum?: string;
  
  /** Commodity group */
  commoditygroup?: string;
  
  /** Commodity code */
  commodity?: string;
  
  /** Item set ID */
  itemsetid?: string;
  
  /** GL account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Conversion factor */
  conversion?: number;
  
  /** Issue type */
  issuetype?: string;
  
  /** Capitalized flag */
  capitalized?: boolean;
  
  /** Prorated flag */
  prorated?: boolean;
  
  /** Tax exempt flag */
  taxexempt?: boolean;
  
  /** Inspection required flag */
  inspectionrequired?: boolean;
  
  /** Vendor */
  vendor?: string;
  
  /** Catalog code */
  catalogcode?: string;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Changed by person */
  changeby?: string;
  
  /** Item href (OSLC link) */
  href?: string;
}

/**
 * Inventory balance interface (inventory in storeroom)
 */
export interface Inventory {
  /** Item number */
  itemnum: string;
  
  /** Storeroom location */
  location: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Current balance */
  curbal: number;
  
  /** Physical count */
  physcnt: number;
  
  /** Average cost */
  avgcost: number;
  
  /** Standard cost */
  stdcost: number;
  
  /** Last cost */
  lastcost?: number;
  
  /** Reorder flag */
  reorder: boolean;
  
  /** Reorder point */
  reorderpoint?: number;
  
  /** Reorder quantity */
  reorderqty?: number;
  
  /** Maximum level */
  maxlevel?: number;
  
  /** Minimum level */
  minlevel?: number;
  
  /** Economic order quantity */
  economic?: number;
  
  /** ABC type */
  abctype?: string;
  
  /** Issue year-to-date */
  issueytd?: number;
  
  /** Issue unit */
  issueunit?: string;
  
  /** Order unit */
  orderunit?: string;
  
  /** Conversion factor */
  conversion?: number;
  
  /** GL account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Controlled flag */
  controlled?: boolean;
  
  /** Change date (ISO 8601 format) */
  changedate?: string;
  
  /** Changed by person */
  changeby?: string;
  
  /** Inventory href (OSLC link) */
  href?: string;
}

/**
 * Item creation interface (required fields)
 */
export interface ItemCreate {
  /** Item number (required) */
  itemnum: string;
  
  /** Item description (required) */
  description: string;
  
  /** Item type (required) */
  itemtype: ItemType;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Organization identifier (optional, defaults to site's org) */
  orgid?: string;
  
  /** Status (defaults to ACTIVE) */
  status?: ItemStatus;
  
  /** Order unit of measure */
  orderunit?: string;
  
  /** Issue unit of measure */
  issueunit?: string;
  
  /** Average cost */
  avgcost?: number;
  
  /** Standard cost */
  stdcost?: number;
  
  /** Last cost */
  lastcost?: number;
  
  /** Lot type */
  lottype?: LotType;
  
  /** Rotating item flag */
  rotating?: boolean;
  
  /** Condition enabled flag */
  conditionenabled?: boolean;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Model number */
  modelnum?: string;
  
  /** Commodity group */
  commoditygroup?: string;
  
  /** Commodity code */
  commodity?: string;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Conversion factor */
  conversion?: number;
  
  /** Issue type */
  issuetype?: string;
  
  /** Capitalized flag */
  capitalized?: boolean;
  
  /** Tax exempt flag */
  taxexempt?: boolean;
  
  /** Inspection required flag */
  inspectionrequired?: boolean;
  
  /** Vendor */
  vendor?: string;
  
  /** Catalog code */
  catalogcode?: string;
}

/**
 * Inventory search criteria
 */
export interface InventorySearch {
  /** Filter by item type */
  itemtype?: ItemType | ItemType[];
  
  /** Filter by status */
  status?: ItemStatus | ItemStatus[];
  
  /** Filter by commodity group */
  commoditygroup?: string;
  
  /** Filter by manufacturer */
  manufacturer?: string;
  
  /** Filter by description (partial match) */
  description?: string;
  
  /** Filter by storeroom location */
  location?: string;
  
  /** Filter by site */
  siteid?: string;
  
  /** Filter by organization */
  orgid?: string;
  
  /** Filter by rotating items */
  rotating?: boolean;
  
  /** Filter by condition enabled */
  conditionenabled?: boolean;
  
  /** Filter by vendor */
  vendor?: string;
  
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
 * Issue transaction interface
 */
export interface IssueTransaction {
  /** Item number (required) */
  itemnum: string;
  
  /** Storeroom location (required) */
  location: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Quantity to issue (required) */
  quantity: number;
  
  /** Work order number */
  wonum?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Transaction date (ISO 8601 format, defaults to now) */
  transdate?: string;
  
  /** Memo/remarks */
  memo?: string;
  
  /** Issue type */
  issuetype?: string;
  
  /** Task ID */
  taskid?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Unit cost */
  unitcost?: number;
  
  /** Conversion factor */
  conversion?: number;
  
  /** Issue unit */
  issueunit?: string;
  
  /** Entered by */
  enterby?: string;
}

/**
 * Return transaction interface
 */
export interface ReturnTransaction {
  /** Item number (required) */
  itemnum: string;
  
  /** Storeroom location (required) */
  location: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Quantity to return (required) */
  quantity: number;
  
  /** Work order number */
  wonum?: string;
  
  /** Rotating asset number */
  rotassetnum?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Transaction date (ISO 8601 format, defaults to now) */
  transdate?: string;
  
  /** Memo/remarks */
  memo?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Unit cost */
  unitcost?: number;
  
  /** Conversion factor */
  conversion?: number;
  
  /** Issue unit */
  issueunit?: string;
  
  /** Entered by */
  enterby?: string;
  
  /** Condition code (for condition-enabled items) */
  conditioncode?: string;
}

/**
 * Transfer transaction interface
 */
export interface TransferTransaction {
  /** Item number (required) */
  itemnum: string;
  
  /** From storeroom location (required) */
  fromstoreloc: string;
  
  /** To storeroom location (required) */
  tostoreloc: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Quantity to transfer (required) */
  quantity: number;
  
  /** From bin number */
  frombinnum?: string;
  
  /** To bin number */
  tobinnum?: string;
  
  /** From lot number */
  fromlotnum?: string;
  
  /** To lot number */
  tolotnum?: string;
  
  /** Transaction date (ISO 8601 format, defaults to now) */
  transdate?: string;
  
  /** Memo/remarks */
  memo?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Unit cost */
  unitcost?: number;
  
  /** Entered by */
  enterby?: string;
}

/**
 * Adjustment transaction interface
 */
export interface AdjustmentTransaction {
  /** Item number (required) */
  itemnum: string;
  
  /** Storeroom location (required) */
  location: string;
  
  /** Site identifier (required) */
  siteid: string;
  
  /** Physical count (required) */
  physcnt: number;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Transaction date (ISO 8601 format, defaults to now) */
  transdate?: string;
  
  /** Reason/memo (required for adjustments) */
  reason?: string;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Entered by */
  enterby?: string;
  
  /** Reconciled flag */
  reconciled?: boolean;
}

/**
 * Inventory transaction history interface
 */
export interface InventoryTransaction {
  /** Transaction ID */
  invtransid?: number;
  
  /** Item number */
  itemnum: string;
  
  /** Storeroom location */
  location: string;
  
  /** Site identifier */
  siteid: string;
  
  /** Transaction type */
  transtype: TransactionType;
  
  /** Quantity */
  quantity: number;
  
  /** Current balance after transaction */
  curbal: number;
  
  /** Physical count */
  physcnt?: number;
  
  /** Transaction date (ISO 8601 format) */
  transdate: string;
  
  /** Work order number */
  wonum?: string;
  
  /** Asset number */
  assetnum?: string;
  
  /** Bin number */
  binnum?: string;
  
  /** Lot number */
  lotnum?: string;
  
  /** Line cost */
  linecost?: number;
  
  /** Unit cost */
  unitcost?: number;
  
  /** GL debit account */
  gldebitacct?: string;
  
  /** GL credit account */
  glcreditacct?: string;
  
  /** Memo/remarks */
  memo?: string;
  
  /** Issue type */
  issuetype?: string;
  
  /** Entered by */
  enterby?: string;
  
  /** Enter date (ISO 8601 format) */
  enterdate?: string;
  
  /** From storeroom (for transfers) */
  fromstoreloc?: string;
  
  /** To storeroom (for transfers) */
  tostoreloc?: string;
  
  /** From bin (for transfers) */
  frombinnum?: string;
  
  /** To bin (for transfers) */
  tobinnum?: string;
  
  /** Rotating asset number */
  rotassetnum?: string;
  
  /** Condition code */
  conditioncode?: string;
  
  /** Transaction href (OSLC link) */
  href?: string;
}

/**
 * Inventory list response with pagination
 */
export interface InventoryListResponse {
  /** Array of inventory records */
  inventory: Inventory[];
  
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
 * Item list response with pagination
 */
export interface ItemListResponse {
  /** Array of items */
  items: InventoryItem[];
  
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
 * Transaction list response with pagination
 */
export interface TransactionListResponse {
  /** Array of transactions */
  transactions: InventoryTransaction[];
  
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
 * Update reorder point parameters
 */
export interface UpdateReorderPoint {
  /** Item number (required) */
  itemnum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Storeroom location (required) */
  location: string;

  /** Reorder point */
  reorder?: number;

  /** Minimum level */
  minlevel?: number;

  /** Maximum level */
  maxlevel?: number;

  /** Economic order quantity */
  orderqty?: number;
}

/**
 * Get stock levels parameters
 */
export interface GetStockLevels {
  /** Item number (required) */
  itemnum: string;

  /** Site identifier (optional) */
  siteid?: string;

  /** Include all storerooms (optional, defaults to false) */
  includeAllStorerooms?: boolean;
}

/**
 * Get items below reorder point parameters
 */
export interface GetItemsBelowReorder {
  /** Site identifier (optional) */
  siteid?: string;

  /** Storeroom location filter (optional) */
  location?: string;

  /** Page size (optional) */
  pageSize?: number;
}

/**
 * Stock level record for a single storeroom
 */
export interface StockLevel {
  /** Item number */
  itemnum: string;

  /** Storeroom location */
  location: string;

  /** Current balance */
  curbal: number;

  /** Minimum level */
  minlevel?: number;

  /** Maximum level */
  maxlevel?: number;

  /** Reorder point */
  reorder?: number;

  /** Economic order quantity */
  orderqty?: number;

  /** Issue unit */
  issueunit?: string;
}

/**
 * Stock levels response
 */
export interface StockLevelsResponse {
  /** Item number */
  itemnum: string;

  /** Array of storeroom balances */
  storerooms: StockLevel[];

  /** Total storerooms returned */
  totalCount: number;
}

/**
 * Items below reorder response
 */
export interface ItemsBelowReorderResponse {
  /** Array of items needing reorder */
  items: StockLevel[];

  /** Total count of items below reorder */
  totalCount: number;
}

/**
 * Item operation result
 */
export interface ItemOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Item data (if successful) */
  item?: InventoryItem;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Inventory operation result
 */
export interface InventoryOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Inventory data (if successful) */
  inventory?: Inventory;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}

/**
 * Transaction operation result
 */
export interface TransactionOperationResult {
  /** Success flag */
  success: boolean;
  
  /** Transaction data (if successful) */
  transaction?: InventoryTransaction;
  
  /** Transaction ID */
  transactionId?: number;
  
  /** New balance after transaction */
  newBalance?: number;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code (if failed) */
  errorCode?: string;
}