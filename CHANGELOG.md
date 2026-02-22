# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-22

### Added
- 143 MCP tools across 16 IBM Maximo Application Suite 9.x modules
- **Work Orders** (15 tools): CRUD, status changes, labor/material/service assignment, tasks, work logs
- **Purchase Orders** (15 tools): CRUD, line items, approval workflows, receiving, receipts
- **Preventive Maintenance** (13 tools): CRUD, WO generation, job plans, scheduling, frequency management
- **Persons & Labor** (13 tools): Person management, crafts, labor transactions, crews, availability
- **Assets** (12 tools): CRUD, meter readings, moves, hierarchy, specifications, downtime tracking
- **Service Requests** (12 tools): CRUD, status management, WO conversion, escalation, solutions
- **Inventory** (11 tools): Items, issue/return/transfer, adjustments, reorder points, stock levels
- **Job Plans** (11 tools): CRUD, tasks, labor/material/service requirements
- **Analytics** (7 tools): WO summaries, asset health, inventory reports, PM compliance, dashboards
- **Locations** (6 tools): CRUD, hierarchy navigation, search
- **Dev Tools** (6 tools): Connection testing, API exploration, schema inspection, health checks
- **Scheduling** (6 tools): Work schedules, unscheduled work, backlog, conflict detection
- **Query & Search** (4 tools): OSLC queries, advanced search, saved queries, query builder
- **Bulk Operations** (4 tools): Batch create, update, delete, and processing
- **Classifications** (4 tools): Classification trees, hierarchy, specifications
- **Attachments** (4 tools): Upload, download, list, delete document attachments
- Dual authentication support (API Key and Basic Auth)
- Full OSLC query engine with interactive query builder
- In-memory response caching with configurable TTL and size limits
- Token bucket rate limiting to prevent API throttling
- Exponential backoff retry logic for transient failures
- HTTP connection pooling via keep-alive
- Multi-environment configuration support (dev, staging, production)
- Structured logging with Winston (configurable levels, log sanitization)
- Runtime input validation with Zod schemas on every tool
- Docker support with multi-stage builds, non-root execution, and read-only filesystem
- Comprehensive documentation and API guides
