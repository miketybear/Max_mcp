/**
 * Bulk Operations
 * Business logic for bulk operations in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse } from '../../core/types';
import { createLogger } from '../../utils/logger';
import {
  BulkCreateRequest,
  BulkUpdateRequest,
  BulkDeleteRequest,
  BatchProcessRequest,
  BulkOperationResult,
  BatchProcessResult,
  OperationResult,
} from './types';
import {
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  batchProcessSchema,
} from './validators';

const logger = createLogger('BulkOperations');

/**
 * Bulk Operations class
 * Provides methods for bulk operations in Maximo
 */
export class BulkOperations {
  private client: MaximoClient;

  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('BulkOperations initialized');
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data: BulkCreateRequest): Promise<ApiResponse<BulkOperationResult>> {
    logger.info('Bulk creating records', {
      objectStructure: data.objectStructure,
      count: data.records.length,
    });

    try {
      const validated = bulkCreateSchema.parse(data);
      const results: OperationResult[] = [];
      let successful = 0;
      let failed = 0;

      for (const record of validated.records) {
        try {
          const response = await this.client.post(
            `/maximo/api/os/${validated.objectStructure}`,
            record
          );

          if (response.success) {
            successful++;
            results.push({
              success: true,
              id: (response.data as any)?.href || 'created',
              statusCode: response.statusCode,
            });
          } else {
            failed++;
            results.push({
              success: false,
              error: response.error,
              statusCode: response.statusCode,
            });

            if (!validated.continueOnError) {
              break;
            }
          }
        } catch (error) {
          failed++;
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (!validated.continueOnError) {
            throw error;
          }
        }
      }

      const result: BulkOperationResult = {
        total: validated.records.length,
        successful,
        failed,
        results,
        success: failed === 0,
      };

      logger.info('Bulk create completed', { successful, failed });

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `bulk-create-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Bulk create failed', { error });
      throw error;
    }
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(data: BulkUpdateRequest): Promise<ApiResponse<BulkOperationResult>> {
    logger.info('Bulk updating records', {
      objectStructure: data.objectStructure,
      count: data.updates.length,
    });

    try {
      const validated = bulkUpdateSchema.parse(data);
      const results: OperationResult[] = [];
      let successful = 0;
      let failed = 0;

      for (const update of validated.updates) {
        try {
          const response = await this.client.patch(
            `/maximo/api/os/${validated.objectStructure}/${update.id}`,
            update.data
          );

          if (response.success) {
            successful++;
            results.push({
              success: true,
              id: update.id,
              statusCode: response.statusCode,
            });
          } else {
            failed++;
            results.push({
              success: false,
              id: update.id,
              error: response.error,
              statusCode: response.statusCode,
            });

            if (!validated.continueOnError) {
              break;
            }
          }
        } catch (error) {
          failed++;
          results.push({
            success: false,
            id: update.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (!validated.continueOnError) {
            throw error;
          }
        }
      }

      const result: BulkOperationResult = {
        total: validated.updates.length,
        successful,
        failed,
        results,
        success: failed === 0,
      };

      logger.info('Bulk update completed', { successful, failed });

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `bulk-update-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Bulk update failed', { error });
      throw error;
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(data: BulkDeleteRequest): Promise<ApiResponse<BulkOperationResult>> {
    logger.info('Bulk deleting records', {
      objectStructure: data.objectStructure,
      count: data.ids.length,
    });

    try {
      const validated = bulkDeleteSchema.parse(data);
      const results: OperationResult[] = [];
      let successful = 0;
      let failed = 0;

      for (const id of validated.ids) {
        try {
          const response = await this.client.delete(
            `/maximo/api/os/${validated.objectStructure}/${id}`
          );

          if (response.success) {
            successful++;
            results.push({
              success: true,
              id,
              statusCode: response.statusCode,
            });
          } else {
            failed++;
            results.push({
              success: false,
              id,
              error: response.error,
              statusCode: response.statusCode,
            });

            if (!validated.continueOnError) {
              break;
            }
          }
        } catch (error) {
          failed++;
          results.push({
            success: false,
            id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (!validated.continueOnError) {
            throw error;
          }
        }
      }

      const result: BulkOperationResult = {
        total: validated.ids.length,
        successful,
        failed,
        results,
        success: failed === 0,
      };

      logger.info('Bulk delete completed', { successful, failed });

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `bulk-delete-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Bulk delete failed', { error });
      throw error;
    }
  }

  /**
   * Batch process operations
   */
  async batchProcess(data: BatchProcessRequest): Promise<ApiResponse<BatchProcessResult>> {
    logger.info('Batch processing operations', { count: data.operations.length });

    try {
      const validated = batchProcessSchema.parse(data);
      const results: BatchProcessResult['results'] = [];
      let successful = 0;
      let failed = 0;

      for (const operation of validated.operations) {
        try {
          let response: any;

          switch (operation.type) {
            case 'create':
              response = await this.client.post(
                `/maximo/api/os/${operation.objectStructure}`,
                operation.data
              );
              break;
            case 'update':
              response = await this.client.patch(
                `/maximo/api/os/${operation.objectStructure}/${(operation.data as any).id}`,
                operation.data
              );
              break;
            case 'delete':
              response = await this.client.delete(
                `/maximo/api/os/${operation.objectStructure}/${(operation.data as any).id}`
              );
              break;
          }

          if (response.success) {
            successful++;
            results.push({
              operation: operation as any,
              result: {
                success: true,
                statusCode: response.statusCode,
              },
            });
          } else {
            failed++;
            results.push({
              operation: operation as any,
              result: {
                success: false,
                error: response.error,
                statusCode: response.statusCode,
              },
            });

            if (validated.transactional) {
              throw new Error('Transaction failed, rolling back');
            }
          }
        } catch (error) {
          failed++;
          results.push({
            operation: operation as any,
            result: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          if (validated.transactional) {
            throw error;
          }
        }
      }

      const result: BatchProcessResult = {
        total: validated.operations.length,
        successful,
        failed,
        results,
        success: failed === 0,
        rolledBack: validated.transactional && failed > 0,
      };

      logger.info('Batch process completed', { successful, failed });

      return {
        success: true,
        data: result,
        statusCode: 200,
        headers: {},
        requestId: `batch-${Date.now()}`,
      };
    } catch (error) {
      logger.error('Batch process failed', { error });
      throw error;
    }
  }
}
