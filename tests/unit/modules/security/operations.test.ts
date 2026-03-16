/**
 * Unit tests for SecurityOperations
 */

import { SecurityOperations } from '../../../../src/modules/security/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('SecurityOperations', () => {
  let operations: SecurityOperations;
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

    operations = new SecurityOperations(mockClient);
  });

  describe('createGroup', () => {
    it('should create a security group successfully', async () => {
      const mockResponse = {
        success: true,
        data: { groupname: 'TESTGROUP', description: 'Test group' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.createGroup({
        groupname: 'TESTGROUP',
        description: 'Test group',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({ groupname: 'TESTGROUP' })
      );
      expect(result.success).toBe(true);
      expect(result.data?.groupname).toBe('TESTGROUP');
    });

    it('should reject invalid groupname', async () => {
      await expect(
        operations.createGroup({ groupname: '' })
      ).rejects.toThrow();
    });
  });

  describe('getGroup', () => {
    it('should get a security group by name', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{ groupname: 'TESTGROUP', description: 'Test' }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getGroup('TESTGROUP');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({
          'oslc.where': 'groupname="TESTGROUP"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.groupname).toBe('TESTGROUP');
    });

    it('should return 404 when group not found', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getGroup('NONEXISTENT');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });
  });

  describe('searchGroups', () => {
    it('should search groups with criteria', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { groupname: 'GROUP1' },
            { groupname: 'GROUP2' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.searchGroups({ active: true });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({
          'oslc.where': 'active=1',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should use custom where clause', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      await operations.searchGroups({ where: 'groupname="ADMIN"' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({
          'oslc.where': 'groupname="ADMIN"',
        })
      );
    });
  });

  describe('updateGroup', () => {
    it('should update a security group via x-method-override PATCH', async () => {
      const mockResponse = {
        success: true,
        data: { groupname: 'TESTGROUP', description: 'Updated' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await operations.updateGroup('123', { description: 'Updated' });

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/maximo/oslc/os/mxapisecuritygroup/123',
          method: 'POST',
          headers: { 'x-method-override': 'PATCH' },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a security group', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.deleteGroup('123');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup/123'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('assignUserToGroup', () => {
    it('should assign a user to a group', async () => {
      const mockResponse = {
        success: true,
        data: {},
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.assignUserToGroup('JSMITH', 'ADMIN');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({
          groupname: 'ADMIN',
          groupuser: [{ personid: 'JSMITH' }],
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getGroupUsers', () => {
    it('should get users in a group', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{
            groupname: 'ADMIN',
            groupuser: [
              { personid: 'JSMITH', displayname: 'John Smith' },
            ],
          }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getGroupUsers('ADMIN');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].personid).toBe('JSMITH');
    });
  });

  describe('getUserGroups', () => {
    it('should get groups for a user', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { groupname: 'ADMIN' },
            { groupname: 'USERS' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getUserGroups('JSMITH');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapisecuritygroup',
        expect.objectContaining({
          'oslc.where': 'groupuser.personid="JSMITH"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });
});
