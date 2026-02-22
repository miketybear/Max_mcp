/**
 * Response Formatter
 * Utilities for formatting HTTP responses
 */

import { AxiosResponse } from 'axios';
import { createLogger } from '../utils/logger';
import {
  ApiResponse,
  PaginationMetadata,
  HttpError,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('ResponseFormatter');

/**
 * Response Formatter class
 * Provides utilities for formatting API responses
 */
export class ResponseFormatter {
  /**
   * Format a successful response
   * @param data - Response data
   * @param statusCode - HTTP status code
   * @param headers - Response headers
   * @param requestId - Request ID
   * @param duration - Request duration in milliseconds
   * @returns Formatted API response
   */
  public formatSuccess<T>(
    data: T,
    statusCode: number,
    headers: Record<string, unknown>,
    requestId?: string,
    duration?: number
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      statusCode,
      headers: this.normalizeHeaders(headers),
      requestId: requestId || this.generateRequestId(),
    };

    if (duration !== undefined) {
      response.duration = duration;
    }

    // Extract pagination metadata if present
    const pagination = this.extractPaginationMetadata(data);
    if (pagination) {
      response.pagination = pagination;
    }

    logger.debug('Formatted success response', {
      statusCode,
      requestId: response.requestId,
      hasPagination: !!pagination,
      duration,
    });

    return response;
  }

  /**
   * Format an error response
   * @param error - Error object
   * @param statusCode - HTTP status code
   * @param requestId - Request ID
   * @returns Formatted API response
   */
  public formatError(
    error: unknown,
    statusCode: number,
    requestId?: string
  ): ApiResponse<never> {
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    const response: ApiResponse<never> = {
      success: false,
      error: errorMessage,
      errorCode,
      statusCode,
      headers: {},
      requestId: requestId || this.generateRequestId(),
    };

    logger.debug('Formatted error response', {
      statusCode,
      errorCode,
      requestId: response.requestId,
    });

    return response;
  }

  /**
   * Extract data from Axios response
   * @param response - Axios response
   * @returns Extracted data
   */
  public extractData<T>(response: AxiosResponse): T {
    // Handle empty responses
    if (!response.data) {
      return response.data as T;
    }

    // If response is already in the expected format, return as-is
    if (typeof response.data !== 'object') {
      return response.data as T;
    }

    // Try to extract from OSLC format
    const oslcData = this.parseOSLCResponse<T>(response.data as Record<string, unknown>);
    if (oslcData !== null) {
      return oslcData;
    }

    // Return raw data
    return response.data as T;
  }

  /**
   * Parse OSLC query response
   * @param response - Response data
   * @returns Parsed data or null if not OSLC format
   */
  public parseOSLCResponse<T>(response: Record<string, unknown>): T | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    // Check if it's an OSLC response with member array
    if (Array.isArray(response['member'])) {
      logger.debug('Parsing OSLC member array', {
        memberCount: (response['member'] as unknown[]).length,
      });
      return response['member'] as T;
    }

    // Check for rdfs:member (alternative OSLC format)
    if (response['rdfs:member'] && Array.isArray(response['rdfs:member'])) {
      logger.debug('Parsing OSLC rdfs:member array', {
        memberCount: (response['rdfs:member'] as unknown[]).length,
      });
      return response['rdfs:member'] as T;
    }

    // Check for single resource response
    if (response['href'] || response['rdf:about']) {
      logger.debug('Parsing OSLC single resource');
      return response as unknown as T;
    }

    // Not an OSLC format
    return null;
  }

  /**
   * Generate a unique request ID
   * @returns UUID v4 request ID
   */
  public generateRequestId(): string {
    return uuidv4();
  }

  /**
   * Extract pagination metadata from response data
   * @param data - Response data
   * @returns Pagination metadata or undefined
   */
  private extractPaginationMetadata(data: unknown): PaginationMetadata | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const record = data as Record<string, unknown>;

    // Check for OSLC responseInfo
    const responseInfo = record['responseInfo'] as Record<string, unknown> | undefined;
    if (responseInfo) {
      const pagenum = (responseInfo['pagenum'] as number) || 1;
      const totalPages = responseInfo['totalPages'] as number | undefined;
      const totalCount = responseInfo['totalCount'] as number | undefined;

      // Calculate page size from member array
      let pageSize = 100; // Default
      if (Array.isArray(record['member'])) {
        pageSize = (record['member'] as unknown[]).length;
      }

      if (totalPages !== undefined && totalCount !== undefined) {
        return {
          page: pagenum,
          pageSize,
          totalCount,
          totalPages,
          hasNext: !!responseInfo['nextPage'],
          hasPrevious: !!responseInfo['previousPage'],
        };
      }
    }

    // Check for standard pagination format
    if (record['page'] !== undefined && record['totalCount'] !== undefined) {
      const page = record['page'] as number;
      const pageSize = (record['pageSize'] as number) || (record['limit'] as number) || 100;
      const totalCount = record['totalCount'] as number;
      const totalPages = (record['totalPages'] as number) || Math.ceil(totalCount / pageSize);
      return {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: (record['hasNext'] as boolean) || page < totalPages,
        hasPrevious: (record['hasPrevious'] as boolean) || page > 1,
      };
    }

    return undefined;
  }

  /**
   * Extract error message from error object
   * @param error - Error object
   * @returns Error message
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const record = error as Record<string, unknown>;
      if (typeof record['message'] === 'string') {
        return record['message'];
      }
      const errorUpper = record['Error'] as Record<string, unknown> | undefined;
      if (errorUpper && typeof errorUpper['message'] === 'string') {
        return errorUpper['message'];
      }
      const errorLower = record['error'];
      if (errorLower) {
        if (typeof errorLower === 'string') { return errorLower; }
        if (typeof errorLower === 'object' && errorLower !== null) {
          return String((errorLower as Record<string, unknown>)['message']);
        }
      }
    }

    return 'An unknown error occurred';
  }

  /**
   * Extract error code from error object
   * @param error - Error object
   * @returns Error code
   */
  private extractErrorCode(error: unknown): string | undefined {
    if (error instanceof HttpError) {
      return error.code;
    }

    if (typeof error === 'object' && error !== null) {
      const record = error as Record<string, unknown>;
      if (typeof record['code'] === 'string') {
        return record['code'];
      }
      if (typeof record['errorCode'] === 'string') {
        return record['errorCode'];
      }
      const errorUpper = record['Error'] as Record<string, unknown> | undefined;
      if (errorUpper && typeof errorUpper['reasonCode'] === 'string') {
        return errorUpper['reasonCode'];
      }
    }

    return undefined;
  }

  /**
   * Normalize response headers to a plain object
   * @param headers - Response headers
   * @returns Normalized headers object
   */
  private normalizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    if (!headers) {
      return {};
    }

    // If already a plain object, return as-is
    if (typeof headers === 'object' && !Array.isArray(headers)) {
      return { ...headers };
    }

    return {};
  }
}

/**
 * Default response formatter instance
 */
export const responseFormatter = new ResponseFormatter();