/**
 * Type definitions for Purchase Order Module
 * Defines interfaces and types for purchase order management in Maximo
 */

/**
 * Purchase order status values
 */
export type PurchaseOrderStatus = 'WAPPR' | 'APPR' | 'PCH' | 'CLOSE' | 'CAN';

/**
 * Purchase order type values
 */
export type PurchaseOrderType = 'STANDARD' | 'BLANKET' | 'CONTRACT';

/**
 * Complete purchase order interface with all Maximo fields
 */
export interface PurchaseOrder {
  /** Purchase order number (unique identifier) */
  ponum: string;

  /** Purchase order description */
  description: string;

  /** Current status */
  status: PurchaseOrderStatus;

  /** Status change date (ISO 8601 format) */
  statusdate: string;

  /** Vendor code */
  vendor: string;

  /** Site identifier */
  siteid: string;

  /** Organization identifier */
  orgid: string;

  /** Purchase order type */
  potype?: PurchaseOrderType;

  /** Order date (ISO 8601 format) */
  orderdate?: string;

  /** Requested delivery date (ISO 8601 format) */
  reqdate?: string;

  /** Total cost */
  totalcost?: number;

  /** Currency code */
  currencycode?: string;

  /** Buyer */
  buyer?: string;

  /** Approval status */
  approvalstatus?: string;

  /** Approved by */
  approvedby?: string;

  /** Approval date (ISO 8601 format) */
  approveddate?: string;

  /** Terms and conditions */
  termsconditions?: string;

  /** Ship via */
  shipvia?: string;

  /** FOB */
  fob?: string;

  /** Tax code */
  taxcode?: string;

  /** Tax percentage */
  tax1?: number;

  /** Tax amount */
  tax1amt?: number;

  /** Reference number */
  refnum?: string;

  /** Comments */
  comments?: string;

  /** Purchase order lines */
  poline?: PurchaseOrderLine[];
}

/**
 * Purchase order line item
 */
export interface PurchaseOrderLine {
  /** Line number */
  polinenum: number;

  /** Item number */
  itemnum?: string;

  /** Item description */
  description: string;

  /** Quantity ordered */
  orderqty: number;

  /** Unit of measure */
  orderunit?: string;

  /** Unit cost */
  unitcost?: number;

  /** Line cost */
  linecost?: number;

  /** Quantity received */
  receivedqty?: number;

  /** Quantity remaining */
  remqty?: number;

  /** Store location */
  storeloc?: string;

  /** Requested delivery date (ISO 8601 format) */
  reqdate?: string;

  /** Asset number */
  assetnum?: string;

  /** Location code */
  location?: string;

  /** Work order number */
  wonum?: string;
}

/**
 * Purchase order creation data
 */
export interface PurchaseOrderCreate {
  /** Purchase order description (required) */
  description: string;

  /** Vendor code (required) */
  vendor: string;

  /** Site identifier (required) */
  siteid: string;

  /** Organization identifier (optional) */
  orgid?: string;

  /** Purchase order type (optional) */
  potype?: PurchaseOrderType;

  /** Order date (optional, ISO 8601 format) */
  orderdate?: string;

  /** Requested delivery date (optional, ISO 8601 format) */
  reqdate?: string;

  /** Buyer (optional) */
  buyer?: string;

  /** Terms and conditions (optional) */
  termsconditions?: string;

  /** Ship via (optional) */
  shipvia?: string;

  /** FOB (optional) */
  fob?: string;

  /** Tax code (optional) */
  taxcode?: string;

  /** Reference number (optional) */
  refnum?: string;

  /** Comments (optional) */
  comments?: string;

  /** Purchase order lines (optional) */
  poline?: PurchaseOrderLineCreate[];
}

/**
 * Purchase order line creation data
 */
export interface PurchaseOrderLineCreate {
  /** Item number (optional) */
  itemnum?: string;

  /** Item description (required) */
  description: string;

  /** Quantity ordered (required) */
  orderqty: number;

  /** Unit of measure (optional) */
  orderunit?: string;

  /** Unit cost (optional) */
  unitcost?: number;

  /** Store location (optional) */
  storeloc?: string;

  /** Requested delivery date (optional, ISO 8601 format) */
  reqdate?: string;

  /** Asset number (optional) */
  assetnum?: string;

  /** Location code (optional) */
  location?: string;

  /** Work order number (optional) */
  wonum?: string;
}

/**
 * Purchase order update data
 */
export interface PurchaseOrderUpdate {
  /** Description (optional) */
  description?: string;

  /** Vendor code (optional) */
  vendor?: string;

  /** Purchase order type (optional) */
  potype?: PurchaseOrderType;

  /** Order date (optional, ISO 8601 format) */
  orderdate?: string;

  /** Requested delivery date (optional, ISO 8601 format) */
  reqdate?: string;

  /** Buyer (optional) */
  buyer?: string;

  /** Terms and conditions (optional) */
  termsconditions?: string;

  /** Ship via (optional) */
  shipvia?: string;

  /** FOB (optional) */
  fob?: string;

  /** Tax code (optional) */
  taxcode?: string;

  /** Reference number (optional) */
  refnum?: string;

  /** Comments (optional) */
  comments?: string;
}

/**
 * Purchase order search parameters
 */
export interface PurchaseOrderSearch {
  /** Status filter (optional) */
  status?: PurchaseOrderStatus | PurchaseOrderStatus[];

  /** Vendor filter (optional) */
  vendor?: string;

  /** Site identifier (optional) */
  siteid?: string;

  /** Purchase order type filter (optional) */
  potype?: PurchaseOrderType | PurchaseOrderType[];

  /** Date range start (optional, ISO 8601 format) */
  dateFrom?: string;

  /** Date range end (optional, ISO 8601 format) */
  dateTo?: string;

  /** Buyer filter (optional) */
  buyer?: string;

  /** Page size (optional) */
  pageSize?: number;

  /** Page number (optional) */
  pageNum?: number;
}

/**
 * Purchase order receipt data
 */
export interface PurchaseOrderReceipt {
  /** Purchase order number (required) */
  ponum: string;

  /** Purchase order line number (required) */
  polinenum: number;

  /** Quantity received (required) */
  quantity: number;

  /** Receipt date (optional, ISO 8601 format) */
  receiptdate?: string;

  /** Receiving storeroom (optional) */
  tostoreloc?: string;

  /** Site identifier (optional) */
  siteid?: string;

  /** Comments (optional) */
  comments?: string;
}

/**
 * Purchase order approval data
 */
export interface PurchaseOrderApproval {
  /** Purchase order number (required) */
  ponum: string;

  /** Approval memo (optional) */
  memo?: string;

  /** Site identifier (optional) */
  siteid?: string;
}

/**
 * Purchase order list response
 */
export interface PurchaseOrderListResponse {
  /** List of purchase orders */
  member: PurchaseOrder[];

  /** Total count */
  totalCount?: number;

  /** Page size */
  pageSize?: number;

  /** Page number */
  pageNum?: number;
}

/**
 * Purchase order operation result
 */
export interface PurchaseOrderOperationResult {
  /** Success flag */
  success: boolean;

  /** Purchase order number */
  ponum?: string;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Purchase order receipt result
 */
export interface PurchaseOrderReceiptResult {
  /** Success flag */
  success: boolean;

  /** Receipt number */
  receiptnum?: string;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}

/**
 * Add line item to purchase order
 */
export interface PurchaseOrderAddLineItem {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Item number (optional) */
  itemnum?: string;

  /** Item description (required) */
  description: string;

  /** Quantity ordered (required) */
  orderqty: number;

  /** Unit cost (optional) */
  unitcost?: number;

  /** Unit of measure (optional) */
  orderunit?: string;

  /** Store location (optional) */
  storeloc?: string;

  /** GL debit account (optional) */
  gldebitacct?: string;
}

/**
 * Update line item on purchase order
 */
export interface PurchaseOrderUpdateLineItem {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Line number to update (required) */
  polinenum: number;

  /** Quantity ordered (optional) */
  orderqty?: number;

  /** Unit cost (optional) */
  unitcost?: number;

  /** Item description (optional) */
  description?: string;

  /** Unit of measure (optional) */
  orderunit?: string;

  /** Store location (optional) */
  storeloc?: string;

  /** GL debit account (optional) */
  gldebitacct?: string;
}

/**
 * Remove line item from purchase order
 */
export interface PurchaseOrderRemoveLineItem {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Line number to remove (required) */
  polinenum: number;
}

/**
 * Submit purchase order for approval
 */
export interface PurchaseOrderSubmitForApproval {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Submission memo (optional) */
  memo?: string;
}

/**
 * Reject purchase order
 */
export interface PurchaseOrderReject {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Rejection reason (required) */
  reason: string;
}

/**
 * Receive a specific line item (partial receipt support)
 */
export interface PurchaseOrderReceiveLineItem {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;

  /** Line number to receive (required) */
  polinenum: number;

  /** Quantity received (required) */
  receiveqty: number;

  /** Whether items have been inspected (optional) */
  inspected?: boolean;

  /** Accepted quantity after inspection (optional) */
  acceptedqty?: number;
}

/**
 * Get receipts for a purchase order
 */
export interface PurchaseOrderGetReceipts {
  /** Purchase order number (required) */
  ponum: string;

  /** Site identifier (required) */
  siteid: string;
}

/**
 * Receipt record from Maximo
 */
export interface PurchaseOrderReceiptRecord {
  /** Receipt ID */
  receiptsid?: number;

  /** Purchase order number */
  ponum: string;

  /** Purchase order line number */
  polinenum?: number;

  /** Quantity received */
  quantity?: number;

  /** Receipt date */
  receiptdate?: string;

  /** Receiving storeroom */
  tostoreloc?: string;

  /** Site identifier */
  siteid: string;

  /** Inspected flag */
  inspected?: boolean;

  /** Accepted quantity */
  acceptedqty?: number;

  /** Status */
  status?: string;

  /** Item number */
  itemnum?: string;

  /** Description */
  description?: string;
}

/**
 * Receipt list response
 */
export interface PurchaseOrderReceiptListResponse {
  /** List of receipt records */
  member: PurchaseOrderReceiptRecord[];

  /** Total count */
  totalCount?: number;
}
