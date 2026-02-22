# Job Plans Module

API documentation for the Job Plans (PLANS) module in the Maximo MCP Server. This module provides 11 MCP tools for comprehensive job plan management, including creation, updates, deletion, search, task management, labor/material/service requirements, and associated work order queries.

## Overview

Job plans are reusable templates that define the tasks, labor, materials, and services needed to complete work orders. They serve as blueprints for standardizing maintenance procedures across your organization.

## Status Workflow

Job plans follow this status lifecycle:

```
DRAFT -> ACTIVE -> REVISED -> INACTIVE
```

| Status | Description |
|--------|-------------|
| DRAFT | Initial state, plan is being defined |
| ACTIVE | Plan is available for use on work orders |
| REVISED | Plan has been modified from an active version |
| INACTIVE | Plan is no longer available for new work orders |

---

## Tools

### `maximo_create_jobplan`

**Description:** Create a new job plan (MXJP) in Maximo. Job plans are reusable templates that define tasks, labor, materials, and services needed for work orders. Requires jpnum and description.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number (max 10 characters) |
| description | string | Yes | Job plan description (max 100 characters) |
| siteid | string | No | Site identifier (optional for org-level plans, max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| status | string | No | Job plan status: DRAFT, ACTIVE, INACTIVE, or REVISED (defaults to DRAFT) |
| priority | number | No | Priority level 1-5, where 1 is highest |
| duration | number | No | Estimated duration in hours |
| interruptible | boolean | No | Whether work can be interrupted |
| downtime | boolean | No | Whether asset downtime is required |
| description_longdescription | string | No | Long description |
| worktype | string | No | Work type (max 5 characters) |
| craft | string | No | Craft associated with the job plan |
| templatetype | string | No | Template type |
| safetyplanid | string | No | Safety plan identifier |
| failurecode | string | No | Failure code |
| glaccount | string | No | GL debit account |
| flowcontrolled | boolean | No | Whether flow control is enabled |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "description": "Quarterly HVAC filter replacement",
  "siteid": "BEDFORD",
  "status": "DRAFT",
  "priority": 3,
  "duration": 2.5,
  "downtime": false,
  "worktype": "PM"
}
```

**Response:** Returns the created job plan object with all fields including the initial status and OSLC `href`.

---

### `maximo_get_jobplan`

**Description:** Retrieve job plan details by job plan number. Optionally filter by site ID. Returns complete job plan information including status, duration, and configuration.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| siteid | string | No | Site identifier (for site-specific plans) |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the complete job plan record including description, status, priority, duration, tasks, labor, materials, and service definitions.

---

### `maximo_update_jobplan`

**Description:** Update job plan fields. Specify jpnum and siteid to identify the job plan, then provide any fields to update (description, status, priority, duration, etc.).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| siteid | string | Yes | Site identifier |
| updates | object | Yes | Fields to update (see sub-properties below) |

**Updates sub-properties:**

| Property | Type | Description |
|----------|------|-------------|
| description | string | Job plan description |
| status | string | Job plan status: DRAFT, ACTIVE, INACTIVE, or REVISED |
| priority | number | Priority 1-5 |
| duration | number | Estimated duration in hours |
| interruptible | boolean | Whether work can be interrupted |
| downtime | boolean | Whether asset downtime is required |
| description_longdescription | string | Long description |
| worktype | string | Work type |
| craft | string | Craft code |
| templatetype | string | Template type |
| safetyplanid | string | Safety plan identifier |
| failurecode | string | Failure code |
| glaccount | string | GL debit account |
| flowcontrolled | boolean | Flow control flag |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD",
  "updates": {
    "status": "ACTIVE",
    "priority": 2,
    "duration": 3.0
  }
}
```

**Response:** Returns the updated job plan object.

---

### `maximo_delete_jobplan`

**Description:** Delete a job plan from Maximo. Requires job plan number. Optionally specify site ID. This operation cannot be undone.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns confirmation of deletion.

---

### `maximo_search_jobplans`

**Description:** Search job plans with flexible filters. Supports filtering by jpnum, status, site, organization, priority, work type, and craft. Returns paginated results.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | No | Filter by job plan number (supports % wildcard) |
| status | string or string[] | No | Filter by status: DRAFT, ACTIVE, INACTIVE, or REVISED (single value or array) |
| siteid | string | No | Filter by site |
| orgid | string | No | Filter by organization |
| priority | number | No | Filter by priority (1-5) |
| worktype | string | No | Filter by work type |
| craft | string | No | Filter by craft |
| pageSize | number | No | Number of results per page (default: 100, max: 1000) |
| page | number | No | Page number, 1-based (default: 1) |
| select | string[] | No | Fields to return (OSLC select) |
| orderBy | string | No | Sort order (OSLC orderBy), e.g., "+jpnum" or "-status" |
| where | string | No | Custom OSLC where clause |
| searchTerms | string | No | Search terms for full-text search |

**Example Usage:**

```json
{
  "status": "ACTIVE",
  "siteid": "BEDFORD",
  "worktype": "PM",
  "pageSize": 50,
  "orderBy": "+jpnum"
}
```

**Response:** Returns paginated list of job plans matching the filter criteria.

---

### `maximo_add_jobplan_task`

**Description:** Add a task to a job plan. Tasks define individual steps or activities within the plan. Requires job plan number, task number (jptask), and description.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| jptask | number | Yes | Task number / sequence (positive integer) |
| description | string | Yes | Task description (max 100 characters) |
| siteid | string | No | Site identifier |
| metername | string | No | Meter name for condition-based task |
| interruptible | boolean | No | Whether the task can be interrupted |
| duration | number | No | Estimated duration in hours |
| sequence | number | No | Task sequence for ordering |
| ownergroup | string | No | Owner group for the task |
| craft | string | No | Craft code |
| description_longdescription | string | No | Long description for the task |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD",
  "jptask": 10,
  "description": "Turn off HVAC system",
  "duration": 0.25,
  "sequence": 1,
  "craft": "ELEC"
}
```

**Response:** Returns the created task object including task number, description, and sequence.

---

### `maximo_get_jobplan_tasks`

**Description:** Retrieve all tasks for a job plan. Returns the jobtask array containing task details such as task number, description, duration, sequence, and craft.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of task objects with task number, description, duration, sequence, craft, and other task details.

---

### `maximo_add_jobplan_labor`

**Description:** Add labor requirement to a job plan. Defines craft, quantity, and hours needed. Requires job plan number, craft code, quantity, and hours.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| craft | string | Yes | Craft code |
| quantity | number | Yes | Number of labor resources required (min 1) |
| hours | number | Yes | Hours per labor resource (must be > 0) |
| siteid | string | No | Site identifier |
| rate | number | No | Hourly rate |
| skilllevel | string | No | Skill level required |
| vendor | string | No | Vendor for outside labor |
| contractnum | string | No | Contract number |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD",
  "craft": "ELEC",
  "quantity": 2,
  "hours": 4,
  "rate": 75.00,
  "skilllevel": "JOURNEYMAN"
}
```

**Response:** Returns the created labor requirement object including craft, quantity, hours, and calculated cost.

---

### `maximo_add_jobplan_material`

**Description:** Add material requirement to a job plan. Defines items and quantities needed. Requires job plan number, item number, and quantity.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| itemnum | string | Yes | Item number |
| itemqty | number | Yes | Quantity required (must be > 0) |
| siteid | string | No | Site identifier |
| description | string | No | Item description |
| conditioncode | string | No | Condition code for the material |
| storeroom | string | No | Storeroom location |
| unitcost | number | No | Unit cost |
| directreq | boolean | No | Direct issue flag |
| linetype | string | No | Line type |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD",
  "itemnum": "FILTER-20X25",
  "itemqty": 4,
  "description": "HVAC Air Filter 20x25",
  "storeroom": "CENTRAL",
  "unitcost": 12.50
}
```

**Response:** Returns the created material requirement object including item number, quantity, and cost details.

---

### `maximo_add_jobplan_service`

**Description:** Add service requirement to a job plan. Defines external services needed. Requires job plan number and service description.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| description | string | Yes | Service description (max 100 characters) |
| siteid | string | No | Site identifier |
| vendor | string | No | Vendor code |
| linecost | number | No | Estimated line cost |
| contractnum | string | No | Contract number |
| linetype | string | No | Line type |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD",
  "description": "Refrigerant recharge service",
  "vendor": "COOLTECH",
  "linecost": 350.00,
  "contractnum": "CTR-2026-001"
}
```

**Response:** Returns the created service requirement object including description, vendor, and cost.

---

### `maximo_get_jobplan_workorders`

**Description:** Retrieve work orders that reference a specific job plan. Returns a list of work orders with their number, description, status, and schedule dates.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jpnum | string | Yes | Job plan number |
| siteid | string | No | Site identifier |

**Example Usage:**

```json
{
  "jpnum": "JP-HVAC-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of work orders associated with the job plan, each including wonum, description, status, scheduled start/finish dates, and asset information.

---

## Common Workflows

### Creating a Complete Job Plan

1. **Create the job plan:** Use `maximo_create_jobplan` with base fields.
2. **Add tasks:** Use `maximo_add_jobplan_task` for each step in the procedure.
3. **Add labor requirements:** Use `maximo_add_jobplan_labor` for each craft needed.
4. **Add material requirements:** Use `maximo_add_jobplan_material` for each part or supply.
5. **Add service requirements:** Use `maximo_add_jobplan_service` for external services.
6. **Activate the plan:** Use `maximo_update_jobplan` to set status to `ACTIVE`.

### Finding Job Plans for a Work Type

```json
// Search for all active PM job plans
{
  "status": "ACTIVE",
  "worktype": "PM",
  "orderBy": "+jpnum"
}
```

### Reviewing Job Plan Usage

Use `maximo_get_jobplan_workorders` to see which work orders reference a job plan before making changes or deactivating it.
