/**
 * Unit tests for Development Tools MCP Tools
 * Tests all 6 MCP tool definitions
 */

import { createDevTools } from '../../../../src/modules/dev-tools/tools';
import { DevToolsOperations } from '../../../../src/modules/dev-tools/operations';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Development Tools', () => {
  let mockOperations: jest.Mocked<DevToolsOperations>;
  let tools: any[];

  beforeEach(() => {
    mockOperations = {
      testConnection: jest.fn(),
      exploreApi: jest.fn(),
      inspectSchema: jest.fn(),
      healthCheck: jest.fn(),
      listEndpoints: jest.fn(),
      getMetadata: jest.fn(),
    } as any;

    tools = createDevTools(mockOperations);
  });

  it('should create 6 tools', () => {
    expect(tools).toHaveLength(6);
  });

  describe('maximo_test_connection', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_test_connection');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_test_connection');
      expect(tool.description).toContain('connectivity');
    });

    it('should call testConnection operation', async () => {
      const mockResponse = {
        success: true,
        data: { connected: true, responseTime: 150 },
      };

      mockOperations.testConnection.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({});

      expect(mockOperations.testConnection).toHaveBeenCalled();
      expect(result.message).toContain('150ms');
    });
  });

  describe('maximo_explore_api', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_explore_api');
    });

    it('should call exploreApi operation', async () => {
      const mockResponse = {
        success: true,
        data: [{ path: '/api/endpoint', methods: ['GET'] }],
      };

      mockOperations.exploreApi.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({});

      expect(mockOperations.exploreApi).toHaveBeenCalled();
      expect(result.count).toBe(1);
    });
  });

  describe('maximo_inspect_schema', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_inspect_schema');
    });

    it('should call inspectSchema operation', async () => {
      const mockResponse = {
        success: true,
        data: {
          objectStructure: 'mxwodetail',
          fields: [{ name: 'wonum', type: 'string' }],
        },
      };

      mockOperations.inspectSchema.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ objectStructure: 'mxwodetail' });

      expect(mockOperations.inspectSchema).toHaveBeenCalledWith('mxwodetail');
      expect(result.fieldCount).toBe(1);
    });
  });

  describe('maximo_health_check', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_health_check');
    });

    it('should call healthCheck operation', async () => {
      const mockResponse = {
        success: true,
        data: { status: 'healthy', checks: [] },
      };

      mockOperations.healthCheck.mockResolvedValue(mockResponse as any);

      const result = await tool.handler();

      expect(mockOperations.healthCheck).toHaveBeenCalled();
      expect(result.message).toContain('healthy');
    });
  });

  describe('maximo_list_endpoints', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_list_endpoints');
    });

    it('should call listEndpoints operation', async () => {
      const mockResponse = {
        success: true,
        data: [{}, {}, {}],
      };

      mockOperations.listEndpoints.mockResolvedValue(mockResponse as any);

      const result = await tool.handler();

      expect(mockOperations.listEndpoints).toHaveBeenCalled();
      expect(result.count).toBe(3);
    });
  });

  describe('maximo_get_metadata', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_get_metadata');
    });

    it('should call getMetadata operation', async () => {
      const mockResponse = {
        success: true,
        data: { objectStructure: 'mxwodetail', metadata: {} },
      };

      mockOperations.getMetadata.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ objectStructure: 'mxwodetail' });

      expect(mockOperations.getMetadata).toHaveBeenCalledWith('mxwodetail');
      expect(result.success).toBe(true);
    });
  });
});
