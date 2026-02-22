/**
 * Work Order Operations
 * Business logic for work order management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  WorkOrder,
  WorkOrderCreate,
  WorkOrderUpdate,
  WorkOrderSearch,
  LaborTransaction,
  MaterialTransaction,
  ServiceEntry,
  WorkLog,
  WorkOrderAssignment,
  WorkOrderListResponse,
  WorkOrderTask,
} from './types';
import {
  workOrderCreateSchema,
  workOrderUpdateSchema,
  workOrderSearchSchema,
  statusChangeSchema,
  laborTransactionSchema,
  materialTransactionSchema,
  serviceEntrySchema,
  workLogSchema,
  assignmentSchema,
  taskSchema,
  validateStatusTransition,
} from './validators';
import { ValidationError } from '../../core/types';

const logger = createLogger('WorkOrderOperations');

/**
 * Work Order Operations class
 * Provides methods for managing work orders in Maximo
 */
export class WorkOrderOperations {
  private client: MaximoClient;

  /**
   * Create a new WorkOrderOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('WorkOrderOperations initialized');
  }

  /**
   * Create a new work order
   * @param data - Work order creation data
   * @returns API response with created work order
   */
  async create(data: WorkOrderCreate): Promise<ApiResponse<WorkOrder>> {
    logger.info('Creating work order', { siteid: data.siteid, worktype: data.worktype });

    try {
      // Validate input
      const validated = workOrderCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<WorkOrder>(
        API_ENDPOINTS.WORK_ORDERS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Work order created successfully', {
          wonum: response.data.wonum,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create work order', { error });
      throw error;
    }
  }

  /**
   * Get work order by number
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @returns API response with work order data
   */
  async get(wonum: string, siteid: string): Promise<ApiResponse<WorkOrder>> {
    logger.info('Retrieving work order', { wonum, siteid });

    try {
      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `wonum="${wonum}" and siteid="${siteid}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: WorkOrder[] }>(
        API_ENDPOINTS.WORK_ORDERS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Work order retrieved successfully', { wonum, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // Work order not found
      return {
        success: false,
        error: `Work order ${wonum} not found in site ${siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve work order', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Update work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param data - Update data
   * @returns API response with updated work order
   */
  async update(
    wonum: string,
    siteid: string,
    data: WorkOrderUpdate
  ): Promise<ApiResponse<WorkOrder>> {
    logger.info('Updating work order', { wonum, siteid });

    try {
      // Validate input
      const validated = workOrderUpdateSchema.parse(data);

      // First, get the work order to get its href
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Make API request to update
      const response = await this.client.patch<WorkOrder>(workOrder.href, validated);

      if (response.success) {
        logger.info('Work order updated successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update work order', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Delete work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @returns API response
   */
  async delete(wonum: string, siteid: string): Promise<ApiResponse<void>> {
    logger.info('Deleting work order', { wonum, siteid });

    try {
      // First, get the work order to get its href
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse as ApiResponse<void>;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Make API request to delete
      const response = await this.client.delete<void>(workOrder.href);

      if (response.success) {
        logger.info('Work order deleted successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete work order', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Change work order status
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param newStatus - New status
   * @param memo - Optional status change memo
   * @returns API response with updated work order
   */
  async changeStatus(
    wonum: string,
    siteid: string,
    newStatus: string,
    memo?: string
  ): Promise<ApiResponse<WorkOrder>> {
    logger.info('Changing work order status', { wonum, siteid, newStatus });

    try {
      // Validate input
      const validated = statusChangeSchema.parse({
        wonum,
        siteid,
        status: newStatus,
        memo,
      });

      // Get current work order to check status transition
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      const currentStatus = workOrder.status;

      // Validate status transition
      if (!validateStatusTransition(currentStatus, newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          errorCode: 'VALIDATION_ERROR',
          statusCode: 400,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Prepare update data
      const updateData: WorkOrderUpdate = {
        status: validated.status,
      };

      // Add memo as work log if provided
      if (memo) {
        // Note: In a real implementation, you might need to add the memo
        // through a separate work log endpoint or include it in the status change
        logger.debug('Status change memo provided', { memo });
      }

      // Make API request to update status
      const response = await this.client.patch<WorkOrder>(workOrder.href, updateData);

      if (response.success) {
        logger.info('Work order status changed successfully', {
          wonum,
          siteid,
          oldStatus: currentStatus,
          newStatus,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to change work order status', { wonum, siteid, newStatus, error });
      throw error;
    }
  }

  /**
   * Add labor transaction to work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param labor - Labor transaction data
   * @returns API response
   */
  async addLabor(
    wonum: string,
    siteid: string,
    labor: LaborTransaction
  ): Promise<ApiResponse<any>> {
    logger.info('Adding labor transaction', { wonum, siteid, laborcode: labor.laborcode });

    try {
      // Validate input
      const validated = laborTransactionSchema.parse({ wonum, siteid, ...labor });

      // Get work order to verify it exists
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Build labor transaction endpoint (child collection)
      const laborEndpoint = `${workOrder.href}/WPLABOR`;

      // Prepare labor data
      const laborData = {
        laborcode: validated.laborcode,
        laborhrs: validated.hours,
        transdate: validated.transdate,
        starttime: validated.starttime,
        finishtime: validated.finishtime,
        regularhrs: validated.regularhrs,
        premiumpayhours: validated.premiumpayhours,
        craft: validated.craft,
        skilllevel: validated.skilllevel,
        vendor: validated.vendor,
        contractnum: validated.contractnum,
        linecost: validated.linecost,
        taskid: validated.taskid,
        geolocation: validated.geolocation,
      };

      // Make API request
      const response = await this.client.post<any>(laborEndpoint, laborData);

      if (response.success) {
        logger.info('Labor transaction added successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add labor transaction', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Add material transaction to work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param material - Material transaction data
   * @returns API response
   */
  async addMaterial(
    wonum: string,
    siteid: string,
    material: MaterialTransaction
  ): Promise<ApiResponse<any>> {
    logger.info('Adding material transaction', { wonum, siteid, itemnum: material.itemnum });

    try {
      // Validate input
      const validated = materialTransactionSchema.parse({ wonum, siteid, ...material });

      // Get work order to verify it exists
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Build material transaction endpoint (child collection)
      const materialEndpoint = `${workOrder.href}/WPMAT`;

      // Prepare material data
      const materialData = {
        itemnum: validated.itemnum,
        itemqty: validated.quantity,
        storeroom: validated.storeroom,
        binnum: validated.binnum,
        lotnum: validated.lotnum,
        issuetype: validated.issuetype,
        transdate: validated.transdate,
        linecost: validated.linecost,
        unitcost: validated.unitcost,
        taskid: validated.taskid,
        gldebitacct: validated.gldebitacct,
        glcreditacct: validated.glcreditacct,
        conversion: validated.conversion,
        issueunit: validated.issueunit,
      };

      // Make API request
      const response = await this.client.post<any>(materialEndpoint, materialData);

      if (response.success) {
        logger.info('Material transaction added successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add material transaction', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Add service entry to work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param service - Service entry data
   * @returns API response
   */
  async addService(
    wonum: string,
    siteid: string,
    service: ServiceEntry
  ): Promise<ApiResponse<any>> {
    logger.info('Adding service entry', { wonum, siteid });

    try {
      // Validate input
      const validated = serviceEntrySchema.parse({ wonum, siteid, ...service });

      // Get work order to verify it exists
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Build service entry endpoint (child collection)
      const serviceEndpoint = `${workOrder.href}/WPSERVICE`;

      // Prepare service data
      const serviceData = {
        description: validated.description,
        linecost: validated.linecost,
        vendor: validated.vendor,
        contractnum: validated.contractnum,
        ponum: validated.ponum,
        polinenum: validated.polinenum,
        taskid: validated.taskid,
        gldebitacct: validated.gldebitacct,
        enterdate: validated.enterdate,
        enterby: validated.enterby,
      };

      // Make API request
      const response = await this.client.post<any>(serviceEndpoint, serviceData);

      if (response.success) {
        logger.info('Service entry added successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add service entry', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Add work log entry to work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param worklog - Work log data
   * @returns API response
   */
  async addWorkLog(
    wonum: string,
    siteid: string,
    worklog: WorkLog
  ): Promise<ApiResponse<any>> {
    logger.info('Adding work log entry', { wonum, siteid });

    try {
      // Validate input
      const validated = workLogSchema.parse({ wonum, siteid, ...worklog });

      // Get work order to verify it exists
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Build work log endpoint (child collection)
      const worklogEndpoint = `${workOrder.href}/WORKLOG`;

      // Prepare work log data
      const worklogData = {
        description: validated.description,
        logtype: validated.logtype || 'WORK',
        description_longdescription: validated.description_longdescription,
        createdate: validated.createdate,
        createby: validated.createby,
        clientviewable: validated.clientviewable,
        class: validated.class,
      };

      // Make API request
      const response = await this.client.post<any>(worklogEndpoint, worklogData);

      if (response.success) {
        logger.info('Work log entry added successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add work log entry', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Assign work order to person or crew
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param assignment - Assignment data
   * @returns API response with updated work order
   */
  async assign(
    wonum: string,
    siteid: string,
    assignment: WorkOrderAssignment
  ): Promise<ApiResponse<WorkOrder>> {
    logger.info('Assigning work order', { wonum, siteid });

    try {
      // Validate input
      const validated = assignmentSchema.parse({ wonum, siteid, ...assignment });

      // Get work order to verify it exists
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Prepare assignment data
      const assignmentData: WorkOrderUpdate = {
        owner: validated.owner,
        ownergroup: validated.ownergroup,
        supervisor: validated.supervisor,
        lead: validated.lead,
        crewworkgroup: validated.crewworkgroup,
      };

      // Make API request to update work order
      const response = await this.client.patch<WorkOrder>(workOrder.href, assignmentData);

      if (response.success) {
        logger.info('Work order assigned successfully', { wonum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to assign work order', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Search work orders with filters
   * @param criteria - Search criteria
   * @returns API response with work order list
   */
  async search(criteria: WorkOrderSearch): Promise<ApiResponse<WorkOrderListResponse>> {
    logger.info('Searching work orders', { criteria });

    try {
      // Validate input
      const validated = workOrderSearchSchema.parse(criteria);

      // Build OSLC query parameters
      const params: OSLCQueryParams = {};

      // Build where clause
      const whereClauses: string[] = [];

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s: string) => `"${s}"`).join(',');
          whereClauses.push(`status in [${statusList}]`);
        } else {
          whereClauses.push(`status="${validated.status}"`);
        }
      }

      if (validated.assetnum) {
        whereClauses.push(`assetnum="${validated.assetnum}"`);
      }

      if (validated.location) {
        whereClauses.push(`location="${validated.location}"`);
      }

      if (validated.worktype) {
        if (Array.isArray(validated.worktype)) {
          const worktypeList = validated.worktype.map((wt: string) => `"${wt}"`).join(',');
          whereClauses.push(`worktype in [${worktypeList}]`);
        } else {
          whereClauses.push(`worktype="${validated.worktype}"`);
        }
      }

      if (validated.priority !== undefined) {
        whereClauses.push(`priority=${validated.priority}`);
      }

      if (validated.owner) {
        whereClauses.push(`owner="${validated.owner}"`);
      }

      if (validated.ownergroup) {
        whereClauses.push(`ownergroup="${validated.ownergroup}"`);
      }

      if (validated.supervisor) {
        whereClauses.push(`supervisor="${validated.supervisor}"`);
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.orgid) {
        whereClauses.push(`orgid="${validated.orgid}"`);
      }

      if (validated.dateRange) {
        const field = validated.dateRange.field || 'statusdate';
        whereClauses.push(
          `${field}>="${validated.dateRange.start}" and ${field}<="${validated.dateRange.end}"`
        );
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
        member: WorkOrder[];
        responseInfo?: {
          totalCount?: number;
          pagenum?: number;
          totalPages?: number;
          nextPage?: { href: string };
          previousPage?: { href: string };
        };
      }>(API_ENDPOINTS.WORK_ORDERS, params);

      if (response.success && response.data) {
        const workOrders = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || workOrders.length;
        const pageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const page = validated.page || 1;
        const totalPages = Math.ceil(totalCount / pageSize);

        const listResponse: WorkOrderListResponse = {
          workOrders,
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNext: !!response.data.responseInfo?.nextPage,
          hasPrevious: !!response.data.responseInfo?.previousPage,
        };

        logger.info('Work orders search completed', {
          count: workOrders.length,
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
      logger.error('Failed to search work orders', { error });
      throw error;
    }
  }

  /**
   * Add a task (child activity) to a work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param task - Task data
   * @returns API response
   */
  async addTask(
    wonum: string,
    siteid: string,
    task: WorkOrderTask
  ): Promise<ApiResponse<any>> {
    logger.info('Adding task to work order', { wonum, siteid, taskid: task.taskid });

    try {
      // Validate input
      const validated = taskSchema.parse({ wonum, siteid, ...task });

      // Get work order to verify it exists and get href
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      if (!workOrder.href) {
        throw new ValidationError('Work order href not found');
      }

      // Build task data for the woactivity child collection
      const taskData = {
        description: validated.description,
        taskid: validated.taskid,
        estdur: validated.estdur,
        ownergroup: validated.ownergroup,
        owner: validated.owner,
      };

      // POST to the work order's woactivity child collection
      const taskEndpoint = `${workOrder.href}/WOACTIVITY`;

      // Make API request
      const response = await this.client.post<any>(taskEndpoint, taskData);

      if (response.success) {
        logger.info('Task added successfully', { wonum, siteid, taskid: task.taskid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add task to work order', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Get tasks (child activities) for a work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @returns API response with woactivity array
   */
  async getTasks(wonum: string, siteid: string): Promise<ApiResponse<any[]>> {
    logger.info('Retrieving tasks for work order', { wonum, siteid });

    try {
      // Build query parameters to include woactivity child records
      const params: OSLCQueryParams = {
        'oslc.where': `wonum="${wonum}" and siteid="${siteid}"`,
        'oslc.select': 'wonum,siteid,woactivity{*}',
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.WORK_ORDERS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const workOrder = response.data.member[0];
        const tasks = workOrder.woactivity || [];

        logger.info('Tasks retrieved successfully', { wonum, siteid, count: tasks.length });
        return {
          ...response,
          data: tasks,
        };
      }

      // Work order not found
      return {
        success: false,
        error: `Work order ${wonum} not found in site ${siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve tasks', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Get work logs for a work order
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @returns API response with worklog array
   */
  async getWorkLogs(wonum: string, siteid: string): Promise<ApiResponse<any[]>> {
    logger.info('Retrieving work logs for work order', { wonum, siteid });

    try {
      // Build query parameters to include worklog child records
      const params: OSLCQueryParams = {
        'oslc.where': `wonum="${wonum}" and siteid="${siteid}"`,
        'oslc.select': 'wonum,siteid,worklog{*}',
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: any[] }>(
        API_ENDPOINTS.WORK_ORDERS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const workOrder = response.data.member[0];
        const worklogs = workOrder.worklog || [];

        logger.info('Work logs retrieved successfully', { wonum, siteid, count: worklogs.length });
        return {
          ...response,
          data: worklogs,
        };
      }

      // Work order not found
      return {
        success: false,
        error: `Work order ${wonum} not found in site ${siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve work logs', { wonum, siteid, error });
      throw error;
    }
  }

  /**
   * Close a work order (convenience method)
   * Validates that the work order is in COMP status before closing.
   * @param wonum - Work order number
   * @param siteid - Site identifier
   * @param memo - Optional close memo
   * @returns API response with updated work order
   */
  async close(
    wonum: string,
    siteid: string,
    memo?: string
  ): Promise<ApiResponse<WorkOrder>> {
    logger.info('Closing work order', { wonum, siteid });

    try {
      // Get current work order to validate status
      const getResponse = await this.get(wonum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const workOrder = getResponse.data;
      const currentStatus = workOrder.status;

      // Validate that work order is in COMP status (only COMP can transition to CLOSE)
      if (currentStatus !== 'COMP') {
        return {
          success: false,
          error: `Work order must be in COMP (Completed) status to close. Current status is ${currentStatus}.`,
          errorCode: 'VALIDATION_ERROR',
          statusCode: 400,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Delegate to changeStatus with CLOSE
      return await this.changeStatus(wonum, siteid, 'CLOSE', memo);
    } catch (error) {
      logger.error('Failed to close work order', { wonum, siteid, error });
      throw error;
    }
  }
}