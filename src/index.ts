#!/usr/bin/env node

/**
 * IBM Maximo MAS 9.x MCP Server
 * 
 * This MCP server provides comprehensive access to IBM Maximo Application Suite 9.x
 * REST APIs for development, testing, and automation purposes.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Core modules
import { ConfigManager } from './config/index.js';
import { createAuthManager } from './auth/index.js';
import { MaximoClient } from './core/index.js';

// Module operations
import { WorkOrderOperations } from './modules/work-orders/index.js';
import { AssetOperations } from './modules/assets/index.js';
import { InventoryOperations } from './modules/inventory/index.js';
import { ServiceRequestOperations } from './modules/service-requests/index.js';
import { LocationOperations } from './modules/locations/index.js';
import { PurchaseOrderOperations } from './modules/purchase-orders/index.js';
import { PMOperations } from './modules/preventive-maintenance/index.js';
import { PersonLaborOperations } from './modules/persons-labor/index.js';
import { AttachmentOperations } from './modules/attachments/index.js';
import { ClassificationOperations } from './modules/classifications/index.js';
import { QuerySearchOperations } from './modules/query-search/index.js';
import { BulkOperations } from './modules/bulk-operations/index.js';
import { DevToolsOperations } from './modules/dev-tools/index.js';
import { JobPlanOperations } from './modules/plans/index.js';
import { AnalyticsOperations } from './modules/analytics/index.js';
import { SchedulerOperations } from './modules/scheduler/index.js';

// Module tools
import { createWorkOrderTools } from './modules/work-orders/index.js';
import { createAssetTools } from './modules/assets/index.js';
import { createInventoryTools } from './modules/inventory/index.js';
import { createServiceRequestTools } from './modules/service-requests/index.js';
import { createLocationTools } from './modules/locations/index.js';
import { createPurchaseOrderTools } from './modules/purchase-orders/index.js';
import { createPMTools } from './modules/preventive-maintenance/index.js';
import { createPersonLaborTools } from './modules/persons-labor/index.js';
import { createAttachmentTools } from './modules/attachments/index.js';
import { createClassificationTools } from './modules/classifications/index.js';
import { createQuerySearchTools } from './modules/query-search/index.js';
import { createBulkOperationTools } from './modules/bulk-operations/index.js';
import { createDevTools } from './modules/dev-tools/index.js';
import { createJobPlanTools } from './modules/plans/index.js';
import { createAnalyticsTools } from './modules/analytics/index.js';
import { createSchedulerTools } from './modules/scheduler/index.js';

import { createLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const logger = createLogger('MaximoMCPServer');

/**
 * Main MCP Server class for Maximo integration
 */
class MaximoMCPServer {
  private server: Server;
  private tools: Array<{
    name: string;
    description: string;
    inputSchema: any;
  }> = [];
  private toolHandlers: Map<string, (args: any) => Promise<any>> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'maximo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // NOTE: initializeModules() is async and must be called via init() before start()
    this.setupHandlers();
  }

  /**
   * Initialize modules asynchronously (must be called before start)
   */
  async init(): Promise<void> {
    await this.initializeModules();
  }

  /**
   * Initialize all Maximo modules and register tools
   */
  private async initializeModules(): Promise<void> {
    try {
      logger.info('Initializing Maximo MCP Server modules...');

      // Initialize configuration
      const configManager = ConfigManager.getInstance();
      configManager.initialize();
      const maximoConfig = configManager.getMaximoConfig();

      // Create authentication manager
      const authManager = createAuthManager();

      // Authenticate with Maximo
      const credentials = {
        host: maximoConfig.getHost(),
        apiKey: maximoConfig.getApiKey(),
        username: maximoConfig.getCredentials()?.username,
        password: maximoConfig.getCredentials()?.password,
        timeout: maximoConfig.getTimeout(),
        maxRetries: maximoConfig.getMaxRetries(),
        validateSSL: maximoConfig.shouldValidateSSL(),
      };

      const authResult = await authManager.authenticate(credentials);
      if (!authResult.success) {
        throw new Error(`Authentication failed: ${authResult.error}`);
      }

      logger.info('Authentication successful', {
        method: authResult.method,
      });

      // Create Maximo HTTP client
      const maximoClient = new MaximoClient(authManager, {
        baseURL: maximoConfig.getHost(),
        timeout: maximoConfig.getTimeout(),
        retry: {
          maxRetries: maximoConfig.getMaxRetries(),
        },
        cache: configManager.getCacheConfig(),
        rateLimit: configManager.getRateLimitConfig(),
      });

      // Initialize operation classes
      const workOrderOps = new WorkOrderOperations(maximoClient);
      const assetOps = new AssetOperations(maximoClient);
      const inventoryOps = new InventoryOperations(maximoClient);
      const serviceRequestOps = new ServiceRequestOperations(maximoClient);
      const locationOps = new LocationOperations(maximoClient);
      const purchaseOrderOps = new PurchaseOrderOperations(maximoClient);
      const pmOps = new PMOperations(maximoClient);
      const personLaborOps = new PersonLaborOperations(maximoClient);
      const attachmentOps = new AttachmentOperations(maximoClient);
      const classificationOps = new ClassificationOperations(maximoClient);
      const querySearchOps = new QuerySearchOperations(maximoClient);
      const bulkOps = new BulkOperations(maximoClient);
      const devToolsOps = new DevToolsOperations(maximoClient);
      const jobPlanOps = new JobPlanOperations(maximoClient);
      const analyticsOps = new AnalyticsOperations(maximoClient);
      const schedulerOps = new SchedulerOperations(maximoClient);

      // Create and register tools from each module
      const workOrderTools = createWorkOrderTools(workOrderOps);
      const assetTools = createAssetTools(assetOps);
      const inventoryTools = createInventoryTools(inventoryOps);
      const serviceRequestTools = createServiceRequestTools(serviceRequestOps);
      const locationTools = createLocationTools(locationOps);
      const purchaseOrderTools = createPurchaseOrderTools(purchaseOrderOps);
      const pmTools = createPMTools(pmOps);
      const personLaborTools = createPersonLaborTools(personLaborOps);
      const attachmentTools = createAttachmentTools(attachmentOps);
      const classificationTools = createClassificationTools(classificationOps);
      const querySearchTools = createQuerySearchTools(querySearchOps);
      const bulkOperationTools = createBulkOperationTools(bulkOps);
      const devTools = createDevTools(devToolsOps);
      const jobPlanTools = createJobPlanTools(jobPlanOps);
      const analyticsTools = createAnalyticsTools(analyticsOps);
      const schedulerTools = createSchedulerTools(schedulerOps);

      // Register all tools
      this.registerTools(workOrderTools, workOrderOps);
      this.registerTools(assetTools, assetOps);
      this.registerTools(inventoryTools, inventoryOps);
      this.registerTools(serviceRequestTools, serviceRequestOps);
      this.registerTools(locationTools, locationOps);
      this.registerTools(purchaseOrderTools, purchaseOrderOps);
      this.registerTools(pmTools, pmOps);
      this.registerTools(personLaborTools, personLaborOps);
      this.registerTools(attachmentTools, attachmentOps);
      this.registerTools(classificationTools, classificationOps);
      this.registerTools(querySearchTools, querySearchOps);
      this.registerTools(bulkOperationTools, bulkOps);
      this.registerTools(devTools, devToolsOps);
      this.registerTools(jobPlanTools, jobPlanOps);
      this.registerTools(analyticsTools, analyticsOps);
      this.registerTools(schedulerTools, schedulerOps);

      logger.info('All modules initialized successfully', {
        totalTools: this.tools.length,
        workOrders: workOrderTools.length,
        assets: assetTools.length,
        inventory: inventoryTools.length,
        serviceRequests: serviceRequestTools.length,
        locations: locationTools.length,
        purchaseOrders: purchaseOrderTools.length,
        preventiveMaintenance: pmTools.length,
        personsLabor: personLaborTools.length,
        attachments: attachmentTools.length,
        classifications: classificationTools.length,
        querySearch: querySearchTools.length,
        bulkOperations: bulkOperationTools.length,
        devTools: devTools.length,
        jobPlans: jobPlanTools.length,
        analytics: analyticsTools.length,
        scheduler: schedulerTools.length,
      });
    } catch (error) {
      logger.error('Failed to initialize modules', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Register tools and their handlers
   */
  private registerTools(
    tools: Array<{
      name: string;
      description: string;
      inputSchema: any;
      handler: (args: any) => Promise<any>;
    }>,
    _operations: any
  ): void {
    for (const tool of tools) {
      this.tools.push({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      });

      // Register handler
      this.toolHandlers.set(tool.name, tool.handler);
    }
  }

  /**
   * Set up MCP protocol handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.debug('Tool call received', { name, args });

      const handler = this.toolHandlers.get(name);
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await handler(args);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Tool execution failed', {
          tool: name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'maximo://config',
            name: 'Maximo Configuration',
            description: 'Current Maximo server configuration',
            mimeType: 'application/json',
          },
          {
            uri: 'maximo://api-endpoints',
            name: 'API Endpoints',
            description: 'List of available Maximo API endpoints',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'maximo://config') {
        const configManager = ConfigManager.getInstance();
        const config = configManager.toJSON();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      }

      if (uri === 'maximo://api-endpoints') {
        const { API_ENDPOINTS } = await import('./config/constants.js');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(API_ENDPOINTS, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('Maximo MCP Server running on stdio', {
      toolsRegistered: this.tools.length,
    });
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const server = new MaximoMCPServer();
    await server.init();
    await server.start();
  } catch (error) {
    logger.error('Failed to start Maximo MCP Server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error('Unhandled error in main', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});