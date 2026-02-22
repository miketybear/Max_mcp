# Maximo MCP Server - Setup Instructions

## Prerequisites

Before you can install dependencies and run the project, you need to have Node.js and npm installed on your system.

### Installing Node.js and npm

#### Option 1: Using Official Installer (Recommended for macOS)

1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the installation wizard
4. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show v9.x.x or higher
   ```

#### Option 2: Using Homebrew (macOS)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node@18

# Verify installation
node --version
npm --version
```

#### Option 3: Using nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc for zsh

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

## Project Setup

Once Node.js and npm are installed, follow these steps:

### 1. Install Dependencies

```bash
# Navigate to project directory
cd /Users/surendrakatta/Documents/AI-Foundations/Code\ AI/Maximo_mcp

# Install all dependencies
npm install
```

This will install:
- **Production dependencies**: @modelcontextprotocol/sdk, axios, dotenv, node-cache, winston, zod
- **Development dependencies**: TypeScript, Jest, ESLint, Prettier, and related tools

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Maximo credentials
# Use your preferred text editor (nano, vim, or VS Code)
nano .env
```

Required environment variables:
- `MAXIMO_HOST`: Your Maximo server URL
- `MAXIMO_API_KEY`: Your API key for authentication

### 3. Verify TypeScript Setup

```bash
# Check TypeScript compilation
npm run type-check
```

### 4. Verify ESLint Setup

```bash
# Run linter
npm run lint
```

### 5. Build the Project

```bash
# Compile TypeScript to JavaScript
npm run build
```

### 6. Run Tests

```bash
# Run test suite
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Development Workflow

### Running in Development Mode

```bash
# Start development server with auto-reload
npm run dev
```

### Code Formatting

```bash
# Format all TypeScript files
npm run format
```

### Linting and Fixing

```bash
# Run linter and auto-fix issues
npm run lint:fix
```

## Project Structure

```
maximo-mcp-server/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   ├── config/            # Configuration files
│   ├── auth/              # Authentication logic
│   ├── core/              # Core functionality
│   ├── modules/           # Feature modules
│   ├── tools/             # MCP tools
│   ├── resources/         # MCP resources
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
├── docs/                  # Documentation
├── dist/                  # Compiled output (generated)
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .env.example          # Environment variables template
└── .gitignore            # Git ignore rules
```

## Troubleshooting

### Node.js Not Found

If you get "command not found" errors for `node` or `npm`:

1. Verify Node.js is installed: `which node`
2. Check your PATH includes Node.js: `echo $PATH`
3. Restart your terminal after installation
4. If using nvm, ensure it's properly initialized in your shell profile

### Permission Errors

If you encounter permission errors during `npm install`:

```bash
# Don't use sudo with npm!
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### TypeScript Errors

If you see TypeScript errors after installation:

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run clean
npm run build
```

### Module Not Found Errors

If you see "Cannot find module" errors:

```bash
# Ensure all dependencies are installed
npm install

# Check for missing peer dependencies
npm ls
```

## Next Steps

After successful setup:

1. Review the [Architecture Documentation](docs/planning/ARCHITECTURE.md)
2. Read the [Implementation Plan](docs/planning/IMPLEMENTATION_PLAN.md)
3. Check the [API Reference](docs/planning/API_REFERENCE.md)
4. Start implementing Phase 2 features

## Getting Help

- Check the [documentation](docs/)
- Review [troubleshooting guide](docs/planning/TECH_STACK_AND_DEPLOYMENT.md)
- Open an issue on the project repository

## Current Status

✅ **Phase 1 Complete**: Project Setup and Dependencies
- [x] Package.json created with all dependencies
- [x] TypeScript configured
- [x] All directories created
- [x] Configuration files in place
- [x] Initial entry point created
- [ ] Dependencies installed (requires Node.js)
- [ ] Build verification (requires dependencies)

**Ready for**: Phase 2 - Core Implementation (after Node.js installation)