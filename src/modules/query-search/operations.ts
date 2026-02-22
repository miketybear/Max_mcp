/**
 * Query and Search Operations
 * Business logic for OSLC queries and search operations in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse } from '../../core/types';
import { createLogger } from '../../utils/logger';
import {
  OSLCQuery,
  QueryResult,
  AdvancedSearch,
  SavedQueryRequest,
  QueryBuilderRequest,
  QueryBuilderResponse,
} from './types';
import {
  oslcQuerySchema,
  advancedSearchSchema,
  savedQuerySchema,
  queryBuilderSchema,
} from './validators';

const logger = createLogger('QuerySearchOperations');

/**
 * Query and Search Operations class
 * Provides methods for querying and searching Maximo data
 */
export class QuerySearchOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('QuerySearchOperations initialized');
  }

  /**
   * Execute OSLC query
   */
  async query(data: OSLCQuery): Promise<ApiResponse<QueryResult>> {
    logger.info('Executing OSLC query', { objectStructure: data.objectStructure });

    try {
      const validated = oslcQuerySchema.parse(data);

      const params: any = {};
      if (validated.select) params['oslc.select'] = validated.select;
      if (validated.where) params['oslc.where'] = validated.where;
      if (validated.orderBy) params['oslc.orderBy'] = validated.orderBy;
      if (validated.pageSize) params['oslc.pageSize'] = validated.pageSize;
      if (validated.pageNum) params['oslc.pageNum'] = validated.pageNum;
      if (validated.searchTerms) params['oslc.searchTerms'] = validated.searchTerms;

      const response = await this.client.get<QueryResult>(
        `/maximo/api/os/${validated.objectStructure}`,
        params
      );

      if (response.success) {
        logger.info('Query executed successfully', {
          count: response.data?.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to execute query', { error });
      throw error;
    }
  }

  /**
   * Execute advanced search
   */
  async advancedSearch(data: AdvancedSearch): Promise<ApiResponse<QueryResult>> {
    logger.info('Executing advanced search', { objectStructure: data.objectStructure });

    try {
      const validated = advancedSearchSchema.parse(data);

      // Build WHERE clause from filters
      const whereConditions = validated.filters.map((filter) => {
        const { field, operator, value } = filter;
        if (operator === 'in') {
          const values = Array.isArray(value) ? value : [value];
          return `${field} in [${values.map((v: any) => `"${v}"`).join(',')}]`;
        }
        return `${field}${operator}"${value}"`;
      });

      const whereClause = whereConditions.join(` ${validated.operator || 'AND'} `);

      return this.query({
        objectStructure: validated.objectStructure,
        where: whereClause,
        select: validated.select,
        pageSize: validated.pageSize,
        pageNum: validated.pageNum,
      });
    } catch (error) {
      logger.error('Failed to execute advanced search', { error });
      throw error;
    }
  }

  /**
   * Execute saved query
   */
  async savedQuery(data: SavedQueryRequest): Promise<ApiResponse<QueryResult>> {
    logger.info('Executing saved query', { queryname: data.queryname });

    try {
      const validated = savedQuerySchema.parse(data);

      const params: any = {
        savedQuery: validated.queryname,
      };

      if (validated.parameters) {
        Object.assign(params, validated.parameters);
      }

      if (validated.pageSize) params['oslc.pageSize'] = validated.pageSize;
      if (validated.pageNum) params['oslc.pageNum'] = validated.pageNum;

      const response = await this.client.get<QueryResult>(
        `/maximo/api/os/query`,
        params
      );

      if (response.success) {
        logger.info('Saved query executed successfully');
      }

      return response;
    } catch (error) {
      logger.error('Failed to execute saved query', { error });
      throw error;
    }
  }

  /**
   * Build query interactively
   */
  async buildQuery(data: QueryBuilderRequest): Promise<ApiResponse<QueryBuilderResponse>> {
    logger.info('Building query', { objectStructure: data.objectStructure });

    try {
      const validated = queryBuilderSchema.parse(data);

      const builder: QueryBuilderResponse = {
        oslcQuery: '',
        whereClause: '',
        selectClause: '*',
        isValid: true,
        errors: [],
      };

      if (validated.conditions && validated.conditions.length > 0) {
        const whereConditions = validated.conditions.map((filter) => {
          if (filter.operator === 'in') {
            const values = Array.isArray(filter.value) ? filter.value : [filter.value];
            return `${filter.field} in [${values.map((v: any) => `"${v}"`).join(',')}]`;
          }
          return `${filter.field}${filter.operator}"${filter.value}"`;
        });

        builder.whereClause = whereConditions.join(' AND ');
        builder.oslcQuery = `/maximo/api/os/${validated.objectStructure}?oslc.where=${encodeURIComponent(builder.whereClause)}`;
      } else {
        builder.oslcQuery = `/maximo/api/os/${validated.objectStructure}`;
      }

      logger.info('Query built successfully');

      return {
        success: true,
        data: builder,
        statusCode: 200,
        headers: {},
        requestId: `qb-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to build query', { error });
      throw error;
    }
  }
}
