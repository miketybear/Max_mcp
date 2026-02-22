/**
 * Job Plan Operations
 * Business logic for job plan management in Maximo
 *
 * Job Plans (MXJP) are reusable templates that define the tasks, labor,
 * materials, and services needed to complete work orders.
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  JobPlan,
  JobPlanCreate,
  JobPlanUpdate,
  JobPlanSearch,
  JobPlanTask,
  JobPlanLabor,
  JobPlanMaterial,
  JobPlanService,
  JobPlanListResponse,
} from './types';
import {
  jobPlanCreateSchema,
  jobPlanUpdateSchema,
  jobPlanSearchSchema,
  jobPlanTaskSchema,
  jobPlanLaborSchema,
  jobPlanMaterialSchema,
  jobPlanServiceSchema,
} from './validators';
import { ValidationError } from '../../core/types';

const logger = createLogger('JobPlanOperations');

/** API endpoint for job plans */
const JOB_PLANS_ENDPOINT = '/maximo/api/os/mxjobplan';

/**
 * Job Plan Operations class
 * Provides methods for managing job plans in Maximo
 */
export class JobPlanOperations {
  private client: MaximoClient;

  /**
   * Create a new JobPlanOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('JobPlanOperations initialized');
  }

  /**
   * Create a new job plan
   * @param data - Job plan creation data
   * @returns API response with created job plan
   */
  async create(data: JobPlanCreate): Promise<ApiResponse<JobPlan>> {
    logger.info('Creating job plan', { jpnum: data.jpnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = jobPlanCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<JobPlan>(
        JOB_PLANS_ENDPOINT,
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
   * Get job plan by number
   * @param jpnum - Job plan number
   * @param siteid - Site identifier (optional for org-level plans)
   * @returns API response with job plan data
   */
  async get(jpnum: string, siteid?: string): Promise<ApiResponse<JobPlan>> {
    logger.info('Retrieving job plan', { jpnum, siteid });

    try {
      // Build where clause
      let whereClause = `jpnum="${jpnum}"`;
      if (siteid) {
        whereClause += ` and siteid="${siteid}"`;
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClause,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: JobPlan[] }>(
        JOB_PLANS_ENDPOINT,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Job plan retrieved successfully', { jpnum, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // Job plan not found
      const siteMsg = siteid ? ` in site ${siteid}` : '';
      return {
        success: false,
        error: `Job plan ${jpnum} not found${siteMsg}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Update job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @param data - Update data
   * @returns API response with updated job plan
   */
  async update(
    jpnum: string,
    siteid: string,
    data: JobPlanUpdate
  ): Promise<ApiResponse<JobPlan>> {
    logger.info('Updating job plan', { jpnum, siteid });

    try {
      // Validate input
      const validated = jobPlanUpdateSchema.parse(data);

      // First, get the job plan to get its href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Make API request to update
      const response = await this.client.patch<JobPlan>(jobPlan.href, validated);

      if (response.success) {
        logger.info('Job plan updated successfully', { jpnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Delete job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier (optional for org-level plans)
   * @returns API response
   */
  async delete(jpnum: string, siteid?: string): Promise<ApiResponse<void>> {
    logger.info('Deleting job plan', { jpnum, siteid });

    try {
      // First, get the job plan to get its href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse as ApiResponse<void>;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Make API request to delete
      const response = await this.client.delete<void>(jobPlan.href);

      if (response.success) {
        logger.info('Job plan deleted successfully', { jpnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Search job plans with filters
   * @param criteria - Search criteria
   * @returns API response with job plan list
   */
  async search(criteria: JobPlanSearch): Promise<ApiResponse<JobPlanListResponse>> {
    logger.info('Searching job plans', { criteria });

    try {
      // Validate input
      const validated = jobPlanSearchSchema.parse(criteria);

      // Build OSLC query parameters
      const params: OSLCQueryParams = {};

      // Build where clause
      const whereClauses: string[] = [];

      if (validated.jpnum) {
        // Support wildcard searches with %
        if (validated.jpnum.includes('%')) {
          whereClauses.push(`jpnum like "${validated.jpnum}"`);
        } else {
          whereClauses.push(`jpnum="${validated.jpnum}"`);
        }
      }

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s: string) => `"${s}"`).join(',');
          whereClauses.push(`status in [${statusList}]`);
        } else {
          whereClauses.push(`status="${validated.status}"`);
        }
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.orgid) {
        whereClauses.push(`orgid="${validated.orgid}"`);
      }

      if (validated.priority !== undefined) {
        whereClauses.push(`priority=${validated.priority}`);
      }

      if (validated.worktype) {
        whereClauses.push(`worktype="${validated.worktype}"`);
      }

      if (validated.craft) {
        whereClauses.push(`craft="${validated.craft}"`);
      }

      // Add custom where clause if provided
      if (validated.where) {
        whereClauses.push(validated.where);
      }

      // Combine where clauses
      if (whereClauses.length > 0) {
        params['oslc.where'] = whereClauses.join(' and ');
      }

      // Add select fields
      if (validated.select && validated.select.length > 0) {
        params['oslc.select'] = validated.select.join(',');
      }

      // Add order by
      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      // Add search terms
      if (validated.searchTerms) {
        params['oslc.searchTerms'] = validated.searchTerms;
      }

      // Add pagination
      params['oslc.pageSize'] = validated.pageSize || DEFAULT_PAGE_SIZE;

      // Make API request
      const response = await this.client.get<{
        member: JobPlan[];
        responseInfo?: {
          totalCount?: number;
          pagenum?: number;
          totalPages?: number;
          nextPage?: { href: string };
          previousPage?: { href: string };
        };
      }>(JOB_PLANS_ENDPOINT, params);

      if (response.success && response.data) {
        const jobPlans = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || jobPlans.length;
        const pageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const page = validated.page || 1;
        const totalPages = Math.ceil(totalCount / pageSize);

        const listResponse: JobPlanListResponse = {
          jobPlans,
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNext: !!response.data.responseInfo?.nextPage,
          hasPrevious: !!response.data.responseInfo?.previousPage,
        };

        logger.info('Job plans search completed', {
          count: jobPlans.length,
          totalCount,
        });

        return {
          ...response,
          data: listResponse,
        };
      }

      // Return empty result if no data
      return {
        success: false,
        error: 'No data returned from search',
        errorCode: 'NO_DATA',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to search job plans', { error });
      throw error;
    }
  }

  /**
   * Add a task to a job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @param taskData - Task data
   * @returns API response
   */
  async addTask(
    jpnum: string,
    siteid: string | undefined,
    taskData: JobPlanTask
  ): Promise<ApiResponse<any>> {
    logger.info('Adding task to job plan', { jpnum, siteid, jptask: taskData.jptask });

    try {
      // Validate input
      const validated = jobPlanTaskSchema.parse({ jpnum, siteid, ...taskData });

      // Get job plan to verify it exists and get href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Build task data for the JOBTASK child collection
      const taskPayload = {
        jptask: validated.jptask,
        description: validated.description,
        metername: validated.metername,
        interruptible: validated.interruptible,
        duration: validated.duration,
        sequence: validated.sequence,
        ownergroup: validated.ownergroup,
        craft: validated.craft,
        description_longdescription: validated.description_longdescription,
      };

      // POST to the job plan's JOBTASK child collection
      const taskEndpoint = `${jobPlan.href}/JOBTASK`;

      // Make API request
      const response = await this.client.post<any>(taskEndpoint, taskPayload);

      if (response.success) {
        logger.info('Task added to job plan successfully', { jpnum, siteid, jptask: taskData.jptask });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add task to job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Get tasks for a job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @returns API response with jobtask array
   */
  async getTasks(jpnum: string, siteid: string | undefined): Promise<ApiResponse<any[]>> {
    logger.info('Retrieving tasks for job plan', { jpnum, siteid });

    try {
      // Build where clause
      let whereClause = `jpnum="${jpnum}"`;
      if (siteid) {
        whereClause += ` and siteid="${siteid}"`;
      }

      // Build query parameters to include jobtask child records
      const params: OSLCQueryParams = {
        'oslc.where': whereClause,
        'oslc.select': 'jpnum,siteid,jobtask{*}',
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: any[] }>(
        JOB_PLANS_ENDPOINT,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const jobPlan = response.data.member[0];
        const tasks = jobPlan.jobtask || [];

        logger.info('Tasks retrieved successfully', { jpnum, siteid, count: tasks.length });
        return {
          ...response,
          data: tasks,
        };
      }

      // Job plan not found
      const siteMsg = siteid ? ` in site ${siteid}` : '';
      return {
        success: false,
        error: `Job plan ${jpnum} not found${siteMsg}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve tasks', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Add labor requirement to a job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @param laborData - Labor requirement data
   * @returns API response
   */
  async addLabor(
    jpnum: string,
    siteid: string | undefined,
    laborData: JobPlanLabor
  ): Promise<ApiResponse<any>> {
    logger.info('Adding labor to job plan', { jpnum, siteid, craft: laborData.craft });

    try {
      // Validate input
      const validated = jobPlanLaborSchema.parse({ jpnum, siteid, ...laborData });

      // Get job plan to verify it exists and get href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Build labor data for the JOBLABOR child collection
      const laborPayload = {
        craft: validated.craft,
        quantity: validated.quantity,
        laborhrs: validated.hours,
        rate: validated.rate,
        skilllevel: validated.skilllevel,
        vendor: validated.vendor,
        contractnum: validated.contractnum,
      };

      // POST to the job plan's JOBLABOR child collection
      const laborEndpoint = `${jobPlan.href}/JOBLABOR`;

      // Make API request
      const response = await this.client.post<any>(laborEndpoint, laborPayload);

      if (response.success) {
        logger.info('Labor added to job plan successfully', { jpnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add labor to job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Add material requirement to a job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @param materialData - Material requirement data
   * @returns API response
   */
  async addMaterial(
    jpnum: string,
    siteid: string | undefined,
    materialData: JobPlanMaterial
  ): Promise<ApiResponse<any>> {
    logger.info('Adding material to job plan', { jpnum, siteid, itemnum: materialData.itemnum });

    try {
      // Validate input
      const validated = jobPlanMaterialSchema.parse({ jpnum, siteid, ...materialData });

      // Get job plan to verify it exists and get href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Build material data for the JOBMATERIAL child collection
      const materialPayload = {
        itemnum: validated.itemnum,
        itemqty: validated.itemqty,
        description: validated.description,
        conditioncode: validated.conditioncode,
        storeroom: validated.storeroom,
        unitcost: validated.unitcost,
        directreq: validated.directreq,
        linetype: validated.linetype,
      };

      // POST to the job plan's JOBMATERIAL child collection
      const materialEndpoint = `${jobPlan.href}/JOBMATERIAL`;

      // Make API request
      const response = await this.client.post<any>(materialEndpoint, materialPayload);

      if (response.success) {
        logger.info('Material added to job plan successfully', { jpnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add material to job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Add service requirement to a job plan
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @param serviceData - Service requirement data
   * @returns API response
   */
  async addService(
    jpnum: string,
    siteid: string | undefined,
    serviceData: JobPlanService
  ): Promise<ApiResponse<any>> {
    logger.info('Adding service to job plan', { jpnum, siteid });

    try {
      // Validate input
      const validated = jobPlanServiceSchema.parse({ jpnum, siteid, ...serviceData });

      // Get job plan to verify it exists and get href
      const getResponse = await this.get(jpnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const jobPlan = getResponse.data;
      if (!jobPlan.href) {
        throw new ValidationError('Job plan href not found');
      }

      // Build service data for the JOBSERVICE child collection
      const servicePayload = {
        description: validated.description,
        vendor: validated.vendor,
        linecost: validated.linecost,
        contractnum: validated.contractnum,
        linetype: validated.linetype,
      };

      // POST to the job plan's JOBSERVICE child collection
      const serviceEndpoint = `${jobPlan.href}/JOBSERVICE`;

      // Make API request
      const response = await this.client.post<any>(serviceEndpoint, servicePayload);

      if (response.success) {
        logger.info('Service added to job plan successfully', { jpnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add service to job plan', { jpnum, siteid, error });
      throw error;
    }
  }

  /**
   * Get work orders associated with a job plan
   * Queries work orders that reference this job plan number
   * @param jpnum - Job plan number
   * @param siteid - Site identifier
   * @returns API response with work order list
   */
  async getAssociatedWorkOrders(
    jpnum: string,
    siteid: string | undefined
  ): Promise<ApiResponse<any[]>> {
    logger.info('Retrieving work orders for job plan', { jpnum, siteid });

    try {
      // Build where clause to find work orders referencing this job plan
      let whereClause = `jpnum="${jpnum}"`;
      if (siteid) {
        whereClause += ` and siteid="${siteid}"`;
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClause,
        'oslc.select': 'wonum,description,status,siteid,jpnum,schedstart,schedfinish',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      // Query the work orders endpoint
      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.WORK_ORDERS,
        params
      );

      if (response.success && response.data?.member) {
        const workOrders = response.data.member || [];

        logger.info('Associated work orders retrieved successfully', {
          jpnum,
          siteid,
          count: workOrders.length,
        });

        return {
          ...response,
          data: workOrders,
        };
      }

      // Return empty list
      return {
        ...response,
        data: [],
      };
    } catch (error) {
      logger.error('Failed to retrieve associated work orders', { jpnum, siteid, error });
      throw error;
    }
  }
}
