# ============================================================================
# IBM Maximo MAS 9.x MCP Server — Multi-Stage Docker Build
# ============================================================================
# Stage 1: Install dependencies and compile TypeScript
# Stage 2: Minimal production image with only compiled output
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1 — Build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Prune devDependencies — keep only production deps
RUN npm prune --production

# ---------------------------------------------------------------------------
# Stage 2 — Production
# ---------------------------------------------------------------------------
FROM node:22-alpine AS production

# Metadata
LABEL maintainer="Maximo MCP Development Team"
LABEL description="MCP Server for IBM Maximo Application Suite 9.x"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/swetamshakula/maximo-mcp-server"
LABEL org.opencontainers.image.licenses="MIT"

# Security: run as non-root user
RUN addgroup -g 1001 -S mcpgroup && \
    adduser -S mcpuser -u 1001 -G mcpgroup

WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy package.json for runtime metadata
COPY package.json ./

# Create logs directory owned by mcpuser
RUN mkdir -p /app/logs && chown -R mcpuser:mcpgroup /app/logs

# Health check — verify the Node runtime is functional
# Since MCP uses stdio (not HTTP), we validate Node can execute
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "--version"]

# Switch to non-root user
USER mcpuser

# Environment defaults (override at runtime)
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV CACHE_ENABLED=true

# MCP servers communicate over stdio — no ports to expose
# The entry point reads stdin and writes stdout per the MCP protocol
ENTRYPOINT ["node", "dist/index.js"]
