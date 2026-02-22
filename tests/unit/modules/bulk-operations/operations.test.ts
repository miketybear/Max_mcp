/**
 * Unit tests for BulkOperations
 * Tests all 4 operation methods for bulk operations
 */

import { BulkOperations } from '../../../../src/modules/bulk-operations/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('BulkOperations', () => {
  let operations: BulkOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new BulkOperations(mockClient);
  });

  describe('bulkCreate', () => {
    it('should create multiple records successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        records: [
          { description: 'WO 1', siteid: 'BEDFORD' },
          { description: 'WO 2', siteid: 'BEDFORD' },
        ],
      };

      const mockResponse = {
        success: true,
        data: { href: '/maximo/api/os/mxwodetail/123' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.bulkCreate(input);

      expect(result.success).toBe(true);
      expect(result.data?.successful).toBe(2);
      expect(result.data?.failed).toBe(0);
      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures with continueOnError', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        records: [
          { description: 'WO 1' },
          { description: 'WO 2' },
        ],
        continueOnError: true,
      };

      mockClient.post
        .mockResolvedValueOnce({
          success: true,
          data: {},
          statusCode: 201,
          headers: {},
          requestId: 'test-1',
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Failed',
          statusCode: 400,
          headers: {},
          requestId: 'test-2',
        });

      const result = await operations.bulkCreate(input);

      expect(result.data?.successful).toBe(1);
      expect(result.data?.failed).toBe(1);
    });

    it('should validate input', async () => {
      await expect(
        operations.bulkCreate({ objectStructure: '', records: [] } as any)
      ).rejects.toThrow();
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple records successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        updates: [
          { id: '123', data: { description: 'Updated 1' } },
          { id: '124', data: { description: 'Updated 2' } },
        ],
      };

      mockClient.patch.mockResolvedValue({
        success: true,
        data: {},
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      });

      const result = await operations.bulkUpdate(input);

      expect(result.success).toBe(true);
      expect(result.data?.successful).toBe(2);
      expect(mockClient.patch).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple records successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        ids: ['123', '124', '125'],
      };

      mockClient.delete.mockResolvedValue({
        success: true,
        data: {},
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      });

      const result = await operations.bulkDelete(input);

      expect(result.success).toBe(true);
      expect(result.data?.successful).toBe(3);
      expect(mockClient.delete).toHaveBeenCalledTimes(3);
    });
  });

  describe('batchProcess', () => {
    it('should process batch operations successfully', async () => {
      const input = {
        operations: [
          { type: 'create' as const, objectStructure: 'mxwodetail', data: { description: 'New' } },
          { type: 'update' as const, objectStructure: 'mxwodetail', data: { id: '123', description: 'Updated' } },
          { type: 'delete' as const, objectStructure: 'mxwodetail', data: { id: '124' } },
        ],
      };

      mockClient.post.mockResolvedValue({
        success: true,
        data: {},
        statusCode: 201,
        headers: {},
        requestId: 'test-1',
      });

      mockClient.patch.mockResolvedValue({
        success: true,
        data: {},
        statusCode: 200,
        headers: {},
        requestId: 'test-2',
      });

      mockClient.delete.mockResolvedValue({
        success: true,
        data: {},
        statusCode: 204,
        headers: {},
        requestId: 'test-3',
      });

      const result = await operations.batchProcess(input);

      expect(result.success).toBe(true);
      expect(result.data?.successful).toBe(3);
      expect(result.data?.failed).toBe(0);
    });

    it('should handle transactional mode', async () => {
      const input = {
        operations: [
          { type: 'create' as const, objectStructure: 'mxwodetail', data: {} },
        ],
        transactional: true,
      };

      mockClient.post.mockResolvedValue({
        success: false,
        error: 'Failed',
        statusCode: 400,
        headers: {},
        requestId: 'test-1',
      });

      await expect(operations.batchProcess(input)).rejects.toThrow();
    });
  });
});
