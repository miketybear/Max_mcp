/**
 * Jest setup file
 * Mocks modules that don't work well with Jest
 */

// Mock uuid module to avoid ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substring(7),
}));
