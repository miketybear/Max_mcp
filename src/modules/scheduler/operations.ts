/**
 * Scheduler Operations
 * Business logic for work scheduling and resource allocation queries in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  WorkScheduleEntry,
  WorkScheduleResponse,
  UnscheduledWork,
  UnscheduledWorkResponse,
  LaborAvailability,
  LaborAvailabilityResponse,
  WorkBacklog,
  WorkBacklogPriorityBucket,
  WorkBacklogStatusBucket,
  ScheduleConflict,
  ScheduleConflictsResponse,
  UpcomingPM,
  UpcomingPMsResponse,
} from './types';
import {
  workScheduleQuerySchema,
  unscheduledWorkQuerySchema,
  laborAvailabilityQuerySchema,
  workBacklogQuerySchema,
  scheduleConflictsQuerySchema,
  upcomingPMsQuerySchema,
} from './validators';

const logger = createLogger('SchedulerOperations');

/** Default capacity hours per person per day */
const DEFAULT_DAILY_CAPACITY_HOURS = 8;

/** Default PM lookahead window in days */
const DEFAULT_PM_LOOKAHEAD_DAYS = 30;

/**
 * Scheduler Operations class
 * Provides methods for querying work schedules, labor availability,
 * schedule conflicts, backlogs, and upcoming preventive maintenance
 */
export class SchedulerOperations {
  private client: MaximoClient;

  /**
   * Create a new SchedulerOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('SchedulerOperations initialized');
  }

  /**
   * Get scheduled work orders within a date range
   * @param siteid - Site identifier
   * @param startDate - Range start date (ISO 8601)
   * @param endDate - Range end date (ISO 8601)
   * @param personid - Optional: filter by assigned person
   * @param craft - Optional: filter by craft
   * @param pageSize - Optional: page size
   * @returns API response with scheduled work entries
   */
  async getWorkSchedule(
    siteid: string,
    startDate: string,
    endDate: string,
    personid?: string,
    craft?: string,
    pageSize?: number
  ): Promise<ApiResponse<WorkScheduleResponse>> {
    logger.info('Getting work schedule', { siteid, startDate, endDate, personid, craft });

    try {
      // Validate inputs
      const validated = workScheduleQuerySchema.parse({
        siteid,
        startDate,
        endDate,
        personid,
        craft,
        pageSize,
      });

      // Build OSLC where clause for scheduled work within date range
      const whereClauses: string[] = [
        `siteid="${validated.siteid}"`,
        `schedstart>="${validated.startDate}"`,
        `schedfinish<="${validated.endDate}"`,
        `status in ["APPR","WSCH","INPRG"]`,
      ];

      if (validated.personid) {
        whereClauses.push(`owner="${validated.personid}"`);
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClauses.join(' and '),
        'oslc.select': 'wonum,description,schedstart,schedfinish,owner,priority,status,siteid,assetnum,location,worktype,estdur',
        'oslc.orderBy': '+schedstart',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      const response = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const members = response.data.member || [];

        // If craft filter is provided, we need to post-filter
        // since craft is on labor/person, not directly on work order
        let entries: WorkScheduleEntry[] = members.map((wo: any) => ({
          wonum: wo.wonum,
          description: wo.description || '',
          schedstart: wo.schedstart,
          schedfinish: wo.schedfinish,
          assignedTo: wo.owner,
          priority: wo.priority,
          status: wo.status,
          siteid: wo.siteid,
          assetnum: wo.assetnum,
          location: wo.location,
          worktype: wo.worktype,
          estdur: wo.estdur,
        }));

        const result: WorkScheduleResponse = {
          entries,
          totalCount: response.data.responseInfo?.totalCount || entries.length,
          startDate: validated.startDate,
          endDate: validated.endDate,
          siteid: validated.siteid,
        };

        logger.info('Work schedule retrieved successfully', {
          count: entries.length,
          totalCount: result.totalCount,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: 'No scheduled work data returned',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get work schedule', { siteid, error });
      throw error;
    }
  }

  /**
   * Find work orders in approved/waiting statuses that lack scheduled dates
   * @param siteid - Site identifier
   * @param pageSize - Optional: page size
   * @returns API response with unscheduled work orders sorted by priority
   */
  async getUnscheduledWork(
    siteid: string,
    pageSize?: number
  ): Promise<ApiResponse<UnscheduledWorkResponse>> {
    logger.info('Getting unscheduled work', { siteid });

    try {
      const validated = unscheduledWorkQuerySchema.parse({ siteid, pageSize });

      // Query work orders in schedulable statuses without schedstart
      const params: OSLCQueryParams = {
        'oslc.where': `siteid="${validated.siteid}" and status in ["APPR","WSCH","WAPPR"] and schedstart!="*"`,
        'oslc.select': 'wonum,description,priority,status,siteid,owner,worktype,assetnum,location,estdur,reportdate',
        'oslc.orderBy': '+priority',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      const response = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const members = response.data.member || [];

        const workOrders: UnscheduledWork[] = members.map((wo: any) => ({
          wonum: wo.wonum,
          description: wo.description || '',
          priority: wo.priority,
          status: wo.status,
          siteid: wo.siteid,
          owner: wo.owner,
          worktype: wo.worktype,
          assetnum: wo.assetnum,
          location: wo.location,
          estdur: wo.estdur,
          reportdate: wo.reportdate,
        }));

        const result: UnscheduledWorkResponse = {
          workOrders,
          totalCount: response.data.responseInfo?.totalCount || workOrders.length,
          siteid: validated.siteid,
        };

        logger.info('Unscheduled work retrieved successfully', {
          count: workOrders.length,
          totalCount: result.totalCount,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: 'No data returned for unscheduled work query',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get unscheduled work', { siteid, error });
      throw error;
    }
  }

  /**
   * Query labor availability based on assigned vs capacity hours
   * @param siteid - Site identifier
   * @param date - Optional: specific date for availability check (defaults to today)
   * @param craft - Optional: filter by craft
   * @param pageSize - Optional: page size
   * @returns API response with labor availability data
   */
  async getLaborAvailability(
    siteid: string,
    date?: string,
    craft?: string,
    pageSize?: number
  ): Promise<ApiResponse<LaborAvailabilityResponse>> {
    logger.info('Getting labor availability', { siteid, date, craft });

    try {
      const validated = laborAvailabilityQuerySchema.parse({ siteid, date, craft, pageSize });

      // Step 1: Query active persons/labor for the site
      const personWhereClauses: string[] = [
        `status="ACTIVE"`,
      ];

      if (validated.craft) {
        personWhereClauses.push(`craft="${validated.craft}"`);
      }

      const personParams: OSLCQueryParams = {
        'oslc.where': personWhereClauses.join(' and '),
        'oslc.select': 'personid,displayname,craft,skilllevel,status',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      const personsResponse = await this.client.get<{
        member: any[];
      }>(API_ENDPOINTS.PERSONS, personParams);

      if (!personsResponse.success || !personsResponse.data) {
        return {
          success: false,
          error: 'Failed to retrieve persons data',
          errorCode: 'NO_DATA',
          statusCode: 404,
          headers: personsResponse.headers,
          requestId: personsResponse.requestId,
        };
      }

      const persons = personsResponse.data.member || [];

      // Step 2: For each person, query their assigned work for the date
      const targetDate = validated.date || new Date().toISOString().split('T')[0];
      const dayStart = `${targetDate}T00:00:00`;
      const dayEnd = `${targetDate}T23:59:59`;

      // Query all scheduled work for the site on that date
      const woParams: OSLCQueryParams = {
        'oslc.where': `siteid="${validated.siteid}" and status in ["APPR","WSCH","INPRG"] and schedstart<="${dayEnd}" and schedfinish>="${dayStart}"`,
        'oslc.select': 'wonum,owner,estdur,schedstart,schedfinish',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      const woResponse = await this.client.get<{
        member: any[];
      }>(API_ENDPOINTS.WORK_ORDERS, woParams);

      const workOrders = woResponse.success && woResponse.data ? woResponse.data.member || [] : [];

      // Step 3: Calculate availability for each person
      const assignedHoursMap = new Map<string, number>();
      for (const wo of workOrders) {
        if (wo.owner) {
          const current = assignedHoursMap.get(wo.owner) || 0;
          assignedHoursMap.set(wo.owner, current + (wo.estdur || 0));
        }
      }

      const availability: LaborAvailability[] = persons.map((person: any) => {
        const assigned = assignedHoursMap.get(person.personid) || 0;
        const capacity = DEFAULT_DAILY_CAPACITY_HOURS;
        const available = Math.max(0, capacity - assigned);
        const utilization = capacity > 0 ? Math.round((assigned / capacity) * 100) : 0;

        return {
          personid: person.personid,
          craft: person.craft,
          availableHours: available,
          assignedHours: assigned,
          utilizationPercent: utilization,
          displayname: person.displayname,
          skilllevel: person.skilllevel,
          status: person.status,
        };
      });

      const result: LaborAvailabilityResponse = {
        availability,
        date: targetDate,
        siteid: validated.siteid,
      };

      logger.info('Labor availability calculated successfully', {
        personCount: availability.length,
        date: targetDate,
      });

      return {
        ...personsResponse,
        data: result,
      };
    } catch (error) {
      logger.error('Failed to get labor availability', { siteid, error });
      throw error;
    }
  }

  /**
   * Get a summary of the work backlog (unscheduled/unassigned work) by priority and status
   * @param siteid - Site identifier
   * @returns API response with work backlog summary
   */
  async getWorkBacklog(siteid: string): Promise<ApiResponse<WorkBacklog>> {
    logger.info('Getting work backlog', { siteid });

    try {
      const validated = workBacklogQuerySchema.parse({ siteid });

      // Query all unscheduled work (no schedstart) in active statuses
      const params: OSLCQueryParams = {
        'oslc.where': `siteid="${validated.siteid}" and status in ["APPR","WSCH","WAPPR"] and schedstart!="*"`,
        'oslc.select': 'wonum,priority,status,owner',
        'oslc.pageSize': 1000,
      };

      const response = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const members = response.data.member || [];

        // Count by priority
        const priorityMap = new Map<number, number>();
        const statusMap = new Map<string, number>();
        let unassignedCount = 0;

        for (const wo of members) {
          const p = wo.priority || 0;
          priorityMap.set(p, (priorityMap.get(p) || 0) + 1);

          const s = wo.status || 'UNKNOWN';
          statusMap.set(s, (statusMap.get(s) || 0) + 1);

          if (!wo.owner) {
            unassignedCount++;
          }
        }

        const byPriority: WorkBacklogPriorityBucket[] = Array.from(priorityMap.entries())
          .map(([priority, count]) => ({ priority, count }))
          .sort((a, b) => a.priority - b.priority);

        const byStatus: WorkBacklogStatusBucket[] = Array.from(statusMap.entries())
          .map(([status, count]) => ({ status, count }))
          .sort((a, b) => a.status.localeCompare(b.status));

        const result: WorkBacklog = {
          siteid: validated.siteid,
          totalUnscheduled: members.length,
          totalUnassigned: unassignedCount,
          byPriority,
          byStatus,
        };

        logger.info('Work backlog retrieved successfully', {
          totalUnscheduled: result.totalUnscheduled,
          totalUnassigned: result.totalUnassigned,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: 'No data returned for work backlog query',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get work backlog', { siteid, error });
      throw error;
    }
  }

  /**
   * Find schedule conflicts: work orders assigned to the same person with overlapping times
   * @param siteid - Site identifier
   * @param startDate - Range start date (ISO 8601)
   * @param endDate - Range end date (ISO 8601)
   * @returns API response with detected schedule conflicts
   */
  async findScheduleConflicts(
    siteid: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ScheduleConflictsResponse>> {
    logger.info('Finding schedule conflicts', { siteid, startDate, endDate });

    try {
      const validated = scheduleConflictsQuerySchema.parse({ siteid, startDate, endDate });

      // Query all scheduled work within the date range that has an owner
      const params: OSLCQueryParams = {
        'oslc.where': `siteid="${validated.siteid}" and status in ["APPR","WSCH","INPRG"] and schedstart>="${validated.startDate}" and schedfinish<="${validated.endDate}" and owner!="*"`,
        'oslc.select': 'wonum,description,schedstart,schedfinish,owner',
        'oslc.orderBy': '+owner,+schedstart',
        'oslc.pageSize': 1000,
      };

      const response = await this.client.get<{
        member: any[];
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const members = response.data.member || [];

        // Group work orders by owner
        const byOwner = new Map<string, any[]>();
        for (const wo of members) {
          if (wo.owner) {
            const list = byOwner.get(wo.owner) || [];
            list.push(wo);
            byOwner.set(wo.owner, list);
          }
        }

        // Detect overlaps within each owner's work orders
        const conflicts: ScheduleConflict[] = [];

        for (const [personid, workOrders] of byOwner.entries()) {
          // Sort by schedstart
          workOrders.sort(
            (a: any, b: any) => new Date(a.schedstart).getTime() - new Date(b.schedstart).getTime()
          );

          for (let i = 0; i < workOrders.length; i++) {
            for (let j = i + 1; j < workOrders.length; j++) {
              const wo1 = workOrders[i];
              const wo2 = workOrders[j];

              const start1 = new Date(wo1.schedstart).getTime();
              const end1 = new Date(wo1.schedfinish).getTime();
              const start2 = new Date(wo2.schedstart).getTime();
              const end2 = new Date(wo2.schedfinish).getTime();

              // Check for overlap: wo1.end > wo2.start and wo2.end > wo1.start
              if (end1 > start2 && end2 > start1) {
                const overlapStart = Math.max(start1, start2);
                const overlapEnd = Math.min(end1, end2);
                const overlapHours = Math.round(((overlapEnd - overlapStart) / (1000 * 60 * 60)) * 100) / 100;

                conflicts.push({
                  personid,
                  wonum1: wo1.wonum,
                  description1: wo1.description || '',
                  schedstart1: wo1.schedstart,
                  schedfinish1: wo1.schedfinish,
                  wonum2: wo2.wonum,
                  description2: wo2.description || '',
                  schedstart2: wo2.schedstart,
                  schedfinish2: wo2.schedfinish,
                  overlapHours,
                });
              }
            }
          }
        }

        const result: ScheduleConflictsResponse = {
          conflicts,
          totalConflicts: conflicts.length,
          startDate: validated.startDate,
          endDate: validated.endDate,
          siteid: validated.siteid,
        };

        logger.info('Schedule conflicts analysis completed', {
          conflictsFound: conflicts.length,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: 'No data returned for schedule conflicts query',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to find schedule conflicts', { siteid, error });
      throw error;
    }
  }

  /**
   * Query preventive maintenance schedules coming due within N days
   * @param siteid - Site identifier
   * @param days - Number of days to look ahead (default 30)
   * @returns API response with upcoming PM entries
   */
  async getUpcomingPMs(
    siteid: string,
    days?: number
  ): Promise<ApiResponse<UpcomingPMsResponse>> {
    const lookaheadDays = days || DEFAULT_PM_LOOKAHEAD_DAYS;
    logger.info('Getting upcoming PMs', { siteid, days: lookaheadDays });

    try {
      const validated = upcomingPMsQuerySchema.parse({ siteid, days });

      // Calculate the future date boundary
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + lookaheadDays);

      const nowISO = now.toISOString();
      const futureISO = futureDate.toISOString();

      // Query PMs with nextdate within the window
      const params: OSLCQueryParams = {
        'oslc.where': `siteid="${validated.siteid}" and nextdate>="${nowISO}" and nextdate<="${futureISO}"`,
        'oslc.select': 'pmnum,description,nextdate,assetnum,location,frequency,frequnit,siteid,leadtime,priority',
        'oslc.orderBy': '+nextdate',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      const response = await this.client.get<{
        member: any[];
        responseInfo?: { totalCount?: number };
      }>(API_ENDPOINTS.PM, params);

      if (response.success && response.data) {
        const members = response.data.member || [];

        const pms: UpcomingPM[] = members.map((pm: any) => ({
          pmnum: pm.pmnum,
          description: pm.description || '',
          nextdate: pm.nextdate,
          assetnum: pm.assetnum,
          location: pm.location,
          frequency: pm.frequency,
          frequnit: pm.frequnit,
          siteid: pm.siteid,
          leadtime: pm.leadtime,
          priority: pm.priority,
        }));

        const result: UpcomingPMsResponse = {
          pms,
          totalCount: response.data.responseInfo?.totalCount || pms.length,
          days: lookaheadDays,
          siteid: validated.siteid,
        };

        logger.info('Upcoming PMs retrieved successfully', {
          count: pms.length,
          days: lookaheadDays,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: 'No data returned for upcoming PMs query',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get upcoming PMs', { siteid, error });
      throw error;
    }
  }
}
