# Configuration Management Module

This module provides centralized configuration management for the Maximo MCP Server. It handles loading, validating, and providing access to all application configuration settings.

## Overview

The Configuration Management module consists of:

- **Types** (`types.ts`): TypeScript interfaces and types for all configuration
- **Constants** (`constants.ts`): Application-wide constants including API endpoints and status codes
- **Environment Config** (`environment.ts`): Environment variable loading and validation
- **Maximo Config** (`maximo-config.ts`): Maximo-specific configuration management
- **Config Manager** (`config-manager.ts`): Centralized singleton configuration manager

## Quick Start

```typescript
import ConfigManager from './config';

// Initialize configuration (loads from environment variables)
const config = ConfigManager.getInstance();
config.initialize();

// Access configuration
const maximoConfig = config.getMaximoConfig();
const cacheConfig = config.getCacheConfig();
const environment = config.getEnvironment();

// Check environment
if (config.isProduction()) {
  console.log('Running in production mode');
}
```

## Environment Variables

### Required Variables

- `MAXIMO_HOST` - Maximo server URL (e.g., `https://maximo.example.com`)
- Either:
  - `MAXIMO_API_KEY` - API key for authentication, OR
  - `MAXIMO_USERNAME` + `MAXIMO_PASSWORD` - Basic authentication credentials

### Optional Variables (with defaults)

#### Maximo Configuration
- `MAXIMO_TIMEOUT` (default: 30000) - Request timeout in milliseconds
- `MAXIMO_MAX_RETRIES` (default: 3) - Maximum retry attempts
- `MAXIMO_VALIDATE_SSL` (default: true) - SSL certificate validation
- `MAXIMO_API_VERSION` (default: 'v1') - Maximo API version

#### Cache Configuration
- `CACHE_ENABLED` (default: true) - Enable/disable caching
- `CACHE_TTL` (default: 300) - Cache TTL in seconds
- `CACHE_MAX_SIZE` (default: 1000) - Maximum cache entries

#### Rate Limiting
- `RATE_LIMIT_ENABLED` (default: true) - Enable/disable rate limiting
- `RATE_LIMIT_MAX_REQUESTS` (default: 100) - Max requests per window
- `RATE_LIMIT_WINDOW_MS` (default: 60000) - Rate limit window in milliseconds

#### Logging
- `LOG_LEVEL` (default: 'info') - Logging level (error, warn, info, debug, verbose)
- `LOG_TO_CONSOLE` (default: true) - Enable console logging
- `LOG_TO_FILE` (default: true) - Enable file logging
- `LOG_FILE_PATH` (default: './logs/maximo-mcp.log') - Log file path

#### Application
- `NODE_ENV` (default: 'development') - Environment (development, staging, production, test)
- `MCP_PORT` (default: 3000) - MCP server port

## Usage Examples

### Basic Configuration Access

```typescript
import ConfigManager from './config';

const config = ConfigManager.getInstance();
config.initialize();

// Get Maximo host
const host = config.getMaximoConfig().getHost();

// Get API endpoint
const endpoint = config.getMaximoConfig().getApiEndpoint('/maximo/api/os/mxwodetail');

// Check authentication method
if (config.getMaximoConfig().isUsingApiKey()) {
  console.log('Using API key authentication');
}
```

### Environment-Specific Configuration

```typescript
import ConfigManager from './config';

const config = ConfigManager.getInstance();
config.initialize();

if (config.isProduction()) {
  // Production-specific logic
  console.log('SSL validation:', config.getMaximoConfig().shouldValidateSSL());
} else if (config.isDevelopment()) {
  // Development-specific logic
  console.log('Development mode - verbose logging enabled');
}
```

### Configuration Overrides (Testing)

```typescript
import ConfigManager from './config';

const config = ConfigManager.getInstance();

// Initialize with overrides for testing
config.initialize({
  maximo: {
    host: 'https://test.maximo.example.com',
    apiKey: 'test-api-key',
    timeout: 5000,
  },
  cache: {
    enabled: false,
  },
});
```

### Using Constants

```typescript
import { API_ENDPOINTS, WORK_ORDER_STATUSES, OSLC_OPERATORS } from './config';

// Build API URL
const workOrdersUrl = `${host}${API_ENDPOINTS.WORK_ORDERS}`;

// Check status
if (status === WORK_ORDER_STATUSES[0]) { // 'WAPPR'
  console.log('Work order is waiting for approval');
}

// Build OSLC query
const query = `status${OSLC_OPERATORS.EQUALS}"INPRG"`;
```

## Configuration Validation

All configuration is validated on initialization:

- **Maximo Config**: Host URL format, authentication credentials, numeric ranges
- **Cache Config**: Positive TTL and max size
- **Rate Limit Config**: Positive max requests and window
- **Logging Config**: Valid log level, file path when file logging enabled
- **Port**: Valid port number (1-65535)

Validation errors throw descriptive error messages:

```typescript
try {
  config.initialize();
} catch (error) {
  console.error('Configuration error:', error.message);
  // Example: "Maximo configuration validation failed:
  //           host: Host must be a valid URL"
}
```

## Security

- Credentials and API keys are never logged
- `toJSON()` methods sanitize sensitive data
- SSL validation enabled by default in production
- Environment variables can be masked in debug output

## Architecture

The module follows these design patterns:

- **Singleton Pattern**: ConfigManager ensures single configuration instance
- **Factory Pattern**: Configuration objects created from environment variables
- **Validation Pattern**: Zod schemas validate all configuration
- **Immutability**: Configuration getters return copies, not references

## Integration

The Configuration module integrates with:

- **Authentication Module** (`src/auth/`): Provides credentials for auth
- **Core HTTP Client** (`src/core/`): Provides timeout, retry, and SSL settings
- **All Resource Modules**: Provides API endpoints and configuration

## Testing

For testing, use configuration overrides and reset:

```typescript
import ConfigManager from './config';

describe('My Test Suite', () => {
  afterEach(() => {
    // Reset singleton for clean state
    ConfigManager.reset();
  });

  it('should work with test config', () => {
    const config = ConfigManager.getInstance();
    config.initialize({
      maximo: {
        host: 'https://test.example.com',
        apiKey: 'test-key',
      },
    });
    
    // Your test code here
  });
});
```

## API Reference

See individual file documentation for detailed API reference:

- [types.ts](./types.ts) - Type definitions
- [constants.ts](./constants.ts) - Application constants
- [environment.ts](./environment.ts) - Environment configuration
- [maximo-config.ts](./maximo-config.ts) - Maximo configuration
- [config-manager.ts](./config-manager.ts) - Configuration manager