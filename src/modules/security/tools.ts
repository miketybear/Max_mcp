/**
 * MCP Tools for Security Module
 * Defines 8 MCP tools for security group management
 */

import { SecurityOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SecurityTools');

/**
 * Create MCP tools for security operations
 */
export function createSecurityTools(operations: SecurityOperations) {
  return [
    // Tool 1: Create Security Group
    {
      name: 'maximo_create_security_group',
      description:
        'Create a new security group in Maximo. Security groups control access to applications, sites, and data. Requires groupname.',
      inputSchema: {
        type: 'object',
        properties: {
          groupname: {
            type: 'string',
            description: 'Unique security group name (max 30 chars)',
          },
          description: {
            type: 'string',
            description: 'Group description',
          },
          active: {
            type: 'boolean',
            description: 'Whether the group is active (default: true)',
          },
          independent: {
            type: 'boolean',
            description: 'Whether access is independent of other groups',
          },
          siteid: {
            type: 'string',
            description: 'Site ID restriction for site-level security',
          },
          orgid: {
            type: 'string',
            description: 'Organization ID',
          },
          dfltapp: {
            type: 'string',
            description: 'Default starting application for users in this group',
          },
        },
        required: ['groupname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Creating security group', { groupname: args.groupname });
          const result = await operations.createGroup(args);
          return {
            success: result.success,
            data: result.data,
            message: `Security group '${args.groupname}' created successfully`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Create security group error', { error });
          throw error;
        }
      },
    },

    // Tool 2: Get Security Group
    {
      name: 'maximo_get_security_group',
      description:
        'Retrieve a security group by name. Returns group details including description, status, and configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          groupname: {
            type: 'string',
            description: 'Security group name to retrieve',
          },
        },
        required: ['groupname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting security group', { groupname: args.groupname });
          const result = await operations.getGroup(args.groupname);
          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? `Security group '${args.groupname}' retrieved`
              : `Security group '${args.groupname}' not found`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get security group error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Search Security Groups
    {
      name: 'maximo_search_security_groups',
      description:
        'Search and filter security groups. Supports filtering by name, status, site, and organization with OSLC query support.',
      inputSchema: {
        type: 'object',
        properties: {
          groupname: {
            type: 'string',
            description: 'Filter by group name pattern',
          },
          active: {
            type: 'boolean',
            description: 'Filter by active status',
          },
          siteid: {
            type: 'string',
            description: 'Filter by site ID',
          },
          orgid: {
            type: 'string',
            description: 'Filter by organization ID',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (default: 20)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (e.g., "+groupname" or "-groupname")',
          },
          where: {
            type: 'string',
            description: 'Custom OSLC where clause',
          },
        },
      },
      handler: async (args: any) => {
        try {
          logger.info('Searching security groups');
          const result = await operations.searchGroups(args);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} security group(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Search security groups error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Update Security Group
    {
      name: 'maximo_update_security_group',
      description:
        'Update an existing security group. Can modify description, active status, and default application. Requires the group resource ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Security group resource ID (from href or GET response)',
          },
          description: {
            type: 'string',
            description: 'Updated group description',
          },
          active: {
            type: 'boolean',
            description: 'Updated active status',
          },
          independent: {
            type: 'boolean',
            description: 'Updated independent access flag',
          },
          dfltapp: {
            type: 'string',
            description: 'Updated default starting application',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          const { id, ...updateData } = args;
          logger.info('Updating security group', { id });
          const result = await operations.updateGroup(id, updateData);
          return {
            success: result.success,
            data: result.data,
            message: `Security group updated successfully`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Update security group error', { error });
          throw error;
        }
      },
    },

    // Tool 5: Delete Security Group
    {
      name: 'maximo_delete_security_group',
      description:
        'Delete a security group. WARNING: This removes the group and all its assignments. Requires the group resource ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Security group resource ID to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Deleting security group', { id: args.id });
          const result = await operations.deleteGroup(args.id);
          return {
            success: result.success,
            message: 'Security group deleted successfully',
            error: result.error,
          };
        } catch (error) {
          logger.error('Delete security group error', { error });
          throw error;
        }
      },
    },

    // Tool 6: Assign User to Group
    {
      name: 'maximo_assign_user_to_group',
      description:
        'Assign a user (person) to a security group. This grants the user all permissions defined by the group.',
      inputSchema: {
        type: 'object',
        properties: {
          personid: {
            type: 'string',
            description: 'Person ID to assign',
          },
          groupname: {
            type: 'string',
            description: 'Security group name to assign the user to',
          },
          siteid: {
            type: 'string',
            description: 'Optional site ID for site-level assignment',
          },
        },
        required: ['personid', 'groupname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Assigning user to group', { personid: args.personid, groupname: args.groupname });
          const result = await operations.assignUserToGroup(args.personid, args.groupname, args.siteid);
          return {
            success: result.success,
            data: result.data,
            message: `User '${args.personid}' assigned to group '${args.groupname}'`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Assign user to group error', { error });
          throw error;
        }
      },
    },

    // Tool 7: Get Group Users
    {
      name: 'maximo_get_group_users',
      description:
        'List all users (persons) assigned to a security group.',
      inputSchema: {
        type: 'object',
        properties: {
          groupname: {
            type: 'string',
            description: 'Security group name to list users for',
          },
        },
        required: ['groupname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting group users', { groupname: args.groupname });
          const result = await operations.getGroupUsers(args.groupname);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `Found ${Array.isArray(result.data) ? result.data.length : 0} user(s) in group '${args.groupname}'`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get group users error', { error });
          throw error;
        }
      },
    },

    // Tool 8: Get User Groups
    {
      name: 'maximo_get_user_groups',
      description:
        'List all security groups assigned to a specific user (person).',
      inputSchema: {
        type: 'object',
        properties: {
          personid: {
            type: 'string',
            description: 'Person ID to look up groups for',
          },
        },
        required: ['personid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Getting user groups', { personid: args.personid });
          const result = await operations.getUserGroups(args.personid);
          return {
            success: result.success,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : 0,
            message: `User '${args.personid}' belongs to ${Array.isArray(result.data) ? result.data.length : 0} group(s)`,
            error: result.error,
          };
        } catch (error) {
          logger.error('Get user groups error', { error });
          throw error;
        }
      },
    },
  ];
}
