/**
 * Unit tests for JobPlanOperations
 * Tests all 11 operation methods for job plan management
 */

import { JobPlanOperations } from '../../../../src/modules/plans/operations';
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

/** Job plans endpoint used by the operations class */
const JOB_PLANS_ENDPOINT = '/maximo/api/os/mxjobplan';

/** Reusable mock job plan fixture */
const mockJobPlan = {
  jpnum: 'JP001',
  description: 'Test Job Plan',
  siteid: 'BEDFORD',
  orgid: 'EAGLENA',
  status: 'DRAFT',
  priority: 2,
  duration: 4,
  href: 'http://maximo.example.com/maximo/oslc/os/mxjobplan/1',
};

describe('JobPlanOperations', () => {
  let operations: JobPlanOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new JobPlanOperations(mockClient);
  });

  describe('create', () => {
    it('should create job plan successfully', async () => {
      const input = {
        jpnum: 'JP001',
        description: 'Test Job Plan',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockJobPlan);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobPlan);
    });

    it('should handle API errors on create', async () => {
      const input = {
        jpnum: 'JP001',
        description: 'Test Job Plan',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should retrieve job plan by jpnum and siteid', async () => {
      const response = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('JP001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining({
          'oslc.where': 'jpnum="JP001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobPlan);
    });

    it('should retrieve job plan by jpnum only (no siteid)', async () => {
      const response = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('JP001');

      expect(mockClient.get).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining({
          'oslc.where': 'jpnum="JP001"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return not found when job plan does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors on get', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('JP001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const updateResponse = createMockApiResponse({
        ...mockJobPlan,
        description: 'Updated description',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated description' };
      const result = await operations.update('JP001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockJobPlan.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for update', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on update', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Update failed'));

      await expect(
        operations.update('JP001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('JP001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockJobPlan.href);
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for delete', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors on delete', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(operations.delete('JP001', 'BEDFORD')).rejects.toThrow('Delete failed');
    });
  });

  describe('search', () => {
    it('should search job plans with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockJobPlan],
        responseInfo: {
          totalCount: 1,
          pagenum: 1,
        },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'DRAFT' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="DRAFT"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.jobPlans).toHaveLength(1);
    });

    it('should handle multiple status values in search', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockJobPlan],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['DRAFT', 'ACTIVE'] as ('DRAFT' | 'ACTIVE')[],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ['),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return empty result when no data', async () => {
      const searchResponse = createMockApiResponse(null as any, {
        success: false,
      });
      mockClient.get.mockResolvedValue(searchResponse);

      const result = await operations.search({ siteid: 'BEDFORD' });

      expect(result.success).toBe(false);
    });

    it('should handle API errors on search', async () => {
      mockClient.get.mockRejectedValue(new Error('Search failed'));

      await expect(operations.search({ siteid: 'BEDFORD' })).rejects.toThrow('Search failed');
    });
  });

  describe('addTask', () => {
    it('should add task to job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const taskResponse = createMockApiResponse({
        jptask: 10,
        description: 'Inspect pump',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(taskResponse);

      const taskData = {
        jptask: 10,
        description: 'Inspect pump',
        duration: 2,
      };

      const result = await operations.addTask('JP001', 'BEDFORD', taskData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockJobPlan.href}/JOBTASK`,
        expect.objectContaining({
          jptask: 10,
          description: 'Inspect pump',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for addTask', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const taskData = {
        jptask: 10,
        description: 'Inspect pump',
      };

      const result = await operations.addTask('INVALID', 'BEDFORD', taskData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on addTask', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Task add failed'));

      const taskData = {
        jptask: 10,
        description: 'Inspect pump',
      };

      await expect(
        operations.addTask('JP001', 'BEDFORD', taskData)
      ).rejects.toThrow('Task add failed');
    });
  });

  describe('getTasks', () => {
    it('should retrieve tasks for job plan successfully', async () => {
      const mockTasks = [
        { jptask: 10, description: 'Inspect pump', duration: 2 },
        { jptask: 20, description: 'Replace filter', duration: 1 },
      ];
      const response = createMockApiResponse({
        member: [{ ...mockJobPlan, jobtask: mockTasks }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('JP001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        JOB_PLANS_ENDPOINT,
        expect.objectContaining({
          'oslc.where': 'jpnum="JP001" and siteid="BEDFORD"',
          'oslc.select': 'jpnum,siteid,jobtask{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTasks);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when job plan has no tasks', async () => {
      const response = createMockApiResponse({
        member: [{ ...mockJobPlan }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('JP001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return not found when job plan does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getTasks('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors on getTasks', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getTasks('JP001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('addLabor', () => {
    it('should add labor requirement to job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const laborResponse = createMockApiResponse({
        craft: 'ELECT',
        quantity: 2,
        laborhrs: 8,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(laborResponse);

      const laborData = {
        craft: 'ELECT',
        quantity: 2,
        hours: 8,
      };

      const result = await operations.addLabor('JP001', 'BEDFORD', laborData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockJobPlan.href}/JOBLABOR`,
        expect.objectContaining({
          craft: 'ELECT',
          quantity: 2,
          laborhrs: 8,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for addLabor', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const laborData = {
        craft: 'ELECT',
        quantity: 2,
        hours: 8,
      };

      const result = await operations.addLabor('INVALID', 'BEDFORD', laborData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on addLabor', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Labor add failed'));

      const laborData = {
        craft: 'ELECT',
        quantity: 2,
        hours: 8,
      };

      await expect(
        operations.addLabor('JP001', 'BEDFORD', laborData)
      ).rejects.toThrow('Labor add failed');
    });
  });

  describe('addMaterial', () => {
    it('should add material requirement to job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const materialResponse = createMockApiResponse({
        itemnum: 'ITEM001',
        itemqty: 5,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(materialResponse);

      const materialData = {
        itemnum: 'ITEM001',
        itemqty: 5,
        storeroom: 'CENTRAL',
      };

      const result = await operations.addMaterial('JP001', 'BEDFORD', materialData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockJobPlan.href}/JOBMATERIAL`,
        expect.objectContaining({
          itemnum: 'ITEM001',
          itemqty: 5,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for addMaterial', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const materialData = {
        itemnum: 'ITEM001',
        itemqty: 5,
      };

      const result = await operations.addMaterial('INVALID', 'BEDFORD', materialData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on addMaterial', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Material add failed'));

      const materialData = {
        itemnum: 'ITEM001',
        itemqty: 5,
      };

      await expect(
        operations.addMaterial('JP001', 'BEDFORD', materialData)
      ).rejects.toThrow('Material add failed');
    });
  });

  describe('addService', () => {
    it('should add service requirement to job plan successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      const serviceResponse = createMockApiResponse({
        description: 'External consulting',
        linecost: 1000,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(serviceResponse);

      const serviceData = {
        description: 'External consulting',
        vendor: 'VENDOR01',
        linecost: 1000,
      };

      const result = await operations.addService('JP001', 'BEDFORD', serviceData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockJobPlan.href}/JOBSERVICE`,
        expect.objectContaining({
          description: 'External consulting',
          vendor: 'VENDOR01',
          linecost: 1000,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if job plan not found for addService', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const serviceData = {
        description: 'External consulting',
      };

      const result = await operations.addService('INVALID', 'BEDFORD', serviceData);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on addService', async () => {
      const getResponse = createMockApiResponse({ member: [mockJobPlan] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Service add failed'));

      const serviceData = {
        description: 'External consulting',
      };

      await expect(
        operations.addService('JP001', 'BEDFORD', serviceData)
      ).rejects.toThrow('Service add failed');
    });
  });

  describe('getAssociatedWorkOrders', () => {
    it('should retrieve associated work orders successfully', async () => {
      const mockWorkOrders = [
        { wonum: 'WO1001', description: 'Work Order 1', status: 'WAPPR', siteid: 'BEDFORD', jpnum: 'JP001' },
        { wonum: 'WO1002', description: 'Work Order 2', status: 'APPR', siteid: 'BEDFORD', jpnum: 'JP001' },
      ];
      const response = createMockApiResponse({
        member: mockWorkOrders,
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getAssociatedWorkOrders('JP001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'jpnum="JP001" and siteid="BEDFORD"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when no associated work orders', async () => {
      const response = createMockApiResponse({
        member: [],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getAssociatedWorkOrders('JP001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle API errors on getAssociatedWorkOrders', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getAssociatedWorkOrders('JP001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });
});
