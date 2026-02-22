/**
 * Unit tests for WorkOrderOperations
 * Tests all 11 operation methods for work order management
 */

import { WorkOrderOperations } from '../../../../src/modules/work-orders/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
import {
  mockWorkOrder,
  mockApiResponse,
  mockLaborTransaction,
  mockMaterialTransaction,
  mockWorkLog,
} from '../../../fixtures/maximo-responses';
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

describe('WorkOrderOperations', () => {
  let operations: WorkOrderOperations;
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

    operations = new WorkOrderOperations(mockClient);
  });

  describe('create', () => {
    it('should create work order successfully', async () => {
      const input = {
        siteid: 'BEDFORD',
        description: 'Test Work Order',
        worktype: 'CM',
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkOrder);
    });

    it('should validate input data', async () => {
      const invalidInput = {
        siteid: '', // Invalid: empty siteid
        description: 'Test',
      };

      await expect(operations.create(invalidInput as any)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const input = {
        siteid: 'BEDFORD',
        description: 'Test Work Order',
        worktype: 'CM',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should retrieve work order by wonum and siteid', async () => {
      const response = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('WO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'wonum="WO1001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkOrder);
    });

    it('should return not found when work order does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('WO1001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update work order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const updateResponse = createMockApiResponse({
        ...mockWorkOrder,
        description: 'Updated description',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated description' };
      const result = await operations.update('WO1001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockWorkOrder.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if work order not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue({
        ...getResponse,
        success: false,
        error: 'Not found',
        statusCode: 404,
      });

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should validate update data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidData = { priority: 'invalid' }; // Should be number

      await expect(
        operations.update('WO1001', 'BEDFORD', invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete work order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('WO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockWorkOrder.href);
      expect(result.success).toBe(true);
    });

    it('should return error if work order not found', async () => {
      const getResponse = {
        success: false,
        error: 'Not found',
        statusCode: 404,
        headers: {},
        requestId: 'test-id',
      };
      mockClient.get.mockResolvedValue(getResponse as any);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('changeStatus', () => {
    it('should change work order status successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const updateResponse = createMockApiResponse({
        ...mockWorkOrder,
        status: 'APPR',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.changeStatus('WO1001', 'BEDFORD', 'APPR');

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockWorkOrder.href,
        expect.objectContaining({ status: 'APPR' })
      );
      expect(result.success).toBe(true);
    });

    it('should validate status transition', async () => {
      const closedWorkOrder = { ...mockWorkOrder, status: 'CLOSE' };
      const getResponse = createMockApiResponse({ member: [closedWorkOrder] });

      mockClient.get.mockResolvedValue(getResponse);

      // Try to change from CLOSE to WAPPR (invalid transition)
      const result = await operations.changeStatus('WO1001', 'BEDFORD', 'WAPPR');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status transition');
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle status change with memo', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const updateResponse = createMockApiResponse({
        ...mockWorkOrder,
        status: 'APPR',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.changeStatus(
        'WO1001',
        'BEDFORD',
        'APPR',
        'Approved by manager'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('addLabor', () => {
    it('should add labor transaction successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const laborResponse = createMockApiResponse(mockLaborTransaction);

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(laborResponse);

      const labor = {
        laborcode: 'LAB001',
        hours: 8,
        transdate: '2024-01-15',
      };

      const result = await operations.addLabor('WO1001', 'BEDFORD', labor);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WPLABOR`,
        expect.objectContaining({
          laborcode: 'LAB001',
          laborhrs: 8,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate labor transaction data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidLabor = {
        laborcode: '', // Invalid: empty laborcode
        hours: -1, // Invalid: negative hours
      };

      await expect(
        operations.addLabor('WO1001', 'BEDFORD', invalidLabor as any)
      ).rejects.toThrow();
    });

    it('should return error if work order not found', async () => {
      const getResponse = {
        success: false,
        error: 'Not found',
        statusCode: 404,
        headers: {},
        requestId: 'test-id',
      };
      mockClient.get.mockResolvedValue(getResponse as any);

      const labor = {
        laborcode: 'LAB001',
        hours: 8,
        transdate: '2024-01-15',
      };

      const result = await operations.addLabor('INVALID', 'BEDFORD', labor);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('addMaterial', () => {
    it('should add material transaction successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const materialResponse = createMockApiResponse(mockMaterialTransaction);

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(materialResponse);

      const material = {
        itemnum: 'ITEM001',
        quantity: 5,
        storeroom: 'CENTRAL',
      };

      const result = await operations.addMaterial('WO1001', 'BEDFORD', material);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WPMAT`,
        expect.objectContaining({
          itemnum: 'ITEM001',
          itemqty: 5,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate material transaction data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidMaterial = {
        itemnum: '', // Invalid: empty itemnum
        quantity: 0, // Invalid: zero quantity
      };

      await expect(
        operations.addMaterial('WO1001', 'BEDFORD', invalidMaterial as any)
      ).rejects.toThrow();
    });
  });

  describe('addService', () => {
    it('should add service entry successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const serviceResponse = createMockApiResponse({ description: 'Service entry' });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(serviceResponse);

      const service = {
        description: 'External service',
        linecost: 500.0,
        vendor: 'VENDOR001',
      };

      const result = await operations.addService('WO1001', 'BEDFORD', service);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WPSERVICE`,
        expect.objectContaining({
          description: 'External service',
          linecost: 500.0,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate service entry data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidService = {
        description: '', // Invalid: empty description
        linecost: -100, // Invalid: negative cost
      };

      await expect(
        operations.addService('WO1001', 'BEDFORD', invalidService as any)
      ).rejects.toThrow();
    });
  });

  describe('addWorkLog', () => {
    it('should add work log entry successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const worklogResponse = createMockApiResponse(mockWorkLog);

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(worklogResponse);

      const worklog = {
        description: 'Work completed',
        logtype: 'WORK',
      };

      const result = await operations.addWorkLog('WO1001', 'BEDFORD', worklog);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WORKLOG`,
        expect.objectContaining({
          description: 'Work completed',
          logtype: 'WORK',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should use default logtype if not provided', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const worklogResponse = createMockApiResponse(mockWorkLog);

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(worklogResponse);

      const worklog = {
        description: 'Work completed',
      };

      const result = await operations.addWorkLog('WO1001', 'BEDFORD', worklog);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WORKLOG`,
        expect.objectContaining({
          logtype: 'WORK', // Default value
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate work log data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidWorklog = {
        description: '', // Invalid: empty description
      };

      await expect(
        operations.addWorkLog('WO1001', 'BEDFORD', invalidWorklog as any)
      ).rejects.toThrow();
    });
  });

  describe('assign', () => {
    it('should assign work order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const assignResponse = createMockApiResponse({
        ...mockWorkOrder,
        owner: 'TECH001',
        ownergroup: 'MAINT',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(assignResponse);

      const assignment = {
        owner: 'TECH001',
        ownergroup: 'MAINT',
      };

      const result = await operations.assign('WO1001', 'BEDFORD', assignment);

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockWorkOrder.href,
        expect.objectContaining({
          owner: 'TECH001',
          ownergroup: 'MAINT',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle crew assignment', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const assignResponse = createMockApiResponse(mockWorkOrder);

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(assignResponse);

      const assignment = {
        crewworkgroup: 'CREW001',
        supervisor: 'SUPER001',
      };

      const result = await operations.assign('WO1001', 'BEDFORD', assignment);

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockWorkOrder.href,
        expect.objectContaining({
          crewworkgroup: 'CREW001',
          supervisor: 'SUPER001',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate assignment data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidAssignment = {}; // Invalid: no assignment fields

      await expect(
        operations.assign('WO1001', 'BEDFORD', invalidAssignment as any)
      ).rejects.toThrow();
    });
  });

  describe('search', () => {
    it('should search work orders with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: {
          totalCount: 1,
          pagenum: 1,
        },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'WAPPR',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="WAPPR"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.workOrders).toHaveLength(1);
    });

    it('should handle multiple status values', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['WAPPR', 'APPR', 'INPRG'],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ['),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle date range filter', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        dateRange: {
          field: 'statusdate',
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('statusdate>='),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle custom select fields', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        select: ['wonum', 'description', 'status'],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.select': 'wonum,description,status',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle orderBy parameter', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        orderBy: '-statusdate',
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.orderBy': '-statusdate',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle search terms', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        searchTerms: 'pump repair',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.searchTerms': 'pump repair',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return empty result when no data', async () => {
      const searchResponse = createMockApiResponse({
        member: [],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const result = await operations.search({ siteid: 'BEDFORD' });

      // The search operation returns success with an empty workOrders array
      // when the API returns an empty member array (response.data is truthy)
      expect(result.success).toBe(true);
      expect(result.data?.workOrders).toHaveLength(0);
    });

    it('should calculate pagination metadata', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockWorkOrder],
        responseInfo: {
          totalCount: 100,
          pagenum: 1,
          nextPage: { href: '/next' },
        },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        siteid: 'BEDFORD',
        pageSize: 10,
        page: 1,
      };

      const result = await operations.search(criteria);

      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(100);
      expect(result.data?.totalPages).toBe(10);
      expect(result.data?.hasNext).toBe(true);
      expect(result.data?.hasPrevious).toBe(false);
    });
  });

  describe('addTask', () => {
    it('should add task to work order successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      const taskResponse = createMockApiResponse({
        description: 'Inspect pump',
        taskid: 10,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(taskResponse);

      const task = {
        description: 'Inspect pump',
        taskid: 10,
        estdur: 2,
        owner: 'TECH001',
      };

      const result = await operations.addTask('WO1001', 'BEDFORD', task);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockWorkOrder.href}/WOACTIVITY`,
        expect.objectContaining({
          description: 'Inspect pump',
          taskid: 10,
          estdur: 2,
          owner: 'TECH001',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if work order not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const task = {
        description: 'Inspect pump',
        taskid: 10,
      };

      const result = await operations.addTask('INVALID', 'BEDFORD', task);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate task data', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const invalidTask = {
        description: '', // Invalid: empty description
        taskid: -1, // Invalid: negative taskid
      };

      await expect(
        operations.addTask('WO1001', 'BEDFORD', invalidTask as any)
      ).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('API Error'));

      const task = {
        description: 'Inspect pump',
        taskid: 10,
      };

      await expect(
        operations.addTask('WO1001', 'BEDFORD', task)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getTasks', () => {
    it('should retrieve tasks for work order successfully', async () => {
      const mockTasks = [
        { taskid: 10, description: 'Inspect pump', estdur: 2 },
        { taskid: 20, description: 'Replace filter', estdur: 1 },
      ];
      const response = createMockApiResponse({
        member: [{ ...mockWorkOrder, woactivity: mockTasks }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('WO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'wonum="WO1001" and siteid="BEDFORD"',
          'oslc.select': 'wonum,siteid,woactivity{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTasks);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when work order has no tasks', async () => {
      const response = createMockApiResponse({
        member: [{ ...mockWorkOrder }], // no woactivity field
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('WO1001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return not found when work order does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getTasks('WO1001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getWorkLogs', () => {
    it('should retrieve work logs for work order successfully', async () => {
      const mockLogs = [
        { ...mockWorkLog, worklogid: 1 },
        { ...mockWorkLog, worklogid: 2, description: 'Second log entry' },
      ];
      const response = createMockApiResponse({
        member: [{ ...mockWorkOrder, worklog: mockLogs }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getWorkLogs('WO1001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'wonum="WO1001" and siteid="BEDFORD"',
          'oslc.select': 'wonum,siteid,worklog{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogs);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when work order has no work logs', async () => {
      const response = createMockApiResponse({
        member: [{ ...mockWorkOrder }], // no worklog field
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getWorkLogs('WO1001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return not found when work order does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getWorkLogs('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getWorkLogs('WO1001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('close', () => {
    it('should close work order in COMP status successfully', async () => {
      const compWorkOrder = { ...mockWorkOrder, status: 'COMP' };
      // First call: close() calls get() to check status
      const getResponseForClose = createMockApiResponse({ member: [compWorkOrder] });
      // Second call: changeStatus() calls get() internally
      const getResponseForChangeStatus = createMockApiResponse({ member: [compWorkOrder] });
      const updateResponse = createMockApiResponse({
        ...compWorkOrder,
        status: 'CLOSE',
      });

      mockClient.get
        .mockResolvedValueOnce(getResponseForClose)
        .mockResolvedValueOnce(getResponseForChangeStatus);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.close('WO1001', 'BEDFORD');

      expect(result.success).toBe(true);
    });

    it('should close work order with memo', async () => {
      const compWorkOrder = { ...mockWorkOrder, status: 'COMP' };
      const getResponseForClose = createMockApiResponse({ member: [compWorkOrder] });
      const getResponseForChangeStatus = createMockApiResponse({ member: [compWorkOrder] });
      const updateResponse = createMockApiResponse({
        ...compWorkOrder,
        status: 'CLOSE',
      });

      mockClient.get
        .mockResolvedValueOnce(getResponseForClose)
        .mockResolvedValueOnce(getResponseForChangeStatus);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.close('WO1001', 'BEDFORD', 'All work completed');

      expect(result.success).toBe(true);
    });

    it('should reject close when work order is not in COMP status', async () => {
      // mockWorkOrder has status WAPPR
      const getResponse = createMockApiResponse({ member: [mockWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.close('WO1001', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('COMP');
      expect(result.error).toContain('WAPPR');
      expect(result.statusCode).toBe(400);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should reject close when work order is in INPRG status', async () => {
      const inprgWorkOrder = { ...mockWorkOrder, status: 'INPRG' };
      const getResponse = createMockApiResponse({ member: [inprgWorkOrder] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.close('WO1001', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('COMP');
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should return error if work order not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.close('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.close('WO1001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });
});