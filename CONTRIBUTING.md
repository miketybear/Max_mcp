# Contributing to maximo-mcp-server

Thank you for your interest in contributing to **maximo-mcp-server**! This project provides an MCP (Model Context Protocol) server that gives AI assistants comprehensive access to IBM Maximo Application Suite 9.x REST APIs, exposing 143 tools across 16 modules. Every contribution helps make enterprise asset management more accessible through AI.

We welcome contributions of all kinds: bug reports, feature suggestions, documentation improvements, and code contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding a New MCP Tool to an Existing Module](#adding-a-new-mcp-tool-to-an-existing-module)
- [Adding a New Maximo Module](#adding-a-new-maximo-module)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Review Process](#review-process)
- [License](#license)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue or contacting the maintainers directly.

---

## Reporting Bugs

Found a bug? We appreciate you taking the time to report it.

1. **Search existing issues** on [GitHub Issues](https://github.com/swetamshakula/maximo-mcp-server/issues) to check if it has already been reported.
2. If not, **open a new issue** using the bug report template.
3. Include the following details:
   - A clear, descriptive title
   - Steps to reproduce the issue
   - Expected behavior vs. actual behavior
   - Your environment (Node.js version, OS, Maximo MAS 9.x version)
   - Relevant log output (with sensitive data redacted)
   - The MCP tool name involved, if applicable (e.g., `maximo_create_workorder`)

---

## Suggesting Features

Have an idea for a new tool or improvement?

1. **Search existing issues** to see if someone has already suggested it.
2. **Open a new issue** using the feature request template.
3. Describe:
   - The problem your feature would solve
   - Your proposed solution
   - Which Maximo module(s) it relates to
   - Any alternative approaches you considered

---

## Development Setup

### Prerequisites

- **Node.js** >= 18
- **TypeScript** 5.2+
- **npm** (comes with Node.js)
- Access to an IBM Maximo Application Suite 9.x instance (for integration testing)

### Getting Started

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/maximo-mcp-server.git
   cd maximo-mcp-server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   ```env
   MAXIMO_HOST=https://your-maximo-instance.example.com
   MAXIMO_API_KEY=your-api-key-here
   MAXIMO_TIMEOUT=30000
   LOG_LEVEL=info
   CACHE_ENABLED=true
   ```

   > **Important:** Never commit `.env` files or real credentials to the repository.

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   This runs the server with `ts-node` and watches for file changes.

5. **Verify your setup:**

   ```bash
   npm run type-check   # Ensure TypeScript compiles cleanly
   npm test             # Run the test suite
   npm run lint         # Check for linting issues
   ```

### Available Scripts

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Start dev server with ts-node                  |
| `npm run build`          | Compile TypeScript (tsc) and create esbuild bundle |
| `npm start`             | Run the built server                           |
| `npm test`              | Run all tests with Jest                        |
| `npm run test:watch`    | Run tests in watch mode                        |
| `npm run test:coverage` | Run tests with coverage (70% threshold)        |
| `npm run lint`          | Lint source code with ESLint                   |
| `npm run lint:fix`      | Auto-fix linting issues                        |
| `npm run format`        | Format code with Prettier                      |
| `npm run type-check`    | Type-check without emitting files              |
| `npm run clean`         | Remove build artifacts                         |

---

## Project Structure

```
maximo-mcp-server/
├── src/
│   ├── index.ts                  # Server entry point, tool registration
│   ├── core/                     # Shared infrastructure
│   │   ├── maximo-client.ts      # HTTP client (axios, retry, caching)
│   │   ├── auth-manager.ts       # API key and basic auth handling
│   │   ├── config-manager.ts     # Environment and config loading
│   │   ├── error-handler.ts      # Error transformation
│   │   ├── response-formatter.ts # Response normalization
│   │   ├── rate-limiter.ts       # Token bucket rate limiting
│   │   ├── cache-manager.ts      # In-memory cache (node-cache)
│   │   └── logger.ts             # Structured logging (winston)
│   └── modules/                  # Maximo functional modules (16 total)
│       ├── work-orders/
│       ├── assets/
│       ├── inventory/
│       ├── service-requests/
│       ├── purchase-orders/
│       ├── preventive-maintenance/
│       ├── plans/
│       ├── persons-labor/
│       ├── locations/
│       ├── analytics/
│       ├── scheduler/
│       ├── attachments/
│       ├── classifications/
│       ├── query-search/
│       ├── bulk-operations/
│       └── dev-tools/
├── tests/
│   ├── unit/modules/             # Unit tests (mirrors src/modules/)
│   ├── integration/modules/      # Integration tests
│   └── fixtures/                 # Test data and mock responses
├── docs/
│   ├── planning/                 # Architecture and design documents
│   └── api/                      # API usage guides per module
├── .env.example
├── jest.config.js
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── package.json
```

### Module Architecture

Every module follows the same four-file pattern:

```
src/modules/<module-name>/
├── operations.ts    # Business logic and API calls to Maximo
├── tools.ts         # MCP tool definitions (name, description, inputSchema, handler)
├── types.ts         # TypeScript interfaces and types
└── index.ts         # Public exports
```

| File              | Purpose                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `operations.ts`   | Business logic that calls Maximo REST APIs via `MaximoClient`        |
| `tools.ts`        | MCP tool definitions: name, description, input schema, and handler   |
| `types.ts`        | TypeScript interfaces for request params, responses, and OSLC schemas |
| `index.ts`        | Public exports for the module                                        |

**Key separation:** `operations.ts` contains the logic; `tools.ts` defines the MCP interface that delegates to operations. This allows the same operations to be reused across multiple tools or called directly.

### Key Dependencies

| Package                         | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `@modelcontextprotocol/sdk`     | MCP protocol implementation (^0.5.0) |
| `axios`                         | HTTP client with interceptors      |
| `zod`                           | Runtime type validation            |
| `winston`                       | Structured logging                 |
| `node-cache`                    | In-memory caching                  |
| `dotenv`                        | Environment variable loading       |
| `uuid`                          | Unique identifier generation       |

---

## Adding a New MCP Tool to an Existing Module

If you are adding a tool to a module that already exists (e.g., adding `maximo_archive_workorder` to `work-orders`), follow these steps:

### Step 1: Add the operation method

In `src/modules/<module>/operations.ts`, add your business logic method:

```typescript
async archiveWorkOrder(workOrderId: string): Promise<MaximoResponse> {
  const endpoint = `/api/os/mxwo/${workOrderId}?action=archive`;
  return this.client.post(endpoint);
}
```

### Step 2: Define the tool

In `src/modules/<module>/tools.ts`, add the tool definition to the array returned by the `create<Module>Tools()` factory function:

```typescript
{
  name: 'maximo_archive_workorder',
  description: 'Archive a work order by ID, removing it from active views',
  inputSchema: {
    type: 'object',
    properties: {
      workOrderId: {
        type: 'string',
        description: 'The unique ID of the work order to archive',
      },
    },
    required: ['workOrderId'],
  },
  handler: async (args: { workOrderId: string }) => {
    return operations.archiveWorkOrder(args.workOrderId);
  },
}
```

**Tool naming convention:** All tools must follow the pattern `maximo_<action>_<object>` (e.g., `maximo_create_workorder`, `maximo_get_asset`, `maximo_search_items`).

### Step 3: Add types if needed

If your tool introduces new request or response shapes, define them in `src/modules/<module>/types.ts`.

### Step 4: Write tests

Add unit tests in `tests/unit/modules/<module>/tools.test.ts` covering:

- Valid input produces the expected API call
- Invalid input is rejected by the schema
- Error responses are handled gracefully
- Edge cases (empty strings, missing optional fields, etc.)

### Step 5: Verify

```bash
npm run type-check    # No type errors
npm test              # All tests pass
npm run test:coverage # Coverage threshold met
npm run lint          # No linting issues
```

The tool is automatically registered on the next server start -- no changes to `src/index.ts` are needed when adding to an existing module.

---

## Adding a New Maximo Module

Adding an entirely new module is a larger undertaking. Follow this complete checklist:

### Step 1: Create the module directory

```bash
mkdir -p src/modules/<module-name>
```

### Step 2: Define types (`types.ts`)

Create TypeScript interfaces for:

- Request parameters (create, update, search, etc.)
- Response shapes from the Maximo API
- Any OSLC-specific schema types

```typescript
export interface MyResourceCreate {
  description: string;
  siteid: string;
  // ... other required fields
}

export interface MyResourceUpdate {
  id: string;
  siteid: string;
  // ... updateable fields
}

export interface MyResourceSearch {
  status?: string;
  pageSize?: number;
  // ... filter fields
}
```

### Step 3: Implement operations (`operations.ts`)

- Create a class that receives `MaximoClient` in its constructor
- Implement methods for each Maximo API interaction
- Follow the patterns established in existing modules (e.g., `work-orders/operations.ts`)

```typescript
import { MaximoClient } from '../../core/maximo-client';

export class MyModuleOperations {
  constructor(private client: MaximoClient) {}

  async get(id: string, siteid: string) {
    return this.client.get('/api/os/myresource', {
      params: { 'oslc.where': `id="${id}" and siteid="${siteid}"` },
    });
  }

  async create(data: MyResourceCreate) {
    return this.client.post('/api/os/myresource', data);
  }

  // ... additional operations
}
```

### Step 4: Create tool definitions (`tools.ts`)

- Export a `create<Module>Tools(operations)` factory function
- Each tool must have: `name`, `description`, `inputSchema` (zod), and `handler`
- Follow the naming convention: `maximo_<action>_<object>`

```typescript
export function createMyModuleTools(operations: MyModuleOperations) {
  return [
    {
      name: 'maximo_get_myresource',
      description: 'Retrieve a specific resource by ID and site',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Resource ID' },
          siteid: { type: 'string', description: 'Site ID' },
        },
        required: ['id', 'siteid'],
      },
      handler: async (args: { id: string; siteid: string }) => {
        return operations.get(args.id, args.siteid);
      },
    },
    // ... additional tools
  ];
}
```

### Step 5: Create public exports (`index.ts`)

```typescript
export { createMyModuleTools } from './tools';
export { MyModuleOperations } from './operations';
export * from './types';
```

### Step 6: Register the module in `src/index.ts`

```typescript
import { MyModuleOperations, createMyModuleTools } from './modules/<module-name>';

// In the initialization section:
const myModuleOps = new MyModuleOperations(maximoClient);
const myModuleTools = createMyModuleTools(myModuleOps);
this.registerTools(myModuleTools, myModuleOps);
```

### Step 7: Write unit tests

Create test files that mirror the module structure:

```
tests/unit/modules/<module-name>/
├── operations.test.ts   # Test each operation method
└── tools.test.ts        # Test tool definitions and handlers
```

Each test file should cover:

- **operations.test.ts:** Verify correct HTTP calls are made, error handling, response transformation
- **tools.test.ts:** Verify tool metadata (name, description, schema), handler delegation to operations, input validation

### Step 8: Write integration tests

```
tests/integration/modules/<module-name>/
└── <module-name>.integration.test.ts
```

Integration tests should:

- Test real-world workflows end to end
- Use `msw` (Mock Service Worker) for mocking HTTP requests
- Be wrapped in `describe.skip()` by default if they require live API credentials

### Step 9: Add documentation

Create `docs/api/modules/<module-name>.md` with:

- Module overview and purpose
- List of available tools with descriptions
- Example requests and responses
- OSLC query examples specific to this module

### Step 10: Verify everything

```bash
npm run type-check    # No type errors
npm test              # All tests pass
npm run test:coverage # Meets 70% coverage threshold
npm run lint          # No linting issues
npm run build         # Builds successfully
```

---

## Testing Requirements

We use **Jest** as our test framework with **msw** for HTTP mocking.

### What Is Required

- **Unit tests are mandatory** for all new tools and operations.
- **Integration tests are encouraged**, especially for complex workflows or multi-step API interactions.
- **70% code coverage threshold** is enforced across branches, functions, lines, and statements. PRs that drop coverage below this threshold will not be merged.

### Running Tests

```bash
npm test                                   # Run all tests
npm run test:watch                         # Watch mode during development
npm run test:coverage                      # Full coverage report
npm test -- path/to/test.spec.ts           # Run a single test file
npm test -- --testNamePattern="pattern"    # Run tests matching a pattern
```

### Test Guidelines

- Use `msw` (Mock Service Worker) for mocking HTTP requests in integration tests.
- Place shared mock data and fixtures in `tests/fixtures/`.
- Use `sanitizeLogData()` from `src/core/logger.ts` to prevent logging sensitive data in tests.
- Test both success and error paths for every operation.
- Validate that zod schemas correctly reject invalid input.
- Integration tests that require a live Maximo instance should be wrapped in `describe.skip()` by default.

### Test File Naming

| Type             | Pattern                              | Location                                   |
| ---------------- | ------------------------------------ | ------------------------------------------ |
| Unit test        | `*.test.ts`                          | `tests/unit/modules/<module-name>/`        |
| Integration test | `*.integration.test.ts`              | `tests/integration/modules/<module-name>/` |

---

## Code Style

This project enforces consistent code style through automated tooling. All checks must pass before a PR can be merged.

### ESLint

- Run: `npm run lint` (check) or `npm run lint:fix` (auto-fix)
- Configuration: `.eslintrc.js`

### Prettier

- Run: `npm run format`
- Configuration: `.prettierrc`

### TypeScript

- **Strict mode** is enabled with all strict type-checking options.
- **No unused locals or parameters** -- the build will fail if any are present.
- **Target:** ES2022 with CommonJS modules.

### General Guidelines

- Prefer `const` over `let`; never use `var`.
- Use explicit return types on exported and public functions.
- Use `zod` for runtime validation of all tool inputs.
- Handle errors explicitly -- do not swallow exceptions silently.
- Use the `winston` logger instead of `console.log`.
- Redact sensitive data (API keys, passwords, tokens) before logging using `sanitizeLogData()`.
- Use meaningful variable names that reflect Maximo domain terminology.
- Prefer explicit types over `any`. If `any` is truly unavoidable, add a comment explaining why.

### Security

- Never log sensitive data (API keys, passwords, session tokens).
- Validate all user inputs at tool boundaries using zod schemas.
- Do not hardcode credentials -- always use environment variables.
- See [SECURITY.md](SECURITY.md) for the vulnerability reporting process.

---

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type         | When to use                                             |
| ------------ | ------------------------------------------------------- |
| `feat`       | A new feature or tool                                   |
| `fix`        | A bug fix                                               |
| `docs`       | Documentation changes only                              |
| `test`       | Adding or updating tests                                |
| `refactor`   | Code change that neither fixes a bug nor adds a feature |
| `perf`       | Performance improvements                                |
| `chore`      | Build process, dependency updates, tooling changes      |
| `ci`         | CI/CD configuration changes                             |

### Scope

Use the module name when the change is scoped to a specific module:

```
feat(work-orders): add maximo_archive_workorder tool
fix(assets): handle missing asset hierarchy response
test(inventory): add integration tests for stock level queries
docs(README): update installation instructions
refactor(core): extract retry logic into shared utility
```

### Examples

```
feat(preventive-maintenance): add maximo_get_pm_schedule tool

Adds a new tool that retrieves the upcoming schedule for a
preventive maintenance record, including projected dates
and associated work order generation windows.

Closes #142
```

```
fix(core): retry on 503 responses from Maximo API

The MaximoClient was not retrying on HTTP 503 (Service Unavailable)
responses, which Maximo returns during rolling restarts. Added 503
to the retryable status code list.

Fixes #87
```

---

## Pull Request Process

### 1. Fork and branch

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/maximo-mcp-server.git
cd maximo-mcp-server
git checkout -b feat/your-feature-name
```

Use branch naming that matches your commit type:

- `feat/description` for features
- `fix/description` for bug fixes
- `docs/description` for documentation
- `test/description` for test additions
- `refactor/description` for refactors

### 2. Make your changes

- Follow the coding standards and patterns described in this guide.
- Write tests alongside your implementation.
- Keep commits focused and atomic -- one logical change per commit.

### 3. Validate locally

Run all checks before pushing:

```bash
npm run type-check    # No TypeScript errors
npm test              # All tests pass
npm run test:coverage # Coverage meets 70% threshold
npm run lint          # No linting issues
npm run build         # Build succeeds
```

All five checks must pass before submitting a PR.

### 4. Push and open a PR

```bash
git push origin feat/your-feature-name
```

Open a pull request against the `main` branch on GitHub. In your PR description, include:

- **What** the change does
- **Why** the change is needed
- **How** it was tested
- Link to any related issues (e.g., `Closes #123`)

### 5. PR Checklist

Before requesting review, confirm:

- [ ] Code compiles without errors (`npm run type-check`)
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets the 70% threshold (`npm run test:coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] New tools follow the `maximo_<action>_<object>` naming convention
- [ ] New modules follow the four-file structure (`operations.ts`, `tools.ts`, `types.ts`, `index.ts`)
- [ ] Commit messages follow Conventional Commits format
- [ ] Documentation is updated if applicable

---

## Review Process

1. **Automated checks** run on every PR (type-check, lint, test, coverage, build).
2. **A maintainer will review** your PR, typically within a few business days.
3. Reviewers may request changes. Please address feedback in additional commits rather than force-pushing during review, so the conversation history remains intact.
4. Once approved and all checks pass, a maintainer will merge your PR.

### What reviewers look for

- Adherence to the module architecture and four-file pattern
- Test coverage for all new functionality
- Clean separation between operations (business logic) and tools (MCP interface)
- Proper error handling and input validation with zod
- No hardcoded credentials or environment-specific values
- Clear, descriptive tool names following the `maximo_<action>_<object>` convention
- Accurate and helpful tool descriptions (these are surfaced to AI assistants)
- Clean commit history with Conventional Commits messages

---

## License

By contributing to maximo-mcp-server, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to maximo-mcp-server! If you have questions that are not covered here, feel free to open a [discussion](https://github.com/swetamshakula/maximo-mcp-server/discussions) or reach out in an issue.
