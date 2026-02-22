/**
 * Purchase Order Operations
 * Business logic for purchase order management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderUpdate,
  PurchaseOrderSearch,
  PurchaseOrderReceipt,
  PurchaseOrderApproval,
  PurchaseOrderListResponse,
  PurchaseOrderAddLineItem,
  PurchaseOrderUpdateLineItem,
  PurchaseOrderRemoveLineItem,
  PurchaseOrderSubmitForApproval,
  PurchaseOrderReject,
  PurchaseOrderReceiveLineItem,
  PurchaseOrderGetReceipts,
  PurchaseOrderLine,
  PurchaseOrderReceiptListResponse,
} from './types';
import {
  purchaseOrderCreateSchema,
  purchaseOrderUpdateSchema,
  purchaseOrderSearchSchema,
  purchaseOrderReceiptSchema,
  purchaseOrderApprovalSchema,
  purchaseOrderAddLineItemSchema,
  purchaseOrderUpdateLineItemSchema,
  purchaseOrderRemoveLineItemSchema,
  purchaseOrderSubmitForApprovalSchema,
  purchaseOrderRejectSchema,
  purchaseOrderReceiveLineItemSchema,
  purchaseOrderGetReceiptsSchema,
} from './validators';

const logger = createLogger('PurchaseOrderOperations');

/**
 * Purchase Order Operations class
 * Provides methods for managing purchase orders in Maximo
 */
export class PurchaseOrderOperations {
  private client: MaximoClient;

  /**
   * Create a new PurchaseOrderOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('PurchaseOrderOperations initialized');
  }

  /**
   * Create a new purchase order
   * @param data - Purchase order creation data
   * @returns API response with created purchase order
   */
  async create(data: PurchaseOrderCreate): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Creating purchase order', { vendor: data.vendor, siteid: data.siteid });

    try {
      // Validate input
      const validated = purchaseOrderCreateSchema.parse(data);

      // Make API request
      const response = await this.client.post<PurchaseOrder>(
        API_ENDPOINTS.PURCHASE_ORDERS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Purchase order created successfully', {
          ponum: response.data.ponum,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create purchase order', { error });
      throw error;
    }
  }

  /**
   * Get purchase order by number
   * @param ponum - Purchase order number
   * @param siteid - Site identifier (optional)
   * @returns API response with purchase order data
   */
  async get(ponum: string, siteid?: string): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Retrieving purchase order', { ponum, siteid });

    try {
      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': siteid ? `ponum="${ponum}" and siteid="${siteid}"` : `ponum="${ponum}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: PurchaseOrder[] }>(
        API_ENDPOINTS.PURCHASE_ORDERS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Purchase order retrieved successfully', { ponum, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // Purchase order not found
      return {
        success: false,
        error: `Purchase order ${ponum} not found${siteid ? ` in site ${siteid}` : ''}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve purchase order', { ponum, siteid, error });
      throw error;
    }
  }

  /**
   * Update purchase order
   * @param ponum - Purchase order number
   * @param siteid - Site identifier (optional)
   * @param data - Update data
   * @returns API response with updated purchase order
   */
  async update(
    ponum: string,
    siteid: string | undefined,
    data: PurchaseOrderUpdate
  ): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Updating purchase order', { ponum, siteid });

    try {
      // Validate input
      const validated = purchaseOrderUpdateSchema.parse(data);

      // First, get the purchase order to get its href
      const getResponse = await this.get(ponum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const po = getResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make update request
      const response = await this.client.patch<PurchaseOrder>(href, validated);

      if (response.success && response.data) {
        logger.info('Purchase order updated successfully', { ponum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update purchase order', { ponum, siteid, error });
      throw error;
    }
  }

  /**
   * Delete purchase order
   * @param ponum - Purchase order number
   * @param siteid - Site identifier (optional)
   * @returns API response
   */
  async delete(ponum: string, siteid?: string): Promise<ApiResponse<void>> {
    logger.info('Deleting purchase order', { ponum, siteid });

    try {
      // First, get the purchase order to get its href
      const getResponse = await this.get(ponum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return {
          success: false,
          error: getResponse.error,
          errorCode: getResponse.errorCode,
          statusCode: getResponse.statusCode,
          headers: getResponse.headers,
          requestId: getResponse.requestId,
        };
      }

      const po = getResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: getResponse.requestId,
        };
      }

      // Make delete request
      const response = await this.client.delete<void>(href);

      if (response.success) {
        logger.info('Purchase order deleted successfully', { ponum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete purchase order', { ponum, siteid, error });
      throw error;
    }
  }

  /**
   * Receive purchase order items
   * @param data - Receipt data
   * @returns API response with receipt record
   */
  async receive(data: PurchaseOrderReceipt): Promise<ApiResponse<any>> {
    logger.info('Receiving purchase order items', {
      ponum: data.ponum,
      polinenum: data.polinenum,
    });

    try {
      // Validate input
      const validated = purchaseOrderReceiptSchema.parse(data);

      // Get the purchase order first
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return {
          success: false,
          error: `Purchase order ${validated.ponum} not found`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: poResponse.headers || {},
          requestId: poResponse.requestId,
        };
      }

      const po = poResponse.data;

      // Build receipt payload
      const receiptPayload = {
        ponum: validated.ponum,
        polinenum: validated.polinenum,
        quantity: validated.quantity,
        receiptdate: validated.receiptdate || new Date().toISOString(),
        tostoreloc: validated.tostoreloc,
        siteid: validated.siteid || po.siteid,
        comments: validated.comments,
      };

      // Make API request to receipt endpoint
      const response = await this.client.post<any>(
        '/maximo/api/os/mxreceipt',
        receiptPayload
      );

      if (response.success) {
        logger.info('Purchase order items received successfully', {
          ponum: validated.ponum,
          polinenum: validated.polinenum,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to receive purchase order items', { error });
      throw error;
    }
  }

  /**
   * Approve purchase order
   * @param data - Approval data
   * @returns API response with approved purchase order
   */
  async approve(data: PurchaseOrderApproval): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Approving purchase order', { ponum: data.ponum });

    try {
      // Validate input
      const validated = purchaseOrderApprovalSchema.parse(data);

      // Get the purchase order first
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return poResponse;
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // Build approval payload
      const approvalPayload = {
        status: 'APPR',
        approvedby: validated.memo ? `Approved: ${validated.memo}` : 'Approved',
        approveddate: new Date().toISOString(),
      };

      // Make update request
      const response = await this.client.patch<PurchaseOrder>(href, approvalPayload);

      if (response.success && response.data) {
        logger.info('Purchase order approved successfully', { ponum: validated.ponum });
      }

      return response;
    } catch (error) {
      logger.error('Failed to approve purchase order', { error });
      throw error;
    }
  }

  /**
   * Search purchase orders
   * @param params - Search parameters
   * @returns API response with list of purchase orders
   */
  async search(params: PurchaseOrderSearch): Promise<ApiResponse<PurchaseOrderListResponse>> {
    logger.info('Searching purchase orders', { filters: Object.keys(params) });

    try {
      // Validate input
      const validated = purchaseOrderSearchSchema.parse(params);

      // Build OSLC query
      const whereConditions: string[] = [];

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s) => `"${s}"`).join(',');
          whereConditions.push(`status in (${statusList})`);
        } else {
          whereConditions.push(`status="${validated.status}"`);
        }
      }

      if (validated.vendor) {
        whereConditions.push(`vendor="${validated.vendor}"`);
      }

      if (validated.siteid) {
        whereConditions.push(`siteid="${validated.siteid}"`);
      }

      if (validated.potype) {
        if (Array.isArray(validated.potype)) {
          const typeList = validated.potype.map((t) => `"${t}"`).join(',');
          whereConditions.push(`potype in (${typeList})`);
        } else {
          whereConditions.push(`potype="${validated.potype}"`);
        }
      }

      if (validated.buyer) {
        whereConditions.push(`buyer="${validated.buyer}"`);
      }

      if (validated.dateFrom || validated.dateTo) {
        if (validated.dateFrom && validated.dateTo) {
          whereConditions.push(
            `orderdate>="${validated.dateFrom}" and orderdate<="${validated.dateTo}"`
          );
        } else if (validated.dateFrom) {
          whereConditions.push(`orderdate>="${validated.dateFrom}"`);
        } else if (validated.dateTo) {
          whereConditions.push(`orderdate<="${validated.dateTo}"`);
        }
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' and ') : undefined;

      // Build query parameters
      const queryParams: OSLCQueryParams = {
        'oslc.select': 'ponum,description,status,statusdate,vendor,siteid,orgid,potype,orderdate,reqdate,totalcost,buyer',
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
        'oslc.pageNumber': validated.pageNum || 1,
      };

      if (whereClause) {
        queryParams['oslc.where'] = whereClause;
      }

      // Make API request
      const response = await this.client.get<PurchaseOrderListResponse>(
        API_ENDPOINTS.PURCHASE_ORDERS,
        queryParams
      );

      if (response.success && response.data) {
        logger.info('Purchase orders retrieved successfully', {
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to search purchase orders', { error });
      throw error;
    }
  }

  /**
   * Add a line item to a purchase order
   * @param data - Line item data including ponum, siteid, and line details
   * @returns API response with created line item
   */
  async addLineItem(data: PurchaseOrderAddLineItem): Promise<ApiResponse<PurchaseOrderLine>> {
    logger.info('Adding line item to purchase order', { ponum: data.ponum, siteid: data.siteid });

    try {
      // Validate input
      const validated = purchaseOrderAddLineItemSchema.parse(data);

      // Get the purchase order to get its href
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return {
          success: false,
          error: `Purchase order ${validated.ponum} not found in site ${validated.siteid}`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: poResponse.headers || {},
          requestId: poResponse.requestId,
        };
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // Build line item payload (exclude ponum and siteid)
      const linePayload: Record<string, any> = {
        description: validated.description,
        orderqty: validated.orderqty,
      };

      if (validated.itemnum) linePayload['itemnum'] = validated.itemnum;
      if (validated.unitcost !== undefined) linePayload['unitcost'] = validated.unitcost;
      if (validated.orderunit) linePayload['orderunit'] = validated.orderunit;
      if (validated.storeloc) linePayload['storeloc'] = validated.storeloc;
      if (validated.gldebitacct) linePayload['gldebitacct'] = validated.gldebitacct;

      // POST to the POLINE child collection
      const polineUrl = `${href}/POLINE`;
      const response = await this.client.post<PurchaseOrderLine>(polineUrl, linePayload);

      if (response.success && response.data) {
        logger.info('Line item added successfully', {
          ponum: validated.ponum,
          siteid: validated.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to add line item to purchase order', { error });
      throw error;
    }
  }

  /**
   * Get all line items for a purchase order
   * @param ponum - Purchase order number
   * @param siteid - Site identifier
   * @returns API response with list of line items
   */
  async getLineItems(ponum: string, siteid: string): Promise<ApiResponse<PurchaseOrderLine[]>> {
    logger.info('Retrieving line items for purchase order', { ponum, siteid });

    try {
      // Validate input
      const validated = purchaseOrderGetReceiptsSchema.parse({ ponum, siteid });

      // Build query parameters to include poline child objects
      const params: OSLCQueryParams = {
        'oslc.where': `ponum="${validated.ponum}" and siteid="${validated.siteid}"`,
        'oslc.select': 'ponum,siteid,poline{*}',
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: PurchaseOrder[] }>(
        API_ENDPOINTS.PURCHASE_ORDERS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        const po = response.data.member[0] as PurchaseOrder;
        const lines = po.poline || [];
        logger.info('Line items retrieved successfully', {
          ponum: validated.ponum,
          count: lines.length,
        });
        return {
          ...response,
          data: lines,
        };
      }

      // Purchase order not found
      return {
        success: false,
        error: `Purchase order ${validated.ponum} not found in site ${validated.siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve line items', { ponum, siteid, error });
      throw error;
    }
  }

  /**
   * Update a specific line item on a purchase order
   * @param data - Update line item data
   * @returns API response with updated line item
   */
  async updateLineItem(data: PurchaseOrderUpdateLineItem): Promise<ApiResponse<PurchaseOrderLine>> {
    logger.info('Updating line item on purchase order', {
      ponum: data.ponum,
      siteid: data.siteid,
      polinenum: data.polinenum,
    });

    try {
      // Validate input
      const validated = purchaseOrderUpdateLineItemSchema.parse(data);

      // Get the purchase order to get its href
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return {
          success: false,
          error: `Purchase order ${validated.ponum} not found in site ${validated.siteid}`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: poResponse.headers || {},
          requestId: poResponse.requestId,
        };
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // Build update payload (exclude identifier fields)
      const updatePayload: Record<string, any> = {};

      if (validated.orderqty !== undefined) updatePayload['orderqty'] = validated.orderqty;
      if (validated.unitcost !== undefined) updatePayload['unitcost'] = validated.unitcost;
      if (validated.description) updatePayload['description'] = validated.description;
      if (validated.orderunit) updatePayload['orderunit'] = validated.orderunit;
      if (validated.storeloc) updatePayload['storeloc'] = validated.storeloc;
      if (validated.gldebitacct) updatePayload['gldebitacct'] = validated.gldebitacct;

      // PATCH the specific line item in the POLINE collection
      const polineUrl = `${href}/POLINE/${validated.polinenum}`;
      const response = await this.client.patch<PurchaseOrderLine>(polineUrl, updatePayload);

      if (response.success && response.data) {
        logger.info('Line item updated successfully', {
          ponum: validated.ponum,
          polinenum: validated.polinenum,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update line item', { error });
      throw error;
    }
  }

  /**
   * Remove a line item from a purchase order
   * @param data - Remove line item data (ponum, siteid, polinenum)
   * @returns API response
   */
  async removeLineItem(data: PurchaseOrderRemoveLineItem): Promise<ApiResponse<void>> {
    logger.info('Removing line item from purchase order', {
      ponum: data.ponum,
      siteid: data.siteid,
      polinenum: data.polinenum,
    });

    try {
      // Validate input
      const validated = purchaseOrderRemoveLineItemSchema.parse(data);

      // Get the purchase order to get its href
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return {
          success: false,
          error: `Purchase order ${validated.ponum} not found in site ${validated.siteid}`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: poResponse.headers || {},
          requestId: poResponse.requestId,
        };
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // DELETE the specific line item from the POLINE collection
      const polineUrl = `${href}/POLINE/${validated.polinenum}`;
      const response = await this.client.delete<void>(polineUrl);

      if (response.success) {
        logger.info('Line item removed successfully', {
          ponum: validated.ponum,
          polinenum: validated.polinenum,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to remove line item', { error });
      throw error;
    }
  }

  /**
   * Submit a purchase order for approval workflow
   * @param data - Submit for approval data
   * @returns API response with updated purchase order
   */
  async submitForApproval(data: PurchaseOrderSubmitForApproval): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Submitting purchase order for approval', { ponum: data.ponum, siteid: data.siteid });

    try {
      // Validate input
      const validated = purchaseOrderSubmitForApprovalSchema.parse(data);

      // Get the purchase order first
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return poResponse;
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // Build submission payload - change status to WAPPR (Waiting for Approval)
      const submitPayload: Record<string, any> = {
        status: 'WAPPR',
        statusdate: new Date().toISOString(),
      };

      if (validated.memo) {
        submitPayload['comments'] = validated.memo;
      }

      // Make update request
      const response = await this.client.patch<PurchaseOrder>(href, submitPayload);

      if (response.success && response.data) {
        logger.info('Purchase order submitted for approval successfully', {
          ponum: validated.ponum,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to submit purchase order for approval', { error });
      throw error;
    }
  }

  /**
   * Reject a purchase order with a reason
   * @param data - Rejection data including reason
   * @returns API response with updated purchase order
   */
  async rejectPO(data: PurchaseOrderReject): Promise<ApiResponse<PurchaseOrder>> {
    logger.info('Rejecting purchase order', { ponum: data.ponum, siteid: data.siteid });

    try {
      // Validate input
      const validated = purchaseOrderRejectSchema.parse(data);

      // Get the purchase order first
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return poResponse;
      }

      const po = poResponse.data;
      const href = (po as any).href || (po as any)._href;

      if (!href) {
        return {
          success: false,
          error: 'Purchase order href not found',
          errorCode: 'INVALID_RESPONSE',
          statusCode: 500,
          headers: {},
          requestId: poResponse.requestId,
        };
      }

      // Build rejection payload - change status to CAN and add reason
      const rejectPayload: Record<string, any> = {
        status: 'CAN',
        statusdate: new Date().toISOString(),
        comments: `Rejected: ${validated.reason}`,
      };

      // Make update request
      const response = await this.client.patch<PurchaseOrder>(href, rejectPayload);

      if (response.success && response.data) {
        logger.info('Purchase order rejected successfully', { ponum: validated.ponum });
      }

      return response;
    } catch (error) {
      logger.error('Failed to reject purchase order', { error });
      throw error;
    }
  }

  /**
   * Receive a specific line item with partial receipt support
   * @param data - Line item receipt data
   * @returns API response with receipt record
   */
  async receiveLineItem(data: PurchaseOrderReceiveLineItem): Promise<ApiResponse<any>> {
    logger.info('Receiving line item for purchase order', {
      ponum: data.ponum,
      siteid: data.siteid,
      polinenum: data.polinenum,
    });

    try {
      // Validate input
      const validated = purchaseOrderReceiveLineItemSchema.parse(data);

      // Get the purchase order first to verify it exists
      const poResponse = await this.get(validated.ponum, validated.siteid);
      if (!poResponse.success || !poResponse.data) {
        return {
          success: false,
          error: `Purchase order ${validated.ponum} not found in site ${validated.siteid}`,
          errorCode: 'NOT_FOUND',
          statusCode: 404,
          headers: poResponse.headers || {},
          requestId: poResponse.requestId,
        };
      }

      // Build receipt payload for the specific line item
      const receiptPayload: Record<string, any> = {
        ponum: validated.ponum,
        polinenum: validated.polinenum,
        quantity: validated.receiveqty,
        receiptdate: new Date().toISOString(),
        siteid: validated.siteid,
      };

      if (validated.inspected !== undefined) {
        receiptPayload['inspected'] = validated.inspected;
      }

      if (validated.acceptedqty !== undefined) {
        receiptPayload['acceptedqty'] = validated.acceptedqty;
      }

      // Make API request to receipt endpoint
      const response = await this.client.post<any>(
        '/maximo/api/os/mxreceipt',
        receiptPayload
      );

      if (response.success) {
        logger.info('Line item received successfully', {
          ponum: validated.ponum,
          polinenum: validated.polinenum,
          receiveqty: validated.receiveqty,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to receive line item', { error });
      throw error;
    }
  }

  /**
   * Get all receipts for a purchase order
   * @param data - PO identifier (ponum, siteid)
   * @returns API response with list of receipt records
   */
  async getReceipts(data: PurchaseOrderGetReceipts): Promise<ApiResponse<PurchaseOrderReceiptListResponse>> {
    logger.info('Retrieving receipts for purchase order', { ponum: data.ponum, siteid: data.siteid });

    try {
      // Validate input
      const validated = purchaseOrderGetReceiptsSchema.parse(data);

      // Build OSLC query for receipts related to this PO
      const params: OSLCQueryParams = {
        'oslc.where': `ponum="${validated.ponum}" and siteid="${validated.siteid}"`,
        'oslc.select': 'receiptsid,ponum,polinenum,quantity,receiptdate,tostoreloc,siteid,inspected,acceptedqty,status,itemnum,description',
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
      };

      // Make API request to receipt endpoint
      const response = await this.client.get<PurchaseOrderReceiptListResponse>(
        '/maximo/api/os/mxreceipt',
        params
      );

      if (response.success && response.data) {
        logger.info('Receipts retrieved successfully', {
          ponum: validated.ponum,
          count: response.data.member?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to retrieve receipts', { error });
      throw error;
    }
  }
}
