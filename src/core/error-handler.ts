/**
 * Error Handler
 * Comprehensive error handling for HTTP requests
 */

import { AxiosError } from 'axios';
import { createLogger } from '../utils/logger';
import {
  HttpError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  ErrorCode,
} from './types';
import { AuthErrorCode, AuthenticationError } from '../auth/types';

const logger = createLogger('ErrorHandler');

/**
 * Error context for detailed error information
 */
interface ErrorContext {
  /**
   * Request URL
   */
  url?: string;

  /**
   * HTTP method
   */
  method?: string;

  /**
   * Request ID
   */
  requestId?: string;

  /**
   * Additional context data
   */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Error Handler class
 * Provides comprehensive error handling and formatting
 */
export class ErrorHandler {
  /**
   * Handle and format errors
   * @param error - Error to handle
   * @param context - Error context information
   * @returns Formatted HttpError
   */
  public handleError(error: unknown, context: ErrorContext = {}): HttpError {
    const errorObj = error as Record<string, unknown> | null | undefined;
    logger.debug('Handling error', {
      errorType: errorObj?.constructor ? (errorObj.constructor as { name?: string }).name : undefined,
      ...context,
    });

    // If already an HttpError, just add context and return
    if (error instanceof HttpError) {
      error.requestId = error.requestId || context.requestId;
      return error;
    }

    // Handle authentication errors
    if (error instanceof AuthenticationError) {
      return this.handleAuthError(error, context);
    }

    // Handle Axios errors
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error, context);
    }

    // Handle generic errors
    if (error instanceof Error) {
      return this.handleGenericError(error, context);
    }

    // Handle unknown errors
    return new HttpError(
      'An unknown error occurred',
      500,
      ErrorCode.UNKNOWN_ERROR,
      { originalError: String(error) },
      context.requestId
    );
  }

  /**
   * Determine if an error should trigger a retry
   * @param error - Error to check
   * @returns True if error is retryable
   */
  public isRetryableError(error: unknown): boolean {
    // Don't retry validation errors
    if (error instanceof ValidationError) {
      return false;
    }

    // Don't retry authentication errors (except token expired)
    if (error instanceof AuthenticationError) {
      return error.code === AuthErrorCode.TOKEN_EXPIRED;
    }

    // Retry timeout errors
    if (error instanceof TimeoutError) {
      return true;
    }

    // Retry rate limit errors (with backoff)
    if (error instanceof RateLimitError) {
      return true;
    }

    // Check HTTP status codes
    if (error instanceof HttpError) {
      const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
      return retryableStatusCodes.includes(error.statusCode);
    }

    // Check Axios errors
    if (this.isAxiosError(error)) {
      // Retry network errors
      if (!error.response) {
        return true;
      }

      // Retry specific status codes
      const status = error.response.status;
      const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
      return retryableStatusCodes.includes(status);
    }

    // Don't retry by default
    return false;
  }

  /**
   * Format error message for user display
   * @param error - Error to format
   * @returns User-friendly error message
   */
  public formatErrorMessage(error: unknown): string {
    if (error instanceof HttpError) {
      return this.formatHttpErrorMessage(error);
    }

    if (error instanceof AuthenticationError) {
      return this.formatAuthErrorMessage(error);
    }

    if (this.isAxiosError(error)) {
      return this.formatAxiosErrorMessage(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  }

  /**
   * Get standardized error code
   * @param error - Error to get code from
   * @returns Error code
   */
  public getErrorCode(error: unknown): string {
    if (error instanceof HttpError) {
      return error.code;
    }

    if (error instanceof AuthenticationError) {
      return this.mapAuthErrorCode(error.code);
    }

    if (this.isAxiosError(error)) {
      return this.mapHttpStatusToErrorCode(error.response?.status);
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Handle authentication errors
   * @param error - Authentication error
   * @param context - Error context
   * @returns HttpError
   */
  private handleAuthError(
    error: AuthenticationError,
    context: ErrorContext
  ): HttpError {
    const errorCode = this.mapAuthErrorCode(error.code);
    const message = this.formatAuthErrorMessage(error);

    logger.error('Authentication error', {
      code: error.code,
      message,
      context,
    });

    return new HttpError(
      message,
      error.statusCode || 401,
      errorCode,
      error.details,
      context.requestId
    );
  }

  /**
   * Handle Axios errors
   * @param error - Axios error
   * @param context - Error context
   * @returns HttpError
   */
  private handleAxiosError(error: AxiosError, context: ErrorContext): HttpError {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      logger.warn('Request timeout', { context });
      return new TimeoutError(
        `Request timeout after ${context['timeout'] || 30000}ms`,
        context.requestId,
        { code: error.code }
      );
    }

    // Handle network errors
    if (!error.response) {
      const message = this.getNetworkErrorMessage(error);
      logger.error('Network error', { message, code: error.code, context });
      return new HttpError(
        message,
        0,
        ErrorCode.NETWORK_ERROR,
        { code: error.code },
        context.requestId
      );
    }

    // Handle HTTP errors with response
    const status = error.response.status;
    const errorCode = this.mapHttpStatusToErrorCode(status);
    const message = this.getHttpErrorMessage(status, error.response.data);

    logger.error('HTTP error', {
      status,
      errorCode,
      message,
      context,
    });

    // Handle specific error types
    if (status === 429) {
      const retryAfter = this.extractRetryAfter(error.response.headers as Record<string, unknown>);
      return new RateLimitError(message, retryAfter, context.requestId, {
        status,
        data: error.response.data as Record<string, unknown>,
      });
    }

    if (status === 400) {
      return new ValidationError(message, context.requestId, {
        data: error.response.data as Record<string, unknown>,
      });
    }

    return new HttpError(
      message,
      status,
      errorCode,
      { data: error.response.data as Record<string, unknown> },
      context.requestId
    );
  }

  /**
   * Handle generic errors
   * @param error - Generic error
   * @param context - Error context
   * @returns HttpError
   */
  private handleGenericError(error: Error, context: ErrorContext): HttpError {
    logger.error('Generic error', {
      name: error.name,
      message: error.message,
      context,
    });

    return new HttpError(
      error.message,
      500,
      ErrorCode.UNKNOWN_ERROR,
      { name: error.name, stack: error.stack },
      context.requestId
    );
  }

  /**
   * Format HTTP error message
   * @param error - HTTP error
   * @returns Formatted message
   */
  private formatHttpErrorMessage(error: HttpError): string {
    const suggestions = this.getErrorSuggestions(error.code);
    let message = error.message;

    if (suggestions.length > 0) {
      message += `\n\nSuggestions:\n${suggestions.map(s => `- ${s}`).join('\n')}`;
    }

    return message;
  }

  /**
   * Format authentication error message
   * @param error - Authentication error
   * @returns Formatted message
   */
  private formatAuthErrorMessage(error: AuthenticationError): string {
    const suggestions = this.getAuthErrorSuggestions(error.code);
    let message = error.message;

    if (suggestions.length > 0) {
      message += `\n\nSuggestions:\n${suggestions.map(s => `- ${s}`).join('\n')}`;
    }

    return message;
  }

  /**
   * Format Axios error message
   * @param error - Axios error
   * @returns Formatted message
   */
  private formatAxiosErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return this.getNetworkErrorMessage(error);
    }

    const status = error.response.status;
    return this.getHttpErrorMessage(status, error.response.data);
  }

  /**
   * Get network error message
   * @param error - Axios error
   * @returns Error message
   */
  private getNetworkErrorMessage(error: AxiosError): string {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused. Please check if the Maximo server is running and accessible.';
    }

    if (error.code === 'ENOTFOUND') {
      return 'Host not found. Please check the Maximo host URL.';
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'Request timeout. The server took too long to respond.';
    }

    return `Network error: ${error.message}`;
  }

  /**
   * Get HTTP error message
   * @param status - HTTP status code
   * @param data - Response data
   * @returns Error message
   */
  private getHttpErrorMessage(status: number, data: unknown): string {
    // Try to extract error message from response data
    if (data) {
      if (typeof data === 'string') {
        return data;
      }
      if (typeof data === 'object' && data !== null) {
        const record = data as Record<string, unknown>;
        const errorField = record['Error'] as Record<string, unknown> | string | undefined;
        if (errorField) {
          if (typeof errorField === 'string') { return errorField; }
          return String(errorField['message'] ?? errorField);
        }
        const errorLower = record['error'] as Record<string, unknown> | string | undefined;
        if (errorLower) {
          return typeof errorLower === 'string' ? errorLower : String(errorLower['message']);
        }
        if (record['message']) {
          return String(record['message']);
        }
      }
    }

    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Bad request. Please check your request parameters.';
      case 401:
        return 'Unauthorized. Please check your credentials.';
      case 403:
        return 'Forbidden. You do not have permission to access this resource.';
      case 404:
        return 'Resource not found.';
      case 408:
        return 'Request timeout.';
      case 429:
        return 'Rate limit exceeded. Please try again later.';
      case 500:
        return 'Internal server error.';
      case 502:
        return 'Bad gateway. The server received an invalid response.';
      case 503:
        return 'Service unavailable. The server is temporarily unavailable.';
      case 504:
        return 'Gateway timeout. The server did not respond in time.';
      default:
        return `HTTP ${status} error`;
    }
  }

  /**
   * Map HTTP status code to error code
   * @param status - HTTP status code
   * @returns Error code
   */
  private mapHttpStatusToErrorCode(status?: number): string {
    if (!status) {
      return ErrorCode.NETWORK_ERROR;
    }

    if (status === 400) {return ErrorCode.VALIDATION_ERROR;}
    if (status === 401) {return ErrorCode.UNAUTHORIZED;}
    if (status === 403) {return ErrorCode.FORBIDDEN;}
    if (status === 404) {return ErrorCode.NOT_FOUND;}
    if (status === 408) {return ErrorCode.TIMEOUT;}
    if (status === 429) {return ErrorCode.RATE_LIMITED;}
    if (status === 502) {return ErrorCode.BAD_GATEWAY;}
    if (status === 503) {return ErrorCode.SERVICE_UNAVAILABLE;}
    if (status >= 500) {return ErrorCode.SERVER_ERROR;}

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Map authentication error code to HTTP error code
   * @param authCode - Authentication error code
   * @returns Error code
   */
  private mapAuthErrorCode(authCode: AuthErrorCode): string {
    switch (authCode) {
      case AuthErrorCode.INVALID_CREDENTIALS:
      case AuthErrorCode.MISSING_CREDENTIALS:
        return ErrorCode.INVALID_CREDENTIALS;
      case AuthErrorCode.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case AuthErrorCode.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case AuthErrorCode.TOKEN_EXPIRED:
        return ErrorCode.TOKEN_EXPIRED;
      case AuthErrorCode.TIMEOUT:
        return ErrorCode.TIMEOUT;
      case AuthErrorCode.CONNECTION_FAILED:
      case AuthErrorCode.NETWORK_ERROR:
        return ErrorCode.NETWORK_ERROR;
      default:
        return ErrorCode.AUTH_FAILED;
    }
  }

  /**
   * Get error suggestions
   * @param errorCode - Error code
   * @returns Array of suggestions
   */
  private getErrorSuggestions(errorCode: string): string[] {
    const suggestions: Record<string, string[]> = {
      [ErrorCode.UNAUTHORIZED]: [
        'Check if your API key or credentials are correct',
        'Verify that your credentials have not expired',
        'Try re-authenticating',
      ],
      [ErrorCode.FORBIDDEN]: [
        'Verify that your account has permission to access this resource',
        'Check if the resource requires specific roles or permissions',
        'Contact your Maximo administrator',
      ],
      [ErrorCode.NOT_FOUND]: [
        'Verify that the resource ID or URL is correct',
        'Check if the resource exists in Maximo',
        'Ensure you are using the correct API endpoint',
      ],
      [ErrorCode.VALIDATION_ERROR]: [
        'Check that all required fields are provided',
        'Verify that field values are in the correct format',
        'Review the API documentation for field requirements',
      ],
      [ErrorCode.RATE_LIMITED]: [
        'Wait before making more requests',
        'Implement request throttling in your application',
        'Contact your administrator to increase rate limits',
      ],
      [ErrorCode.TIMEOUT]: [
        'Check your network connection',
        'Try increasing the request timeout',
        'Verify that the Maximo server is responding',
      ],
      [ErrorCode.NETWORK_ERROR]: [
        'Check your network connection',
        'Verify that the Maximo host URL is correct',
        'Check if the Maximo server is accessible',
        'Verify firewall settings',
      ],
      [ErrorCode.SERVER_ERROR]: [
        'Try again later',
        'Check Maximo server logs for details',
        'Contact your Maximo administrator',
      ],
    };

    return suggestions[errorCode] || [];
  }

  /**
   * Get authentication error suggestions
   * @param authCode - Authentication error code
   * @returns Array of suggestions
   */
  private getAuthErrorSuggestions(authCode: AuthErrorCode): string[] {
    const suggestions: Record<string, string[]> = {
      [AuthErrorCode.INVALID_CREDENTIALS]: [
        'Verify your API key or username/password',
        'Check if credentials are properly formatted',
        'Ensure there are no extra spaces in credentials',
      ],
      [AuthErrorCode.MISSING_CREDENTIALS]: [
        'Provide either an API key or username/password',
        'Check your configuration file',
      ],
      [AuthErrorCode.TOKEN_EXPIRED]: [
        'Re-authenticate to get a new token',
        'Enable automatic token refresh',
      ],
      [AuthErrorCode.CONNECTION_FAILED]: [
        'Check if the Maximo server is running',
        'Verify the host URL is correct',
        'Check network connectivity',
      ],
      [AuthErrorCode.INVALID_HOST]: [
        'Verify the host URL format (e.g., https://maximo.example.com)',
        'Ensure the URL includes the protocol (http:// or https://)',
      ],
    };

    return suggestions[authCode] || [];
  }

  /**
   * Extract retry-after header value
   * @param headers - Response headers
   * @returns Retry after seconds
   */
  private extractRetryAfter(headers: Record<string, unknown>): number | undefined {
    const retryAfter = (headers['retry-after'] ?? headers['Retry-After']) as string | undefined;
    if (!retryAfter) {
      return undefined;
    }

    // If it's a number, it's seconds
    const seconds = parseInt(String(retryAfter), 10);
    if (!isNaN(seconds)) {
      return seconds;
    }

    // If it's a date, calculate seconds until that date
    const date = new Date(String(retryAfter));
    if (!isNaN(date.getTime())) {
      return Math.max(0, Math.floor((date.getTime() - Date.now()) / 1000));
    }

    return undefined;
  }

  /**
   * Check if error is an Axios error
   * @param error - Error to check
   * @returns True if Axios error
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return typeof error === 'object' && error !== null && (error as Record<string, unknown>)['isAxiosError'] === true;
  }
}

/**
 * Default error handler instance
 */
export const errorHandler = new ErrorHandler();