/**
 * Validation schemas for Analytics Module
 * Uses Zod for runtime validation of analytics query parameters
 */

import { z } from 'zod';

/**
 * ISO 8601 date string schema
 */
const isoDateSchema = z.string().refine(
  (date) => {
    try {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  },
  { message: 'Invalid ISO 8601 date format' }
);

/**
 * Date range schema for analytics filtering
 */
export const dateRangeSchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

/**
 * Work order summary query schema
 */
export const workOrderSummarySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  dateRange: dateRangeSchema.optional(),
});

/**
 * Asset health summary query schema
 */
export const assetHealthSchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Inventory summary query schema
 */
export const inventorySummarySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * PM compliance query schema
 */
export const pmComplianceSchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  dateRange: dateRangeSchema.optional(),
});

/**
 * Dashboard query schema
 */
export const dashboardSchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  dateRange: dateRangeSchema.optional(),
});

/**
 * Overdue work orders query schema
 */
export const overdueWorkOrdersSchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  pageSize: z.number().int().min(1).max(1000).optional(),
});

/**
 * Top downtime assets query schema
 */
export const topDowntimeAssetsSchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  limit: z.number().int().min(1).max(100).optional(),
});

/**
 * Type exports for Zod inferred types
 */
export type WorkOrderSummaryInput = z.infer<typeof workOrderSummarySchema>;
export type AssetHealthInput = z.infer<typeof assetHealthSchema>;
export type InventorySummaryInput = z.infer<typeof inventorySummarySchema>;
export type PMComplianceInput = z.infer<typeof pmComplianceSchema>;
export type DashboardInput = z.infer<typeof dashboardSchema>;
export type OverdueWorkOrdersInput = z.infer<typeof overdueWorkOrdersSchema>;
export type TopDowntimeAssetsInput = z.infer<typeof topDowntimeAssetsSchema>;
