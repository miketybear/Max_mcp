/**
 * Unit tests for ServiceRequestOperations
 * Tests all 12 operation methods for service request management
 */

import { ServiceRequestOperations } from '../../../../src/modules/service-requests/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
import { mockServiceRequest } from '../../../fixtures/maximo-responses';
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

// Extended mock service request with all fields needed for tests
const mockSR = {
  ...mockServiceRequest,
  orgid: 'EAGLENA',
  reportedpriority: 2,
};

// Mock service request in INPROG status (for status transition tests)
const mockSRInProgress = {
  ...mockSR,
  status: 'INPROG' as const,
};

describe('ServiceRequestOperations', () => {
  let operations: ServiceRequestOperations;
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

    operations = new ServiceRequestOperations(mockClient);
  });

  describe('create', () => {
    it('should create a service request successfully', async () => {
      const input = {
        description: 'Broken printer on 3rd floor',
        reportedby: 'USER001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockSR);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.SERVICE_REQUESTS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSR);
    });

    it('should handle API errors when creating service request', async () => {
      const input = {
        description: 'Test SR',
        reportedby: 'USER001',
        siteid: 'BEDFORD',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });

    it('should reject validation errors for missing required fields', async () => {
      const invalidInput = {
        description: '',
        reportedby: 'USER001',
        siteid: 'BEDFORD',
      };

      await expect(operations.create(invalidInput as any)).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve service request by ticket ID', async () => {
      const response = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('SR1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.SERVICE_REQUESTS,
        expect.objectContaining({
          'oslc.where': 'ticketid="SR1001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSR);
    });

    it('should return not found when service request does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toContain('not found');
    });

    it('should handle API errors when getting service request', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('SR1001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update service request successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        description: 'Updated description',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated description' };
      const result = await operations.update('SR1001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockSR.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if service request not found for update', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors when updating service request', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Update failed'));

      await expect(
        operations.update('SR1001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete service request successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const deleteResponse = createMockApiResponse(undefined as any, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('SR1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockSR.href);
      expect(result.success).toBe(true);
    });

    it('should return error if service request not found for deletion', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors when deleting service request', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(operations.delete('SR1001', 'BEDFORD')).rejects.toThrow('Delete failed');
    });
  });

  describe('changeStatus', () => {
    it('should change service request status successfully', async () => {
      // Mock get to return SR in NEW status
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        status: 'QUEUED',
      });

      // get is called twice: once in changeStatus, once in update
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.changeStatus('SR1001', 'BEDFORD', 'QUEUED');

      expect(result.success).toBe(true);
    });

    it('should reject invalid status transition', async () => {
      const closedSR = { ...mockSR, status: 'CLOSED' };
      const getResponse = createMockApiResponse({ member: [closedSR] });
      mockClient.get.mockResolvedValue(getResponse);

      // CLOSED -> NEW is not a valid transition
      await expect(
        operations.changeStatus('SR1001', 'BEDFORD', 'NEW')
      ).rejects.toThrow('Invalid status transition');
    });

    it('should handle API errors when changing status', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Status change failed'));

      await expect(
        operations.changeStatus('SR1001', 'BEDFORD', 'QUEUED')
      ).rejects.toThrow('Status change failed');
    });
  });

  describe('convertToWorkOrder', () => {
    it('should convert service request to work order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const woResponse = createMockApiResponse({
        wonum: 'WO2001',
        description: mockSR.description,
        siteid: mockSR.siteid,
      });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        relatedwonum: 'WO2001',
      });

      // First call: get SR, second call: get SR for update, third call: get SR for update
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(woResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.convertToWorkOrder('SR1001', 'BEDFORD', 'CM');

      expect(result.success).toBe(true);
      expect(result.data?.wonum).toBe('WO2001');
      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          description: mockSR.description,
          siteid: mockSR.siteid,
        })
      );
    });

    it('should return error if service request not found for conversion', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.convertToWorkOrder('INVALID', 'BEDFORD');

      expect(result.data?.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors when converting to work order', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Conversion failed'));

      await expect(
        operations.convertToWorkOrder('SR1001', 'BEDFORD')
      ).rejects.toThrow('Conversion failed');
    });
  });

  describe('search', () => {
    it('should search service requests with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockSR],
        responseInfo: {
          totalCount: 1,
        },
      });
      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'NEW' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.SERVICE_REQUESTS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="NEW"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.serviceRequests).toHaveLength(1);
    });

    it('should handle multiple status values', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockSR],
        responseInfo: { totalCount: 1 },
      });
      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['NEW', 'QUEUED', 'INPROG'] as const,
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria as any);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.SERVICE_REQUESTS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ['),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle date range filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockSR],
        responseInfo: { totalCount: 1 },
      });
      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
          field: 'reportdate' as const,
        },
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.SERVICE_REQUESTS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('reportdate>="2024-01-01T00:00:00Z"'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors when searching', async () => {
      mockClient.get.mockRejectedValue(new Error('Search failed'));

      await expect(operations.search({ siteid: 'BEDFORD' })).rejects.toThrow(
        'Search failed'
      );
    });

    it('should return error when API response is unsuccessful', async () => {
      const failResponse = createMockApiResponse(null as any, {
        success: false,
        error: 'Search error',
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(failResponse);

      const result = await operations.search({ siteid: 'BEDFORD' });

      expect(result.success).toBe(false);
    });
  });

  describe('addWorkLog', () => {
    it('should add work log entry successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const worklogResponse = createMockApiResponse({
        worklogid: 1,
        logtype: 'CLIENTNOTE',
        description: 'Customer called about status',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(worklogResponse);

      const worklog = {
        description: 'Customer called about status',
        logtype: 'CLIENTNOTE' as const,
      };

      const result = await operations.addWorkLog('SR1001', 'BEDFORD', worklog);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockSR.href}/WORKLOG`,
        expect.objectContaining({
          description: 'Customer called about status',
          logtype: 'CLIENTNOTE',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if service request not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const worklog = {
        description: 'Test log',
      };

      const result = await operations.addWorkLog('INVALID', 'BEDFORD', worklog);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors when adding work log', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('WorkLog failed'));

      await expect(
        operations.addWorkLog('SR1001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('WorkLog failed');
    });
  });

  describe('assign', () => {
    it('should assign service request successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        owner: 'TECH001',
        ownergroup: 'SUPPORT',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const assignment = {
        owner: 'TECH001',
        ownergroup: 'SUPPORT',
      };

      const result = await operations.assign('SR1001', 'BEDFORD', assignment);

      expect(result.success).toBe(true);
    });

    it('should handle assignment with owner only (no group)', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        owner: 'TECH001',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const assignment = {
        owner: 'TECH001',
      };

      const result = await operations.assign('SR1001', 'BEDFORD', assignment);

      expect(result.success).toBe(true);
    });

    it('should handle API errors when assigning', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Assignment failed'));

      await expect(
        operations.assign('SR1001', 'BEDFORD', { owner: 'TECH001' })
      ).rejects.toThrow('Assignment failed');
    });
  });

  describe('escalate', () => {
    it('should escalate service request priority successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      const updateResponse = createMockApiResponse({
        ...mockSR,
        reportedpriority: 1,
      });
      const worklogResponse = createMockApiResponse({
        worklogid: 2,
        logtype: 'WORK',
        description: 'Escalation: Priority changed to 1',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);
      mockClient.post.mockResolvedValue(worklogResponse);

      const escalation = {
        newPriority: 1,
        escalationReason: 'Customer VIP - needs immediate attention',
        newOwnerGroup: 'ESCL',
      };

      const result = await operations.escalate('SR1001', 'BEDFORD', escalation);

      expect(result.success).toBe(true);
      // Should have called addWorkLog via post to add escalation reason
      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockSR.href}/WORKLOG`,
        expect.objectContaining({
          logtype: 'WORK',
        })
      );
    });

    it('should handle API errors when escalating', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Escalation failed'));

      const escalation = {
        newPriority: 1,
        escalationReason: 'Urgent',
      };

      await expect(
        operations.escalate('SR1001', 'BEDFORD', escalation)
      ).rejects.toThrow('Escalation failed');
    });
  });

  describe('getRelatedWorkOrders', () => {
    it('should retrieve related work orders successfully', async () => {
      const mockWO = {
        wonum: 'WO2001',
        description: 'Work order from SR',
        siteid: 'BEDFORD',
        status: 'WAPPR',
      };

      const response = createMockApiResponse({
        member: [mockWO],
        responseInfo: { totalCount: 1 },
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getRelatedWorkOrders('SR1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'origrecordid="SR1001" and siteid="BEDFORD"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.workOrders).toHaveLength(1);
      expect(result.data?.ticketid).toBe('SR1001');
    });

    it('should return empty list when no related work orders', async () => {
      const response = createMockApiResponse({
        member: [],
        responseInfo: { totalCount: 0 },
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getRelatedWorkOrders('SR1001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.workOrders).toHaveLength(0);
      expect(result.data?.totalCount).toBe(0);
    });

    it('should handle API errors when getting related work orders', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getRelatedWorkOrders('SR1001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });

    it('should return error when API response is unsuccessful', async () => {
      const failResponse = createMockApiResponse(null as any, {
        success: false,
        error: 'Failed',
        statusCode: 500,
      });
      mockClient.get.mockResolvedValue(failResponse);

      const result = await operations.getRelatedWorkOrders('SR1001', 'BEDFORD');

      expect(result.success).toBe(false);
    });
  });

  describe('addSolution', () => {
    it('should add solution to service request successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockSRInProgress] });
      const updateResponse = createMockApiResponse({
        ...mockSRInProgress,
        solution: 'Replaced printer toner',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const solution = {
        solution: 'Replaced printer toner',
      };

      const result = await operations.addSolution('SR1001', 'BEDFORD', solution);

      expect(result.success).toBe(true);
    });

    it('should auto-resolve when autoResolve is true', async () => {
      const getResponse = createMockApiResponse({ member: [mockSRInProgress] });
      const updateResponse = createMockApiResponse({
        ...mockSRInProgress,
        solution: 'Replaced printer toner',
        status: 'RESOLVED',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const solution = {
        solution: 'Replaced printer toner',
        autoResolve: true,
      };

      const result = await operations.addSolution('SR1001', 'BEDFORD', solution);

      expect(result.success).toBe(true);
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockSRInProgress.href,
        expect.objectContaining({
          solution: 'Replaced printer toner',
          status: 'RESOLVED',
        })
      );
    });

    it('should handle API errors when adding solution', async () => {
      const getResponse = createMockApiResponse({ member: [mockSR] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Solution failed'));

      await expect(
        operations.addSolution('SR1001', 'BEDFORD', { solution: 'Test' })
      ).rejects.toThrow('Solution failed');
    });
  });
});
