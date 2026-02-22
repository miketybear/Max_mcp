/**
 * Test helper utilities
 * Provides common testing utilities and mock factories
 */

import { MaximoCredentials } from '../../src/auth/types';
import { ApiResponse } from '../../src/core/types';

/**
 * Create mock Maximo credentials for testing
 */
export function createMockCredentials(overrides?: Partial<MaximoCredentials>): MaximoCredentials {
  return {
    host: 'https://maximo.example.com',
    apiKey: 'test-api-key-12345',
    timeout: 30000,
    maxRetries: 3,
    ...overrides,
  };
}

/**
 * Create mock API success response
 */
export function createMockApiResponse<T>(data: T, overrides?: Partial<ApiResponse<T>>): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode: 200,
    headers: {},
    requestId: 'test-request-id',
    duration: 100,
    ...overrides,
  };
}

/**
 * Create mock API error response
 */
export function createMockApiError(message: string, statusCode: number = 400): ApiResponse<never> {
  return {
    success: false,
    error: message,
    errorCode: 'TEST_ERROR',
    statusCode,
    headers: {},
    requestId: 'test-request-id',
  };
}

/**
 * Wait for a specified time (useful for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock logger that captures log calls
 */
export function createMockLogger() {
  const logs: Array<{ level: string; message: string; meta?: any }> = [];

  return {
    info: jest.fn((message: string, meta?: any) => logs.push({ level: 'info', message, meta })),
    warn: jest.fn((message: string, meta?: any) => logs.push({ level: 'warn', message, meta })),
    error: jest.fn((message: string, meta?: any) => logs.push({ level: 'error', message, meta })),
    debug: jest.fn((message: string, meta?: any) => logs.push({ level: 'debug', message, meta })),
    getLogs: () => logs,
    clear: () => logs.splice(0, logs.length),
  };
}

/**
 * Mock axios response
 */
export function createMockAxiosResponse<T>(data: T, status: number = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * Mock axios error
 */
export function createMockAxiosError(message: string, code?: string, status?: number) {
  const error: any = new Error(message);
  error.isAxiosError = true;
  error.code = code;
  if (status) {
    error.response = {
      status,
      statusText: 'Error',
      data: { Error: { message } },
      headers: {},
      config: {} as any,
    };
  }
  return error;
}

/**
 * Create a spy on console methods
 */
export function spyOnConsole() {
  const originalConsole = { ...console };
  const spies = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
  };

  return {
    spies,
    restore: () => {
      Object.keys(spies).forEach((key) => {
        spies[key as keyof typeof spies].mockRestore();
      });
    },
  };
}

/**
 * Suppress console output during tests
 */
export function suppressConsole() {
  const spy = spyOnConsole();
  beforeAll(() => {
    // Spies are already set up
  });
  afterAll(() => {
    spy.restore();
  });
  return spy;
}