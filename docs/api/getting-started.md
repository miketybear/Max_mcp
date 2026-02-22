# Getting Started with Maximo MAS 9.x REST API

## Overview

The IBM Maximo Application Suite (MAS) 9.x REST API provides programmatic access to all Maximo functionality through standard HTTP methods. This guide will help you get started with the API.

## Prerequisites

- Access to Maximo MAS 9.x instance
- API key or authentication credentials
- HTTP client (curl, Postman, or programming language)
- Basic understanding of REST APIs and JSON

## Base URL

All API requests use the following base URL pattern:

```
https://{your-maximo-host}/maximo/api/os/{objectstructure}
```

**Example:**
```
https://maximo.example.com/maximo/api/os/mxwodetail
```

## Authentication

### API Key Authentication (Recommended)

Add the API key to request headers:

```http
GET /maximo/api/os/mxwodetail
Host: maximo.example.com
apikey: your-api-key-here
Content-Type: application/json
```

### Obtaining an API Key

1. Log in to Maximo as an administrator
2. Navigate to **System Configuration** > **Platform Configuration** > **Security** > **API Keys**
3. Create a new API key
4. Copy and securely store the key

## Your First API Call

### Example: Get Work Orders

```bash
curl -X GET \
  'https://maximo.example.com/maximo/api/os/mxwodetail?oslc.select=wonum,description,status&oslc.pageSize=10' \
  -H 'apikey: your-api-key' \
  -H 'Content-Type: application/json'
```

**Response:**
```json
{
  "member": [
    {
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

## Common HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve records | Get work order details |
| POST | Create records | Create new work order |
| PATCH | Update records | Update work order status |
| DELETE | Delete records | Delete work order |

## Query Parameters

### Field Selection (`oslc.select`)

Select specific fields to return:

```
?oslc.select=wonum,description,status,priority
```

### Filtering (`oslc.where`)

Filter results with conditions:

```
?oslc.where=status="WAPPR" and priority<3
```

### Sorting (`oslc.orderBy`)

Sort results:

```
?oslc.orderBy=+priority,-reportdate
```

- `+` = ascending
- `-` = descending

### Pagination

```
?oslc.pageSize=50&pageno=1
```

### Lean Mode

Improve performance:

```
?lean=1
```

## Response Format

### Success Response

```json
{
  "member": [
    {
      "href": "https://maximo.example.com/maximo/api/os/mxwodetail/123",
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

### Error Response

```json
{
  "Error": {
    "message": "BMXAA4210E - Invalid field value",
    "statusCode": 400,
    "reasonCode": "BMXAA4210E"
  }
}
```

## Best Practices

1. **Use Field Selection** - Only request fields you need
2. **Implement Pagination** - Don't retrieve all records at once
3. **Enable Caching** - Cache frequently accessed data
4. **Handle Errors** - Implement proper error handling
5. **Use Lean Mode** - For better performance
6. **Rate Limiting** - Respect API rate limits
7. **HTTPS Only** - Always use secure connections

## Next Steps

- Explore [Work Orders API](modules/work-orders.md)
- Learn about [OSLC Queries](advanced/oslc-queries.md)
- Review [Common Patterns](common-patterns.md)
- Check [Error Handling](error-handling.md)

## Quick Reference

### Create Work Order

```bash
curl -X POST \
  'https://maximo.example.com/maximo/api/os/mxwodetail' \
  -H 'apikey: your-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "description": "Repair centrifugal pump",
    "siteid": "BEDFORD",
    "priority": 2
  }'
```

### Update Work Order

```bash
curl -X PATCH \
  'https://maximo.example.com/maximo/api/os/mxwodetail/123' \
  -H 'apikey: your-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "priority": 1
  }'
```

### Query Work Orders

```bash
curl -X GET \
  'https://maximo.example.com/maximo/api/os/mxwodetail?oslc.where=status="WAPPR"&oslc.select=wonum,description&oslc.pageSize=50' \
  -H 'apikey: your-api-key'
```

## Support Resources

- [IBM Maximo Documentation](https://www.ibm.com/docs/en/mas)
- [API Reference](https://www.ibm.com/docs/en/mas-cd/maximo-manage)
- [Community Forums](https://community.ibm.com/community/user/asset-facilities/communities/community-home?CommunityKey=d0f8c9e0-8e4e-4c4d-9a5e-7f5e5c5e5c5e)

---

**Next:** [Authentication Guide](authentication.md)