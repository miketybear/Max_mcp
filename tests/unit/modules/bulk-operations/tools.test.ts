/**
 * Unit tests for Bulk Operations MCP Tools
 * Tests all 4 MCP tool definitions
 */

import { createBulkOperationTools } from '../../../../src/modules/bulk-operations/tools';
import { BulkOperations } from '../../../../src/modules/bulk-operations/operations';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Bulk Operation Tools', () => {
  let mockOperations: jest.Mocked<BulkOperations>;
  let tools: any[];

  beforeEach(() => {
    mockOperations = {
      bulkCreate: jest.fn(),
      bulkUpdate: jest.fn(),
      bulkDelete: jest.fn(),
      batchProcess: jest.fn(),
    } as any;

    tools = createBulkOperationTools(mockOperations);
  });

  it('should create 4 tools', () => {
    expect(tools).toHaveLength(4);
  });

  describe('maximo_bulk_create', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_bulk_create');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_bulk_create');
      expect(tool.description).toContain('multiple');
    });

    it('should call bulkCreate operation', async () => {
      const mockResponse = {
        success: true,
        data: { successful: 2, failed: 0, total: 2, results: [] },
      };

      mockOperations.bulkCreate.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectStructure: 'mxwodetail',
        records: [{}, {}],
      });

      expect(mockOperations.bulkCreate).toHaveBeenCalled();
      expect(result.message).toContain('2/2');
    });
  });

  describe('maximo_bulk_update', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_bulk_update');
    });

    it('should call bulkUpdate operation', async () => {
      const mockResponse = {
        success: true,
        data: { successful: 3, failed: 0, total: 3, results: [] },
      };

      mockOperations.bulkUpdate.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectStructure: 'mxwodetail',
        updates: [],
      });

      expect(mockOperations.bulkUpdate).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_bulk_delete', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_bulk_delete');
    });

    it('should call bulkDelete operation', async () => {
      const mockResponse = {
        success: true,
        data: { successful: 5, failed: 0, total: 5, results: [] },
      };

      mockOperations.bulkDelete.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectStructure: 'mxwodetail',
        ids: ['1', '2', '3', '4', '5'],
      });

      expect(mockOperations.bulkDelete).toHaveBeenCalled();
      expect(result.message).toContain('5/5');
    });
  });

  describe('maximo_batch_process', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_batch_process');
    });

    it('should call batchProcess operation', async () => {
      const mockResponse = {
        success: true,
        data: { successful: 3, failed: 0, total: 3, results: [], rolledBack: false },
      };

      mockOperations.batchProcess.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        operations: [],
      });

      expect(mockOperations.batchProcess).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
