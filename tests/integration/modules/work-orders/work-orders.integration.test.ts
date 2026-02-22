/**
 * Integration tests for Work Order operations
 * Uses real Maximo API with credentials from .env
 */

import { config } from 'dotenv';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { WorkOrderOperations } from '../../../../src/modules/work-orders/operations';
import { WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderSearch } from '../../../../src/modules/work-orders/types';
import { createAuthManager } from '../../../../src/auth';

// Load environment variables
config();

describe.skip('WorkOrder Integration Tests', () => {
  let client: MaximoClient;
  let operations: WorkOrderOperations;
  let testWorkOrderId: string | undefined;
  let testSiteId: string = 'YOURSITE'; // Replace with your Maximo site ID

  beforeAll(async () => {
    const apiKey = process.env.max_api_key;
    const baseUrl = process.env.max_url;

    if (!apiKey || !baseUrl) {
      throw new Error('Missing required environment variables: max_api_key and max_url');
    }

    // Create authentication manager
    const authManager = createAuthManager();

    // Authenticate with Maximo
    const authResult = await authManager.authenticate({
      host: baseUrl,
      apiKey,
      timeout: 30000,
      maxRetries: 3,
      validateSSL: true,
    });

    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    // Initialize client with auth manager
    client = new MaximoClient(authManager, {
      baseURL: baseUrl,
      timeout: 30000,
      retry: {
        maxRetries: 3,
      },
    });

    operations = new WorkOrderOperations(client);
  });

  afterAll(async () => {
    // Cleanup: Delete test work order if it was created
    if (testWorkOrderId) {
      try {
        await operations.delete(testWorkOrderId, testSiteId);
        console.log(`Cleaned up test work order: ${testWorkOrderId}`);
      } catch (error) {
        console.warn(`Failed to cleanup test work order ${testWorkOrderId}:`, error);
      }
    }
  });

  describe('Search Work Orders', () => {
    it('should search work orders with status filter', async () => {
      const searchCriteria: WorkOrderSearch = {
        status: 'CLOSE',
        pageSize: 5,
      };

      const result = await operations.search(searchCriteria);

      if (!result.success) {
        console.error('Search failed:', JSON.stringify(result, null, 2));
      }

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data?.workOrders)).toBe(true);

      console.log(`Found ${result.data?.workOrders?.length || 0} work orders with status CLOSE`);
    }, 30000);

    it('should search work orders without filters', async () => {
      const searchCriteria: WorkOrderSearch = {
        pageSize: 10,
      };

      const result = await operations.search(searchCriteria);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data?.workOrders)).toBe(true);

      console.log(`Found ${result.data?.workOrders?.length || 0} total work orders`);
    }, 30000);
  });

  describe('Get Work Order by ID', () => {
    it('should retrieve a specific work order', async () => {
      // First, search for a work order
      const searchResult = await operations.search({
        pageSize: 1,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.data?.workOrders?.length).toBeGreaterThan(0);

      const workOrderId = searchResult.data?.workOrders?.[0]?.wonum;
      const siteid = searchResult.data?.workOrders?.[0]?.siteid || testSiteId;
      expect(workOrderId).toBeDefined();

      // Now get the specific work order
      const result = await operations.get(workOrderId!, siteid);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.wonum).toBe(workOrderId);

      console.log(`Retrieved work order: ${workOrderId}`);
    }, 30000);
  });

  describe('Create Work Order', () => {
    it('should create a new work order', async () => {
      const timestamp = Date.now();
      const workOrderData: WorkOrderCreate = {
        description: `Integration Test WO - ${timestamp}`,
        siteid: testSiteId,
        worktype: 'CM',
      };

      const result = await operations.create(workOrderData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.description).toBe(workOrderData.description);

      // Store for cleanup
      testWorkOrderId = result.data?.wonum;

      console.log(`Created test work order: ${testWorkOrderId}`);
    }, 30000);
  });

  describe('Update Work Order', () => {
    it('should update an existing work order', async () => {
      // Skip if no test work order was created
      if (!testWorkOrderId) {
        console.warn('Skipping update test - no test work order created');
        return;
      }

      const updateData: WorkOrderUpdate = {
        wonum: testWorkOrderId,
        siteid: testSiteId,
        description: `Updated Integration Test WO - ${Date.now()}`,
      };

      const result = await operations.update(updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      console.log(`Updated work order: ${testWorkOrderId}`);
    }, 30000);
  });

  describe('Add Work Log', () => {
    it('should add a work log to a work order', async () => {
      if (!testWorkOrderId) {
        console.warn('Skipping work log test - no test work order created');
        return;
      }

      const result = await operations.addWorkLog({
        wonum: testWorkOrderId,
        siteid: testSiteId,
        logtype: 'WORK',
        description: 'Integration test work log entry',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      console.log(`Added work log to work order ${testWorkOrderId}`);
    }, 30000);
  });

  describe('Change Status', () => {
    it('should change work order status', async () => {
      if (!testWorkOrderId) {
        console.warn('Skipping status change test - no test work order created');
        return;
      }

      const result = await operations.changeStatus({
        wonum: testWorkOrderId,
        siteid: testSiteId,
        status: 'APPR',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      console.log(`Changed status of work order ${testWorkOrderId} to APPR`);
    }, 30000);
  });

  describe('Delete Work Order', () => {
    it('should delete the test work order', async () => {
      if (!testWorkOrderId) {
        console.warn('Skipping delete test - no test work order created');
        return;
      }

      const result = await operations.delete(testWorkOrderId, testSiteId);

      expect(result.success).toBe(true);

      console.log(`Deleted test work order: ${testWorkOrderId}`);

      // Clear the ID so afterAll doesn't try to delete again
      testWorkOrderId = undefined;
    }, 30000);
  });
});
