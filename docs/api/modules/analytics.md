# Analytics Module

API documentation for the Analytics module in the Maximo MCP Server. This module provides 7 MCP tools for reporting, KPI queries, and dashboard aggregation across work orders, assets, inventory, and preventive maintenance.

## Overview

The Analytics module provides read-only aggregate views of Maximo operational data. It is designed for dashboards, management reporting, and quick operational assessments. All tools query live Maximo data and return computed summaries rather than raw records.

---

## Tools

### `maximo_wo_summary`

**Description:** Get a work order summary with counts grouped by status (WAPPR, APPR, INPRG, COMP, CLOSE, etc.) for a site. Optionally filter by a date range on statusdate. Returns total count and per-status breakdown.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| dateRange | object | No | Date range filter for work order status date |
| dateRange.startDate | string | Yes (if dateRange) | Start date in ISO 8601 format |
| dateRange.endDate | string | Yes (if dateRange) | End date in ISO 8601 format |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "dateRange": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-02-14T23:59:59Z"
  }
}
```

**Response:** Returns total work order count and a breakdown by status (e.g., WAPPR: 12, APPR: 8, INPRG: 15, COMP: 45, CLOSE: 120).

---

### `maximo_asset_health`

**Description:** Get an asset health summary for a site. Returns total assets, counts by status (OPERATING, NOT READY, DECOMMISSIONED), and number of assets with recorded downtime.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD"
}
```

**Response:** Returns total asset count, counts by operational status (OPERATING, NOT READY, DECOMMISSIONED), and the number of assets that have experienced downtime.

---

### `maximo_inventory_summary`

**Description:** Get an inventory summary for a site. Returns total inventory items, items below reorder point, and items that are out of stock.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD"
}
```

**Response:** Returns total inventory item count, count of items below their reorder point, and count of items that are completely out of stock.

---

### `maximo_pm_compliance`

**Description:** Get preventive maintenance compliance for a site. Compares PM next dates to today to determine on-schedule vs overdue PMs. Returns total PMs, overdue count, on-schedule count, and compliance rate as a percentage.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| dateRange | object | No | Date range filter for PM next date |
| dateRange.startDate | string | Yes (if dateRange) | Start date in ISO 8601 format |
| dateRange.endDate | string | Yes (if dateRange) | End date in ISO 8601 format |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "dateRange": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-06-30T23:59:59Z"
  }
}
```

**Response:** Returns total PM count, overdue count, on-schedule count, and compliance rate as a percentage (e.g., 87.5%).

---

### `maximo_dashboard`

**Description:** Get a combined KPI dashboard for a site. Aggregates work order summary, asset health, inventory summary, and PM compliance into a single response. This is the go-to tool for a quick overview of site operations.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| dateRange | object | No | Date range filter for time-bound queries (work orders and PM compliance) |
| dateRange.startDate | string | Yes (if dateRange) | Start date in ISO 8601 format |
| dateRange.endDate | string | Yes (if dateRange) | End date in ISO 8601 format |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "dateRange": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-02-14T23:59:59Z"
  }
}
```

**Response:** Returns a combined object with four sections:
- **workOrders:** Status breakdown and total count
- **assetHealth:** Asset status counts and downtime metrics
- **inventory:** Stock levels, reorder alerts, and out-of-stock counts
- **pmCompliance:** Compliance rate, overdue count, and on-schedule count

---

### `maximo_overdue_workorders`

**Description:** Get work orders that are overdue (target start date is in the past and status is still open). Open statuses include WAPPR, APPR, WSCH, and INPRG. Results are sorted by target start date ascending.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| pageSize | number | No | Number of results to return (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "pageSize": 25
}
```

**Response:** Returns an array of overdue work orders sorted by target start date (oldest first). Each record includes wonum, description, status, target start date, priority, asset, and location.

---

### `maximo_top_downtime_assets`

**Description:** Get the top assets by downtime hours for a site, sorted by total downtime descending. Useful for identifying assets that need the most attention or maintenance investment.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| limit | number | No | Number of assets to return (default: 10, max: 100) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "limit": 5
}
```

**Response:** Returns an array of assets ranked by total downtime hours (highest first). Each record includes assetnum, description, location, total downtime hours, and asset status.

---

## Common Workflows

### Daily Operations Check

Use `maximo_dashboard` for a single-call overview of your site:

```json
{
  "siteid": "BEDFORD"
}
```

This returns work order status distribution, asset health, inventory alerts, and PM compliance in one response.

### Identifying Maintenance Bottlenecks

1. **Check overdue work:** Use `maximo_overdue_workorders` to find work that is past due.
2. **Identify problem assets:** Use `maximo_top_downtime_assets` to find assets consuming the most maintenance resources.
3. **Review PM compliance:** Use `maximo_pm_compliance` to check if preventive maintenance is on track.

### Monthly Reporting

Combine multiple analytics tools with date ranges for a monthly snapshot:

```json
// Work order activity for January 2026
{
  "siteid": "BEDFORD",
  "dateRange": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z"
  }
}
```

Apply the same date range to `maximo_wo_summary` and `maximo_pm_compliance` for a consistent monthly view.
