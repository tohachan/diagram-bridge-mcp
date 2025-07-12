# Installation Guide

This guide covers the installation and setup process for the Diagram Bridge MCP Server.

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd diagram-bridge-mcp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Project
```bash
npm run build
```

### 4. Start the Server
```bash
npm start
```

The server will start and be ready to accept MCP connections.

## Global Installation

For system-wide access:

```bash
# Install globally
npm install -g diagram-bridge-mcp

# Use globally
diagram-bridge-mcp
```

## Verification

To verify your installation:

```bash
# Check if the server starts without errors
npm start

# Run tests to ensure everything works
npm test
```

## Troubleshooting

### Common Installation Issues

1. **Node.js Version**: Ensure you're using Node.js 18.0 or higher
2. **Permission Issues**: Use `sudo` for global installations on Unix systems
3. **Build Failures**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Getting Help

- Check the main [README](../README.md) for basic setup
- Review [Docker Deployment](docker-deployment.md) for containerized setup
- Open an issue on GitHub for installation problems
