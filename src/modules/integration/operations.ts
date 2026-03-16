/**
 * Integration/Dev Utilities Operations
 * Business logic for Maximo object structures, system properties, and measurement units
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  MaxObject,
  MaxObjectSearch,
  MaxVar,
  MaxVarSearch,
  MeasureUnit,
} from './types';
import {
  maxObjectSearchSchema,
  maxVarSearchSchema,
  maxVarUpdateSchema,
  measureUnitSchema,
  resourceSearchSchema,
} from './validators';

const logger = createLogger('IntegrationOperations');

/**
 * Integration Operations class
 */
export class IntegrationOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('IntegrationOperations initialized');
  }

  /**
   * Get a Maximo object structure definition
   */
  async getObjectStructure(objectname: string): Promise<ApiResponse<MaxObject>> {
    logger.info('Getting object structure', { objectname });

    try {
      const params: OSLCQueryParams = {
        'oslc.where': `objectname="${objectname}"`,
        'oslc.select': '*',
        'oslc.pageSize': 1,
        'lean': 1,
      };

      const response = await this.client.get<{ member: MaxObject[] }>(
        API_ENDPOINTS.MAX_OBJECTS,
        params
      );

      if (response.success && (response.data as any)?.member?.[0]) {
        return {
          ...response,
          data: (response.data as any).member[0],
        } as ApiResponse<MaxObject>;
      }

      return {
        success: false,
        error: `Object not found: ${objectname}`,
        statusCode: 404,
        headers: {},
        requestId: `maxobj-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get object structure', { error, objectname });
      throw error;
    }
  }

  /**
   * Search Maximo object definitions
   */
  async searchObjects(criteria: MaxObjectSearch): Promise<ApiResponse<MaxObject[]>> {
    logger.info('Searching objects', criteria);

    try {
      const validated = maxObjectSearchSchema.parse(criteria);

      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.select': validated.select || 'objectname,description,classname,persistent,module,maintbname',
        'lean': 1,
      };

      const conditions: string[] = [];
      if (validated.where) {
        conditions.push(validated.where);
      } else {
        if (validated.objectname) conditions.push(`objectname="${validated.objectname}"`);
        if (validated.module) conditions.push(`module="${validated.module}"`);
        if (validated.persistent !== undefined) conditions.push(`persistent=${validated.persistent ? 1 : 0}`);
      }

      if (conditions.length > 0) {
        params['oslc.where'] = conditions.join(' and ');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      const response = await this.client.get<{ member: MaxObject[] }>(
        API_ENDPOINTS.MAX_OBJECTS,
        params
      );

      const objects = (response.data as any)?.member || [];

      return {
        success: true,
        data: objects,
        statusCode: 200,
        headers: response.headers,
        requestId: `maxobj-search-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to search objects', { error });
      throw error;
    }
  }

  /**
   * Get system properties (maxvars)
   */
  async getSystemProperties(criteria?: MaxVarSearch): Promise<ApiResponse<MaxVar[]>> {
    logger.info('Getting system properties', criteria);

    try {
      const validated = maxVarSearchSchema.parse(criteria || {});

      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.select': validated.select || '*',
        'lean': 1,
      };

      const conditions: string[] = [];
      if (validated.where) {
        conditions.push(validated.where);
      } else {
        if (validated.varname) conditions.push(`varname="${validated.varname}"`);
        if (validated.vartype) conditions.push(`vartype="${validated.vartype}"`);
      }

      if (conditions.length > 0) {
        params['oslc.where'] = conditions.join(' and ');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      const response = await this.client.get<{ member: MaxVar[] }>(
        API_ENDPOINTS.MAX_VARS,
        params
      );

      const vars = (response.data as any)?.member || [];

      return {
        success: true,
        data: vars,
        statusCode: 200,
        headers: response.headers,
        requestId: `maxvar-search-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get system properties', { error });
      throw error;
    }
  }

  /**
   * Update a system property
   */
  async updateSystemProperty(id: string, data: { varvalue?: string; description?: string }): Promise<ApiResponse<MaxVar>> {
    logger.info('Updating system property', { id });

    try {
      const validated = maxVarUpdateSchema.parse(data);

      const response = await this.client.request<MaxVar>({
        url: `${API_ENDPOINTS.MAX_VARS}/${id}`,
        method: 'POST',
        headers: { 'x-method-override': 'PATCH' },
        data: validated,
      });

      logger.info('System property updated', { id });
      return response;
    } catch (error) {
      logger.error('Failed to update system property', { error, id });
      throw error;
    }
  }

  /**
   * Get measurement units
   */
  async getMeasureUnits(criteria?: { where?: string; pageSize?: number; orderBy?: string }): Promise<ApiResponse<MeasureUnit[]>> {
    logger.info('Getting measurement units');

    try {
      const validated = resourceSearchSchema.parse(criteria || {});

      const params: OSLCQueryParams = {
        'oslc.select': '*',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'lean': 1,
      };

      if (validated.where) params['oslc.where'] = validated.where;
      if (validated.orderBy) params['oslc.orderBy'] = validated.orderBy;

      const response = await this.client.get<{ member: MeasureUnit[] }>(
        API_ENDPOINTS.MEASURE_UNITS,
        params
      );

      const units = (response.data as any)?.member || [];

      return {
        success: true,
        data: units,
        statusCode: 200,
        headers: response.headers,
        requestId: `measureunit-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get measurement units', { error });
      throw error;
    }
  }

  /**
   * Manage measurement units (CRUD)
   */
  async manageMeasureUnit(action: 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing measurement unit', { action });

    try {
      switch (action) {
        case 'list': {
          return await this.getMeasureUnits(data);
        }
        case 'create': {
          const validated = measureUnitSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.MEASURE_UNITS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.MEASURE_UNITS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.MEASURE_UNITS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage measurement unit', { error, action });
      throw error;
    }
  }
}
