/**
 * Unit tests for Analytics MCP Tools
 * Tests all 7 MCP tool definitions and handlers
 */

import { createAnalyticsTools } from '../../../../src/modules/analytics/tools';
import { AnalyticsOperations } from '../../../../src/modules/analytics/operations';
import { createMockApiResponse } from '../../../fixtures/test-helpers';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Analytics MCP Tools', () => {
  let mockOperations: jest.Mocked<AnalyticsOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock operations
    mockOperations = {
      getWorkOrderSummary: jest.fn(),
      getAssetHealthSummary: jest.fn(),
      getInventorySummary: jest.fn(),
      getPMCompliance: jest.fn(),
      getDashboard: jest.fn(),
      getOverdueWorkOrders: jest.fn(),
      getTopDowntimeAssets: jest.fn(),
    } as any;

    tools = createAnalyticsTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 7 tools', () => {
      expect(tools).toHaveLength(7);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(7);
    });

    it('should have all required tool properties', () => {
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool).toHaveProperty('handler');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.handler).toBe('function');
      });
    });

    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_wo_summary',
        'maximo_asset_health',
        'maximo_inventory_summary',
        'maximo_pm_compliance',
        'maximo_dashboard',
        'maximo_overdue_workorders',
        'maximo_top_downtime_assets',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_wo_summary', () => {
    it('should call getWorkOrderSummary with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_wo_summary');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalWorkOrders: 50,
        byStatus: [],
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getWorkOrderSummary.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getWorkOrderSummary).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass date range when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_wo_summary');

      const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalWorkOrders: 10,
        byStatus: [],
        dateRange,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getWorkOrderSummary.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', dateRange });

      expect(mockOperations.getWorkOrderSummary).toHaveBeenCalledWith(
        'BEDFORD',
        dateRange
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_wo_summary');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });

    it('should reject invalid siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_wo_summary');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });
  });

  describe('maximo_asset_health', () => {
    it('should call getAssetHealthSummary with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_asset_health');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalAssets: 100,
        operatingCount: 80,
        notReadyCount: 10,
        decommissionedCount: 5,
        assetsWithDowntime: 15,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getAssetHealthSummary.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getAssetHealthSummary).toHaveBeenCalledWith('BEDFORD');
      expect(result).toEqual(mockResponse);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_asset_health');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
    });

    it('should reject invalid siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_asset_health');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });
  });

  describe('maximo_inventory_summary', () => {
    it('should call getInventorySummary with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_inventory_summary');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalItems: 500,
        itemsBelowReorder: 25,
        itemsOutOfStock: 10,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getInventorySummary.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getInventorySummary).toHaveBeenCalledWith('BEDFORD');
      expect(result).toEqual(mockResponse);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_inventory_summary');
      expect(tool.inputSchema.required).toEqual(['siteid']);
    });

    it('should reject invalid siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_inventory_summary');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });
  });

  describe('maximo_pm_compliance', () => {
    it('should call getPMCompliance with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_pm_compliance');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalPMs: 50,
        onSchedule: 40,
        overdue: 10,
        complianceRate: 80,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getPMCompliance.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getPMCompliance).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass date range when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_pm_compliance');

      const dateRange = { startDate: '2024-06-01', endDate: '2024-06-30' };
      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalPMs: 20,
        onSchedule: 18,
        overdue: 2,
        complianceRate: 90,
        dateRange,
        generatedAt: '2024-06-01T00:00:00Z',
      });
      mockOperations.getPMCompliance.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', dateRange });

      expect(mockOperations.getPMCompliance).toHaveBeenCalledWith(
        'BEDFORD',
        dateRange
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_pm_compliance');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });

    it('should reject invalid siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_pm_compliance');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });
  });

  describe('maximo_dashboard', () => {
    it('should call getDashboard with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_dashboard');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        workOrders: {} as any,
        assetHealth: {} as any,
        inventory: {} as any,
        pmCompliance: {} as any,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getDashboard.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getDashboard).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass date range when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_dashboard');

      const dateRange = { startDate: '2024-01-01', endDate: '2024-12-31' };
      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        workOrders: {} as any,
        assetHealth: {} as any,
        inventory: {} as any,
        pmCompliance: {} as any,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getDashboard.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', dateRange });

      expect(mockOperations.getDashboard).toHaveBeenCalledWith(
        'BEDFORD',
        dateRange
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_dashboard');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_dashboard');

      mockOperations.getDashboard.mockRejectedValue(new Error('Dashboard failed'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Dashboard failed');
    });
  });

  describe('maximo_overdue_workorders', () => {
    it('should call getOverdueWorkOrders with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_overdue_workorders');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        overdueWorkOrders: [],
        totalOverdue: 0,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getOverdueWorkOrders.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getOverdueWorkOrders).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass pageSize when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_overdue_workorders');

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        overdueWorkOrders: [],
        totalOverdue: 0,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getOverdueWorkOrders.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', pageSize: 50 });

      expect(mockOperations.getOverdueWorkOrders).toHaveBeenCalledWith(
        'BEDFORD',
        50
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_overdue_workorders');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('pageSize');
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_overdue_workorders');

      mockOperations.getOverdueWorkOrders.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('API Error');
    });
  });

  describe('maximo_top_downtime_assets', () => {
    it('should call getTopDowntimeAssets with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_top_downtime_assets');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        assets: [],
        count: 0,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getTopDowntimeAssets.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getTopDowntimeAssets).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass limit when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_top_downtime_assets');

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        assets: [],
        count: 0,
        generatedAt: '2024-01-01T00:00:00Z',
      });
      mockOperations.getTopDowntimeAssets.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', limit: 5 });

      expect(mockOperations.getTopDowntimeAssets).toHaveBeenCalledWith(
        'BEDFORD',
        5
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_top_downtime_assets');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('limit');
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_top_downtime_assets');

      mockOperations.getTopDowntimeAssets.mockRejectedValue(new Error('Timeout'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Timeout');
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors for empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_wo_summary');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });

    it('should propagate validation errors for siteid exceeding max length', async () => {
      const tool = tools.find((t) => t.name === 'maximo_asset_health');

      await expect(tool.handler({ siteid: 'TOOLONGSITE' })).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_inventory_summary');

      mockOperations.getInventorySummary.mockRejectedValue(new Error('Server down'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Server down');
    });
  });
});
