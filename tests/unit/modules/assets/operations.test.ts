/**
 * Unit tests for AssetOperations
 * Tests all 12 operation methods for asset management
 */

import { AssetOperations } from '../../../../src/modules/assets/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
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

describe('AssetOperations', () => {
  let operations: AssetOperations;
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

    operations = new AssetOperations(mockClient);
  });

  describe('create', () => {
    it('should create asset successfully', async () => {
      const input = {
        assetnum: 'ASSET002',
        description: 'New Test Asset',
        siteid: 'BEDFORD',
        assettype: 'PRODUCTION' as const,
      };

      const response = createMockApiResponse(mockAsset);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.create(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAsset);
    });

    it('should validate that asset cannot be its own parent', async () => {
      const input = {
        assetnum: 'ASSET001',
        description: 'Self parent asset',
        siteid: 'BEDFORD',
        assettype: 'PRODUCTION' as const,
        parent: 'ASSET001', // Same as assetnum
      };

      await expect(operations.create(input)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const input = {
        assetnum: 'ASSET002',
        description: 'New Test Asset',
        siteid: 'BEDFORD',
        assettype: 'PRODUCTION' as const,
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.create(input)).rejects.toThrow('API Error');
    });

    it('should validate input data', async () => {
      const invalidInput = {
        assetnum: '', // Invalid: empty assetnum
        description: 'Test',
        siteid: 'BEDFORD',
      };

      await expect(operations.create(invalidInput as any)).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve asset by assetnum and siteid', async () => {
      const response = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('ASSET001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': 'assetnum="ASSET001" and siteid="BEDFORD"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAsset);
    });

    it('should return not found when asset does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.get('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.get('ASSET001', 'BEDFORD')).rejects.toThrow('Network error');
    });
  });

  describe('update', () => {
    it('should update asset successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const updateResponse = createMockApiResponse({
        ...mockAsset,
        description: 'Updated description',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const updateData = { description: 'Updated description' };
      const result = await operations.update('ASSET001', 'BEDFORD', updateData);

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.patch).toHaveBeenCalledWith(
        mockAsset.href,
        expect.objectContaining(updateData)
      );
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.update('INVALID', 'BEDFORD', {
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.update('ASSET001', 'BEDFORD', { description: 'Test' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('delete', () => {
    it('should delete asset successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const deleteResponse = createMockApiResponse(undefined, { statusCode: 204 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await operations.delete('ASSET001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledWith(mockAsset.href);
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.delete('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.delete.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.delete('ASSET001', 'BEDFORD')
      ).rejects.toThrow('API Error');
    });
  });

  describe('move', () => {
    it('should move asset to new location successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const updateResponse = createMockApiResponse({
        ...mockAsset,
        location: 'LOC002',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const moveData = {
        newLocation: 'LOC002',
      };

      const result = await operations.move('ASSET001', 'BEDFORD', moveData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockAsset.href,
        expect.objectContaining({
          location: 'LOC002',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should move asset with bin and lot numbers', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const updateResponse = createMockApiResponse({
        ...mockAsset,
        location: 'LOC002',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const moveData = {
        newLocation: 'LOC002',
        newBinnum: 'BIN01',
        newLotnum: 'LOT01',
      };

      const result = await operations.move('ASSET001', 'BEDFORD', moveData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockAsset.href,
        expect.objectContaining({
          location: 'LOC002',
          binnum: 'BIN01',
          lotnum: 'LOT01',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.move('INVALID', 'BEDFORD', {
        newLocation: 'LOC002',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.move('ASSET001', 'BEDFORD', { newLocation: 'LOC002' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('recordMeter', () => {
    it('should record meter reading successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const meterResponse = createMockApiResponse({ metername: 'TEMP', reading: 72.5 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(meterResponse);

      const reading = {
        metername: 'TEMP',
        reading: 72.5,
        readingdate: '2024-01-15T10:00:00Z',
        inspector: 'TECH001',
      };

      const result = await operations.recordMeter('ASSET001', 'BEDFORD', reading);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockAsset.href}/ASSETMETER`,
        expect.objectContaining({
          metername: 'TEMP',
          newreading: 72.5,
          newreadingdate: '2024-01-15T10:00:00Z',
          inspector: 'TECH001',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const reading = {
        metername: 'TEMP',
        reading: 72.5,
        readingdate: '2024-01-15T10:00:00Z',
      };

      const result = await operations.recordMeter('INVALID', 'BEDFORD', reading);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('API Error'));

      const reading = {
        metername: 'TEMP',
        reading: 72.5,
        readingdate: '2024-01-15T10:00:00Z',
      };

      await expect(
        operations.recordMeter('ASSET001', 'BEDFORD', reading)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getHierarchy', () => {
    it('should retrieve asset hierarchy with parent and children', async () => {
      const parentAsset = { ...mockAsset, assetnum: 'PARENT001', parent: null };
      const childAsset1 = { ...mockAsset, assetnum: 'CHILD001', parent: 'ASSET001' };
      const childAsset2 = { ...mockAsset, assetnum: 'CHILD002', parent: 'ASSET001' };

      const assetWithParent = { ...mockAsset, parent: 'PARENT001' };

      // First call: get the asset itself
      const assetResponse = createMockApiResponse({ member: [assetWithParent] });
      // Second call: get the parent
      const parentResponse = createMockApiResponse({ member: [parentAsset] });
      // Third call: get children
      const childrenResponse = createMockApiResponse({
        member: [childAsset1, childAsset2],
      });

      mockClient.get
        .mockResolvedValueOnce(assetResponse)
        .mockResolvedValueOnce(parentResponse)
        .mockResolvedValueOnce(childrenResponse);

      const result = await operations.getHierarchy('ASSET001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.asset).toEqual(assetWithParent);
      expect(result.data?.parent).toEqual(parentAsset);
      expect(result.data?.children).toHaveLength(2);
      expect(result.data?.level).toBe(1);
      expect(result.data?.path).toContain('PARENT001');
      expect(result.data?.path).toContain('ASSET001');
    });

    it('should handle asset with no parent', async () => {
      const assetWithNoParent = { ...mockAsset, parent: null };

      // First call: get the asset itself
      const assetResponse = createMockApiResponse({ member: [assetWithNoParent] });
      // Second call: get children (empty)
      const childrenResponse = createMockApiResponse({ member: [] });

      mockClient.get
        .mockResolvedValueOnce(assetResponse)
        .mockResolvedValueOnce(childrenResponse);

      const result = await operations.getHierarchy('ASSET001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.parent).toBeUndefined();
      expect(result.data?.children).toHaveLength(0);
      expect(result.data?.level).toBe(0);
    });

    it('should return error if asset not found', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getHierarchy('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getHierarchy('ASSET001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateSpecification', () => {
    it('should update asset specification successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const specResponse = createMockApiResponse({ assetattrid: 'COLOR', alnvalue: 'RED' });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(specResponse);

      const spec = {
        assetattrid: 'COLOR',
        alnvalue: 'RED',
      };

      const result = await operations.updateSpecification('ASSET001', 'BEDFORD', spec);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockAsset.href}/ASSETSPEC`,
        expect.objectContaining({
          assetattrid: 'COLOR',
          alnvalue: 'RED',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should update specification with numeric value', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const specResponse = createMockApiResponse({ assetattrid: 'WEIGHT', numvalue: 1500 });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(specResponse);

      const spec = {
        assetattrid: 'WEIGHT',
        numvalue: 1500,
        measureunitid: 'KG',
      };

      const result = await operations.updateSpecification('ASSET001', 'BEDFORD', spec);

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockAsset.href}/ASSETSPEC`,
        expect.objectContaining({
          assetattrid: 'WEIGHT',
          numvalue: 1500,
          measureunitid: 'KG',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const spec = {
        assetattrid: 'COLOR',
        alnvalue: 'RED',
      };

      const result = await operations.updateSpecification('INVALID', 'BEDFORD', spec);

      expect(result.success).toBe(false);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('API Error'));

      const spec = {
        assetattrid: 'COLOR',
        alnvalue: 'RED',
      };

      await expect(
        operations.updateSpecification('ASSET001', 'BEDFORD', spec)
      ).rejects.toThrow('API Error');
    });
  });

  describe('search', () => {
    it('should search assets with filters', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: {
          totalCount: 1,
          pagenum: 1,
        },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: 'OPERATING' as const,
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="OPERATING"'),
          'oslc.pageSize': 10,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.assets).toHaveLength(1);
    });

    it('should handle multiple status values', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        status: ['OPERATING', 'NOT READY'] as const,
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria as any);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in ['),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle date range filter', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        dateRange: {
          field: 'installdate' as const,
          start: '2020-01-01',
          end: '2024-01-31',
        },
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('installdate>='),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle custom select fields', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        select: ['assetnum', 'description', 'status'],
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.select': 'assetnum,description,status',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle orderBy parameter', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        orderBy: '-statusdate',
        siteid: 'BEDFORD',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.orderBy': '-statusdate',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle search terms', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get.mockResolvedValue(searchResponse);

      const criteria = {
        searchTerms: 'pump motor',
      };

      const result = await operations.search(criteria);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ASSETS,
        expect.objectContaining({
          'oslc.searchTerms': 'pump motor',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        error: 'Server error',
        errorCode: 'INTERNAL_ERROR',
        statusCode: 500,
        headers: {},
        requestId: 'test-id',
      };
      mockClient.get.mockResolvedValue(errorResponse as any);

      const result = await operations.search({ siteid: 'BEDFORD' });

      expect(result.success).toBe(false);
    });

    it('should calculate pagination metadata', async () => {
      const searchResponse = createMockApiResponse({
        member: [mockAsset],
        responseInfo: {
          totalCount: 50,
          pagenum: 1,
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
      expect(result.data?.totalCount).toBe(50);
      expect(result.data?.totalPages).toBe(5);
      expect(result.data?.hasNext).toBe(true);
      expect(result.data?.hasPrevious).toBe(false);
    });
  });

  describe('getMeterHistory', () => {
    it('should retrieve meter history successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const meterHistoryResponse = createMockApiResponse({
        member: [
          { metername: 'TEMP', reading: 72.5, readingdate: '2024-01-15T10:00:00Z' },
          { metername: 'TEMP', reading: 71.0, readingdate: '2024-01-14T10:00:00Z' },
        ],
        responseInfo: { totalCount: 2 },
      });

      mockClient.get
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(meterHistoryResponse);

      const result = await operations.getMeterHistory('ASSET001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.readings).toHaveLength(2);
      expect(result.data?.totalCount).toBe(2);
    });

    it('should filter by meter name', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const meterHistoryResponse = createMockApiResponse({
        member: [
          { metername: 'TEMP', reading: 72.5, readingdate: '2024-01-15T10:00:00Z' },
        ],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(meterHistoryResponse);

      const result = await operations.getMeterHistory('ASSET001', 'BEDFORD', 'TEMP');

      // Verify the second call (meter endpoint) has the where filter
      expect(mockClient.get.mock.calls[1][1]).toEqual(
        expect.objectContaining({
          'oslc.where': 'metername="TEMP"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.readings).toHaveLength(1);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getMeterHistory('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getMeterHistory('ASSET001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });
  });

  describe('changeStatus', () => {
    it('should change asset status successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const updateResponse = createMockApiResponse({
        ...mockAsset,
        status: 'NOT READY',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.changeStatus('ASSET001', 'BEDFORD', 'NOT READY');

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockAsset.href,
        expect.objectContaining({ status: 'NOT READY' })
      );
      expect(result.success).toBe(true);
    });

    it('should change status with memo', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const updateResponse = createMockApiResponse({
        ...mockAsset,
        status: 'DECOMMISSIONED',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.changeStatus(
        'ASSET001',
        'BEDFORD',
        'DECOMMISSIONED',
        'End of service life'
      );

      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.changeStatus('INVALID', 'BEDFORD', 'NOT READY');

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.changeStatus('ASSET001', 'BEDFORD', 'NOT READY')
      ).rejects.toThrow('API Error');
    });
  });

  describe('getDowntimeHistory', () => {
    it('should retrieve downtime history successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const downtimeResponse = createMockApiResponse({
        member: [
          { startdate: '2024-01-10T08:00:00Z', enddate: '2024-01-10T12:00:00Z', downtime: 4 },
          { startdate: '2024-01-05T14:00:00Z', enddate: '2024-01-05T18:00:00Z', downtime: 4 },
        ],
        responseInfo: { totalCount: 2 },
      });

      mockClient.get
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(downtimeResponse);

      const result = await operations.getDowntimeHistory('ASSET001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.downtimeRecords).toHaveLength(2);
      expect(result.data?.totalCount).toBe(2);
      expect(result.data?.totalDowntimeHours).toBe(8);
    });

    it('should filter by date range', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const downtimeResponse = createMockApiResponse({
        member: [
          { startdate: '2024-01-10T08:00:00Z', downtime: 4 },
        ],
        responseInfo: { totalCount: 1 },
      });

      mockClient.get
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(downtimeResponse);

      const result = await operations.getDowntimeHistory(
        'ASSET001',
        'BEDFORD',
        '2024-01-01',
        '2024-01-31'
      );

      // Verify the second call has date filter in where clause
      expect(mockClient.get.mock.calls[1][1]).toEqual(
        expect.objectContaining({
          'oslc.where': expect.stringContaining('startdate>='),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if asset not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.getDowntimeHistory('INVALID', 'BEDFORD');

      expect(result.success).toBe(false);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getDowntimeHistory('ASSET001', 'BEDFORD')
      ).rejects.toThrow('Network error');
    });

    it('should calculate total downtime hours correctly with zero downtime', async () => {
      const getResponse = createMockApiResponse({ member: [mockAsset] });
      const downtimeResponse = createMockApiResponse({
        member: [],
        responseInfo: { totalCount: 0 },
      });

      mockClient.get
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(downtimeResponse);

      const result = await operations.getDowntimeHistory('ASSET001', 'BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data?.downtimeRecords).toHaveLength(0);
      expect(result.data?.totalDowntimeHours).toBe(0);
    });
  });
});
