/**
 * Unit tests for Scheduler MCP Tools
 * Tests all 6 MCP tool definitions and handlers
 */

import { createSchedulerTools } from '../../../../src/modules/scheduler/tools';
import { SchedulerOperations } from '../../../../src/modules/scheduler/operations';
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

describe('Scheduler MCP Tools', () => {
  let mockOperations: jest.Mocked<SchedulerOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock operations
    mockOperations = {
      getWorkSchedule: jest.fn(),
      getUnscheduledWork: jest.fn(),
      getLaborAvailability: jest.fn(),
      getWorkBacklog: jest.fn(),
      findScheduleConflicts: jest.fn(),
      getUpcomingPMs: jest.fn(),
    } as any;

    tools = createSchedulerTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 6 tools', () => {
      expect(tools).toHaveLength(6);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(6);
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
        'maximo_get_work_schedule',
        'maximo_get_unscheduled_work',
        'maximo_get_labor_availability',
        'maximo_get_work_backlog',
        'maximo_find_schedule_conflicts',
        'maximo_get_upcoming_pms',
      ];

      const actualNames = tools.map((t) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe('maximo_get_work_schedule', () => {
    it('should call getWorkSchedule with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        entries: [],
        totalCount: 0,
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
        siteid: 'BEDFORD',
      });
      mockOperations.getWorkSchedule.mockResolvedValue(mockResponse);

      const input = {
        siteid: 'BEDFORD',
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
      };

      const result = await tool.handler(input);

      expect(mockOperations.getWorkSchedule).toHaveBeenCalledWith(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59',
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass optional personid and craft', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');

      const mockResponse = createMockApiResponse({
        entries: [],
        totalCount: 0,
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
        siteid: 'BEDFORD',
      });
      mockOperations.getWorkSchedule.mockResolvedValue(mockResponse);

      await tool.handler({
        siteid: 'BEDFORD',
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
        personid: 'TECH001',
        craft: 'ELEC',
        pageSize: 50,
      });

      expect(mockOperations.getWorkSchedule).toHaveBeenCalledWith(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59',
        'TECH001',
        'ELEC',
        50
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');
      expect(tool.inputSchema.required).toEqual(['siteid', 'startDate', 'endDate']);
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
      expect(tool.inputSchema.properties).toHaveProperty('startDate');
      expect(tool.inputSchema.properties).toHaveProperty('endDate');
      expect(tool.inputSchema.properties).toHaveProperty('personid');
      expect(tool.inputSchema.properties).toHaveProperty('craft');
      expect(tool.inputSchema.properties).toHaveProperty('pageSize');
    });

    it('should reject empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');

      await expect(
        tool.handler({ siteid: '', startDate: '2024-01-15T00:00:00', endDate: '2024-01-31T23:59:59' })
      ).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');

      mockOperations.getWorkSchedule.mockRejectedValue(new Error('API Error'));

      await expect(
        tool.handler({ siteid: 'BEDFORD', startDate: '2024-01-15T00:00:00', endDate: '2024-01-31T23:59:59' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('maximo_get_unscheduled_work', () => {
    it('should call getUnscheduledWork with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_unscheduled_work');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        workOrders: [],
        totalCount: 0,
        siteid: 'BEDFORD',
      });
      mockOperations.getUnscheduledWork.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getUnscheduledWork).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass pageSize when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_unscheduled_work');

      const mockResponse = createMockApiResponse({
        workOrders: [],
        totalCount: 0,
        siteid: 'BEDFORD',
      });
      mockOperations.getUnscheduledWork.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', pageSize: 50 });

      expect(mockOperations.getUnscheduledWork).toHaveBeenCalledWith(
        'BEDFORD',
        50
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_unscheduled_work');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('pageSize');
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_unscheduled_work');

      mockOperations.getUnscheduledWork.mockRejectedValue(new Error('Timeout'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Timeout');
    });
  });

  describe('maximo_get_labor_availability', () => {
    it('should call getLaborAvailability with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_labor_availability');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        availability: [],
        date: '2024-01-15',
        siteid: 'BEDFORD',
      });
      mockOperations.getLaborAvailability.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getLaborAvailability).toHaveBeenCalledWith(
        'BEDFORD',
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass optional date and craft', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_labor_availability');

      const mockResponse = createMockApiResponse({
        availability: [],
        date: '2024-01-15',
        siteid: 'BEDFORD',
      });
      mockOperations.getLaborAvailability.mockResolvedValue(mockResponse);

      await tool.handler({
        siteid: 'BEDFORD',
        date: '2024-01-15',
        craft: 'ELEC',
        pageSize: 25,
      });

      expect(mockOperations.getLaborAvailability).toHaveBeenCalledWith(
        'BEDFORD',
        '2024-01-15',
        'ELEC',
        25
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_labor_availability');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('date');
      expect(tool.inputSchema.properties).toHaveProperty('craft');
      expect(tool.inputSchema.properties).toHaveProperty('pageSize');
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_labor_availability');

      mockOperations.getLaborAvailability.mockRejectedValue(new Error('Connection refused'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Connection refused');
    });
  });

  describe('maximo_get_work_backlog', () => {
    it('should call getWorkBacklog with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_backlog');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        siteid: 'BEDFORD',
        totalUnscheduled: 10,
        totalUnassigned: 5,
        byPriority: [],
        byStatus: [],
      });
      mockOperations.getWorkBacklog.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getWorkBacklog).toHaveBeenCalledWith('BEDFORD');
      expect(result).toEqual(mockResponse);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_backlog');
      expect(tool.inputSchema.required).toEqual(['siteid']);
    });

    it('should reject empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_backlog');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_backlog');

      mockOperations.getWorkBacklog.mockRejectedValue(new Error('Server error'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('Server error');
    });
  });

  describe('maximo_find_schedule_conflicts', () => {
    it('should call findScheduleConflicts with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_find_schedule_conflicts');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        conflicts: [],
        totalConflicts: 0,
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
        siteid: 'BEDFORD',
      });
      mockOperations.findScheduleConflicts.mockResolvedValue(mockResponse);

      const result = await tool.handler({
        siteid: 'BEDFORD',
        startDate: '2024-01-15T00:00:00',
        endDate: '2024-01-31T23:59:59',
      });

      expect(mockOperations.findScheduleConflicts).toHaveBeenCalledWith(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_find_schedule_conflicts');
      expect(tool.inputSchema.required).toEqual(['siteid', 'startDate', 'endDate']);
    });

    it('should reject empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_find_schedule_conflicts');

      await expect(
        tool.handler({ siteid: '', startDate: '2024-01-15T00:00:00', endDate: '2024-01-31T23:59:59' })
      ).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_find_schedule_conflicts');

      mockOperations.findScheduleConflicts.mockRejectedValue(new Error('Query failed'));

      await expect(
        tool.handler({ siteid: 'BEDFORD', startDate: '2024-01-15T00:00:00', endDate: '2024-01-31T23:59:59' })
      ).rejects.toThrow('Query failed');
    });
  });

  describe('maximo_get_upcoming_pms', () => {
    it('should call getUpcomingPMs with correct arguments', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');
      expect(tool).toBeDefined();

      const mockResponse = createMockApiResponse({
        pms: [],
        totalCount: 0,
        days: 30,
        siteid: 'BEDFORD',
      });
      mockOperations.getUpcomingPMs.mockResolvedValue(mockResponse);

      const result = await tool.handler({ siteid: 'BEDFORD' });

      expect(mockOperations.getUpcomingPMs).toHaveBeenCalledWith(
        'BEDFORD',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass days when provided', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');

      const mockResponse = createMockApiResponse({
        pms: [],
        totalCount: 0,
        days: 60,
        siteid: 'BEDFORD',
      });
      mockOperations.getUpcomingPMs.mockResolvedValue(mockResponse);

      await tool.handler({ siteid: 'BEDFORD', days: 60 });

      expect(mockOperations.getUpcomingPMs).toHaveBeenCalledWith(
        'BEDFORD',
        60
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');
      expect(tool.inputSchema.required).toEqual(['siteid']);
      expect(tool.inputSchema.properties).toHaveProperty('days');
    });

    it('should reject empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');

      mockOperations.getUpcomingPMs.mockRejectedValue(new Error('PM query failed'));

      await expect(tool.handler({ siteid: 'BEDFORD' })).rejects.toThrow('PM query failed');
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors for empty siteid', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_backlog');

      await expect(tool.handler({ siteid: '' })).rejects.toThrow();
    });

    it('should propagate validation errors for siteid exceeding max length', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_upcoming_pms');

      await expect(tool.handler({ siteid: 'TOOLONGSITE' })).rejects.toThrow();
    });

    it('should propagate operation errors', async () => {
      const tool = tools.find((t) => t.name === 'maximo_get_work_schedule');

      mockOperations.getWorkSchedule.mockRejectedValue(new Error('Fatal'));

      await expect(
        tool.handler({ siteid: 'BEDFORD', startDate: '2024-01-15T00:00:00', endDate: '2024-01-31T23:59:59' })
      ).rejects.toThrow('Fatal');
    });
  });
});
