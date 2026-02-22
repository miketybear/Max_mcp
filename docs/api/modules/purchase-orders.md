# Purchase Orders Module

API documentation for the Purchase Orders module in the Maximo MCP Server. This module provides 15 MCP tools for comprehensive purchase order lifecycle management, including creation, updates, deletion, search, line item management, approval workflows, receiving, and receipt tracking.

## Overview

Purchase orders (POs) manage the procurement of materials, parts, and services from vendors. The module supports the full procurement lifecycle from creation through approval, receiving, and closure.

## Status Workflow

Purchase orders follow this status lifecycle:

```
WAPPR (Waiting Approval) -> APPR (Approved) -> PCH (Purchased/Open) -> CLOSE (Closed)
                                                                    -> CAN (Cancelled)
```

| Status | Description |
|--------|-------------|
| WAPPR | Waiting for approval |
| APPR | Approved |
| PCH | Purchased / open for receiving |
| CLOSE | Closed |
| CAN | Cancelled |

## Purchase Order Types

| Type | Description |
|------|-------------|
| STANDARD | Standard one-time purchase order |
| BLANKET | Blanket/standing order for recurring purchases |
| CONTRACT | Contract-based purchase order |

---

## Tools

### `maximo_create_po`

**Description:** Create a new purchase order in Maximo. Requires description, vendor, and siteid. Optionally specify order date, requested delivery date, buyer, terms, and line items.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | Yes | Purchase order description (max 100 characters) |
| vendor | string | Yes | Vendor code (max 8 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| potype | string | No | Purchase order type: STANDARD, BLANKET, or CONTRACT |
| orderdate | string | No | Order date in ISO 8601 format |
| reqdate | string | No | Requested delivery date in ISO 8601 format |
| buyer | string | No | Buyer (max 30 characters) |
| termsconditions | string | No | Terms and conditions |
| shipvia | string | No | Ship via (max 20 characters) |
| fob | string | No | FOB point (max 20 characters) |
| taxcode | string | No | Tax code (max 8 characters) |
| refnum | string | No | Reference number (max 20 characters) |
| comments | string | No | Comments |
| poline | array | No | Purchase order line items (see line item sub-properties below) |

**Line item sub-properties (poline array items):**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| description | string | Yes | Item description |
| orderqty | number | Yes | Quantity ordered |
| itemnum | string | No | Item number |
| orderunit | string | No | Unit of measure |
| unitcost | number | No | Unit cost |
| storeloc | string | No | Store location |
| reqdate | string | No | Requested delivery date |
| assetnum | string | No | Asset number |
| location | string | No | Location code |
| wonum | string | No | Work order number |

**Example Usage:**

```json
{
  "description": "HVAC Replacement Parts Order",
  "vendor": "COOLTECH",
  "siteid": "BEDFORD",
  "potype": "STANDARD",
  "reqdate": "2026-03-01T00:00:00Z",
  "buyer": "JSMITH",
  "poline": [
    {
      "itemnum": "FILTER-20X25",
      "description": "HVAC Air Filter 20x25",
      "orderqty": 24,
      "orderunit": "EACH",
      "unitcost": 12.50,
      "storeloc": "CENTRAL"
    },
    {
      "description": "Compressor belt replacement",
      "orderqty": 4,
      "unitcost": 45.00
    }
  ]
}
```

**Response:** Returns the created purchase order object with all fields including the auto-generated `ponum`, initial status, and line items.

---

### `maximo_get_po`

**Description:** Retrieve purchase order details by purchase order number and optional site ID. Returns complete purchase order information including status, dates, costs, and line items.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the complete purchase order record including description, status, vendor, dates, costs, line items, and receipt history.

---

### `maximo_update_po`

**Description:** Update purchase order fields. Specify ponum and optional siteid to identify the purchase order, then provide any fields to update (description, vendor, dates, buyer, terms, etc.).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | No | Site identifier |
| updates | object | Yes | Fields to update (see sub-properties below) |

**Updates sub-properties:**

| Property | Type | Description |
|----------|------|-------------|
| description | string | Purchase order description |
| vendor | string | Vendor code |
| potype | string | Purchase order type: STANDARD, BLANKET, or CONTRACT |
| orderdate | string | Order date (ISO 8601) |
| reqdate | string | Requested delivery date (ISO 8601) |
| buyer | string | Buyer |
| termsconditions | string | Terms and conditions |
| shipvia | string | Ship via |
| fob | string | FOB point |
| taxcode | string | Tax code |
| refnum | string | Reference number |
| comments | string | Comments |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "updates": {
    "reqdate": "2026-03-15T00:00:00Z",
    "buyer": "MJONES",
    "comments": "Updated delivery date per vendor confirmation"
  }
}
```

**Response:** Returns the updated purchase order object.

---

### `maximo_delete_po`

**Description:** Delete a purchase order. Specify ponum and optional siteid to identify the purchase order to delete.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns confirmation of deletion.

---

### `maximo_receive_po`

**Description:** Receive purchase order items. Specify ponum, polinenum, and quantity received. Optionally specify receipt date, receiving storeroom, and comments.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| polinenum | number | Yes | Purchase order line number |
| quantity | number | Yes | Quantity received (must be positive) |
| receiptdate | string | No | Receipt date in ISO 8601 format (defaults to current date) |
| tostoreloc | string | No | Receiving storeroom (max 8 characters) |
| siteid | string | No | Site identifier |
| comments | string | No | Receipt comments |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "polinenum": 1,
  "quantity": 24,
  "tostoreloc": "CENTRAL",
  "siteid": "BEDFORD",
  "comments": "Full quantity received in good condition"
}
```

**Response:** Returns the receipt record with quantity received, receipt date, and storeroom location.

---

### `maximo_approve_po`

**Description:** Approve a purchase order. Specify ponum and optionally provide an approval memo. Changes the purchase order status to APPR.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| memo | string | No | Approval memo |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "memo": "Approved - within budget allocation"
}
```

**Response:** Returns the purchase order with status changed to APPR.

---

### `maximo_search_pos`

**Description:** Search purchase orders with filters. Filter by status, vendor, site, type, buyer, or date range. Supports pagination with pageSize and pageNum parameters.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string or string[] | No | PO status: WAPPR, APPR, PCH, CLOSE, or CAN (single value or array) |
| vendor | string | No | Vendor code filter |
| siteid | string | No | Site identifier filter |
| potype | string or string[] | No | PO type: STANDARD, BLANKET, or CONTRACT (single value or array) |
| dateFrom | string | No | Date range start in ISO 8601 format |
| dateTo | string | No | Date range end in ISO 8601 format |
| buyer | string | No | Buyer filter |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| pageNum | number | No | Page number (default: 1) |

**Example Usage:**

```json
{
  "status": "WAPPR",
  "siteid": "BEDFORD",
  "vendor": "COOLTECH",
  "pageSize": 25
}
```

**Response:** Returns paginated list of purchase orders matching the filter criteria.

---

### `maximo_add_po_line`

**Description:** Add a line item to an existing purchase order. Requires ponum, siteid, description, and orderqty. Optionally specify itemnum, unitcost, orderunit, storeloc (storeroom), and gldebitacct (GL account).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| description | string | Yes | Line item description (max 100 characters) |
| orderqty | number | Yes | Quantity ordered (must be positive) |
| itemnum | string | No | Item number (max 20 characters) |
| unitcost | number | No | Unit cost (must be non-negative) |
| orderunit | string | No | Unit of measure (max 10 characters) |
| storeloc | string | No | Store location / storeroom (max 8 characters) |
| gldebitacct | string | No | GL debit account (max 30 characters) |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "itemnum": "BELT-V42",
  "description": "V-Belt for compressor unit",
  "orderqty": 6,
  "unitcost": 28.75,
  "orderunit": "EACH",
  "storeloc": "CENTRAL"
}
```

**Response:** Returns the created line item with assigned line number and calculated line cost.

---

### `maximo_get_po_lines`

**Description:** Retrieve all line items for a purchase order. Returns complete line item details including item numbers, quantities, costs, and receiving status.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of line items with item number, description, ordered quantity, unit cost, line cost, received quantity, and storeroom details.

---

### `maximo_update_po_line`

**Description:** Update a specific line item on a purchase order. Specify ponum, siteid, and polinenum to identify the line, then provide fields to update (orderqty, unitcost, description, etc.).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| polinenum | number | Yes | Purchase order line number to update |
| orderqty | number | No | Updated quantity ordered (must be positive) |
| unitcost | number | No | Updated unit cost (must be non-negative) |
| description | string | No | Updated line item description (max 100 characters) |
| orderunit | string | No | Updated unit of measure (max 10 characters) |
| storeloc | string | No | Updated store location (max 8 characters) |
| gldebitacct | string | No | Updated GL debit account (max 30 characters) |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "polinenum": 1,
  "orderqty": 30,
  "unitcost": 11.95
}
```

**Response:** Returns the updated line item object.

---

### `maximo_remove_po_line`

**Description:** Remove a specific line item from a purchase order. Specify ponum, siteid, and polinenum to identify the line item to remove.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| polinenum | number | Yes | Purchase order line number to remove |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "polinenum": 3
}
```

**Response:** Returns confirmation that the line item was removed.

---

### `maximo_submit_po_approval`

**Description:** Submit a purchase order for approval workflow. Changes status to WAPPR (Waiting for Approval). Different from `maximo_approve_po` which actually approves the PO. Optionally include a memo.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| memo | string | No | Submission memo (max 500 characters) |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "memo": "Urgent - needed for Q2 PM schedule"
}
```

**Response:** Returns the purchase order with status changed to WAPPR.

---

### `maximo_reject_po`

**Description:** Reject a purchase order with a reason. Changes the status to CAN (Cancelled) and records the rejection reason in the comments. Requires a reason for the rejection.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| reason | string | Yes | Rejection reason (max 500 characters) |

**Example Usage:**

```json
{
  "ponum": "PO-5002",
  "siteid": "BEDFORD",
  "reason": "Vendor pricing exceeds budget. Seek alternative vendor."
}
```

**Response:** Returns the purchase order with status changed to CAN and rejection reason recorded.

---

### `maximo_receive_po_line`

**Description:** Receive a specific line item from a purchase order with partial receipt support. Specify the quantity received, and optionally whether items were inspected and the accepted quantity.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |
| polinenum | number | Yes | Purchase order line number to receive |
| receiveqty | number | Yes | Quantity received (must be positive) |
| inspected | boolean | No | Whether items have been inspected |
| acceptedqty | number | No | Accepted quantity after inspection (must be non-negative) |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD",
  "polinenum": 1,
  "receiveqty": 24,
  "inspected": true,
  "acceptedqty": 22
}
```

**Response:** Returns the receipt record with received quantity, inspection status, and accepted quantity.

---

### `maximo_get_po_receipts`

**Description:** Retrieve all receipt records for a purchase order. Returns receipt details including quantities received, receipt dates, inspection status, and accepted quantities.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ponum | string | Yes | Purchase order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "ponum": "PO-5001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of receipt records for all line items, including receipt dates, quantities received, inspection status, accepted quantities, and storeroom destinations.

---

## Common Workflows

### Creating and Approving a Purchase Order

1. **Create the PO:** Use `maximo_create_po` with vendor, description, and line items.
2. **Add additional lines** (if needed): Use `maximo_add_po_line` for each additional item.
3. **Submit for approval:** Use `maximo_submit_po_approval` to enter the approval workflow.
4. **Approve the PO:** Use `maximo_approve_po` to approve.

### Receiving Items

1. **Review line items:** Use `maximo_get_po_lines` to see what is expected.
2. **Receive items:** Use `maximo_receive_po_line` for each line item as goods arrive. Supports partial receipts.
3. **Check receipt history:** Use `maximo_get_po_receipts` to review all receipts against the PO.

### Searching for POs Awaiting Approval

```json
{
  "status": "WAPPR",
  "siteid": "BEDFORD",
  "pageSize": 50
}
```

### Finding POs by Vendor and Date Range

```json
{
  "vendor": "COOLTECH",
  "dateFrom": "2026-01-01T00:00:00Z",
  "dateTo": "2026-03-31T23:59:59Z",
  "siteid": "BEDFORD"
}
```
