/**
 * Unit tests for Purchase Order MCP Tools
 * Tests all 15 MCP tool definitions and handlers
 */

import { createPurchaseOrderTools } from '../../../../src/modules/purchase-orders/tools';
import { PurchaseOrderOperations } from '../../../../src/modules/purchase-orders/operations';
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

/** Reusable mock purchase order fixture */
const mockPO = {
  ponum: 'PO1001',
  description: 'Test Purchase Order',
  vendor: 'VENDOR01',
  siteid: 'BEDFORD',
  status: 'WAPPR',
  potype: 'STANDARD',
  totalcost: 5000.0,
  href: 'http://maximo.example.com/maximo/oslc/os/mxpo/1',
};

describe('Purchase Order MCP Tools', () => {
  let mockOperations: jest.Mocked<PurchaseOrderOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockOperations = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      receive: jest.fn(),
      approve: jest.fn(),
      search: jest.fn(),
      addLineItem: jest.fn(),
      getLineItems: jest.fn(),
      updateLineItem: jest.fn(),
      removeLineItem: jest.fn(),
      submitForApproval: jest.fn(),
      rejectPO: jest.fn(),
      receiveLineItem: jest.fn(),
      getReceipts: jest.fn(),
    } as any;

    tools = createPurchaseOrderTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 15 tools', () => {
      expect(tools).toHaveLength(15);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(15);
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
        'maximo_create_po',
        'maximo_get_po',
        'maximo_update_po',
        'maximo_delete_po',
        'maximo_receive_po',
        'maximo_approve_po',
        'maximo_search_pos',
        'maximo_add_po_line',
        'maximo_get_po_lines',
        'maximo_update_po_line',
        'maximo_remove_po_line',
        'maximo_submit_po_approval',
        'maximo_reject_po',
        'maximo_receive_po_line',
        'maximo_get_po_receipts',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_create_po', () => {
    it('should create PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_po');
      expect(tool).toBeDefined();

      const input = {
        description: 'Test Purchase Order',
        vendor: 'VENDOR01',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockPO);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_po');
      expect(tool.inputSchema.required).toEqual(['description', 'vendor', 'siteid']);
    });
  });

  describe('maximo_get_po', () => {
    it('should get PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockPO);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('PO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po');
      expect(tool.inputSchema.required).toEqual(['ponum']);
    });
  });

  describe('maximo_update_po', () => {
    it('should update PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated PO',
          buyer: 'BUYER02',
        },
      };

      const response = createMockApiResponse(mockPO);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'PO1001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_po');
      expect(tool.inputSchema.required).toEqual(['ponum', 'updates']);
    });
  });

  describe('maximo_delete_po', () => {
    it('should delete PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('PO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_po');
      expect(tool.inputSchema.required).toEqual(['ponum']);
    });
  });

  describe('maximo_receive_po', () => {
    it('should receive PO items via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_receive_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        polinenum: 1,
        quantity: 10,
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.receive.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.receive).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          polinenum: 1,
          quantity: 10,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_receive_po');
      expect(tool.inputSchema.required).toEqual(['ponum', 'polinenum', 'quantity']);
    });
  });

  describe('maximo_approve_po', () => {
    it('should approve PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_approve_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        memo: 'Approved by manager',
      };

      const response = createMockApiResponse({ ...mockPO, status: 'APPR' });
      mockOperations.approve.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.approve).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          memo: 'Approved by manager',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_approve_po');
      expect(tool.inputSchema.required).toEqual(['ponum']);
    });
  });

  describe('maximo_search_pos', () => {
    it('should search POs via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_pos');
      expect(tool).toBeDefined();

      const input = {
        status: 'WAPPR',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        member: [mockPO],
      });
      mockOperations.search.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t) => t.name === 'maximo_search_pos');
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });

  describe('maximo_add_po_line', () => {
    it('should add line item via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_po_line');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        description: 'New Item',
        orderqty: 5,
        unitcost: 10.0,
      };

      const response = createMockApiResponse({ polinenum: 2, description: 'New Item' });
      mockOperations.addLineItem.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addLineItem).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          description: 'New Item',
          orderqty: 5,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_po_line');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid', 'description', 'orderqty']);
    });
  });

  describe('maximo_get_po_lines', () => {
    it('should get line items via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po_lines');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      };

      const mockLines = [{ polinenum: 1, description: 'Item 1', orderqty: 10 }];
      const response = createMockApiResponse(mockLines);
      mockOperations.getLineItems.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getLineItems).toHaveBeenCalledWith('PO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po_lines');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid']);
    });
  });

  describe('maximo_update_po_line', () => {
    it('should update line item via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_po_line');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        orderqty: 20,
        unitcost: 15.0,
      };

      const response = createMockApiResponse({ polinenum: 1, orderqty: 20 });
      mockOperations.updateLineItem.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.updateLineItem).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          polinenum: 1,
          orderqty: 20,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_po_line');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid', 'polinenum']);
    });
  });

  describe('maximo_remove_po_line', () => {
    it('should remove line item via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_remove_po_line');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.removeLineItem.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.removeLineItem).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          polinenum: 1,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_remove_po_line');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid', 'polinenum']);
    });
  });

  describe('maximo_submit_po_approval', () => {
    it('should submit PO for approval via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_submit_po_approval');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        memo: 'Please approve',
      };

      const response = createMockApiResponse({ ...mockPO, status: 'WAPPR' });
      mockOperations.submitForApproval.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.submitForApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          memo: 'Please approve',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_submit_po_approval');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid']);
    });
  });

  describe('maximo_reject_po', () => {
    it('should reject PO via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_reject_po');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        reason: 'Budget exceeded',
      };

      const response = createMockApiResponse({ ...mockPO, status: 'CAN' });
      mockOperations.rejectPO.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.rejectPO).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          reason: 'Budget exceeded',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_reject_po');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid', 'reason']);
    });
  });

  describe('maximo_receive_po_line', () => {
    it('should receive line item via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_receive_po_line');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        receiveqty: 5,
        inspected: true,
        acceptedqty: 5,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.receiveLineItem.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.receiveLineItem).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          polinenum: 1,
          receiveqty: 5,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_receive_po_line');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid', 'polinenum', 'receiveqty']);
    });
  });

  describe('maximo_get_po_receipts', () => {
    it('should get receipts via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po_receipts');
      expect(tool).toBeDefined();

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      };

      const mockReceipts = {
        member: [{ receiptsid: 1, ponum: 'PO1001', quantity: 10 }],
      };
      const response = createMockApiResponse(mockReceipts);
      mockOperations.getReceipts.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getReceipts).toHaveBeenCalledWith(
        expect.objectContaining({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po_receipts');
      expect(tool.inputSchema.required).toEqual(['ponum', 'siteid']);
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_po');

      const invalidInput = {
        description: '', // Invalid: empty description
        vendor: 'VENDOR01',
        siteid: 'BEDFORD',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_po');

      const input = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      };

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });
});
