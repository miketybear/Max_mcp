/**
 * Person and Labor Operations
 * Business logic for person and labor management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  Person,
  PersonCreate,
  PersonUpdate,
  PersonSearch,
  LaborTransaction,
  LaborTransactionCreate,
  LaborTransactionSearch,
  PersonListResponse,
  LaborTransactionListResponse,
  PersonCraftRate,
  AddCraftParams,
  LaborCrewListResponse,
  LaborCrewMembersResponse,
  LaborAvailability,
  LaborCostSummary,
} from './types';
import {
  personCreateSchema,
  personUpdateSchema,
  personSearchSchema,
  laborTransactionCreateSchema,
  laborTransactionSearchSchema,
  getCraftsSchema,
  addCraftSchema,
  getCrewsSchema,
  getCrewMembersSchema,
  laborAvailabilitySchema,
  laborCostSummarySchema,
  qualifiedLaborSchema,
} from './validators';

const logger = createLogger('PersonLaborOperations');

/**
 * Person and Labor Operations class
 * Provides methods for managing persons and labor transactions in Maximo
 */
export class PersonLaborOperations {
  private client: MaximoClient;

  /**
   * Create a new PersonLaborOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('PersonLaborOperations initialized');
  }

  /**
   * Create a new person
   * @param data - Person creation data
   * @returns API response with created person
   */
  async createPerson(data: PersonCreate): Promise<ApiResponse<Person>> {
    logger.info('Creating person', { personid: data.personid });

    try {
      const validated = personCreateSchema.parse(data);
      const response = await this.client.post<Person>(API_ENDPOINTS.PERSONS, validated);

      if (response.success && response.data) {
        logger.info('Person created successfully', { personid: response.data.personid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create person', { error });
      throw error;
    }
  }

  /**
   * Get person by ID
   * @param personid - Person ID
   * @returns API response with person data
   */
  async getPerson(personid: string): Promise<ApiResponse<Person>> {
    logger.info('Retrieving person', { personid });

    try {
      const params: OSLCQueryParams = {
        'oslc.where': `personid="${personid}"`,
        'oslc.pageSize': 1,
      };

      const response = await this.client.get<{ member: Person[] }>(
        API_ENDPOINTS.PERSONS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Person retrieved successfully', { personid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      return {
        success: false,
        error: `Person ${personid} not found`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve person', { personid, error });
      throw error;
    }
  }

  /**
   * Update person
   * @param personid - Person ID
   * @param data - Update data
   * @returns API response with updated person
   */
  async updatePerson(personid: string, data: PersonUpdate): Promise<ApiResponse<Person>> {
    logger.info('Updating person', { personid });

    try {
      const validated = personUpdateSchema.parse(data);
      const getResponse = await this.getPerson(personid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const person = getResponse.data;
      const href = (person as any).href || (person as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Person href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      const response = await this.client.patch<Person>(href, validated);

      if (response.success && response.data) {
        logger.info('Person updated successfully', { personid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update person', { personid, error });
      throw error;
    }
  }

  /**
   * Search persons
   * @param params - Search parameters
   * @returns API response with list of persons
   */
  async searchPersons(params: PersonSearch): Promise<ApiResponse<PersonListResponse>> {
    logger.info('Searching persons', { filters: Object.keys(params) });

    try {
      const validated = personSearchSchema.parse(params);
      const whereConditions: string[] = [];

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s) => `"${s}"`).join(',');
          whereConditions.push(`status in (${statusList})`);
        } else {
          whereConditions.push(`status="${validated.status}"`);
        }
      }

      if (validated.displayname) {
        whereConditions.push(`displayname like "%${validated.displayname}%"`);
      }

      if (validated.siteid) {
        whereConditions.push(`siteid="${validated.siteid}"`);
      }

      if (validated.department) {
        whereConditions.push(`department="${validated.department}"`);
      }

      if (validated.craft) {
        whereConditions.push(`craft="${validated.craft}"`);
      }

      if (validated.crewid) {
        whereConditions.push(`crewid="${validated.crewid}"`);
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' and ') : undefined;

      const queryParams: OSLCQueryParams = {
        'oslc.select':
          'personid,displayname,primaryemail,status,siteid,orgid,laborcode,phonenum,department,jobtitle,craft',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.pageNumber': validated.pageNum || 1,
      };

      if (whereClause) {
        queryParams['oslc.where'] = whereClause;
      }

      const response = await this.client.get<PersonListResponse>(
        API_ENDPOINTS.PERSONS,
        queryParams
      );

      if (response.success && response.data) {
        logger.info('Persons retrieved successfully', {
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to search persons', { error });
      throw error;
    }
  }

  /**
   * Record labor transaction
   * @param data - Labor transaction creation data
   * @returns API response with created labor transaction
   */
  async recordLabor(data: LaborTransactionCreate): Promise<ApiResponse<LaborTransaction>> {
    logger.info('Recording labor transaction', { laborcode: data.laborcode, refwo: data.refwo });

    try {
      const validated = laborTransactionCreateSchema.parse(data);
      const response = await this.client.post<LaborTransaction>(
        API_ENDPOINTS.LABOR,
        validated
      );

      if (response.success && response.data) {
        logger.info('Labor transaction recorded successfully', {
          labtransid: response.data.labtransid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to record labor transaction', { error });
      throw error;
    }
  }

  /**
   * Get labor transactions
   * @param params - Search parameters
   * @returns API response with list of labor transactions
   */
  async getLaborTransactions(
    params: LaborTransactionSearch
  ): Promise<ApiResponse<LaborTransactionListResponse>> {
    logger.info('Retrieving labor transactions', { filters: Object.keys(params) });

    try {
      const validated = laborTransactionSearchSchema.parse(params);
      const whereConditions: string[] = [];

      if (validated.laborcode) {
        whereConditions.push(`laborcode="${validated.laborcode}"`);
      }

      if (validated.refwo) {
        whereConditions.push(`refwo="${validated.refwo}"`);
      }

      if (validated.transtype) {
        whereConditions.push(`transtype="${validated.transtype}"`);
      }

      if (validated.dateFrom || validated.dateTo) {
        if (validated.dateFrom && validated.dateTo) {
          whereConditions.push(
            `transdate>="${validated.dateFrom}" and transdate<="${validated.dateTo}"`
          );
        } else if (validated.dateFrom) {
          whereConditions.push(`transdate>="${validated.dateFrom}"`);
        } else if (validated.dateTo) {
          whereConditions.push(`transdate<="${validated.dateTo}"`);
        }
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' and ') : undefined;

      const queryParams: OSLCQueryParams = {
        'oslc.select':
          'labtransid,laborcode,refwo,transdate,regularhrs,overtimehrs,doublehrs,transtype,startdate,finishdate,totalcost',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.pageNumber': validated.pageNum || 1,
      };

      if (whereClause) {
        queryParams['oslc.where'] = whereClause;
      }

      const response = await this.client.get<LaborTransactionListResponse>(
        API_ENDPOINTS.LABOR,
        queryParams
      );

      if (response.success && response.data) {
        logger.info('Labor transactions retrieved successfully', {
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to retrieve labor transactions', { error });
      throw error;
    }
  }

  /**
   * Get crafts/skills for a person
   * @param personid - Person ID
   * @param siteid - Optional site ID
   * @returns API response with array of person craft rates
   */
  async getCrafts(personid: string, siteid?: string): Promise<ApiResponse<PersonCraftRate[]>> {
    logger.info('Retrieving crafts for person', { personid });

    try {
      getCraftsSchema.parse({ personid, siteid });

      const whereConditions: string[] = [`personid="${personid}"`];
      if (siteid) {
        whereConditions.push(`siteid="${siteid}"`);
      }

      const params: OSLCQueryParams = {
        'oslc.where': whereConditions.join(' and '),
        'oslc.select': 'personid,personcraftrate{*}',
        'oslc.pageSize': 1,
      };

      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.PERSONS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const person = response.data.member[0];
        const craftRates: PersonCraftRate[] = person.personcraftrate || [];
        logger.info('Crafts retrieved successfully', {
          personid,
          count: craftRates.length,
        });
        return {
          ...response,
          data: craftRates,
        };
      }

      return {
        success: false,
        error: `Person ${personid} not found`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve crafts for person', { personid, error });
      throw error;
    }
  }

  /**
   * Add a craft/skill to a person
   * @param data - Craft addition parameters
   * @returns API response with the added craft rate
   */
  async addCraft(data: AddCraftParams): Promise<ApiResponse<PersonCraftRate>> {
    logger.info('Adding craft to person', { personid: data.personid, craft: data.craft });

    try {
      const validated = addCraftSchema.parse(data);

      // First get the person to obtain href
      const getResponse = await this.getPerson(validated.personid);
      if (!getResponse.success || !getResponse.data) {
        return {
          success: false,
          error: `Person ${validated.personid} not found`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: getResponse.headers,
          requestId: getResponse.requestId,
        };
      }

      const person = getResponse.data;
      const href = (person as any).href || (person as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Person href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      const craftData: any = {
        craft: validated.craft,
        skilllevel: validated.skilllevel,
      };
      if (validated.rate !== undefined) {
        craftData.rate = validated.rate;
      }

      const response = await this.client.post<PersonCraftRate>(
        `${href}/PERSONCRAFTRATE`,
        craftData
      );

      if (response.success && response.data) {
        logger.info('Craft added successfully', {
          personid: validated.personid,
          craft: validated.craft,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add craft to person', { personid: data.personid, error });
      throw error;
    }
  }

  /**
   * Get all labor crews
   * @param siteid - Optional site ID filter
   * @returns API response with list of labor crews
   */
  async getCrews(siteid?: string): Promise<ApiResponse<LaborCrewListResponse>> {
    logger.info('Retrieving labor crews', { siteid });

    try {
      getCrewsSchema.parse({ siteid });

      const queryParams: OSLCQueryParams = {
        'oslc.select': 'laborcrewid,description,crewtype,calnum,orgid,siteid',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      if (siteid) {
        queryParams['oslc.where'] = `siteid="${siteid}"`;
      }

      const response = await this.client.get<LaborCrewListResponse>(
        '/maximo/api/os/mxlaborcrew',
        queryParams
      );

      if (response.success && response.data) {
        logger.info('Labor crews retrieved successfully', {
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to retrieve labor crews', { error });
      throw error;
    }
  }

  /**
   * Get members of a labor crew
   * @param laborcrewid - Labor crew ID
   * @param siteid - Optional site ID filter
   * @returns API response with crew members (labor and tools)
   */
  async getCrewMembers(
    laborcrewid: string,
    siteid?: string
  ): Promise<ApiResponse<LaborCrewMembersResponse>> {
    logger.info('Retrieving crew members', { laborcrewid });

    try {
      getCrewMembersSchema.parse({ laborcrewid, siteid });

      const whereConditions: string[] = [`laborcrewid="${laborcrewid}"`];
      if (siteid) {
        whereConditions.push(`siteid="${siteid}"`);
      }

      const params: OSLCQueryParams = {
        'oslc.where': whereConditions.join(' and '),
        'oslc.select': 'laborcrewid,description,laborcrewtool{*},laborcrewlabor{*}',
        'oslc.pageSize': 1,
      };

      const response = await this.client.get<{ member: any[] }>(
        '/maximo/api/os/mxlaborcrew',
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const crew = response.data.member[0];
        const result: LaborCrewMembersResponse = {
          laborcrewid: crew.laborcrewid,
          description: crew.description,
          laborcrewlabor: crew.laborcrewlabor || [],
          laborcrewtool: crew.laborcrewtool || [],
        };

        logger.info('Crew members retrieved successfully', {
          laborcrewid,
          laborCount: result.laborcrewlabor.length,
          toolCount: result.laborcrewtool.length,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        error: `Labor crew ${laborcrewid} not found`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve crew members', { laborcrewid, error });
      throw error;
    }
  }

  /**
   * Check labor availability for a person in a date range
   * @param personid - Person ID
   * @param startDate - Start date (ISO 8601)
   * @param endDate - End date (ISO 8601)
   * @returns API response with labor availability data
   */
  async getLaborAvailability(
    personid: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<LaborAvailability>> {
    logger.info('Checking labor availability', { personid, startDate, endDate });

    try {
      laborAvailabilitySchema.parse({ personid, startDate, endDate });

      // Query work orders assigned to this person in the date range
      const queryParams: OSLCQueryParams = {
        'oslc.where': `owner="${personid}" and schedstart>="${startDate}" and schedfinish<="${endDate}"`,
        'oslc.select': 'wonum,schedstart,schedfinish,estdur',
        'oslc.pageSize': 1000,
      };

      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.WORK_ORDERS,
        queryParams
      );

      // Calculate business days between dates (using UTC to avoid timezone issues)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1;

      // Count business days (excluding weekends) using UTC day of week
      let businessDays = 0;
      const current = new Date(start);
      for (let i = 0; i < totalDays; i++) {
        const dayOfWeek = current.getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }

      const totalCapacityHours = businessDays * 8;

      // Sum up assigned hours from work orders
      let assignedHours = 0;
      if (response.success && response.data?.member) {
        for (const wo of response.data.member) {
          assignedHours += wo.estdur || 0;
        }
      }

      const availableHours = Math.max(0, totalCapacityHours - assignedHours);
      const utilizationPercent =
        totalCapacityHours > 0
          ? Math.round((assignedHours / totalCapacityHours) * 100 * 100) / 100
          : 0;

      const availability: LaborAvailability = {
        personid,
        totalCapacityHours,
        assignedHours,
        availableHours,
        utilizationPercent,
      };

      logger.info('Labor availability calculated', {
        personid,
        totalCapacityHours,
        assignedHours,
        utilizationPercent,
      });

      return {
        success: true,
        data: availability,
        statusCode: 200,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to check labor availability', { personid, error });
      throw error;
    }
  }

  /**
   * Get labor cost summary for a person
   * @param personid - Person ID
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @returns API response with labor cost summary
   */
  async getLaborCostSummary(
    personid: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<LaborCostSummary>> {
    logger.info('Getting labor cost summary', { personid, startDate, endDate });

    try {
      laborCostSummarySchema.parse({ personid, startDate, endDate });

      // Build where clause for labor transactions
      const whereConditions: string[] = [`laborcode="${personid}"`];

      if (startDate && endDate) {
        whereConditions.push(
          `transdate>="${startDate}" and transdate<="${endDate}"`
        );
      } else if (startDate) {
        whereConditions.push(`transdate>="${startDate}"`);
      } else if (endDate) {
        whereConditions.push(`transdate<="${endDate}"`);
      }

      const queryParams: OSLCQueryParams = {
        'oslc.where': whereConditions.join(' and '),
        'oslc.select': 'labtransid,laborcode,regularhrs,overtimehrs,doublehrs,totalcost',
        'oslc.pageSize': 1000,
      };

      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.LABOR,
        queryParams
      );

      let totalHours = 0;
      let totalCost = 0;
      let transactionCount = 0;

      if (response.success && response.data?.member) {
        transactionCount = response.data.member.length;
        for (const trans of response.data.member) {
          totalHours += (trans.regularhrs || 0) + (trans.overtimehrs || 0) + (trans.doublehrs || 0);
          totalCost += trans.totalcost || 0;
        }
      }

      const summary: LaborCostSummary = {
        personid,
        totalHours: Math.round(totalHours * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        transactionCount,
        startDate,
        endDate,
      };

      logger.info('Labor cost summary calculated', {
        personid,
        totalHours: summary.totalHours,
        totalCost: summary.totalCost,
        transactionCount,
      });

      return {
        success: true,
        data: summary,
        statusCode: 200,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to get labor cost summary', { personid, error });
      throw error;
    }
  }

  /**
   * Find all persons qualified for a specific craft
   * @param craft - Craft code
   * @param skilllevel - Optional skill level filter
   * @param siteid - Optional site ID filter
   * @returns API response with list of qualified persons
   */
  async getQualifiedLabor(
    craft: string,
    skilllevel?: string,
    siteid?: string
  ): Promise<ApiResponse<PersonListResponse>> {
    logger.info('Searching qualified labor', { craft, skilllevel, siteid });

    try {
      qualifiedLaborSchema.parse({ craft, skilllevel, siteid });

      const whereConditions: string[] = [`personcraftrate.craft="${craft}"`];

      if (skilllevel) {
        whereConditions.push(`personcraftrate.skilllevel="${skilllevel}"`);
      }

      if (siteid) {
        whereConditions.push(`siteid="${siteid}"`);
      }

      const queryParams: OSLCQueryParams = {
        'oslc.where': whereConditions.join(' and '),
        'oslc.select':
          'personid,displayname,primaryemail,status,siteid,orgid,laborcode,department,jobtitle',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      const response = await this.client.get<PersonListResponse>(
        API_ENDPOINTS.PERSONS,
        queryParams
      );

      if (response.success && response.data) {
        logger.info('Qualified labor retrieved successfully', {
          craft,
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to search qualified labor', { craft, error });
      throw error;
    }
  }
}
