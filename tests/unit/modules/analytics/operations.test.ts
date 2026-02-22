/**
 * Unit tests for AnalyticsOperations
 * Tests all 7 operation methods for analytics and KPI queries
 */

import { AnalyticsOperations } from '../../../../src/modules/analytics/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS, WORK_ORDER_STATUSES } from '../../../../src/config/constants';
import { createMockApiResponse, createMockApiError } from '../../../fixtures/test-helpers';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('AnalyticsOperations', () => {
  let operations: AnalyticsOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new AnalyticsOperations(mockClient);
  });

  describe('getWorkOrderSummary', () => {
    it('should return work order summary with counts per status', async () => {
      // Mock a response for each status in WORK_ORDER_STATUSES
      for (let i = 0; i < WORK_ORDER_STATUSES.length; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [{ wonum: 'WO001' }],
            responseInfo: { totalCount: 5 },
          })
        );
      }

      const result = await operations.getWorkOrderSummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.totalWorkOrders).toBe(5 * WORK_ORDER_STATUSES.length);
      expect(result.data!.byStatus).toHaveLength(WORK_ORDER_STATUSES.length);
      expect(result.data!.generatedAt).toBeDefined();

      // Verify each status was queried
      expect(mockClient.get).toHaveBeenCalledTimes(WORK_ORDER_STATUSES.length);
      for (const status of WORK_ORDER_STATUSES) {
        expect(mockClient.get).toHaveBeenCalledWith(
          API_ENDPOINTS.WORK_ORDERS,
          expect.objectContaining({
            'oslc.where': expect.stringContaining(`status="${status}"`),
          })
        );
      }
    });

    it('should apply date range filter when provided', async () => {
      for (let i = 0; i < WORK_ORDER_STATUSES.length; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [],
            responseInfo: { totalCount: 0 },
          })
        );
      }

      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const result = await operations.getWorkOrderSummary('BEDFORD', dateRange);

      expect(result.success).toBe(true);
      expect(result.data!.dateRange).toEqual(dateRange);

      // Verify date range was included in query
      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('statusdate>="2024-01-01"'),
        })
      );
    });

    it('should handle counts of zero when API returns empty members', async () => {
      for (let i = 0; i < WORK_ORDER_STATUSES.length; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [],
          })
        );
      }

      const result = await operations.getWorkOrderSummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.totalWorkOrders).toBe(0);
      result.data!.byStatus.forEach((bucket) => {
        expect(bucket.count).toBe(0);
      });
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getWorkOrderSummary('BEDFORD')
      ).rejects.toThrow('Network error');
    });

    it('should handle unsuccessful response for a status gracefully', async () => {
      for (let i = 0; i < WORK_ORDER_STATUSES.length; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiError('Server error', 500)
        );
      }

      const result = await operations.getWorkOrderSummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.totalWorkOrders).toBe(0);
    });
  });

  describe('getAssetHealthSummary', () => {
    it('should return asset health summary with all counts', async () => {
      // Total assets
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ assetnum: 'A001' }],
          responseInfo: { totalCount: 100 },
        })
      );
      // Operating
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ assetnum: 'A001' }],
          responseInfo: { totalCount: 80 },
        })
      );
      // Not Ready
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ assetnum: 'A002' }],
          responseInfo: { totalCount: 10 },
        })
      );
      // Decommissioned
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ assetnum: 'A003' }],
          responseInfo: { totalCount: 5 },
        })
      );
      // Assets with downtime
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ assetnum: 'A004' }],
          responseInfo: { totalCount: 15 },
        })
      );

      const result = await operations.getAssetHealthSummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.totalAssets).toBe(100);
      expect(result.data!.operatingCount).toBe(80);
      expect(result.data!.notReadyCount).toBe(10);
      expect(result.data!.decommissionedCount).toBe(5);
      expect(result.data!.assetsWithDowntime).toBe(15);
      expect(result.data!.generatedAt).toBeDefined();

      // 5 queries: total, operating, not ready, decommissioned, downtime
      expect(mockClient.get).toHaveBeenCalledTimes(5);
    });

    it('should query correct endpoints and filters', async () => {
      for (let i = 0; i < 5; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
        );
      }

      await operations.getAssetHealthSummary('BEDFORD');

      // Check total assets query
      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD"',
        })
      );

      // Check operating query
      expect(mockClient.get).toHaveBeenNthCalledWith(
        2,
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD" and status="OPERATING"',
        })
      );

      // Check downtime query
      expect(mockClient.get).toHaveBeenNthCalledWith(
        5,
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD" and totaldowntime>0',
        })
      );
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Connection refused'));

      await expect(
        operations.getAssetHealthSummary('BEDFORD')
      ).rejects.toThrow('Connection refused');
    });

    it('should return zero counts when API returns unsuccessful responses', async () => {
      for (let i = 0; i < 5; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiError('Not found', 404)
        );
      }

      const result = await operations.getAssetHealthSummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.totalAssets).toBe(0);
      expect(result.data!.operatingCount).toBe(0);
      expect(result.data!.notReadyCount).toBe(0);
      expect(result.data!.decommissionedCount).toBe(0);
      expect(result.data!.assetsWithDowntime).toBe(0);
    });
  });

  describe('getInventorySummary', () => {
    it('should return inventory summary with all counts', async () => {
      // Total items
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ itemnum: 'ITEM001' }],
          responseInfo: { totalCount: 500 },
        })
      );
      // Below reorder
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ itemnum: 'ITEM002' }],
          responseInfo: { totalCount: 25 },
        })
      );
      // Out of stock
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ itemnum: 'ITEM003' }],
          responseInfo: { totalCount: 10 },
        })
      );

      const result = await operations.getInventorySummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.totalItems).toBe(500);
      expect(result.data!.itemsBelowReorder).toBe(25);
      expect(result.data!.itemsOutOfStock).toBe(10);
      expect(result.data!.generatedAt).toBeDefined();

      expect(mockClient.get).toHaveBeenCalledTimes(3);
    });

    it('should query correct inventory endpoints', async () => {
      for (let i = 0; i < 3; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
        );
      }

      await operations.getInventorySummary('BEDFORD');

      // Total query
      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD"',
        })
      );

      // Below reorder
      expect(mockClient.get).toHaveBeenNthCalledWith(
        2,
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('curbal<=minlevel'),
        })
      );

      // Out of stock
      expect(mockClient.get).toHaveBeenNthCalledWith(
        3,
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('curbal<=0'),
        })
      );
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Timeout'));

      await expect(
        operations.getInventorySummary('BEDFORD')
      ).rejects.toThrow('Timeout');
    });

    it('should return zero counts when API returns unsuccessful responses', async () => {
      for (let i = 0; i < 3; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiError('Server error', 500)
        );
      }

      const result = await operations.getInventorySummary('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.totalItems).toBe(0);
      expect(result.data!.itemsBelowReorder).toBe(0);
      expect(result.data!.itemsOutOfStock).toBe(0);
    });
  });

  describe('getPMCompliance', () => {
    it('should return PM compliance summary with compliance rate', async () => {
      // Total PMs
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ pmnum: 'PM001' }],
          responseInfo: { totalCount: 50 },
        })
      );
      // Overdue PMs
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ pmnum: 'PM010' }],
          responseInfo: { totalCount: 10 },
        })
      );

      const result = await operations.getPMCompliance('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.totalPMs).toBe(50);
      expect(result.data!.overdue).toBe(10);
      expect(result.data!.onSchedule).toBe(40);
      expect(result.data!.complianceRate).toBe(80);
      expect(result.data!.generatedAt).toBeDefined();

      expect(mockClient.get).toHaveBeenCalledTimes(2);
    });

    it('should apply date range filter when provided', async () => {
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
      );
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
      );

      const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
      const result = await operations.getPMCompliance('BEDFORD', dateRange);

      expect(result.success).toBe(true);
      expect(result.data!.dateRange).toEqual(dateRange);

      // Verify date range included in the total query
      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('nextdate>="2024-01-01"'),
        })
      );
    });

    it('should return 100% compliance when no PMs exist', async () => {
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
      );
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [], responseInfo: { totalCount: 0 } })
      );

      const result = await operations.getPMCompliance('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.totalPMs).toBe(0);
      expect(result.data!.complianceRate).toBe(100);
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.getPMCompliance('BEDFORD')
      ).rejects.toThrow('API Error');
    });
  });

  describe('getDashboard', () => {
    /**
     * Helper to set up mock responses for a full dashboard call.
     * The dashboard calls 4 sub-methods in parallel:
     * - getWorkOrderSummary: WORK_ORDER_STATUSES.length calls
     * - getAssetHealthSummary: 5 calls
     * - getInventorySummary: 3 calls
     * - getPMCompliance: 2 calls
     */
    function setupDashboardMocks() {
      // Work Order Summary: one call per status
      for (let i = 0; i < WORK_ORDER_STATUSES.length; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [{ wonum: 'WO001' }],
            responseInfo: { totalCount: 3 },
          })
        );
      }
      // Asset Health Summary: 5 calls
      for (let i = 0; i < 5; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [{ assetnum: 'A001' }],
            responseInfo: { totalCount: 10 },
          })
        );
      }
      // Inventory Summary: 3 calls
      for (let i = 0; i < 3; i++) {
        mockClient.get.mockResolvedValueOnce(
          createMockApiResponse({
            member: [{ itemnum: 'ITEM001' }],
            responseInfo: { totalCount: 20 },
          })
        );
      }
      // PM Compliance: 2 calls
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ pmnum: 'PM001' }],
          responseInfo: { totalCount: 15 },
        })
      );
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [{ pmnum: 'PM002' }],
          responseInfo: { totalCount: 5 },
        })
      );
    }

    it('should return combined KPI dashboard with all sub-summaries', async () => {
      setupDashboardMocks();

      const result = await operations.getDashboard('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.workOrders).toBeDefined();
      expect(result.data!.assetHealth).toBeDefined();
      expect(result.data!.inventory).toBeDefined();
      expect(result.data!.pmCompliance).toBeDefined();
      expect(result.data!.generatedAt).toBeDefined();
    });

    it('should pass date range to work orders and PM compliance', async () => {
      setupDashboardMocks();

      const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
      const result = await operations.getDashboard('BEDFORD', dateRange);

      expect(result.success).toBe(true);
      expect(result.data!.workOrders.dateRange).toEqual(dateRange);
      expect(result.data!.pmCompliance.dateRange).toEqual(dateRange);
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Dashboard error'));

      await expect(
        operations.getDashboard('BEDFORD')
      ).rejects.toThrow('Dashboard error');
    });
  });

  describe('getOverdueWorkOrders', () => {
    it('should return overdue work orders successfully', async () => {
      const mockOverdue = [
        {
          wonum: 'WO001',
          description: 'Overdue repair',
          status: 'WAPPR',
          targstartdate: '2024-01-01',
          siteid: 'BEDFORD',
        },
        {
          wonum: 'WO002',
          description: 'Late inspection',
          status: 'INPRG',
          targstartdate: '2024-01-05',
          siteid: 'BEDFORD',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockOverdue,
          responseInfo: { totalCount: 2 },
        })
      );

      const result = await operations.getOverdueWorkOrders('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.overdueWorkOrders).toHaveLength(2);
      expect(result.data!.totalOverdue).toBe(2);
      expect(result.data!.generatedAt).toBeDefined();

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('targstartdate<'),
          'oslc.orderBy': '+targstartdate',
        })
      );
    });

    it('should use custom pageSize when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getOverdueWorkOrders('BEDFORD', 50);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.pageSize': 50,
        })
      );
    });

    it('should return empty list when no overdue work orders exist', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      const result = await operations.getOverdueWorkOrders('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.overdueWorkOrders).toHaveLength(0);
      expect(result.data!.totalOverdue).toBe(0);
    });

    it('should return empty response when API returns unsuccessful result', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.getOverdueWorkOrders('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.overdueWorkOrders).toHaveLength(0);
      expect(result.data!.totalOverdue).toBe(0);
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getOverdueWorkOrders('BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getTopDowntimeAssets', () => {
    it('should return top downtime assets sorted by downtime', async () => {
      const mockAssets = [
        {
          assetnum: 'PUMP001',
          description: 'Main pump',
          status: 'OPERATING',
          totaldowntime: 120,
          siteid: 'BEDFORD',
        },
        {
          assetnum: 'COMP002',
          description: 'Air compressor',
          status: 'NOT READY',
          totaldowntime: 80,
          siteid: 'BEDFORD',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockAssets,
          responseInfo: { totalCount: 2 },
        })
      );

      const result = await operations.getTopDowntimeAssets('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.assets).toHaveLength(2);
      expect(result.data!.count).toBe(2);
      expect(result.data!.generatedAt).toBeDefined();

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD" and totaldowntime>0',
          'oslc.orderBy': '-totaldowntime',
          'oslc.pageSize': 10, // default limit
        })
      );
    });

    it('should use custom limit when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getTopDowntimeAssets('BEDFORD', 5);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.pageSize': 5,
        })
      );
    });

    it('should return empty result when no downtime assets exist', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      const result = await operations.getTopDowntimeAssets('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.assets).toHaveLength(0);
      expect(result.data!.count).toBe(0);
    });

    it('should return empty result when API returns unsuccessful response', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('Server error', 500)
      );

      const result = await operations.getTopDowntimeAssets('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.assets).toHaveLength(0);
      expect(result.data!.count).toBe(0);
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Request failed'));

      await expect(
        operations.getTopDowntimeAssets('BEDFORD')
      ).rejects.toThrow('Request failed');
    });
  });
});
