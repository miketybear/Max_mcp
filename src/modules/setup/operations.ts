/**
 * Setup Operations
 * Business logic for domain management, document types, and configuration
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  Domain,
  DomainCreate,
  DomainSearch,
} from './types';
import {
  domainCreateSchema,
  domainSearchSchema,
  alnDomainValueSchema,
  tableDomainValueSchema,
  synonymDomainValueSchema,
  docTypeSchema,
  resourceSearchSchema,
} from './validators';

const logger = createLogger('SetupOperations');

/**
 * Setup Operations class
 */
export class SetupOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('SetupOperations initialized');
  }

  /**
   * Create a new domain
   */
  async createDomain(data: DomainCreate): Promise<ApiResponse<Domain>> {
    logger.info('Creating domain', { domainid: data.domainid });

    try {
      const validated = domainCreateSchema.parse(data);
      const response = await this.client.post<Domain>(
        API_ENDPOINTS.DOMAINS,
        validated
      );

      logger.info('Domain created', { domainid: data.domainid });
      return response;
    } catch (error) {
      logger.error('Failed to create domain', { error, domainid: data.domainid });
      throw error;
    }
  }

  /**
   * Get a domain by ID
   */
  async getDomain(domainid: string): Promise<ApiResponse<Domain>> {
    logger.info('Getting domain', { domainid });

    try {
      const params: OSLCQueryParams = {
        'oslc.where': `domainid="${domainid}"`,
        'oslc.select': '*',
        'oslc.pageSize': 1,
        'lean': 1,
      };

      const response = await this.client.get<{ member: Domain[] }>(
        API_ENDPOINTS.DOMAINS,
        params
      );

      if (response.success && (response.data as any)?.member?.[0]) {
        return {
          ...response,
          data: (response.data as any).member[0],
        } as ApiResponse<Domain>;
      }

      return {
        success: false,
        error: `Domain not found: ${domainid}`,
        statusCode: 404,
        headers: {},
        requestId: `domain-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get domain', { error, domainid });
      throw error;
    }
  }

  /**
   * Search domains
   */
  async searchDomains(criteria: DomainSearch): Promise<ApiResponse<Domain[]>> {
    logger.info('Searching domains', criteria);

    try {
      const validated = domainSearchSchema.parse(criteria);

      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.select': validated.select || '*',
        'lean': 1,
      };

      const conditions: string[] = [];
      if (validated.where) {
        conditions.push(validated.where);
      } else {
        if (validated.domainid) conditions.push(`domainid="${validated.domainid}"`);
        if (validated.domaintype) conditions.push(`domaintype="${validated.domaintype}"`);
      }

      if (conditions.length > 0) {
        params['oslc.where'] = conditions.join(' and ');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      const response = await this.client.get<{ member: Domain[] }>(
        API_ENDPOINTS.DOMAINS,
        params
      );

      const domains = (response.data as any)?.member || [];

      return {
        success: true,
        data: domains,
        statusCode: 200,
        headers: response.headers,
        requestId: `domain-search-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to search domains', { error });
      throw error;
    }
  }

  /**
   * Update a domain
   */
  async updateDomain(id: string, data: Partial<DomainCreate>): Promise<ApiResponse<Domain>> {
    logger.info('Updating domain', { id });

    try {
      const response = await this.client.request<Domain>({
        url: `${API_ENDPOINTS.DOMAINS}/${id}`,
        method: 'POST',
        headers: { 'x-method-override': 'PATCH' },
        data,
      });

      logger.info('Domain updated', { id });
      return response;
    } catch (error) {
      logger.error('Failed to update domain', { error, id });
      throw error;
    }
  }

  /**
   * Delete a domain
   */
  async deleteDomain(id: string): Promise<ApiResponse<void>> {
    logger.info('Deleting domain', { id });

    try {
      const response = await this.client.delete<void>(
        `${API_ENDPOINTS.DOMAINS}/${id}`
      );

      logger.info('Domain deleted', { id });
      return response;
    } catch (error) {
      logger.error('Failed to delete domain', { error, id });
      throw error;
    }
  }

  /**
   * Manage ALN domain values (CRUD)
   */
  async manageAlnDomain(action: 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing ALN domain', { action });

    try {
      switch (action) {
        case 'list': {
          const searchParams = resourceSearchSchema.parse(data || {});
          const params: OSLCQueryParams = {
            'oslc.select': searchParams.select || '*',
            'oslc.pageSize': searchParams.pageSize || DEFAULT_PAGE_SIZE,
            'lean': 1,
          };
          if (searchParams.where) params['oslc.where'] = searchParams.where;
          if (searchParams.orderBy) params['oslc.orderBy'] = searchParams.orderBy;
          return await this.client.get(API_ENDPOINTS.ALN_DOMAINS, params);
        }
        case 'create': {
          const validated = alnDomainValueSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.ALN_DOMAINS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.ALN_DOMAINS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.ALN_DOMAINS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage ALN domain', { error, action });
      throw error;
    }
  }

  /**
   * Manage table domain values (CRUD)
   */
  async manageTableDomain(action: 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing table domain', { action });

    try {
      switch (action) {
        case 'list': {
          const searchParams = resourceSearchSchema.parse(data || {});
          const params: OSLCQueryParams = {
            'oslc.select': searchParams.select || '*',
            'oslc.pageSize': searchParams.pageSize || DEFAULT_PAGE_SIZE,
            'lean': 1,
          };
          if (searchParams.where) params['oslc.where'] = searchParams.where;
          if (searchParams.orderBy) params['oslc.orderBy'] = searchParams.orderBy;
          return await this.client.get(API_ENDPOINTS.TABLE_DOMAINS, params);
        }
        case 'create': {
          const validated = tableDomainValueSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.TABLE_DOMAINS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.TABLE_DOMAINS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.TABLE_DOMAINS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage table domain', { error, action });
      throw error;
    }
  }

  /**
   * Manage synonym domain values (CRUD)
   */
  async manageSynonymDomain(action: 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing synonym domain', { action });

    try {
      switch (action) {
        case 'list': {
          const searchParams = resourceSearchSchema.parse(data || {});
          const params: OSLCQueryParams = {
            'oslc.select': searchParams.select || '*',
            'oslc.pageSize': searchParams.pageSize || DEFAULT_PAGE_SIZE,
            'lean': 1,
          };
          if (searchParams.where) params['oslc.where'] = searchParams.where;
          if (searchParams.orderBy) params['oslc.orderBy'] = searchParams.orderBy;
          return await this.client.get(API_ENDPOINTS.SYNONYM_DOMAINS, params);
        }
        case 'create': {
          const validated = synonymDomainValueSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.SYNONYM_DOMAINS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.SYNONYM_DOMAINS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.SYNONYM_DOMAINS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage synonym domain', { error, action });
      throw error;
    }
  }

  /**
   * Manage document types (CRUD)
   */
  async manageDocType(action: 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing doc type', { action });

    try {
      switch (action) {
        case 'list': {
          const searchParams = resourceSearchSchema.parse(data || {});
          const params: OSLCQueryParams = {
            'oslc.select': searchParams.select || '*',
            'oslc.pageSize': searchParams.pageSize || DEFAULT_PAGE_SIZE,
            'lean': 1,
          };
          if (searchParams.where) params['oslc.where'] = searchParams.where;
          if (searchParams.orderBy) params['oslc.orderBy'] = searchParams.orderBy;
          return await this.client.get(API_ENDPOINTS.DOC_TYPES, params);
        }
        case 'create': {
          const validated = docTypeSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.DOC_TYPES, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.DOC_TYPES}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.DOC_TYPES}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage doc type', { error, action });
      throw error;
    }
  }
}
