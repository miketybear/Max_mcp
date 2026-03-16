/**
 * Admin Operations
 * Business logic for automation scripts, cron tasks, endpoints, and actions
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  AutomationScript,
  AutomationScriptCreate,
  AutomationScriptUpdate,
  AutomationScriptSearch,
  ScriptExecParams,
  ScriptExecResult,
} from './types';
import {
  autoscriptCreateSchema,
  autoscriptUpdateSchema,
  autoscriptSearchSchema,
  scriptExecSchema,
  crontaskSchema,
  endpointSchema,
  actionSchema,
  resourceSearchSchema,
} from './validators';

const logger = createLogger('AdminOperations');

/**
 * Admin Operations class
 */
export class AdminOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('AdminOperations initialized');
  }

  /**
   * Create/deploy a new automation script
   */
  async createAutoscript(data: AutomationScriptCreate): Promise<ApiResponse<AutomationScript>> {
    logger.info('Creating automation script', { autoscript: data.autoscript });

    try {
      const validated = autoscriptCreateSchema.parse(data);
      const response = await this.client.post<AutomationScript>(
        API_ENDPOINTS.AUTOSCRIPTS,
        validated
      );

      logger.info('Automation script created', { autoscript: data.autoscript });
      return response;
    } catch (error) {
      logger.error('Failed to create automation script', { error, autoscript: data.autoscript });
      throw error;
    }
  }

  /**
   * Get an automation script by ID
   */
  async getAutoscript(autoscript: string): Promise<ApiResponse<AutomationScript>> {
    logger.info('Getting automation script', { autoscript });

    try {
      const params: OSLCQueryParams = {
        'oslc.where': `autoscript="${autoscript}"`,
        'oslc.select': '*',
        'oslc.pageSize': 1,
        'lean': 1,
      };

      const response = await this.client.get<{ member: AutomationScript[] }>(
        API_ENDPOINTS.AUTOSCRIPTS,
        params
      );

      if (response.success && (response.data as any)?.member?.[0]) {
        return {
          ...response,
          data: (response.data as any).member[0],
        } as ApiResponse<AutomationScript>;
      }

      return {
        success: false,
        error: `Automation script not found: ${autoscript}`,
        statusCode: 404,
        headers: {},
        requestId: `autoscript-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get automation script', { error, autoscript });
      throw error;
    }
  }

  /**
   * Update an automation script (source code, status, etc.)
   */
  async updateAutoscript(id: string, data: AutomationScriptUpdate): Promise<ApiResponse<AutomationScript>> {
    logger.info('Updating automation script', { id });

    try {
      const validated = autoscriptUpdateSchema.parse(data);

      const response = await this.client.request<AutomationScript>({
        url: `${API_ENDPOINTS.AUTOSCRIPTS}/${id}`,
        method: 'POST',
        headers: { 'x-method-override': 'PATCH' },
        data: validated,
      });

      logger.info('Automation script updated', { id });
      return response;
    } catch (error) {
      logger.error('Failed to update automation script', { error, id });
      throw error;
    }
  }

  /**
   * Search automation scripts
   */
  async searchAutoscripts(criteria: AutomationScriptSearch): Promise<ApiResponse<AutomationScript[]>> {
    logger.info('Searching automation scripts', criteria);

    try {
      const validated = autoscriptSearchSchema.parse(criteria);

      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'lean': 1,
      };

      if (validated.select) {
        params['oslc.select'] = validated.select.join(',');
      } else {
        params['oslc.select'] = 'autoscript,description,scriptlanguage,status,active,loglevel';
      }

      const conditions: string[] = [];
      if (validated.where) {
        conditions.push(validated.where);
      } else {
        if (validated.autoscript) conditions.push(`autoscript="${validated.autoscript}"`);
        if (validated.scriptlanguage) conditions.push(`scriptlanguage="${validated.scriptlanguage}"`);
        if (validated.active !== undefined) conditions.push(`active=${validated.active ? 1 : 0}`);
        if (validated.status) conditions.push(`status="${validated.status}"`);
      }

      if (conditions.length > 0) {
        params['oslc.where'] = conditions.join(' and ');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      const response = await this.client.get<{ member: AutomationScript[] }>(
        API_ENDPOINTS.AUTOSCRIPTS,
        params
      );

      const scripts = (response.data as any)?.member || [];

      return {
        success: true,
        data: scripts,
        statusCode: 200,
        headers: response.headers,
        requestId: `autoscript-search-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to search automation scripts', { error });
      throw error;
    }
  }

  /**
   * Delete an automation script
   */
  async deleteAutoscript(id: string): Promise<ApiResponse<void>> {
    logger.info('Deleting automation script', { id });

    try {
      const response = await this.client.delete<void>(
        `${API_ENDPOINTS.AUTOSCRIPTS}/${id}`
      );

      logger.info('Automation script deleted', { id });
      return response;
    } catch (error) {
      logger.error('Failed to delete automation script', { error, id });
      throw error;
    }
  }

  /**
   * Execute an automation script by name
   */
  async executeScript(params: ScriptExecParams): Promise<ApiResponse<ScriptExecResult>> {
    logger.info('Executing script', { scriptName: params.scriptName });

    try {
      const validated = scriptExecSchema.parse(params);

      const response = await this.client.post<any>(
        `${API_ENDPOINTS.SCRIPT_EXEC}/${validated.scriptName}`,
        validated.params || {}
      );

      const result: ScriptExecResult = {
        success: response.success,
        output: response.data as Record<string, unknown>,
        error: response.error,
      };

      logger.info('Script execution completed', { scriptName: params.scriptName });

      return {
        success: true,
        data: result,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: `script-exec-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Script execution failed', { error, scriptName: params.scriptName });
      throw error;
    }
  }

  /**
   * Manage cron tasks (CRUD)
   */
  async manageCronTask(action: 'get' | 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing cron task', { action, id });

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

          return await this.client.get(API_ENDPOINTS.CRON_TASKS, params);
        }
        case 'get': {
          const params: OSLCQueryParams = {
            'oslc.where': `crontaskname="${id}"`,
            'oslc.select': '*',
            'oslc.pageSize': 1,
            'lean': 1,
          };
          return await this.client.get(API_ENDPOINTS.CRON_TASKS, params);
        }
        case 'create': {
          const validated = crontaskSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.CRON_TASKS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.CRON_TASKS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.CRON_TASKS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage cron task', { error, action });
      throw error;
    }
  }

  /**
   * Manage integration endpoints (CRUD)
   */
  async manageEndpoint(action: 'get' | 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing endpoint', { action, id });

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

          return await this.client.get(API_ENDPOINTS.ENDPOINTS_CONFIG, params);
        }
        case 'get': {
          const params: OSLCQueryParams = {
            'oslc.where': `endpointname="${id}"`,
            'oslc.select': '*',
            'oslc.pageSize': 1,
            'lean': 1,
          };
          return await this.client.get(API_ENDPOINTS.ENDPOINTS_CONFIG, params);
        }
        case 'create': {
          const validated = endpointSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.ENDPOINTS_CONFIG, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.ENDPOINTS_CONFIG}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.ENDPOINTS_CONFIG}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage endpoint', { error, action });
      throw error;
    }
  }

  /**
   * Manage custom actions (CRUD)
   */
  async manageAction(action: 'get' | 'list' | 'create' | 'update' | 'delete', data?: any, id?: string): Promise<ApiResponse<any>> {
    logger.info('Managing action', { action, id });

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

          return await this.client.get(API_ENDPOINTS.ACTIONS, params);
        }
        case 'get': {
          const params: OSLCQueryParams = {
            'oslc.where': `action="${id}"`,
            'oslc.select': '*',
            'oslc.pageSize': 1,
            'lean': 1,
          };
          return await this.client.get(API_ENDPOINTS.ACTIONS, params);
        }
        case 'create': {
          const validated = actionSchema.parse(data);
          return await this.client.post(API_ENDPOINTS.ACTIONS, validated);
        }
        case 'update': {
          return await this.client.request({
            url: `${API_ENDPOINTS.ACTIONS}/${id}`,
            method: 'POST',
            headers: { 'x-method-override': 'PATCH' },
            data,
          });
        }
        case 'delete': {
          return await this.client.delete(`${API_ENDPOINTS.ACTIONS}/${id}`);
        }
        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      logger.error('Failed to manage action', { error, action });
      throw error;
    }
  }
}
