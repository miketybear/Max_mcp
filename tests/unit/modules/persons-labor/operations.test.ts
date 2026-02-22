/**
 * Unit tests for PersonLaborOperations
 * Tests all 13 operation methods (6 existing + 7 new)
 */

import { PersonLaborOperations } from '../../../../src/modules/persons-labor/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
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
  primaryemail: 'john.doe@example.com',
  status: 'ACTIVE',
  siteid: 'BEDFORD',
  orgid: 'EAGLENA',
  laborcode: 'LAB001',
  department: 'MAINT',
  jobtitle: 'Technician',
  href: 'http://maximo.example.com/maximo/oslc/os/mxperson/1',
};

const mockLaborTransaction = {
  labtransid: 1001,
  laborcode: 'LAB001',
  refwo: 'WO1001',
  transdate: '2024-01-15T00:00:00Z',
  regularhrs: 8,
  overtimehrs: 0,
  doublehrs: 0,
  transtype: 'REGULAR',
  totalcost: 400,
};

describe('PersonLaborOperations', () => {
  let operations: PersonLaborOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new PersonLaborOperations(mockClient);
  });

  // ===== EXISTING OPERATIONS =====

  describe('createPerson', () => {
    it('should create person successfully', async () => {
      const input = {
        personid: 'PERSON001',
        displayname: 'John Doe',
      };

      const response = createMockApiResponse(mockPerson);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.createPerson(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPerson);
    });

    it('should validate input data', async () => {
      const invalidInput = {
        personid: '', // Invalid: empty
        displayname: 'Test',
      };

      await expect(operations.createPerson(invalidInput)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const input = {
        personid: 'PERSON001',
        displayname: 'John Doe',
      };

      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(operations.createPerson(input)).rejects.toThrow('API Error');
    });
  });

  describe('getPerson', () => {
    it('should retrieve person by ID', async () => {
      const response = createMockApiResponse({ member: [mockPerson] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getPerson('PERSON001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': 'personid="PERSON001"',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPerson);
    });

    it('should return not found when person does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getPerson('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.getPerson('PERSON001')).rejects.toThrow('Network error');
    });
  });

  describe('updatePerson', () => {
    it('should update person successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPerson] });
      const updateResponse = createMockApiResponse({
        ...mockPerson,
        displayname: 'Updated Name',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.patch.mockResolvedValue(updateResponse);

      const result = await operations.updatePerson('PERSON001', {
        displayname: 'Updated Name',
      });

      expect(mockClient.patch).toHaveBeenCalledWith(
        mockPerson.href,
        expect.objectContaining({ displayname: 'Updated Name' })
      );
      expect(result.success).toBe(true);
    });

    it('should return error if person not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.updatePerson('INVALID', {
        displayname: 'Test',
      });

      expect(result.success).toBe(false);
      expect(mockClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('searchPersons', () => {
    it('should search persons with filters', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.searchPersons({
        status: 'ACTIVE',
        siteid: 'BEDFORD',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status="ACTIVE"'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle multiple status values', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.searchPersons({
        status: ['ACTIVE', 'INACTIVE'],
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('status in'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should search by displayname with like clause', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.searchPersons({ displayname: 'John' });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('displayname like'),
        })
      );
    });
  });

  describe('recordLabor', () => {
    it('should record labor transaction successfully', async () => {
      const input = {
        laborcode: 'LAB001',
        transdate: '2024-01-15T00:00:00Z',
        regularhrs: 8,
      };

      const response = createMockApiResponse(mockLaborTransaction);
      mockClient.post.mockResolvedValue(response);

      const result = await operations.recordLabor(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
    });

    it('should validate labor transaction data', async () => {
      const invalidInput = {
        laborcode: '',
        transdate: 'invalid-date',
      };

      await expect(operations.recordLabor(invalidInput as any)).rejects.toThrow();
    });
  });

  describe('getLaborTransactions', () => {
    it('should retrieve labor transactions with filters', async () => {
      const response = createMockApiResponse({
        member: [mockLaborTransaction],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborTransactions({
        laborcode: 'LAB001',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('laborcode="LAB001"'),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle date range filter', async () => {
      const response = createMockApiResponse({
        member: [mockLaborTransaction],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getLaborTransactions({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('transdate>="2024-01-01"'),
        })
      );
    });
  });

  // ===== NEW OPERATIONS =====

  describe('getCrafts', () => {
    it('should retrieve crafts for a person', async () => {
      const mockCrafts = [
        { craft: 'ELECT', skilllevel: 'SKILLED', rate: 50, standardrate: 45 },
        { craft: 'PLUMB', skilllevel: 'APPRENTICE', rate: 30, standardrate: 28 },
      ];
      const response = createMockApiResponse({
        member: [{ ...mockPerson, personcraftrate: mockCrafts }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrafts('PERSON001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': 'personid="PERSON001"',
          'oslc.select': 'personid,personcraftrate{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCrafts);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when person has no crafts', async () => {
      const response = createMockApiResponse({
        member: [{ ...mockPerson }], // no personcraftrate field
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrafts('PERSON001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should apply siteid filter when provided', async () => {
      const response = createMockApiResponse({
        member: [{ ...mockPerson, personcraftrate: [] }],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getCrafts('PERSON001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': 'personid="PERSON001" and siteid="BEDFORD"',
        })
      );
    });

    it('should return not found when person does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrafts('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.getCrafts('PERSON001')).rejects.toThrow('Network error');
    });

    it('should validate personid is not empty', async () => {
      await expect(operations.getCrafts('')).rejects.toThrow();
    });
  });

  describe('addCraft', () => {
    it('should add craft to person successfully', async () => {
      const getResponse = createMockApiResponse({ member: [mockPerson] });
      const craftResponse = createMockApiResponse({
        craft: 'ELECT',
        skilllevel: 'SKILLED',
        rate: 50,
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(craftResponse);

      const result = await operations.addCraft({
        personid: 'PERSON001',
        craft: 'ELECT',
        skilllevel: 'SKILLED',
        rate: 50,
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockPerson.href}/PERSONCRAFTRATE`,
        expect.objectContaining({
          craft: 'ELECT',
          skilllevel: 'SKILLED',
          rate: 50,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should add craft without rate', async () => {
      const getResponse = createMockApiResponse({ member: [mockPerson] });
      const craftResponse = createMockApiResponse({
        craft: 'PLUMB',
        skilllevel: 'APPRENTICE',
      });

      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockResolvedValue(craftResponse);

      const result = await operations.addCraft({
        personid: 'PERSON001',
        craft: 'PLUMB',
        skilllevel: 'APPRENTICE',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        `${mockPerson.href}/PERSONCRAFTRATE`,
        expect.objectContaining({
          craft: 'PLUMB',
          skilllevel: 'APPRENTICE',
        })
      );
      // Should not have rate property in the payload
      const callArgs = mockClient.post.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('rate');
      expect(result.success).toBe(true);
    });

    it('should return error if person not found', async () => {
      const getResponse = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.addCraft({
        personid: 'INVALID',
        craft: 'ELECT',
        skilllevel: 'SKILLED',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should return error if person has no href', async () => {
      const personNoHref = { ...mockPerson };
      delete (personNoHref as any).href;
      const getResponse = createMockApiResponse({ member: [personNoHref] });
      mockClient.get.mockResolvedValue(getResponse);

      const result = await operations.addCraft({
        personid: 'PERSON001',
        craft: 'ELECT',
        skilllevel: 'SKILLED',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('href not found');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate input data', async () => {
      await expect(
        operations.addCraft({
          personid: '',
          craft: 'ELECT',
          skilllevel: 'SKILLED',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid skill level', async () => {
      await expect(
        operations.addCraft({
          personid: 'PERSON001',
          craft: 'ELECT',
          skilllevel: 'INVALID' as any,
        })
      ).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const getResponse = createMockApiResponse({ member: [mockPerson] });
      mockClient.get.mockResolvedValue(getResponse);
      mockClient.post.mockRejectedValue(new Error('API Error'));

      await expect(
        operations.addCraft({
          personid: 'PERSON001',
          craft: 'ELECT',
          skilllevel: 'SKILLED',
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getCrews', () => {
    const mockCrew = {
      laborcrewid: 'CREW001',
      description: 'Maintenance Crew A',
      crewtype: 'MAINT',
      calnum: 'CAL001',
      orgid: 'EAGLENA',
      siteid: 'BEDFORD',
    };

    it('should retrieve all labor crews', async () => {
      const response = createMockApiResponse({
        member: [mockCrew],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrews();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxlaborcrew',
        expect.objectContaining({
          'oslc.select': 'laborcrewid,description,crewtype,calnum,orgid,siteid',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should filter by siteid when provided', async () => {
      const response = createMockApiResponse({
        member: [mockCrew],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getCrews('BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxlaborcrew',
        expect.objectContaining({
          'oslc.where': 'siteid="BEDFORD"',
        })
      );
    });

    it('should not include where clause when no siteid', async () => {
      const response = createMockApiResponse({
        member: [],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getCrews();

      const callArgs = mockClient.get.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('oslc.where');
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.getCrews()).rejects.toThrow('Network error');
    });
  });

  describe('getCrewMembers', () => {
    const mockCrewWithMembers = {
      laborcrewid: 'CREW001',
      description: 'Maintenance Crew A',
      laborcrewlabor: [
        { laborcode: 'LAB001', craft: 'ELECT', skilllevel: 'SKILLED' },
        { laborcode: 'LAB002', craft: 'PLUMB', skilllevel: 'APPRENTICE' },
      ],
      laborcrewtool: [
        { itemnum: 'TOOL001', description: 'Wrench Set', quantity: 2 },
      ],
    };

    it('should retrieve crew members successfully', async () => {
      const response = createMockApiResponse({
        member: [mockCrewWithMembers],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrewMembers('CREW001');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxlaborcrew',
        expect.objectContaining({
          'oslc.where': 'laborcrewid="CREW001"',
          'oslc.select': 'laborcrewid,description,laborcrewtool{*},laborcrewlabor{*}',
          'oslc.pageSize': 1,
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.laborcrewlabor).toHaveLength(2);
      expect(result.data?.laborcrewtool).toHaveLength(1);
    });

    it('should return empty arrays when crew has no members or tools', async () => {
      const response = createMockApiResponse({
        member: [{ laborcrewid: 'CREW001', description: 'Empty Crew' }],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrewMembers('CREW001');

      expect(result.success).toBe(true);
      expect(result.data?.laborcrewlabor).toEqual([]);
      expect(result.data?.laborcrewtool).toEqual([]);
    });

    it('should filter by siteid when provided', async () => {
      const response = createMockApiResponse({
        member: [mockCrewWithMembers],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getCrewMembers('CREW001', 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/maximo/api/os/mxlaborcrew',
        expect.objectContaining({
          'oslc.where': 'laborcrewid="CREW001" and siteid="BEDFORD"',
        })
      );
    });

    it('should return not found when crew does not exist', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getCrewMembers('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should validate laborcrewid is not empty', async () => {
      await expect(operations.getCrewMembers('')).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(operations.getCrewMembers('CREW001')).rejects.toThrow('Network error');
    });
  });

  describe('getLaborAvailability', () => {
    it('should calculate labor availability correctly', async () => {
      // 2024-01-15 (Mon) to 2024-01-19 (Fri) = 5 business days = 40 hours capacity
      const mockWorkOrders = [
        { wonum: 'WO1001', schedstart: '2024-01-15', schedfinish: '2024-01-15', estdur: 8 },
        { wonum: 'WO1002', schedstart: '2024-01-16', schedfinish: '2024-01-16', estdur: 4 },
      ];

      const response = createMockApiResponse({ member: mockWorkOrders });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborAvailability(
        'PERSON001',
        '2024-01-15',
        '2024-01-19'
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('owner="PERSON001"'),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.personid).toBe('PERSON001');
      expect(result.data?.totalCapacityHours).toBe(40); // 5 business days * 8 hrs
      expect(result.data?.assignedHours).toBe(12); // 8 + 4
      expect(result.data?.availableHours).toBe(28); // 40 - 12
      expect(result.data?.utilizationPercent).toBe(30); // 12/40 = 0.30
    });

    it('should handle zero work orders (fully available)', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborAvailability(
        'PERSON001',
        '2024-01-15',
        '2024-01-19'
      );

      expect(result.success).toBe(true);
      expect(result.data?.assignedHours).toBe(0);
      expect(result.data?.utilizationPercent).toBe(0);
      expect(result.data?.availableHours).toBe(result.data?.totalCapacityHours);
    });

    it('should handle weekends correctly', async () => {
      // 2024-01-13 (Sat) to 2024-01-14 (Sun) = 0 business days
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborAvailability(
        'PERSON001',
        '2024-01-13',
        '2024-01-14'
      );

      expect(result.success).toBe(true);
      expect(result.data?.totalCapacityHours).toBe(0);
      expect(result.data?.utilizationPercent).toBe(0);
    });

    it('should cap available hours at zero when over-assigned', async () => {
      // 1 business day = 8 hours capacity, but assigned 16
      const mockWorkOrders = [
        { wonum: 'WO1001', estdur: 10 },
        { wonum: 'WO1002', estdur: 6 },
      ];

      const response = createMockApiResponse({ member: mockWorkOrders });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborAvailability(
        'PERSON001',
        '2024-01-15',
        '2024-01-15'
      );

      expect(result.success).toBe(true);
      expect(result.data?.availableHours).toBe(0); // Capped at 0
      expect(result.data?.assignedHours).toBe(16);
    });

    it('should validate that end date is after start date', async () => {
      await expect(
        operations.getLaborAvailability('PERSON001', '2024-01-31', '2024-01-01')
      ).rejects.toThrow();
    });

    it('should validate personid is not empty', async () => {
      await expect(
        operations.getLaborAvailability('', '2024-01-15', '2024-01-19')
      ).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getLaborAvailability('PERSON001', '2024-01-15', '2024-01-19')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getLaborCostSummary', () => {
    it('should calculate labor cost summary correctly', async () => {
      const mockTransactions = [
        { regularhrs: 8, overtimehrs: 2, doublehrs: 0, totalcost: 500 },
        { regularhrs: 6, overtimehrs: 0, doublehrs: 1, totalcost: 350 },
        { regularhrs: 8, overtimehrs: 0, doublehrs: 0, totalcost: 400 },
      ];

      const response = createMockApiResponse({ member: mockTransactions });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborCostSummary('PERSON001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('laborcode="PERSON001"'),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.personid).toBe('PERSON001');
      expect(result.data?.totalHours).toBe(25); // 8+2+6+1+8 = 25
      expect(result.data?.totalCost).toBe(1250); // 500+350+400
      expect(result.data?.transactionCount).toBe(3);
    });

    it('should filter by date range when provided', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      await operations.getLaborCostSummary('PERSON001', '2024-01-01', '2024-01-31');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('transdate>="2024-01-01"'),
        })
      );
    });

    it('should handle start date only filter', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      await operations.getLaborCostSummary('PERSON001', '2024-01-01');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('transdate>="2024-01-01"'),
        })
      );
    });

    it('should handle end date only filter', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      await operations.getLaborCostSummary('PERSON001', undefined, '2024-01-31');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.LABOR,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('transdate<="2024-01-31"'),
        })
      );
    });

    it('should return zero values when no transactions found', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborCostSummary('PERSON001');

      expect(result.success).toBe(true);
      expect(result.data?.totalHours).toBe(0);
      expect(result.data?.totalCost).toBe(0);
      expect(result.data?.transactionCount).toBe(0);
    });

    it('should include date range in response', async () => {
      const response = createMockApiResponse({ member: [] });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getLaborCostSummary(
        'PERSON001',
        '2024-01-01',
        '2024-01-31'
      );

      expect(result.data?.startDate).toBe('2024-01-01');
      expect(result.data?.endDate).toBe('2024-01-31');
    });

    it('should validate that end date is after start date', async () => {
      await expect(
        operations.getLaborCostSummary('PERSON001', '2024-01-31', '2024-01-01')
      ).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getLaborCostSummary('PERSON001')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getQualifiedLabor', () => {
    it('should find qualified persons for a craft', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      const result = await operations.getQualifiedLabor('ELECT');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': 'personcraftrate.craft="ELECT"',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should filter by skill level when provided', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getQualifiedLabor('ELECT', 'SKILLED');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('personcraftrate.skilllevel="SKILLED"'),
        })
      );
    });

    it('should filter by siteid when provided', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getQualifiedLabor('ELECT', undefined, 'BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('siteid="BEDFORD"'),
        })
      );
    });

    it('should combine all filters', async () => {
      const response = createMockApiResponse({
        member: [mockPerson],
      });
      mockClient.get.mockResolvedValue(response);

      await operations.getQualifiedLabor('ELECT', 'EXPERT', 'BEDFORD');

      const callArgs = mockClient.get.mock.calls[0][1];
      const where = callArgs['oslc.where'];
      expect(where).toContain('personcraftrate.craft="ELECT"');
      expect(where).toContain('personcraftrate.skilllevel="EXPERT"');
      expect(where).toContain('siteid="BEDFORD"');
    });

    it('should validate craft is not empty', async () => {
      await expect(operations.getQualifiedLabor('')).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getQualifiedLabor('ELECT')
      ).rejects.toThrow('Network error');
    });
  });
});
