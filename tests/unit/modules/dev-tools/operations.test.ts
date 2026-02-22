/**
 * Unit tests for DevToolsOperations
 * Tests all 6 operation methods for development tools
 */

import { DevToolsOperations } from '../../../../src/modules/dev-tools/operations';
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

describe('DevToolsOperations', () => {
  let operations: DevToolsOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new DevToolsOperations(mockClient);
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockResponse = {
        success: true,
        data: { maximoversion: '7.6.1.2', username: 'testuser' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.testConnection();

      expect(mockClient.get).toHaveBeenCalledWith('/maximo/api/whoami');
      expect(result.success).toBe(true);
      expect(result.data?.connected).toBe(true);
      expect(result.data?.authenticated).toBe(true);
    });

    it('should handle connection failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Connection refused',
        statusCode: 0,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.testConnection();

      expect(result.data?.connected).toBe(false);
    });
  });

  describe('exploreApi', () => {
    it('should list all endpoints when no objectStructure specified', async () => {
      const result = await operations.exploreApi();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0]).toHaveProperty('path');
      expect(result.data?.[0]).toHaveProperty('methods');
    });

    it('should explore specific objectStructure', async () => {
      const result = await operations.exploreApi('mxwodetail');

      expect(result.success).toBe(true);
      expect(result.data?.[0].objectStructure).toBe('mxwodetail');
    });
  });

  describe('inspectSchema', () => {
    it('should inspect schema successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            {
              wonum: 'WO001',
              description: 'Test',
              status: 'WAPPR',
            },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.inspectSchema('mxwodetail');

      expect(result.success).toBe(true);
      expect(result.data?.objectStructure).toBe('mxwodetail');
      expect(result.data?.fields.length).toBeGreaterThan(0);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.inspectSchema('mxwodetail');

      expect(result.success).toBe(true);
      expect(result.data?.fields).toEqual([]);
    });
  });

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      const mockResponse = {
        success: true,
        data: { maximoversion: '7.6.1.2' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.healthCheck();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.checks.length).toBeGreaterThan(0);
    });

    it('should detect unhealthy status', async () => {
      const mockResponse = {
        success: false,
        error: 'Connection failed',
        statusCode: 500,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.healthCheck();

      expect(result.data?.status).toBe('unhealthy');
    });
  });

  describe('getMetadata', () => {
    it('should get metadata successfully', async () => {
      const result = await operations.getMetadata('mxwodetail');

      expect(result.success).toBe(true);
      expect(result.data?.objectStructure).toBe('mxwodetail');
      expect(result.data?.operations).toContain('query');
    });

    it('should validate input', async () => {
      await expect(operations.getMetadata('')).rejects.toThrow();
    });
  });

  describe('listEndpoints', () => {
    it('should list all endpoints', async () => {
      const result = await operations.listEndpoints();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });
});
