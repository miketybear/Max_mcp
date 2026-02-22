/**
 * Unit tests for PurchaseOrderOperations
 * Tests all 15 operation methods for purchase order management
 */

import { PurchaseOrderOperations } from '../../../../src/modules/purchase-orders/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
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
  orgid: 'EAGLENA',
  status: 'WAPPR',
  potype: 'STANDARD',
  orderdate: '2024-01-15T00:00:00Z',
  totalcost: 5000.0,
  buyer: 'BUYER01',
  poline: [
    {
      polinenum: 1,
      itemnum: 'ITEM001',
      description: 'Test Item',
      orderqty: 10,
      unitcost: 25.0,
    },
  ],
  href: 'http://maximo.example.com/maximo/oslc/os/mxpo/1',
};

describe('PurchaseOrderOperations', () => {
  let operations: PurchaseOrderOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new PurchaseOrderOperations(mockClient);
  });

  describe('create', () => {
    it('should create purchase order successfully', async () => {
      const input = {
        description: 'Test Purchase Order',
        vendor: 'VENDOR01',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockPO);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPO);
    });

    it('should handle API errors on create', async () => {
      const input = {
        description: 'Test Purchase Order',
        vendor: 'VENDOR01',
        siteid: 'BEDFORD',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should retrieve purchase order by ponum and siteid', async () => {
      const response = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('PO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': 'ponum="PO1001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPO);
    });

    it('should retrieve purchase order by ponum only (no siteid)', async () => {
      const response = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('PO1001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': 'ponum="PO1001"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return not found when purchase order does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors on get', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('PO1001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update purchase order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const updateResponse = createMockApiResponse({
        ...mockPO,
        description: 'Updated PO',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated PO' };
      const result = await operations.update('PO1001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPO.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for update', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should return error if PO has no href', async () => {
      const poNoHref = { ...mockPO, href: undefined };
      const getResponse = createMockApiResponse({ member: [poNoHref] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('PO1001', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('href not found');
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on update', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Update failed'));

      await expect(
        operations.update('PO1001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete purchase order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('PO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockPO.href);
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for delete', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors on delete', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(operations.delete('PO1001', 'BEDFORD')).rejects.toThrow('Delete failed');
    });
  });

  describe('receive', () => {
    it('should receive PO items successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const receiveResponse = createMockApiResponse({
        ponum: 'PO1001',
        polinenum: 1,
        quantity: 10,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(receiveResponse);

      const receiptData = {
        ponum: 'PO1001',
        polinenum: 1,
        quantity: 10,
        siteid: 'BEDFORD',
      };

      const result = await operations.receive(receiptData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/api/os/mxreceipt',
        expect.objectContaining({
          ponum: 'PO1001',
          polinenum: 1,
          quantity: 10,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for receive', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const receiptData = {
        ponum: 'INVALID',
        polinenum: 1,
        quantity: 10,
      };

      const result = await operations.receive(receiptData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on receive', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Receive failed'));

      const receiptData = {
        ponum: 'PO1001',
        polinenum: 1,
        quantity: 10,
      };

      await expect(operations.receive(receiptData)).rejects.toThrow('Receive failed');
    });
  });

  describe('approve', () => {
    it('should approve purchase order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const approveResponse = createMockApiResponse({
        ...mockPO,
        status: 'APPR',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(approveResponse);

      const result = await operations.approve({
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        memo: 'Approved by manager',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPO.href,
        expect.objectContaining({
          status: 'APPR',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for approve', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.approve({
        ponum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on approve', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Approve failed'));

      await expect(
        operations.approve({ ponum: 'PO1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Approve failed');
    });
  });

  describe('search', () => {
    it('should search purchase orders with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockPO],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'WAPPR' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="WAPPR"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle multiple status values in search', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockPO],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['WAPPR', 'APPR'] as ('WAPPR' | 'APPR')[],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ('),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle date range filter in search', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockPO],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        dateFrom: '2024-01-01T00:00:00Z',
        dateTo: '2024-01-31T00:00:00Z',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('orderdate>="2024-01-01T00:00:00Z"'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors on search', async () => {
      mockClient.get.mockRejectedValue(new Error('Search failed'));

      await expect(operations.search({ siteid: 'BEDFORD' })).rejects.toThrow('Search failed');
    });
  });

  describe('addLineItem', () => {
    it('should add line item to PO successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const lineResponse = createMockApiResponse({
        polinenum: 2,
        description: 'New Item',
        orderqty: 5,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(lineResponse);

      const lineData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        description: 'New Item',
        orderqty: 5,
        unitcost: 10.0,
      };

      const result = await operations.addLineItem(lineData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockPO.href}/POLINE`,
        expect.objectContaining({
          description: 'New Item',
          orderqty: 5,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for addLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const lineData = {
        ponum: 'INVALID',
        siteid: 'BEDFORD',
        description: 'New Item',
        orderqty: 5,
      };

      const result = await operations.addLineItem(lineData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on addLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Add line failed'));

      const lineData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        description: 'New Item',
        orderqty: 5,
      };

      await expect(operations.addLineItem(lineData)).rejects.toThrow('Add line failed');
    });
  });

  describe('getLineItems', () => {
    it('should retrieve line items for PO successfully', async () => {
      const response = createMockApiResponse({
        member: [mockPO],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLineItems('PO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PURCHASE_ORDERS,
        expect.objectContaining({
          'oslc.where': 'ponum="PO1001" and siteid="BEDFORD"',
          'oslc.select': 'ponum,siteid,poline{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPO.poline);
    });

    it('should return not found when PO does not exist for getLineItems', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLineItems('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors on getLineItems', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getLineItems('PO1001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateLineItem', () => {
    it('should update line item successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const patchResponse = createMockApiResponse({
        polinenum: 1,
        orderqty: 20,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const updateData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        orderqty: 20,
      };

      const result = await operations.updateLineItem(updateData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `${mockPO.href}/POLINE/1`,
        expect.objectContaining({
          orderqty: 20,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for updateLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const updateData = {
        ponum: 'INVALID',
        siteid: 'BEDFORD',
        polinenum: 1,
        orderqty: 20,
      };

      const result = await operations.updateLineItem(updateData);

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on updateLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Update line failed'));

      const updateData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        orderqty: 20,
      };

      await expect(operations.updateLineItem(updateData)).rejects.toThrow('Update line failed');
    });
  });

  describe('removeLineItem', () => {
    it('should remove line item successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const removeData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
      };

      const result = await operations.removeLineItem(removeData);

      expect(mockClient.delete).toHaveBeenCalledWith(`${mockPO.href}/POLINE/1`);
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for removeLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const removeData = {
        ponum: 'INVALID',
        siteid: 'BEDFORD',
        polinenum: 1,
      };

      const result = await operations.removeLineItem(removeData);

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors on removeLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('Remove line failed'));

      const removeData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
      };

      await expect(operations.removeLineItem(removeData)).rejects.toThrow('Remove line failed');
    });
  });

  describe('submitForApproval', () => {
    it('should submit PO for approval successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const patchResponse = createMockApiResponse({
        ...mockPO,
        status: 'WAPPR',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.submitForApproval({
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        memo: 'Please approve',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPO.href,
        expect.objectContaining({
          status: 'WAPPR',
          comments: 'Please approve',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for submitForApproval', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.submitForApproval({
        ponum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on submitForApproval', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Submit failed'));

      await expect(
        operations.submitForApproval({ ponum: 'PO1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Submit failed');
    });
  });

  describe('rejectPO', () => {
    it('should reject purchase order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const patchResponse = createMockApiResponse({
        ...mockPO,
        status: 'CAN',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.rejectPO({
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        reason: 'Budget exceeded',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPO.href,
        expect.objectContaining({
          status: 'CAN',
          comments: 'Rejected: Budget exceeded',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for rejectPO', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.rejectPO({
        ponum: 'INVALID',
        siteid: 'BEDFORD',
        reason: 'Budget exceeded',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on rejectPO', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Reject failed'));

      await expect(
        operations.rejectPO({
          ponum: 'PO1001',
          siteid: 'BEDFORD',
          reason: 'Budget exceeded',
        })
      ).rejects.toThrow('Reject failed');
    });
  });

  describe('receiveLineItem', () => {
    it('should receive line item successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      const receiptResponse = createMockApiResponse({
        ponum: 'PO1001',
        polinenum: 1,
        quantity: 5,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(receiptResponse);

      const receiveData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        receiveqty: 5,
        inspected: true,
        acceptedqty: 5,
      };

      const result = await operations.receiveLineItem(receiveData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/api/os/mxreceipt',
        expect.objectContaining({
          ponum: 'PO1001',
          polinenum: 1,
          quantity: 5,
          inspected: true,
          acceptedqty: 5,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PO not found for receiveLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const receiveData = {
        ponum: 'INVALID',
        siteid: 'BEDFORD',
        polinenum: 1,
        receiveqty: 5,
      };

      const result = await operations.receiveLineItem(receiveData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on receiveLineItem', async () => {
      const getResponse = createMockApiResponse({ member: [mockPO] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Receive line failed'));

      const receiveData = {
        ponum: 'PO1001',
        siteid: 'BEDFORD',
        polinenum: 1,
        receiveqty: 5,
      };

      await expect(operations.receiveLineItem(receiveData)).rejects.toThrow('Receive line failed');
    });
  });

  describe('getReceipts', () => {
    it('should retrieve receipts for PO successfully', async () => {
      const mockReceipts = {
        member: [
          {
            receiptsid: 1,
            ponum: 'PO1001',
            polinenum: 1,
            quantity: 10,
            receiptdate: '2024-02-01T00:00:00Z',
          },
        ],
      };
      const response = createMockApiResponse(mockReceipts);
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getReceipts({
        ponum: 'PO1001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxreceipt',
        expect.objectContaining({
          'oslc.where': 'ponum="PO1001" and siteid="BEDFORD"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors on getReceipts', async () => {
      mockClient.get.mockRejectedValue(new Error('Receipts fetch failed'));

      await expect(
        operations.getReceipts({ ponum: 'PO1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Receipts fetch failed');
    });
  });
});
