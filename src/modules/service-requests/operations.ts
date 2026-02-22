/**
 * Service Request Operations
 * Business logic for service request management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  ServiceRequest,
  ServiceRequestCreate,
  ServiceRequestUpdate,
  ServiceRequestSearch,
  StatusChangeRequest,
  WorkOrderConversionRequest,
  ServiceRequestListResponse,
  WorkOrderConversionResult,
  SRWorkLog,
  SRAssignRequest,
  SREscalateRequest,
  SRSolutionRequest,
  SRRelatedWorkOrdersResponse,
} from './types';
import {
  serviceRequestCreateSchema,
  serviceRequestUpdateSchema,
  serviceRequestSearchSchema,
  statusChangeSchema,
  workOrderConversionSchema,
  validateStatusTransition,
  srWorkLogSchema,
  srAssignSchema,
  srEscalateSchema,
  srSolutionSchema,
} from './validators';
import { ValidationError } from '../../core/types';

const logger = createLogger('ServiceRequestOperations');

/**
 * Service Request Operations class
 * Provides methods for managing service requests in Maximo
 */
export class ServiceRequestOperations {
  private client: MaximoClient;

  /**
   * Create a new ServiceRequestOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('ServiceRequestOperations initialized');
  }

  /**
   * Create a new service request
   * @param data - Service request creation data
   * @returns API response with created service request
   */
  async create(data: ServiceRequestCreate): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Creating service request', { siteid: data.siteid, reportedby: data.reportedby });

    try {
      // Validate input
      const validated = serviceRequestCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<ServiceRequest>(
        API_ENDPOINTS.SERVICE_REQUESTS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Service request created successfully', {
          ticketid: response.data.ticketid,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create service request', { error });
      throw error;
    }
  }

  /**
   * Get service request by ticket ID
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @returns API response with service request data
   */
  async get(ticketid: string, siteid: string): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Retrieving service request', { ticketid, siteid });

    try {
      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `ticketid="${ticketid}" and siteid="${siteid}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: ServiceRequest[] }>(
        API_ENDPOINTS.SERVICE_REQUESTS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Service request retrieved successfully', { ticketid, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // Service request not found
      return {
        success: false,
        error: `Service request ${ticketid} not found in site ${siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Update service request
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param data - Update data
   * @returns API response with updated service request
   */
  async update(
    ticketid: string,
    siteid: string,
    data: ServiceRequestUpdate
  ): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Updating service request', { ticketid, siteid });

    try {
      // Validate input
      const validated = serviceRequestUpdateSchema.parse(data);

      // First, get the service request to get its href
      const getResponse = await this.get(ticketid, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const serviceRequest = getResponse.data;
      if (!serviceRequest.href) {
        throw new ValidationError('Service request href not found');
      }

      // Validate status transition if status is being changed
      if (validated.status && validated.status !== serviceRequest.status) {
        if (!validateStatusTransition(serviceRequest.status, validated.status)) {
          throw new ValidationError(
            `Invalid status transition from ${serviceRequest.status} to ${validated.status}`
          );
        }
      }

      // Make API request to update
      const response = await this.client.patch<ServiceRequest>(serviceRequest.href, validated);

      if (response.success) {
        logger.info('Service request updated successfully', { ticketid, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Delete service request
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @returns API response
   */
  async delete(ticketid: string, siteid: string): Promise<ApiResponse<void>> {
    logger.info('Deleting service request', { ticketid, siteid });

    try {
      // First, get the service request to get its href
      const getResponse = await this.get(ticketid, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse as ApiResponse<void>;
      }

      const serviceRequest = getResponse.data;
      if (!serviceRequest.href) {
        throw new ValidationError('Service request href not found');
      }

      // Make API request to delete
      const response = await this.client.delete<void>(serviceRequest.href);

      if (response.success) {
        logger.info('Service request deleted successfully', { ticketid, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Change service request status
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param newStatus - New status
   * @param memo - Optional status change memo
   * @returns API response with updated service request
   */
  async changeStatus(
    ticketid: string,
    siteid: string,
    newStatus: string,
    memo?: string
  ): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Changing service request status', { ticketid, siteid, newStatus });

    try {
      // Build status change request
      const statusChange: StatusChangeRequest = {
        status: newStatus as any,
        memo,
        statusdate: new Date().toISOString(),
      };

      // Validate status change
      const validated = statusChangeSchema.parse(statusChange);

      // Get current service request
      const getResponse = await this.get(ticketid, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const serviceRequest = getResponse.data;

      // Validate status transition
      if (!validateStatusTransition(serviceRequest.status, validated.status)) {
        throw new ValidationError(
          `Invalid status transition from ${serviceRequest.status} to ${validated.status}`
        );
      }

      // Update service request with new status
      const updateData: ServiceRequestUpdate = {
        status: validated.status,
        statusdate: validated.statusdate,
      };

      // Add resolution fields if provided
      if (validated.resolutioncode) {
        updateData.resolutioncode = validated.resolutioncode;
      }
      if (validated.solution) {
        updateData.solution = validated.solution;
      }

      // Set resolved/closed dates
      if (validated.status === 'RESOLVED') {
        updateData.actfinish = validated.statusdate;
      } else if (validated.status === 'CLOSED') {
        updateData.actfinish = validated.statusdate;
      }

      const response = await this.update(ticketid, siteid, updateData);

      if (response.success) {
        logger.info('Service request status changed successfully', {
          ticketid,
          siteid,
          oldStatus: serviceRequest.status,
          newStatus: validated.status,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to change service request status', { ticketid, siteid, newStatus, error });
      throw error;
    }
  }

  /**
   * Convert service request to work order
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param worktype - Work type for the new work order
   * @returns API response with work order conversion result
   */
  async convertToWorkOrder(
    ticketid: string,
    siteid: string,
    worktype?: string
  ): Promise<ApiResponse<WorkOrderConversionResult>> {
    logger.info('Converting service request to work order', { ticketid, siteid, worktype });

    try {
      // Get the service request
      const getResponse = await this.get(ticketid, siteid);
      if (!getResponse.success || !getResponse.data) {
        return {
          ...getResponse,
          data: {
            success: false,
            error: getResponse.error,
            errorCode: getResponse.errorCode,
          },
        } as ApiResponse<WorkOrderConversionResult>;
      }

      const serviceRequest = getResponse.data;

      // Build work order conversion request
      const conversionRequest: WorkOrderConversionRequest = {
        worktype: worktype || 'CM', // Default to Corrective Maintenance
        description: serviceRequest.description,
        priority: serviceRequest.reportedpriority,
        owner: serviceRequest.owner,
        ownergroup: serviceRequest.ownergroup,
      };

      // Validate conversion request
      const validated = workOrderConversionSchema.parse(conversionRequest);

      // Prepare work order creation data
      const workOrderData = {
        description: validated.description || serviceRequest.description,
        siteid: serviceRequest.siteid,
        orgid: serviceRequest.orgid,
        worktype: validated.worktype || 'CM',
        assetnum: serviceRequest.assetnum,
        location: serviceRequest.location,
        priority: validated.priority || serviceRequest.reportedpriority,
        reportedby: serviceRequest.reportedby,
        owner: validated.owner || serviceRequest.owner,
        ownergroup: validated.ownergroup || serviceRequest.ownergroup,
        schedstart: validated.schedstart,
        schedfinish: validated.schedfinish,
        // Link back to service request
        externalrefid: serviceRequest.ticketid,
      };

      // Create work order via work orders endpoint
      const woResponse = await this.client.post<any>(
        API_ENDPOINTS.WORK_ORDERS,
        workOrderData
      );

      if (!woResponse.success || !woResponse.data) {
        return {
          ...woResponse,
          data: {
            success: false,
            error: woResponse.error || 'Failed to create work order',
            errorCode: woResponse.errorCode,
          },
        } as ApiResponse<WorkOrderConversionResult>;
      }

      const workOrder = woResponse.data;

      // Update service request with related work order number
      const updateResponse = await this.update(ticketid, siteid, {
        relatedwonum: workOrder.wonum,
      });

      const result: WorkOrderConversionResult = {
        success: true,
        wonum: workOrder.wonum,
        workOrder: workOrder,
        serviceRequest: updateResponse.data,
      };

      logger.info('Service request converted to work order successfully', {
        ticketid,
        siteid,
        wonum: workOrder.wonum,
      });

      return {
        success: true,
        data: result,
        statusCode: 201,
        headers: woResponse.headers,
        requestId: woResponse.requestId,
      };
    } catch (error) {
      logger.error('Failed to convert service request to work order', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Search service requests with filters
   * @param criteria - Search criteria
   * @returns API response with list of service requests
   */
  async search(criteria: ServiceRequestSearch): Promise<ApiResponse<ServiceRequestListResponse>> {
    logger.info('Searching service requests', { criteria });

    try {
      // Validate search criteria
      const validated = serviceRequestSearchSchema.parse(criteria);

      // Build OSLC query parameters
      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      // Build where clause
      const whereClauses: string[] = [];

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s) => `"${s}"`).join(',');
          whereClauses.push(`status in [${statusList}]`);
        } else {
          whereClauses.push(`status="${validated.status}"`);
        }
      }

      if (validated.reportedby) {
        whereClauses.push(`reportedby="${validated.reportedby}"`);
      }

      if (validated.affectedperson) {
        whereClauses.push(`affectedperson="${validated.affectedperson}"`);
      }

      if (validated.assetnum) {
        whereClauses.push(`assetnum="${validated.assetnum}"`);
      }

      if (validated.location) {
        whereClauses.push(`location="${validated.location}"`);
      }

      if (validated.reportedpriority !== undefined) {
        whereClauses.push(`reportedpriority=${validated.reportedpriority}`);
      }

      if (validated.owner) {
        whereClauses.push(`owner="${validated.owner}"`);
      }

      if (validated.ownergroup) {
        whereClauses.push(`ownergroup="${validated.ownergroup}"`);
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.orgid) {
        whereClauses.push(`orgid="${validated.orgid}"`);
      }

      if (validated.classstructureid) {
        whereClauses.push(`classstructureid="${validated.classstructureid}"`);
      }

      if (validated.commodity) {
        whereClauses.push(`commodity="${validated.commodity}"`);
      }

      if (validated.commoditygroup) {
        whereClauses.push(`commoditygroup="${validated.commoditygroup}"`);
      }

      if (validated.tickettype) {
        whereClauses.push(`tickettype="${validated.tickettype}"`);
      }

      if (validated.relatedwonum) {
        whereClauses.push(`relatedwonum="${validated.relatedwonum}"`);
      }

      // Add date range filter
      if (validated.dateRange) {
        const field = validated.dateRange.field || 'reportdate';
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

      // Make API request
      const response = await this.client.get<{ member: ServiceRequest[]; responseInfo?: any }>(
        API_ENDPOINTS.SERVICE_REQUESTS,
        params
      );

      if (response.success && response.data) {
        const serviceRequests = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || serviceRequests.length;
        const pageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const page = validated.page || 1;
        const totalPages = Math.ceil(totalCount / pageSize);

        const listResponse: ServiceRequestListResponse = {
          serviceRequests,
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        };

        logger.info('Service requests search completed', {
          count: serviceRequests.length,
          totalCount,
          page,
        });

        return {
          ...response,
          data: listResponse,
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
      logger.error('Failed to search service requests', { criteria, error });
      throw error;
    }
  }

  /**
   * Add work log entry to a service request
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param worklog - Work log data
   * @returns API response
   */
  async addWorkLog(
    ticketid: string,
    siteid: string,
    worklog: SRWorkLog
  ): Promise<ApiResponse<any>> {
    logger.info('Adding work log entry to service request', { ticketid, siteid });

    try {
      // Validate input
      const validated = srWorkLogSchema.parse({ ticketid, siteid, ...worklog });

      // Get service request to verify it exists
      const getResponse = await this.get(ticketid, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const serviceRequest = getResponse.data;
      if (!serviceRequest.href) {
        throw new ValidationError('Service request href not found');
      }

      // Build work log endpoint (child collection)
      const worklogEndpoint = `${serviceRequest.href}/WORKLOG`;

      // Prepare work log data
      const worklogData = {
        description: validated.description,
        logtype: validated.logtype || 'CLIENTNOTE',
        description_longdescription: validated.description_longdescription,
        createdate: validated.createdate,
        createby: validated.createby,
        clientviewable: validated.clientviewable,
        class: validated.class,
      };

      // Make API request
      const response = await this.client.post<any>(worklogEndpoint, worklogData);

      if (response.success) {
        logger.info('Work log entry added to service request successfully', { ticketid, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add work log entry to service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Assign service request to a person or group
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param assignment - Assignment data (owner and optional ownergroup)
   * @returns API response with updated service request
   */
  async assign(
    ticketid: string,
    siteid: string,
    assignment: SRAssignRequest
  ): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Assigning service request', { ticketid, siteid, owner: assignment.owner });

    try {
      // Validate input
      const validated = srAssignSchema.parse({ ticketid, siteid, ...assignment });

      // Build update data with owner fields
      const updateData: ServiceRequestUpdate = {
        owner: validated.owner,
      };

      if (validated.ownergroup) {
        updateData.ownergroup = validated.ownergroup;
      }

      // Use existing update method
      const response = await this.update(ticketid, siteid, updateData);

      if (response.success) {
        logger.info('Service request assigned successfully', {
          ticketid,
          siteid,
          owner: validated.owner,
          ownergroup: validated.ownergroup,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to assign service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Escalate service request priority
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param escalation - Escalation data
   * @returns API response with updated service request
   */
  async escalate(
    ticketid: string,
    siteid: string,
    escalation: SREscalateRequest
  ): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Escalating service request', { ticketid, siteid, newPriority: escalation.newPriority });

    try {
      // Validate input
      const validated = srEscalateSchema.parse({ ticketid, siteid, ...escalation });

      // Build update data with new priority
      const updateData: ServiceRequestUpdate = {
        reportedpriority: validated.newPriority,
      };

      // Update owner group if provided for escalation routing
      if (validated.newOwnerGroup) {
        updateData.ownergroup = validated.newOwnerGroup;
      }

      // Update the service request with new priority (and optionally new owner group)
      const response = await this.update(ticketid, siteid, updateData);

      if (!response.success) {
        return response;
      }

      // Add escalation reason as a work log entry
      const worklogData: SRWorkLog = {
        description: `Escalation: Priority changed to ${validated.newPriority}`,
        logtype: 'WORK',
        description_longdescription: validated.escalationReason,
      };

      await this.addWorkLog(ticketid, siteid, worklogData);

      logger.info('Service request escalated successfully', {
        ticketid,
        siteid,
        newPriority: validated.newPriority,
        newOwnerGroup: validated.newOwnerGroup,
      });

      return response;
    } catch (error) {
      logger.error('Failed to escalate service request', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Get related work orders for a service request
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @returns API response with related work orders
   */
  async getRelatedWorkOrders(
    ticketid: string,
    siteid: string
  ): Promise<ApiResponse<SRRelatedWorkOrdersResponse>> {
    logger.info('Getting related work orders for service request', { ticketid, siteid });

    try {
      // Query work orders where origrecordid matches the ticket ID
      const params: OSLCQueryParams = {
        'oslc.where': `origrecordid="${ticketid}" and siteid="${siteid}"`,
        'oslc.select': '*',
      };

      const response = await this.client.get<{ member: any[]; responseInfo?: any }>(
        API_ENDPOINTS.WORK_ORDERS,
        params
      );

      if (response.success && response.data) {
        const workOrders = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || workOrders.length;

        const result: SRRelatedWorkOrdersResponse = {
          workOrders,
          totalCount,
          ticketid,
          siteid,
        };

        logger.info('Related work orders retrieved successfully', {
          ticketid,
          siteid,
          count: workOrders.length,
        });

        return {
          ...response,
          data: result,
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
      logger.error('Failed to get related work orders', { ticketid, siteid, error });
      throw error;
    }
  }

  /**
   * Add solution to a service request
   * @param ticketid - Service request ticket ID
   * @param siteid - Site identifier
   * @param solution - Solution data
   * @returns API response with updated service request
   */
  async addSolution(
    ticketid: string,
    siteid: string,
    solution: SRSolutionRequest
  ): Promise<ApiResponse<ServiceRequest>> {
    logger.info('Adding solution to service request', { ticketid, siteid, autoResolve: solution.autoResolve });

    try {
      // Validate input
      const validated = srSolutionSchema.parse({ ticketid, siteid, ...solution });

      // Build update data with solution
      const updateData: ServiceRequestUpdate = {
        solution: validated.solution,
      };

      // If autoResolve is true, also change status to RESOLVED
      if (validated.autoResolve) {
        updateData.status = 'RESOLVED';
        updateData.actfinish = new Date().toISOString();
      }

      // Update the service request
      const response = await this.update(ticketid, siteid, updateData);

      if (response.success) {
        logger.info('Solution added to service request successfully', {
          ticketid,
          siteid,
          autoResolve: validated.autoResolve,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add solution to service request', { ticketid, siteid, error });
      throw error;
    }
  }
}