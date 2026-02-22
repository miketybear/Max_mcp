/**
 * Unit tests for Person and Labor MCP Tools
 * Tests all 13 MCP tool definitions and handlers (6 existing + 7 new)
 */

import { createPersonLaborTools } from '../../../../src/modules/persons-labor/tools';
import { PersonLaborOperations } from '../../../../src/modules/persons-labor/operations';
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

const mockPerson = {
  personid: 'PERSON001',
  displayname: 'John Doe',
  status: 'ACTIVE',
  siteid: 'BEDFORD',
  href: 'http://maximo.example.com/maximo/oslc/os/mxperson/1',
};

describe('Person and Labor MCP Tools', () => {
  let mockOperations: jest.Mocked<PersonLaborOperations>;
  let tools: any[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockOperations = {
      createPerson: jest.fn(),
      getPerson: jest.fn(),
      updatePerson: jest.fn(),
      searchPersons: jest.fn(),
      recordLabor: jest.fn(),
      getLaborTransactions: jest.fn(),
      getCrafts: jest.fn(),
      addCraft: jest.fn(),
      getCrews: jest.fn(),
      getCrewMembers: jest.fn(),
      getLaborAvailability: jest.fn(),
      getLaborCostSummary: jest.fn(),
      getQualifiedLabor: jest.fn(),
    } as any;

    tools = createPersonLaborTools(mockOperations);
  });

  describe('Tool Definitions', () => {
    it('should create 13 tools', () => {
      expect(tools).toHaveLength(13);
    });

    it('should have unique tool names', () => {
      const names = tools.map((t: any) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(13);
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

    it('should have correct tool names', () => {
      const expectedNames = [
        'maximo_create_person',
        'maximo_get_person',
        'maximo_update_person',
        'maximo_record_labor',
        'maximo_get_labor_transactions',
        'maximo_search_persons',
        'maximo_get_person_crafts',
        'maximo_add_person_craft',
        'maximo_get_labor_crews',
        'maximo_get_crew_members',
        'maximo_get_labor_availability',
        'maximo_get_labor_cost_summary',
        'maximo_get_qualified_labor',
      ];

      const actualNames = tools.map((t: any) => t.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  // ===== EXISTING TOOLS =====

  describe('maximo_create_person', () => {
    it('should create person via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_person');
      expect(tool).toBeDefined();

      const input = {
        personid: 'PERSON001',
        displayname: 'John Doe',
      };

      const response = createMockApiResponse(mockPerson);
      mockOperations.createPerson.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.createPerson).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_create_person');
      expect(tool.inputSchema.required).toEqual(['personid', 'displayname']);
    });
  });

  describe('maximo_get_person', () => {
    it('should get person via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person');
      expect(tool).toBeDefined();

      const input = { personid: 'PERSON001' };

      const response = createMockApiResponse(mockPerson);
      mockOperations.getPerson.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getPerson).toHaveBeenCalledWith('PERSON001');
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person');
      expect(tool.inputSchema.required).toEqual(['personid']);
    });
  });

  describe('maximo_update_person', () => {
    it('should update person via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_person');
      expect(tool).toBeDefined();

      const input = {
        personid: 'PERSON001',
        updates: { displayname: 'Updated Name' },
      };

      const response = createMockApiResponse(mockPerson);
      mockOperations.updatePerson.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.updatePerson).toHaveBeenCalledWith(
        'PERSON001',
        expect.objectContaining({ displayname: 'Updated Name' })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_update_person');
      expect(tool.inputSchema.required).toEqual(['personid', 'updates']);
    });
  });

  describe('maximo_record_labor', () => {
    it('should record labor via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_record_labor');
      expect(tool).toBeDefined();

      const input = {
        laborcode: 'LAB001',
        transdate: '2024-01-15T00:00:00Z',
        regularhrs: 8,
      };

      const response = createMockApiResponse({ labtransid: 1001 });
      mockOperations.recordLabor.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.recordLabor).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_record_labor');
      expect(tool.inputSchema.required).toEqual(['laborcode', 'transdate']);
    });
  });

  describe('maximo_get_labor_transactions', () => {
    it('should get labor transactions via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_transactions');
      expect(tool).toBeDefined();

      const input = { laborcode: 'LAB001' };

      const response = createMockApiResponse({ member: [] });
      mockOperations.getLaborTransactions.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getLaborTransactions).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });
  });

  describe('maximo_search_persons', () => {
    it('should search persons via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_search_persons');
      expect(tool).toBeDefined();

      const input = { status: 'ACTIVE', siteid: 'BEDFORD' };

      const response = createMockApiResponse({ member: [mockPerson] });
      mockOperations.searchPersons.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.searchPersons).toHaveBeenCalledWith(
        expect.objectContaining(input)
      );
      expect(result).toEqual(response);
    });
  });

  // ===== NEW TOOLS =====

  describe('maximo_get_person_crafts', () => {
    it('should get person crafts via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person_crafts');
      expect(tool).toBeDefined();

      const input = { personid: 'PERSON001' };

      const mockCrafts = [
        { craft: 'ELECT', skilllevel: 'SKILLED', rate: 50, standardrate: 45 },
      ];
      const response = createMockApiResponse(mockCrafts);
      mockOperations.getCrafts.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getCrafts).toHaveBeenCalledWith('PERSON001', undefined);
      expect(result).toEqual(response);
    });

    it('should pass siteid when provided', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person_crafts');

      const input = { personid: 'PERSON001', siteid: 'BEDFORD' };

      const response = createMockApiResponse([]);
      mockOperations.getCrafts.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getCrafts).toHaveBeenCalledWith('PERSON001', 'BEDFORD');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person_crafts');
      expect(tool.inputSchema.required).toEqual(['personid']);
      expect(tool.inputSchema.properties).toHaveProperty('personid');
      expect(tool.inputSchema.properties).toHaveProperty('siteid');
    });
  });

  describe('maximo_add_person_craft', () => {
    it('should add craft to person via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_person_craft');
      expect(tool).toBeDefined();

      const input = {
        personid: 'PERSON001',
        craft: 'ELECT',
        skilllevel: 'SKILLED',
        rate: 50,
      };

      const response = createMockApiResponse({ craft: 'ELECT', skilllevel: 'SKILLED' });
      mockOperations.addCraft.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.addCraft).toHaveBeenCalledWith(
        expect.objectContaining({
          personid: 'PERSON001',
          craft: 'ELECT',
          skilllevel: 'SKILLED',
          rate: 50,
        })
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_person_craft');
      expect(tool.inputSchema.required).toEqual(['personid', 'craft', 'skilllevel']);
      expect(tool.inputSchema.properties.skilllevel.enum).toEqual([
        'APPRENTICE',
        'SEMISKILLED',
        'SKILLED',
        'EXPERT',
      ]);
    });

    it('should reject invalid skill level', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_person_craft');

      const input = {
        personid: 'PERSON001',
        craft: 'ELECT',
        skilllevel: 'INVALID',
      };

      await expect(tool.handler(input)).rejects.toThrow();
    });
  });

  describe('maximo_get_labor_crews', () => {
    it('should get labor crews via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_crews');
      expect(tool).toBeDefined();

      const input = {};

      const response = createMockApiResponse({
        member: [{ laborcrewid: 'CREW001', description: 'Crew A' }],
      });
      mockOperations.getCrews.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getCrews).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(response);
    });

    it('should pass siteid when provided', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_crews');

      const input = { siteid: 'BEDFORD' };

      const response = createMockApiResponse({ member: [] });
      mockOperations.getCrews.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getCrews).toHaveBeenCalledWith('BEDFORD');
    });

    it('should have flexible input schema (no required fields)', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_crews');
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });

  describe('maximo_get_crew_members', () => {
    it('should get crew members via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_crew_members');
      expect(tool).toBeDefined();

      const input = { laborcrewid: 'CREW001' };

      const response = createMockApiResponse({
        laborcrewid: 'CREW001',
        description: 'Crew A',
        laborcrewlabor: [{ laborcode: 'LAB001' }],
        laborcrewtool: [],
      });
      mockOperations.getCrewMembers.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getCrewMembers).toHaveBeenCalledWith('CREW001', undefined);
      expect(result).toEqual(response);
    });

    it('should pass siteid when provided', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_crew_members');

      const input = { laborcrewid: 'CREW001', siteid: 'BEDFORD' };

      const response = createMockApiResponse({
        laborcrewid: 'CREW001',
        laborcrewlabor: [],
        laborcrewtool: [],
      });
      mockOperations.getCrewMembers.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getCrewMembers).toHaveBeenCalledWith('CREW001', 'BEDFORD');
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_crew_members');
      expect(tool.inputSchema.required).toEqual(['laborcrewid']);
    });
  });

  describe('maximo_get_labor_availability', () => {
    it('should get labor availability via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_availability');
      expect(tool).toBeDefined();

      const input = {
        personid: 'PERSON001',
        startDate: '2024-01-15',
        endDate: '2024-01-19',
      };

      const response = createMockApiResponse({
        personid: 'PERSON001',
        totalCapacityHours: 40,
        assignedHours: 12,
        availableHours: 28,
        utilizationPercent: 30,
      });
      mockOperations.getLaborAvailability.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getLaborAvailability).toHaveBeenCalledWith(
        'PERSON001',
        '2024-01-15',
        '2024-01-19'
      );
      expect(result).toEqual(response);
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_availability');
      expect(tool.inputSchema.required).toEqual(['personid', 'startDate', 'endDate']);
    });
  });

  describe('maximo_get_labor_cost_summary', () => {
    it('should get labor cost summary via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_cost_summary');
      expect(tool).toBeDefined();

      const input = {
        personid: 'PERSON001',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const response = createMockApiResponse({
        personid: 'PERSON001',
        totalHours: 160,
        totalCost: 8000,
        transactionCount: 20,
      });
      mockOperations.getLaborCostSummary.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getLaborCostSummary).toHaveBeenCalledWith(
        'PERSON001',
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual(response);
    });

    it('should work without date range', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_cost_summary');

      const input = { personid: 'PERSON001' };

      const response = createMockApiResponse({
        personid: 'PERSON001',
        totalHours: 0,
        totalCost: 0,
        transactionCount: 0,
      });
      mockOperations.getLaborCostSummary.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getLaborCostSummary).toHaveBeenCalledWith(
        'PERSON001',
        undefined,
        undefined
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_labor_cost_summary');
      expect(tool.inputSchema.required).toEqual(['personid']);
      expect(tool.inputSchema.properties).toHaveProperty('startDate');
      expect(tool.inputSchema.properties).toHaveProperty('endDate');
    });
  });

  describe('maximo_get_qualified_labor', () => {
    it('should get qualified labor via tool', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_qualified_labor');
      expect(tool).toBeDefined();

      const input = {
        craft: 'ELECT',
        skilllevel: 'SKILLED',
        siteid: 'BEDFORD',
      };

      const response = createMockApiResponse({ member: [mockPerson] });
      mockOperations.getQualifiedLabor.mockResolvedValue(response);

      const result = await tool.handler(input);

      expect(mockOperations.getQualifiedLabor).toHaveBeenCalledWith(
        'ELECT',
        'SKILLED',
        'BEDFORD'
      );
      expect(result).toEqual(response);
    });

    it('should work with only craft (no skill level or site)', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_qualified_labor');

      const input = { craft: 'PLUMB' };

      const response = createMockApiResponse({ member: [] });
      mockOperations.getQualifiedLabor.mockResolvedValue(response);

      await tool.handler(input);

      expect(mockOperations.getQualifiedLabor).toHaveBeenCalledWith(
        'PLUMB',
        undefined,
        undefined
      );
    });

    it('should have correct input schema', () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_qualified_labor');
      expect(tool.inputSchema.required).toEqual(['craft']);
      expect(tool.inputSchema.properties.skilllevel.enum).toEqual([
        'APPRENTICE',
        'SEMISKILLED',
        'SKILLED',
        'EXPERT',
      ]);
    });

    it('should reject invalid skill level', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_qualified_labor');

      const input = { craft: 'ELECT', skilllevel: 'INVALID' };

      await expect(tool.handler(input)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should propagate validation errors for new tools', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_add_person_craft');

      const invalidInput = {
        personid: '', // Invalid: empty
        craft: 'ELECT',
        skilllevel: 'SKILLED',
      };

      await expect(tool.handler(invalidInput)).rejects.toThrow();
    });

    it('should propagate operation errors for new tools', async () => {
      const tool = tools.find((t: any) => t.name === 'maximo_get_person_crafts');

      const input = { personid: 'PERSON001' };

      mockOperations.getCrafts.mockRejectedValue(new Error('API Error'));

      await expect(tool.handler(input)).rejects.toThrow('API Error');
    });
  });
});
