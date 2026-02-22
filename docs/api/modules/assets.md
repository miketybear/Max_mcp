# Assets Module

API documentation for the Assets module in the Maximo MCP Server. This module provides 12 MCP tools for comprehensive asset lifecycle management, including creation, updates, location moves, meter readings, hierarchy navigation, specification management, status changes, and downtime tracking.

## Asset Statuses

| Status | Description |
|--------|-------------|
| OPERATING | Asset is operational |
| NOT READY | Asset is not ready for use |
| DECOMMISSIONED | Asset has been decommissioned |
| MISSING | Asset location is unknown |
| SEALED | Asset is sealed |

## Asset Types

| Type | Description |
|------|-------------|
| IT | Information Technology |
| PRODUCTION | Production equipment |
| FACILITIES | Facilities infrastructure |
| TRANSPORTATION | Transportation vehicles/equipment |
| INFRASTRUCTURE | General infrastructure |

---

## Tools

### `maximo_create_asset`

**Description:** Create a new asset in Maximo. Requires assetnum, description, siteid, and assettype. Optionally specify location, parent, serial number, manufacturer, purchase details, and more.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number (max 12 characters) |
| description | string | Yes | Asset description (max 100 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| assettype | string | Yes | Asset type: IT, PRODUCTION, FACILITIES, TRANSPORTATION, or INFRASTRUCTURE |
| orgid | string | No | Organization identifier (max 8 characters) |
| location | string | No | Location code (max 12 characters) |
| status | string | No | Asset status (defaults to OPERATING) |
| parent | string | No | Parent asset number for hierarchy (max 12 characters) |
| priority | number | No | Priority level 1-5 (1 is highest) |
| serialnum | string | No | Serial number (max 64 characters) |
| manufacturer | string | No | Manufacturer name (max 80 characters) |
| vendor | string | No | Vendor code (max 12 characters) |
| model | string | No | Model number (max 20 characters) |
| purchaseprice | number | No | Purchase price |
| purchasedate | string | No | Purchase date (ISO 8601) |
| installdate | string | No | Installation date (ISO 8601) |
| warrantyexpdate | string | No | Warranty expiration date (ISO 8601) |
| replacecost | number | No | Replacement cost |
| failurecode | string | No | Failure code (max 8 characters) |
| classstructureid | string | No | Asset specification class (max 20 characters) |
| binnum | string | No | Bin number (max 8 characters) |
| lotnum | string | No | Lot number (max 9 characters) |
| itemnum | string | No | Item number (max 30 characters) |
| isrotating | boolean | No | Rotating item flag |
| budgetcost | number | No | Budgeted cost |
| ownership | string | No | Ownership code (max 12 characters) |
| lease | boolean | No | Lease/rent flag |
| leaseexpdate | string | No | Lease expiration date (ISO 8601) |
| leasecost | number | No | Lease cost |
| leasecontractnum | string | No | Lease contract number (max 12 characters) |
| leasevendor | string | No | Lease vendor (max 12 characters) |
| capitalized | boolean | No | Capitalized flag |
| depreciationcode | string | No | Depreciation code (max 8 characters) |
| salvagevalue | number | No | Salvage value |
| expectedlife | number | No | Expected life in years |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "description": "Main cooling water pump",
  "siteid": "BEDFORD",
  "assettype": "PRODUCTION",
  "location": "PLANT-A",
  "manufacturer": "ACME Pumps",
  "serialnum": "SN-2024-45678",
  "purchaseprice": 15000,
  "installdate": "2024-06-15T00:00:00Z"
}
```

**Response:** Returns the created asset object with all fields including the status (defaults to OPERATING) and OSLC `href`. Validates that an asset cannot be its own parent.

---

### `maximo_get_asset`

**Description:** Retrieve asset details by asset number and site ID. Returns complete asset information including status, location, costs, specifications, and hierarchy.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the full asset object including all fields. Returns a 404 error if the asset is not found.

---

### `maximo_update_asset`

**Description:** Update asset fields. Specify assetnum and siteid to identify the asset, then provide any fields to update.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| updates | object | Yes | Fields to update |

**Updatable fields in `updates`:**

| Field | Type | Description |
|-------|------|-------------|
| description | string | Asset description (max 100 characters) |
| status | string | Asset status |
| location | string | Location code (max 12 characters) |
| priority | number | Priority level 1-5 |
| serialnum | string | Serial number (max 64 characters) |
| manufacturer | string | Manufacturer name (max 80 characters) |
| vendor | string | Vendor code (max 12 characters) |
| model | string | Model number (max 20 characters) |
| purchaseprice | number | Purchase price |
| purchasedate | string | Purchase date (ISO 8601) |
| installdate | string | Installation date (ISO 8601) |
| warrantyexpdate | string | Warranty expiration date (ISO 8601) |
| replacecost | number | Replacement cost |
| failurecode | string | Failure code (max 8 characters) |
| isrunning | boolean | Is running flag |
| classstructureid | string | Asset specification class (max 20 characters) |
| binnum | string | Bin number (max 8 characters) |
| lotnum | string | Lot number (max 9 characters) |
| itemnum | string | Item number (max 30 characters) |
| budgetcost | number | Budgeted cost |
| ownership | string | Ownership code (max 12 characters) |
| lease | boolean | Lease/rent flag |
| leaseexpdate | string | Lease expiration date (ISO 8601) |
| leasecost | number | Lease cost |
| leasecontractnum | string | Lease contract number (max 12 characters) |
| leasevendor | string | Lease vendor (max 12 characters) |
| capitalized | boolean | Capitalized flag |
| depreciationcode | string | Depreciation code (max 8 characters) |
| salvagevalue | number | Salvage value |
| expectedlife | number | Expected life in years |
| remaininglife | number | Remaining life in years |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "updates": {
    "description": "Main cooling water pump - upgraded",
    "replacecost": 18000,
    "isrunning": true
  }
}
```

**Response:** Returns the updated asset object.

---

### `maximo_delete_asset`

**Description:** Delete an asset from Maximo. This operation cannot be undone.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a success confirmation. Returns a 404 error if the asset is not found.

---

### `maximo_move_asset`

**Description:** Move an asset to a new location. Specify the asset, site, and new location. Optionally provide move date, memo, and new bin/lot numbers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| newLocation | string | Yes | New location code (max 12 characters) |
| moveDate | string | No | Move date (ISO 8601, defaults to now) |
| memo | string | No | Move memo/reason (max 50 characters) |
| newBinnum | string | No | New bin number (max 8 characters) |
| newLotnum | string | No | New lot number (max 9 characters) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "newLocation": "PLANT-B",
  "memo": "Relocated for maintenance access"
}
```

**Response:** Returns the updated asset object with the new location.

---

### `maximo_record_meter`

**Description:** Record a meter reading for an asset. Specify asset, site, meter name, reading value, and date. Optionally provide inspector, remarks, and rollover flag.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| metername | string | Yes | Meter name (max 10 characters) |
| reading | number | Yes | Reading value (must be non-negative) |
| readingdate | string | Yes | Reading date (ISO 8601) |
| inspector | string | No | Inspector/person who took reading (max 30 characters) |
| remarks | string | No | Remarks (max 50 characters) |
| newreading | boolean | No | New reading flag |
| rollover | boolean | No | Rollover flag (indicates meter has rolled over) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "metername": "RUNHOURS",
  "reading": 5280,
  "readingdate": "2026-02-15T10:00:00Z",
  "inspector": "JSMITH"
}
```

**Response:** Returns the created meter reading record (ASSETMETER child resource).

---

### `maximo_get_asset_hierarchy`

**Description:** Get asset hierarchy including parent and children assets. Returns the asset, its parent (if exists), all child assets, hierarchy level, and path.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an `AssetHierarchy` object containing:
- `asset` - The requested asset object
- `parent` - The parent asset (if it exists), or undefined
- `children` - Array of child assets (up to 100)
- `level` - Hierarchy level (0 if no parent, 1 if has parent)
- `path` - Array of asset numbers forming the hierarchy path from parent to asset

---

### `maximo_update_asset_spec`

**Description:** Update or add an asset specification attribute. Specify asset, site, attribute ID, and value. Values can be alphanumeric (alnvalue), numeric (numvalue), or table-based (tablevalue).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| assetattrid | string | Yes | Asset attribute ID (max 16 characters) |
| alnvalue | string | No | Alphanumeric value (max 254 characters) |
| numvalue | number | No | Numeric value |
| tablevalue | string | No | Table value (max 254 characters) |
| section | string | No | Section (max 10 characters) |
| measureunitid | string | No | Measurement unit ID (max 16 characters) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "assetattrid": "FLOWRATE",
  "numvalue": 500,
  "measureunitid": "GPM"
}
```

**Response:** Returns the created/updated asset specification record (ASSETSPEC child resource).

---

### `maximo_search_assets`

**Description:** Search assets with OSLC filters. Filter by status, type, location, parent, manufacturer, serial number, and more. Supports pagination, field selection, sorting, and date range filtering.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string or string[] | No | Filter by asset status (single value or array) |
| assettype | string or string[] | No | Filter by asset type (single value or array) |
| location | string | No | Filter by location code |
| parent | string | No | Filter by parent asset number |
| manufacturer | string | No | Filter by manufacturer |
| serialnum | string | No | Filter by serial number |
| siteid | string | No | Filter by site identifier |
| orgid | string | No | Filter by organization identifier |
| priority | number | No | Filter by priority (1-5) |
| failurecode | string | No | Filter by failure code |
| isrunning | boolean | No | Filter by running status |
| dateRange | object | No | Filter by date range (see below) |
| pageSize | number | No | Results per page (1-1000, default: 100) |
| page | number | No | Page number (1-based, default: 1) |
| select | string[] | No | Fields to return (OSLC select) |
| orderBy | string | No | Sort order (e.g., "+assetnum" or "-statusdate") |
| where | string | No | Custom OSLC where clause |
| searchTerms | string | No | Full-text search terms |

**`dateRange` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| start | string | Yes | Start date (ISO 8601) |
| end | string | Yes | End date (ISO 8601) |
| field | string | No | Date field: purchasedate, installdate, warrantyexpdate, statusdate, or changedate (default: statusdate) |

**Example Usage:**

```json
{
  "status": "OPERATING",
  "assettype": "PRODUCTION",
  "siteid": "BEDFORD",
  "manufacturer": "ACME Pumps",
  "pageSize": 25,
  "orderBy": "+assetnum"
}
```

**Response:** Returns a paginated result containing an array of assets, totalCount, page, pageSize, totalPages, hasNext, and hasPrevious flags.

---

### `maximo_get_meter_history`

**Description:** Retrieve meter reading history for an asset. Returns chronological list of meter readings with values, dates, and inspector details. Optionally filter by meter name.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| metername | string | No | Filter by specific meter name (max 10 characters) |
| pageSize | number | No | Results per page (1-1000, default: 100) |
| orderBy | string | No | Sort order (defaults to "-readingdate" for newest first) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "metername": "RUNHOURS",
  "pageSize": 50
}
```

**Response:** Returns a `MeterHistoryResponse` containing:
- `readings` - Array of meter history entries with metername, reading, readingdate, previousreading, previousreadingdate, inspector, remarks, rollover, and readingdelta
- `totalCount` - Total number of matching readings
- `pageSize` - Page size used

---

### `maximo_change_asset_status`

**Description:** Change the status of an asset (e.g., OPERATING, NOT READY, DECOMMISSIONED, MISSING, SEALED). Optionally provide a memo explaining the reason for the status change.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| status | string | Yes | New asset status: OPERATING, NOT READY, DECOMMISSIONED, MISSING, or SEALED |
| memo | string | No | Reason for status change (max 50 characters) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "status": "NOT READY",
  "memo": "Taken offline for scheduled overhaul"
}
```

**Response:** Returns the updated asset object with the new status.

---

### `maximo_get_asset_downtime`

**Description:** Retrieve downtime history for an asset. Returns downtime records with start/end dates, duration in hours, and reason codes. Optionally filter by date range. Includes total downtime hours across all records.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | Yes | Asset number |
| siteid | string | Yes | Site identifier |
| startDate | string | No | Filter records starting from this date (ISO 8601) |
| endDate | string | No | Filter records up to this date (ISO 8601) |

**Example Usage:**

```json
{
  "assetnum": "PUMP-001",
  "siteid": "BEDFORD",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-02-14T23:59:59Z"
}
```

**Response:** Returns a `DowntimeHistoryResponse` containing:
- `downtimeRecords` - Array of downtime entries with startdate, enddate, downtime (hours), code (reason), reportedby, statusatdowntime, and isrunning
- `totalCount` - Total number of downtime records
- `totalDowntimeHours` - Sum of all downtime hours across the returned records
