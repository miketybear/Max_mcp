/**
 * Location Operations
 * Business logic for location management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  Location,
  LocationCreate,
  LocationUpdate,
  LocationSearch,
  LocationHierarchy,
  LocationSearchResult,
  LocationDeleteResult,
} from './types';
import {
  locationCreateSchema,
  locationUpdateSchema,
  locationSearchSchema,
  locationGetSchema,
  locationDeleteSchema,
  locationHierarchySchema,
} from './validators';
import { ValidationError } from '../../core/types';

const logger = createLogger('LocationOperations');

/**
 * Location Operations class
 * Provides methods for managing locations in Maximo
 */
export class LocationOperations {
  private client: MaximoClient;

  /**
   * Create a new LocationOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('LocationOperations initialized');
  }

  /**
   * Create a new location
   * @param data - Location creation data
   * @returns API response with created location
   */
  async create(data: LocationCreate): Promise<ApiResponse<Location>> {
    logger.info('Creating location', { location: data.location, siteid: data.siteid });

    try {
      // Validate input
      const validated = locationCreateSchema.parse(data);

      // Check for circular hierarchy if parent is specified
      if (validated.parent) {
        if (validated.location === validated.parent) {
          throw new ValidationError('Location cannot be its own parent');
        }
      }

      // Make API request
      const response = await this.client.post<Location>(
        API_ENDPOINTS.LOCATIONS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Location created successfully', {
          location: response.data.location,
          siteid: response.data.siteid,
          type: response.data.type,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create location', { error });
      throw error;
    }
  }

  /**
   * Get location by code
   * @param location - Location code
   * @param siteid - Site identifier
   * @returns API response with location data
   */
  async get(location: string, siteid: string): Promise<ApiResponse<Location>> {
    logger.info('Retrieving location', { location, siteid });

    try {
      // Validate input
      const validated = locationGetSchema.parse({ location, siteid });

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `location="${validated.location}" and siteid="${validated.siteid}"`,
        'oslc.select': '*',
      };

      // Make API request
      const response = await this.client.get<Location[]>(
        API_ENDPOINTS.LOCATIONS,
        { params }
      );

      // Extract single location from array response
      if (response.success && response.data && response.data.length > 0) {
        const locationData = response.data[0]!;
        logger.info('Location retrieved successfully', {
          location: locationData.location,
          siteid: locationData.siteid,
        });

        return {
          ...response,
          data: locationData,
        };
      }

      // Location not found
      return {
        success: false,
        data: undefined,
        error: `Location ${validated.location} not found in site ${validated.siteid}`,
        statusCode: 404,
        headers: {},
        requestId: response.requestId || '',
      };
    } catch (error) {
      logger.error('Failed to retrieve location', { error });
      throw error;
    }
  }

  /**
   * Update location
   * @param location - Location code
   * @param siteid - Site identifier
   * @param data - Update data
   * @returns API response with updated location
   */
  async update(
    location: string,
    siteid: string,
    data: LocationUpdate
  ): Promise<ApiResponse<Location>> {
    logger.info('Updating location', { location, siteid, updates: Object.keys(data) });

    try {
      // Validate input
      const validatedParams = locationGetSchema.parse({ location, siteid });
      const validated = locationUpdateSchema.parse(data);

      // Check for circular hierarchy if parent is being updated
      if (validated.parent) {
        if (validatedParams.location === validated.parent) {
          throw new ValidationError('Location cannot be its own parent');
        }
      }

      // First, get the location to obtain its href
      const getResponse = await this.get(validatedParams.location, validatedParams.siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      // Build query parameters for update
      const params: OSLCQueryParams = {
        'oslc.where': `location="${validatedParams.location}" and siteid="${validatedParams.siteid}"`,
      };

      // Make API request
      const response = await this.client.patch<Location>(
        API_ENDPOINTS.LOCATIONS,
        validated,
        { params }
      );

      if (response.success && response.data) {
        logger.info('Location updated successfully', {
          location: response.data.location,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update location', { error });
      throw error;
    }
  }

  /**
   * Delete location
   * @param location - Location code
   * @param siteid - Site identifier
   * @returns API response with deletion result
   */
  async delete(location: string, siteid: string): Promise<ApiResponse<LocationDeleteResult>> {
    logger.info('Deleting location', { location, siteid });

    try {
      // Validate input
      const validated = locationDeleteSchema.parse({ location, siteid });

      // Check if location has children
      const hierarchyResponse = await this.getHierarchy(validated.location, validated.siteid);
      if (hierarchyResponse.success && hierarchyResponse.data) {
        if (hierarchyResponse.data.children.length > 0) {
          throw new ValidationError(
            `Cannot delete location ${validated.location}: it has ${hierarchyResponse.data.children.length} child location(s)`
          );
        }
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `location="${validated.location}" and siteid="${validated.siteid}"`,
      };

      // Make API request
      const response = await this.client.delete(
        API_ENDPOINTS.LOCATIONS,
        { params }
      );

      if (response.success) {
        const result: LocationDeleteResult = {
          success: true,
          location: validated.location,
          siteid: validated.siteid,
          deletedAt: new Date().toISOString(),
        };

        logger.info('Location deleted successfully', {
          location: validated.location,
          siteid: validated.siteid,
        });

        return {
          success: true,
          data: result,
          statusCode: response.statusCode,
          headers: response.headers,
          requestId: response.requestId,
        };
      }

      return {
        success: false,
        data: undefined,
        error: response.error,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to delete location', { error });
      throw error;
    }
  }

  /**
   * Get location hierarchy (parent and children)
   * @param location - Location code
   * @param siteid - Site identifier
   * @returns API response with hierarchy information
   */
  async getHierarchy(
    location: string,
    siteid: string
  ): Promise<ApiResponse<LocationHierarchy>> {
    logger.info('Retrieving location hierarchy', { location, siteid });

    try {
      // Validate input
      const validated = locationHierarchySchema.parse({ location, siteid });

      // Get the location itself
      const locationResponse = await this.get(validated.location, validated.siteid);
      if (!locationResponse.success || !locationResponse.data) {
        return {
          success: false,
          data: undefined,
          error: locationResponse.error,
          statusCode: locationResponse.statusCode,
          headers: locationResponse.headers,
          requestId: locationResponse.requestId,
        };
      }

      const locationData = locationResponse.data;
      let parentData: Location | undefined;
      const children: Location[] = [];

      // Get parent if exists
      if (locationData.parent) {
        const parentResponse = await this.get(locationData.parent, validated.siteid);
        if (parentResponse.success && parentResponse.data) {
          parentData = parentResponse.data;
        }
      }

      // Get children
      const childrenParams: OSLCQueryParams = {
        'oslc.where': `parent="${validated.location}" and siteid="${validated.siteid}"`,
        'oslc.select': '*',
        'oslc.pageSize': 100,
      };

      const childrenResponse = await this.client.get<Location[]>(
        API_ENDPOINTS.LOCATIONS,
        { params: childrenParams }
      );

      if (childrenResponse.success && childrenResponse.data) {
        children.push(...childrenResponse.data);
      }

      // Build hierarchy path
      const path = this.buildHierarchyPath(locationData, parentData);
      const level = this.calculateHierarchyLevel(locationData, parentData);

      const hierarchy: LocationHierarchy = {
        location: locationData,
        parent: parentData,
        children,
        level,
        path,
      };

      logger.info('Location hierarchy retrieved successfully', {
        location: validated.location,
        hasParent: !!parentData,
        childrenCount: children.length,
        level,
      });

      return {
        success: true,
        data: hierarchy,
        statusCode: 200,
        headers: {},
        requestId: locationResponse.requestId || '',
      };
    } catch (error) {
      logger.error('Failed to retrieve location hierarchy', { error });
      throw error;
    }
  }

  /**
   * Search locations with filters
   * @param criteria - Search criteria
   * @returns API response with matching locations
   */
  async search(criteria: LocationSearch): Promise<ApiResponse<LocationSearchResult>> {
    logger.info('Searching locations', { criteria });

    try {
      // Validate input
      const validated = locationSearchSchema.parse(criteria);

      // Build OSLC where clause
      const whereClauses: string[] = [];

      if (validated.status) {
        whereClauses.push(`status="${validated.status}"`);
      }

      if (validated.type) {
        whereClauses.push(`type="${validated.type}"`);
      }

      if (validated.parent) {
        whereClauses.push(`parent="${validated.parent}"`);
      }

      if (validated.systemid) {
        whereClauses.push(`systemid="${validated.systemid}"`);
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.description) {
        whereClauses.push(`description~"%${validated.description}%"`);
      }

      if (validated.disabled !== undefined) {
        whereClauses.push(`disabled=${validated.disabled}`);
      }

      if (validated.classstructureid) {
        whereClauses.push(`classstructureid="${validated.classstructureid}"`);
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      if (whereClauses.length > 0) {
        params['oslc.where'] = whereClauses.join(' and ');
      }

      if (validated.select && validated.select.length > 0) {
        params['oslc.select'] = validated.select.join(',');
      } else {
        params['oslc.select'] = '*';
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      // Make API request
      const response = await this.client.get<Location[]>(
        API_ENDPOINTS.LOCATIONS,
        { params }
      );

      if (response.success && response.data) {
        const result: LocationSearchResult = {
          locations: response.data,
          totalCount: response.data.length,
          pageSize: validated.pageSize || DEFAULT_PAGE_SIZE,
          hasMore: response.data.length === (validated.pageSize || DEFAULT_PAGE_SIZE),
        };

        logger.info('Location search completed', {
          count: result.totalCount,
          hasMore: result.hasMore,
        });

        return {
          ...response,
          data: result,
        };
      }

      return {
        success: false,
        data: undefined,
        error: response.error,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to search locations', { error });
      throw error;
    }
  }

  /**
   * Build hierarchy path string
   * @param location - Current location
   * @param parent - Parent location (if exists)
   * @returns Hierarchy path string
   */
  private buildHierarchyPath(location: Location, parent?: Location): string {
    if (!parent) {
      return location.location;
    }
    // For simplicity, just show parent/child
    // In a real implementation, you might recursively build the full path
    return `${parent.location}/${location.location}`;
  }

  /**
   * Calculate hierarchy level
   * @param location - Current location
   * @param parent - Parent location (if exists)
   * @returns Hierarchy level (0 = top level)
   */
  private calculateHierarchyLevel(_location: Location, parent?: Location): number {
    if (!parent) {
      return 0;
    }
    // For simplicity, just increment by 1
    // In a real implementation, you might recursively calculate the full depth
    return 1;
  }
}