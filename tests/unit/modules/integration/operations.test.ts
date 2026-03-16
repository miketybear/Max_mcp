/**
 * Unit tests for IntegrationOperations
 */

import { IntegrationOperations } from '../../../../src/modules/integration/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('IntegrationOperations', () => {
  let operations: IntegrationOperations;
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

    operations = new IntegrationOperations(mockClient);
  });

  describe('getObjectStructure', () => {
    it('should get object structure by name', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{
            objectname: 'WORKORDER',
            description: 'Work Order',
            persistent: true,
            module: 'WO',
          }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getObjectStructure('WORKORDER');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimaxobject',
        expect.objectContaining({
          'oslc.where': 'objectname="WORKORDER"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.objectname).toBe('WORKORDER');
    });

    it('should return 404 when object not found', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getObjectStructure('NONEXISTENT');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });
  });

  describe('searchObjects', () => {
    it('should search objects with module filter', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { objectname: 'WORKORDER', module: 'WO' },
            { objectname: 'WOACTIVITY', module: 'WO' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.searchObjects({ module: 'WO' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimaxobject',
        expect.objectContaining({
          'oslc.where': 'module="WO"',
        })
      );
      expect(result.data).toHaveLength(2);
    });

    it('should filter by persistent flag', async () => {
      const mockResponse = {
        success: true,
        data: { member: [{ objectname: 'WORKORDER', persistent: true }] },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.searchObjects({ persistent: true });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimaxobject',
        expect.objectContaining({
          'oslc.where': 'persistent=1',
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getSystemProperties', () => {
    it('should get system properties', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { varname: 'mxe.int.globaldir', varvalue: '/tmp' },
            { varname: 'mxe.db.fetchStopLimit', varvalue: '5000' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getSystemProperties();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimaxvars',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by varname', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [{ varname: 'mxe.db.fetchStopLimit', varvalue: '5000' }],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getSystemProperties({
        varname: 'mxe.db.fetchStopLimit',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimaxvars',
        expect.objectContaining({
          'oslc.where': 'varname="mxe.db.fetchStopLimit"',
        })
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateSystemProperty', () => {
    it('should update a system property', async () => {
      const mockResponse = {
        success: true,
        data: { varname: 'mxe.db.fetchStopLimit', varvalue: '10000' },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await operations.updateSystemProperty('123', {
        varvalue: '10000',
      });

      expect(mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/maximo/oslc/os/mxapimaxvars/123',
          method: 'POST',
          headers: { 'x-method-override': 'PATCH' },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getMeasureUnits', () => {
    it('should get measurement units', async () => {
      const mockResponse = {
        success: true,
        data: {
          member: [
            { measureunitid: 'EA', description: 'Each' },
            { measureunitid: 'HR', description: 'Hour' },
          ],
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.getMeasureUnits();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimeasureunit',
        expect.any(Object)
      );
      expect(result.data).toHaveLength(2);
    });
  });

  describe('manageMeasureUnit', () => {
    it('should create a measurement unit', async () => {
      const mockResponse = {
        success: true,
        data: { measureunitid: 'KG', description: 'Kilogram' },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.manageMeasureUnit('create', {
        measureunitid: 'KG',
        description: 'Kilogram',
        abbreviation: 'kg',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimeasureunit',
        expect.objectContaining({ measureunitid: 'KG' })
      );
      expect(result.success).toBe(true);
    });

    it('should delete a measurement unit', async () => {
      const mockResponse = {
        success: true,
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.manageMeasureUnit('delete', undefined, '456');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/maximo/oslc/os/mxapimeasureunit/456'
      );
      expect(result.success).toBe(true);
    });
  });
});
