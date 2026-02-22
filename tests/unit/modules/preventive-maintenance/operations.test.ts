/**
 * Unit tests for PMOperations
 * Tests all 13 operation methods for preventive maintenance management
 */

import { PMOperations } from '../../../../src/modules/preventive-maintenance/operations';
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

/** Reusable mock PM record fixture */
const mockPM = {
  pmnum: 'PM001',
  description: 'Test PM Record',
  siteid: 'BEDFORD',
  orgid: 'EAGLENA',
  status: 'ACTIVE',
  frequency: 30,
  frequnit: 'DAYS',
  assetnum: 'ASSET001',
  location: 'LOC001',
  nextdate: '2024-03-01T00:00:00Z',
  lastcompdate: '2024-02-01T00:00:00Z',
  jpnum: 'JP001',
  href: 'http://maximo.example.com/maximo/oslc/os/mxpm/1',
};

describe('PMOperations', () => {
  let operations: PMOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new PMOperations(mockClient);
  });

  describe('create', () => {
    it('should create PM record successfully', async () => {
      const input = {
        description: 'Test PM Record',
        siteid: 'BEDFORD',
        frequency: 30,
        frequnit: 'DAYS' as const,
      };

      const response = createMockApiResponse(mockPM);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPM);
    });

    it('should handle API errors on create', async () => {
      const input = {
        description: 'Test PM Record',
        siteid: 'BEDFORD',
        frequency: 30,
        frequnit: 'DAYS' as const,
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should retrieve PM record by pmnum and siteid', async () => {
      const response = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('PM001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.where': 'pmnum="PM001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPM);
    });

    it('should retrieve PM record by pmnum only (no siteid)', async () => {
      const response = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('PM001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.where': 'pmnum="PM001"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return not found when PM does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors on get', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('PM001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update PM record successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const updateResponse = createMockApiResponse({
        ...mockPM,
        description: 'Updated PM',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated PM' };
      const result = await operations.update('PM001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPM.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for update', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should return error if PM has no href', async () => {
      const pmNoHref = { ...mockPM, href: undefined };
      const getResponse = createMockApiResponse({ member: [pmNoHref] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('PM001', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('href not found');
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on update', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Update failed'));

      await expect(
        operations.update('PM001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete PM record successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('PM001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockPM.href);
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for delete', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors on delete', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(operations.delete('PM001', 'BEDFORD')).rejects.toThrow('Delete failed');
    });
  });

  describe('generateWorkOrders', () => {
    it('should generate work orders from PM successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const genResponse = createMockApiResponse({
        member: [{ wonum: 'WO5001' }, { wonum: 'WO5002' }],
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(genResponse);

      const result = await operations.generateWorkOrders({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockPM.href}/generateworkorders`,
        expect.objectContaining({
          pmnum: 'PM001',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.workOrders).toEqual(['WO5001', 'WO5002']);
    });

    it('should return error if PM not found for generateWorkOrders', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.generateWorkOrders({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors on generateWorkOrders', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('Generation failed'));

      await expect(
        operations.generateWorkOrders({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Generation failed');
    });
  });

  describe('createJobPlan', () => {
    it('should create job plan successfully', async () => {
      const input = {
        jpnum: 'JP002',
        description: 'New Job Plan',
        siteid: 'BEDFORD',
      };

      const mockJP = {
        jpnum: 'JP002',
        description: 'New Job Plan',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockJP);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.createJobPlan(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/api/os/mxjp',
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors on createJobPlan', async () => {
      const input = {
        jpnum: 'JP002',
        description: 'New Job Plan',
        siteid: 'BEDFORD',
      };

      mockClient.post.mockRejectedValue(new Error('Create failed'));

      await expect(operations.createJobPlan(input)).rejects.toThrow('Create failed');
    });
  });

  describe('search', () => {
    it('should search PM records with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockPM],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'ACTIVE' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="ACTIVE"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle multiple status values in search', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockPM],
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['ACTIVE', 'INACTIVE'] as ('ACTIVE' | 'INACTIVE')[],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ('),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API errors on search', async () => {
      mockClient.get.mockRejectedValue(new Error('Search failed'));

      await expect(operations.search({ siteid: 'BEDFORD' })).rejects.toThrow('Search failed');
    });
  });

  describe('completePM', () => {
    it('should mark PM as completed successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const patchResponse = createMockApiResponse({
        ...mockPM,
        lastcompdate: '2024-02-15T00:00:00Z',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.completePM({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        completionDate: '2024-02-15T00:00:00Z',
        memo: 'Work completed',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPM.href,
        expect.objectContaining({
          lastcompdate: '2024-02-15T00:00:00Z',
          comments: 'Work completed',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for completePM', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.completePM({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on completePM', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Complete failed'));

      await expect(
        operations.completePM({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Complete failed');
    });
  });

  describe('getPMHistory', () => {
    it('should retrieve PM history successfully', async () => {
      const mockHistory = {
        member: [
          { wonum: 'WO5001', status: 'CLOSE', actstart: '2024-01-01T00:00:00Z', actfinish: '2024-01-02T00:00:00Z', description: 'PM WO 1' },
          { wonum: 'WO5002', status: 'COMP', actstart: '2024-02-01T00:00:00Z', actfinish: '2024-02-02T00:00:00Z', description: 'PM WO 2' },
        ],
        totalCount: 2,
      };
      const response = createMockApiResponse(mockHistory);
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getPMHistory({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': 'pmnum="PM001" and siteid="BEDFORD"',
          'oslc.orderBy': '-actstart',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.member).toHaveLength(2);
    });

    it('should handle API errors on getPMHistory', async () => {
      mockClient.get.mockRejectedValue(new Error('History fetch failed'));

      await expect(
        operations.getPMHistory({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('History fetch failed');
    });
  });

  describe('getPMSchedule', () => {
    it('should calculate PM schedule successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getPMSchedule({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        count: 3,
      });

      expect(result.success).toBe(true);
      expect(result.data?.pmnum).toBe('PM001');
      expect(result.data?.frequency).toBe(30);
      expect(result.data?.frequnit).toBe('DAYS');
      expect(result.data?.projectedDates).toHaveLength(3);
      expect(result.data?.projectedDates[0].sequence).toBe(1);
    });

    it('should return error if PM not found for getPMSchedule', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getPMSchedule({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
    });

    it('should return error if PM has no nextdate', async () => {
      const pmNoDate = { ...mockPM, nextdate: undefined };
      const getResponse = createMockApiResponse({ member: [pmNoDate] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getPMSchedule({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not have a next scheduled date');
    });

    it('should return error for meter-based PM schedule', async () => {
      const pmMeterBased = { ...mockPM, frequnit: 'METERS' };
      const getResponse = createMockApiResponse({ member: [pmMeterBased] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getPMSchedule({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('time-based frequency units');
    });

    it('should handle API errors on getPMSchedule', async () => {
      mockClient.get.mockRejectedValue(new Error('Schedule fetch failed'));

      await expect(
        operations.getPMSchedule({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Schedule fetch failed');
    });
  });

  describe('updatePMFrequency', () => {
    it('should update PM frequency successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const patchResponse = createMockApiResponse({
        ...mockPM,
        frequency: 14,
        frequnit: 'WEEKS',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.updatePMFrequency({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        frequency: 14,
        frequnit: 'WEEKS',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPM.href,
        expect.objectContaining({
          frequency: 14,
          frequnit: 'WEEKS',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for updatePMFrequency', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.updatePMFrequency({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
        frequency: 14,
        frequnit: 'WEEKS',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on updatePMFrequency', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Frequency update failed'));

      await expect(
        operations.updatePMFrequency({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
          frequency: 14,
          frequnit: 'WEEKS',
        })
      ).rejects.toThrow('Frequency update failed');
    });
  });

  describe('activatePM', () => {
    it('should activate PM record successfully', async () => {
      const inactivePM = { ...mockPM, status: 'INACTIVE' };
      const getResponse = createMockApiResponse({ member: [inactivePM] });
      const patchResponse = createMockApiResponse({
        ...inactivePM,
        status: 'ACTIVE',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.activatePM({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPM.href,
        expect.objectContaining({
          status: 'ACTIVE',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for activatePM', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.activatePM({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on activatePM', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Activate failed'));

      await expect(
        operations.activatePM({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Activate failed');
    });
  });

  describe('deactivatePM', () => {
    it('should deactivate PM record successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      const patchResponse = createMockApiResponse({
        ...mockPM,
        status: 'INACTIVE',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(patchResponse);

      const result = await operations.deactivatePM({
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPM.href,
        expect.objectContaining({
          status: 'INACTIVE',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if PM not found for deactivatePM', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.deactivatePM({
        pmnum: 'INVALID',
        siteid: 'BEDFORD',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors on deactivatePM', async () => {
      const getResponse = createMockApiResponse({ member: [mockPM] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('Deactivate failed'));

      await expect(
        operations.deactivatePM({ pmnum: 'PM001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Deactivate failed');
    });
  });
});
