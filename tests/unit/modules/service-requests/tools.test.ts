/**
 * Unit tests for Service Request MCP Tools
 * Tests all 12 MCP tool definitions and handlers
 */

import { createServiceRequestTools } from '../../../../src/modules/service-requests/tools';
import { ServiceRequestOperations } from '../../../../src/modules/service-requests/operations';
import { mockServiceRequest } from '../../../fixtures/maximo-responses';
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

describe('Service Request MCP Tools', () => {
  let mockOperations: jest.Mocked<ServiceRequestOperations>;
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
      convertToWorkOrder: jest.fn(),
      search: jest.fn(),
      addWorkLog: jest.fn(),
      assign: jest.fn(),
      escalate: jest.fn(),
      getRelatedWorkOrders: jest.fn(),
      addSolution: jest.fn(),
    } as any;

    tools = createServiceRequestTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 12 tools', () => {
      expect(tools).toHaveLength(12);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t: any) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(12);
    });

    it('should have all required tool properties', () => {
      tools.forEach((tool: any) => {
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

  describe('Tool Names', () => {
    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_sr',
        'maximo_get_sr',
        'maximo_update_sr',
        'maximo_delete_sr',
        'maximo_change_sr_status',
        'maximo_convert_sr_to_wo',
        'maximo_search_srs',
        'maximo_add_sr_worklog',
        'maximo_assign_sr',
        'maximo_escalate_sr',
        'maximo_get_sr_related_wos',
        'maximo_add_sr_solution',
      ];

      const actualNames = tools.map((t: any) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_create_sr', () => {
    it('should create service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_sr');
      expect(tool).toBeDefined();

      const input = {
        description: 'Broken printer',
        reportedby: 'USER001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockServiceRequest);
      mockOperations.create.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.create).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should handle creation errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_sr');

      mockOperations.create.mockRejectedValue(new Error('Creation failed'));

      await expect(
        tool.handler({ description: '', reportedby: 'USER001', siteid: 'BEDFORD' })
      ).rejects.toThrow();
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_sr');
      expect(tool.inputSchema.required).toEqual(['description', 'reportedby', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('description');
      expect(tool.inputSchema.properties).toHaveProperty('reportedby');
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
      expect(tool.inputSchema.properties).toHaveProperty('affectedperson');
      expect(tool.inputSchema.properties).toHaveProperty('reportedpriority');
    });
  });

  describe('maximo_get_sr', () => {
    it('should get service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(mockServiceRequest);
      mockOperations.get.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.get).toHaveBeenCalledWith('SR1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should handle not found errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr');

      mockOperations.get.mockRejectedValue(new Error('Not found'));

      await expect(
        tool.handler({ ticketid: 'INVALID', siteid: 'BEDFORD' })
      ).rejects.toThrow('Not found');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid']);
    });
  });

  describe('maximo_update_sr', () => {
    it('should update service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_sr');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        updates: {
          description: 'Updated description',
          reportedpriority: 1,
        },
      };

      const response = createMockApiResponse(mockServiceRequest);
      mockOperations.update.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.update).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        expect.objectContaining(input.updates)
      );
      expect(result).toEqual(response);
    });

    it('should handle update errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_sr');

      mockOperations.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        tool.handler({
          ticketid: 'SR1001',
          siteid: 'BEDFORD',
          updates: { description: 'Test' },
        })
      ).rejects.toThrow('Update failed');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_sr');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid', 'updates']);
    });
  });

  describe('maximo_delete_sr', () => {
    it('should delete service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_delete_sr');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse(undefined as any, { statusCode: 204 });
      mockOperations.delete.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.delete).toHaveBeenCalledWith('SR1001', 'BEDFORD');
      expect(result).toEqual(response);
    });

    it('should handle delete errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_delete_sr');

      mockOperations.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Delete failed');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_delete_sr');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid']);
    });
  });

  describe('maximo_change_sr_status', () => {
    it('should change status via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_change_sr_status');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        status: 'QUEUED',
        memo: 'Moving to queue',
      };

      const response = createMockApiResponse({
        ...mockServiceRequest,
        status: 'QUEUED',
      });
      mockOperations.changeStatus.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.changeStatus).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        'QUEUED',
        'Moving to queue'
      );
      expect(result).toEqual(response);
    });

    it('should handle status change errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_change_sr_status');

      mockOperations.changeStatus.mockRejectedValue(
        new Error('Invalid status transition')
      );

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD', status: 'CLOSED' })
      ).rejects.toThrow('Invalid status transition');
    });

    it('should have correct input schema with status enum', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_change_sr_status');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid', 'status']);
      expect(tool.inputSchema.properties.status.enum).toContain('NEW');
      expect(tool.inputSchema.properties.status.enum).toContain('QUEUED');
      expect(tool.inputSchema.properties.status.enum).toContain('RESOLVED');
      expect(tool.inputSchema.properties.status.enum).toContain('CLOSED');
    });
  });

  describe('maximo_convert_sr_to_wo', () => {
    it('should convert SR to work order via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_convert_sr_to_wo');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        worktype: 'CM',
      };

      const response = createMockApiResponse({
        success: true,
        wonum: 'WO2001',
        workOrder: { wonum: 'WO2001', siteid: 'BEDFORD' },
      });
      mockOperations.convertToWorkOrder.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.convertToWorkOrder).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        'CM'
      );
      expect(result).toEqual(response);
    });

    it('should handle conversion errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_convert_sr_to_wo');

      mockOperations.convertToWorkOrder.mockRejectedValue(
        new Error('Conversion failed')
      );

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Conversion failed');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_convert_sr_to_wo');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('worktype');
    });
  });

  describe('maximo_search_srs', () => {
    it('should search service requests via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_srs');
      expect(tool).toBeDefined();

      const input = {
        status: 'NEW',
        siteid: 'BEDFORD',
        pageSize: 10,
      };

      const response = createMockApiResponse({
        serviceRequests: [mockServiceRequest],
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

    it('should handle search errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_srs');

      mockOperations.search.mockRejectedValue(new Error('Search failed'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow(
        'Search failed'
      );
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_srs');
      expect(tool.inputSchema.required).toBeUndefined();
      expect(tool.inputSchema.properties).toHaveProperty('status');
      expect(tool.inputSchema.properties).toHaveProperty('reportedby');
      expect(tool.inputSchema.properties).toHaveProperty('dateRange');
    });
  });

  describe('maximo_add_sr_worklog', () => {
    it('should add work log via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_worklog');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        description: 'Customer callback completed',
        logtype: 'CLIENTNOTE',
      };

      const response = createMockApiResponse({ worklogid: 1 });
      mockOperations.addWorkLog.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addWorkLog).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        expect.objectContaining({
          description: 'Customer callback completed',
          logtype: 'CLIENTNOTE',
        })
      );
      expect(result).toEqual(response);
    });

    it('should handle work log errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_worklog');

      mockOperations.addWorkLog.mockRejectedValue(new Error('WorkLog failed'));

      await expect(
        tool.handler({
          ticketid: 'SR1001',
          siteid: 'BEDFORD',
          description: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_worklog');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid', 'description']);
      expect(tool.inputSchema.properties.logtype.enum).toContain('CLIENTNOTE');
      expect(tool.inputSchema.properties.logtype.enum).toContain('WORK');
    });
  });

  describe('maximo_assign_sr', () => {
    it('should assign service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_assign_sr');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        owner: 'TECH001',
        ownergroup: 'SUPPORT',
      };

      const response = createMockApiResponse({
        ...mockServiceRequest,
        owner: 'TECH001',
        ownergroup: 'SUPPORT',
      });
      mockOperations.assign.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.assign).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        expect.objectContaining({
          owner: 'TECH001',
          ownergroup: 'SUPPORT',
        })
      );
      expect(result).toEqual(response);
    });

    it('should handle assignment errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_assign_sr');

      mockOperations.assign.mockRejectedValue(new Error('Assignment failed'));

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD', owner: 'TECH001' })
      ).rejects.toThrow();
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_assign_sr');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid', 'owner']);
    });
  });

  describe('maximo_escalate_sr', () => {
    it('should escalate service request via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_escalate_sr');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        newPriority: 1,
        escalationReason: 'VIP customer',
        newOwnerGroup: 'ESCL',
      };

      const response = createMockApiResponse({
        ...mockServiceRequest,
        reportedpriority: 1,
      });
      mockOperations.escalate.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.escalate).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        expect.objectContaining({
          newPriority: 1,
          escalationReason: 'VIP customer',
          newOwnerGroup: 'ESCL',
        })
      );
      expect(result).toEqual(response);
    });

    it('should handle escalation errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_escalate_sr');

      mockOperations.escalate.mockRejectedValue(new Error('Escalation failed'));

      await expect(
        tool.handler({
          ticketid: 'SR1001',
          siteid: 'BEDFORD',
          newPriority: 1,
          escalationReason: 'Urgent',
        })
      ).rejects.toThrow();
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_escalate_sr');
      expect(tool.inputSchema.required).toEqual([
        'ticketid',
        'siteid',
        'newPriority',
        'escalationReason',
      ]);
    });
  });

  describe('maximo_get_sr_related_wos', () => {
    it('should get related work orders via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr_related_wos');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({
        workOrders: [{ wonum: 'WO2001', siteid: 'BEDFORD' }],
        totalCount: 1,
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
      });
      mockOperations.getRelatedWorkOrders.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getRelatedWorkOrders).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD'
      );
      expect(result).toEqual(response);
    });

    it('should handle errors when getting related work orders', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr_related_wos');

      mockOperations.getRelatedWorkOrders.mockRejectedValue(new Error('Failed'));

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('Failed');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr_related_wos');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid']);
    });
  });

  describe('maximo_add_sr_solution', () => {
    it('should add solution via tool handler', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_solution');
      expect(tool).toBeDefined();

      const input = {
        ticketid: 'SR1001',
        siteid: 'BEDFORD',
        solution: 'Replaced printer toner cartridge',
        autoResolve: true,
      };

      const response = createMockApiResponse({
        ...mockServiceRequest,
        solution: 'Replaced printer toner cartridge',
        status: 'RESOLVED',
      });
      mockOperations.addSolution.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addSolution).toHaveBeenCalledWith(
        'SR1001',
        'BEDFORD',
        expect.objectContaining({
          solution: 'Replaced printer toner cartridge',
          autoResolve: true,
        })
      );
      expect(result).toEqual(response);
    });

    it('should handle solution errors', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_solution');

      mockOperations.addSolution.mockRejectedValue(new Error('Solution failed'));

      await expect(
        tool.handler({
          ticketid: 'SR1001',
          siteid: 'BEDFORD',
          solution: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_sr_solution');
      expect(tool.inputSchema.required).toEqual(['ticketid', 'siteid', 'solution']);
      expect(tool.inputSchema.properties).toHaveProperty('autoResolve');
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors from create tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_sr');

      const invalidInput = {
        description: '', // Invalid: empty
        reportedby: 'USER001',
        siteid: 'BEDFORD',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors from get tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_sr');

      mockOperations.get.mockRejectedValue(new Error('API Error'));

      await expect(
        tool.handler({ ticketid: 'SR1001', siteid: 'BEDFORD' })
      ).rejects.toThrow('API Error');
    });
  });
});
