/**
 * Unit tests for AdminOperations
 */

import { AdminOperations } from '../../../../src/modules/admin/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('AdminOperations', () => {
  let operations: AdminOperations;
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

    operations = new AdminOperations(mockClient);
  });

  describe('createAutoscript', () => {
    it('should create an automation script', async () => {
      const mockResponse = {
        success: true,
        data: { autoscript: 'TESTSCRIPT', scriptlanguage: 'jython' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.createAutoscript({
        autoscript: 'TESTSCRIPT',
        scriptlanguage: 'jython',
        source: 'print "hello"',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapiautoscript',
        expect.objectContaining({ autoscript: 'TESTSCRIPT' })
      );
      expect(result.success).toBe(true);
    });

    it('should reject invalid script language', async () => {
      await expect(
        operations.createAutoscript({
          autoscript: 'TEST',
          scriptlanguage: 'python' as any,
          source: 'code',
        })
      ).rejects.toThrow();
    });

    it('should accept script with launch points and variables', async () => {
      const mockResponse = {
        success: true,
        data: { autoscript: 'TESTSCRIPT' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.createAutoscript({
        autoscript: 'TESTSCRIPT',
        scriptlanguage: 'jython',
        source: 'print "hello"',
        autoscriptvars: [{ varname: 'myvar', vartype: 'IN' }],
        scriptlaunchpoint: [{
          launchpointname: 'TEST_LP',
          launchpointtype: 'OBJECT',
          objectname: 'WORKORDER',
        }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getAutoscript', () => {
    it('should get an automation script by name', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{
            autoscript: 'TESTSCRIPT',
            source: 'print "hello"',
            scriptlanguage: 'jython',
          }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getAutoscript('TESTSCRIPT');

      expect(result.success).toBe(true);
      expect(result.data?.autoscript).toBe('TESTSCRIPT');
    });

    it('should return 404 when script not found', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getAutoscript('NONEXISTENT');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });
  });

  describe('updateAutoscript', () => {
    it('should update script source via x-method-override', async () => {
      const mockResponse = {
        success: true,
        data: { autoscript: 'TESTSCRIPT', source: 'updated code' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await operations.updateAutoscript('123', {
        source: 'updated code',
        status: 'Active',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          headers: { 'x-method-override': 'PATCH' },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('searchAutoscripts', () => {
    it('should search scripts with filtering', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { autoscript: 'SCRIPT1', active: true },
            { autoscript: 'SCRIPT2', active: true },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.searchAutoscripts({
        scriptlanguage: 'jython',
        active: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('deleteAutoscript', () => {
    it('should delete an automation script', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.deleteAutoscript('123');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapiautoscript/123'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('executeScript', () => {
    it('should execute a script by name', async () => {
      const mockResponse = {
        success: true,
        data: { result: 'success', outputVar: 'value' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.executeScript({
        scriptName: 'MYSCRIPT',
        params: { input1: 'value1' },
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/script/MYSCRIPT',
        { input1: 'value1' }
      );
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should execute script with empty params', async () => {
      const mockResponse = {
        success: true,
        data: {},
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.executeScript({ scriptName: 'MYSCRIPT' });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/script/MYSCRIPT',
        {}
      );
      expect(result.success).toBe(true);
    });
  });

  describe('manageCronTask', () => {
    it('should list cron tasks', async () => {
      const mockResponse = {
        success: true,
        data: { member: [{ crontaskname: 'TASK1' }] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.manageCronTask('list');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapicrontaskdef',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should create a cron task', async () => {
      const mockResponse = {
        success: true,
        data: { crontaskname: 'NEWTASK' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.manageCronTask('create', {
        crontaskname: 'NEWTASK',
        description: 'A test task',
      });

      expect(result.success).toBe(true);
    });

    it('should delete a cron task', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.manageCronTask('delete', undefined, '456');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapicrontaskdef/456'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('manageEndpoint', () => {
    it('should list endpoints', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.manageEndpoint('list');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapiendpoint',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe('manageAction', () => {
    it('should create a custom action', async () => {
      const mockResponse = {
        success: true,
        data: { action: 'MYACTION' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.manageAction('create', {
        action: 'MYACTION',
        description: 'Custom action',
        objectname: 'WORKORDER',
      });

      expect(result.success).toBe(true);
    });
  });
});
