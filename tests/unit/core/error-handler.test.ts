/**
 * Unit tests for Error Handler
 */

import { AxiosError } from 'axios';
import { ErrorHandler } from '../../../src/core/error-handler';
import {
  HttpError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  ErrorCode,
} from '../../../src/core/types';
import {
  AuthenticationError,
  AuthErrorCode,
  InvalidCredentialsError,
} from '../../../src/auth/types';
import { createMockAxiosError } from '../../fixtures/test-helpers';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('handleError', () => {
    it('should return HttpError as-is with context', () => {
      const originalError = new HttpError(
        'Test error',
        500,
        ErrorCode.SERVER_ERROR
      );
      const context = { requestId: 'test-123', url: '/test' };

      const result = errorHandler.handleError(originalError, context);

      expect(result).toBe(originalError);
      expect(result.requestId).toBe('test-123');
    });

    it('should handle AuthenticationError', () => {
      const authError = new AuthenticationError(
        'Invalid credentials',
        AuthErrorCode.INVALID_CREDENTIALS,
        401
      );

      const result = errorHandler.handleError(authError);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.statusCode).toBe(401);
      expect(result.code).toBe(ErrorCode.INVALID_CREDENTIALS);
    });

    it('should handle Axios timeout error', () => {
      const axiosError = createMockAxiosError('Timeout', 'ETIMEDOUT');

      const result = errorHandler.handleError(axiosError);

      expect(result).toBeInstanceOf(TimeoutError);
      expect(result.statusCode).toBe(408);
    });

    it('should handle Axios network error', () => {
      const axiosError = createMockAxiosError('Network error', 'ECONNREFUSED');

      const result = errorHandler.handleError(axiosError);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('should handle Axios 429 rate limit error', () => {
      const axiosError = createMockAxiosError('Rate limited', undefined, 429);

      const result = errorHandler.handleError(axiosError);

      expect(result).toBeInstanceOf(RateLimitError);
      expect(result.statusCode).toBe(429);
    });

    it('should handle Axios 400 validation error', () => {
      const axiosError = createMockAxiosError('Bad request', undefined, 400);

      const result = errorHandler.handleError(axiosError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.statusCode).toBe(400);
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');

      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.message).toBe('Generic error');
      expect(result.statusCode).toBe(500);
    });

    it('should handle unknown error types', () => {
      const error = 'string error';

      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('isRetryableError', () => {
    it('should not retry ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(errorHandler.isRetryableError(error)).toBe(false);
    });

    it('should not retry authentication errors except token expired', () => {
      const invalidCredsError = new InvalidCredentialsError();
      expect(errorHandler.isRetryableError(invalidCredsError)).toBe(false);

      const tokenExpiredError = new AuthenticationError(
        'Token expired',
        AuthErrorCode.TOKEN_EXPIRED
      );
      expect(errorHandler.isRetryableError(tokenExpiredError)).toBe(true);
    });

    it('should retry TimeoutError', () => {
      const error = new TimeoutError();
      expect(errorHandler.isRetryableError(error)).toBe(true);
    });

    it('should retry RateLimitError', () => {
      const error = new RateLimitError();
      expect(errorHandler.isRetryableError(error)).toBe(true);
    });

    it('should retry HttpError with retryable status codes', () => {
      const retryableCodes = [408, 429, 500, 502, 503, 504];

      retryableCodes.forEach((code) => {
        const error = new HttpError('Error', code, ErrorCode.SERVER_ERROR);
        expect(errorHandler.isRetryableError(error)).toBe(true);
      });
    });

    it('should not retry HttpError with non-retryable status codes', () => {
      const nonRetryableCodes = [400, 401, 403, 404];

      nonRetryableCodes.forEach((code) => {
        const error = new HttpError('Error', code, ErrorCode.NOT_FOUND);
        expect(errorHandler.isRetryableError(error)).toBe(false);
      });
    });

    it('should retry Axios network errors', () => {
      const axiosError = createMockAxiosError('Network error', 'ECONNREFUSED');
      expect(errorHandler.isRetryableError(axiosError)).toBe(true);
    });

    it('should retry Axios errors with retryable status codes', () => {
      const axiosError = createMockAxiosError('Server error', undefined, 503);
      expect(errorHandler.isRetryableError(axiosError)).toBe(true);
    });

    it('should not retry unknown errors by default', () => {
      const error = { unknown: 'error' };
      expect(errorHandler.isRetryableError(error)).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format HttpError message', () => {
      const error = new HttpError('Test error', 404, ErrorCode.NOT_FOUND);
      const message = errorHandler.formatErrorMessage(error);

      expect(message).toContain('Test error');
      expect(message).toContain('Suggestions:');
    });

    it('should format AuthenticationError message', () => {
      const error = new AuthenticationError(
        'Invalid credentials',
        AuthErrorCode.INVALID_CREDENTIALS
      );
      const message = errorHandler.formatErrorMessage(error);

      expect(message).toContain('Invalid credentials');
      expect(message).toContain('Suggestions:');
    });

    it('should format Axios error message', () => {
      const axiosError = createMockAxiosError('Not found', undefined, 404);
      const message = errorHandler.formatErrorMessage(axiosError);

      // The mock creates response.data = { Error: { message: 'Not found' } }
      // so getHttpErrorMessage extracts "Not found" from data.Error.message
      expect(message).toContain('Not found');
    });

    it('should format generic Error message', () => {
      const error = new Error('Generic error');
      const message = errorHandler.formatErrorMessage(error);

      expect(message).toBe('Generic error');
    });

    it('should handle unknown error types', () => {
      const error = null;
      const message = errorHandler.formatErrorMessage(error);

      expect(message).toBe('An unknown error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should get code from HttpError', () => {
      const error = new HttpError('Error', 404, ErrorCode.NOT_FOUND);
      expect(errorHandler.getErrorCode(error)).toBe(ErrorCode.NOT_FOUND);
    });

    it('should map AuthenticationError code', () => {
      const error = new AuthenticationError(
        'Invalid',
        AuthErrorCode.INVALID_CREDENTIALS
      );
      expect(errorHandler.getErrorCode(error)).toBe(
        ErrorCode.INVALID_CREDENTIALS
      );
    });

    it('should map Axios error status to code', () => {
      const axiosError = createMockAxiosError('Not found', undefined, 404);
      expect(errorHandler.getErrorCode(axiosError)).toBe(ErrorCode.NOT_FOUND);
    });

    it('should return UNKNOWN_ERROR for unknown types', () => {
      const error = { unknown: 'error' };
      expect(errorHandler.getErrorCode(error)).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('network error messages', () => {
    it('should format ECONNREFUSED error', () => {
      const axiosError = createMockAxiosError(
        'Connection refused',
        'ECONNREFUSED'
      );
      const result = errorHandler.handleError(axiosError);

      expect(result.message).toContain('Connection refused');
      expect(result.message).toContain('Maximo server');
    });

    it('should format ENOTFOUND error', () => {
      const axiosError = createMockAxiosError('Host not found', 'ENOTFOUND');
      const result = errorHandler.handleError(axiosError);

      expect(result.message).toContain('Host not found');
    });

    it('should format ECONNABORTED error', () => {
      const axiosError = createMockAxiosError('Aborted', 'ECONNABORTED');
      const result = errorHandler.handleError(axiosError);

      expect(result).toBeInstanceOf(TimeoutError);
    });
  });

  describe('HTTP status code mapping', () => {
    const statusCodeTests = [
      { status: 400, code: ErrorCode.VALIDATION_ERROR },
      { status: 401, code: ErrorCode.UNAUTHORIZED },
      { status: 403, code: ErrorCode.FORBIDDEN },
      { status: 404, code: ErrorCode.NOT_FOUND },
      { status: 408, code: ErrorCode.TIMEOUT },
      { status: 429, code: ErrorCode.RATE_LIMITED },
      { status: 502, code: ErrorCode.BAD_GATEWAY },
      { status: 503, code: ErrorCode.SERVICE_UNAVAILABLE },
      { status: 500, code: ErrorCode.SERVER_ERROR },
    ];

    statusCodeTests.forEach(({ status, code }) => {
      it(`should map ${status} to ${code}`, () => {
        const axiosError = createMockAxiosError('Error', undefined, status);
        const result = errorHandler.handleError(axiosError);

        expect(result.code).toBe(code);
      });
    });
  });

  describe('error data extraction', () => {
    it('should extract error message from response data.Error', () => {
      const axiosError: any = createMockAxiosError('Error', undefined, 400);
      axiosError.response.data = {
        Error: { message: 'Custom error message' },
      };

      const result = errorHandler.handleError(axiosError);
      expect(result.message).toBe('Custom error message');
    });

    it('should extract error message from response data.error', () => {
      const axiosError: any = createMockAxiosError('Error', undefined, 400);
      axiosError.response.data = { error: 'Custom error' };

      const result = errorHandler.handleError(axiosError);
      expect(result.message).toBe('Custom error');
    });

    it('should extract error message from response data.message', () => {
      const axiosError: any = createMockAxiosError('Error', undefined, 400);
      axiosError.response.data = { message: 'Custom message' };

      const result = errorHandler.handleError(axiosError);
      expect(result.message).toBe('Custom message');
    });

    it('should use string response data directly', () => {
      const axiosError: any = createMockAxiosError('Error', undefined, 400);
      axiosError.response.data = 'String error message';

      const result = errorHandler.handleError(axiosError);
      expect(result.message).toBe('String error message');
    });
  });

  describe('retry-after header extraction', () => {
    it('should extract retry-after from rate limit response', () => {
      const axiosError: any = createMockAxiosError('Rate limited', undefined, 429);
      axiosError.response.headers = { 'retry-after': '60' };

      const result = errorHandler.handleError(axiosError) as RateLimitError;
      expect(result.retryAfter).toBe(60);
    });

    it('should handle retry-after as date', () => {
      const futureDate = new Date(Date.now() + 60000);
      const axiosError: any = createMockAxiosError('Rate limited', undefined, 429);
      axiosError.response.headers = { 'retry-after': futureDate.toUTCString() };

      const result = errorHandler.handleError(axiosError) as RateLimitError;
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });
});