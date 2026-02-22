/**
 * Classification Operations
 * Business logic for classification management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse } from '../../core/types';
import { API_ENDPOINTS } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  Classification,
  ClassificationHierarchy,
  ClassificationSpec,
  SpecificationValuesUpdate,
  ClassificationOperationResult,
} from './types';
import {
  classificationIdentifierSchema,
  classificationHierarchySchema,
  specificationValuesSchema,
} from './validators';

const logger = createLogger('ClassificationOperations');

/**
 * Classification Operations class
 * Provides methods for managing classifications in Maximo
 */
export class ClassificationOperations {
  private client: MaximoClient;

  /**
   * Create a new ClassificationOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('ClassificationOperations initialized');
  }

  /**
   * Get classification details
   * @param classstructureid - Classification structure ID
   * @returns API response with classification data
   */
  async get(classstructureid: string): Promise<ApiResponse<Classification>> {
    logger.info('Retrieving classification', { classstructureid });

    try {
      // Validate input
      const validated = classificationIdentifierSchema.parse({ classstructureid });

      // Build query
      const params = {
        'oslc.where': `classstructureid="${validated.classstructureid}"`,
        'oslc.select': '*',
      };

      const response = await this.client.get<Classification>(
        API_ENDPOINTS.CLASSIFICATIONS,
        params
      );

      if (response.success) {
        logger.info('Classification retrieved successfully', { classstructureid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to retrieve classification', { error });
      throw error;
    }
  }

  /**
   * Get classification hierarchy
   * @param classstructureid - Root classification ID
   * @param levels - Number of hierarchy levels to retrieve
   * @returns API response with classification hierarchy
   */
  async getHierarchy(
    classstructureid: string,
    levels: number = 3
  ): Promise<ApiResponse<ClassificationHierarchy>> {
    logger.info('Retrieving classification hierarchy', { classstructureid, levels });

    try {
      // Validate input
      const validated = classificationHierarchySchema.parse({ classstructureid, levels });

      // Get root classification
      const rootResponse = await this.get(validated.classstructureid);

      if (!rootResponse.success || !rootResponse.data) {
        return rootResponse as any;
      }

      // Build hierarchy by recursively fetching children
      const hierarchy: ClassificationHierarchy = {
        classification: rootResponse.data,
        children: [],
      };

      // Fetch children if haschildren is true and levels > 0
      if (rootResponse.data.haschildren && validated.levels && validated.levels > 0) {
        const childrenParams = {
          'oslc.where': `parent="${rootResponse.data.classstructureid}"`,
          'oslc.select': '*',
        };

        const childrenResponse = await this.client.get<Classification[]>(
          API_ENDPOINTS.CLASSIFICATIONS,
          childrenParams
        );

        if (childrenResponse.success && childrenResponse.data) {
          // Recursively build child hierarchies
          hierarchy.children = await Promise.all(
            childrenResponse.data.map(async (child) => {
              if (validated.levels && validated.levels > 1) {
                return this.getHierarchy(child.classificationid, validated.levels - 1);
              }
              return {
                classification: child,
                children: [],
              } as any;
            })
          ).then((results) => results.map((r) => r.data).filter(Boolean) as ClassificationHierarchy[]);
        }
      }

      logger.info('Classification hierarchy retrieved', { classstructureid });

      return {
        success: true,
        data: hierarchy,
        statusCode: 200,
        headers: {},
        requestId: `hier-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to retrieve classification hierarchy', { error });
      throw error;
    }
  }

  /**
   * Get classification specification template
   * @param classstructureid - Classification structure ID
   * @returns API response with specification attributes
   */
  async getSpecifications(classstructureid: string): Promise<ApiResponse<ClassificationSpec[]>> {
    logger.info('Retrieving classification specifications', { classstructureid });

    try {
      // Validate input
      const validated = classificationIdentifierSchema.parse({ classstructureid });

      // Query for classification spec attributes
      const params = {
        'oslc.where': `classstructureid="${validated.classstructureid}"`,
        'oslc.select': 'attributeid,description,datatype,required,defaultvalue',
      };

      const response = await this.client.get<ClassificationSpec[]>(
        `${API_ENDPOINTS.CLASSIFICATIONS}/spec`,
        params
      );

      if (response.success) {
        logger.info('Classification specifications retrieved', {
          classstructureid,
          count: response.data?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to retrieve classification specifications', { error });
      throw error;
    }
  }

  /**
   * Update specification attribute values for an object
   * @param data - Specification values update data
   * @returns API response with update result
   */
  async updateSpecifications(
    data: SpecificationValuesUpdate
  ): Promise<ApiResponse<ClassificationOperationResult>> {
    logger.info('Updating specification values', {
      objectname: data.objectname,
      objectid: data.objectid,
    });

    try {
      // Validate input
      const validated = specificationValuesSchema.parse(data);

      // Build update payload
      const payload = {
        objectname: validated.objectname,
        objectid: validated.objectid,
        specifications: validated.specifications,
      };

      // Update specifications
      const response = await this.client.patch<ClassificationOperationResult>(
        `${API_ENDPOINTS.CLASSIFICATIONS}/spec`,
        payload
      );

      if (response.success) {
        logger.info('Specification values updated successfully', {
          objectname: data.objectname,
          objectid: data.objectid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update specification values', { error });
      throw error;
    }
  }
}
