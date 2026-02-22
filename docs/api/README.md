# IBM Maximo MAS 9.x REST API Documentation

This directory contains comprehensive API documentation for IBM Maximo Application Suite 9.x REST APIs, organized by functional module.

## 📚 Documentation Structure

```
docs/api/
├── README.md                          # This file
├── getting-started.md                 # Quick start guide
├── authentication.md                  # Authentication methods
├── common-patterns.md                 # Common API patterns
├── error-handling.md                  # Error codes and handling
├── modules/
│   ├── work-orders.md                # Work Order APIs
│   ├── assets.md                     # Asset Management APIs
│   ├── inventory.md                  # Inventory APIs
│   ├── service-requests.md           # Service Request APIs
│   ├── purchase-orders.md            # Purchase Order APIs
│   ├── locations.md                  # Location APIs
│   ├── persons-labor.md              # Person and Labor APIs
│   ├── preventive-maintenance.md     # PM APIs
│   ├── classifications.md            # Classification APIs
│   └── attachments.md                # Attachment APIs
├── advanced/
│   ├── oslc-queries.md               # OSLC query language
│   ├── bulk-operations.md            # Bulk operations
│   ├── relationships.md              # Object relationships
│   └── performance.md                # Performance optimization
└── examples/
    ├── work-order-workflows.md       # WO workflow examples
    ├── asset-management.md           # Asset management examples
    ├── inventory-transactions.md     # Inventory examples
    └── integration-patterns.md       # Integration patterns
```

## 🚀 Quick Links

### Core Modules
- [Work Orders](modules/work-orders.md) - Complete work order lifecycle management
- [Assets](modules/assets.md) - Asset management and tracking
- [Inventory](modules/inventory.md) - Inventory and materials management
- [Service Requests](modules/service-requests.md) - Service request handling
- [Purchase Orders](modules/purchase-orders.md) - Procurement management

### Supporting Modules
- [Locations](modules/locations.md) - Location hierarchy management
- [Persons & Labor](modules/persons-labor.md) - Personnel and labor tracking
- [Preventive Maintenance](modules/preventive-maintenance.md) - PM scheduling
- [Classifications](modules/classifications.md) - Classification structures
- [Attachments](modules/attachments.md) - Document management

### Advanced Topics
- [OSLC Queries](advanced/oslc-queries.md) - Advanced querying
- [Bulk Operations](advanced/bulk-operations.md) - Batch processing
- [Relationships](advanced/relationships.md) - Object relationships
- [Performance](advanced/performance.md) - Optimization techniques

## 📖 Getting Started

1. Read [Getting Started Guide](getting-started.md)
2. Review [Authentication](authentication.md)
3. Explore [Common Patterns](common-patterns.md)
4. Check module-specific documentation

## 🔗 Base API Information

**Base URL Pattern:**
```
https://{maximo-host}/maximo/api/os/{objectstructure}
```

**Authentication:**
- API Key (recommended for MAS 9.x)
- OAuth 2.0 / OIDC
- Basic Authentication

**Response Format:**
- JSON (default)
- XML (optional)

## 📋 Object Structures

| Object Structure | Module | Description |
|-----------------|--------|-------------|
| `mxwodetail` | Work Orders | Work order details |
| `mxasset` | Assets | Asset records |
| `mxinventory` | Inventory | Inventory balances |
| `mxitem` | Inventory | Item master |
| `mxsr` | Service Requests | Service requests |
| `mxpo` | Purchase Orders | Purchase orders |
| `mxlocation` | Locations | Location records |
| `mxperson` | Persons | Person records |
| `mxpm` | PM | Preventive maintenance |
| `mxclassification` | Classifications | Classification structures |
| `mxdoclinks` | Attachments | Document links |

## 🛠️ Common Operations

### CRUD Operations

**Create (POST):**
```http
POST /maximo/api/os/{objectstructure}
Content-Type: application/json
apikey: {your-api-key}

{
  "field1": "value1",
  "field2": "value2"
}
```

**Read (GET):**
```http
GET /maximo/api/os/{objectstructure}/{id}
apikey: {your-api-key}
```

**Update (PATCH):**
```http
PATCH /maximo/api/os/{objectstructure}/{id}
Content-Type: application/json
apikey: {your-api-key}

{
  "field1": "new-value"
}
```

**Delete (DELETE):**
```http
DELETE /maximo/api/os/{objectstructure}/{id}
apikey: {your-api-key}
```

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `oslc.select` | Fields to return | `oslc.select=wonum,description,status` |
| `oslc.where` | Filter conditions | `oslc.where=status="WAPPR"` |
| `oslc.orderBy` | Sort order | `oslc.orderBy=+priority,-reportdate` |
| `oslc.pageSize` | Records per page | `oslc.pageSize=100` |
| `lean` | Lean mode | `lean=1` |

## 📊 API Versions

- **Current Version:** MAS 9.x
- **API Endpoint:** `/maximo/api/os/`
- **Protocol:** REST over HTTPS
- **Format:** JSON

## 🔐 Security

- Always use HTTPS
- Store API keys securely
- Implement rate limiting
- Validate all inputs
- Handle errors gracefully

## 📞 Support

- [IBM Maximo Documentation](https://www.ibm.com/docs/en/mas)
- [API Reference](https://www.ibm.com/docs/en/mas-cd/maximo-manage/continuous-delivery?topic=apis-maximo-rest-api)
- Community Forums
- GitHub Issues

## 📝 Contributing

To contribute to this documentation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This documentation is provided under MIT License.

---

**Last Updated:** 2024-01-29  
**Version:** 1.0.0  
**Maximo Version:** MAS 9.x