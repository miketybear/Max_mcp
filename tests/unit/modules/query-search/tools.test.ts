/**
 * Unit tests for Query Search MCP Tools
 * Tests all 4 MCP tool definitions
 */

import { createQuerySearchTools } from '../../../../src/modules/query-search/tools';
import { QuerySearchOperations } from '../../../../src/modules/query-search/operations';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Query Search Tools', () => {
  let mockOperations: jest.Mocked<QuerySearchOperations>;
  let tools: any[];

  beforeEach(() => {
    mockOperations = {
      query: jest.fn(),
      advancedSearch: jest.fn(),
      savedQuery: jest.fn(),
      buildQuery: jest.fn(),
    } as any;

    tools = createQuerySearchTools(mockOperations);
  });

  it('should create 4 tools', () => {
    expect(tools).toHaveLength(4);
  });

  describe('maximo_query', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_query');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_query');
      expect(tool.description).toContain('OSLC');
    });

    it('should call query operation', async () => {
      const mockResponse = {
        success: true,
        data: { member: [{ wonum: 'WO001' }], totalCount: 1 },
      };

      mockOperations.query.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectStructure: 'mxwodetail',
        where: 'status="WAPPR"',
      });

      expect(mockOperations.query).toHaveBeenCalled();
      expect(result.count).toBe(1);
    });
  });

  describe('maximo_advanced_search', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_advanced_search');
    });

    it('should call advancedSearch operation', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
      };

      mockOperations.advancedSearch.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectStructure: 'mxwodetail',
        filters: [{ field: 'status', operator: '=', value: 'WAPPR' }],
      });

      expect(mockOperations.advancedSearch).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_saved_query', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_saved_query');
    });

    it('should call savedQuery operation', async () => {
      const mockResponse = {
        success: true,
        data: { member: [] },
      };

      mockOperations.savedQuery.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ queryname: 'MYQUERY' });

      expect(mockOperations.savedQuery).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_build_query', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_build_query');
    });

    it('should call buildQuery operation', async () => {
      const mockResponse = {
        success: true,
        data: { oslcQuery: '/maximo/api/os/mxwodetail', isValid: true },
      };

      mockOperations.buildQuery.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ objectStructure: 'mxwodetail' });

      expect(mockOperations.buildQuery).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
