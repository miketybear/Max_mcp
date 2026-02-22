/**
 * Analytics Module
 * Main entry point for reporting, KPI queries, and dashboard aggregation
 */

// Export all types
export type {
  DateRange,
  WorkOrderStatusCount,
  WorkOrderSummary,
  AssetHealthSummary,
  InventoryTurnoverSummary,
  PMComplianceSummary,
  KPIDashboard,
  OverdueWorkOrder,
  OverdueWorkOrdersResponse,
  DowntimeAsset,
  TopDowntimeAssetsResponse,
} from './types';

// Export operations class
export { AnalyticsOperations } from './operations';

// Export tool creation function
export { createAnalyticsTools } from './tools';

// Export validators
export {
  dateRangeSchema,
  workOrderSummarySchema,
  assetHealthSchema,
  inventorySummarySchema,
  pmComplianceSchema,
  dashboardSchema,
  overdueWorkOrdersSchema,
  topDowntimeAssetsSchema,
} from './validators';

// Export validator input types
export type {
  WorkOrderSummaryInput,
  AssetHealthInput,
  InventorySummaryInput,
  PMComplianceInput,
  DashboardInput,
  OverdueWorkOrdersInput,
  TopDowntimeAssetsInput,
} from './validators';
