/**
 * Unit tests for QuerySearchOperations
 * Tests all 4 operation methods for query and search
 */

import { QuerySearchOperations } from '../../../../src/modules/query-search/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('QuerySearchOperations', () => {
  let operations: QuerySearchOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new QuerySearchOperations(mockClient);
  });

  describe('query', () => {
    it('should execute OSLC query successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        select: 'wonum,description',
        where: 'status="WAPPR"',
        pageSize: 10,
      };

      const mockResponse = {
        success: true,
        data: {
          member: [{ wonum: 'WO001' }, { wonum: 'WO002' }],
          responseInfo: { totalCount: 2 },
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.query(input);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxwodetail',
        expect.objectContaining({
          'oslc.select': 'wonum,description',
          'oslc.where': 'status="WAPPR"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.member).toHaveLength(2);
    });

    it('should validate input', async () => {
      await expect(operations.query({ objectStructure: '' } as any)).rejects.toThrow();
    });
  });

  describe('advancedSearch', () => {
    it('should execute advanced search successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        filters: [
          { field: 'status', operator: '=' as const, value: 'WAPPR' },
          { field: 'priority', operator: '<' as const, value: 3 },
        ],
        operator: 'AND' as const,
      };

      const mockResponse = {
        success: true,
        data: {
          member: [{ wonum: 'WO001' }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.advancedSearch(input);

      expect(result.success).toBe(true);
    });

    it('should handle IN operator', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        filters: [
          { field: 'status', operator: 'in' as const, value: ['WAPPR', 'APPR'] },
        ],
      };

      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.advancedSearch(input);

      expect(result.success).toBe(true);
    });
  });

  describe('savedQuery', () => {
    it('should execute saved query successfully', async () => {
      const input = {
        queryname: 'MYQUERY',
        parameters: { siteid: 'BEDFORD' },
      };

      const mockResponse = {
        success: true,
        data: { member: [{ wonum: 'WO001' }] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.savedQuery(input);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/query',
        expect.objectContaining({ savedQuery: 'MYQUERY' })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('buildQuery', () => {
    it('should build query successfully', async () => {
      const input = {
        objectStructure: 'mxwodetail',
        conditions: [
          { field: 'status', operator: '=' as const, value: 'WAPPR' },
        ],
      };

      const result = await operations.buildQuery(input);

      expect(result.success).toBe(true);
      expect(result.data?.oslcQuery).toContain('mxwodetail');
      expect(result.data?.whereClause).toContain('status');
    });

    it('should build query without conditions', async () => {
      const input = {
        objectStructure: 'mxwodetail',
      };

      const result = await operations.buildQuery(input);

      expect(result.success).toBe(true);
      expect(result.data?.oslcQuery).toContain('mxwodetail');
    });
  });
});
