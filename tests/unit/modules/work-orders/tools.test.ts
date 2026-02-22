/**
 * Unit tests for Work Order MCP Tools
 * Tests all 11 MCP tool definitions and handlers
 */

import { createWorkOrderTools } from '../../../../src/modules/work-orders/tools';
import { WorkOrderOperations } from '../../../../src/modules/work-orders/operations';
import { mockWorkOrder } from '../../../fixtures/maximo-responses';
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

describe('Work Order MCP Tools', () => {
  let mockOperations: jest.Mocked<WorkOrderOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock operations
    mockOperations = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      changeStatus: jest.fn(),
      addLabor: jest.fn(),
      addMaterial: jest.fn(),
      addService: jest.fn(),
      addWorkLog: jest.fn(),
      assign: jest.fn(),
      search: jest.fn(),
      addTask: jest.fn(),
      getTasks: jest.fn(),
      getWorkLogs: jest.fn(),
      close: jest.fn(),
    } as any;

    tools = createWorkOrderTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 15 tools', () => {
      expect(tools).toHaveLength(15);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(15);
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
  });

  describe('maximo_create_workorder', () => {
    it('should create work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_workorder');
      expect(tool).toBeDefined();

      const input = {
        description: 'Test Work Order',
        siteid: 'BEDFORD',
        worktype: 'CM',
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_create_workorder');
      expect(tool.inputSchema.required).toEqual(['description', 'siteid', 'worktype']);
      expect(tool.inputSchema.properties).toHaveProperty('description');
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
      expect(tool.inputSchema.properties).toHaveProperty('worktype');
    });
  });

  describe('maximo_get_workorder', () => {
    it('should get work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_workorder');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('WO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_workorder');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
    });
  });

  describe('maximo_update_workorder', () => {
    it('should update work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_update_workorder');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated description',
          priority: 1,
        },
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_update_workorder');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid', 'updates']);
    });
  });

  describe('maximo_delete_workorder', () => {
    it('should delete work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_workorder');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('WO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_delete_workorder');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
    });
  });

  describe('maximo_change_workorder_status', () => {
    it('should change work order status via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_change_workorder_status');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        status: 'APPR',
        memo: 'Approved by manager',
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockOperations.changeStatus.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.changeStatus).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        'APPR',
        'Approved by manager'
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema with status enum', () => {
      const tool = tools.find((t) => t.name === 'maximo_change_workorder_status');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid', 'status']);
      expect(tool.inputSchema.properties.status.enum).toContain('WAPPR');
      expect(tool.inputSchema.properties.status.enum).toContain('APPR');
      expect(tool.inputSchema.properties.status.enum).toContain('CLOSE');
    });
  });

  describe('maximo_add_labor', () => {
    it('should add labor transaction via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_labor');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        laborcode: 'LAB001',
        hours: 8,
        transdate: '2024-01-15',
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addLabor.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addLabor).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          laborcode: 'LAB001',
          hours: 8,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_labor');
      expect(tool.inputSchema.required).toEqual([
        'wonum',
        'siteid',
        'laborcode',
        'hours',
        'transdate',
      ]);
    });
  });

  describe('maximo_add_material', () => {
    it('should add material transaction via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_material');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        itemnum: 'ITEM001',
        quantity: 5,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addMaterial.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addMaterial).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          itemnum: 'ITEM001',
          quantity: 5,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_material');
      expect(tool.inputSchema.required).toEqual([
        'wonum',
        'siteid',
        'itemnum',
        'quantity',
      ]);
    });
  });

  describe('maximo_add_service', () => {
    it('should add service entry via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_service');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        description: 'External service',
        linecost: 500.0,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addService.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addService).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          description: 'External service',
          linecost: 500.0,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_service');
      expect(tool.inputSchema.required).toEqual([
        'wonum',
        'siteid',
        'description',
        'linecost',
      ]);
    });
  });

  describe('maximo_add_worklog', () => {
    it('should add work log entry via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_worklog');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        description: 'Work completed',
        logtype: 'WORK',
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addWorkLog.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addWorkLog).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          description: 'Work completed',
          logtype: 'WORK',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_worklog');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid', 'description']);
    });
  });

  describe('maximo_assign_workorder', () => {
    it('should assign work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_assign_workorder');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        owner: 'TECH001',
        ownergroup: 'MAINT',
      };

      const response = createMockApiResponse(mockWorkOrder);
      mockOperations.assign.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.assign).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          owner: 'TECH001',
          ownergroup: 'MAINT',
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_assign_workorder');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
    });
  });

  describe('maximo_search_workorders', () => {
    it('should search work orders via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_workorders');
      expect(tool).toBeDefined();

      const input = {
        status: 'WAPPR',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        workOrders: [mockWorkOrder],
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

    it('should handle multiple status values', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_workorders');

      const input = {
        status: ['WAPPR', 'APPR', 'INPRG'],
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        workOrders: [mockWorkOrder],
        totalCount: 1,
      });
      mockOperations.search.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['WAPPR', 'APPR', 'INPRG'],
        })
      );
    });

    it('should handle date range filter', async () => {
      const tool = tools.find((t) => t.name === 'maximo_search_workorders');

      const input = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
          field: 'statusdate',
        },
      };

      const response = createMockApiResponse({
        workOrders: [],
        totalCount: 0,
      });
      mockOperations.search.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.search).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: input.dateRange,
        })
      );
    });

    it('should have flexible input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_search_workorders');
      expect(tool.inputSchema.required).toBeUndefined(); // All fields optional
      expect(tool.inputSchema.properties).toHaveProperty('status');
      expect(tool.inputSchema.properties).toHaveProperty('assetnum');
      expect(tool.inputSchema.properties).toHaveProperty('location');
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_create_workorder');

      const invalidInput = {
        description: '', // Invalid: empty description
        siteid: 'BEDFORD',
        worktype: 'CM',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_workorder');

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });

  describe('maximo_add_task', () => {
    it('should add task to work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_add_task');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        description: 'Inspect pump',
        taskid: 10,
        estdur: 2,
      };

      const response = createMockApiResponse({ success: true });
      mockOperations.addTask.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addTask).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        expect.objectContaining({
          description: 'Inspect pump',
          taskid: 10,
          estdur: 2,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_add_task');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid', 'description', 'taskid']);
      expect(tool.inputSchema.properties).toHaveProperty('estdur');
      expect(tool.inputSchema.properties).toHaveProperty('owner');
      expect(tool.inputSchema.properties).toHaveProperty('ownergroup');
    });
  });

  describe('maximo_get_tasks', () => {
    it('should get tasks for work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_tasks');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      const mockTasks = [
        { taskid: 10, description: 'Inspect pump' },
        { taskid: 20, description: 'Replace filter' },
      ];
      const response = createMockApiResponse(mockTasks);
      mockOperations.getTasks.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getTasks).toHaveBeenCalledWith('WO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_tasks');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
    });
  });

  describe('maximo_get_worklogs', () => {
    it('should get work logs for work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_worklogs');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      const mockLogs = [
        { worklogid: 1, description: 'Work started', logtype: 'WORK' },
      ];
      const response = createMockApiResponse(mockLogs);
      mockOperations.getWorkLogs.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getWorkLogs).toHaveBeenCalledWith('WO1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_worklogs');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
    });
  });

  describe('maximo_close_workorder', () => {
    it('should close work order via tool', async () => {
      const tool = tools.find((t) => t.name === 'maximo_close_workorder');
      expect(tool).toBeDefined();

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
        memo: 'All work completed',
      };

      const response = createMockApiResponse({ ...mockWorkOrder, status: 'CLOSE' });
      mockOperations.close.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.close).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        'All work completed'
      );
      expect(result).toEqual(response);
    });

    it('should close work order without memo', async () => {
      const tool = tools.find((t) => t.name === 'maximo_close_workorder');

      const input = {
        wonum: 'WO1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({ ...mockWorkOrder, status: 'CLOSE' });
      mockOperations.close.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.close).toHaveBeenCalledWith(
        'WO1001',
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_close_workorder');
      expect(tool.inputSchema.required).toEqual(['wonum', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('memo');
    });
  });

  describe('Tool Names', () => {
    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_workorder',
        'maximo_get_workorder',
        'maximo_update_workorder',
        'maximo_delete_workorder',
        'maximo_change_workorder_status',
        'maximo_add_labor',
        'maximo_add_material',
        'maximo_add_service',
        'maximo_add_worklog',
        'maximo_assign_workorder',
        'maximo_search_workorders',
        'maximo_add_task',
        'maximo_get_tasks',
        'maximo_get_worklogs',
        'maximo_close_workorder',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });
});