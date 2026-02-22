# IBM Maximo MAS 9.x MCP Server - Tech Stack & Deployment Guide

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Development Environment Setup](#development-environment-setup)
3. [Dependencies](#dependencies)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [Configuration Management](#configuration-management)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Security Considerations](#security-considerations)

---

## Technology Stack

### Core Runtime & Language

#### Node.js
- **Version:** 18.x or higher (LTS recommended)
- **Purpose:** JavaScript runtime environment
- **Why:** Excellent async I/O, large ecosystem, MCP SDK support
- **Installation:**
  ```bash
  # Using nvm (recommended)
  nvm install 18
  nvm use 18
  
  # Or download from nodejs.org
  # https://nodejs.org/
  ```

#### TypeScript
- **Version:** 5.0 or higher
- **Purpose:** Type-safe JavaScript development
- **Why:** Better IDE support, catch errors early, improved maintainability
- **Configuration:** `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
  }
  ```

### MCP Framework

#### @modelcontextprotocol/sdk
- **Version:** Latest stable
- **Purpose:** Model Context Protocol implementation
- **Why:** Official MCP SDK for building servers
- **Installation:**
  ```bash
  npm install @modelcontextprotocol/sdk
  ```

### HTTP Client

#### axios
- **Version:** 1.6.0 or higher
- **Purpose:** HTTP client for REST API calls
- **Why:** Promise-based, interceptors, automatic transforms
- **Installation:**
  ```bash
  npm install axios
  ```
- **Alternative:** node-fetch (if preferred)

### Validation & Schema

#### zod
- **Version:** 3.22.0 or higher
- **Purpose:** TypeScript-first schema validation
- **Why:** Type inference, runtime validation, excellent DX
- **Installation:**
  ```bash
  npm install zod
  ```

### Logging

#### winston
- **Version:** 3.11.0 or higher
- **Purpose:** Logging framework
- **Why:** Multiple transports, log levels, formatting
- **Installation:**
  ```bash
  npm install winston
  ```
- **Configuration:**
  ```typescript
  import winston from 'winston';
  
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });
  ```

### Caching

#### node-cache
- **Version:** 5.1.2 or higher
- **Purpose:** In-memory caching
- **Why:** Simple, fast, TTL support
- **Installation:**
  ```bash
  npm install node-cache
  ```

### Configuration Management

#### dotenv
- **Version:** 16.3.0 or higher
- **Purpose:** Environment variable management
- **Why:** Standard approach, simple, secure
- **Installation:**
  ```bash
  npm install dotenv
  ```

### Testing Framework

#### Jest
- **Version:** 29.7.0 or higher
- **Purpose:** Testing framework
- **Why:** Complete testing solution, great TypeScript support
- **Installation:**
  ```bash
  npm install --save-dev jest @types/jest ts-jest
  ```
- **Configuration:** `jest.config.js`
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/**/*.test.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };
  ```

#### Supertest
- **Version:** 6.3.0 or higher
- **Purpose:** HTTP assertion library
- **Why:** Easy API testing
- **Installation:**
  ```bash
  npm install --save-dev supertest @types/supertest
  ```

#### MSW (Mock Service Worker)
- **Version:** 2.0.0 or higher
- **Purpose:** API mocking
- **Why:** Realistic API mocking for tests
- **Installation:**
  ```bash
  npm install --save-dev msw
  ```

### Code Quality Tools

#### ESLint
- **Version:** 8.50.0 or higher
- **Purpose:** Code linting
- **Installation:**
  ```bash
  npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
- **Configuration:** `.eslintrc.json`
  ```json
  {
    "parser": "@typescript-eslint/parser",
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    "parserOptions": {
      "ecmaVersion": 2022,
      "sourceType": "module"
    },
    "rules": {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn"
    }
  }
  ```

#### Prettier
- **Version:** 3.0.0 or higher
- **Purpose:** Code formatting
- **Installation:**
  ```bash
  npm install --save-dev prettier
  ```
- **Configuration:** `.prettierrc`
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

### Build Tools

#### esbuild or Rollup
- **Version:** Latest stable
- **Purpose:** Fast bundling
- **Why:** Fast builds, tree-shaking
- **Installation:**
  ```bash
  npm install --save-dev esbuild
  # or
  npm install --save-dev rollup @rollup/plugin-typescript
  ```

---

## Development Environment Setup

### Prerequisites

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. **npm or yarn**
   ```bash
   npm --version   # 9.x or higher
   # or
   yarn --version  # 1.22.x or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Code Editor**
   - VS Code (recommended)
   - WebStorm
   - Vim/Neovim with LSP

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/maximo-mcp-server.git
cd maximo-mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Maximo credentials
nano .env

# Build the project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## Dependencies

### Complete package.json

```json
{
  "name": "maximo-mcp-server",
  "version": "1.0.0",
  "description": "MCP Server for IBM Maximo MAS 9.x API",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "maximo-mcp-server": "dist/cli.js"
  },
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc && npm run build:bundle",
    "build:bundle": "esbuild src/index.ts --bundle --platform=node --outfile=dist/bundle.js",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run clean && npm run build"
  },
  "keywords": [
    "maximo",
    "mcp",
    "ibm",
    "api",
    "automation"
  ],
  "author": "Your Organization",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0",
    "node-cache": "^5.1.2",
    "winston": "^3.11.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/supertest": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "esbuild": "^0.19.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "msw": "^2.0.0",
    "prettier": "^3.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.2.0"
  }
}
```

### Installation Commands

```bash
# Install all dependencies
npm install

# Install production dependencies only
npm install --production

# Update dependencies
npm update

# Audit dependencies for vulnerabilities
npm audit
npm audit fix
```

---

## Build Process

### Development Build

```bash
# TypeScript compilation with watch mode
npm run dev

# Or using ts-node directly
npx ts-node src/index.ts
```

### Production Build

```bash
# Clean previous builds
npm run clean

# Type checking
npm run type-check

# Lint code
npm run lint

# Run tests
npm test

# Build
npm run build

# The build creates:
# - dist/           (compiled JavaScript)
# - dist/index.js   (main entry point)
# - dist/index.d.ts (TypeScript declarations)
# - dist/bundle.js  (bundled version)
```

### Build Scripts

Create `scripts/build.sh`:
```bash
#!/bin/bash
set -e

echo "🧹 Cleaning previous build..."
npm run clean

echo "🔍 Type checking..."
npm run type-check

echo "🎨 Linting..."
npm run lint

echo "🧪 Running tests..."
npm test

echo "🏗️  Building..."
npm run build

echo "✅ Build complete!"
```

Make it executable:
```bash
chmod +x scripts/build.sh
./scripts/build.sh
```

---

## Deployment Options

### Option 1: NPM Package (Recommended)

#### Publishing to npm

```bash
# Login to npm
npm login

# Publish package
npm publish

# Or publish with public access
npm publish --access public
```

#### Installation by Users

```bash
# Global installation
npm install -g maximo-mcp-server

# Run the server
maximo-mcp-server --config config.json

# Or local installation
npm install maximo-mcp-server
npx maximo-mcp-server
```

### Option 2: Docker Container

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port (if needed)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Start server
CMD ["node", "dist/index.js"]
```

#### .dockerignore

```
node_modules
dist
npm-debug.log
.env
.git
.gitignore
README.md
tests
*.test.ts
coverage
.vscode
```

#### Build and Run Docker Image

```bash
# Build image
docker build -t maximo-mcp-server:latest .

# Run container
docker run -d \
  --name maximo-mcp \
  -e MAXIMO_HOST=https://your-maximo-host.com \
  -e MAXIMO_API_KEY=your-api-key \
  -p 3000:3000 \
  maximo-mcp-server:latest

# View logs
docker logs -f maximo-mcp

# Stop container
docker stop maximo-mcp
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  maximo-mcp-server:
    build: .
    container_name: maximo-mcp
    restart: unless-stopped
    environment:
      - MAXIMO_HOST=${MAXIMO_HOST}
      - MAXIMO_API_KEY=${MAXIMO_API_KEY}
      - LOG_LEVEL=info
      - CACHE_ENABLED=true
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('healthy')"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Run with Docker Compose:
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Option 3: Kubernetes Deployment

#### Deployment YAML

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: maximo-mcp-server
  labels:
    app: maximo-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: maximo-mcp-server
  template:
    metadata:
      labels:
        app: maximo-mcp-server
    spec:
      containers:
      - name: maximo-mcp-server
        image: your-registry/maximo-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: MAXIMO_HOST
          valueFrom:
            secretKeyRef:
              name: maximo-secrets
              key: host
        - name: MAXIMO_API_KEY
          valueFrom:
            secretKeyRef:
              name: maximo-secrets
              key: api-key
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - node
            - -e
            - console.log('healthy')
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - node
            - -e
            - console.log('ready')
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: maximo-mcp-service
spec:
  selector:
    app: maximo-mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Secret Management

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: maximo-secrets
type: Opaque
stringData:
  host: "https://your-maximo-host.com"
  api-key: "your-api-key-here"
```

#### Deploy to Kubernetes

```bash
# Create secret
kubectl apply -f k8s/secret.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/maximo-mcp-server

# Scale deployment
kubectl scale deployment maximo-mcp-server --replicas=5
```

### Option 4: Serverless (AWS Lambda)

#### Lambda Handler

Create `src/lambda.ts`:
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MCPServer } from './index';

let server: MCPServer;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!server) {
    server = new MCPServer({
      host: process.env.MAXIMO_HOST!,
      apiKey: process.env.MAXIMO_API_KEY!,
    });
  }

  try {
    const result = await server.handleRequest(JSON.parse(event.body || '{}'));
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

#### SAM Template

Create `template.yaml`:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  MaximoMCPFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/lambda.handler
      Runtime: nodejs18.x
      CodeUri: .
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          MAXIMO_HOST: !Ref MaximoHost
          MAXIMO_API_KEY: !Ref MaximoApiKey
      Events:
        Api:
          Type: Api
          Properties:
            Path: /mcp
            Method: post

Parameters:
  MaximoHost:
    Type: String
    Description: Maximo host URL
  MaximoApiKey:
    Type: String
    Description: Maximo API key
    NoEcho: true
```

Deploy:
```bash
sam build
sam deploy --guided
```

---

## Configuration Management

### Environment Variables

Create `.env.example`:
```bash
# Maximo Configuration
MAXIMO_HOST=https://your-maximo-host.com
MAXIMO_API_KEY=your-api-key-here
MAXIMO_TIMEOUT=30000

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/maximo-mcp.log

# Caching
CACHE_ENABLED=true
CACHE_TTL=300

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Performance
MAX_CONCURRENT_REQUESTS=10
CONNECTION_POOL_SIZE=20
```

### Configuration File

Create `config/default.json`:
```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "maximo": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  },
  "cache": {
    "enabled": true,
    "ttl": 300,
    "checkPeriod": 60
  },
  "rateLimit": {
    "maxRequests": 100,
    "windowMs": 60000
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

### Multi-Environment Configuration

```typescript
// src/config/index.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  maximo: z.object({
    host: z.string().url(),
    apiKey: z.string().min(1),
    timeout: z.number().default(30000),
  }),
  server: z.object({
    port: z.number().default(3000),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
});

export const config = configSchema.parse({
  maximo: {
    host: process.env.MAXIMO_HOST,
    apiKey: process.env.MAXIMO_API_KEY,
    timeout: parseInt(process.env.MAXIMO_TIMEOUT || '30000'),
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
```

---

## Monitoring and Logging

### Logging Setup

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'maximo-mcp-server' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Health Check Endpoint

```typescript
// src/health.ts
export async function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}
```

### Metrics Collection

Consider integrating:
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **ELK Stack** - Log aggregation
- **DataDog** - APM monitoring

---

## Security Considerations

### API Key Management

```bash
# Use environment variables
export MAXIMO_API_KEY="your-key"

# Or use secret management services
# AWS Secrets Manager
# Azure Key Vault
# HashiCorp Vault
```

### HTTPS/TLS

```typescript
// For production, always use HTTPS
const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  minVersion: 'TLSv1.2',
});
```

### Input Validation

```typescript
import { z } from 'zod';

const workOrderSchema = z.object({
  description: z.string().min(1).max(500),
  priority: z.number().min(1).max(5),
  siteid: z.string().min(1),
});
```

### Rate Limiting

Implement rate limiting to prevent abuse and protect the Maximo API.

---

## Quick Start Deployment Checklist

- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Build project (`npm run build`)
- [ ] Run tests (`npm test`)
- [ ] Choose deployment method
- [ ] Deploy to target environment
- [ ] Configure monitoring
- [ ] Set up logging
- [ ] Test deployment
- [ ] Document deployment process

---

## Support and Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Check TypeScript configuration

2. **Connection Issues**
   - Verify Maximo host URL
   - Check API key validity
   - Verify network connectivity

3. **Performance Issues**
   - Enable caching
   - Increase connection pool
   - Check rate limits

### Getting Help

- GitHub Issues
- Documentation
- Community forums
- Professional support

---

**Last Updated:** 2024-01-29
**Version:** 1.0.0