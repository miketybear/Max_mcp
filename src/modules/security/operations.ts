/**
 * Security Operations
 * Business logic for security groups and user-group management
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  SecurityGroup,
  SecurityGroupCreate,
  SecurityGroupUpdate,
  SecurityGroupSearch,
  GroupUser,
} from './types';
import {
  securityGroupCreateSchema,
  securityGroupUpdateSchema,
  securityGroupSearchSchema,
  userGroupAssignmentSchema,
  groupIdSchema,
  userGroupsSchema,
} from './validators';

const logger = createLogger('SecurityOperations');

/**
 * Security Operations class
 */
export class SecurityOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('SecurityOperations initialized');
  }

  /**
   * Create a new security group
   */
  async createGroup(data: SecurityGroupCreate): Promise<ApiResponse<SecurityGroup>> {
    logger.info('Creating security group', { groupname: data.groupname });

    try {
      const validated = securityGroupCreateSchema.parse(data);
      const response = await this.client.post<SecurityGroup>(
        API_ENDPOINTS.SECURITY_GROUPS,
        validated
      );

      logger.info('Security group created', { groupname: data.groupname });
      return response;
    } catch (error) {
      logger.error('Failed to create security group', { error, groupname: data.groupname });
      throw error;
    }
  }

  /**
   * Get a security group by ID
   */
  async getGroup(groupname: string): Promise<ApiResponse<SecurityGroup>> {
    logger.info('Getting security group', { groupname });

    try {
      groupIdSchema.parse({ groupname });

      const params: OSLCQueryParams = {
        'oslc.where': `groupname="${groupname}"`,
        'oslc.select': '*',
        'oslc.pageSize': 1,
        'lean': 1,
      };

      const response = await this.client.get<{ member: SecurityGroup[] }>(
        API_ENDPOINTS.SECURITY_GROUPS,
        params
      );

      if (response.success && (response.data as any)?.member?.[0]) {
        return {
          ...response,
          data: (response.data as any).member[0],
        } as ApiResponse<SecurityGroup>;
      }

      return {
        success: false,
        error: `Security group not found: ${groupname}`,
        statusCode: 404,
        headers: {},
        requestId: `sec-group-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get security group', { error, groupname });
      throw error;
    }
  }

  /**
   * Search security groups
   */
  async searchGroups(criteria: SecurityGroupSearch): Promise<ApiResponse<SecurityGroup[]>> {
    logger.info('Searching security groups', criteria);

    try {
      const validated = securityGroupSearchSchema.parse(criteria);

      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'lean': 1,
      };

      if (validated.select) {
        params['oslc.select'] = validated.select.join(',');
      } else {
        params['oslc.select'] = '*';
      }

      // Build where clause
      const conditions: string[] = [];
      if (validated.where) {
        conditions.push(validated.where);
      } else {
        if (validated.groupname) conditions.push(`groupname="${validated.groupname}"`);
        if (validated.active !== undefined) conditions.push(`active=${validated.active ? 1 : 0}`);
        if (validated.siteid) conditions.push(`siteid="${validated.siteid}"`);
        if (validated.orgid) conditions.push(`orgid="${validated.orgid}"`);
      }

      if (conditions.length > 0) {
        params['oslc.where'] = conditions.join(' and ');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      const response = await this.client.get<{ member: SecurityGroup[] }>(
        API_ENDPOINTS.SECURITY_GROUPS,
        params
      );

      const groups = (response.data as any)?.member || [];

      return {
        success: true,
        data: groups,
        statusCode: 200,
        headers: response.headers,
        requestId: `sec-search-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to search security groups', { error });
      throw error;
    }
  }

  /**
   * Update a security group
   */
  async updateGroup(id: string, data: SecurityGroupUpdate): Promise<ApiResponse<SecurityGroup>> {
    logger.info('Updating security group', { id });

    try {
      const validated = securityGroupUpdateSchema.parse(data);

      const response = await this.client.request<SecurityGroup>({
        url: `${API_ENDPOINTS.SECURITY_GROUPS}/${id}`,
        method: 'POST',
        headers: { 'x-method-override': 'PATCH' },
        data: validated,
      });

      logger.info('Security group updated', { id });
      return response;
    } catch (error) {
      logger.error('Failed to update security group', { error, id });
      throw error;
    }
  }

  /**
   * Delete a security group
   */
  async deleteGroup(id: string): Promise<ApiResponse<void>> {
    logger.info('Deleting security group', { id });

    try {
      const response = await this.client.delete<void>(
        `${API_ENDPOINTS.SECURITY_GROUPS}/${id}`
      );

      logger.info('Security group deleted', { id });
      return response;
    } catch (error) {
      logger.error('Failed to delete security group', { error, id });
      throw error;
    }
  }

  /**
   * Assign a user to a security group
   */
  async assignUserToGroup(personid: string, groupname: string, siteid?: string): Promise<ApiResponse<any>> {
    logger.info('Assigning user to group', { personid, groupname });

    try {
      userGroupAssignmentSchema.parse({ personid, groupname, siteid });

      const response = await this.client.post(
        `${API_ENDPOINTS.SECURITY_GROUPS}`,
        {
          groupname,
          groupuser: [{ personid }],
        }
      );

      logger.info('User assigned to group', { personid, groupname });
      return response;
    } catch (error) {
      logger.error('Failed to assign user to group', { error, personid, groupname });
      throw error;
    }
  }

  /**
   * Get users in a security group
   */
  async getGroupUsers(groupname: string): Promise<ApiResponse<GroupUser[]>> {
    logger.info('Getting group users', { groupname });

    try {
      groupIdSchema.parse({ groupname });

      const params: OSLCQueryParams = {
        'oslc.where': `groupname="${groupname}"`,
        'oslc.select': 'groupname,groupuser{personid,displayname}',
        'oslc.pageSize': 1,
        'lean': 1,
      };

      const response = await this.client.get<any>(
        API_ENDPOINTS.SECURITY_GROUPS,
        params
      );

      const group = (response.data as any)?.member?.[0];
      const users: GroupUser[] = group?.groupuser || [];

      return {
        success: true,
        data: users,
        statusCode: 200,
        headers: response.headers,
        requestId: `group-users-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get group users', { error, groupname });
      throw error;
    }
  }

  /**
   * Get security groups for a user
   */
  async getUserGroups(personid: string): Promise<ApiResponse<SecurityGroup[]>> {
    logger.info('Getting user groups', { personid });

    try {
      userGroupsSchema.parse({ personid });

      const params: OSLCQueryParams = {
        'oslc.where': `groupuser.personid="${personid}"`,
        'oslc.select': '*',
        'oslc.pageSize': 100,
        'lean': 1,
      };

      const response = await this.client.get<{ member: SecurityGroup[] }>(
        API_ENDPOINTS.SECURITY_GROUPS,
        params
      );

      const groups = (response.data as any)?.member || [];

      return {
        success: true,
        data: groups,
        statusCode: 200,
        headers: response.headers,
        requestId: `user-groups-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to get user groups', { error, personid });
      throw error;
    }
  }
}
