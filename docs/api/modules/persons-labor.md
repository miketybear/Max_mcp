# Persons/Labor Module

API documentation for the Persons/Labor module in the Maximo MCP Server. This module provides 13 MCP tools for comprehensive person and labor management, including person CRUD operations, labor transaction recording, craft/skill management, crew operations, availability checking, cost analysis, and qualified labor search.

## Person Status Values

| Status | Description |
|--------|-------------|
| ACTIVE | Person is active and available for work |
| INACTIVE | Person is temporarily inactive |
| TERMINATED | Person has been terminated |

## Labor Transaction Types

| Type | Description |
|------|-------------|
| REGULAR | Standard working hours |
| OVERTIME | Overtime hours |
| DOUBLE | Double-time hours |
| VACATION | Vacation leave |
| SICK | Sick leave |
| HOLIDAY | Holiday leave |

## Skill Levels

| Level | Description |
|-------|-------------|
| APPRENTICE | Entry-level skill |
| SEMISKILLED | Intermediate skill |
| SKILLED | Full proficiency |
| EXPERT | Master-level skill |

---

## Tools

### Person Management

---

### `maximo_create_person`

**Description:** Create a new person record in Maximo. Requires personid and displayname. Optionally specify email, status, labor code, contact information, department, and craft.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |
| displayname | string | Yes | Display name (max 100 characters) |
| primaryemail | string | No | Primary email address |
| status | string | No | Person status: ACTIVE, INACTIVE, or TERMINATED |
| siteid | string | No | Site identifier (max 8 characters) |
| orgid | string | No | Organization identifier (max 8 characters) |
| laborcode | string | No | Labor code (max 8 characters) |
| phonenum | string | No | Phone number (max 20 characters) |
| mobilephone | string | No | Mobile phone number (max 20 characters) |
| department | string | No | Department (max 30 characters) |
| jobtitle | string | No | Job title (max 50 characters) |
| manager | string | No | Manager person ID (max 30 characters) |
| crewid | string | No | Crew ID (max 8 characters) |
| craft | string | No | Craft (max 8 characters) |
| skilllevel | string | No | Skill level (max 8 characters) |
| comments | string | No | Comments |

**Example Usage:**

```json
{
  "personid": "JSMITH",
  "displayname": "John Smith",
  "primaryemail": "jsmith@example.com",
  "status": "ACTIVE",
  "siteid": "BEDFORD",
  "laborcode": "JSMITH",
  "department": "MAINT",
  "jobtitle": "Maintenance Technician",
  "craft": "ELEC",
  "skilllevel": "SKILLED"
}
```

**Response:** Returns the created person object with all fields including the auto-generated OSLC `href`.

---

### `maximo_get_person`

**Description:** Retrieve person details by person ID. Returns complete person information including contact details, labor assignments, department, and craft.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |

**Example Usage:**

```json
{
  "personid": "JSMITH"
}
```

**Response:** Returns the complete person object with all fields (personid, displayname, primaryemail, status, siteid, orgid, laborcode, phonenum, mobilephone, department, jobtitle, manager, crewid, craft, skilllevel, comments). Returns a 404 error if the person is not found.

---

### `maximo_update_person`

**Description:** Update person record fields. Specify personid and provide an updates object containing only the fields to change.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID of the record to update |
| updates | object | Yes | Object containing fields to update (see below) |

**Updates Object Properties:**

| Property | Type | Description |
|----------|------|-------------|
| displayname | string | Display name (max 100 characters) |
| primaryemail | string | Primary email address |
| status | string | Person status: ACTIVE, INACTIVE, or TERMINATED |
| laborcode | string | Labor code (max 8 characters) |
| phonenum | string | Phone number (max 20 characters) |
| mobilephone | string | Mobile phone number (max 20 characters) |
| department | string | Department (max 30 characters) |
| jobtitle | string | Job title (max 50 characters) |
| manager | string | Manager person ID (max 30 characters) |
| crewid | string | Crew ID (max 8 characters) |
| craft | string | Craft (max 8 characters) |
| skilllevel | string | Skill level (max 8 characters) |
| comments | string | Comments |

**Example Usage:**

```json
{
  "personid": "JSMITH",
  "updates": {
    "jobtitle": "Senior Maintenance Technician",
    "department": "FACILITIES",
    "primaryemail": "john.smith@example.com"
  }
}
```

**Response:** Returns the updated person object with all fields. Returns a 404 error if the person is not found, or a 500 error if the person href cannot be resolved.

---

### `maximo_search_persons`

**Description:** Search persons with filters. Filter by status, display name, site, department, craft, or crew. Supports pagination with pageSize and pageNum parameters.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string or string[] | No | Person status filter. Single value (ACTIVE, INACTIVE, TERMINATED) or array of values |
| displayname | string | No | Display name search (partial match, case-insensitive) |
| siteid | string | No | Site identifier filter |
| department | string | No | Department filter |
| craft | string | No | Craft filter |
| crewid | string | No | Crew ID filter |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| pageNum | number | No | Page number (default: 1) |

**Example Usage:**

```json
{
  "status": "ACTIVE",
  "department": "MAINT",
  "craft": "ELEC",
  "pageSize": 50,
  "pageNum": 1
}
```

**Example with multiple statuses:**

```json
{
  "status": ["ACTIVE", "INACTIVE"],
  "siteid": "BEDFORD"
}
```

**Response:** Returns a paginated list of person records matching the filter criteria. Each person includes personid, displayname, primaryemail, status, siteid, orgid, laborcode, phonenum, department, jobtitle, and craft. Includes totalCount for pagination.

---

### Labor Transaction Management

---

### `maximo_record_labor`

**Description:** Record a labor transaction. Requires laborcode and transdate. Optionally specify work order reference, hours (regular/overtime/double), and transaction type.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| laborcode | string | Yes | Labor code (max 8 characters) |
| transdate | string | Yes | Transaction date in ISO 8601 format |
| refwo | string | No | Reference work order number (max 10 characters) |
| regularhrs | number | No | Regular hours (must be >= 0) |
| overtimehrs | number | No | Overtime hours (must be >= 0) |
| doublehrs | number | No | Double-time hours (must be >= 0) |
| transtype | string | No | Transaction type: REGULAR, OVERTIME, DOUBLE, VACATION, SICK, or HOLIDAY |
| startdate | string | No | Start date/time in ISO 8601 format |
| finishdate | string | No | Finish date/time in ISO 8601 format (must be after startdate) |
| payrate | number | No | Pay rate (must be >= 0) |
| comments | string | No | Comments |

**Example Usage:**

```json
{
  "laborcode": "JSMITH",
  "transdate": "2026-02-15T00:00:00Z",
  "refwo": "WO-10045",
  "regularhrs": 8,
  "transtype": "REGULAR",
  "startdate": "2026-02-15T08:00:00Z",
  "finishdate": "2026-02-15T16:00:00Z",
  "comments": "Completed electrical panel installation"
}
```

**Response:** Returns the created labor transaction object with a system-generated `labtransid`, along with all provided fields and computed `totalcost`.

---

### `maximo_get_labor_transactions`

**Description:** Get labor transaction history. Filter by labor code, work order, date range, or transaction type. Supports pagination with pageSize and pageNum parameters.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| laborcode | string | No | Labor code filter |
| refwo | string | No | Work order filter |
| dateFrom | string | No | Date range start in ISO 8601 format |
| dateTo | string | No | Date range end in ISO 8601 format (must be after dateFrom) |
| transtype | string | No | Transaction type filter: REGULAR, OVERTIME, DOUBLE, VACATION, SICK, or HOLIDAY |
| pageSize | number | No | Results per page (default: 100, max: 1000) |
| pageNum | number | No | Page number (default: 1) |

**Example Usage:**

```json
{
  "laborcode": "JSMITH",
  "dateFrom": "2026-01-01T00:00:00Z",
  "dateTo": "2026-02-15T23:59:59Z",
  "transtype": "REGULAR",
  "pageSize": 50
}
```

**Response:** Returns a paginated list of labor transactions matching the filter criteria. Each transaction includes labtransid, laborcode, refwo, transdate, regularhrs, overtimehrs, doublehrs, transtype, startdate, finishdate, and totalcost. Includes totalCount for pagination.

---

### Craft/Skill Management

---

### `maximo_get_person_crafts`

**Description:** Get crafts and skills assigned to a person. Returns the person's craft rate records including craft codes, skill levels, and pay rates.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |
| siteid | string | No | Site identifier filter (max 8 characters) |

**Example Usage:**

```json
{
  "personid": "JSMITH"
}
```

**Response:** Returns an array of PersonCraftRate objects, each containing craft (craft code), skilllevel, rate (pay rate), and standardrate. Returns a 404 error if the person is not found.

---

### `maximo_add_person_craft`

**Description:** Add a craft/skill to a person record. Creates a new PersonCraftRate child record on the person. Requires person ID, craft code, and skill level.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |
| craft | string | Yes | Craft code (max 8 characters) |
| skilllevel | string | Yes | Skill level: APPRENTICE, SEMISKILLED, SKILLED, or EXPERT |
| rate | number | No | Pay rate (must be >= 0) |

**Example Usage:**

```json
{
  "personid": "JSMITH",
  "craft": "PIPE",
  "skilllevel": "SKILLED",
  "rate": 45.00
}
```

**Response:** Returns the created PersonCraftRate object with craft, skilllevel, and rate fields. Returns a 404 error if the person is not found.

---

### Crew Operations

---

### `maximo_get_labor_crews`

**Description:** Retrieve all labor crews. Optionally filter by site. Returns crew details including crew type, calendar, and organization.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | No | Site identifier filter (max 8 characters) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD"
}
```

**Example with no filter (all crews):**

```json
{}
```

**Response:** Returns a paginated list of LaborCrew objects. Each crew includes laborcrewid, description, crewtype, calnum (calendar), orgid, and siteid.

---

### `maximo_get_crew_members`

**Description:** Get members and tool assignments for a specific labor crew. Returns both the labor resources assigned to the crew and the tools assigned to the crew.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| laborcrewid | string | Yes | Labor crew ID (max 30 characters) |
| siteid | string | No | Site identifier filter (max 8 characters) |

**Example Usage:**

```json
{
  "laborcrewid": "ELEC-CREW-01",
  "siteid": "BEDFORD"
}
```

**Response:** Returns a LaborCrewMembersResponse object containing:
- `laborcrewid` - The crew ID
- `description` - Crew description
- `laborcrewlabor` - Array of crew labor members, each with laborcode, craft, skilllevel, position, effectivedate, and enddate
- `laborcrewtool` - Array of crew tool assignments, each with itemnum, description, and quantity

Returns a 404 error if the crew is not found.

---

### Availability and Cost Analysis

---

### `maximo_get_labor_availability`

**Description:** Check labor availability for a person in a date range. Calculates total capacity (business days x 8 hours), assigned hours from work orders, available hours, and utilization percentage. Excludes weekends from capacity calculation.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |
| startDate | string | Yes | Start date in ISO 8601 format |
| endDate | string | Yes | End date in ISO 8601 format (must be after startDate) |

**Example Usage:**

```json
{
  "personid": "JSMITH",
  "startDate": "2026-02-15T00:00:00Z",
  "endDate": "2026-02-28T23:59:59Z"
}
```

**Response:** Returns a LaborAvailability object containing:
- `personid` - The person ID
- `totalCapacityHours` - Total work capacity in hours (business days x 8)
- `assignedHours` - Hours already assigned via work orders (sum of estdur)
- `availableHours` - Remaining available hours (capacity - assigned)
- `utilizationPercent` - Utilization as a percentage (0-100+)

---

### `maximo_get_labor_cost_summary`

**Description:** Get labor cost summary for a person. Aggregates total hours, total cost, and transaction count from labor transactions. Optionally filter by date range.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| personid | string | Yes | Person ID (max 30 characters) |
| startDate | string | No | Start date in ISO 8601 format |
| endDate | string | No | End date in ISO 8601 format (must be after startDate if both provided) |

**Example Usage:**

```json
{
  "personid": "JSMITH",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-02-15T23:59:59Z"
}
```

**Example with no date filter (all time):**

```json
{
  "personid": "JSMITH"
}
```

**Response:** Returns a LaborCostSummary object containing:
- `personid` - The person ID
- `totalHours` - Sum of all hours (regular + overtime + double), rounded to 2 decimal places
- `totalCost` - Sum of all transaction costs, rounded to 2 decimal places
- `transactionCount` - Number of labor transactions found
- `startDate` - Start date filter (if provided)
- `endDate` - End date filter (if provided)

---

### Qualified Labor Search

---

### `maximo_get_qualified_labor`

**Description:** Find all persons qualified for a specific craft. Searches person craft rate records to find personnel with the matching craft code. Optionally filter by skill level and site.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| craft | string | Yes | Craft code to search for (max 8 characters) |
| skilllevel | string | No | Skill level filter: APPRENTICE, SEMISKILLED, SKILLED, or EXPERT |
| siteid | string | No | Site identifier filter (max 8 characters) |

**Example Usage:**

```json
{
  "craft": "ELEC",
  "skilllevel": "SKILLED",
  "siteid": "BEDFORD"
}
```

**Example with craft only:**

```json
{
  "craft": "PIPE"
}
```

**Response:** Returns a paginated list of person records that have the specified craft in their PersonCraftRate records. Each person includes personid, displayname, primaryemail, status, siteid, orgid, laborcode, department, and jobtitle.

---

## Common Workflows

### Onboarding a New Maintenance Technician

1. **Create the person** using `maximo_create_person` with basic info (personid, displayname, email, site, department)
2. **Add crafts/skills** using `maximo_add_person_craft` for each craft the person is qualified in
3. **Verify crafts** using `maximo_get_person_crafts` to confirm assignments
4. **Assign to crew** using `maximo_update_person` to set the crewid field

### Recording Daily Labor

1. **Record time** using `maximo_record_labor` for each work order the person worked on
2. **Review transactions** using `maximo_get_labor_transactions` filtered by laborcode and date
3. **Check costs** using `maximo_get_labor_cost_summary` to verify totals

### Resource Planning

1. **Check availability** using `maximo_get_labor_availability` for a person in the planning window
2. **Find qualified labor** using `maximo_get_qualified_labor` to identify persons with the required craft
3. **Review crew composition** using `maximo_get_crew_members` to understand team capabilities

### Cost Analysis for a Period

1. **Get cost summary** using `maximo_get_labor_cost_summary` with date range filters
2. **Drill into transactions** using `maximo_get_labor_transactions` with the same date range
3. **Compare across persons** by running `maximo_get_labor_cost_summary` for multiple person IDs

---

## OSLC Query Patterns

The Persons/Labor module uses OSLC queries internally. Understanding these patterns helps when debugging or using the `maximo_query` tool for ad-hoc queries.

### Person Queries

```
oslc.where=status="ACTIVE" and department="MAINT"
oslc.select=personid,displayname,primaryemail,status,laborcode,department,craft
```

### Labor Transaction Queries

```
oslc.where=laborcode="JSMITH" and transdate>="2026-01-01" and transdate<="2026-02-15"
oslc.select=labtransid,laborcode,refwo,transdate,regularhrs,overtimehrs,doublehrs,transtype,totalcost
```

### Craft Rate Queries (nested child object)

```
oslc.where=personid="JSMITH"
oslc.select=personid,personcraftrate{*}
```

### Qualified Labor Queries (via child object)

```
oslc.where=personcraftrate.craft="ELEC" and personcraftrate.skilllevel="SKILLED"
oslc.select=personid,displayname,status,laborcode,department
```

---

## Error Handling

All tools return a standard API response envelope:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether the operation succeeded |
| data | object | Response data (present on success) |
| error | string | Error message (present on failure) |
| errorCode | string | Error code (NOT_FOUND, INVALID_RESPONSE, etc.) |
| statusCode | number | HTTP status code |
| headers | object | Response headers |
| requestId | string | Request tracking ID for debugging |

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Person or crew not found |
| INVALID_RESPONSE | 500 | Unexpected response format (e.g., missing href) |
| VALIDATION_ERROR | 400 | Input validation failed (invalid dates, missing required fields) |

---

## Notes

- **Person ID uniqueness:** The `personid` field is unique across the entire Maximo system. Attempting to create a duplicate will result in an error from the Maximo API.
- **Labor code relationship:** A person's `laborcode` links them to the labor management system. Labor transactions reference this code, not the personid.
- **Date formats:** All date parameters must be in ISO 8601 format (e.g., `2026-02-15T08:00:00Z`). The validators enforce this at runtime.
- **Date range validation:** When both start and end dates are provided, the end date must be on or after the start date. The validators enforce this constraint.
- **Pagination defaults:** If pageSize is not specified, the default page size from the server configuration is used (typically 100). Maximum page size is 1000.
- **Availability calculation:** The `maximo_get_labor_availability` tool calculates capacity based on 8-hour business days (Monday through Friday), excluding weekends. It does not account for holidays or custom calendars.
- **Cost summary aggregation:** The `maximo_get_labor_cost_summary` tool sums hours across all transaction types (regular, overtime, double) and aggregates totalcost from up to 1000 transactions per query.
