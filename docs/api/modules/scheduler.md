# Scheduler Module

API documentation for the Scheduler module in the Maximo MCP Server. This module provides 6 MCP tools for work scheduling, resource allocation queries, backlog analysis, and conflict detection.

## Overview

The Scheduler module provides read-only tools for querying work schedules, identifying unscheduled work, assessing labor availability, analyzing work backlogs, detecting scheduling conflicts, and forecasting upcoming preventive maintenance. These tools support scheduling decisions but do not directly modify work order schedules.

---

## Tools

### `maximo_get_work_schedule`

**Description:** Get scheduled work orders within a date range for a site. Returns work orders that have scheduled start and finish dates in the specified range. Optionally filter by assigned person or craft. Results are sorted by scheduled start date.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| startDate | string | Yes | Start of date range in ISO 8601 format |
| endDate | string | Yes | End of date range in ISO 8601 format |
| personid | string | No | Filter by assigned person ID |
| craft | string | No | Filter by craft/trade |
| pageSize | number | No | Number of results per page (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "startDate": "2026-02-14T00:00:00Z",
  "endDate": "2026-02-21T23:59:59Z",
  "craft": "ELEC",
  "pageSize": 50
}
```

**Response:** Returns an array of work orders with scheduled start/finish dates within the specified range, sorted by scheduled start date. Each record includes wonum, description, status, scheduled start/finish, assigned person, craft, asset, and location.

---

### `maximo_get_unscheduled_work`

**Description:** Find work orders in APPR, WSCH, or WAPPR status that do not have a scheduled start date. These represent the work backlog that needs to be scheduled. Results are sorted by priority (highest priority first).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| pageSize | number | No | Number of results per page (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "pageSize": 25
}
```

**Response:** Returns an array of unscheduled work orders sorted by priority (1 = highest). Each record includes wonum, description, status, priority, work type, asset, location, and estimated duration.

---

### `maximo_get_labor_availability`

**Description:** Query labor availability for a site. Calculates available hours, assigned hours, and utilization percentage for each active person. Assumes 8-hour daily capacity. Optionally filter by date and craft.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| date | string | No | Date to check availability for in ISO 8601 format (defaults to today) |
| craft | string | No | Filter by craft/trade |
| pageSize | number | No | Number of results per page (default: 100, max: 1000) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "date": "2026-02-17T00:00:00Z",
  "craft": "MECH"
}
```

**Response:** Returns an array of labor records, each containing person ID, name, craft, available hours (8-hour base minus assigned), assigned hours, and utilization percentage.

---

### `maximo_get_work_backlog`

**Description:** Get a summary of the work backlog for a site. Returns counts of unscheduled and unassigned work orders broken down by priority level and status. Useful for capacity planning and scheduling decisions.

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

**Response:** Returns a backlog summary with total unscheduled count, total unassigned count, and breakdowns by priority level (1-5) and by status (WAPPR, APPR, WSCH, INPRG). Useful for understanding workload distribution and identifying scheduling priorities.

---

### `maximo_find_schedule_conflicts`

**Description:** Find schedule conflicts where the same person is assigned to multiple work orders with overlapping scheduled times within a date range. Returns details of each conflict including the overlapping work orders and the duration of overlap in hours.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| startDate | string | Yes | Start of date range in ISO 8601 format |
| endDate | string | Yes | End of date range in ISO 8601 format |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "startDate": "2026-02-14T00:00:00Z",
  "endDate": "2026-02-21T23:59:59Z"
}
```

**Response:** Returns an array of scheduling conflicts. Each conflict includes the person ID, the two overlapping work order numbers, their respective scheduled start/finish times, and the overlap duration in hours.

---

### `maximo_get_upcoming_pms`

**Description:** Get preventive maintenance (PM) schedules coming due within a specified number of days. Queries PMs with a next due date within the lookahead window. Defaults to 30 days. Results are sorted by next due date.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| siteid | string | Yes | Site identifier (max 8 characters) |
| days | number | No | Number of days to look ahead (default: 30, max: 365) |

**Example Usage:**

```json
{
  "siteid": "BEDFORD",
  "days": 14
}
```

**Response:** Returns an array of PM records that are due within the specified lookahead window, sorted by next due date. Each record includes pmnum, description, next due date, frequency, asset, location, and job plan reference.

---

## Common Workflows

### Weekly Schedule Review

1. **View the week's schedule:** Use `maximo_get_work_schedule` with the week's date range.
2. **Check for conflicts:** Use `maximo_find_schedule_conflicts` for the same date range.
3. **Review available labor:** Use `maximo_get_labor_availability` for each day of the week.
4. **Check upcoming PMs:** Use `maximo_get_upcoming_pms` with `days: 7` to see what PM work orders will be generated.

### Capacity Planning

1. **Assess backlog:** Use `maximo_get_work_backlog` to understand the volume and priority distribution of pending work.
2. **Review unscheduled work:** Use `maximo_get_unscheduled_work` to see the detailed list of work needing scheduling.
3. **Check labor capacity:** Use `maximo_get_labor_availability` to see who has bandwidth.
4. **Forecast PM workload:** Use `maximo_get_upcoming_pms` with `days: 30` to anticipate incoming PM-generated work orders.

### Resolving Schedule Conflicts

```json
// Find conflicts for the coming week
{
  "siteid": "BEDFORD",
  "startDate": "2026-02-16T00:00:00Z",
  "endDate": "2026-02-20T23:59:59Z"
}
```

Review the returned conflicts to identify double-booked personnel, then reassign or reschedule work orders to eliminate overlaps.

### Daily Standup Data

Combine these calls for a daily standup briefing:

1. `maximo_get_work_schedule` -- today's scheduled work
2. `maximo_get_labor_availability` -- today's available workforce
3. `maximo_get_unscheduled_work` -- high-priority work awaiting scheduling
4. `maximo_get_upcoming_pms` with `days: 7` -- PMs due this week
