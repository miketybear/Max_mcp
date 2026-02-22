/**
 * Unit tests for SchedulerOperations
 * Tests all 6 operation methods for work scheduling and resource allocation
 */

import { SchedulerOperations } from '../../../../src/modules/scheduler/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';
import { createMockApiResponse, createMockApiError } from '../../../fixtures/test-helpers';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('SchedulerOperations', () => {
  let operations: SchedulerOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new SchedulerOperations(mockClient);
  });

  describe('getWorkSchedule', () => {
    it('should return scheduled work orders within date range', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO001',
          description: 'Pump maintenance',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T16:00:00',
          owner: 'TECH001',
          priority: 2,
          status: 'APPR',
          siteid: 'BEDFORD',
          assetnum: 'PUMP001',
          location: 'BUILDING1',
          worktype: 'PM',
          estdur: 8,
        },
        {
          wonum: 'WO002',
          description: 'Filter replacement',
          schedstart: '2024-01-16T09:00:00',
          schedfinish: '2024-01-16T12:00:00',
          owner: 'TECH002',
          priority: 3,
          status: 'WSCH',
          siteid: 'BEDFORD',
          worktype: 'CM',
          estdur: 3,
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockWorkOrders,
          responseInfo: { totalCount: 2 },
        })
      );

      const result = await operations.getWorkSchedule(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.entries).toHaveLength(2);
      expect(result.data!.totalCount).toBe(2);
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.startDate).toBe('2024-01-15T00:00:00');
      expect(result.data!.endDate).toBe('2024-01-31T23:59:59');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('schedstart>="2024-01-15T00:00:00"'),
          'oslc.orderBy': '+schedstart',
        })
      );
    });

    it('should filter by personid when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getWorkSchedule(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59',
        'TECH001'
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('owner="TECH001"'),
        })
      );
    });

    it('should use custom pageSize when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getWorkSchedule(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59',
        undefined,
        undefined,
        25
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.pageSize': 25,
        })
      );
    });

    it('should return error when API returns no data', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.getWorkSchedule(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No scheduled work data returned');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        operations.getWorkSchedule('BEDFORD', '2024-01-15T00:00:00', '2024-01-31T23:59:59')
      ).rejects.toThrow('Network error');
    });

    it('should map work order fields to schedule entries correctly', async () => {
      const mockWo = {
        wonum: 'WO001',
        description: 'Test WO',
        schedstart: '2024-01-15T08:00:00',
        schedfinish: '2024-01-15T16:00:00',
        owner: 'TECH001',
        priority: 1,
        status: 'APPR',
        siteid: 'BEDFORD',
        assetnum: 'ASSET1',
        location: 'LOC1',
        worktype: 'PM',
        estdur: 8,
      };

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [mockWo],
          responseInfo: { totalCount: 1 },
        })
      );

      const result = await operations.getWorkSchedule(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-31T23:59:59'
      );

      const entry = result.data!.entries[0];
      expect(entry.wonum).toBe('WO001');
      expect(entry.assignedTo).toBe('TECH001');
      expect(entry.schedstart).toBe('2024-01-15T08:00:00');
      expect(entry.schedfinish).toBe('2024-01-15T16:00:00');
      expect(entry.estdur).toBe(8);
    });
  });

  describe('getUnscheduledWork', () => {
    it('should return unscheduled work orders sorted by priority', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO010',
          description: 'Urgent repair',
          priority: 1,
          status: 'APPR',
          siteid: 'BEDFORD',
          owner: 'TECH001',
          worktype: 'CM',
          estdur: 4,
          reportdate: '2024-01-10',
        },
        {
          wonum: 'WO011',
          description: 'Routine check',
          priority: 3,
          status: 'WAPPR',
          siteid: 'BEDFORD',
          worktype: 'PM',
          estdur: 2,
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockWorkOrders,
          responseInfo: { totalCount: 2 },
        })
      );

      const result = await operations.getUnscheduledWork('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.workOrders).toHaveLength(2);
      expect(result.data!.totalCount).toBe(2);
      expect(result.data!.siteid).toBe('BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('schedstart!="*"'),
          'oslc.orderBy': '+priority',
        })
      );
    });

    it('should use custom pageSize when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getUnscheduledWork('BEDFORD', 50);

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.pageSize': 50,
        })
      );
    });

    it('should return error when API returns no data', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.getUnscheduledWork('BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data returned');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Timeout'));

      await expect(
        operations.getUnscheduledWork('BEDFORD')
      ).rejects.toThrow('Timeout');
    });
  });

  describe('getLaborAvailability', () => {
    it('should return labor availability with utilization metrics', async () => {
      // Mock persons response
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [
            {
              personid: 'TECH001',
              displayname: 'John Smith',
              craft: 'ELEC',
              skilllevel: 'FIRSTCLASS',
              status: 'ACTIVE',
            },
            {
              personid: 'TECH002',
              displayname: 'Jane Doe',
              craft: 'MECH',
              skilllevel: 'SECONDCLASS',
              status: 'ACTIVE',
            },
          ],
        })
      );

      // Mock work orders response (assigned work)
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [
            { wonum: 'WO001', owner: 'TECH001', estdur: 4 },
            { wonum: 'WO002', owner: 'TECH001', estdur: 2 },
            { wonum: 'WO003', owner: 'TECH002', estdur: 8 },
          ],
        })
      );

      const result = await operations.getLaborAvailability('BEDFORD', '2024-01-15');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.availability).toHaveLength(2);
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.date).toBe('2024-01-15');

      // TECH001: 6 hours assigned out of 8 capacity
      const tech1 = result.data!.availability.find((a) => a.personid === 'TECH001');
      expect(tech1).toBeDefined();
      expect(tech1!.assignedHours).toBe(6);
      expect(tech1!.availableHours).toBe(2);
      expect(tech1!.utilizationPercent).toBe(75);

      // TECH002: 8 hours assigned out of 8 capacity
      const tech2 = result.data!.availability.find((a) => a.personid === 'TECH002');
      expect(tech2).toBeDefined();
      expect(tech2!.assignedHours).toBe(8);
      expect(tech2!.availableHours).toBe(0);
      expect(tech2!.utilizationPercent).toBe(100);
    });

    it('should filter by craft when provided', async () => {
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [] })
      );
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [] })
      );

      await operations.getLaborAvailability('BEDFORD', '2024-01-15', 'ELEC');

      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        API_ENDPOINTS.PERSONS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('craft="ELEC"'),
        })
      );
    });

    it('should return error when persons query fails', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('Failed to retrieve persons data', 404)
      );

      const result = await operations.getLaborAvailability('BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to retrieve persons data');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Connection refused'));

      await expect(
        operations.getLaborAvailability('BEDFORD')
      ).rejects.toThrow('Connection refused');
    });

    it('should handle persons with no assigned work', async () => {
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({
          member: [
            { personid: 'TECH001', displayname: 'John', craft: 'ELEC', status: 'ACTIVE' },
          ],
        })
      );
      mockClient.get.mockResolvedValueOnce(
        createMockApiResponse({ member: [] })
      );

      const result = await operations.getLaborAvailability('BEDFORD', '2024-01-15');

      expect(result.success).toBe(true);
      const tech1 = result.data!.availability[0];
      expect(tech1.assignedHours).toBe(0);
      expect(tech1.availableHours).toBe(8);
      expect(tech1.utilizationPercent).toBe(0);
    });
  });

  describe('getWorkBacklog', () => {
    it('should return backlog summary with priority and status breakdowns', async () => {
      const mockWorkOrders = [
        { wonum: 'WO001', priority: 1, status: 'APPR', owner: 'TECH001' },
        { wonum: 'WO002', priority: 1, status: 'APPR', owner: null },
        { wonum: 'WO003', priority: 2, status: 'WAPPR', owner: null },
        { wonum: 'WO004', priority: 3, status: 'WSCH', owner: 'TECH002' },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockWorkOrders,
          responseInfo: { totalCount: 4 },
        })
      );

      const result = await operations.getWorkBacklog('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.siteid).toBe('BEDFORD');
      expect(result.data!.totalUnscheduled).toBe(4);
      expect(result.data!.totalUnassigned).toBe(2); // WO002, WO003 have no owner

      // Priority breakdown
      expect(result.data!.byPriority).toContainEqual({ priority: 1, count: 2 });
      expect(result.data!.byPriority).toContainEqual({ priority: 2, count: 1 });
      expect(result.data!.byPriority).toContainEqual({ priority: 3, count: 1 });

      // Status breakdown
      expect(result.data!.byStatus).toContainEqual({ status: 'APPR', count: 2 });
      expect(result.data!.byStatus).toContainEqual({ status: 'WAPPR', count: 1 });
      expect(result.data!.byStatus).toContainEqual({ status: 'WSCH', count: 1 });
    });

    it('should query correct endpoint with backlog filters', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      await operations.getWorkBacklog('BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WORK_ORDERS,
        expect.objectContaining({
          'oslc.where': expect.stringContaining('schedstart!="*"'),
          'oslc.pageSize': 1000,
        })
      );
    });

    it('should return error when API returns no data', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.getWorkBacklog('BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data returned');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Server error'));

      await expect(
        operations.getWorkBacklog('BEDFORD')
      ).rejects.toThrow('Server error');
    });

    it('should handle work orders with no priority', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [
            { wonum: 'WO001', status: 'APPR', owner: 'TECH001' },
          ],
        })
      );

      const result = await operations.getWorkBacklog('BEDFORD');

      expect(result.success).toBe(true);
      // priority defaults to 0
      expect(result.data!.byPriority).toContainEqual({ priority: 0, count: 1 });
    });
  });

  describe('findScheduleConflicts', () => {
    it('should detect overlapping work orders for the same person', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO001',
          description: 'Job A',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T12:00:00',
          owner: 'TECH001',
        },
        {
          wonum: 'WO002',
          description: 'Job B',
          schedstart: '2024-01-15T10:00:00',
          schedfinish: '2024-01-15T14:00:00',
          owner: 'TECH001',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({ member: mockWorkOrders })
      );

      const result = await operations.findScheduleConflicts(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.conflicts).toHaveLength(1);
      expect(result.data!.totalConflicts).toBe(1);
      expect(result.data!.siteid).toBe('BEDFORD');

      const conflict = result.data!.conflicts[0];
      expect(conflict.personid).toBe('TECH001');
      expect(conflict.wonum1).toBe('WO001');
      expect(conflict.wonum2).toBe('WO002');
      expect(conflict.overlapHours).toBe(2); // 10:00 to 12:00
    });

    it('should not report conflicts for non-overlapping work orders', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO001',
          description: 'Job A',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T12:00:00',
          owner: 'TECH001',
        },
        {
          wonum: 'WO002',
          description: 'Job B',
          schedstart: '2024-01-15T13:00:00',
          schedfinish: '2024-01-15T17:00:00',
          owner: 'TECH001',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({ member: mockWorkOrders })
      );

      const result = await operations.findScheduleConflicts(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result.success).toBe(true);
      expect(result.data!.conflicts).toHaveLength(0);
      expect(result.data!.totalConflicts).toBe(0);
    });

    it('should not report conflicts for different persons', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO001',
          description: 'Job A',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T12:00:00',
          owner: 'TECH001',
        },
        {
          wonum: 'WO002',
          description: 'Job B',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T12:00:00',
          owner: 'TECH002',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({ member: mockWorkOrders })
      );

      const result = await operations.findScheduleConflicts(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result.success).toBe(true);
      expect(result.data!.conflicts).toHaveLength(0);
    });

    it('should return error when API returns no data', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.findScheduleConflicts(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data returned');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('Server error'));

      await expect(
        operations.findScheduleConflicts('BEDFORD', '2024-01-15T00:00:00', '2024-01-15T23:59:59')
      ).rejects.toThrow('Server error');
    });

    it('should detect multiple conflicts for the same person', async () => {
      const mockWorkOrders = [
        {
          wonum: 'WO001',
          description: 'Job A',
          schedstart: '2024-01-15T08:00:00',
          schedfinish: '2024-01-15T16:00:00',
          owner: 'TECH001',
        },
        {
          wonum: 'WO002',
          description: 'Job B',
          schedstart: '2024-01-15T10:00:00',
          schedfinish: '2024-01-15T14:00:00',
          owner: 'TECH001',
        },
        {
          wonum: 'WO003',
          description: 'Job C',
          schedstart: '2024-01-15T12:00:00',
          schedfinish: '2024-01-15T18:00:00',
          owner: 'TECH001',
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({ member: mockWorkOrders })
      );

      const result = await operations.findScheduleConflicts(
        'BEDFORD',
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result.success).toBe(true);
      // WO001-WO002, WO001-WO003, WO002-WO003 all overlap
      expect(result.data!.totalConflicts).toBe(3);
    });
  });

  describe('getUpcomingPMs', () => {
    it('should return upcoming PMs within lookahead window', async () => {
      const mockPMs = [
        {
          pmnum: 'PM001',
          description: 'Monthly pump inspection',
          nextdate: '2024-02-01T00:00:00',
          assetnum: 'PUMP001',
          location: 'BUILDING1',
          frequency: 30,
          frequnit: 'DAYS',
          siteid: 'BEDFORD',
          leadtime: 5,
          priority: 2,
        },
        {
          pmnum: 'PM002',
          description: 'Quarterly HVAC service',
          nextdate: '2024-02-15T00:00:00',
          assetnum: 'HVAC001',
          siteid: 'BEDFORD',
          frequency: 90,
          frequnit: 'DAYS',
          priority: 3,
        },
      ];

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: mockPMs,
          responseInfo: { totalCount: 2 },
        })
      );

      const result = await operations.getUpcomingPMs('BEDFORD', 30);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.pms).toHaveLength(2);
      expect(result.data!.totalCount).toBe(2);
      expect(result.data!.days).toBe(30);
      expect(result.data!.siteid).toBe('BEDFORD');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.PM,
        expect.objectContaining({
          'oslc.orderBy': '+nextdate',
        })
      );
    });

    it('should use default 30-day lookahead when no days parameter', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      const result = await operations.getUpcomingPMs('BEDFORD');

      expect(result.success).toBe(true);
      expect(result.data!.days).toBe(30);
    });

    it('should use custom days lookahead when provided', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [],
          responseInfo: { totalCount: 0 },
        })
      );

      const result = await operations.getUpcomingPMs('BEDFORD', 60);

      expect(result.success).toBe(true);
      expect(result.data!.days).toBe(60);
    });

    it('should return error when API returns no data', async () => {
      mockClient.get.mockResolvedValue(
        createMockApiError('No data', 404)
      );

      const result = await operations.getUpcomingPMs('BEDFORD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data returned');
    });

    it('should handle API errors by throwing', async () => {
      mockClient.get.mockRejectedValue(new Error('PM query failed'));

      await expect(
        operations.getUpcomingPMs('BEDFORD')
      ).rejects.toThrow('PM query failed');
    });

    it('should map PM fields correctly', async () => {
      const mockPM = {
        pmnum: 'PM001',
        description: 'Test PM',
        nextdate: '2024-02-01T00:00:00',
        assetnum: 'ASSET1',
        location: 'LOC1',
        frequency: 30,
        frequnit: 'DAYS',
        siteid: 'BEDFORD',
        leadtime: 5,
        priority: 1,
      };

      mockClient.get.mockResolvedValue(
        createMockApiResponse({
          member: [mockPM],
          responseInfo: { totalCount: 1 },
        })
      );

      const result = await operations.getUpcomingPMs('BEDFORD', 30);

      const pm = result.data!.pms[0];
      expect(pm.pmnum).toBe('PM001');
      expect(pm.description).toBe('Test PM');
      expect(pm.nextdate).toBe('2024-02-01T00:00:00');
      expect(pm.assetnum).toBe('ASSET1');
      expect(pm.location).toBe('LOC1');
      expect(pm.frequency).toBe(30);
      expect(pm.frequnit).toBe('DAYS');
      expect(pm.leadtime).toBe(5);
      expect(pm.priority).toBe(1);
    });
  });
});
