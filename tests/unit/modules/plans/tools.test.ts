/**
 * Unit tests for Job Plan MCP Tools
 * Tests all 11 MCP tool definitions and handlers
 */

import { createJobPlanTools } from '../../../../src/modules/plans/tools';
import { JobPlanOperations } from '../../../../src/modules/plans/operations';
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

/** Reusable mock job plan fixture */
const mockJobPlan = {
  jpnum: 'JP001',
  description: 'Test Job Plan',
  siteid: 'BEDFORD',
  status: 'DRAFT',
  priority: 2,
  href: 'http://maximo.example.com/maximo/oslc/os/mxjobplan/1',
};

describe('Job Plan MCP Tools', () => {
  let mockOperations: jest.Mocked<JobPlanOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockOperations = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      addTask: jest.fn(),
      getTasks: jest.fn(),
      addLabor: jest.fn(),
      addMaterial: jest.fn(),
      addService: jest.fn(),
      getAssociatedWorkOrders: jest.fn(),
    } as any;

    tools = createJobPlanTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 11 tools', () => {
      expect(tools).toHaveLength(11);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(11);
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
        'maximo_create_jobplan',
        'maximo_get_jobplan',
        'maximo_update_jobplan',
        'maximo_delete_jobplan',
        'maximo_search_jobplans',
        'maximo_add_jobplan_task',
        'maximo_get_jobplan_tasks',
        'maximo_add_jobplan_labor',
        'maximo_add_jobplan_material',
        'maximo_add_jobplan_service',
        'maximo_get_jobplan_workorders',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_create_jobplan', () => {
    it('should create job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_jobplan');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        description: 'Test Job Plan',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockJobPlan);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_jobplan');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'description']);
      expect(tool.inputSchema.properties).toHaveProperty('jpnum');
      expect(tool.inputSchema.properties).toHaveProperty('description');
    });
  });

  describe('maximo_get_jobplan', () => {
    it('should get job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockJobPlan);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('JP001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan');
      expect(tool.inputSchema.required).toEqual(['jpnum']);
    });
  });

  describe('maximo_update_jobplan', () => {
    it('should update job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_jobplan');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated description',
          priority: 1,
        },
      };

      const response = createMockApiResponse(mockJobPlan);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'JP001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_jobplan');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'siteid', 'updates']);
    });
  });

  describe('maximo_delete_jobplan', () => {
    it('should delete job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_jobplan');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('JP001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_jobplan');
      expect(tool.inputSchema.required).toEqual(['jpnum']);
    });
  });

  describe('maximo_search_jobplans', () => {
    it('should search job plans via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_jobplans');
      expect(tool).toBeDefined();

      const input = {
        status: 'DRAFT',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        jobPlans: [mockJobPlan],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
      mockOperations.search.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t) => t.name === 'maximo_search_jobplans');
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });

  describe('maximo_add_jobplan_task', () => {
    it('should add task to job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_task');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
        jptask: 10,
        description: 'Inspect pump',
        duration: 2,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addTask.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addTask).toHaveBeenCalledWith(
        'JP001',
        'BEDFORD',
        expect.objectContaining({
          jptask: 10,
          description: 'Inspect pump',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_task');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'jptask', 'description']);
    });
  });

  describe('maximo_get_jobplan_tasks', () => {
    it('should get tasks for job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan_tasks');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
      };

      const mockTasks = [
        { jptask: 10, description: 'Inspect pump' },
        { jptask: 20, description: 'Replace filter' },
      ];
      const response = createMockApiResponse(mockTasks);
      mockOperations.getTasks.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getTasks).toHaveBeenCalledWith('JP001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan_tasks');
      expect(tool.inputSchema.required).toEqual(['jpnum']);
    });
  });

  describe('maximo_add_jobplan_labor', () => {
    it('should add labor to job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_labor');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
        craft: 'ELECT',
        quantity: 2,
        hours: 8,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addLabor.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addLabor).toHaveBeenCalledWith(
        'JP001',
        'BEDFORD',
        expect.objectContaining({
          craft: 'ELECT',
          quantity: 2,
          hours: 8,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_labor');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'craft', 'quantity', 'hours']);
    });
  });

  describe('maximo_add_jobplan_material', () => {
    it('should add material to job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_material');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
        itemnum: 'ITEM001',
        itemqty: 5,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addMaterial.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addMaterial).toHaveBeenCalledWith(
        'JP001',
        'BEDFORD',
        expect.objectContaining({
          itemnum: 'ITEM001',
          itemqty: 5,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_material');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'itemnum', 'itemqty']);
    });
  });

  describe('maximo_add_jobplan_service', () => {
    it('should add service to job plan via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_service');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
        description: 'External consulting',
        vendor: 'VENDOR01',
        linecost: 1000,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addService.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addService).toHaveBeenCalledWith(
        'JP001',
        'BEDFORD',
        expect.objectContaining({
          description: 'External consulting',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_jobplan_service');
      expect(tool.inputSchema.required).toEqual(['jpnum', 'description']);
    });
  });

  describe('maximo_get_jobplan_workorders', () => {
    it('should get associated work orders via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan_workorders');
      expect(tool).toBeDefined();

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
      };

      const mockWorkOrders = [
        { wonum: 'WO1001', description: 'Work Order 1', status: 'WAPPR' },
      ];
      const response = createMockApiResponse(mockWorkOrders);
      mockOperations.getAssociatedWorkOrders.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getAssociatedWorkOrders).toHaveBeenCalledWith('JP001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan_workorders');
      expect(tool.inputSchema.required).toEqual(['jpnum']);
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_jobplan');

      const invalidInput = {
        jpnum: '', // Invalid: empty jpnum
        description: 'Test',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_jobplan');

      const input = {
        jpnum: 'JP001',
        siteid: 'BEDFORD',
      };

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });
});
