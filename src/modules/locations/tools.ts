/**
 * MCP Tools for Location Module
 * Defines 6 MCP tools for comprehensive location management
 */

import { LocationOperations } from './operations';
import {
  locationCreateSchema,
  locationUpdateSchema,
  locationSearchSchema,
  locationGetSchema,
  locationDeleteSchema,
  locationHierarchySchema,
} from './validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('LocationTools');

/**
 * Create MCP tools for location operations
 * @param operations - LocationOperations instance
 * @returns Array of MCP tool definitions
 */
export function createLocationTools(operations: LocationOperations) {
  return [
    // Tool 1: Create Location
    {
      name: 'maximo_create_location',
      description:
        'Create a new location in Maximo. Requires location code, description, siteid, and type. ' +
        'Optionally specify parent location, priority, GL account, system ID, and address details.',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location code (required, max 30 characters, alphanumeric with hyphens/underscores)',
          },
          description: {
            type: 'string',
            description: 'Location description (required, max 100 characters)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required, max 8 characters)',
          },
          type: {
            type: 'string',
            enum: ['OPERATING', 'STOREROOM', 'VENDOR', 'COURIER', 'LABOR', 'HOLDING', 'REPAIR', 'FLEET', 'WAREHOUSE'],
            description: 'Location type (required)',
          },
          orgid: {
            type: 'string',
            description: 'Organization identifier (optional, max 8 characters)',
          },
          status: {
            type: 'string',
            enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED'],
            description: 'Location status (optional, defaults to OPERATING)',
          },
          parent: {
            type: 'string',
            description: 'Parent location code for hierarchy (optional, max 30 characters)',
          },
          priority: {
            type: 'number',
            description: 'Priority level 1-5, where 1 is highest (optional)',
            minimum: 1,
            maximum: 5,
          },
          glaccount: {
            type: 'string',
            description: 'General ledger account (optional, max 23 characters)',
          },
          failurecode: {
            type: 'string',
            description: 'Failure code (optional, max 8 characters)',
          },
          replacecost: {
            type: 'number',
            description: 'Replacement cost (optional)',
            minimum: 0,
          },
          systemid: {
            type: 'string',
            description: 'System identifier (optional, max 20 characters)',
          },
          locoper: {
            type: 'string',
            description: 'Operating location code (optional, max 30 characters)',
          },
          classstructureid: {
            type: 'string',
            description: 'Classification structure ID (optional, max 20 characters)',
          },
          latitude: {
            type: 'number',
            description: 'Latitude coordinate (optional, -180 to 180)',
            minimum: -180,
            maximum: 180,
          },
          longitude: {
            type: 'number',
            description: 'Longitude coordinate (optional, -180 to 180)',
            minimum: -180,
            maximum: 180,
          },
          addressline1: {
            type: 'string',
            description: 'Address line 1 (optional, max 50 characters)',
          },
          addressline2: {
            type: 'string',
            description: 'Address line 2 (optional, max 50 characters)',
          },
          city: {
            type: 'string',
            description: 'City (optional, max 50 characters)',
          },
          stateprovince: {
            type: 'string',
            description: 'State or province (optional, max 20 characters)',
          },
          postalcode: {
            type: 'string',
            description: 'Postal code (optional, max 12 characters)',
          },
          country: {
            type: 'string',
            description: 'Country (optional, max 50 characters)',
          },
        },
        required: ['location', 'description', 'siteid', 'type'],
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_create_location', { args });
        try {
          const validated = locationCreateSchema.parse(args);
          const response = await operations.create(validated);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message: `Location ${response.data.location} created successfully`,
                      location: response.data,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Failed to create location',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_create_location', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 2: Get Location
    {
      name: 'maximo_get_location',
      description:
        'Retrieve detailed information about a specific location by location code and site ID. ' +
        'Returns complete location data including status, type, hierarchy, and address information.',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location code (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['location', 'siteid'],
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_get_location', { args });
        try {
          const validated = locationGetSchema.parse(args);
          const response = await operations.get(validated.location, validated.siteid);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      location: response.data,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Location not found',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_get_location', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 3: Update Location
    {
      name: 'maximo_update_location',
      description:
        'Update an existing location in Maximo. Specify location code and site ID, then provide fields to update. ' +
        'Can update description, status, type, parent, priority, GL account, and other location attributes.',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location code (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              description: {
                type: 'string',
                description: 'Location description (max 100 characters)',
              },
              status: {
                type: 'string',
                enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED'],
                description: 'Location status',
              },
              type: {
                type: 'string',
                enum: ['OPERATING', 'STOREROOM', 'VENDOR', 'COURIER', 'LABOR', 'HOLDING', 'REPAIR', 'FLEET', 'WAREHOUSE'],
                description: 'Location type',
              },
              parent: {
                type: 'string',
                description: 'Parent location code (max 30 characters)',
              },
              priority: {
                type: 'number',
                description: 'Priority level 1-5',
                minimum: 1,
                maximum: 5,
              },
              glaccount: {
                type: 'string',
                description: 'General ledger account (max 23 characters)',
              },
              failurecode: {
                type: 'string',
                description: 'Failure code (max 8 characters)',
              },
              replacecost: {
                type: 'number',
                description: 'Replacement cost',
                minimum: 0,
              },
              systemid: {
                type: 'string',
                description: 'System identifier (max 20 characters)',
              },
              locoper: {
                type: 'string',
                description: 'Operating location code (max 30 characters)',
              },
              disabled: {
                type: 'boolean',
                description: 'Whether location is disabled',
              },
              classstructureid: {
                type: 'string',
                description: 'Classification structure ID (max 20 characters)',
              },
              latitude: {
                type: 'number',
                description: 'Latitude coordinate (-180 to 180)',
                minimum: -180,
                maximum: 180,
              },
              longitude: {
                type: 'number',
                description: 'Longitude coordinate (-180 to 180)',
                minimum: -180,
                maximum: 180,
              },
              addressline1: {
                type: 'string',
                description: 'Address line 1 (max 50 characters)',
              },
              addressline2: {
                type: 'string',
                description: 'Address line 2 (max 50 characters)',
              },
              city: {
                type: 'string',
                description: 'City (max 50 characters)',
              },
              stateprovince: {
                type: 'string',
                description: 'State or province (max 20 characters)',
              },
              postalcode: {
                type: 'string',
                description: 'Postal code (max 12 characters)',
              },
              country: {
                type: 'string',
                description: 'Country (max 50 characters)',
              },
            },
          },
        },
        required: ['location', 'siteid', 'updates'],
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_update_location', { args });
        try {
          const input = args as { location: string; siteid: string; updates: unknown };
          const validatedParams = locationGetSchema.parse({
            location: input.location,
            siteid: input.siteid,
          });
          const validatedUpdates = locationUpdateSchema.parse(input.updates);

          const response = await operations.update(
            validatedParams.location,
            validatedParams.siteid,
            validatedUpdates
          );

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message: `Location ${response.data.location} updated successfully`,
                      location: response.data,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Failed to update location',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_update_location', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 4: Delete Location
    {
      name: 'maximo_delete_location',
      description:
        'Delete a location from Maximo. Requires location code and site ID. ' +
        'Note: Cannot delete locations that have child locations. Remove children first.',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location code (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['location', 'siteid'],
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_delete_location', { args });
        try {
          const validated = locationDeleteSchema.parse(args);
          const response = await operations.delete(validated.location, validated.siteid);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      message: `Location ${response.data.location} deleted successfully`,
                      result: response.data,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Failed to delete location',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_delete_location', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 5: Get Location Hierarchy
    {
      name: 'maximo_get_location_hierarchy',
      description:
        'Retrieve location hierarchy information including parent location and all child locations. ' +
        'Shows the complete parent-child relationship structure for the specified location.',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location code (required)',
          },
          siteid: {
            type: 'string',
            description: 'Site identifier (required)',
          },
        },
        required: ['location', 'siteid'],
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_get_location_hierarchy', { args });
        try {
          const validated = locationHierarchySchema.parse(args);
          const response = await operations.getHierarchy(validated.location, validated.siteid);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      hierarchy: {
                        location: response.data.location,
                        parent: response.data.parent || null,
                        children: response.data.children,
                        level: response.data.level,
                        path: response.data.path,
                        summary: {
                          hasParent: !!response.data.parent,
                          childrenCount: response.data.children.length,
                        },
                      },
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Failed to retrieve location hierarchy',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_get_location_hierarchy', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },

    // Tool 6: Search Locations
    {
      name: 'maximo_search_locations',
      description:
        'Search for locations using various filters. Can filter by status, type, parent, system ID, site, ' +
        'description (partial match), disabled status, and classification. Supports pagination and field selection.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['OPERATING', 'NOT READY', 'DECOMMISSIONED'],
            description: 'Filter by location status',
          },
          type: {
            type: 'string',
            enum: ['OPERATING', 'STOREROOM', 'VENDOR', 'COURIER', 'LABOR', 'HOLDING', 'REPAIR', 'FLEET', 'WAREHOUSE'],
            description: 'Filter by location type',
          },
          parent: {
            type: 'string',
            description: 'Filter by parent location code',
          },
          systemid: {
            type: 'string',
            description: 'Filter by system identifier',
          },
          siteid: {
            type: 'string',
            description: 'Filter by site identifier',
          },
          description: {
            type: 'string',
            description: 'Search in description (partial match)',
          },
          disabled: {
            type: 'boolean',
            description: 'Filter by disabled status',
          },
          classstructureid: {
            type: 'string',
            description: 'Filter by classification structure ID',
          },
          pageSize: {
            type: 'number',
            description: 'Maximum number of results to return (1-1000, default 100)',
            minimum: 1,
            maximum: 1000,
          },
          select: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Specific fields to return (default: all fields)',
          },
          orderBy: {
            type: 'string',
            description: 'Sort order (e.g., "location", "-description")',
          },
        },
      },
      handler: async (args: unknown) => {
        logger.info('Executing maximo_search_locations', { args });
        try {
          const validated = locationSearchSchema.parse(args || {});
          const response = await operations.search(validated);

          if (response.success && response.data) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      results: response.data.locations,
                      metadata: {
                        totalCount: response.data.totalCount,
                        pageSize: response.data.pageSize,
                        hasMore: response.data.hasMore,
                      },
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: response.error || 'Failed to search locations',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        } catch (error) {
          logger.error('Error in maximo_search_locations', { error });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      },
    },
  ];
}