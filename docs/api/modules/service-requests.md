# Service Requests Module

API documentation for the Service Requests module in the Maximo MCP Server. This module provides 12 MCP tools for comprehensive service request lifecycle management, including creation, updates, status transitions, work order conversion, work logging, assignment, escalation, and solution tracking.

## Status Workflow

Service requests follow this status lifecycle:

```
NEW -> QUEUED -> INPROG (In Progress) -> PENDING -> RESOLVED -> CLOSED
```

Most statuses can also transition to `CANCELLED`.

## Key Concepts

- **ticketid** - The unique identifier for a service request (analogous to wonum for work orders)
- **reportedby** - The person who submitted the service request
- **affectedperson** - The person affected by the issue
- **reportedpriority** - Priority as reported by the requester (1-5, where 1 is highest)
- **Service requests can be converted to work orders** for tracked maintenance activities

---

## Tools

### `maximo_create_sr`

**Description:** Create a new service request in Maximo. Requires description, reportedby, and siteid. Optionally specify affected person, asset, location, priority, classification, and contact information.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | Yes | Service request description (max 100 characters) |
| reportedby | string | Yes | Person who reported the request (max 30 characters) |
| siteid | string | Yes | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| affectedperson | string | No | Affected person (max 30 characters) |
| assetnum | string | No | Asset number (max 12 characters) |
| location | string | No | Location code (max 12 characters) |
| reportedpriority | number | No | Reported priority 1-5 (1 is highest) |
| classstructureid | string | No | Classification structure ID (max 20 characters) |
| owner | string | No | Service request owner (max 30 characters) |
| ownergroup | string | No | Owner group (max 8 characters) |
| targetstart | string | No | Target start date (ISO 8601) |
| targetfinish | string | No | Target finish date (ISO 8601) |
| externalsystem | string | No | External system identifier (max 10 characters) |
| externalrefid | string | No | External reference ID (max 10 characters) |
| commodity | string | No | Commodity code (max 8 characters) |
| commoditygroup | string | No | Commodity group (max 8 characters) |
| description_longdescription | string | No | Long description |
| class | string | No | Service request class (max 16 characters) |
| tickettype | string | No | Service request type (max 16 characters) |
| contact | string | No | Contact information (max 30 characters) |
| phone | string | No | Phone number (max 20 characters) |
| email | string | No | Email address |
| building | string | No | Building (max 12 characters) |
| floor | string | No | Floor (max 12 characters) |
| room | string | No | Room (max 12 characters) |
| supervisor | string | No | Supervisor (max 30 characters) |
| parentticket | string | No | Parent ticket ID (max 10 characters) |

**Example Usage:**

```json
{
  "description": "Office printer not working",
  "reportedby": "JDOE",
  "siteid": "BEDFORD",
  "affectedperson": "JDOE",
  "location": "OFFICE-3F",
  "reportedpriority": 3,
  "building": "MAIN",
  "floor": "3",
  "room": "301",
  "phone": "555-0123"
}
```

**Response:** Returns the created service request object with all fields including the auto-generated `ticketid`, initial status (`NEW`), reportdate, and OSLC `href`.

---

### `maximo_get_sr`

**Description:** Retrieve service request details by ticket ID and site ID. Returns complete service request information including status, dates, assignments, and related work order.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns the full service request object including all fields (ticketid, description, status, statusdate, reportedby, reportdate, affectedperson, assetnum, location, owner, ownergroup, priority, dates, contact info, resolution, and href). Returns a 404 error if the service request is not found.

---

### `maximo_update_sr`

**Description:** Update service request fields. Specify ticketid and siteid to identify the service request, then provide any fields to update. Status transitions are validated.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| updates | object | Yes | Fields to update (see below) |

**Updatable fields in `updates`:**

| Field | Type | Description |
|-------|------|-------------|
| description | string | Service request description |
| status | string | Status: NEW, QUEUED, INPROG, PENDING, RESOLVED, CLOSED, CANCELLED |
| affectedperson | string | Affected person |
| assetnum | string | Asset number |
| location | string | Location code |
| classstructureid | string | Classification structure ID |
| owner | string | Service request owner |
| ownergroup | string | Owner group |
| targetstart | string | Target start date (ISO 8601) |
| targetfinish | string | Target finish date (ISO 8601) |
| actstart | string | Actual start date (ISO 8601) |
| actfinish | string | Actual finish date (ISO 8601) |
| reportedpriority | number | Reported priority 1-5 |
| commodity | string | Commodity code |
| commoditygroup | string | Commodity group |
| description_longdescription | string | Long description |
| class | string | Service request class |
| tickettype | string | Service request type |
| contact | string | Contact information |
| phone | string | Phone number |
| email | string | Email address |
| building | string | Building |
| floor | string | Floor |
| room | string | Room |
| supervisor | string | Supervisor |
| resolutioncode | string | Resolution code |
| solution | string | Solution |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "updates": {
    "description": "Office printer not working - paper jam",
    "reportedpriority": 2,
    "owner": "TECHSUPPORT1"
  }
}
```

**Response:** Returns the updated service request object. Validates status transitions when status is included in the update.

---

### `maximo_delete_sr`

**Description:** Delete a service request from Maximo. This operation cannot be undone.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a success confirmation. Returns a 404 error if the service request is not found.

---

### `maximo_change_sr_status`

**Description:** Change service request status following the workflow. Validates status transitions. Can also transition to CANCELLED from most statuses. Requires resolution code for RESOLVED/CLOSED.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| status | string | Yes | New status: NEW, QUEUED, INPROG, PENDING, RESOLVED, CLOSED, or CANCELLED |
| memo | string | No | Status change memo/reason (max 255 characters) |
| resolutioncode | string | No | Resolution code (required for RESOLVED/CLOSED, max 8 characters) |
| solution | string | No | Solution description (for RESOLVED/CLOSED) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "status": "RESOLVED",
  "memo": "Issue resolved by replacing toner cartridge",
  "resolutioncode": "REPLACED"
}
```

**Response:** Returns the updated service request with the new status. The `actfinish` date is automatically set when transitioning to RESOLVED or CLOSED. Returns a validation error if the status transition is invalid.

---

### `maximo_convert_sr_to_wo`

**Description:** Convert a service request to a work order. Creates a new work order with data from the service request and links it back to the service request. The new work order inherits the SR's description, asset, location, priority, owner, and organization.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| worktype | string | No | Work type for the new work order (defaults to CM, max 5 characters) |
| description | string | No | Work order description (defaults to SR description, max 100 characters) |
| priority | number | No | Work order priority 1-5 (defaults to SR priority) |
| schedstart | string | No | Scheduled start date (ISO 8601) |
| schedfinish | string | No | Scheduled finish date (ISO 8601) |
| owner | string | No | Work order owner (defaults to SR owner) |
| ownergroup | string | No | Owner group (defaults to SR owner group) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "worktype": "CM",
  "schedstart": "2026-02-16T08:00:00Z",
  "schedfinish": "2026-02-16T12:00:00Z"
}
```

**Response:** Returns a `WorkOrderConversionResult` containing:
- `success` - Whether the conversion was successful
- `wonum` - The work order number of the newly created work order
- `workOrder` - The full work order object
- `serviceRequest` - The updated service request (with `relatedwonum` field set)

The service request's `relatedwonum` field is automatically updated to reference the new work order.

---

### `maximo_search_srs`

**Description:** Search service requests with flexible filtering options. Filter by status, reported by, affected person, asset, location, priority, owner, classification, commodity, date ranges, and more. Supports pagination and field selection.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string or string[] | No | Filter by status (single value or array) |
| reportedby | string | No | Filter by person who reported |
| affectedperson | string | No | Filter by affected person |
| assetnum | string | No | Filter by asset number |
| location | string | No | Filter by location |
| reportedpriority | number | No | Filter by reported priority (1-5) |
| owner | string | No | Filter by owner |
| ownergroup | string | No | Filter by owner group |
| siteid | string | No | Filter by site |
| orgid | string | No | Filter by organization |
| classstructureid | string | No | Filter by classification |
| commodity | string | No | Filter by commodity |
| commoditygroup | string | No | Filter by commodity group |
| tickettype | string | No | Filter by ticket type |
| relatedwonum | string | No | Filter by related work order number |
| dateRange | object | No | Filter by date range (see below) |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| page | number | No | Page number (default: 1) |
| select | string[] | No | Fields to return |
| orderBy | string | No | Sort order (e.g., "+ticketid" or "-reportdate") |
| where | string | No | Custom OSLC where clause |
| searchTerms | string | No | Full-text search terms |

**`dateRange` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| start | string | Yes | Start date (ISO 8601) |
| end | string | Yes | End date (ISO 8601) |
| field | string | No | Date field: reportdate, statusdate, targetstart, targetfinish, actstart, actfinish, resolveddate, or closeddate (default: reportdate) |

**Example Usage:**

```json
{
  "status": ["NEW", "QUEUED", "INPROG"],
  "siteid": "BEDFORD",
  "reportedpriority": 1,
  "dateRange": {
    "start": "2026-02-01T00:00:00Z",
    "end": "2026-02-14T23:59:59Z",
    "field": "reportdate"
  },
  "pageSize": 25,
  "orderBy": "-reportedpriority"
}
```

**Response:** Returns a paginated result containing an array of service requests, totalCount, page, pageSize, totalPages, hasNext, and hasPrevious flags.

---

### `maximo_add_sr_worklog`

**Description:** Add a work log entry to a service request. Records notes, updates, and communications. Requires ticket ID, site ID, and description.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| description | string | Yes | Log description/summary (max 100 characters) |
| logtype | string | No | Log type: CLIENTNOTE (default), WORK, UPDATE, or MODDATE |
| description_longdescription | string | No | Detailed log text |
| createdate | string | No | Create date (ISO 8601) |
| createby | string | No | Created by person (max 30 characters) |
| clientviewable | boolean | No | Client viewable flag |
| class | string | No | Work log class (max 16 characters) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "description": "Contacted user for more details",
  "logtype": "CLIENTNOTE",
  "description_longdescription": "Called JDOE at ext 0123. Confirmed the printer displays error code E-04 on the LCD panel. Scheduled on-site visit for tomorrow morning."
}
```

**Response:** Returns the created work log entry (WORKLOG child resource). Note that the default log type for service requests is CLIENTNOTE (unlike work orders which default to WORK).

---

### `maximo_assign_sr`

**Description:** Assign a service request to a person or group. Updates the owner and optionally the owner group.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| owner | string | Yes | Person to assign as owner (max 30 characters) |
| ownergroup | string | No | Owner group (max 8 characters) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "owner": "TECHSUPPORT1",
  "ownergroup": "IT-SUPPORT"
}
```

**Response:** Returns the updated service request with the new owner and owner group fields.

---

### `maximo_escalate_sr`

**Description:** Escalate a service request by changing its priority and optionally reassigning to a different group. Adds the escalation reason as a work log entry.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| newPriority | number | Yes | New priority level 1-5 (1 is highest) |
| escalationReason | string | Yes | Reason for escalation (max 255 characters, added as work log) |
| newOwnerGroup | string | No | New owner group for escalation routing (max 8 characters) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "newPriority": 1,
  "escalationReason": "Issue affecting entire department. Multiple users unable to print. Escalating to senior IT support.",
  "newOwnerGroup": "IT-SENIOR"
}
```

**Response:** Returns the updated service request with the new priority. A work log entry is automatically created with the escalation reason. If `newOwnerGroup` is provided, the owner group is also updated.

---

### `maximo_get_sr_related_wos`

**Description:** Retrieve work orders that were created from a service request. Queries work orders linked to the specified service request ticket ID via the `origrecordid` field.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a `SRRelatedWorkOrdersResponse` containing:
- `workOrders` - Array of work order objects linked to this service request
- `totalCount` - Total number of related work orders
- `ticketid` - The source ticket ID
- `siteid` - The source site ID

---

### `maximo_add_sr_solution`

**Description:** Add a solution/resolution to a service request. Optionally auto-resolve the service request by setting autoResolve to true, which changes the status to RESOLVED and sets the actual finish date.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticketid | string | Yes | Service request ticket ID |
| siteid | string | Yes | Site identifier |
| solution | string | Yes | Solution/resolution text |
| autoResolve | boolean | No | If true, automatically changes status to RESOLVED (default: false) |

**Example Usage:**

```json
{
  "ticketid": "SR-1001",
  "siteid": "BEDFORD",
  "solution": "Replaced toner cartridge (model TN-450). Printed test page successfully. Issue resolved.",
  "autoResolve": true
}
```

**Response:** Returns the updated service request with the solution text. If `autoResolve` is true, the status is changed to RESOLVED and `actfinish` is set to the current timestamp.
