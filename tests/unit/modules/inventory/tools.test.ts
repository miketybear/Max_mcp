/**
 * Unit tests for Inventory MCP Tools
 * Tests all 11 MCP tool definitions and handlers
 */

import { createInventoryTools } from '../../../../src/modules/inventory/tools';
import { InventoryOperations } from '../../../../src/modules/inventory/operations';
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

// Mock data
const mockInventoryItem = {
  itemnum: 'ITEM001',
  description: 'Test Inventory Item',
  itemtype: 'ITEM',
  status: 'ACTIVE',
  siteid: 'BEDFORD',
  orgid: 'EAGLENA',
  orderunit: 'EA',
  issueunit: 'EA',
};

const mockInventoryBalance = {
  itemnum: 'ITEM001',
  location: 'CENTRAL',
  siteid: 'BEDFORD',
  curbal: 100,
  physcnt: 100,
  avgcost: 25.50,
  stdcost: 30.00,
};

const mockTransaction = {
  invtransid: 1001,
  itemnum: 'ITEM001',
  location: 'CENTRAL',
  siteid: 'BEDFORD',
  transtype: 'ISSUE',
  quantity: 5,
  curbal: 95,
  transdate: '2024-01-15T10:00:00Z',
};

describe('Inventory MCP Tools', () => {
  let mockOperations: jest.Mocked<InventoryOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock operations
    mockOperations = {
      createItem: jest.fn(),
      getInventory: jest.fn(),
      issueInventory: jest.fn(),
      returnInventory: jest.fn(),
      transferInventory: jest.fn(),
      adjustInventory: jest.fn(),
      getTransactions: jest.fn(),
      searchItems: jest.fn(),
      updateReorderPoint: jest.fn(),
      getStockLevels: jest.fn(),
      getItemsBelowReorder: jest.fn(),
    } as any;

    tools = createInventoryTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 11 tools', () => {
      expect(tools).toHaveLength(11);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t: any) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(11);
    });

    it('should have all required tool properties', () => {
      tools.forEach((tool: any) => {
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

  describe('Tool Names', () => {
    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_item',
        'maximo_get_inventory',
        'maximo_issue_inventory',
        'maximo_return_inventory',
        'maximo_transfer_inventory',
        'maximo_adjust_inventory',
        'maximo_get_inventory_transactions',
        'maximo_search_items',
        'maximo_update_reorder_point',
        'maximo_get_stock_levels',
        'maximo_get_items_below_reorder',
      ];

      const actualNames = tools.map((t: any) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_create_item', () => {
    it('should create item via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_item');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        description: 'Test Inventory Item',
        itemtype: 'ITEM',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockInventoryItem);
      mockOperations.createItem.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.createItem).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
      expect(parsed.item).toEqual(mockInventoryItem);
    });

    it('should return error content on failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_item');

      const input = {
        itemnum: 'ITEM001',
        description: 'Test',
        itemtype: 'ITEM',
        siteid: 'BEDFORD',
      };

      const failResponse = createMockApiResponse(null as any, {
        success: false,
        error: 'Creation failed',
        errorCode: 'TEST_ERROR',
      });
      mockOperations.createItem.mockResolvedValue(failResponse);

      const result = await tool.handler(input);

      expect(result.isError).toBe(true);
    });

    it('should handle thrown errors gracefully', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_item');

      const input = {
        itemnum: 'ITEM001',
        description: 'Test',
        itemtype: 'ITEM',
        siteid: 'BEDFORD',
      };

      mockOperations.createItem.mockRejectedValue(new Error('API Error'));

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(result.isError).toBe(true);
      expect(parsed.error).toBe('API Error');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_item');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'description', 'itemtype', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('itemnum');
      expect(tool.inputSchema.properties).toHaveProperty('description');
      expect(tool.inputSchema.properties).toHaveProperty('itemtype');
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
    });
  });

  describe('maximo_get_inventory', () => {
    it('should get inventory balance via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockInventoryBalance);
      mockOperations.getInventory.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.getInventory).toHaveBeenCalledWith('ITEM001', 'CENTRAL', 'BEDFORD');
      expect(parsed.success).toBe(true);
      expect(parsed.inventory).toEqual(mockInventoryBalance);
    });

    it('should return error for not found', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory');

      const input = {
        itemnum: 'INVALID',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
      };

      const failResponse = createMockApiResponse(null as any, {
        success: false,
        error: 'Not found',
        errorCode: 'NOT_FOUND',
      });
      mockOperations.getInventory.mockResolvedValue(failResponse);

      const result = await tool.handler(input);

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'location', 'siteid']);
    });
  });

  describe('maximo_issue_inventory', () => {
    it('should issue inventory via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_issue_inventory');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 5,
        wonum: 'WO1001',
      };

      const response = createMockApiResponse(mockTransaction);
      mockOperations.issueInventory.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.issueInventory).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
      expect(parsed.transaction).toEqual(mockTransaction);
    });

    it('should handle issue failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_issue_inventory');

      mockOperations.issueInventory.mockRejectedValue(new Error('Insufficient stock'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 9999,
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_issue_inventory');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'location', 'siteid', 'quantity']);
    });
  });

  describe('maximo_return_inventory', () => {
    it('should return inventory via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_return_inventory');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 3,
      };

      const response = createMockApiResponse({ ...mockTransaction, transtype: 'RETURN' });
      mockOperations.returnInventory.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.returnInventory).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle return failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_return_inventory');

      mockOperations.returnInventory.mockRejectedValue(new Error('Return failed'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 3,
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_return_inventory');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'location', 'siteid', 'quantity']);
    });
  });

  describe('maximo_transfer_inventory', () => {
    it('should transfer inventory via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_transfer_inventory');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'SOUTH',
        siteid: 'BEDFORD',
        quantity: 10,
      };

      const response = createMockApiResponse({ ...mockTransaction, transtype: 'TRANSFER' });
      mockOperations.transferInventory.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.transferInventory).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle transfer failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_transfer_inventory');

      mockOperations.transferInventory.mockRejectedValue(new Error('Transfer failed'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'SOUTH',
        siteid: 'BEDFORD',
        quantity: 10,
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_transfer_inventory');
      expect(tool.inputSchema.required).toEqual([
        'itemnum',
        'fromstoreloc',
        'tostoreloc',
        'siteid',
        'quantity',
      ]);
    });
  });

  describe('maximo_adjust_inventory', () => {
    it('should adjust inventory via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_adjust_inventory');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        physcnt: 95,
        reason: 'Cycle count',
      };

      const response = createMockApiResponse({ ...mockTransaction, transtype: 'ADJUSTMENT' });
      mockOperations.adjustInventory.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.adjustInventory).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle adjustment failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_adjust_inventory');

      mockOperations.adjustInventory.mockRejectedValue(new Error('Adjustment failed'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        physcnt: 95,
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_adjust_inventory');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'location', 'siteid', 'physcnt']);
    });
  });

  describe('maximo_get_inventory_transactions', () => {
    it('should get transactions via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory_transactions');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        transactions: [mockTransaction],
        totalCount: 1,
        page: 1,
        pageSize: 100,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
      mockOperations.getTransactions.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.getTransactions).toHaveBeenCalledWith(
        'ITEM001',
        'CENTRAL',
        'BEDFORD',
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(parsed.success).toBe(true);
    });

    it('should handle transaction retrieval failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory_transactions');

      mockOperations.getTransactions.mockRejectedValue(new Error('Failed'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_inventory_transactions');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'location', 'siteid']);
    });
  });

  describe('maximo_search_items', () => {
    it('should search items via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_items');
      expect(tool).toBeDefined();

      const input = {
        itemtype: 'ITEM',
        status: 'ACTIVE',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        items: [mockInventoryItem],
        totalCount: 1,
        page: 1,
        pageSize: 100,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
      mockOperations.searchItems.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.searchItems).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle search failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_items');

      mockOperations.searchItems.mockRejectedValue(new Error('Search failed'));

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(result.isError).toBe(true);
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_items');
      expect(tool.inputSchema.required).toBeUndefined();
      expect(tool.inputSchema.properties).toHaveProperty('itemtype');
      expect(tool.inputSchema.properties).toHaveProperty('status');
    });
  });

  describe('maximo_update_reorder_point', () => {
    it('should update reorder point via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_reorder_point');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        siteid: 'BEDFORD',
        location: 'CENTRAL',
        reorder: 50,
        minlevel: 10,
      };

      const response = createMockApiResponse({ ...mockInventoryBalance, reorder: 50 });
      mockOperations.updateReorderPoint.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.updateReorderPoint).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle update failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_reorder_point');

      mockOperations.updateReorderPoint.mockRejectedValue(new Error('Update failed'));

      const result = await tool.handler({
        itemnum: 'ITEM001',
        siteid: 'BEDFORD',
        location: 'CENTRAL',
        reorder: 50,
      });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_reorder_point');
      expect(tool.inputSchema.required).toEqual(['itemnum', 'siteid', 'location']);
    });
  });

  describe('maximo_get_stock_levels', () => {
    it('should get stock levels via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_stock_levels');
      expect(tool).toBeDefined();

      const input = {
        itemnum: 'ITEM001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        itemnum: 'ITEM001',
        storerooms: [mockInventoryBalance],
        totalCount: 1,
      });
      mockOperations.getStockLevels.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.getStockLevels).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle stock levels failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_stock_levels');

      mockOperations.getStockLevels.mockRejectedValue(new Error('Failed'));

      const result = await tool.handler({ itemnum: 'ITEM001' });

      expect(result.isError).toBe(true);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_stock_levels');
      expect(tool.inputSchema.required).toEqual(['itemnum']);
    });
  });

  describe('maximo_get_items_below_reorder', () => {
    it('should get items below reorder via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_items_below_reorder');
      expect(tool).toBeDefined();

      const input = {
        siteid: 'BEDFORD',
        location: 'CENTRAL',
      };

      const response = createMockApiResponse({
        items: [{ ...mockInventoryBalance, curbal: 5 }],
        totalCount: 1,
      });
      mockOperations.getItemsBelowReorder.mockResolvedValue(response);

      const result = await tool.handler(input);
      const parsed = JSON.parse(result.content[0].text);

      expect(mockOperations.getItemsBelowReorder).toHaveBeenCalledWith(input);
      expect(parsed.success).toBe(true);
    });

    it('should handle below reorder failure', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_items_below_reorder');

      mockOperations.getItemsBelowReorder.mockRejectedValue(new Error('Failed'));

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_items_below_reorder');
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });
});
