# Work Orders Module

API documentation for the Work Orders module in the Maximo MCP Server. This module provides 15 MCP tools for comprehensive work order lifecycle management, including creation, updates, status transitions, labor/material/service tracking, task management, and search.

## Status Workflow

Work orders follow this status lifecycle:

```
WAPPR (Waiting Approval) -> APPR (Approved) -> WSCH (Waiting Schedule) -> INPRG (In Progress) -> COMP (Complete) -> CLOSE (Closed)
```

Any status can transition to `CAN` (Cancelled).

## Work Types

| Code | Description |
|------|-------------|
| CM | Corrective Maintenance |
| PM | Preventive Maintenance |
| EM | Emergency |
| CAL | Calibration |
| INS | Inspection |

---

## Tools

### `maximo_create_workorder`

**Description:** Create a new work order in Maximo. Requires description, siteid, and worktype. Optionally specify asset, location, priority, schedule dates, and assignments.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | Yes | Work order description (max 100 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| worktype | string | Yes | Work type: CM, PM, EM, CAL, or INS |
| orgid | string | No | Organization identifier (max 8 characters) |
| assetnum | string | No | Asset number (max 12 characters) |
| location | string | No | Location code (max 12 characters) |
| priority | number | No | Priority level 1-5 (1 is highest) |
| schedstart | string | No | Scheduled start date (ISO 8601) |
| schedfinish | string | No | Scheduled finish date (ISO 8601) |
| targstartdate | string | No | Target start date (ISO 8601) |
| targcompdate | string | No | Target completion date (ISO 8601) |
| reportedby | string | No | Person who reported the work order |
| owner | string | No | Work order owner |
| ownergroup | string | No | Owner group |
| supervisor | string | No | Supervisor |
| lead | string | No | Lead person |
| wopriority | number | No | Work order priority 1-5 |
| estdur | number | No | Estimated duration in hours |
| description_longdescription | string | No | Long description |
| failurecode | string | No | Failure code |
| problemcode | string | No | Problem code |
| woclass | string | No | Work order class |
| glaccount | string | No | GL debit account |
| parent | string | No | Parent work order number |
| crewworkgroup | string | No | Crew work group |
| jpnum | string | No | Job plan number |
| externalrefid | string | No | External reference ID |

**Example Usage:**

```json
{
  "description": "Replace HVAC filter in Building A",
  "siteid": "BEDFORD",
  "worktype": "CM",
  "assetnum": "HVAC-001",
  "location": "BLDG-A",
  "priority": 2,
  "schedstart": "2026-02-15T08:00:00Z",
  "schedfinish": "2026-02-15T12:00:00Z"
}
```

**Response:** Returns the created work order object with all fields including the auto-generated `wonum`, initial status (`WAPPR`), and OSLC `href`.

---

### `maximo_get_workorder`

**Description:** Retrieve work order details by work order number and site ID. Returns complete work order information including status, dates, costs, and assignments.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the full work order object including all fields (wonum, description, status, statusdate, worktype, assetnum, location, priority, dates, costs, assignments, and href). Returns a 404 error if the work order is not found.

---

### `maximo_update_workorder`

**Description:** Update work order fields. Specify wonum and siteid to identify the work order, then provide any fields to update.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| updates | object | Yes | Fields to update (see below) |

**Updatable fields in `updates`:**

| Field | Type | Description |
|-------|------|-------------|
| description | string | Work order description |
| assetnum | string | Asset number |
| location | string | Location code |
| priority | number | Priority 1-5 |
| schedstart | string | Scheduled start date (ISO 8601) |
| schedfinish | string | Scheduled finish date (ISO 8601) |
| actstart | string | Actual start date (ISO 8601) |
| actfinish | string | Actual finish date (ISO 8601) |
| targstartdate | string | Target start date (ISO 8601) |
| targcompdate | string | Target completion date (ISO 8601) |
| owner | string | Work order owner |
| ownergroup | string | Owner group |
| supervisor | string | Supervisor |
| lead | string | Lead person |
| wopriority | number | Work order priority 1-5 |
| estdur | number | Estimated duration in hours |
| description_longdescription | string | Long description |
| failurecode | string | Failure code |
| problemcode | string | Problem code |
| woclass | string | Work order class |
| glaccount | string | GL debit account |
| crewworkgroup | string | Crew work group |
| externalrefid | string | External reference ID |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "updates": {
    "priority": 1,
    "owner": "JSMITH",
    "description": "Urgent: Replace HVAC filter in Building A"
  }
}
```

**Response:** Returns the updated work order object. Returns a 404 error if the work order is not found.

---

### `maximo_delete_workorder`

**Description:** Delete a work order from Maximo. This operation cannot be undone.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a success confirmation. Returns a 404 error if the work order is not found.

---

### `maximo_change_workorder_status`

**Description:** Change work order status following the Maximo workflow. Status transitions are validated against the allowed workflow path. Optionally include a memo for the status change.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| status | string | Yes | New status: WAPPR, APPR, WSCH, INPRG, COMP, CLOSE, or CAN |
| memo | string | No | Status change memo (max 50 characters) |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "status": "APPR",
  "memo": "Approved by maintenance manager"
}
```

**Response:** Returns the updated work order with the new status. Returns a 400 validation error if the status transition is invalid (e.g., trying to go from WAPPR directly to INPRG).

---

### `maximo_add_labor`

**Description:** Add labor transaction to a work order. Records labor hours, craft, and costs.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| laborcode | string | Yes | Labor code |
| hours | number | Yes | Hours worked (must be > 0) |
| transdate | string | Yes | Transaction date (ISO 8601) |
| starttime | string | No | Start time (ISO 8601) |
| finishtime | string | No | Finish time (ISO 8601) |
| regularhrs | number | No | Regular hours |
| premiumpayhours | number | No | Premium pay hours |
| craft | string | No | Craft code |
| skilllevel | string | No | Skill level |
| vendor | string | No | Vendor |
| contractnum | string | No | Contract number |
| linecost | number | No | Line cost |
| taskid | string | No | Task ID |
| geolocation | string | No | Geolocation |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "laborcode": "JSMITH",
  "hours": 4.5,
  "transdate": "2026-02-15T08:00:00Z",
  "craft": "ELEC",
  "skilllevel": "FIRSTCLASS"
}
```

**Response:** Returns the created labor transaction record (WPLABOR child resource).

---

### `maximo_add_material`

**Description:** Add material usage to a work order. Records material consumption from inventory.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| itemnum | string | Yes | Item number |
| quantity | number | Yes | Quantity (must be > 0) |
| storeroom | string | No | Storeroom location |
| binnum | string | No | Bin number |
| lotnum | string | No | Lot number |
| issuetype | string | No | Issue type |
| transdate | string | No | Transaction date (ISO 8601) |
| linecost | number | No | Line cost |
| unitcost | number | No | Unit cost |
| taskid | string | No | Task ID |
| gldebitacct | string | No | GL debit account |
| glcreditacct | string | No | GL credit account |
| conversion | number | No | Conversion factor |
| issueunit | string | No | Issue unit |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "itemnum": "FILTER-HVAC-01",
  "quantity": 2,
  "storeroom": "CENTRAL"
}
```

**Response:** Returns the created material transaction record (WPMAT child resource).

---

### `maximo_add_service`

**Description:** Add service entry to a work order. Records external service costs.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| description | string | Yes | Service description (max 100 characters) |
| linecost | number | Yes | Line cost (must be >= 0) |
| vendor | string | No | Vendor |
| contractnum | string | No | Contract number |
| ponum | string | No | Purchase order number |
| polinenum | number | No | Purchase order line number |
| taskid | string | No | Task ID |
| gldebitacct | string | No | GL debit account |
| enterdate | string | No | Entry date (ISO 8601) |
| enterby | string | No | Entered by |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "description": "HVAC duct cleaning service",
  "linecost": 750.00,
  "vendor": "CLEANAIR"
}
```

**Response:** Returns the created service entry record (WPSERVICE child resource).

---

### `maximo_add_worklog`

**Description:** Add work log entry to a work order. Records notes, updates, and communications.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| description | string | Yes | Log description/summary (max 100 characters) |
| logtype | string | No | Log type: WORK, UPDATE, CLIENTNOTE, or MODDATE |
| description_longdescription | string | No | Detailed log text |
| createdate | string | No | Create date (ISO 8601) |
| createby | string | No | Created by |
| clientviewable | boolean | No | Client viewable flag |
| class | string | No | Work log class |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "description": "Technician arrived on site",
  "logtype": "WORK",
  "description_longdescription": "Technician JSMITH arrived at Building A at 08:15. Began diagnostic inspection of HVAC unit."
}
```

**Response:** Returns the created work log entry (WORKLOG child resource).

---

### `maximo_assign_workorder`

**Description:** Assign work order to person, group, or crew. Updates ownership and responsibility. At least one assignment field must be provided.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| owner | string | No | Assigned owner |
| ownergroup | string | No | Assigned owner group |
| supervisor | string | No | Assigned supervisor |
| lead | string | No | Assigned lead person |
| crewworkgroup | string | No | Assigned crew work group |
| assignmentdate | string | No | Assignment date (ISO 8601) |
| scheduledate | string | No | Schedule date (ISO 8601) |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "owner": "JSMITH",
  "ownergroup": "MAINT-CREW",
  "supervisor": "MJONES"
}
```

**Response:** Returns the updated work order with new assignment fields.

---

### `maximo_search_workorders`

**Description:** Search work orders with flexible filters. Supports filtering by status, asset, location, work type, priority, owner, dates, and more. Returns paginated results.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string or string[] | No | Filter by status (single value or array of WAPPR, APPR, WSCH, INPRG, COMP, CLOSE, CAN) |
| assetnum | string | No | Filter by asset number |
| location | string | No | Filter by location |
| worktype | string or string[] | No | Filter by work type (single value or array of CM, PM, EM, CAL, INS) |
| priority | number | No | Filter by priority (1-5) |
| owner | string | No | Filter by owner |
| ownergroup | string | No | Filter by owner group |
| supervisor | string | No | Filter by supervisor |
| siteid | string | No | Filter by site |
| orgid | string | No | Filter by organization |
| dateRange | object | No | Filter by date range (see below) |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| page | number | No | Page number (1-based, default: 1) |
| select | string[] | No | Fields to return (OSLC select) |
| orderBy | string | No | Sort order (e.g., "+wonum" or "-statusdate") |
| where | string | No | Custom OSLC where clause |
| searchTerms | string | No | Full-text search terms |

**`dateRange` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| start | string | Yes | Start date (ISO 8601) |
| end | string | Yes | End date (ISO 8601) |
| field | string | No | Date field: schedstart, schedfinish, actstart, actfinish, statusdate, targstartdate, or targcompdate (default: statusdate) |

**Example Usage:**

```json
{
  "status": ["INPRG", "WSCH"],
  "siteid": "BEDFORD",
  "worktype": "CM",
  "priority": 1,
  "dateRange": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-02-28T23:59:59Z",
    "field": "schedstart"
  },
  "pageSize": 50,
  "orderBy": "-priority"
}
```

**Response:** Returns a paginated result containing an array of work orders, totalCount, page, pageSize, totalPages, hasNext, and hasPrevious flags.

---

### `maximo_add_task`

**Description:** Add a task (child activity) to a work order. Tasks represent individual steps or activities within a work order.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| description | string | Yes | Task description (max 100 characters) |
| taskid | number | Yes | Task ID / sequence number (positive integer) |
| estdur | number | No | Estimated duration in hours |
| ownergroup | string | No | Owner group for the task |
| owner | string | No | Task owner |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "description": "Shut down HVAC unit",
  "taskid": 10,
  "estdur": 0.5,
  "owner": "JSMITH"
}
```

**Response:** Returns the created task record (WOACTIVITY child resource).

---

### `maximo_get_tasks`

**Description:** Retrieve all tasks (child activities) for a work order. Returns the woactivity array containing task details such as description, task ID, estimated duration, and assignments.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of task objects from the work order's `woactivity` child collection. Each task includes description, taskid, estdur, ownergroup, owner, and status. Returns 404 if the work order is not found.

---

### `maximo_get_worklogs`

**Description:** Retrieve all work log entries for a work order. Returns the worklog array containing log details such as description, log type, timestamps, and long descriptions.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns an array of work log objects from the work order's `worklog` child collection. Each entry includes description, logtype, description_longdescription, createdate, createby, and clientviewable. Returns 404 if the work order is not found.

---

### `maximo_close_workorder`

**Description:** Close a work order. The work order must be in COMP (Completed) status before it can be closed. This is a convenience method that validates the current status and transitions to CLOSE.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wonum | string | Yes | Work order number |
| siteid | string | Yes | Site identifier |
| memo | string | No | Close memo (max 50 characters) |

**Example Usage:**

```json
{
  "wonum": "WO-1001",
  "siteid": "BEDFORD",
  "memo": "Work completed and verified"
}
```

**Response:** Returns the updated work order with status CLOSE. Returns a 400 validation error if the work order is not currently in COMP status.
