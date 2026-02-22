/**
 * Analytics Operations
 * Business logic for reporting, KPI queries, and dashboard aggregation.
 * Queries existing Maximo object structures (mxwodetail, mxasset, mxinventory, mxpm)
 * and aggregates the results into analytics summaries.
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, WORK_ORDER_STATUSES } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  DateRange,
  WorkOrderSummary,
  WorkOrderStatusCount,
  AssetHealthSummary,
  InventoryTurnoverSummary,
  PMComplianceSummary,
  KPIDashboard,
  OverdueWorkOrdersResponse,
  OverdueWorkOrder,
  TopDowntimeAssetsResponse,
  DowntimeAsset,
} from './types';

const logger = createLogger('AnalyticsOperations');

/**
 * Analytics Operations class
 * Provides methods for querying Maximo data and computing KPIs
 */
export class AnalyticsOperations {
  private client: MaximoClient;

  /**
   * Create a new AnalyticsOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('AnalyticsOperations initialized');
  }

  /**
   * Get work order summary with counts grouped by status.
   * Queries the mxwodetail object structure and counts work orders per status.
   * @param siteid - Site identifier
   * @param dateRange - Optional date range to filter by statusdate
   * @returns API response with work order summary
   */
  async getWorkOrderSummary(
    siteid: string,
    dateRange?: DateRange
  ): Promise<ApiResponse<WorkOrderSummary>> {
    logger.info('Getting work order summary', { siteid, dateRange });

    try {
      const byStatus: WorkOrderStatusCount[] = [];
      let totalWorkOrders = 0;

      // Query work orders for each status to get counts
      for (const status of WORK_ORDER_STATUSES) {
        const whereClauses: string[] = [
          `siteid="${siteid}"`,
          `status="${status}"`,
        ];

        if (dateRange) {
          whereClauses.push(
            `statusdate>="${dateRange.startDate}" and statusdate<="${dateRange.endDate}"`
          );
        }

        const params: OSLCQueryParams = {
          'oslc.where': whereClauses.join(' and '),
          'oslc.select': 'wonum',
          'oslc.pageSize': 1,
        };

        const response = await this.client.get<{
          member: any[];
          responseInfo?: { totalCount?: number };
        }>(API_ENDPOINTS.WORK_ORDERS, params);

        if (response.success && response.data) {
          const count = response.data.responseInfo?.totalCount ??
            (response.data.member?.length || 0);
          byStatus.push({ status, count });
          totalWorkOrders += count;
        } else {
          byStatus.push({ status, count: 0 });
        }
      }

      const summary: WorkOrderSummary = {
        siteid,
        totalWorkOrders,
        byStatus,
        dateRange,
        generatedAt: new Date().toISOString(),
      };

      logger.info('Work order summary generated', { siteid, totalWorkOrders });

      return {
        success: true,
        data: summary,
        statusCode: 200,
        headers: {},
        requestId: `analytics-wo-summary-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get work order summary', { siteid, error });
      throw error;
    }
  }

  /**
   * Get asset health summary with status distribution.
   * Queries the mxasset object structure and categorizes assets by status.
   * @param siteid - Site identifier
   * @returns API response with asset health summary
   */
  async getAssetHealthSummary(
    siteid: string
  ): Promise<ApiResponse<AssetHealthSummary>> {
    logger.info('Getting asset health summary', { siteid });

    try {
      // Query total assets for the site
      const totalParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}"`,
        'oslc.select': 'assetnum,status,totaldowntime',
        'oslc.pageSize': 1,
      };

      const totalResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, totalParams);

      const totalAssets = totalResponse.success && totalResponse.data
        ? (totalResponse.data.responseInfo?.totalCount ??
          (totalResponse.data.member?.length || 0))
        : 0;

      // Query OPERATING assets
      const operatingParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and status="OPERATING"`,
        'oslc.select': 'assetnum',
        'oslc.pageSize': 1,
      };

      const operatingResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, operatingParams);

      const operatingCount = operatingResponse.success && operatingResponse.data
        ? (operatingResponse.data.responseInfo?.totalCount ??
          (operatingResponse.data.member?.length || 0))
        : 0;

      // Query NOT READY assets
      const notReadyParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and status="NOT READY"`,
        'oslc.select': 'assetnum',
        'oslc.pageSize': 1,
      };

      const notReadyResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, notReadyParams);

      const notReadyCount = notReadyResponse.success && notReadyResponse.data
        ? (notReadyResponse.data.responseInfo?.totalCount ??
          (notReadyResponse.data.member?.length || 0))
        : 0;

      // Query DECOMMISSIONED assets
      const decommParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and status="DECOMMISSIONED"`,
        'oslc.select': 'assetnum',
        'oslc.pageSize': 1,
      };

      const decommResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, decommParams);

      const decommissionedCount = decommResponse.success && decommResponse.data
        ? (decommResponse.data.responseInfo?.totalCount ??
          (decommResponse.data.member?.length || 0))
        : 0;

      // Query assets with downtime flag
      const downtimeParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and totaldowntime>0`,
        'oslc.select': 'assetnum',
        'oslc.pageSize': 1,
      };

      const downtimeResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, downtimeParams);

      const assetsWithDowntime = downtimeResponse.success && downtimeResponse.data
        ? (downtimeResponse.data.responseInfo?.totalCount ??
          (downtimeResponse.data.member?.length || 0))
        : 0;

      const summary: AssetHealthSummary = {
        siteid,
        totalAssets,
        operatingCount,
        notReadyCount,
        decommissionedCount,
        assetsWithDowntime,
        generatedAt: new Date().toISOString(),
      };

      logger.info('Asset health summary generated', { siteid, totalAssets });

      return {
        success: true,
        data: summary,
        statusCode: 200,
        headers: {},
        requestId: `analytics-asset-health-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get asset health summary', { siteid, error });
      throw error;
    }
  }

  /**
   * Get inventory turnover summary with stock-level indicators.
   * Queries the mxinventory object structure for reorder and stock analysis.
   * @param siteid - Site identifier
   * @returns API response with inventory summary
   */
  async getInventorySummary(
    siteid: string
  ): Promise<ApiResponse<InventoryTurnoverSummary>> {
    logger.info('Getting inventory summary', { siteid });

    try {
      // Query total inventory items for the site
      const totalParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}"`,
        'oslc.select': 'itemnum',
        'oslc.pageSize': 1,
      };

      const totalResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.INVENTORY, totalParams);

      const totalItems = totalResponse.success && totalResponse.data
        ? (totalResponse.data.responseInfo?.totalCount ??
          (totalResponse.data.member?.length || 0))
        : 0;

      // Query items below reorder point (curbal <= minlevel and minlevel > 0)
      const belowReorderParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and curbal<=minlevel and minlevel>0`,
        'oslc.select': 'itemnum',
        'oslc.pageSize': 1,
      };

      const belowReorderResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.INVENTORY, belowReorderParams);

      const itemsBelowReorder = belowReorderResponse.success && belowReorderResponse.data
        ? (belowReorderResponse.data.responseInfo?.totalCount ??
          (belowReorderResponse.data.member?.length || 0))
        : 0;

      // Query items that are out of stock (curbal = 0 or curbal < 0)
      const outOfStockParams: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and curbal<=0`,
        'oslc.select': 'itemnum',
        'oslc.pageSize': 1,
      };

      const outOfStockResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.INVENTORY, outOfStockParams);

      const itemsOutOfStock = outOfStockResponse.success && outOfStockResponse.data
        ? (outOfStockResponse.data.responseInfo?.totalCount ??
          (outOfStockResponse.data.member?.length || 0))
        : 0;

      const summary: InventoryTurnoverSummary = {
        siteid,
        totalItems,
        itemsBelowReorder,
        itemsOutOfStock,
        generatedAt: new Date().toISOString(),
      };

      logger.info('Inventory summary generated', { siteid, totalItems });

      return {
        success: true,
        data: summary,
        statusCode: 200,
        headers: {},
        requestId: `analytics-inventory-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get inventory summary', { siteid, error });
      throw error;
    }
  }

  /**
   * Get preventive maintenance compliance summary.
   * Queries the mxpm object structure and compares nextdate to today.
   * @param siteid - Site identifier
   * @param dateRange - Optional date range to filter PMs
   * @returns API response with PM compliance summary
   */
  async getPMCompliance(
    siteid: string,
    dateRange?: DateRange
  ): Promise<ApiResponse<PMComplianceSummary>> {
    logger.info('Getting PM compliance summary', { siteid, dateRange });

    try {
      const today = new Date().toISOString().split('T')[0] + 'T00:00:00';

      // Query total active PMs
      const totalWhere: string[] = [`siteid="${siteid}"`, `status="ACTIVE"`];
      if (dateRange) {
        totalWhere.push(
          `nextdate>="${dateRange.startDate}" and nextdate<="${dateRange.endDate}"`
        );
      }

      const totalParams: OSLCQueryParams = {
        'oslc.where': totalWhere.join(' and '),
        'oslc.select': 'pmnum',
        'oslc.pageSize': 1,
      };

      const totalResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.PM, totalParams);

      const totalPMs = totalResponse.success && totalResponse.data
        ? (totalResponse.data.responseInfo?.totalCount ??
          (totalResponse.data.member?.length || 0))
        : 0;

      // Query overdue PMs (nextdate < today and still active)
      const overdueWhere: string[] = [
        `siteid="${siteid}"`,
        `status="ACTIVE"`,
        `nextdate<"${today}"`,
      ];
      if (dateRange) {
        overdueWhere.push(`nextdate>="${dateRange.startDate}"`);
      }

      const overdueParams: OSLCQueryParams = {
        'oslc.where': overdueWhere.join(' and '),
        'oslc.select': 'pmnum',
        'oslc.pageSize': 1,
      };

      const overdueResponse = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.PM, overdueParams);

      const overdue = overdueResponse.success && overdueResponse.data
        ? (overdueResponse.data.responseInfo?.totalCount ??
          (overdueResponse.data.member?.length || 0))
        : 0;

      const onSchedule = totalPMs - overdue;
      const complianceRate = totalPMs > 0
        ? Math.round((onSchedule / totalPMs) * 10000) / 100
        : 100;

      const summary: PMComplianceSummary = {
        siteid,
        totalPMs,
        onSchedule,
        overdue,
        complianceRate,
        dateRange,
        generatedAt: new Date().toISOString(),
      };

      logger.info('PM compliance summary generated', {
        siteid,
        totalPMs,
        overdue,
        complianceRate,
      });

      return {
        success: true,
        data: summary,
        statusCode: 200,
        headers: {},
        requestId: `analytics-pm-compliance-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get PM compliance summary', { siteid, error });
      throw error;
    }
  }

  /**
   * Get a combined KPI dashboard aggregating all analytics summaries.
   * Calls all individual summary methods and combines the results.
   * @param siteid - Site identifier
   * @param dateRange - Optional date range for time-bound queries
   * @returns API response with combined KPI dashboard
   */
  async getDashboard(
    siteid: string,
    dateRange?: DateRange
  ): Promise<ApiResponse<KPIDashboard>> {
    logger.info('Getting KPI dashboard', { siteid, dateRange });

    try {
      // Execute all summary queries in parallel
      const [woResult, assetResult, inventoryResult, pmResult] = await Promise.all([
        this.getWorkOrderSummary(siteid, dateRange),
        this.getAssetHealthSummary(siteid),
        this.getInventorySummary(siteid),
        this.getPMCompliance(siteid, dateRange),
      ]);

      // Check for failures in any sub-query
      if (!woResult.success || !woResult.data) {
        return {
          success: false,
          error: `Failed to retrieve work order summary: ${woResult.error}`,
          errorCode: 'ANALYTICS_ERROR',
          statusCode: woResult.statusCode,
          headers: {},
          requestId: `analytics-dashboard-${Date.now()}`,
        };
      }

      if (!assetResult.success || !assetResult.data) {
        return {
          success: false,
          error: `Failed to retrieve asset health summary: ${assetResult.error}`,
          errorCode: 'ANALYTICS_ERROR',
          statusCode: assetResult.statusCode,
          headers: {},
          requestId: `analytics-dashboard-${Date.now()}`,
        };
      }

      if (!inventoryResult.success || !inventoryResult.data) {
        return {
          success: false,
          error: `Failed to retrieve inventory summary: ${inventoryResult.error}`,
          errorCode: 'ANALYTICS_ERROR',
          statusCode: inventoryResult.statusCode,
          headers: {},
          requestId: `analytics-dashboard-${Date.now()}`,
        };
      }

      if (!pmResult.success || !pmResult.data) {
        return {
          success: false,
          error: `Failed to retrieve PM compliance summary: ${pmResult.error}`,
          errorCode: 'ANALYTICS_ERROR',
          statusCode: pmResult.statusCode,
          headers: {},
          requestId: `analytics-dashboard-${Date.now()}`,
        };
      }

      const dashboard: KPIDashboard = {
        siteid,
        workOrders: woResult.data,
        assetHealth: assetResult.data,
        inventory: inventoryResult.data,
        pmCompliance: pmResult.data,
        generatedAt: new Date().toISOString(),
      };

      logger.info('KPI dashboard generated', { siteid });

      return {
        success: true,
        data: dashboard,
        statusCode: 200,
        headers: {},
        requestId: `analytics-dashboard-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get KPI dashboard', { siteid, error });
      throw error;
    }
  }

  /**
   * Get overdue work orders where targstartdate is in the past and status is open.
   * @param siteid - Site identifier
   * @param pageSize - Number of results to return (default: 100)
   * @returns API response with overdue work orders
   */
  async getOverdueWorkOrders(
    siteid: string,
    pageSize?: number
  ): Promise<ApiResponse<OverdueWorkOrdersResponse>> {
    logger.info('Getting overdue work orders', { siteid, pageSize });

    try {
      const today = new Date().toISOString().split('T')[0] + 'T00:00:00';
      const effectivePageSize = pageSize || DEFAULT_PAGE_SIZE;

      // Open statuses: WAPPR, APPR, WSCH, INPRG
      const params: OSLCQueryParams = {
        'oslc.where':
          `siteid="${siteid}" and targstartdate<"${today}" and status in ["WAPPR","APPR","WSCH","INPRG"]`,
        'oslc.select':
          'wonum,description,status,targstartdate,targcompdate,priority,assetnum,location,owner,siteid',
        'oslc.orderBy': '+targstartdate',
        'oslc.pageSize': effectivePageSize,
      };

      const response = await this.client.get<{
        member: OverdueWorkOrder[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const overdueWorkOrders = response.data.member || [];
        const totalOverdue = response.data.responseInfo?.totalCount ?? overdueWorkOrders.length;

        const result: OverdueWorkOrdersResponse = {
          siteid,
          overdueWorkOrders,
          totalOverdue,
          generatedAt: new Date().toISOString(),
        };

        logger.info('Overdue work orders retrieved', { siteid, totalOverdue });

        return {
          success: true,
          data: result,
          statusCode: 200,
          headers: response.headers,
          requestId: response.requestId,
        };
      }

      return {
        success: true,
        data: {
          siteid,
          overdueWorkOrders: [],
          totalOverdue: 0,
          generatedAt: new Date().toISOString(),
        },
        statusCode: 200,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get overdue work orders', { siteid, error });
      throw error;
    }
  }

  /**
   * Get top assets by downtime hours, sorted descending.
   * @param siteid - Site identifier
   * @param limit - Number of assets to return (default: 10)
   * @returns API response with top downtime assets
   */
  async getTopDowntimeAssets(
    siteid: string,
    limit?: number
  ): Promise<ApiResponse<TopDowntimeAssetsResponse>> {
    logger.info('Getting top downtime assets', { siteid, limit });

    try {
      const effectiveLimit = limit || 10;

      const params: OSLCQueryParams = {
        'oslc.where': `siteid="${siteid}" and totaldowntime>0`,
        'oslc.select': 'assetnum,description,status,totaldowntime,location,siteid',
        'oslc.orderBy': '-totaldowntime',
        'oslc.pageSize': effectiveLimit,
      };

      const response = await this.client.get<{
        member: DowntimeAsset[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.ASSETS, params);

      if (response.success && response.data) {
        const assets = response.data.member || [];

        const result: TopDowntimeAssetsResponse = {
          siteid,
          assets,
          count: assets.length,
          generatedAt: new Date().toISOString(),
        };

        logger.info('Top downtime assets retrieved', { siteid, count: assets.length });

        return {
          success: true,
          data: result,
          statusCode: 200,
          headers: response.headers,
          requestId: response.requestId,
        };
      }

      return {
        success: true,
        data: {
          siteid,
          assets: [],
          count: 0,
          generatedAt: new Date().toISOString(),
        },
        statusCode: 200,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get top downtime assets', { siteid, error });
      throw error;
    }
  }
}
