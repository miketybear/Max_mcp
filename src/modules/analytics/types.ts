/**
 * Type definitions for Analytics Module
 * Defines interfaces for reporting, KPIs, and dashboard summaries
 */

/**
 * Date range filter for analytics queries
 */
export interface DateRange {
  /** Start date in ISO 8601 format */
  startDate: string;

  /** End date in ISO 8601 format */
  endDate: string;
}

/**
 * Count of work orders by status
 */
export interface WorkOrderStatusCount {
  /** Work order status code */
  status: string;

  /** Number of work orders in this status */
  count: number;
}

/**
 * Work order summary with counts grouped by status
 */
export interface WorkOrderSummary {
  /** Site identifier */
  siteid: string;

  /** Total work orders found */
  totalWorkOrders: number;

  /** Work order counts by status */
  byStatus: WorkOrderStatusCount[];

  /** Date range used for the query (if provided) */
  dateRange?: DateRange;

  /** Timestamp when the summary was generated */
  generatedAt: string;
}

/**
 * Asset health summary with status distribution and attention indicators
 */
export interface AssetHealthSummary {
  /** Site identifier */
  siteid: string;

  /** Total number of assets */
  totalAssets: number;

  /** Assets currently in OPERATING status */
  operatingCount: number;

  /** Assets in NOT READY status */
  notReadyCount: number;

  /** Assets that have been decommissioned */
  decommissionedCount: number;

  /** Assets with downtime flag set to true */
  assetsWithDowntime: number;

  /** Timestamp when the summary was generated */
  generatedAt: string;
}

/**
 * Inventory turnover and stock-level summary
 */
export interface InventoryTurnoverSummary {
  /** Site identifier */
  siteid: string;

  /** Total inventory item records */
  totalItems: number;

  /** Items where current balance is at or below the reorder point */
  itemsBelowReorder: number;

  /** Items where current balance is zero */
  itemsOutOfStock: number;

  /** Timestamp when the summary was generated */
  generatedAt: string;
}

/**
 * Preventive maintenance compliance summary
 */
export interface PMComplianceSummary {
  /** Site identifier */
  siteid: string;

  /** Total PM records */
  totalPMs: number;

  /** PMs that are on schedule (nextdate >= today) */
  onSchedule: number;

  /** PMs that are overdue (nextdate < today and PM is active) */
  overdue: number;

  /** Compliance rate as a percentage (0-100) */
  complianceRate: number;

  /** Date range used for the query (if provided) */
  dateRange?: DateRange;

  /** Timestamp when the summary was generated */
  generatedAt: string;
}

/**
 * Combined KPI dashboard aggregating all analytics summaries
 */
export interface KPIDashboard {
  /** Site identifier */
  siteid: string;

  /** Work order summary */
  workOrders: WorkOrderSummary;

  /** Asset health summary */
  assetHealth: AssetHealthSummary;

  /** Inventory summary */
  inventory: InventoryTurnoverSummary;

  /** PM compliance summary */
  pmCompliance: PMComplianceSummary;

  /** Timestamp when the dashboard was generated */
  generatedAt: string;
}

/**
 * Overdue work order record returned from the overdue query
 */
export interface OverdueWorkOrder {
  /** Work order number */
  wonum: string;

  /** Work order description */
  description: string;

  /** Current status */
  status: string;

  /** Target start date */
  targstartdate: string;

  /** Target completion date */
  targcompdate?: string;

  /** Priority */
  priority?: number;

  /** Asset number */
  assetnum?: string;

  /** Location */
  location?: string;

  /** Owner */
  owner?: string;

  /** Site identifier */
  siteid: string;
}

/**
 * Response for overdue work orders query
 */
export interface OverdueWorkOrdersResponse {
  /** Site identifier */
  siteid: string;

  /** List of overdue work orders */
  overdueWorkOrders: OverdueWorkOrder[];

  /** Total count of overdue work orders */
  totalOverdue: number;

  /** Timestamp when the query was executed */
  generatedAt: string;
}

/**
 * Asset with downtime information
 */
export interface DowntimeAsset {
  /** Asset number */
  assetnum: string;

  /** Asset description */
  description: string;

  /** Asset status */
  status: string;

  /** Total downtime hours */
  totaldowntime?: number;

  /** Location */
  location?: string;

  /** Site identifier */
  siteid: string;
}

/**
 * Response for top downtime assets query
 */
export interface TopDowntimeAssetsResponse {
  /** Site identifier */
  siteid: string;

  /** List of assets sorted by downtime hours descending */
  assets: DowntimeAsset[];

  /** Number of assets returned */
  count: number;

  /** Timestamp when the query was executed */
  generatedAt: string;
}
