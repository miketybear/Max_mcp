/**
 * Unit tests for SetupOperations
 */

import { SetupOperations } from '../../../../src/modules/setup/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('SetupOperations', () => {
  let operations: SetupOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as any;

    operations = new SetupOperations(mockClient);
  });

  describe('createDomain', () => {
    it('should create a domain', async () => {
      const mockResponse = {
        success: true,
        data: { domainid: 'TESTDOMAIN', domaintype: 'ALN' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.createDomain({
        domainid: 'TESTDOMAIN',
        domaintype: 'ALN',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/os/MXDOMAIN',
        expect.objectContaining({ domainid: 'TESTDOMAIN' })
      );
      expect(result.success).toBe(true);
    });

    it('should reject domain name over 18 chars', async () => {
      await expect(
        operations.createDomain({ domainid: 'A'.repeat(19) })
      ).rejects.toThrow();
    });
  });

  describe('getDomain', () => {
    it('should get domain by name', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{ domainid: 'TESTDOMAIN', domaintype: 'ALN' }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getDomain('TESTDOMAIN');

      expect(result.success).toBe(true);
      expect(result.data?.domainid).toBe('TESTDOMAIN');
    });

    it('should return 404 when domain not found', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getDomain('NONEXISTENT');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });
  });

  describe('searchDomains', () => {
    it('should search domains with type filter', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { domainid: 'DOM1', domaintype: 'ALN' },
            { domainid: 'DOM2', domaintype: 'ALN' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.searchDomains({ domaintype: 'ALN' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/MXDOMAIN',
        expect.objectContaining({
          'oslc.where': 'domaintype="ALN"',
        })
      );
      expect(result.data).toHaveLength(2);
    });
  });

  describe('updateDomain', () => {
    it('should update domain via x-method-override', async () => {
      const mockResponse = {
        success: true,
        data: { domainid: 'TESTDOMAIN' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await operations.updateDomain('123', { description: 'Updated' });

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          headers: { 'x-method-override': 'PATCH' },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('deleteDomain', () => {
    it('should delete a domain', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.deleteDomain('123');

      expect(mockClient.delete).toHaveBeenCalledWith('/maximo/oslc/os/MXDOMAIN/123');
      expect(result.success).toBe(true);
    });
  });

  describe('manageAlnDomain', () => {
    it('should list ALN domain values', async () => {
      const mockResponse = {
        success: true,
        data: { member: [{ domainid: 'STATUS', value: 'ACTIVE' }] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.manageAlnDomain('list', {
        where: 'domainid="STATUS"',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapialndomain',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should create an ALN domain value', async () => {
      const mockResponse = {
        success: true,
        data: { domainid: 'STATUS', value: 'NEWVAL' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.manageAlnDomain('create', {
        domainid: 'STATUS',
        value: 'NEWVAL',
        description: 'New value',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('manageTableDomain', () => {
    it('should list table domain values', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.manageTableDomain('list');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapitabledomain',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe('manageSynonymDomain', () => {
    it('should create a synonym domain value', async () => {
      const mockResponse = {
        success: true,
        data: { domainid: 'WOSTATUS', maxvalue: 'COMP', value: 'COMPLETE' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.manageSynonymDomain('create', {
        domainid: 'WOSTATUS',
        maxvalue: 'COMP',
        value: 'COMPLETE',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('manageDocType', () => {
    it('should list document types', async () => {
      const mockResponse = {
        success: true,
        data: { member: [{ doctype: 'ATTACHMENTS' }] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.manageDocType('list');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapidoctype',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should delete a document type', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.manageDocType('delete', undefined, '789');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapidoctype/789'
      );
      expect(result.success).toBe(true);
    });
  });
});
