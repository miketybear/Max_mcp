/**
 * Unit tests for Asset MCP Tools
 * Tests all 12 MCP tool definitions and handlers
 */

import { createAssetTools } from '../../../../src/modules/assets/tools';
import { AssetOperations } from '../../../../src/modules/assets/operations';
import { mockAsset } from '../../../fixtures/maximo-responses';
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

describe('Asset MCP Tools', () => {
  let mockOperations: jest.Mocked<AssetOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock operations
    mockOperations = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      move: jest.fn(),
      recordMeter: jest.fn(),
      getHierarchy: jest.fn(),
      updateSpecification: jest.fn(),
      search: jest.fn(),
      getMeterHistory: jest.fn(),
      changeStatus: jest.fn(),
      getDowntimeHistory: jest.fn(),
    } as any;

    tools = createAssetTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 12 tools', () => {
      expect(tools).toHaveLength(12);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(12);
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
  });

  describe('maximo_create_asset', () => {
    it('should create asset via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_asset');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET002',
        description: 'New Test Asset',
        siteid: 'BEDFORD',
        assettype: 'PRODUCTION',
      };

      const response = createMockApiResponse(mockAsset);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_asset');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'description', 'siteid', 'assettype']);
      expect(tool.inputSchema.properties).toHaveProperty('assetnum');
      expect(tool.inputSchema.properties).toHaveProperty('description');
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
      expect(tool.inputSchema.properties).toHaveProperty('assettype');
      expect(tool.inputSchema.properties).toHaveProperty('location');
      expect(tool.inputSchema.properties).toHaveProperty('parent');
    });
  });

  describe('maximo_get_asset', () => {
    it('should get asset via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockAsset);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('ASSET001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid']);
    });
  });

  describe('maximo_update_asset', () => {
    it('should update asset via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_asset');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated description',
          priority: 1,
        },
      };

      const response = createMockApiResponse(mockAsset);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_asset');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid', 'updates']);
    });
  });

  describe('maximo_delete_asset', () => {
    it('should delete asset via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_asset');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('ASSET001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_asset');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid']);
    });
  });

  describe('maximo_move_asset', () => {
    it('should move asset via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_move_asset');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        newLocation: 'LOC002',
        memo: 'Relocating to building B',
      };

      const response = createMockApiResponse({ ...mockAsset, location: 'LOC002' });
      mockOperations.move.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.move).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        expect.objectContaining({
          newLocation: 'LOC002',
          memo: 'Relocating to building B',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_move_asset');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid', 'newLocation']);
      expect(tool.inputSchema.properties).toHaveProperty('moveDate');
      expect(tool.inputSchema.properties).toHaveProperty('memo');
      expect(tool.inputSchema.properties).toHaveProperty('newBinnum');
      expect(tool.inputSchema.properties).toHaveProperty('newLotnum');
    });
  });

  describe('maximo_record_meter', () => {
    it('should record meter reading via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_record_meter');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        metername: 'TEMP',
        reading: 72.5,
        readingdate: '2024-01-15T10:00:00Z',
        inspector: 'TECH001',
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.recordMeter.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.recordMeter).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        expect.objectContaining({
          metername: 'TEMP',
          reading: 72.5,
          readingdate: '2024-01-15T10:00:00Z',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_record_meter');
      expect(tool.inputSchema.required).toEqual([
        'assetnum',
        'siteid',
        'metername',
        'reading',
        'readingdate',
      ]);
      expect(tool.inputSchema.properties).toHaveProperty('inspector');
      expect(tool.inputSchema.properties).toHaveProperty('remarks');
      expect(tool.inputSchema.properties).toHaveProperty('rollover');
    });
  });

  describe('maximo_get_asset_hierarchy', () => {
    it('should get asset hierarchy via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset_hierarchy');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        asset: mockAsset,
        parent: undefined,
        children: [],
        level: 0,
        path: ['ASSET001'],
      });
      mockOperations.getHierarchy.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getHierarchy).toHaveBeenCalledWith('ASSET001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset_hierarchy');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid']);
    });
  });

  describe('maximo_update_asset_spec', () => {
    it('should update asset specification via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_asset_spec');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        assetattrid: 'COLOR',
        alnvalue: 'RED',
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.updateSpecification.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.updateSpecification).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        expect.objectContaining({
          assetattrid: 'COLOR',
          alnvalue: 'RED',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_asset_spec');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid', 'assetattrid']);
      expect(tool.inputSchema.properties).toHaveProperty('alnvalue');
      expect(tool.inputSchema.properties).toHaveProperty('numvalue');
      expect(tool.inputSchema.properties).toHaveProperty('tablevalue');
      expect(tool.inputSchema.properties).toHaveProperty('measureunitid');
    });
  });

  describe('maximo_search_assets', () => {
    it('should search assets via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_assets');
      expect(tool).toBeDefined();

      const input = {
        status: 'OPERATING',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        assets: [mockAsset],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
      mockOperations.search.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should handle multiple status values', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_assets');

      const input = {
        status: ['OPERATING', 'NOT READY'],
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        assets: [mockAsset],
        totalCount: 1,
      });
      mockOperations.search.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['OPERATING', 'NOT READY'],
        })
      );
    });

    it('should handle date range filter', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_assets');

      const input = {
        dateRange: {
          start: '2020-01-01',
          end: '2024-01-31',
          field: 'installdate',
        },
      };

      const response = createMockApiResponse({
        assets: [],
        totalCount: 0,
      });
      mockOperations.search.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: input.dateRange,
        })
      );
    });

    it('should have flexible input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_search_assets');
      // All fields optional - no required array
      expect(tool.inputSchema.required).toBeUndefined();
      expect(tool.inputSchema.properties).toHaveProperty('status');
      expect(tool.inputSchema.properties).toHaveProperty('assettype');
      expect(tool.inputSchema.properties).toHaveProperty('location');
      expect(tool.inputSchema.properties).toHaveProperty('parent');
      expect(tool.inputSchema.properties).toHaveProperty('manufacturer');
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });
  });

  describe('maximo_get_meter_history', () => {
    it('should get meter history via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_meter_history');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        metername: 'TEMP',
      };

      const response = createMockApiResponse({
        readings: [
          { metername: 'TEMP', reading: 72.5, readingdate: '2024-01-15T10:00:00Z' },
        ],
        totalCount: 1,
        pageSize: 100,
      });
      mockOperations.getMeterHistory.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getMeterHistory).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        'TEMP',
        undefined,
        undefined
      );
      expect(result).toEqual(response);
    });

    it('should pass pageSize and orderBy parameters', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_meter_history');

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        pageSize: 50,
        orderBy: '+readingdate',
      };

      const response = createMockApiResponse({
        readings: [],
        totalCount: 0,
        pageSize: 50,
      });
      mockOperations.getMeterHistory.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getMeterHistory).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        undefined,
        50,
        '+readingdate'
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_meter_history');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('metername');
      expect(tool.inputSchema.properties).toHaveProperty('pageSize');
      expect(tool.inputSchema.properties).toHaveProperty('orderBy');
    });
  });

  describe('maximo_change_asset_status', () => {
    it('should change asset status via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_change_asset_status');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        status: 'NOT READY',
        memo: 'Scheduled maintenance',
      };

      const response = createMockApiResponse({ ...mockAsset, status: 'NOT READY' });
      mockOperations.changeStatus.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.changeStatus).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        'NOT READY',
        'Scheduled maintenance'
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema with status enum', () => {
      const tool = tools.find((t) => t.name === 'maximo_change_asset_status');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid', 'status']);
      expect(tool.inputSchema.properties.status.enum).toContain('OPERATING');
      expect(tool.inputSchema.properties.status.enum).toContain('NOT READY');
      expect(tool.inputSchema.properties.status.enum).toContain('DECOMMISSIONED');
      expect(tool.inputSchema.properties.status.enum).toContain('MISSING');
      expect(tool.inputSchema.properties.status.enum).toContain('SEALED');
    });
  });

  describe('maximo_get_asset_downtime', () => {
    it('should get downtime history via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset_downtime');
      expect(tool).toBeDefined();

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const response = createMockApiResponse({
        downtimeRecords: [
          { startdate: '2024-01-10T08:00:00Z', downtime: 4 },
        ],
        totalCount: 1,
        totalDowntimeHours: 4,
      });
      mockOperations.getDowntimeHistory.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getDowntimeHistory).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual(response);
    });

    it('should work without date filters', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset_downtime');

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        downtimeRecords: [],
        totalCount: 0,
        totalDowntimeHours: 0,
      });
      mockOperations.getDowntimeHistory.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getDowntimeHistory).toHaveBeenCalledWith(
        'ASSET001',
        'BEDFORD',
        undefined,
        undefined
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset_downtime');
      expect(tool.inputSchema.required).toEqual(['assetnum', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('startDate');
      expect(tool.inputSchema.properties).toHaveProperty('endDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_asset');

      const invalidInput = {
        assetnum: '', // Invalid: empty assetnum
        description: 'Test',
        siteid: 'BEDFORD',
        assettype: 'PRODUCTION',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_asset');

      const input = {
        assetnum: 'ASSET001',
        siteid: 'BEDFORD',
      };

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });

  describe('Tool Names', () => {
    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_asset',
        'maximo_get_asset',
        'maximo_update_asset',
        'maximo_delete_asset',
        'maximo_move_asset',
        'maximo_record_meter',
        'maximo_get_asset_hierarchy',
        'maximo_update_asset_spec',
        'maximo_search_assets',
        'maximo_get_meter_history',
        'maximo_change_asset_status',
        'maximo_get_asset_downtime',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });
});
