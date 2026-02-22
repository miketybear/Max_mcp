# IBM Maximo MAS 9.x REST API Reference

## Overview

This document provides a comprehensive reference for IBM Maximo Application Suite 9.x REST APIs that will be integrated into the MCP server. It includes endpoint details, request/response formats, and usage examples.

## Base API Information

### Base URL Structure
```
https://{maximo-host}/maximo/api/os/{objectstructure}
```

### Authentication
**Method:** API Key Authentication

**Headers:**
```http
apikey: {your-api-key}
Content-Type: application/json
```

### Common Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `oslc.select` | Fields to return | `oslc.select=wonum,description,status` |
| `oslc.where` | Filter conditions | `oslc.where=status="WAPPR"` |
| `oslc.orderBy` | Sort order | `oslc.orderBy=+wonum` |
| `oslc.pageSize` | Records per page | `oslc.pageSize=100` |
| `lean` | Lean mode (performance) | `lean=1` |
| `oslc.searchTerms` | Text search | `oslc.searchTerms="pump"` |

### Response Format

**Success Response:**
```json
{
  "member": [
    {
      "href": "https://host/maximo/api/os/mxwodetail/123",
      "wonum": "1001",
      "description": "Repair pump",
      "status": "WAPPR"
    }
  ],
  "responseInfo": {
    "totalPages": 1,
    "totalCount": 1,
    "pagenum": 1
  }
}
```

**Error Response:**
```json
{
  "Error": {
    "message": "BMXAA4210E - Invalid status value",
    "statusCode": 400,
    "reasonCode": "BMXAA4210E"
  }
}
```

## Work Order APIs (MXWODETAIL)

### Object Structure: `mxwodetail`

### Get Work Orders

**Endpoint:** `GET /maximo/api/os/mxwodetail`

**Query Parameters:**
- All common query parameters supported

**Example Request:**
```http
GET /maximo/api/os/mxwodetail?oslc.select=wonum,description,status,assetnum,location&oslc.where=status="WAPPR"&oslc.pageSize=50
```

**Example Response:**
```json
{
  "member": [
    {
      "wonum": "1001",
      "description": "Repair centrifugal pump",
      "status": "WAPPR",
      "assetnum": "PUMP001",
      "location": "PLANT-100",
      "worktype": "CM",
      "priority": 2,
      "reportdate": "2024-01-15T10:30:00Z",
      "targstartdate": "2024-01-16T08:00:00Z",
      "targcompdate": "2024-01-16T17:00:00Z"
    }
  ]
}
```

### Get Single Work Order

**Endpoint:** `GET /maximo/api/os/mxwodetail/{id}`

**Example Request:**
```http
GET /maximo/api/os/mxwodetail/123?oslc.select=*
```

### Create Work Order

**Endpoint:** `POST /maximo/api/os/mxwodetail`

**Request Body:**
```json
{
  "description": "Repair centrifugal pump",
  "assetnum": "PUMP001",
  "location": "PLANT-100",
  "worktype": "CM",
  "priority": 2,
  "siteid": "BEDFORD",
  "orgid": "EAGLENA"
}
```

**Response:**
```json
{
  "wonum": "1001",
  "description": "Repair centrifugal pump",
  "status": "WAPPR",
  "href": "https://host/maximo/api/os/mxwodetail/123"
}
```

### Update Work Order

**Endpoint:** `PATCH /maximo/api/os/mxwodetail/{id}`

**Request Body:**
```json
{
  "description": "Repair and test centrifugal pump",
  "priority": 1
}
```

### Change Work Order Status

**Endpoint:** `POST /maximo/api/os/mxwodetail/{id}?action=wsmethod:changeStatus`

**Request Body:**
```json
{
  "status": "APPR",
  "memo": "Approved for work"
}
```

**Status Workflow:**
- WAPPR (Waiting on Approval)
- APPR (Approved)
- WSCH (Waiting to be Scheduled)
- WMATL (Waiting on Material)
- INPRG (In Progress)
- COMP (Completed)
- CLOSE (Closed)
- CAN (Cancelled)

### Add Labor to Work Order

**Endpoint:** `POST /maximo/api/os/mxwodetail/{id}/LABTRANS`

**Request Body:**
```json
{
  "laborcode": "MAINT1",
  "regularhrs": 4.0,
  "transdate": "2024-01-16T10:00:00Z"
}
```

### Add Material to Work Order

**Endpoint:** `POST /maximo/api/os/mxwodetail/{id}/WPMATERIAL`

**Request Body:**
```json
{
  "itemnum": "BEARING-001",
  "itemqty": 2,
  "storelocsite": "BEDFORD"
}
```

### Add Work Log

**Endpoint:** `POST /maximo/api/os/mxwodetail/{id}/WORKLOG`

**Request Body:**
```json
{
  "description": "Replaced bearing and tested pump",
  "logtype": "WORK",
  "createdate": "2024-01-16T14:30:00Z"
}
```

## Asset APIs (MXASSET)

### Object Structure: `mxasset`

### Get Assets

**Endpoint:** `GET /maximo/api/os/mxasset`

**Example Request:**
```http
GET /maximo/api/os/mxasset?oslc.select=assetnum,description,location,status&oslc.where=assettype="PRODUCTION"
```

**Example Response:**
```json
{
  "member": [
    {
      "assetnum": "PUMP001",
      "description": "Centrifugal Pump 100HP",
      "location": "PLANT-100",
      "status": "OPERATING",
      "assettype": "PRODUCTION",
      "serialnum": "SN-12345",
      "manufacturer": "ACME Corp"
    }
  ]
}
```

### Create Asset

**Endpoint:** `POST /maximo/api/os/mxasset`

**Request Body:**
```json
{
  "assetnum": "PUMP002",
  "description": "Centrifugal Pump 150HP",
  "location": "PLANT-200",
  "assettype": "PRODUCTION",
  "status": "NOT READY",
  "siteid": "BEDFORD",
  "orgid": "EAGLENA"
}
```

### Update Asset

**Endpoint:** `PATCH /maximo/api/os/mxasset/{id}`

**Request Body:**
```json
{
  "location": "PLANT-300",
  "status": "OPERATING"
}
```

### Record Meter Reading

**Endpoint:** `POST /maximo/api/os/mxasset/{id}/ASSETMETER`

**Request Body:**
```json
{
  "metername": "RUNTIME",
  "newreading": 1250.5,
  "newreadingdate": "2024-01-16T15:00:00Z"
}
```

### Get Asset Hierarchy

**Endpoint:** `GET /maximo/api/os/mxasset/{id}?oslc.select=assetnum,parent,children.*`

## Inventory APIs (MXINVENTORY)

### Object Structure: `mxinventory`

### Get Inventory Balance

**Endpoint:** `GET /maximo/api/os/mxinventory`

**Example Request:**
```http
GET /maximo/api/os/mxinventory?oslc.select=itemnum,location,curbal,binnum&oslc.where=itemnum="BEARING-001"
```

**Example Response:**
```json
{
  "member": [
    {
      "itemnum": "BEARING-001",
      "location": "STOREROOM1",
      "curbal": 25,
      "binnum": "A-12-3",
      "reorder": 10,
      "maxlevel": 50
    }
  ]
}
```

### Issue Inventory

**Endpoint:** `POST /maximo/api/os/mxinvtrans`

**Request Body:**
```json
{
  "itemnum": "BEARING-001",
  "fromstoreloc": "STOREROOM1",
  "quantity": 2,
  "transdate": "2024-01-16T10:00:00Z",
  "issuetype": "ISSUE",
  "refwo": "1001"
}
```

### Return Inventory

**Endpoint:** `POST /maximo/api/os/mxinvtrans`

**Request Body:**
```json
{
  "itemnum": "BEARING-001",
  "tostoreloc": "STOREROOM1",
  "quantity": 1,
  "transdate": "2024-01-16T16:00:00Z",
  "issuetype": "RETURN",
  "refwo": "1001"
}
```

### Transfer Inventory

**Endpoint:** `POST /maximo/api/os/mxinvtrans`

**Request Body:**
```json
{
  "itemnum": "BEARING-001",
  "fromstoreloc": "STOREROOM1",
  "tostoreloc": "STOREROOM2",
  "quantity": 5,
  "transdate": "2024-01-16T11:00:00Z",
  "issuetype": "TRANSFER"
}
```

## Service Request APIs (MXSR)

### Object Structure: `mxsr`

### Get Service Requests

**Endpoint:** `GET /maximo/api/os/mxsr`

**Example Request:**
```http
GET /maximo/api/os/mxsr?oslc.select=ticketid,description,status,reportedby&oslc.where=status="NEW"
```

**Example Response:**
```json
{
  "member": [
    {
      "ticketid": "SR1001",
      "description": "Air conditioning not working",
      "status": "NEW",
      "reportedby": "JOHN.DOE",
      "reportdate": "2024-01-15T09:00:00Z",
      "assetnum": "AC-001",
      "location": "BLDG-100"
    }
  ]
}
```

### Create Service Request

**Endpoint:** `POST /maximo/api/os/mxsr`

**Request Body:**
```json
{
  "description": "Air conditioning not working in conference room",
  "assetnum": "AC-001",
  "location": "BLDG-100",
  "reportedby": "JOHN.DOE",
  "siteid": "BEDFORD"
}
```

### Convert SR to Work Order

**Endpoint:** `POST /maximo/api/os/mxsr/{id}?action=wsmethod:createWO`

**Request Body:**
```json
{
  "worktype": "CM",
  "priority": 2
}
```

## Purchase Order APIs (MXPO)

### Object Structure: `mxpo`

### Get Purchase Orders

**Endpoint:** `GET /maximo/api/os/mxpo`

**Example Request:**
```http
GET /maximo/api/os/mxpo?oslc.select=ponum,description,status,vendor&oslc.where=status="WAPPR"
```

**Example Response:**
```json
{
  "member": [
    {
      "ponum": "PO1001",
      "description": "Spare parts order",
      "status": "WAPPR",
      "vendor": "ACME-SUPPLY",
      "orderdate": "2024-01-15T10:00:00Z",
      "totalcost": 5000.00
    }
  ]
}
```

### Create Purchase Order

**Endpoint:** `POST /maximo/api/os/mxpo`

**Request Body:**
```json
{
  "description": "Spare parts order",
  "vendor": "ACME-SUPPLY",
  "siteid": "BEDFORD",
  "poline": [
    {
      "itemnum": "BEARING-001",
      "orderqty": 10,
      "unitcost": 50.00
    }
  ]
}
```

### Receive Purchase Order

**Endpoint:** `POST /maximo/api/os/mxreceipt`

**Request Body:**
```json
{
  "ponum": "PO1001",
  "polinenum": 1,
  "quantity": 10,
  "receiptdate": "2024-01-20T14:00:00Z",
  "tostoreloc": "STOREROOM1"
}
```

## Location APIs (MXLOCATION)

### Object Structure: `mxlocation`

### Get Locations

**Endpoint:** `GET /maximo/api/os/mxlocation`

**Example Request:**
```http
GET /maximo/api/os/mxlocation?oslc.select=location,description,type,parent
```

**Example Response:**
```json
{
  "member": [
    {
      "location": "PLANT-100",
      "description": "Main Production Plant",
      "type": "OPERATING",
      "parent": "FACILITY-1",
      "siteid": "BEDFORD"
    }
  ]
}
```

### Create Location

**Endpoint:** `POST /maximo/api/os/mxlocation`

**Request Body:**
```json
{
  "location": "PLANT-400",
  "description": "New Production Area",
  "type": "OPERATING",
  "parent": "FACILITY-1",
  "siteid": "BEDFORD"
}
```

## Person APIs (MXPERSON)

### Object Structure: `mxperson`

### Get Persons

**Endpoint:** `GET /maximo/api/os/mxperson`

**Example Request:**
```http
GET /maximo/api/os/mxperson?oslc.select=personid,displayname,status,primaryemail
```

**Example Response:**
```json
{
  "member": [
    {
      "personid": "MAINT1",
      "displayname": "John Maintenance",
      "status": "ACTIVE",
      "primaryemail": "john.maint@company.com",
      "title": "Maintenance Technician"
    }
  ]
}
```

### Record Labor Transaction

**Endpoint:** `POST /maximo/api/os/mxlabtrans`

**Request Body:**
```json
{
  "laborcode": "MAINT1",
  "refwo": "1001",
  "regularhrs": 4.0,
  "transdate": "2024-01-16T10:00:00Z",
  "startdate": "2024-01-16T08:00:00Z",
  "finishdate": "2024-01-16T12:00:00Z"
}
```

## Preventive Maintenance APIs (MXPM)

### Object Structure: `mxpm`

### Get PM Records

**Endpoint:** `GET /maximo/api/os/mxpm`

**Example Request:**
```http
GET /maximo/api/os/mxpm?oslc.select=pmnum,description,frequency,nextdate
```

**Example Response:**
```json
{
  "member": [
    {
      "pmnum": "PM1001",
      "description": "Monthly pump inspection",
      "frequency": 30,
      "frequnit": "DAYS",
      "nextdate": "2024-02-15T00:00:00Z",
      "assetnum": "PUMP001"
    }
  ]
}
```

### Create PM Record

**Endpoint:** `POST /maximo/api/os/mxpm`

**Request Body:**
```json
{
  "description": "Quarterly equipment inspection",
  "assetnum": "PUMP001",
  "frequency": 90,
  "frequnit": "DAYS",
  "nextdate": "2024-04-15T00:00:00Z",
  "siteid": "BEDFORD"
}
```

### Generate PM Work Orders

**Endpoint:** `POST /maximo/api/os/mxpm/{id}?action=wsmethod:generateWO`

**Request Body:**
```json
{
  "targetdate": "2024-01-20T00:00:00Z"
}
```

## Classification APIs (MXCLASSIFICATION)

### Object Structure: `mxclassification`

### Get Classifications

**Endpoint:** `GET /maximo/api/os/mxclassification`

**Example Request:**
```http
GET /maximo/api/os/mxclassification?oslc.select=classstructureid,description,hierarchypath
```

**Example Response:**
```json
{
  "member": [
    {
      "classstructureid": "PUMP",
      "description": "Pumps",
      "hierarchypath": "EQUIPMENT \\ ROTATING \\ PUMP",
      "haschildren": true
    }
  ]
}
```

### Get Classification Specifications

**Endpoint:** `GET /maximo/api/os/mxclassspec`

**Example Request:**
```http
GET /maximo/api/os/mxclassspec?oslc.where=classstructureid="PUMP"
```

**Example Response:**
```json
{
  "member": [
    {
      "classstructureid": "PUMP",
      "assetattrid": "FLOWRATE",
      "description": "Flow Rate",
      "datatype": "NUMERIC",
      "measureunitid": "GPM"
    }
  ]
}
```

## Attachment APIs (DOCLINKS)

### Object Structure: `mxdoclinks`

### Get Attachments

**Endpoint:** `GET /maximo/api/os/mxdoclinks`

**Example Request:**
```http
GET /maximo/api/os/mxdoclinks?oslc.where=ownertable="WORKORDER" and ownerid=123
```

**Example Response:**
```json
{
  "member": [
    {
      "doclinksid": 1001,
      "document": "pump_diagram.pdf",
      "description": "Pump installation diagram",
      "urlname": "https://docs.company.com/pump_diagram.pdf",
      "doctype": "Attachments"
    }
  ]
}
```

### Upload Attachment

**Endpoint:** `POST /maximo/api/os/mxdoclinks`

**Request Body (multipart/form-data):**
```
document: [file binary]
description: "Pump installation diagram"
ownertable: "WORKORDER"
ownerid: 123
```

### Download Attachment

**Endpoint:** `GET /maximo/api/os/mxdoclinks/{id}/DOCINFO/FILE`

## Advanced Query Examples

### Complex WHERE Clause

```http
GET /maximo/api/os/mxwodetail?oslc.where=status in ["WAPPR","APPR"] and priority<3 and reportdate>="2024-01-01T00:00:00Z"
```

### Multiple Field Selection

```http
GET /maximo/api/os/mxasset?oslc.select=assetnum,description,location,parent,children.assetnum,children.description
```

### Sorting

```http
GET /maximo/api/os/mxwodetail?oslc.orderBy=+priority,-reportdate
```

### Pagination

```http
GET /maximo/api/os/mxwodetail?oslc.pageSize=50&pageno=2
```

### Text Search

```http
GET /maximo/api/os/mxwodetail?oslc.searchTerms="pump repair"
```

### Lean Mode (Performance)

```http
GET /maximo/api/os/mxwodetail?lean=1&oslc.select=wonum,description,status
```

## Bulk Operations

### Bulk Create

**Endpoint:** `POST /maximo/api/os/mxwodetail`

**Request Body:**
```json
[
  {
    "description": "Work Order 1",
    "siteid": "BEDFORD"
  },
  {
    "description": "Work Order 2",
    "siteid": "BEDFORD"
  }
]
```

### Bulk Update

**Endpoint:** `POST /maximo/api/os/mxwodetail?action=Sync`

**Request Body:**
```json
[
  {
    "_id": "123",
    "priority": 1
  },
  {
    "_id": "124",
    "priority": 2
  }
]
```

## Error Codes

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| BMXAA0021E | Record not found | 404 |
| BMXAA4210E | Invalid field value | 400 |
| BMXAA9549E | Duplicate record | 400 |
| BMXAA7233E | Required field missing | 400 |
| BMXAA0028E | Access denied | 403 |
| BMXAA1234E | Invalid status change | 400 |

### Error Response Format

```json
{
  "Error": {
    "message": "BMXAA4210E - The value INVALID for the field STATUS is not valid.",
    "statusCode": 400,
    "reasonCode": "BMXAA4210E",
    "extendedError": {
      "moreInfo": "Valid values are: WAPPR, APPR, WSCH, INPRG, COMP, CLOSE, CAN"
    }
  }
}
```

## Rate Limiting

### Default Limits
- 100 requests per minute per API key
- 1000 requests per hour per API key

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

## Best Practices

### 1. Use Lean Mode
```http
GET /maximo/api/os/mxwodetail?lean=1
```

### 2. Select Only Required Fields
```http
GET /maximo/api/os/mxwodetail?oslc.select=wonum,description,status
```

### 3. Use Pagination
```http
GET /maximo/api/os/mxwodetail?oslc.pageSize=100
```

### 4. Implement Retry Logic
- Retry on 429 (Rate Limited)
- Retry on 5xx (Server Errors)
- Use exponential backoff

### 5. Cache Responses
- Cache domain values
- Cache classification structures
- Cache schema information

### 6. Handle Errors Gracefully
- Parse error messages
- Provide user-friendly feedback
- Log errors for debugging

## API Versioning

### Current Version
- API Version: 9.x
- Endpoint: `/maximo/api/os/`

### Version Headers
```http
Accept: application/json
Properties: *
```

## Security Considerations

### 1. API Key Protection
- Store in environment variables
- Never commit to source control
- Rotate regularly

### 2. HTTPS Only
- Always use HTTPS
- Validate SSL certificates

### 3. Input Validation
- Validate all inputs
- Sanitize user data
- Use parameterized queries

### 4. Access Control
- Implement role-based access
- Log all API calls
- Monitor for suspicious activity

## Conclusion

This API reference provides comprehensive coverage of IBM Maximo MAS 9.x REST APIs. Use this as a guide for implementing the MCP server tools and understanding the available operations for each Maximo object structure.