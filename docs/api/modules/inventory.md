# Inventory Module

API documentation for the Inventory module in the Maximo MCP Server. This module provides 11 MCP tools for comprehensive inventory and material management, including item creation, balance lookups, issue/return/transfer/adjustment transactions, transaction history, search, reorder point management, and stock level monitoring.

## Item Types

| Type | Description |
|------|-------------|
| ITEM | Standard inventory item |
| TOOL | Tool |
| SERVICE | Service item |
| SPECIAL | Special order item |

## Item Statuses

| Status | Description |
|--------|-------------|
| ACTIVE | Item is active and available |
| PENDING | Item is pending activation |
| PENDOBS | Item is pending obsolescence |
| OBSOLETE | Item is obsolete |

## Transaction Types

| Type | Description |
|------|-------------|
| ISSUE | Inventory issued to work order or asset |
| RETURN | Inventory returned to storeroom |
| TRANSFER | Inventory moved between storerooms |
| ADJUSTMENT | Physical count adjustment |

---

## Tools

### `maximo_create_item`

**Description:** Create a new inventory item in Maximo. Requires itemnum, description, itemtype, and siteid. Optionally specify units of measure, costs, manufacturer, commodity group, and other item attributes.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| description | string | Yes | Item description (max 100 characters) |
| itemtype | string | Yes | Item type: ITEM, TOOL, SERVICE, or SPECIAL |
| siteid | string | Yes | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| status | string | No | Item status (defaults to ACTIVE) |
| orderunit | string | No | Order unit of measure (max 16 characters) |
| issueunit | string | No | Issue unit of measure (max 16 characters) |
| avgcost | number | No | Average cost |
| stdcost | number | No | Standard cost |
| lastcost | number | No | Last cost |
| lottype | string | No | Lot type: LOT or NOLOT |
| rotating | boolean | No | Rotating item flag |
| conditionenabled | boolean | No | Condition enabled flag |
| manufacturer | string | No | Manufacturer name (max 80 characters) |
| modelnum | string | No | Model number (max 20 characters) |
| commoditygroup | string | No | Commodity group code (max 8 characters) |
| commodity | string | No | Commodity code (max 8 characters) |
| gldebitacct | string | No | GL debit account (max 23 characters) |
| glcreditacct | string | No | GL credit account (max 23 characters) |
| conversion | number | No | Conversion factor between order and issue units |
| issuetype | string | No | Issue type (max 12 characters) |
| capitalized | boolean | No | Capitalized flag |
| taxexempt | boolean | No | Tax exempt flag |
| inspectionrequired | boolean | No | Inspection required flag |
| vendor | string | No | Vendor code (max 12 characters) |
| catalogcode | string | No | Catalog code (max 8 characters) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "description": "HVAC Air Filter 20x25x4",
  "itemtype": "ITEM",
  "siteid": "BEDFORD",
  "orderunit": "EACH",
  "issueunit": "EACH",
  "avgcost": 24.50,
  "manufacturer": "FilterPro",
  "commoditygroup": "HVAC"
}
```

**Response:** Returns the created inventory item object with all fields including the default status (ACTIVE) and OSLC `href`.

---

### `maximo_get_inventory`

**Description:** Get inventory balance for an item in a storeroom. Returns current balance, physical count, costs, reorder information, and other inventory details.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "location": "CENTRAL",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the inventory balance record including itemnum, location, siteid, curbal (current balance), physcnt (physical count), avgcost, stdcost, lastcost, reorder information (reorder point, reorder quantity, min/max levels), and GL accounts. Returns 404 if the inventory balance is not found.

---

### `maximo_issue_inventory`

**Description:** Issue inventory to a work order or asset. Reduces inventory balance and creates an issue transaction. Either wonum (work order) or assetnum must be provided.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| quantity | number | Yes | Quantity to issue (must be positive) |
| wonum | string | No | Work order number (max 10 characters) |
| assetnum | string | No | Asset number (max 12 characters) |
| binnum | string | No | Bin number (max 8 characters) |
| lotnum | string | No | Lot number (max 9 characters) |
| gldebitacct | string | No | GL debit account (max 23 characters) |
| glcreditacct | string | No | GL credit account (max 23 characters) |
| transdate | string | No | Transaction date (ISO 8601, defaults to now) |
| memo | string | No | Memo/remarks (max 50 characters) |
| issuetype | string | No | Issue type (max 12 characters) |
| taskid | string | No | Task ID (max 10 characters) |
| linecost | number | No | Line cost |
| unitcost | number | No | Unit cost |
| conversion | number | No | Conversion factor |
| issueunit | string | No | Issue unit (max 16 characters) |
| enterby | string | No | Entered by person (max 30 characters) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "location": "CENTRAL",
  "siteid": "BEDFORD",
  "quantity": 2,
  "wonum": "WO-1001",
  "memo": "Filters for scheduled PM"
}
```

**Response:** Returns the created issue transaction record with invtransid, transtype (ISSUE), quantity, and current balance after the transaction.

---

### `maximo_return_inventory`

**Description:** Return inventory to storeroom. Increases inventory balance and creates a return transaction. Typically used to return unused materials from work orders.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| quantity | number | Yes | Quantity to return (must be positive) |
| wonum | string | No | Work order number (max 10 characters) |
| rotassetnum | string | No | Rotating asset number (max 12 characters) |
| binnum | string | No | Bin number (max 8 characters) |
| lotnum | string | No | Lot number (max 9 characters) |
| transdate | string | No | Transaction date (ISO 8601, defaults to now) |
| memo | string | No | Memo/remarks (max 50 characters) |
| linecost | number | No | Line cost |
| unitcost | number | No | Unit cost |
| conversion | number | No | Conversion factor |
| issueunit | string | No | Issue unit (max 16 characters) |
| enterby | string | No | Entered by person (max 30 characters) |
| conditioncode | string | No | Condition code for condition-enabled items (max 30 characters) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "location": "CENTRAL",
  "siteid": "BEDFORD",
  "quantity": 1,
  "wonum": "WO-1001",
  "memo": "Unused filter returned"
}
```

**Response:** Returns the created return transaction record with invtransid, transtype (RETURN), and updated balance.

---

### `maximo_transfer_inventory`

**Description:** Transfer inventory between storerooms. Reduces balance in source storeroom and increases balance in destination storeroom. Creates a transfer transaction.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| fromstoreloc | string | Yes | From storeroom location (max 12 characters) |
| tostoreloc | string | Yes | To storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| quantity | number | Yes | Quantity to transfer (must be positive) |
| frombinnum | string | No | From bin number (max 8 characters) |
| tobinnum | string | No | To bin number (max 8 characters) |
| fromlotnum | string | No | From lot number (max 9 characters) |
| tolotnum | string | No | To lot number (max 9 characters) |
| transdate | string | No | Transaction date (ISO 8601, defaults to now) |
| memo | string | No | Memo/remarks (max 50 characters) |
| linecost | number | No | Line cost |
| unitcost | number | No | Unit cost |
| enterby | string | No | Entered by person (max 30 characters) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "fromstoreloc": "CENTRAL",
  "tostoreloc": "PLANT-B-STORE",
  "siteid": "BEDFORD",
  "quantity": 10,
  "memo": "Replenish Plant B stock"
}
```

**Response:** Returns the created transfer transaction record with invtransid, transtype (TRANSFER), fromstoreloc, tostoreloc, and quantity.

---

### `maximo_adjust_inventory`

**Description:** Adjust inventory balance based on physical count. Used for cycle counting and inventory reconciliation. Creates an adjustment transaction to match physical count.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| physcnt | number | Yes | Physical count (must be non-negative) |
| binnum | string | No | Bin number (max 8 characters) |
| lotnum | string | No | Lot number (max 9 characters) |
| transdate | string | No | Transaction date (ISO 8601, defaults to now) |
| reason | string | No | Reason for adjustment (max 50 characters) |
| gldebitacct | string | No | GL debit account (max 23 characters) |
| glcreditacct | string | No | GL credit account (max 23 characters) |
| enterby | string | No | Entered by person (max 30 characters) |
| reconciled | boolean | No | Reconciled flag |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "location": "CENTRAL",
  "siteid": "BEDFORD",
  "physcnt": 45,
  "reason": "Cycle count reconciliation"
}
```

**Response:** Returns the created adjustment transaction record with invtransid, transtype (ADJUSTMENT), physcnt, and updated balance.

---

### `maximo_get_inventory_transactions`

**Description:** Get transaction history for an item in a storeroom. Returns all transactions (issues, returns, transfers, adjustments) with optional date range filtering.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| startDate | string | No | Start date filter (ISO 8601) |
| endDate | string | No | End date filter (ISO 8601) |
| pageSize | number | No | Page size (default: 100, max: 1000) |
| page | number | No | Page number (default: 1) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "location": "CENTRAL",
  "siteid": "BEDFORD",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-02-14T23:59:59Z",
  "pageSize": 50
}
```

**Response:** Returns a paginated result containing:
- `transactions` - Array of transaction records, each with invtransid, itemnum, location, siteid, transtype, quantity, curbal, transdate, wonum, assetnum, linecost, unitcost, memo, and more
- `totalCount`, `page`, `pageSize`, `totalPages`, `hasNext`, `hasPrevious` - Pagination metadata
- Results are sorted by transaction date descending (most recent first)

---

### `maximo_search_items`

**Description:** Search inventory items with OSLC filters. Supports filtering by item type, status, commodity group, manufacturer, description, and more. Returns paginated results.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemtype | string or string[] | No | Item type or array of types: ITEM, TOOL, SERVICE, SPECIAL |
| status | string or string[] | No | Status or array of statuses: ACTIVE, PENDING, PENDOBS, OBSOLETE |
| commoditygroup | string | No | Commodity group code (max 8 characters) |
| manufacturer | string | No | Manufacturer name (max 80 characters) |
| description | string | No | Description partial match |
| location | string | No | Storeroom location (max 12 characters) |
| siteid | string | No | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| rotating | boolean | No | Filter by rotating items |
| conditionenabled | boolean | No | Filter by condition-enabled items |
| vendor | string | No | Vendor code (max 12 characters) |
| pageSize | number | No | Page size (default: 100, max: 1000) |
| page | number | No | Page number (default: 1) |
| select | string[] | No | Fields to return |
| orderBy | string | No | Sort order (e.g., "itemnum", "-description") |
| where | string | No | Custom OSLC where clause |
| searchTerms | string | No | Full-text search terms |

**Example Usage:**

```json
{
  "itemtype": "ITEM",
  "status": "ACTIVE",
  "commoditygroup": "HVAC",
  "siteid": "BEDFORD",
  "pageSize": 25,
  "orderBy": "+itemnum"
}
```

**Response:** Returns a paginated result containing an array of items, totalCount, page, pageSize, totalPages, hasNext, and hasPrevious flags. Description filtering uses partial match (LIKE query).

---

### `maximo_update_reorder_point`

**Description:** Update reorder point and inventory planning fields for an item at a storeroom. Sets reorder point, minimum level, maximum level, and economic order quantity. At least one planning field must be provided.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| location | string | Yes | Storeroom location (max 12 characters) |
| reorder | number | No | Reorder point - balance at which reorder is triggered (non-negative) |
| minlevel | number | No | Minimum stock level (non-negative) |
| maxlevel | number | No | Maximum stock level (non-negative, must be >= minlevel) |
| orderqty | number | No | Economic order quantity (non-negative) |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "siteid": "BEDFORD",
  "location": "CENTRAL",
  "reorder": 20,
  "minlevel": 10,
  "maxlevel": 100,
  "orderqty": 50
}
```

**Response:** Returns the updated inventory balance record with the new reorder point and planning fields. Returns 404 if the inventory balance record does not exist.

---

### `maximo_get_stock_levels`

**Description:** Get current stock levels across storerooms for an item. Returns current balance, reorder point, min/max levels, and order quantity for each storeroom holding the item.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemnum | string | Yes | Item number (max 30 characters) |
| siteid | string | No | Site identifier (filters to storerooms in this site) |
| includeAllStorerooms | boolean | No | Include storerooms across all sites (default: false). When true, siteid filter is ignored. |

**Example Usage:**

```json
{
  "itemnum": "FILTER-HVAC-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a `StockLevelsResponse` containing:
- `itemnum` - The requested item number
- `storerooms` - Array of stock level records, each with itemnum, location, curbal, minlevel, maxlevel, reorder, orderqty, and issueunit
- `totalCount` - Total number of storerooms holding the item

---

### `maximo_get_items_below_reorder`

**Description:** Find all inventory items where the current balance is at or below the reorder point. Useful for identifying items that need to be reordered. Only includes items with a reorder point greater than 0.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | No | Site identifier (filters to a specific site) |
| location | string | No | Storeroom location (filters to a specific storeroom) |
| pageSize | number | No | Page size (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "location": "CENTRAL"
}
```

**Response:** Returns an `ItemsBelowReorderResponse` containing:
- `items` - Array of stock level records where curbal <= reorder, each with itemnum, location, curbal, minlevel, maxlevel, reorder, orderqty, and issueunit
- `totalCount` - Total number of items needing reorder
- Results are sorted by item number ascending
