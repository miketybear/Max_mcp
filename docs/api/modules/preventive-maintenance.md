# Preventive Maintenance Module

API documentation for the Preventive Maintenance (PM) module in the Maximo MCP Server. This module provides 13 MCP tools for comprehensive preventive maintenance management, including creation, updates, deletion, search, work order generation, completion tracking, history, scheduling, frequency management, and status lifecycle controls.

## Overview

Preventive maintenance records define recurring maintenance activities that are scheduled either by time intervals (e.g., every 30 days) or by meter readings (e.g., every 5000 miles). When a PM comes due, work orders are generated automatically or on-demand to carry out the defined maintenance tasks.

## Status Workflow

PM records follow this status lifecycle:

```
ACTIVE <-> INACTIVE
ACTIVE <-> SUSPEND
```

| Status | Description |
|--------|-------------|
| ACTIVE | PM is active and will generate work orders on schedule |
| INACTIVE | PM is disabled and will not generate work orders |
| SUSPEND | PM is temporarily suspended |

## Frequency Units

| Unit | Description |
|------|-------------|
| DAYS | Every N days |
| WEEKS | Every N weeks |
| MONTHS | Every N months |
| YEARS | Every N years |
| HOURS | Every N operating hours (meter-based) |
| METERS | Every N meters (meter-based) |
| MILES | Every N miles (meter-based) |
| KILOMETERS | Every N kilometers (meter-based) |

---

## Tools

### `maximo_create_pm`

**Description:** Create a new preventive maintenance record in Maximo. Requires description, siteid, frequency, and frequnit. Optionally specify asset, location, next due date, job plan, work type, priority, and meter settings.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | Yes | PM description (max 100 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| frequency | number | Yes | Frequency value (must be positive) |
| frequnit | string | Yes | Frequency unit: DAYS, WEEKS, MONTHS, YEARS, HOURS, METERS, MILES, or KILOMETERS |
| orgid | string | No | Organization identifier (max 8 characters) |
| assetnum | string | No | Asset number (max 12 characters) |
| location | string | No | Location code (max 12 characters) |
| nextdate | string | No | Next due date in ISO 8601 format |
| jpnum | string | No | Job plan number (max 10 characters) |
| worktype | string | No | Work type (max 4 characters) |
| priority | number | No | Priority level 1-5, where 1 is highest |
| estdur | number | No | Estimated duration in hours |
| leadcraft | string | No | Lead craft (max 8 characters) |
| route | string | No | Route (max 8 characters) |
| meterbased | boolean | No | Meter-based flag |
| metername | string | No | Meter name (max 8 characters) |
| meterreading | number | No | Meter reading threshold |
| calendar | string | No | Calendar (max 8 characters) |
| comments | string | No | Comments |

**Example Usage:**

```json
{
  "description": "Quarterly HVAC inspection",
  "siteid": "BEDFORD",
  "frequency": 90,
  "frequnit": "DAYS",
  "assetnum": "HVAC-001",
  "location": "BLDG-A",
  "jpnum": "JP-HVAC-01",
  "worktype": "PM",
  "priority": 3,
  "nextdate": "2026-04-01T00:00:00Z"
}
```

**Response:** Returns the created PM record with all fields including the auto-generated `pmnum` and initial status.

---

### `maximo_get_pm`

**Description:** Retrieve preventive maintenance record details by PM number and optional site ID. Returns complete PM information including status, frequency, next due date, and associated asset/location.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the complete PM record including description, status, frequency, frequnit, next due date, associated asset/location, and job plan reference.

---

### `maximo_update_pm`

**Description:** Update preventive maintenance record fields. Specify pmnum and optional siteid to identify the PM, then provide any fields to update (description, frequency, next date, asset, location, status, etc.).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | No | Site identifier |
| updates | object | Yes | Fields to update (see sub-properties below) |

**Updates sub-properties:**

| Property | Type | Description |
|----------|------|-------------|
| description | string | PM description |
| frequency | number | Frequency value |
| frequnit | string | Frequency unit: DAYS, WEEKS, MONTHS, YEARS, HOURS, METERS, MILES, or KILOMETERS |
| nextdate | string | Next due date (ISO 8601) |
| assetnum | string | Asset number |
| location | string | Location code |
| jpnum | string | Job plan number |
| worktype | string | Work type |
| priority | number | Priority 1-5 |
| estdur | number | Estimated duration in hours |
| leadcraft | string | Lead craft |
| route | string | Route |
| meterbased | boolean | Meter-based flag |
| metername | string | Meter name |
| meterreading | number | Meter reading threshold |
| calendar | string | Calendar |
| comments | string | Comments |
| status | string | PM status: ACTIVE, INACTIVE, or SUSPEND |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "updates": {
    "frequency": 60,
    "frequnit": "DAYS",
    "priority": 2,
    "nextdate": "2026-03-15T00:00:00Z"
  }
}
```

**Response:** Returns the updated PM record.

---

### `maximo_delete_pm`

**Description:** Delete a preventive maintenance record. Specify pmnum and optional siteid to identify the PM to delete.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns confirmation of deletion.

---

### `maximo_generate_pm_wo`

**Description:** Generate work orders from a preventive maintenance record. Specify pmnum and optionally provide a target date. Returns an array of generated work order numbers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| targetdate | string | No | Target generation date in ISO 8601 format (defaults to current date) |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "targetdate": "2026-03-01T00:00:00Z",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of generated work order numbers created from the PM schedule.

---

### `maximo_create_jobplan`

**Description:** Create a new job plan in Maximo from within the PM module. Requires jpnum, description, and siteid. Optionally specify work type, priority, lead craft, and job plan tasks.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number (max 10 characters) |
| description | string | Yes | Job plan description (max 100 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| estdur | number | No | Estimated duration in hours |
| worktype | string | No | Work type (max 4 characters) |
| priority | number | No | Priority level 1-5, where 1 is highest |
| leadcraft | string | No | Lead craft (max 8 characters) |
| comments | string | No | Comments |
| jptask | array | No | Job plan tasks (see task sub-properties below) |

**Task sub-properties (jptask array items):**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| description | string | Yes | Task description |
| tasktype | string | No | Task type |
| estdur | number | No | Estimated duration in hours |
| seqnum | number | No | Sequence number |

**Example Usage:**

```json
{
  "jpnum": "JP-PUMP-01",
  "description": "Pump bearing inspection",
  "siteid": "BEDFORD",
  "worktype": "PM",
  "priority": 3,
  "leadcraft": "MECH",
  "jptask": [
    {
      "description": "Lock out / tag out pump",
      "seqnum": 10,
      "estdur": 0.5
    },
    {
      "description": "Remove bearing housing cover",
      "seqnum": 20,
      "estdur": 1.0
    },
    {
      "description": "Inspect bearings for wear",
      "seqnum": 30,
      "estdur": 0.5
    }
  ]
}
```

**Response:** Returns the created job plan object with all fields and tasks.

---

### `maximo_search_pms`

**Description:** Search preventive maintenance records with filters. Filter by asset, location, status, site, job plan, or work type. Supports pagination with pageSize and pageNum parameters.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assetnum | string | No | Asset number filter |
| location | string | No | Location code filter |
| status | string or string[] | No | PM status filter: ACTIVE, INACTIVE, or SUSPEND (single value or array) |
| siteid | string | No | Site identifier filter |
| jpnum | string | No | Job plan number filter |
| worktype | string | No | Work type filter |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| pageNum | number | No | Page number (default: 1) |

**Example Usage:**

```json
{
  "status": "ACTIVE",
  "siteid": "BEDFORD",
  "worktype": "PM",
  "pageSize": 50
}
```

**Response:** Returns paginated list of PM records matching the filter criteria.

---

### `maximo_complete_pm`

**Description:** Mark a preventive maintenance record as completed. Updates the last completion date and optionally adds a completion memo. Requires pmnum and siteid. Completion date defaults to current date if not specified.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |
| completionDate | string | No | Completion date in ISO 8601 format (defaults to current date) |
| memo | string | No | Completion memo or notes (max 500 characters) |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "completionDate": "2026-02-14T16:00:00Z",
  "memo": "All filters replaced, system operating normally"
}
```

**Response:** Returns the updated PM record with completion date recorded.

---

### `maximo_get_pm_history`

**Description:** Get the maintenance history for a preventive maintenance record. Retrieves work orders that were generated from this PM, including work order number, status, actual start/finish dates, and description. Results are sorted by most recent first.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |
| pageSize | number | No | Number of history records to return (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "pageSize": 20
}
```

**Response:** Returns an array of work orders generated from this PM, sorted by most recent first. Each record includes wonum, description, status, actual start/finish dates, and completion details.

---

### `maximo_get_pm_schedule`

**Description:** Get the projected schedule for a preventive maintenance record. Calculates the next N scheduled dates based on the PM frequency and frequency unit (DAYS, WEEKS, MONTHS, YEARS). Only works for time-based PMs (not meter-based).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |
| count | number | No | Number of projected dates to calculate (default: 5, max: 52) |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "count": 12
}
```

**Response:** Returns an array of projected future dates when the PM will next be due, calculated from the current next date and frequency settings.

---

### `maximo_update_pm_frequency`

**Description:** Update the frequency settings of a preventive maintenance record. Changes both the frequency value and frequency unit. Only time-based frequency units are supported: DAYS, WEEKS, MONTHS, YEARS.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |
| frequency | number | Yes | New frequency value (must be positive) |
| frequnit | string | Yes | New frequency unit: DAYS, WEEKS, MONTHS, or YEARS |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "frequency": 6,
  "frequnit": "MONTHS"
}
```

**Response:** Returns the updated PM record with new frequency settings applied.

---

### `maximo_activate_pm`

**Description:** Activate a preventive maintenance record by setting its status to ACTIVE. Requires pmnum and siteid to identify the PM record.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the PM record with status set to ACTIVE.

---

### `maximo_deactivate_pm`

**Description:** Deactivate a preventive maintenance record by setting its status to INACTIVE. Requires pmnum and siteid to identify the PM record.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pmnum | string | Yes | PM number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the PM record with status set to INACTIVE.

---

## Common Workflows

### Setting Up a Time-Based PM

1. **Create a job plan** (optional): Use `maximo_create_jobplan` to define the maintenance procedure.
2. **Create the PM record:** Use `maximo_create_pm` with frequency, frequnit, and next date.
3. **Activate the PM:** Use `maximo_activate_pm` to enable work order generation.
4. **Generate work orders:** Use `maximo_generate_pm_wo` to create work orders on demand, or let the system generate them automatically.

### Reviewing PM Performance

1. **Check compliance:** Use `maximo_pm_compliance` (in the Analytics module) to see overall PM compliance rates.
2. **Review history:** Use `maximo_get_pm_history` to see past work orders generated from a specific PM.
3. **Project schedule:** Use `maximo_get_pm_schedule` to see upcoming due dates.

### Adjusting PM Frequency

```json
// Change from quarterly (90 days) to monthly (30 days)
{
  "pmnum": "PM-1001",
  "siteid": "BEDFORD",
  "frequency": 30,
  "frequnit": "DAYS"
}
```

### Temporarily Suspending a PM

Use `maximo_deactivate_pm` to stop work order generation. Use `maximo_activate_pm` to resume when ready.
