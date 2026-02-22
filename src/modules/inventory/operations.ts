/**
 * Inventory Operations
 * Business logic for inventory and material management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  InventoryItem,
  Inventory,
  ItemCreate,
  InventorySearch,
  IssueTransaction,
  ReturnTransaction,
  TransferTransaction,
  AdjustmentTransaction,
  InventoryTransaction,
  ItemListResponse,
  TransactionListResponse,
  UpdateReorderPoint,
  GetStockLevels,
  GetItemsBelowReorder,
  StockLevel,
  StockLevelsResponse,
  ItemsBelowReorderResponse,
} from './types';
import {
  itemCreateSchema,
  inventorySearchSchema,
  issueTransactionSchema,
  returnTransactionSchema,
  transferTransactionSchema,
  adjustmentTransactionSchema,
  getInventorySchema,
  getTransactionsSchema,
  updateReorderPointSchema,
  getStockLevelsSchema,
  getItemsBelowReorderSchema,
} from './validators';

const logger = createLogger('InventoryOperations');

/**
 * Inventory Operations class
 * Provides methods for managing inventory items and transactions in Maximo
 */
export class InventoryOperations {
  private client: MaximoClient;

  /**
   * Create a new InventoryOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('InventoryOperations initialized');
  }

  /**
   * Create a new inventory item
   * @param data - Item creation data
   * @returns API response with created item
   */
  async createItem(data: ItemCreate): Promise<ApiResponse<InventoryItem>> {
    logger.info('Creating inventory item', { itemnum: data.itemnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = itemCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<InventoryItem>(
        API_ENDPOINTS.ITEMS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Inventory item created successfully', {
          itemnum: response.data.itemnum,
          siteid: response.data.siteid,
          itemtype: response.data.itemtype,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create inventory item', { error });
      throw error;
    }
  }

  /**
   * Get inventory balance for an item in a storeroom
   * @param itemnum - Item number
   * @param location - Storeroom location
   * @param siteid - Site identifier
   * @returns API response with inventory balance
   */
  async getInventory(
    itemnum: string,
    location: string,
    siteid: string
  ): Promise<ApiResponse<Inventory>> {
    logger.info('Retrieving inventory balance', { itemnum, location, siteid });

    try {
      // Validate input
      const validated = getInventorySchema.parse({ itemnum, location, siteid });

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `itemnum="${validated.itemnum}" and location="${validated.location}" and siteid="${validated.siteid}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<Inventory[]>(
        API_ENDPOINTS.INVENTORY,
        params
      );

      if (response.success && response.data && response.data.length > 0) {
        const inventoryData = response.data[0]!;
        logger.info('Inventory balance retrieved successfully', {
          itemnum: validated.itemnum,
          location: validated.location,
          curbal: inventoryData.curbal,
        });

        return {
          ...response,
          data: inventoryData,
        };
      }

      // No inventory found
      logger.warn('Inventory balance not found', { itemnum, location, siteid });
      return {
        success: false,
        error: 'Inventory balance not found',
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve inventory balance', { error });
      throw error;
    }
  }

  /**
   * Issue inventory to a work order or asset
   * @param transaction - Issue transaction data
   * @returns API response with transaction result
   */
  async issueInventory(
    transaction: IssueTransaction
  ): Promise<ApiResponse<InventoryTransaction>> {
    logger.info('Issuing inventory', {
      itemnum: transaction.itemnum,
      location: transaction.location,
      quantity: transaction.quantity,
      wonum: transaction.wonum,
      assetnum: transaction.assetnum,
    });

    try {
      // Validate input
      const validated = issueTransactionSchema.parse(transaction);

      // Prepare transaction data
      const transactionData = {
        itemnum: validated.itemnum,
        location: validated.location,
        siteid: validated.siteid,
        quantity: validated.quantity,
        transtype: 'ISSUE',
        transdate: validated.transdate || new Date().toISOString(),
        wonum: validated.wonum,
        assetnum: validated.assetnum,
        binnum: validated.binnum,
        lotnum: validated.lotnum,
        gldebitacct: validated.gldebitacct,
        glcreditacct: validated.glcreditacct,
        memo: validated.memo,
        issuetype: validated.issuetype,
        taskid: validated.taskid,
        linecost: validated.linecost,
        unitcost: validated.unitcost,
        conversion: validated.conversion,
        issueunit: validated.issueunit,
        enterby: validated.enterby,
      };

      // Make API request
      const response = await this.client.post<InventoryTransaction>(
        API_ENDPOINTS.INVTRANS,
        transactionData
      );

      if (response.success && response.data) {
        logger.info('Inventory issued successfully', {
          itemnum: validated.itemnum,
          location: validated.location,
          quantity: validated.quantity,
          transactionId: response.data.invtransid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to issue inventory', { error });
      throw error;
    }
  }

  /**
   * Return inventory to storeroom
   * @param transaction - Return transaction data
   * @returns API response with transaction result
   */
  async returnInventory(
    transaction: ReturnTransaction
  ): Promise<ApiResponse<InventoryTransaction>> {
    logger.info('Returning inventory', {
      itemnum: transaction.itemnum,
      location: transaction.location,
      quantity: transaction.quantity,
      wonum: transaction.wonum,
    });

    try {
      // Validate input
      const validated = returnTransactionSchema.parse(transaction);

      // Prepare transaction data
      const transactionData = {
        itemnum: validated.itemnum,
        location: validated.location,
        siteid: validated.siteid,
        quantity: validated.quantity,
        transtype: 'RETURN',
        transdate: validated.transdate || new Date().toISOString(),
        wonum: validated.wonum,
        rotassetnum: validated.rotassetnum,
        binnum: validated.binnum,
        lotnum: validated.lotnum,
        memo: validated.memo,
        linecost: validated.linecost,
        unitcost: validated.unitcost,
        conversion: validated.conversion,
        issueunit: validated.issueunit,
        enterby: validated.enterby,
        conditioncode: validated.conditioncode,
      };

      // Make API request
      const response = await this.client.post<InventoryTransaction>(
        API_ENDPOINTS.INVTRANS,
        transactionData
      );

      if (response.success && response.data) {
        logger.info('Inventory returned successfully', {
          itemnum: validated.itemnum,
          location: validated.location,
          quantity: validated.quantity,
          transactionId: response.data.invtransid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to return inventory', { error });
      throw error;
    }
  }

  /**
   * Transfer inventory between storerooms
   * @param transaction - Transfer transaction data
   * @returns API response with transaction result
   */
  async transferInventory(
    transaction: TransferTransaction
  ): Promise<ApiResponse<InventoryTransaction>> {
    logger.info('Transferring inventory', {
      itemnum: transaction.itemnum,
      fromstoreloc: transaction.fromstoreloc,
      tostoreloc: transaction.tostoreloc,
      quantity: transaction.quantity,
    });

    try {
      // Validate input
      const validated = transferTransactionSchema.parse(transaction);

      // Prepare transaction data
      const transactionData = {
        itemnum: validated.itemnum,
        fromstoreloc: validated.fromstoreloc,
        tostoreloc: validated.tostoreloc,
        siteid: validated.siteid,
        quantity: validated.quantity,
        transtype: 'TRANSFER',
        transdate: validated.transdate || new Date().toISOString(),
        frombinnum: validated.frombinnum,
        tobinnum: validated.tobinnum,
        fromlotnum: validated.fromlotnum,
        tolotnum: validated.tolotnum,
        memo: validated.memo,
        linecost: validated.linecost,
        unitcost: validated.unitcost,
        enterby: validated.enterby,
      };

      // Make API request
      const response = await this.client.post<InventoryTransaction>(
        API_ENDPOINTS.INVTRANS,
        transactionData
      );

      if (response.success && response.data) {
        logger.info('Inventory transferred successfully', {
          itemnum: validated.itemnum,
          fromstoreloc: validated.fromstoreloc,
          tostoreloc: validated.tostoreloc,
          quantity: validated.quantity,
          transactionId: response.data.invtransid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to transfer inventory', { error });
      throw error;
    }
  }

  /**
   * Adjust inventory balance (physical count adjustment)
   * @param transaction - Adjustment transaction data
   * @returns API response with transaction result
   */
  async adjustInventory(
    transaction: AdjustmentTransaction
  ): Promise<ApiResponse<InventoryTransaction>> {
    logger.info('Adjusting inventory balance', {
      itemnum: transaction.itemnum,
      location: transaction.location,
      physcnt: transaction.physcnt,
    });

    try {
      // Validate input
      const validated = adjustmentTransactionSchema.parse(transaction);

      // Prepare transaction data
      const transactionData = {
        itemnum: validated.itemnum,
        location: validated.location,
        siteid: validated.siteid,
        physcnt: validated.physcnt,
        transtype: 'ADJUSTMENT',
        transdate: validated.transdate || new Date().toISOString(),
        binnum: validated.binnum,
        lotnum: validated.lotnum,
        memo: validated.reason,
        gldebitacct: validated.gldebitacct,
        glcreditacct: validated.glcreditacct,
        enterby: validated.enterby,
        reconciled: validated.reconciled,
      };

      // Make API request
      const response = await this.client.post<InventoryTransaction>(
        API_ENDPOINTS.INVTRANS,
        transactionData
      );

      if (response.success && response.data) {
        logger.info('Inventory adjusted successfully', {
          itemnum: validated.itemnum,
          location: validated.location,
          physcnt: validated.physcnt,
          transactionId: response.data.invtransid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to adjust inventory', { error });
      throw error;
    }
  }

  /**
   * Get transaction history for an item in a storeroom
   * @param itemnum - Item number
   * @param location - Storeroom location
   * @param siteid - Site identifier
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @param pageSize - Optional page size
   * @param page - Optional page number
   * @returns API response with transaction list
   */
  async getTransactions(
    itemnum: string,
    location: string,
    siteid: string,
    startDate?: string,
    endDate?: string,
    pageSize?: number,
    page?: number
  ): Promise<ApiResponse<TransactionListResponse>> {
    logger.info('Retrieving inventory transactions', {
      itemnum,
      location,
      siteid,
      startDate,
      endDate,
    });

    try {
      // Validate input
      const validated = getTransactionsSchema.parse({
        itemnum,
        location,
        siteid,
        startDate,
        endDate,
        pageSize,
        page,
      });

      // Build where clause
      let whereClause = `itemnum="${validated.itemnum}" and location="${validated.location}" and siteid="${validated.siteid}"`;

      // Add date range filter if provided
      if (validated.startDate && validated.endDate) {
        whereClause += ` and transdate>="${validated.startDate}" and transdate<="${validated.endDate}"`;
      } else if (validated.startDate) {
        whereClause += ` and transdate>="${validated.startDate}"`;
      } else if (validated.endDate) {
        whereClause += ` and transdate<="${validated.endDate}"`;
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClause,
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.orderBy': '-transdate', // Most recent first
      };

      if (validated.page && validated.page > 1) {
        params['oslc.page'] = validated.page;
      }

      // Make API request
      const response = await this.client.get<InventoryTransaction[]>(
        API_ENDPOINTS.INVTRANS,
        params
      );

      if (response.success && response.data) {
        const totalCount = response.pagination?.totalCount || response.data.length;
        const currentPageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const currentPage = validated.page || 1;
        const totalPages = Math.ceil(totalCount / currentPageSize);

        logger.info('Inventory transactions retrieved successfully', {
          itemnum: validated.itemnum,
          location: validated.location,
          count: response.data.length,
          totalCount,
        });

        return {
          ...response,
          data: {
            transactions: response.data,
            totalCount,
            page: currentPage,
            pageSize: currentPageSize,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to retrieve transactions',
        errorCode: 'INTERNAL_ERROR',
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve inventory transactions', { error });
      throw error;
    }
  }

  /**
   * Search inventory items with filters
   * @param criteria - Search criteria
   * @returns API response with item list
   */
  async searchItems(criteria: InventorySearch): Promise<ApiResponse<ItemListResponse>> {
    logger.info('Searching inventory items', { criteria });

    try {
      // Validate input
      const validated = inventorySearchSchema.parse(criteria);

      // Build where clause
      const whereClauses: string[] = [];

      if (validated.itemtype) {
        if (Array.isArray(validated.itemtype)) {
          const types = validated.itemtype.map((t) => `"${t}"`).join(',');
          whereClauses.push(`itemtype in [${types}]`);
        } else {
          whereClauses.push(`itemtype="${validated.itemtype}"`);
        }
      }

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statuses = validated.status.map((s) => `"${s}"`).join(',');
          whereClauses.push(`status in [${statuses}]`);
        } else {
          whereClauses.push(`status="${validated.status}"`);
        }
      }

      if (validated.commoditygroup) {
        whereClauses.push(`commoditygroup="${validated.commoditygroup}"`);
      }

      if (validated.manufacturer) {
        whereClauses.push(`manufacturer="${validated.manufacturer}"`);
      }

      if (validated.description) {
        whereClauses.push(`description~"%${validated.description}%"`);
      }

      if (validated.location) {
        whereClauses.push(`location="${validated.location}"`);
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.orgid) {
        whereClauses.push(`orgid="${validated.orgid}"`);
      }

      if (validated.rotating !== undefined) {
        whereClauses.push(`rotating=${validated.rotating}`);
      }

      if (validated.conditionenabled !== undefined) {
        whereClauses.push(`conditionenabled=${validated.conditionenabled}`);
      }

      if (validated.vendor) {
        whereClauses.push(`vendor="${validated.vendor}"`);
      }

      // Use custom where clause if provided
      if (validated.where) {
        whereClauses.push(validated.where);
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      if (whereClauses.length > 0) {
        params['oslc.where'] = whereClauses.join(' and ');
      }

      if (validated.select && validated.select.length > 0) {
        params['oslc.select'] = validated.select.join(',');
      }

      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      if (validated.page && validated.page > 1) {
        params['oslc.page'] = validated.page;
      }

      // Make API request
      const response = await this.client.get<InventoryItem[]>(
        API_ENDPOINTS.ITEMS,
        params
      );

      if (response.success && response.data) {
        const totalCount = response.pagination?.totalCount || response.data.length;
        const currentPageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const currentPage = validated.page || 1;
        const totalPages = Math.ceil(totalCount / currentPageSize);

        logger.info('Inventory items search completed', {
          count: response.data.length,
          totalCount,
          page: currentPage,
        });

        return {
          ...response,
          data: {
            items: response.data,
            totalCount,
            page: currentPage,
            pageSize: currentPageSize,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to search items',
        errorCode: 'INTERNAL_ERROR',
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to search inventory items', { error });
      throw error;
    }
  }

  /**
   * Update reorder point and related inventory planning fields
   * @param data - Reorder point update data
   * @returns API response with updated inventory record
   */
  async updateReorderPoint(data: UpdateReorderPoint): Promise<ApiResponse<Inventory>> {
    logger.info('Updating reorder point', {
      itemnum: data.itemnum,
      location: data.location,
      siteid: data.siteid,
    });

    try {
      // Validate input
      const validated = updateReorderPointSchema.parse(data);

      // Extract validated fields for cleaner access
      const itemnum = validated['itemnum'] as string;
      const location = validated['location'] as string;
      const siteid = validated['siteid'] as string;
      const reorder = validated['reorder'] as number | undefined;
      const minlevel = validated['minlevel'] as number | undefined;
      const maxlevel = validated['maxlevel'] as number | undefined;
      const orderqty = validated['orderqty'] as number | undefined;

      // First, find the inventory balance record to get its href
      const params: OSLCQueryParams = {
        'oslc.where': `itemnum="${itemnum}" and location="${location}" and siteid="${siteid}"`,
        'oslc.pageSize': 1,
      };

      const lookupResponse = await this.client.get<Inventory[]>(
        API_ENDPOINTS.INVENTORY,
        params
      );

      if (!lookupResponse.success || !lookupResponse.data || lookupResponse.data.length === 0) {
        logger.warn('Inventory balance not found for reorder point update', {
          itemnum,
          location,
          siteid,
        });
        return {
          success: false,
          error: `Inventory balance not found for item ${itemnum} at location ${location}`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: lookupResponse.headers,
          requestId: lookupResponse.requestId,
        };
      }

      // Build patch data with only provided fields
      const patchData: Record<string, number> = {};
      if (reorder !== undefined) patchData['reorder'] = reorder;
      if (minlevel !== undefined) patchData['minlevel'] = minlevel;
      if (maxlevel !== undefined) patchData['maxlevel'] = maxlevel;
      if (orderqty !== undefined) patchData['orderqty'] = orderqty;

      // Use the href from the looked-up record, or fall back to the endpoint with query
      const inventoryRecord = lookupResponse.data[0]!;
      const patchUrl = inventoryRecord.href || API_ENDPOINTS.INVENTORY;

      const response = await this.client.patch<Inventory>(
        patchUrl,
        patchData
      );

      if (response.success && response.data) {
        logger.info('Reorder point updated successfully', {
          itemnum,
          location,
          reorder,
          minlevel,
          maxlevel,
          orderqty,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update reorder point', { error });
      throw error;
    }
  }

  /**
   * Get stock levels across storerooms for an item
   * @param data - Stock levels query parameters
   * @returns API response with stock levels across storerooms
   */
  async getStockLevels(data: GetStockLevels): Promise<ApiResponse<StockLevelsResponse>> {
    logger.info('Retrieving stock levels', {
      itemnum: data.itemnum,
      siteid: data.siteid,
      includeAllStorerooms: data.includeAllStorerooms,
    });

    try {
      // Validate input
      const validated = getStockLevelsSchema.parse(data);

      // Build where clause
      let whereClause = `itemnum="${validated.itemnum}"`;
      if (validated.siteid && !validated.includeAllStorerooms) {
        whereClause += ` and siteid="${validated.siteid}"`;
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClause,
        'oslc.select': 'itemnum,location,curbal,minlevel,maxlevel,reorder,orderqty,issueunit',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      // Make API request
      const response = await this.client.get<StockLevel[]>(
        API_ENDPOINTS.INVENTORY,
        params
      );

      if (response.success && response.data) {
        const totalCount = response.pagination?.totalCount || response.data.length;

        logger.info('Stock levels retrieved successfully', {
          itemnum: validated.itemnum,
          storeroomCount: response.data.length,
          totalCount,
        });

        return {
          ...response,
          data: {
            itemnum: validated.itemnum,
            storerooms: response.data,
            totalCount,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to retrieve stock levels',
        errorCode: 'INTERNAL_ERROR',
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve stock levels', { error });
      throw error;
    }
  }

  /**
   * Get items where current balance is at or below the reorder point
   * @param data - Query parameters for items below reorder
   * @returns API response with items needing reorder
   */
  async getItemsBelowReorder(
    data: GetItemsBelowReorder
  ): Promise<ApiResponse<ItemsBelowReorderResponse>> {
    logger.info('Retrieving items below reorder point', {
      siteid: data.siteid,
      location: data.location,
    });

    try {
      // Validate input
      const validated = getItemsBelowReorderSchema.parse(data);

      // Build where clause - items where current balance <= reorder point and reorder > 0
      const whereClauses: string[] = ['curbal<=reorder', 'reorder>0'];

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.location) {
        whereClauses.push(`location="${validated.location}"`);
      }

      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': whereClauses.join(' and '),
        'oslc.select': 'itemnum,location,curbal,minlevel,maxlevel,reorder,orderqty,issueunit',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.orderBy': '+itemnum',
      };

      // Make API request
      const response = await this.client.get<StockLevel[]>(
        API_ENDPOINTS.INVENTORY,
        params
      );

      if (response.success && response.data) {
        const totalCount = response.pagination?.totalCount || response.data.length;

        logger.info('Items below reorder point retrieved successfully', {
          count: response.data.length,
          totalCount,
        });

        return {
          ...response,
          data: {
            items: response.data,
            totalCount,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to retrieve items below reorder point',
        errorCode: 'INTERNAL_ERROR',
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve items below reorder point', { error });
      throw error;
    }
  }
}