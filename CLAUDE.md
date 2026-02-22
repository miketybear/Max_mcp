# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides AI assistants like Claude with comprehensive access to IBM Maximo Application Suite 9.x REST APIs. The server exposes 80+ tools across 8 major Maximo modules for development, testing, and automation workflows.

## Development Commands

### Build and Run
```bash
# Development mode with hot reload
npm run dev

# Build TypeScript and create bundle
npm run build

# Run built server
npm start

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage (70% threshold required)
npm run test:coverage

# Run a single test file
npm test -- path/to/test.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="pattern"
```

### Code Quality
```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check without emitting
npm run type-check
```

## Architecture Patterns

### Module Structure

Each Maximo functional area (work-orders, assets, inventory, etc.) is organized as a module with this pattern:

```
src/modules/<module-name>/
├── operations.ts    # Business logic and API calls to Maximo
├── tools.ts         # MCP tool definitions (metadata + handlers)
├── types.ts         # TypeScript interfaces and types
└── index.ts         # Public exports
```

**Key insight:** `operations.ts` contains the actual business logic (making HTTP calls via MaximoClient), while `tools.ts` defines the MCP tool interface (name, description, input schema, and handler that calls operations). This separation allows the same operations to be used by multiple tools or direct API calls.

### MCP Tool Registration

Tools are registered in `src/index.ts` using this pattern:

1. **Initialize Operations Class:** Each module has an operations class that receives `MaximoClient`:
   ```typescript
   const workOrderOps = new WorkOrderOperations(maximoClient);
   ```

2. **Create Tools Array:** Factory function creates tool definitions:
   ```typescript
   const workOrderTools = createWorkOrderTools(workOrderOps);
   // Returns: Array<{ name, description, inputSchema, handler }>
   ```

3. **Register with MCP Server:** Tools are registered with the SDK:
   ```typescript
   this.registerTools(workOrderTools, workOrderOps);
   // Stores tool metadata and maps handlers to tool names
   ```

4. **Handle Tool Calls:** MCP SDK routes calls to registered handlers:
   ```typescript
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     const handler = this.toolHandlers.get(request.params.name);
     return await handler(request.params.arguments);
   });
   ```

### Configuration & Authentication Flow

**Initialization sequence:**

1. **ConfigManager** (singleton) loads configuration from:
   - `.env` file environment variables
   - `config.json` for multi-environment support
   - Environment variables can use `${VAR_NAME}` interpolation in JSON

2. **AuthManager** handles authentication with two modes:
   - **API Key:** Header-based (`apikey: <key>`)
   - **Username/Password:** Basic auth with session management
   - Returns `AuthResult` with credentials for MaximoClient

3. **MaximoClient** is the core HTTP client with:
   - Automatic retry with exponential backoff (default: 3 retries)
   - Response caching (configurable TTL and max size)
   - Rate limiting to prevent API throttling
   - Connection pooling via axios with keep-alive

### Core Layer Utilities

**Critical components in `src/core/`:**

- **error-handler.ts:** Transforms Maximo API errors into user-friendly messages with context
- **response-formatter.ts:** Normalizes API responses into consistent format
- **rate-limiter.ts:** Token bucket algorithm prevents exceeding Maximo rate limits
- **cache-manager.ts:** In-memory cache with TTL and size limits (uses node-cache)

### Testing Patterns

Tests are organized in `tests/` with parallel structure to `src/`:

```
tests/
├── unit/           # Unit tests for individual functions/classes
├── integration/    # Integration tests with mocked Maximo API
└── fixtures/       # Test data and mock responses
```

**Key testing utilities:**
- **msw (Mock Service Worker):** Mock HTTP requests in integration tests
- **jest.config.js:** Coverage thresholds set to 70% for branches/functions/lines/statements
- Use `sanitizeLogData()` from logger.ts to prevent logging sensitive data in tests

### Module Implementation Checklist

When adding a new Maximo module:

1. Create `src/modules/<module-name>/` directory
2. Define types in `types.ts` (request params, response shapes, OSLC schemas)
3. Implement operations in `operations.ts` (extend base operations pattern)
4. Create tool definitions in `tools.ts` (follow existing naming: `maximo_<action>_<object>`)
5. Export public interface in `index.ts`
6. Register module in `src/index.ts` (initialize operations, create tools, register)
7. Add unit tests in `tests/unit/modules/<module-name>/`
8. Add integration tests in `tests/integration/modules/<module-name>/`
9. Update documentation in `docs/api/modules/<module-name>.md`

### OSLC Query Support

Maximo uses OSLC (Open Services for Lifecycle Collaboration) for querying. Key parameters:

- **where:** Filter expression (e.g., `status="WAPPR" and priority<3`)
- **select:** Fields to return (comma-separated)
- **orderBy:** Sort order (`+field` ascending, `-field` descending)
- **pageSize:** Results per page (default: 100, max: varies by Maximo config)
- **savedQuery:** Named query defined in Maximo

**Tip:** Use `maximo_query` tool for ad-hoc queries and `maximo_query_builder` tool to construct complex OSLC queries interactively.

## Important Context

### Documentation Organization

- **docs/planning/:** High-level design documents, architecture, roadmap, tool catalog
- **docs/api/:** API usage guides, module-specific documentation, examples
- **Root-level `*_REPORT.md` files:** Implementation progress reports (historical artifacts)

### Environment Variables

Required for running the server:
```bash
MAXIMO_HOST=https://your-maximo-instance.com
MAXIMO_API_KEY=your-api-key-here
MAXIMO_TIMEOUT=30000          # Optional, default: 30s
LOG_LEVEL=info                # Optional: debug, info, warn, error
CACHE_ENABLED=true            # Optional, default: false
```

### TypeScript Configuration

- **Target:** ES2022 with CommonJS modules
- **Strict mode:** All strict type checking options enabled
- **No unused locals/parameters:** Enforced (will break build if present)
- **Output:** `dist/` directory with source maps and declaration files

### Key Dependencies

- **@modelcontextprotocol/sdk:** MCP protocol implementation
- **axios:** HTTP client with interceptors for auth/retry/cache
- **zod:** Runtime type validation for tool inputs
- **winston:** Structured logging with configurable levels
- **node-cache:** In-memory caching layer

## Common Workflows

### Adding a New MCP Tool to Existing Module

1. Add operation method in `src/modules/<module>/operations.ts`
2. Define tool in `src/modules/<module>/tools.ts`:
   - Add to exported array from `create<Module>Tools()` factory
   - Include name, description, input schema (zod), and handler
3. Write tests in `tests/unit/modules/<module>/tools.spec.ts`
4. Tool automatically registered on next server start (no index.ts changes needed)

### Debugging Tool Execution

1. Set `LOG_LEVEL=debug` in `.env`
2. Check `logs/` directory for structured log output
3. Use `sanitizeLogData()` wrapper to prevent logging sensitive data (API keys, passwords)
4. MCP SDK logs include tool name, arguments (sanitized), and execution time

### Running Server in Development

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test with MCP client (e.g., Claude Desktop)
# Configure in ~/Library/Application Support/Claude/claude_desktop_config.json
```

Server listens on stdio (standard input/output) for MCP protocol messages. Use MCP Inspector or Claude Desktop for interactive testing.
