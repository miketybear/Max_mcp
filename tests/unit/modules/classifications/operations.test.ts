/**
 * Unit tests for ClassificationOperations
 * Tests all 4 operation methods for classification management
 */

import { ClassificationOperations } from '../../../../src/modules/classifications/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('ClassificationOperations', () => {
  let operations: ClassificationOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new ClassificationOperations(mockClient);
  });

  describe('get', () => {
    it('should get classification successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          classstructureid: 'ASSET_CLASS',
          classificationid: 'PUMP',
          description: 'Pump Equipment',
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.get('ASSET_CLASS');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.CLASSIFICATIONS,
        expect.objectContaining({
          'oslc.where': 'classstructureid="ASSET_CLASS"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should validate input', async () => {
      await expect(operations.get('')).rejects.toThrow();
    });
  });

  describe('getHierarchy', () => {
    it('should get classification hierarchy', async () => {
      const mockRootResponse = {
        success: true,
        data: {
          classstructureid: 'ROOT',
          classificationid: 'ROOT',
          description: 'Root',
          haschildren: false, // No children to avoid recursive calls
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockRootResponse);

      const result = await operations.getHierarchy('ROOT', 2);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('classification');
      expect(result.data.classification.classstructureid).toBe('ROOT');
    });
  });

  describe('getSpecifications', () => {
    it('should get classification specifications', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            attributeid: 'MODEL',
            description: 'Model Number',
            datatype: 'STRING',
          },
        ],
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getSpecifications('ASSET_CLASS');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateSpecifications', () => {
    it('should update specifications successfully', async () => {
      const input = {
        objectname: 'ASSET',
        objectid: 'ASSET001',
        specifications: {
          MODEL: 'X100',
          MANUFACTURER: 'ACME',
        },
      };

      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.patch.mockResolvedValue(mockResponse);

      const result = await operations.updateSpecifications(input);

      expect(mockClient.patch).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should validate input', async () => {
      await expect(
        operations.updateSpecifications({
          objectname: '',
          objectid: 'ASSET001',
          specifications: {},
        })
      ).rejects.toThrow();
    });
  });
});
