/**
 * Preventive Maintenance Operations
 * Business logic for preventive maintenance management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  PreventiveMaintenance,
  PMCreate,
  PMUpdate,
  PMSearch,
  PMWorkOrderGeneration,
  JobPlan,
  JobPlanCreate,
  PMListResponse,
  PMCompletion,
  PMHistoryParams,
  PMHistoryResponse,
  PMScheduleParams,
  PMScheduleResponse,
  PMScheduleEntry,
  PMFrequencyUpdate,
  PMStatusChange,
  TimeFrequencyUnit,
} from './types';
import {
  pmCreateSchema,
  pmUpdateSchema,
  pmSearchSchema,
  pmWorkOrderGenerationSchema,
  jobPlanCreateSchema,
  pmCompletionSchema,
  pmHistoryParamsSchema,
  pmScheduleParamsSchema,
  pmFrequencyUpdateSchema,
  pmStatusChangeSchema,
} from './validators';

const logger = createLogger('PMOperations');

/**
 * Preventive Maintenance Operations class
 * Provides methods for managing PM records in Maximo
 */
export class PMOperations {
  private client: MaximoClient;

  /**
   * Create a new PMOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('PMOperations initialized');
  }

  /**
   * Create a new PM record
   * @param data - PM creation data
   * @returns API response with created PM record
   */
  async create(data: PMCreate): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Creating PM record', { siteid: data.siteid, frequency: data.frequency });

    try {
      // Validate input
      const validated = pmCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<PreventiveMaintenance>(
        API_ENDPOINTS.PM,
        validated
      );

      if (response.success && response.data) {
        logger.info('PM record created successfully', {
          pmnum: response.data.pmnum,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create PM record', { error });
      throw error;
    }
  }

  /**
   * Get PM record by number
   * @param pmnum - PM number
   * @param siteid - Site identifier (optional)
   * @returns API response with PM data
   */
  async get(pmnum: string, siteid?: string): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Retrieving PM record', { pmnum, siteid });

    try {
      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': siteid ? `pmnum="${pmnum}" and siteid="${siteid}"` : `pmnum="${pmnum}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: PreventiveMaintenance[] }>(
        API_ENDPOINTS.PM,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('PM record retrieved successfully', { pmnum, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // PM record not found
      return {
        success: false,
        error: `PM record ${pmnum} not found${siteid ? ` in site ${siteid}` : ''}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers || {},
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve PM record', { pmnum, siteid, error });
      throw error;
    }
  }

  /**
   * Update PM record
   * @param pmnum - PM number
   * @param siteid - Site identifier (optional)
   * @param data - Update data
   * @returns API response with updated PM record
   */
  async update(
    pmnum: string,
    siteid: string | undefined,
    data: PMUpdate
  ): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Updating PM record', { pmnum, siteid });

    try {
      // Validate input
      const validated = pmUpdateSchema.parse(data);

      // First, get the PM record to get its href
      const getResponse = await this.get(pmnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make update request
      const response = await this.client.patch<PreventiveMaintenance>(href, validated);

      if (response.success && response.data) {
        logger.info('PM record updated successfully', { pmnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update PM record', { pmnum, siteid, error });
      throw error;
    }
  }

  /**
   * Delete PM record
   * @param pmnum - PM number
   * @param siteid - Site identifier (optional)
   * @returns API response
   */
  async delete(pmnum: string, siteid?: string): Promise<ApiResponse<void>> {
    logger.info('Deleting PM record', { pmnum, siteid });

    try {
      // First, get the PM record to get its href
      const getResponse = await this.get(pmnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return {
          success: false,
          error: getResponse.error,
          errorCode: getResponse.errorCode,
          statusCode: getResponse.statusCode,
          headers: getResponse.headers,
          requestId: getResponse.requestId,
        };
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make delete request
      const response = await this.client.delete<void>(href);

      if (response.success) {
        logger.info('PM record deleted successfully', { pmnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete PM record', { pmnum, siteid, error });
      throw error;
    }
  }

  /**
   * Generate work orders from PM
   * @param data - Generation data
   * @returns API response with generated work orders
   */
  async generateWorkOrders(
    data: PMWorkOrderGeneration
  ): Promise<ApiResponse<{ workOrders: string[] }>> {
    logger.info('Generating PM work orders', { pmnum: data.pmnum });

    try {
      // Validate input
      const validated = pmWorkOrderGenerationSchema.parse(data);

      // Get the PM record first
      const pmResponse = await this.get(validated.pmnum, validated.siteid);
      if (!pmResponse.success || !pmResponse.data) {
        return {
          success: false,
          error: `PM record ${validated.pmnum} not found`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: pmResponse.headers || {},
          requestId: pmResponse.requestId,
        };
      }

      const pm = pmResponse.data;
      const pmHref = (pm as any).href || (pm as any)._href;

      // Build generation payload
      const generationPayload = {
        pmnum: validated.pmnum,
        targetdate: validated.targetdate || new Date().toISOString(),
      };

      // Make API request to generate work orders
      // Note: This endpoint may vary by Maximo version
      const response = await this.client.post<{ member: any[] }>(
        `${pmHref}/generateworkorders`,
        generationPayload
      );

      if (response.success && response.data) {
        const workOrders = response.data.member?.map((wo: any) => wo.wonum) || [];
        logger.info('PM work orders generated successfully', {
          pmnum: validated.pmnum,
          count: workOrders.length,
        });
        return {
          ...response,
          data: { workOrders },
        };
      }

      return {
        success: false,
        error: response.error,
        errorCode: response.errorCode,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to generate PM work orders', { error });
      throw error;
    }
  }

  /**
   * Create a job plan
   * @param data - Job plan creation data
   * @returns API response with created job plan
   */
  async createJobPlan(data: JobPlanCreate): Promise<ApiResponse<JobPlan>> {
    logger.info('Creating job plan', { jpnum: data.jpnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = jobPlanCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<JobPlan>(
        '/maximo/api/os/mxjp',
        validated
      );

      if (response.success && response.data) {
        logger.info('Job plan created successfully', {
          jpnum: response.data.jpnum,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create job plan', { error });
      throw error;
    }
  }

  /**
   * Search PM records
   * @param params - Search parameters
   * @returns API response with list of PM records
   */
  async search(params: PMSearch): Promise<ApiResponse<PMListResponse>> {
    logger.info('Searching PM records', { filters: Object.keys(params) });

    try {
      // Validate input
      const validated = pmSearchSchema.parse(params);

      // Build OSLC query
      const whereConditions: string[] = [];

      if (validated.assetnum) {
        whereConditions.push(`assetnum="${validated.assetnum}"`);
      }

      if (validated.location) {
        whereConditions.push(`location="${validated.location}"`);
      }

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s) => `"${s}"`).join(',');
          whereConditions.push(`status in (${statusList})`);
        } else {
          whereConditions.push(`status="${validated.status}"`);
        }
      }

      if (validated.siteid) {
        whereConditions.push(`siteid="${validated.siteid}"`);
      }

      if (validated.jpnum) {
        whereConditions.push(`jpnum="${validated.jpnum}"`);
      }

      if (validated.worktype) {
        whereConditions.push(`worktype="${validated.worktype}"`);
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' and ') : undefined;

      // Build query parameters
      const queryParams: OSLCQueryParams = {
        'oslc.select':
          'pmnum,description,status,statusdate,assetnum,location,siteid,orgid,frequency,frequnit,nextdate,lastcompdate,jpnum,worktype,priority',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.pageNumber': validated.pageNum || 1,
      };

      if (whereClause) {
        queryParams['oslc.where'] = whereClause;
      }

      // Make API request
      const response = await this.client.get<PMListResponse>(API_ENDPOINTS.PM, queryParams);

      if (response.success && response.data) {
        logger.info('PM records retrieved successfully', {
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to search PM records', { error });
      throw error;
    }
  }

  /**
   * Mark a PM as completed
   * @param data - Completion data (pmnum, siteid, optional completionDate and memo)
   * @returns API response with updated PM record
   */
  async completePM(data: PMCompletion): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Completing PM record', { pmnum: data.pmnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = pmCompletionSchema.parse(data);

      // Get the PM record to obtain its href
      const getResponse = await this.get(validated.pmnum, validated.siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Build completion payload
      const lastcompdateValue = validated.completionDate || new Date().toISOString();
      const completionPayload: { lastcompdate: string; comments?: string } = {
        lastcompdate: lastcompdateValue,
      };

      if (validated.memo) {
        completionPayload.comments = validated.memo;
      }

      // Make PATCH request to update completion date
      const response = await this.client.patch<PreventiveMaintenance>(href, completionPayload);

      if (response.success && response.data) {
        logger.info('PM record marked as completed', {
          pmnum: validated.pmnum,
          siteid: validated.siteid,
          lastcompdate: lastcompdateValue,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to complete PM record', { pmnum: data.pmnum, siteid: data.siteid, error });
      throw error;
    }
  }

  /**
   * Get maintenance history for a PM (work orders generated from this PM)
   * @param params - History query parameters
   * @returns API response with list of work orders generated from this PM
   */
  async getPMHistory(params: PMHistoryParams): Promise<ApiResponse<PMHistoryResponse>> {
    logger.info('Retrieving PM history', { pmnum: params.pmnum, siteid: params.siteid });

    try {
      // Validate input
      const validated = pmHistoryParamsSchema.parse(params);

      // Query work orders endpoint for WOs generated from this PM
      const queryParams: OSLCQueryParams = {
        'oslc.where': `pmnum="${validated.pmnum}" and siteid="${validated.siteid}"`,
        'oslc.select': 'wonum,status,actstart,actfinish,description',
        'oslc.orderBy': '-actstart',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      const response = await this.client.get<{ member: any[]; totalCount?: number }>(
        API_ENDPOINTS.WORK_ORDERS,
        queryParams
      );

      if (response.success && response.data) {
        const members = response.data.member || [];
        logger.info('PM history retrieved successfully', {
          pmnum: validated.pmnum,
          count: members.length,
        });
        return {
          ...response,
          data: {
            member: members.map((wo: any) => ({
              wonum: wo.wonum,
              status: wo.status,
              actstart: wo.actstart,
              actfinish: wo.actfinish,
              description: wo.description,
            })),
            totalCount: response.data.totalCount,
          },
        };
      }

      return {
        success: false,
        error: response.error,
        errorCode: response.errorCode,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve PM history', { pmnum: params.pmnum, siteid: params.siteid, error });
      throw error;
    }
  }

  /**
   * Calculate the next date by adding frequency units to a base date
   * @param baseDate - Starting date
   * @param frequency - Number of units to add
   * @param frequnit - Unit type (DAYS, WEEKS, MONTHS, YEARS)
   * @returns New Date with the frequency added
   */
  private calculateNextDate(baseDate: Date, frequency: number, frequnit: TimeFrequencyUnit): Date {
    const result = new Date(baseDate);

    switch (frequnit) {
      case 'DAYS':
        result.setDate(result.getDate() + frequency);
        break;
      case 'WEEKS':
        result.setDate(result.getDate() + frequency * 7);
        break;
      case 'MONTHS':
        result.setMonth(result.getMonth() + frequency);
        break;
      case 'YEARS':
        result.setFullYear(result.getFullYear() + frequency);
        break;
    }

    return result;
  }

  /**
   * Get the projected schedule for a PM
   * @param params - Schedule query parameters
   * @returns API response with projected schedule dates
   */
  async getPMSchedule(params: PMScheduleParams): Promise<ApiResponse<PMScheduleResponse>> {
    logger.info('Retrieving PM schedule', { pmnum: params.pmnum, siteid: params.siteid });

    try {
      // Validate input
      const validated = pmScheduleParamsSchema.parse(params);
      const count = validated.count || 5;

      // Get the PM record to read frequency settings
      const pmResponse = await this.get(validated.pmnum, validated.siteid);
      if (!pmResponse.success || !pmResponse.data) {
        return {
          success: false,
          error: pmResponse.error,
          errorCode: pmResponse.errorCode,
          statusCode: pmResponse.statusCode,
          headers: pmResponse.headers || {},
          requestId: pmResponse.requestId,
        };
      }

      const pm = pmResponse.data;

      if (!pm.nextdate) {
        return {
          success: false,
          error: `PM record ${validated.pmnum} does not have a next scheduled date`,
          errorCode: 'VALIDATION_ERROR',
          statusCode: 400,
          headers: {},
          requestId: pmResponse.requestId,
        };
      }

      // Validate that the frequency unit is time-based
      const timeBasedUnits: TimeFrequencyUnit[] = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];
      if (!timeBasedUnits.includes(pm.frequnit as TimeFrequencyUnit)) {
        return {
          success: false,
          error: `Schedule calculation is only supported for time-based frequency units (DAYS, WEEKS, MONTHS, YEARS). PM uses "${pm.frequnit}"`,
          errorCode: 'VALIDATION_ERROR',
          statusCode: 400,
          headers: {},
          requestId: pmResponse.requestId,
        };
      }

      // Calculate projected dates
      const projectedDates: PMScheduleEntry[] = [];
      let currentDate = new Date(pm.nextdate);

      for (let i = 0; i < count; i++) {
        projectedDates.push({
          sequence: i + 1,
          date: currentDate.toISOString(),
        });
        currentDate = this.calculateNextDate(
          currentDate,
          pm.frequency,
          pm.frequnit as TimeFrequencyUnit
        );
      }

      logger.info('PM schedule calculated successfully', {
        pmnum: validated.pmnum,
        count: projectedDates.length,
      });

      return {
        success: true,
        data: {
          pmnum: pm.pmnum,
          frequency: pm.frequency,
          frequnit: pm.frequnit,
          nextdate: pm.nextdate,
          projectedDates,
        },
        statusCode: 200,
        headers: pmResponse.headers || {},
        requestId: pmResponse.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve PM schedule', { pmnum: params.pmnum, siteid: params.siteid, error });
      throw error;
    }
  }

  /**
   * Update PM frequency settings
   * @param data - Frequency update data
   * @returns API response with updated PM record
   */
  async updatePMFrequency(data: PMFrequencyUpdate): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Updating PM frequency', {
      pmnum: data.pmnum,
      siteid: data.siteid,
      frequency: data.frequency,
      frequnit: data.frequnit,
    });

    try {
      // Validate input
      const validated = pmFrequencyUpdateSchema.parse(data);

      // Get the PM record to obtain its href
      const getResponse = await this.get(validated.pmnum, validated.siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Build frequency update payload
      const frequencyPayload = {
        frequency: validated.frequency,
        frequnit: validated.frequnit,
      };

      // Make PATCH request
      const response = await this.client.patch<PreventiveMaintenance>(href, frequencyPayload);

      if (response.success && response.data) {
        logger.info('PM frequency updated successfully', {
          pmnum: validated.pmnum,
          frequency: validated.frequency,
          frequnit: validated.frequnit,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update PM frequency', { pmnum: data.pmnum, siteid: data.siteid, error });
      throw error;
    }
  }

  /**
   * Activate a PM record (set status to ACTIVE)
   * @param data - PM identifier (pmnum and siteid)
   * @returns API response with updated PM record
   */
  async activatePM(data: PMStatusChange): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Activating PM record', { pmnum: data.pmnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = pmStatusChangeSchema.parse(data);

      // Get the PM record to obtain its href
      const getResponse = await this.get(validated.pmnum, validated.siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make PATCH request to set status to ACTIVE
      const response = await this.client.patch<PreventiveMaintenance>(href, {
        status: 'ACTIVE',
      });

      if (response.success && response.data) {
        logger.info('PM record activated successfully', {
          pmnum: validated.pmnum,
          siteid: validated.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to activate PM record', { pmnum: data.pmnum, siteid: data.siteid, error });
      throw error;
    }
  }

  /**
   * Deactivate a PM record (set status to INACTIVE)
   * @param data - PM identifier (pmnum and siteid)
   * @returns API response with updated PM record
   */
  async deactivatePM(data: PMStatusChange): Promise<ApiResponse<PreventiveMaintenance>> {
    logger.info('Deactivating PM record', { pmnum: data.pmnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = pmStatusChangeSchema.parse(data);

      // Get the PM record to obtain its href
      const getResponse = await this.get(validated.pmnum, validated.siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const pm = getResponse.data;
      const href = (pm as any).href || (pm as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'PM record href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make PATCH request to set status to INACTIVE
      const response = await this.client.patch<PreventiveMaintenance>(href, {
        status: 'INACTIVE',
      });

      if (response.success && response.data) {
        logger.info('PM record deactivated successfully', {
          pmnum: validated.pmnum,
          siteid: validated.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to deactivate PM record', { pmnum: data.pmnum, siteid: data.siteid, error });
      throw error;
    }
  }
}
