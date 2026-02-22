/**
 * Unit tests for Preventive Maintenance MCP Tools
 * Tests all 13 MCP tool definitions and handlers
 */

import { createPMTools } from '../../../../src/modules/preventive-maintenance/tools';
import { PMOperations } from '../../../../src/modules/preventive-maintenance/operations';
import { createMockApiResponse } from '../../../fixtures/test-helpers';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

/** Reusable mock PM record fixture */
const mockPM = {
  pmnum: 'PM001',
  description: 'Test PM Record',
  siteid: 'BEDFORD',
  status: 'ACTIVE',
  frequency: 30,
  frequnit: 'DAYS',
  nextdate: '2024-03-01T00:00:00Z',
  href: 'http://maximo.example.com/maximo/oslc/os/mxpm/1',
};

describe('Preventive Maintenance MCP Tools', () => {
  let mockOperations: jest.Mocked<PMOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockOperations = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      generateWorkOrders: jest.fn(),
      createJobPlan: jest.fn(),
      search: jest.fn(),
      completePM: jest.fn(),
      getPMHistory: jest.fn(),
      getPMSchedule: jest.fn(),
      updatePMFrequency: jest.fn(),
      activatePM: jest.fn(),
      deactivatePM: jest.fn(),
    } as any;

    tools = createPMTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 13 tools', () => {
      expect(tools).toHaveLength(13);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(13);
    });

    it('should have all required tool properties', () => {
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool).toHaveProperty('handler');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.handler).toBe('function');
      });
    });

    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_pm',
        'maximo_get_pm',
        'maximo_update_pm',
        'maximo_delete_pm',
        'maximo_generate_pm_wo',
        'maximo_create_jobplan',
        'maximo_search_pms',
        'maximo_complete_pm',
        'maximo_get_pm_history',
        'maximo_get_pm_schedule',
        'maximo_update_pm_frequency',
        'maximo_activate_pm',
        'maximo_deactivate_pm',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_create_pm', () => {
    it('should create PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_pm');
      expect(tool).toBeDefined();

      const input = {
        description: 'Test PM Record',
        siteid: 'BEDFORD',
        frequency: 30,
        frequnit: 'DAYS',
      };

      const response = createMockApiResponse(mockPM);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_pm');
      expect(tool.inputSchema.required).toEqual(['description', 'siteid', 'frequency', 'frequnit']);
    });
  });

  describe('maximo_get_pm', () => {
    it('should get PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockPM);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('PM001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum']);
    });
  });

  describe('maximo_update_pm', () => {
    it('should update PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated PM',
          frequency: 14,
        },
      };

      const response = createMockApiResponse(mockPM);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'PM001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'updates']);
    });
  });

  describe('maximo_delete_pm', () => {
    it('should delete PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('PM001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum']);
    });
  });

  describe('maximo_generate_pm_wo', () => {
    it('should generate work orders via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_generate_pm_wo');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        targetdate: '2024-03-01T00:00:00Z',
      };

      const response = createMockApiResponse({ workOrders: ['WO5001'] });
      mockOperations.generateWorkOrders.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.generateWorkOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_generate_pm_wo');
      expect(tool.inputSchema.required).toEqual(['pmnum']);
    });
  });

  describe('maximo_create_jobplan', () => {
    it('should create job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_jobplan');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP002',
        description: 'New Job Plan',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        jpnum: 'JP002',
        description: 'New Job Plan',
        siteid: 'BEDFORD',
      });
      mockOperations.createJobPlan.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.createJobPlan).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_jobplan');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'description', 'siteid']);
    });
  });

  describe('maximo_search_pms', () => {
    it('should search PMs via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_pms');
      expect(tool).toBeDefined();

      const input = {
        status: 'ACTIVE',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        member: [mockPM],
      });
      mockOperations.search.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t) => t.name === 'maximo_search_pms');
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });

  describe('maximo_complete_pm', () => {
    it('should complete PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_complete_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        completionDate: '2024-02-15T00:00:00Z',
        memo: 'Work completed',
      };

      const response = createMockApiResponse(mockPM);
      mockOperations.completePM.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.completePM).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
          memo: 'Work completed',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_complete_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid']);
    });
  });

  describe('maximo_get_pm_history', () => {
    it('should get PM history via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm_history');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        pageSize: 50,
      };

      const response = createMockApiResponse({
        member: [{ wonum: 'WO5001', status: 'CLOSE' }],
        totalCount: 1,
      });
      mockOperations.getPMHistory.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getPMHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
          pageSize: 50,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm_history');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid']);
    });
  });

  describe('maximo_get_pm_schedule', () => {
    it('should get PM schedule via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm_schedule');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        count: 5,
      };

      const response = createMockApiResponse({
        pmnum: 'PM001',
        frequency: 30,
        frequnit: 'DAYS',
        nextdate: '2024-03-01T00:00:00Z',
        projectedDates: [],
      });
      mockOperations.getPMSchedule.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getPMSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
          count: 5,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm_schedule');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid']);
    });
  });

  describe('maximo_update_pm_frequency', () => {
    it('should update PM frequency via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_pm_frequency');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
        frequency: 14,
        frequnit: 'WEEKS',
      };

      const response = createMockApiResponse(mockPM);
      mockOperations.updatePMFrequency.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.updatePMFrequency).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
          frequency: 14,
          frequnit: 'WEEKS',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_pm_frequency');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid', 'frequency', 'frequnit']);
    });
  });

  describe('maximo_activate_pm', () => {
    it('should activate PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_activate_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({ ...mockPM, status: 'ACTIVE' });
      mockOperations.activatePM.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.activatePM).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_activate_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid']);
    });
  });

  describe('maximo_deactivate_pm', () => {
    it('should deactivate PM via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_deactivate_pm');
      expect(tool).toBeDefined();

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({ ...mockPM, status: 'INACTIVE' });
      mockOperations.deactivatePM.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.deactivatePM).toHaveBeenCalledWith(
        expect.objectContaining({
          pmnum: 'PM001',
          siteid: 'BEDFORD',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_deactivate_pm');
      expect(tool.inputSchema.required).toEqual(['pmnum', 'siteid']);
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_pm');

      const invalidInput = {
        description: '', // Invalid: empty description
        siteid: 'BEDFORD',
        frequency: 30,
        frequnit: 'DAYS',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_pm');

      const input = {
        pmnum: 'PM001',
        siteid: 'BEDFORD',
      };

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });
});
