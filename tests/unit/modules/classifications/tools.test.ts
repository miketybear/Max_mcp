/**
 * Unit tests for Classification MCP Tools
 * Tests all 4 MCP tool definitions
 */

import { createClassificationTools } from '../../../../src/modules/classifications/tools';
import { ClassificationOperations } from '../../../../src/modules/classifications/operations';

jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Classification Tools', () => {
  let mockOperations: jest.Mocked<ClassificationOperations>;
  let tools: any[];

  beforeEach(() => {
    mockOperations = {
      get: jest.fn(),
      getHierarchy: jest.fn(),
      getSpecifications: jest.fn(),
      updateSpecifications: jest.fn(),
    } as any;

    tools = createClassificationTools(mockOperations);
  });

  it('should create 4 tools', () => {
    expect(tools).toHaveLength(4);
  });

  describe('maximo_get_classification', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_get_classification');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_get_classification');
      expect(tool.description).toContain('classification');
    });

    it('should call get operation', async () => {
      const mockResponse = {
        success: true,
        data: { classstructureid: 'TEST' },
      };

      mockOperations.get.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ classstructureid: 'TEST' });

      expect(mockOperations.get).toHaveBeenCalledWith('TEST');
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_get_class_hierarchy', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_get_class_hierarchy');
    });

    it('should call getHierarchy operation', async () => {
      const mockResponse = {
        success: true,
        data: { classification: {}, children: [] },
      };

      mockOperations.getHierarchy.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        classstructureid: 'ROOT',
        levels: 3,
      });

      expect(mockOperations.getHierarchy).toHaveBeenCalledWith('ROOT', 3);
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_get_class_spec', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_get_class_spec');
    });

    it('should call getSpecifications operation', async () => {
      const mockResponse = {
        success: true,
        data: [{ attributeid: 'MODEL' }],
      };

      mockOperations.getSpecifications.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ classstructureid: 'TEST' });

      expect(mockOperations.getSpecifications).toHaveBeenCalledWith('TEST');
      expect(result.count).toBe(1);
    });
  });

  describe('maximo_update_spec_values', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_update_spec_values');
    });

    it('should call updateSpecifications operation', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
      };

      mockOperations.updateSpecifications.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        objectname: 'ASSET',
        objectid: 'ASSET001',
        specifications: { MODEL: 'X100' },
      });

      expect(mockOperations.updateSpecifications).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
