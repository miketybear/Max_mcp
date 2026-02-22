# Authentication Module

The Authentication Module provides secure authentication and connection management for the Maximo REST API.

## Overview

This module handles:
- API key authentication (MAXAUTH header)
- Basic authentication (username/password)
- Custom header authentication
- Connection testing and status monitoring
- Automatic token refresh
- Retry logic with exponential backoff
- Comprehensive error handling

## Components

### 1. Types (`types.ts`)
Defines all TypeScript interfaces, types, and error classes:
- `MaximoCredentials`: Configuration for Maximo connection
- `AuthenticationResult`: Result of authentication attempts
- `ConnectionStatus`: Current connection state
- `AuthConfig`: Authentication configuration options
- Custom error classes: `AuthenticationError`, `InvalidCredentialsError`, `ConnectionError`

### 2. API Key Provider (`api-key-provider.ts`)
Manages API key lifecycle:
- Retrieves API keys from environment variables
- Validates API key format
- Supports key rotation
- Tracks key expiration

### 3. Authentication Manager (`auth-manager.ts`)
Main authentication handler:
- Performs authentication with Maximo API
- Manages connection lifecycle
- Provides authentication headers for API requests
- Tests connection health
- Implements retry logic

## Usage

### Basic Authentication with API Key

```typescript
import { AuthManager, MaximoCredentials } from './auth';

// Create authentication manager
const authManager = new AuthManager();

// Configure credentials
const credentials: MaximoCredentials = {
  host: 'https://maximo.example.com',
  apiKey: 'your-api-key-here',
  timeout: 30000,
  maxRetries: 3
};

// Authenticate
try {
  const result = await authManager.authenticate(credentials);
  
  if (result.success) {
    console.log('Authentication successful!');
    
    // Get auth headers for API requests
    const headers = authManager.getAuthHeaders();
    
    // Test connection
    const testResult = await authManager.testConnection();
    console.log('Connection test:', testResult);
  }
} catch (error) {
  console.error('Authentication failed:', error.message);
}
```

### Basic Authentication with Username/Password

```typescript
const credentials: MaximoCredentials = {
  host: 'https://maximo.example.com',
  username: 'your-username',
  password: 'your-password',
  timeout: 30000
};

const result = await authManager.authenticate(credentials);
```

### Using Environment Variables

```typescript
// Set environment variables
// MAXIMO_HOST=https://maximo.example.com
// MAXIMO_API_KEY=your-api-key

import { getDefaultProvider } from './auth';

// Get default provider (loads from environment)
const provider = getDefaultProvider();

// Create auth manager with provider
const authManager = new AuthManager(provider);

const credentials: MaximoCredentials = {
  host: process.env.MAXIMO_HOST!,
  apiKey: provider.getApiKey()!
};

await authManager.authenticate(credentials);
```

### Connection Status Monitoring

```typescript
// Check connection status
const status = authManager.getConnectionStatus();
console.log('Status:', status); // 'connected' | 'disconnected' | 'error'

// Check if authenticated
if (authManager.isAuthenticated()) {
  console.log('Ready to make API calls');
}

// Get authentication result details
const authResult = authManager.getAuthResult();
console.log('Auth method:', authResult?.method);
```

### Token Refresh

```typescript
// Manually refresh token if needed
const refreshed = await authManager.refreshToken();

if (refreshed) {
  console.log('Token refreshed successfully');
}
```

### Error Handling

```typescript
import {
  AuthenticationError,
  InvalidCredentialsError,
  ConnectionError,
  AuthErrorCode
} from './auth';

try {
  await authManager.authenticate(credentials);
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Invalid credentials:', error.message);
    console.error('Suggestions:', error.details?.suggestions);
  } else if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('Auth error:', error.code, error.message);
  }
}
```

### API Key Management

```typescript
import { ApiKeyProvider } from './auth';

const provider = new ApiKeyProvider();

// Load from environment
provider.loadFromEnvironment();

// Validate API key
const validation = provider.validateApiKey('your-api-key');
if (!validation.valid) {
  console.error('Invalid key:', validation.reason);
  console.log('Suggestions:', validation.suggestions);
}

// Rotate API key
provider.rotateApiKey('new-api-key');

// Check expiration
if (provider.isExpired()) {
  console.log('API key has expired');
}

// Get key info (without exposing the key)
const info = provider.getKeyInfo();
console.log('Has key:', info.hasKey);
console.log('Hours until expiry:', info.hoursUntilExpiry);
```

### Cleanup

```typescript
// Disconnect and cleanup
authManager.disconnect();
```

## Configuration

### Environment Variables

- `MAXIMO_HOST`: Maximo server URL (required)
- `MAXIMO_API_KEY`: API key for authentication (optional)
- `MAXIMO_USERNAME`: Username for basic auth (optional)
- `MAXIMO_PASSWORD`: Password for basic auth (optional)
- `MAXIMO_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `MAXIMO_MAX_RETRIES`: Maximum retry attempts (default: 3)
- `LOG_LEVEL`: Logging level (default: 'info')

### Authentication Configuration

```typescript
const config: AuthConfig = {
  autoRefresh: true,           // Enable automatic token refresh
  refreshThreshold: 300,       // Refresh 5 minutes before expiry
  enableRetry: true,           // Enable retry logic
  retryBaseDelay: 1000,        // Base delay for exponential backoff
  retryMaxDelay: 10000,        // Maximum delay between retries
  validateSSL: true            // Validate SSL certificates
};

const authManager = new AuthManager(undefined, config);
```

## Error Codes

- `INVALID_CREDENTIALS`: Invalid username, password, or API key
- `MISSING_CREDENTIALS`: No credentials provided
- `CONNECTION_FAILED`: Cannot connect to Maximo server
- `TIMEOUT`: Request timeout
- `UNAUTHORIZED`: Authentication failed (401)
- `FORBIDDEN`: Access forbidden (403)
- `TOKEN_EXPIRED`: Token has expired
- `INVALID_HOST`: Invalid host URL
- `NETWORK_ERROR`: Network error occurred
- `UNKNOWN_ERROR`: Unknown error

## Security Considerations

1. **Never log credentials**: The module automatically sanitizes logs to prevent credential exposure
2. **Use environment variables**: Store credentials in `.env` file, never in code
3. **Rotate API keys**: Regularly rotate API keys for security
4. **Validate SSL**: Keep `validateSSL: true` in production
5. **Secure storage**: Credentials are stored in memory only, never persisted

## Testing

The module is designed to be testable:
- Use dependency injection for `ApiKeyProvider`
- Mock axios for HTTP requests
- Test error handling paths
- Verify retry logic

## Integration

This module is used by:
- Core HTTP Client (for making authenticated API requests)
- All resource modules (assets, work orders, etc.)
- MCP tools (for executing Maximo operations)

## Next Steps

After implementing this module:
1. Implement Core HTTP Client (`src/core/http-client.ts`)
2. Create resource modules
3. Implement MCP tools
4. Add comprehensive tests