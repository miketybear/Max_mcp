# IBM Maximo MAS 9.x MCP Server - Tool Catalog

## Overview

This document provides a complete catalog of all MCP tools available in the Maximo MCP Server. Each tool is designed to interact with specific Maximo REST API endpoints and operations.

**Total Tools:** 80+

## Tool Categories

- [Work Order Management](#work-order-management) (11 tools)
- [Asset Management](#asset-management) (9 tools)
- [Inventory Management](#inventory-management) (8 tools)
- [Service Request Management](#service-request-management) (7 tools)
- [Purchase Order Management](#purchase-order-management) (7 tools)
- [Location Management](#location-management) (6 tools)
- [Person and Labor Management](#person-and-labor-management) (6 tools)
- [Preventive Maintenance](#preventive-maintenance) (7 tools)
- [Classification Management](#classification-management) (4 tools)
- [Attachment Management](#attachment-management) (4 tools)
- [Query and Search](#query-and-search) (4 tools)
- [Bulk Operations](#bulk-operations) (4 tools)
- [Development Tools](#development-tools) (6 tools)

---

## Work Order Management

### 1. maximo_create_workorder

**Description:** Create a new work order in Maximo

**Parameters:**
- `description` (required, string) - Work order description
- `assetnum` (optional, string) - Asset number
- `location` (optional, string) - Location code
- `worktype` (optional, string) - Work type (CM, PM, etc.)
- `priority` (optional, number) - Priority (1-5)
- `siteid` (required, string) - Site ID
- `orgid` (optional, string) - Organization ID
- `targstartdate` (optional, string) - Target start date (ISO 8601)
- `targcompdate` (optional, string) - Target completion date (ISO 8601)

**Returns:** Created work order object with wonum

**Example:**
```json
{
  "description": "Repair centrifugal pump",
  "assetnum": "PUMP001",
  "location": "PLANT-100",
  "worktype": "CM",
  "priority": 2,
  "siteid": "BEDFORD"
}
```

### 2. maximo_get_workorder

**Description:** Retrieve work order details

**Parameters:**
- `wonum` (required, string) - Work order number
- `siteid` (optional, string) - Site ID
- `fields` (optional, string) - Comma-separated list of fields to return

**Returns:** Work order object with requested fields

### 3. maximo_update_workorder

**Description:** Update an existing work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `siteid` (optional, string) - Site ID
- `updates` (required, object) - Fields to update

**Returns:** Updated work order object

### 4. maximo_delete_workorder

**Description:** Delete a work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `siteid` (optional, string) - Site ID

**Returns:** Success confirmation

### 5. maximo_change_workorder_status

**Description:** Change work order status

**Parameters:**
- `wonum` (required, string) - Work order number
- `status` (required, string) - New status (WAPPR, APPR, WSCH, INPRG, COMP, CLOSE, CAN)
- `memo` (optional, string) - Status change memo
- `siteid` (optional, string) - Site ID

**Returns:** Updated work order with new status

**Valid Status Transitions:**
- WAPPR → APPR, CAN
- APPR → WSCH, CAN
- WSCH → WMATL, INPRG, CAN
- WMATL → INPRG, CAN
- INPRG → COMP, CAN
- COMP → CLOSE

### 6. maximo_add_labor

**Description:** Add labor transaction to work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `laborcode` (required, string) - Labor code
- `regularhrs` (optional, number) - Regular hours
- `overtimehrs` (optional, number) - Overtime hours
- `transdate` (required, string) - Transaction date (ISO 8601)
- `startdate` (optional, string) - Start date/time
- `finishdate` (optional, string) - Finish date/time

**Returns:** Created labor transaction

### 7. maximo_add_material

**Description:** Add material to work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `itemnum` (required, string) - Item number
- `itemqty` (required, number) - Quantity
- `storelocsite` (optional, string) - Storeroom location

**Returns:** Created material record

### 8. maximo_add_service

**Description:** Add service entry to work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `description` (required, string) - Service description
- `linecost` (optional, number) - Line cost
- `vendor` (optional, string) - Vendor code

**Returns:** Created service record

### 9. maximo_add_worklog

**Description:** Add work log entry to work order

**Parameters:**
- `wonum` (required, string) - Work order number
- `description` (required, string) - Log description
- `logtype` (optional, string) - Log type (WORK, UPDATE, etc.)
- `createdate` (optional, string) - Creation date (ISO 8601)

**Returns:** Created work log entry

### 10. maximo_assign_workorder

**Description:** Assign work order to person or crew

**Parameters:**
- `wonum` (required, string) - Work order number
- `laborcode` (optional, string) - Person labor code
- `crewid` (optional, string) - Crew ID
- `scheduledate` (optional, string) - Scheduled date

**Returns:** Updated work order with assignment

### 11. maximo_search_workorders

**Description:** Search work orders with filters

**Parameters:**
- `status` (optional, string) - Status filter
- `priority` (optional, number) - Priority filter
- `assetnum` (optional, string) - Asset filter
- `location` (optional, string) - Location filter
- `worktype` (optional, string) - Work type filter
- `dateFrom` (optional, string) - Date range start
- `dateTo` (optional, string) - Date range end
- `pageSize` (optional, number) - Results per page
- `pageNum` (optional, number) - Page number

**Returns:** Array of work orders matching criteria

---

## Asset Management

### 12. maximo_create_asset

**Description:** Create a new asset

**Parameters:**
- `assetnum` (required, string) - Asset number
- `description` (required, string) - Asset description
- `location` (optional, string) - Location code
- `assettype` (optional, string) - Asset type
- `status` (optional, string) - Asset status
- `siteid` (required, string) - Site ID
- `parent` (optional, string) - Parent asset number

**Returns:** Created asset object

### 13. maximo_get_asset

**Description:** Retrieve asset details

**Parameters:**
- `assetnum` (required, string) - Asset number
- `siteid` (optional, string) - Site ID
- `fields` (optional, string) - Fields to return

**Returns:** Asset object

### 14. maximo_update_asset

**Description:** Update asset information

**Parameters:**
- `assetnum` (required, string) - Asset number
- `siteid` (optional, string) - Site ID
- `updates` (required, object) - Fields to update

**Returns:** Updated asset object

### 15. maximo_delete_asset

**Description:** Delete an asset

**Parameters:**
- `assetnum` (required, string) - Asset number
- `siteid` (optional, string) - Site ID

**Returns:** Success confirmation

### 16. maximo_move_asset

**Description:** Move asset to new location

**Parameters:**
- `assetnum` (required, string) - Asset number
- `newlocation` (required, string) - New location code
- `movedate` (optional, string) - Move date (ISO 8601)

**Returns:** Updated asset with new location

### 17. maximo_record_meter

**Description:** Record asset meter reading

**Parameters:**
- `assetnum` (required, string) - Asset number
- `metername` (required, string) - Meter name
- `newreading` (required, number) - New reading value
- `newreadingdate` (required, string) - Reading date (ISO 8601)
- `remarks` (optional, string) - Reading remarks

**Returns:** Created meter reading record

### 18. maximo_get_asset_hierarchy

**Description:** Get asset parent/child hierarchy

**Parameters:**
- `assetnum` (required, string) - Asset number
- `levels` (optional, number) - Number of hierarchy levels (default: all)

**Returns:** Asset hierarchy tree

### 19. maximo_update_asset_spec

**Description:** Update asset specifications

**Parameters:**
- `assetnum` (required, string) - Asset number
- `specifications` (required, object) - Specification attributes and values

**Returns:** Updated asset specifications

### 20. maximo_search_assets

**Description:** Search assets with filters

**Parameters:**
- `assettype` (optional, string) - Asset type filter
- `status` (optional, string) - Status filter
- `location` (optional, string) - Location filter
- `parent` (optional, string) - Parent asset filter
- `pageSize` (optional, number) - Results per page

**Returns:** Array of assets matching criteria

---

## Inventory Management

### 21. maximo_create_item

**Description:** Create item master record

**Parameters:**
- `itemnum` (required, string) - Item number
- `description` (required, string) - Item description
- `itemtype` (optional, string) - Item type
- `status` (optional, string) - Item status

**Returns:** Created item object

### 22. maximo_get_inventory

**Description:** Get inventory balance

**Parameters:**
- `itemnum` (required, string) - Item number
- `location` (optional, string) - Storeroom location
- `siteid` (optional, string) - Site ID

**Returns:** Inventory balance information

### 23. maximo_issue_inventory

**Description:** Issue inventory items

**Parameters:**
- `itemnum` (required, string) - Item number
- `fromstoreloc` (required, string) - From storeroom
- `quantity` (required, number) - Quantity to issue
- `transdate` (optional, string) - Transaction date
- `refwo` (optional, string) - Reference work order

**Returns:** Inventory transaction record

### 24. maximo_return_inventory

**Description:** Return inventory items

**Parameters:**
- `itemnum` (required, string) - Item number
- `tostoreloc` (required, string) - To storeroom
- `quantity` (required, number) - Quantity to return
- `transdate` (optional, string) - Transaction date
- `refwo` (optional, string) - Reference work order

**Returns:** Inventory transaction record

### 25. maximo_transfer_inventory

**Description:** Transfer inventory between storerooms

**Parameters:**
- `itemnum` (required, string) - Item number
- `fromstoreloc` (required, string) - From storeroom
- `tostoreloc` (required, string) - To storeroom
- `quantity` (required, number) - Quantity to transfer
- `transdate` (optional, string) - Transaction date

**Returns:** Inventory transaction record

### 26. maximo_adjust_inventory

**Description:** Adjust inventory balance

**Parameters:**
- `itemnum` (required, string) - Item number
- `location` (required, string) - Storeroom location
- `newbalance` (required, number) - New balance
- `reason` (optional, string) - Adjustment reason

**Returns:** Inventory adjustment record

### 27. maximo_get_inventory_transactions

**Description:** Get inventory transaction history

**Parameters:**
- `itemnum` (optional, string) - Item number filter
- `location` (optional, string) - Location filter
- `dateFrom` (optional, string) - Date range start
- `dateTo` (optional, string) - Date range end
- `pageSize` (optional, number) - Results per page

**Returns:** Array of inventory transactions

### 28. maximo_search_items

**Description:** Search items with filters

**Parameters:**
- `itemtype` (optional, string) - Item type filter
- `status` (optional, string) - Status filter
- `description` (optional, string) - Description search
- `pageSize` (optional, number) - Results per page

**Returns:** Array of items matching criteria

---

## Service Request Management

### 29. maximo_create_sr

**Description:** Create service request

**Parameters:**
- `description` (required, string) - SR description
- `assetnum` (optional, string) - Asset number
- `location` (optional, string) - Location code
- `reportedby` (optional, string) - Reported by person
- `siteid` (required, string) - Site ID

**Returns:** Created service request

### 30. maximo_get_sr

**Description:** Retrieve service request details

**Parameters:**
- `ticketid` (required, string) - Ticket ID
- `siteid` (optional, string) - Site ID

**Returns:** Service request object

### 31. maximo_update_sr

**Description:** Update service request

**Parameters:**
- `ticketid` (required, string) - Ticket ID
- `updates` (required, object) - Fields to update

**Returns:** Updated service request

### 32. maximo_delete_sr

**Description:** Delete service request

**Parameters:**
- `ticketid` (required, string) - Ticket ID

**Returns:** Success confirmation

### 33. maximo_change_sr_status

**Description:** Change service request status

**Parameters:**
- `ticketid` (required, string) - Ticket ID
- `status` (required, string) - New status
- `memo` (optional, string) - Status change memo

**Returns:** Updated service request

### 34. maximo_convert_sr_to_wo

**Description:** Convert service request to work order

**Parameters:**
- `ticketid` (required, string) - Ticket ID
- `worktype` (optional, string) - Work type for new WO
- `priority` (optional, number) - Priority for new WO

**Returns:** Created work order object

### 35. maximo_search_srs

**Description:** Search service requests

**Parameters:**
- `status` (optional, string) - Status filter
- `reportedby` (optional, string) - Reported by filter
- `dateFrom` (optional, string) - Date range start
- `dateTo` (optional, string) - Date range end
- `pageSize` (optional, number) - Results per page

**Returns:** Array of service requests

---

## Purchase Order Management

### 36. maximo_create_po

**Description:** Create purchase order

**Parameters:**
- `description` (required, string) - PO description
- `vendor` (required, string) - Vendor code
- `siteid` (required, string) - Site ID
- `poline` (optional, array) - PO line items

**Returns:** Created purchase order

### 37. maximo_get_po

**Description:** Retrieve purchase order details

**Parameters:**
- `ponum` (required, string) - PO number
- `siteid` (optional, string) - Site ID

**Returns:** Purchase order object

### 38. maximo_update_po

**Description:** Update purchase order

**Parameters:**
- `ponum` (required, string) - PO number
- `updates` (required, object) - Fields to update

**Returns:** Updated purchase order

### 39. maximo_delete_po

**Description:** Delete purchase order

**Parameters:**
- `ponum` (required, string) - PO number

**Returns:** Success confirmation

### 40. maximo_receive_po

**Description:** Receive purchase order items

**Parameters:**
- `ponum` (required, string) - PO number
- `polinenum` (required, number) - PO line number
- `quantity` (required, number) - Quantity received
- `receiptdate` (optional, string) - Receipt date
- `tostoreloc` (optional, string) - Receiving storeroom

**Returns:** Receipt record

### 41. maximo_approve_po

**Description:** Approve purchase order

**Parameters:**
- `ponum` (required, string) - PO number
- `memo` (optional, string) - Approval memo

**Returns:** Approved purchase order

### 42. maximo_search_pos

**Description:** Search purchase orders

**Parameters:**
- `status` (optional, string) - Status filter
- `vendor` (optional, string) - Vendor filter
- `dateFrom` (optional, string) - Date range start
- `dateTo` (optional, string) - Date range end
- `pageSize` (optional, number) - Results per page

**Returns:** Array of purchase orders

---

## Location Management

### 43. maximo_create_location

**Description:** Create location

**Parameters:**
- `location` (required, string) - Location code
- `description` (required, string) - Location description
- `type` (optional, string) - Location type
- `parent` (optional, string) - Parent location
- `siteid` (required, string) - Site ID

**Returns:** Created location

### 44. maximo_get_location

**Description:** Retrieve location details

**Parameters:**
- `location` (required, string) - Location code
- `siteid` (optional, string) - Site ID

**Returns:** Location object

### 45. maximo_update_location

**Description:** Update location

**Parameters:**
- `location` (required, string) - Location code
- `updates` (required, object) - Fields to update

**Returns:** Updated location

### 46. maximo_delete_location

**Description:** Delete location

**Parameters:**
- `location` (required, string) - Location code

**Returns:** Success confirmation

### 47. maximo_get_location_hierarchy

**Description:** Get location hierarchy tree

**Parameters:**
- `location` (required, string) - Root location code
- `levels` (optional, number) - Hierarchy levels

**Returns:** Location hierarchy tree

### 48. maximo_search_locations

**Description:** Search locations

**Parameters:**
- `type` (optional, string) - Location type filter
- `parent` (optional, string) - Parent location filter
- `pageSize` (optional, number) - Results per page

**Returns:** Array of locations

---

## Person and Labor Management

### 49. maximo_create_person

**Description:** Create person record

**Parameters:**
- `personid` (required, string) - Person ID
- `displayname` (required, string) - Display name
- `primaryemail` (optional, string) - Email address
- `status` (optional, string) - Person status

**Returns:** Created person record

### 50. maximo_get_person

**Description:** Retrieve person details

**Parameters:**
- `personid` (required, string) - Person ID

**Returns:** Person object

### 51. maximo_update_person

**Description:** Update person record

**Parameters:**
- `personid` (required, string) - Person ID
- `updates` (required, object) - Fields to update

**Returns:** Updated person record

### 52. maximo_record_labor

**Description:** Record labor transaction

**Parameters:**
- `laborcode` (required, string) - Labor code
- `refwo` (optional, string) - Reference work order
- `regularhrs` (optional, number) - Regular hours
- `overtimehrs` (optional, number) - Overtime hours
- `transdate` (required, string) - Transaction date

**Returns:** Labor transaction record

### 53. maximo_get_labor_transactions

**Description:** Get labor transaction history

**Parameters:**
- `laborcode` (optional, string) - Labor code filter
- `refwo` (optional, string) - Work order filter
- `dateFrom` (optional, string) - Date range start
- `dateTo` (optional, string) - Date range end

**Returns:** Array of labor transactions

### 54. maximo_search_persons

**Description:** Search persons

**Parameters:**
- `status` (optional, string) - Status filter
- `displayname` (optional, string) - Name search
- `pageSize` (optional, number) - Results per page

**Returns:** Array of persons

---

## Preventive Maintenance

### 55. maximo_create_pm

**Description:** Create PM record

**Parameters:**
- `description` (required, string) - PM description
- `assetnum` (optional, string) - Asset number
- `location` (optional, string) - Location code
- `frequency` (required, number) - Frequency value
- `frequnit` (required, string) - Frequency unit (DAYS, WEEKS, MONTHS)
- `nextdate` (optional, string) - Next due date
- `siteid` (required, string) - Site ID

**Returns:** Created PM record

### 56. maximo_get_pm

**Description:** Retrieve PM details

**Parameters:**
- `pmnum` (required, string) - PM number
- `siteid` (optional, string) - Site ID

**Returns:** PM object

### 57. maximo_update_pm

**Description:** Update PM record

**Parameters:**
- `pmnum` (required, string) - PM number
- `updates` (required, object) - Fields to update

**Returns:** Updated PM record

### 58. maximo_delete_pm

**Description:** Delete PM record

**Parameters:**
- `pmnum` (required, string) - PM number

**Returns:** Success confirmation

### 59. maximo_generate_pm_wo

**Description:** Generate PM work orders

**Parameters:**
- `pmnum` (required, string) - PM number
- `targetdate` (optional, string) - Target generation date

**Returns:** Array of generated work orders

### 60. maximo_create_jobplan

**Description:** Create job plan

**Parameters:**
- `jpnum` (required, string) - Job plan number
- `description` (required, string) - Job plan description
- `siteid` (required, string) - Site ID

**Returns:** Created job plan

### 61. maximo_search_pms

**Description:** Search PM records

**Parameters:**
- `assetnum` (optional, string) - Asset filter
- `location` (optional, string) - Location filter
- `status` (optional, string) - Status filter
- `pageSize` (optional, number) - Results per page

**Returns:** Array of PM records

---

## Classification Management

### 62. maximo_get_classification

**Description:** Get classification details

**Parameters:**
- `classstructureid` (required, string) - Classification ID

**Returns:** Classification object

### 63. maximo_get_class_hierarchy

**Description:** Get classification hierarchy tree

**Parameters:**
- `classstructureid` (required, string) - Root classification ID
- `levels` (optional, number) - Hierarchy levels

**Returns:** Classification hierarchy tree

### 64. maximo_get_class_spec

**Description:** Get classification specification template

**Parameters:**
- `classstructureid` (required, string) - Classification ID

**Returns:** Array of specification attributes

### 65. maximo_update_spec_values

**Description:** Update specification attribute values

**Parameters:**
- `objectname` (required, string) - Object name (ASSET, WORKORDER, etc.)
- `objectid` (required, string) - Object ID
- `specifications` (required, object) - Attribute values

**Returns:** Updated specifications

---

## Attachment Management

### 66. maximo_upload_attachment

**Description:** Upload document attachment

**Parameters:**
- `ownertable` (required, string) - Owner table (WORKORDER, ASSET, etc.)
- `ownerid` (required, string) - Owner record ID
- `document` (required, file) - File to upload
- `description` (optional, string) - Document description
- `doctype` (optional, string) - Document type

**Returns:** Created document link record

### 67. maximo_download_attachment

**Description:** Download document attachment

**Parameters:**
- `doclinksid` (required, number) - Document link ID

**Returns:** File binary data

### 68. maximo_list_attachments

**Description:** List attachments for a record

**Parameters:**
- `ownertable` (required, string) - Owner table
- `ownerid` (required, string) - Owner record ID

**Returns:** Array of document links

### 69. maximo_delete_attachment

**Description:** Delete attachment

**Parameters:**
- `doclinksid` (required, number) - Document link ID

**Returns:** Success confirmation

---

## Query and Search

### 70. maximo_query

**Description:** Execute OSLC query

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `select` (optional, string) - Fields to select
- `where` (optional, string) - OSLC where clause
- `orderBy` (optional, string) - Sort order
- `pageSize` (optional, number) - Results per page
- `pageNum` (optional, number) - Page number

**Returns:** Query results with pagination info

**Example:**
```json
{
  "objectStructure": "mxwodetail",
  "select": "wonum,description,status",
  "where": "status=\"WAPPR\" and priority<3",
  "orderBy": "+priority,-reportdate",
  "pageSize": 50
}
```

### 71. maximo_advanced_search

**Description:** Advanced search with multiple filters

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `filters` (required, array) - Array of filter conditions
- `operator` (optional, string) - Logical operator (AND/OR)
- `pageSize` (optional, number) - Results per page

**Returns:** Search results

### 72. maximo_saved_query

**Description:** Execute saved query

**Parameters:**
- `queryname` (required, string) - Saved query name
- `parameters` (optional, object) - Query parameters

**Returns:** Query results

### 73. maximo_build_query

**Description:** Interactive query builder

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `interactive` (optional, boolean) - Enable interactive mode

**Returns:** Query builder interface or generated query

---

## Bulk Operations

### 74. maximo_bulk_create

**Description:** Create multiple records

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `records` (required, array) - Array of records to create
- `continueOnError` (optional, boolean) - Continue on errors

**Returns:** Array of created records with status

### 75. maximo_bulk_update

**Description:** Update multiple records

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `updates` (required, array) - Array of record updates
- `continueOnError` (optional, boolean) - Continue on errors

**Returns:** Array of update results

### 76. maximo_bulk_delete

**Description:** Delete multiple records

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `ids` (required, array) - Array of record IDs to delete
- `continueOnError` (optional, boolean) - Continue on errors

**Returns:** Array of deletion results

### 77. maximo_batch_process

**Description:** Process batch with transactions

**Parameters:**
- `operations` (required, array) - Array of operations
- `transactional` (optional, boolean) - Use transactions

**Returns:** Batch processing results

---

## Development Tools

### 78. maximo_test_connection

**Description:** Test API connectivity

**Parameters:**
- `environment` (optional, string) - Environment name to test

**Returns:** Connection test results

### 79. maximo_explore_api

**Description:** Explore available API endpoints

**Parameters:**
- `objectStructure` (optional, string) - Specific object structure

**Returns:** Available endpoints and operations

### 80. maximo_inspect_schema

**Description:** Get object structure schema

**Parameters:**
- `objectStructure` (required, string) - Object structure name

**Returns:** Schema definition with fields and relationships

### 81. maximo_validate_data

**Description:** Validate data before submission

**Parameters:**
- `objectStructure` (required, string) - Object structure name
- `data` (required, object) - Data to validate

**Returns:** Validation results with errors/warnings

### 82. maximo_get_domain_values

**Description:** Get domain/synonym values

**Parameters:**
- `domainid` (required, string) - Domain ID
- `siteid` (optional, string) - Site ID

**Returns:** Array of domain values

### 83. maximo_get_relationships

**Description:** Get object relationships

**Parameters:**
- `objectStructure` (required, string) - Object structure name

**Returns:** Object relationship information

---

## Common Parameters

### Pagination
- `pageSize` - Number of records per page (default: 50, max: 1000)
- `pageNum` - Page number (1-based)

### Field Selection
- `fields` or `select` - Comma-separated list of fields to return
- Use `*` for all fields (not recommended for performance)

### Date Formats
- All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `2024-01-16T10:30:00Z`

### Site and Organization
- `siteid` - Site identifier (required for most operations)
- `orgid` - Organization identifier (optional, defaults to site's org)

## Error Handling

All tools return errors in a consistent format:

```json
{
  "error": {
    "code": "BMXAA4210E",
    "message": "Invalid field value",
    "details": "The value INVALID for the field STATUS is not valid",
    "suggestion": "Valid values are: WAPPR, APPR, WSCH, INPRG, COMP, CLOSE, CAN"
  }
}
```

## Rate Limiting

- Default: 100 requests per minute per API key
- Bulk operations count as single requests
- Rate limit headers included in responses

## Best Practices

1. **Use Field Selection** - Only request fields you need
2. **Enable Caching** - For frequently accessed data
3. **Use Bulk Operations** - For multiple records
4. **Handle Errors Gracefully** - Implement retry logic
5. **Validate Before Submit** - Use validation tools
6. **Use Lean Mode** - For better performance
7. **Implement Pagination** - For large result sets

## Tool Usage Examples

See the [examples](examples/) directory for complete usage examples of each tool category.

---

**Last Updated:** 2024-01-29

**Version:** 1.0.0 (Planned)