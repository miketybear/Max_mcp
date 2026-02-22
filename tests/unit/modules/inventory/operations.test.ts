/**
 * Unit tests for InventoryOperations
 * Tests all 11 operation methods for inventory and material management
 */

import { InventoryOperations } from '../../../../src/modules/inventory/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
import { mockInventory } from '../../../fixtures/maximo-responses';
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

// Mock inventory item data
const mockInventoryItem = {
  itemnum: 'ITEM001',
  description: 'Test Inventory Item',
  itemtype: 'ITEM' as const,
  status: 'ACTIVE' as const,
  siteid: 'BEDFORD',
  orgid: 'EAGLENA',
  orderunit: 'EA',
  issueunit: 'EA',
  avgcost: 25.50,
  stdcost: 30.00,
  lastcost: 28.00,
  href: 'http://maximo.example.com/maximo/oslc/os/mxitem/1',
};

// Mock inventory balance data
const mockInventoryBalance = {
  itemnum: 'ITEM001',
  location: 'CENTRAL',
  siteid: 'BEDFORD',
  curbal: 100,
  physcnt: 100,
  avgcost: 25.50,
  stdcost: 30.00,
  reorder: true,
  href: 'http://maximo.example.com/maximo/oslc/os/mxinventory/1',
};

// Mock transaction data
const mockTransaction = {
  invtransid: 1001,
  itemnum: 'ITEM001',
  location: 'CENTRAL',
  siteid: 'BEDFORD',
  transtype: 'ISSUE' as const,
  quantity: 5,
  curbal: 95,
  transdate: '2024-01-15T10:00:00Z',
  href: 'http://maximo.example.com/maximo/oslc/os/mxinvtrans/1001',
};

// Mock stock level data
const mockStockLevel = {
  itemnum: 'ITEM001',
  location: 'CENTRAL',
  curbal: 100,
  minlevel: 10,
  maxlevel: 200,
  reorder: 25,
  orderqty: 50,
  issueunit: 'EA',
};

describe('InventoryOperations', () => {
  let operations: InventoryOperations;
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

    operations = new InventoryOperations(mockClient);
  });

  describe('createItem', () => {
    it('should create an inventory item successfully', async () => {
      const input = {
        itemnum: 'ITEM001',
        description: 'Test Inventory Item',
        itemtype: 'ITEM' as const,
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockInventoryItem);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.createItem(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.ITEMS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInventoryItem);
    });

    it('should handle API errors when creating item', async () => {
      const input = {
        itemnum: 'ITEM001',
        description: 'Test Inventory Item',
        itemtype: 'ITEM' as const,
        siteid: 'BEDFORD',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.createItem(input)).rejects.toThrow('API Error');
    });

    it('should reject validation errors for missing required fields', async () => {
      const invalidInput = {
        itemnum: '',
        description: 'Test',
        itemtype: 'ITEM' as const,
        siteid: 'BEDFORD',
      };

      await expect(operations.createItem(invalidInput)).rejects.toThrow();
    });
  });

  describe('getInventory', () => {
    it('should retrieve inventory balance successfully', async () => {
      const response = createMockApiResponse([mockInventoryBalance]);
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getInventory('ITEM001', 'CENTRAL', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': 'itemnum="ITEM001" and location="CENTRAL" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInventoryBalance);
    });

    it('should return not found when inventory balance does not exist', async () => {
      const response = createMockApiResponse([]);
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getInventory('INVALID', 'CENTRAL', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toContain('not found');
    });

    it('should handle API errors when getting inventory', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getInventory('ITEM001', 'CENTRAL', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('issueInventory', () => {
    it('should issue inventory successfully', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 5,
        wonum: 'WO1001',
      };

      const response = createMockApiResponse(mockTransaction);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.issueInventory(transaction);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          itemnum: 'ITEM001',
          location: 'CENTRAL',
          siteid: 'BEDFORD',
          quantity: 5,
          transtype: 'ISSUE',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTransaction);
    });

    it('should handle API errors when issuing inventory', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 5,
        wonum: 'WO1001',
      };

      mockClient.post.mockRejectedValue(new Error('Insufficient balance'));

      await expect(operations.issueInventory(transaction)).rejects.toThrow(
        'Insufficient balance'
      );
    });

    it('should reject if neither wonum nor assetnum provided', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 5,
      };

      await expect(operations.issueInventory(transaction as any)).rejects.toThrow();
    });
  });

  describe('returnInventory', () => {
    it('should return inventory successfully', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 3,
        wonum: 'WO1001',
      };

      const returnTransaction = {
        ...mockTransaction,
        transtype: 'RETURN' as const,
        quantity: 3,
        curbal: 103,
      };
      const response = createMockApiResponse(returnTransaction);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.returnInventory(transaction);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          itemnum: 'ITEM001',
          location: 'CENTRAL',
          siteid: 'BEDFORD',
          quantity: 3,
          transtype: 'RETURN',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when returning inventory', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 3,
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.returnInventory(transaction)).rejects.toThrow('API Error');
    });
  });

  describe('transferInventory', () => {
    it('should transfer inventory between storerooms successfully', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'SOUTH',
        siteid: 'BEDFORD',
        quantity: 10,
      };

      const transferTransaction = {
        ...mockTransaction,
        transtype: 'TRANSFER' as const,
        quantity: 10,
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'SOUTH',
      };
      const response = createMockApiResponse(transferTransaction);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.transferInventory(transaction);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          itemnum: 'ITEM001',
          fromstoreloc: 'CENTRAL',
          tostoreloc: 'SOUTH',
          siteid: 'BEDFORD',
          quantity: 10,
          transtype: 'TRANSFER',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when transferring inventory', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'SOUTH',
        siteid: 'BEDFORD',
        quantity: 10,
      };

      mockClient.post.mockRejectedValue(new Error('Transfer failed'));

      await expect(operations.transferInventory(transaction)).rejects.toThrow(
        'Transfer failed'
      );
    });

    it('should reject transfer to same storeroom', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        fromstoreloc: 'CENTRAL',
        tostoreloc: 'CENTRAL',
        siteid: 'BEDFORD',
        quantity: 10,
      };

      await expect(operations.transferInventory(transaction)).rejects.toThrow();
    });
  });

  describe('adjustInventory', () => {
    it('should adjust inventory balance successfully', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        physcnt: 95,
        reason: 'Cycle count adjustment',
      };

      const adjustTransaction = {
        ...mockTransaction,
        transtype: 'ADJUSTMENT' as const,
        physcnt: 95,
      };
      const response = createMockApiResponse(adjustTransaction);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.adjustInventory(transaction);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          itemnum: 'ITEM001',
          location: 'CENTRAL',
          siteid: 'BEDFORD',
          physcnt: 95,
          transtype: 'ADJUSTMENT',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when adjusting inventory', async () => {
      const transaction = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        physcnt: 95,
      };

      mockClient.post.mockRejectedValue(new Error('Adjustment failed'));

      await expect(operations.adjustInventory(transaction)).rejects.toThrow(
        'Adjustment failed'
      );
    });
  });

  describe('getTransactions', () => {
    it('should retrieve transaction history successfully', async () => {
      const response = createMockApiResponse([mockTransaction], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTransactions('ITEM001', 'CENTRAL', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('itemnum="ITEM001"'),
          'oslc.orderBy': '-transdate',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.transactions).toEqual([mockTransaction]);
    });

    it('should filter by date range', async () => {
      const response = createMockApiResponse([mockTransaction], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTransactions(
        'ITEM001',
        'CENTRAL',
        'BEDFORD',
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVTRANS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('transdate>="2024-01-01T00:00:00Z"'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when getting transactions', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getTransactions('ITEM001', 'CENTRAL', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });

    it('should return error when no data returned', async () => {
      const response = createMockApiResponse(null as any, {
        success: false,
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTransactions('ITEM001', 'CENTRAL', 'BEDFORD');

      expect(result.success).toBe(false);
    });
  });

  describe('searchItems', () => {
    it('should search items with filters successfully', async () => {
      const response = createMockApiResponse([mockInventoryItem], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const criteria = {
        itemtype: 'ITEM' as const,
        status: 'ACTIVE' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.searchItems(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ITEMS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('itemtype="ITEM"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.items).toEqual([mockInventoryItem]);
    });

    it('should handle multiple item types', async () => {
      const response = createMockApiResponse([mockInventoryItem], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const criteria = {
        itemtype: ['ITEM', 'TOOL'] as const,
      };

      const result = await operations.searchItems(criteria as any);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ITEMS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('itemtype in ['),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when searching items', async () => {
      mockClient.get.mockRejectedValue(new Error('Search failed'));

      await expect(operations.searchItems({ siteid: 'BEDFORD' })).rejects.toThrow(
        'Search failed'
      );
    });

    it('should return error when no data returned', async () => {
      const response = createMockApiResponse(null as any, {
        success: false,
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.searchItems({ siteid: 'BEDFORD' });

      expect(result.success).toBe(false);
    });
  });

  describe('updateReorderPoint', () => {
    it('should update reorder point successfully', async () => {
      const lookupResponse = createMockApiResponse([mockInventoryBalance]);
      const patchResponse = createMockApiResponse({
        ...mockInventoryBalance,
        reorder: 50,
        minlevel: 10,
        maxlevel: 200,
      });

      mockClient.get.mockResolvedValue(lookupResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const data = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        reorder: 50,
        minlevel: 10,
        maxlevel: 200,
      };

      const result = await operations.updateReorderPoint(data);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('itemnum="ITEM001"'),
        })
      );
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockInventoryBalance.href,
        expect.objectContaining({ reorder: 50, minlevel: 10, maxlevel: 200 })
      );
      expect(result.success).toBe(true);
    });

    it('should return not found if inventory balance does not exist', async () => {
      const lookupResponse = createMockApiResponse([], { success: false });
      mockClient.get.mockResolvedValue(lookupResponse);

      const data = {
        itemnum: 'INVALID',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        reorder: 50,
      };

      const result = await operations.updateReorderPoint(data);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors when updating reorder point', async () => {
      const lookupResponse = createMockApiResponse([mockInventoryBalance]);
      mockClient.get.mockResolvedValue(lookupResponse);
      mockClient.patch.mockRejectedValue(new Error('Update failed'));

      const data = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
        reorder: 50,
      };

      await expect(operations.updateReorderPoint(data)).rejects.toThrow('Update failed');
    });

    it('should reject if no planning fields provided', async () => {
      const data = {
        itemnum: 'ITEM001',
        location: 'CENTRAL',
        siteid: 'BEDFORD',
      };

      await expect(operations.updateReorderPoint(data as any)).rejects.toThrow();
    });
  });

  describe('getStockLevels', () => {
    it('should retrieve stock levels across storerooms', async () => {
      const response = createMockApiResponse([mockStockLevel], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getStockLevels({
        itemnum: 'ITEM001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('itemnum="ITEM001"'),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.itemnum).toBe('ITEM001');
      expect(result.data?.storerooms).toEqual([mockStockLevel]);
    });

    it('should include all storerooms when flag is set', async () => {
      const response = createMockApiResponse([mockStockLevel], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getStockLevels({
        itemnum: 'ITEM001',
        siteid: 'BEDFORD',
        includeAllStorerooms: true,
      });

      // When includeAllStorerooms is true, siteid filter is not added to where clause
      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': 'itemnum="ITEM001"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when getting stock levels', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getStockLevels({ itemnum: 'ITEM001' })
      ).rejects.toThrow('Network error');
    });

    it('should return error when no data returned', async () => {
      const response = createMockApiResponse(null as any, {
        success: false,
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getStockLevels({ itemnum: 'ITEM001' });

      expect(result.success).toBe(false);
    });
  });

  describe('getItemsBelowReorder', () => {
    it('should retrieve items below reorder point', async () => {
      const belowReorderItem = {
        ...mockStockLevel,
        curbal: 5,
        reorder: 25,
      };
      const response = createMockApiResponse([belowReorderItem], {
        pagination: { totalCount: 1 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getItemsBelowReorder({
        siteid: 'BEDFORD',
        location: 'CENTRAL',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('curbal<=reorder'),
          'oslc.orderBy': '+itemnum',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.items).toEqual([belowReorderItem]);
    });

    it('should work with no filters', async () => {
      const response = createMockApiResponse([], {
        pagination: { totalCount: 0 } as any,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getItemsBelowReorder({});

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.INVENTORY,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('curbal<=reorder'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when getting items below reorder', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error'));

      await expect(operations.getItemsBelowReorder({})).rejects.toThrow('API Error');
    });

    it('should return error when no data returned', async () => {
      const response = createMockApiResponse(null as any, {
        success: false,
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getItemsBelowReorder({});

      expect(result.success).toBe(false);
    });
  });
});
