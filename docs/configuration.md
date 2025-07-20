# Configuration Guide

Complete configuration options for the Diagram Bridge MCP Server.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3000` | Server port |
| `KROKI_URL` | `http:/kroki:8000` | Kroki service URL |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `DIAGRAM_STORAGE_PATH` | `{project-root}/generated-diagrams` | Directory for storing rendered diagram files |
| `MAX_CODE_LENGTH` | `5242880` | Maximum diagram code length in bytes (5MB) |

Change KROKI_URL to https://kroki.io for cloud Kroki service

## Kroki Server Configuration

### Size Limits and Performance

The Diagram Bridge MCP Server is configured with enterprise-level size limits for handling large and complex diagrams:

#### Current Enterprise Settings

| Parameter | Value | Description |
|-----------|-------|-------------|
| `KROKI_MAX_BODY_SIZE` | `50mb` | Maximum HTTP request body size |
| `KROKI_MAX_HEADER_SIZE` | `32768` | Maximum HTTP header size (4x default) |
| `KROKI_MAX_URI_LENGTH` | `16384` | Maximum URI length (4x default) |
| `KROKI_CONVERT_TIMEOUT` | `120s` | Timeout for diagram conversion |
| `KROKI_COMMAND_TIMEOUT` | `60s` | Timeout for external commands |
| `MAX_CODE_LENGTH` | `5242880` | Maximum diagram code length (5MB) |

#### Default Kroki Limits (for reference)

| Parameter | Default | Enterprise |
|-----------|---------|------------|
| `KROKI_MAX_BODY_SIZE` | `1mb` | `50mb` |
| `KROKI_MAX_HEADER_SIZE` | `8192` | `32768` |
| `KROKI_MAX_URI_LENGTH` | `4096` | `16384` |
| `KROKI_CONVERT_TIMEOUT` | `20s` | `120s` |
| `KROKI_COMMAND_TIMEOUT` | `5s` | `60s` |

### Customizing Kroki Limits

To adjust these limits for your specific needs, modify the environment variables in your Docker Compose file:

```yaml
kroki:
  image: yuzutech/kroki:latest
  environment:
    # Adjust these values based on your requirements
    - KROKI_MAX_BODY_SIZE=100mb        # For very large diagrams
    - KROKI_MAX_HEADER_SIZE=65536      # For complex requests
    - KROKI_MAX_URI_LENGTH=32768       # For long URIs
    - KROKI_CONVERT_TIMEOUT=180s       # For slow conversions
    - KROKI_COMMAND_TIMEOUT=90s        # For slow external tools
```

### When to Increase Limits

**Increase limits when you encounter:**
- `413 Request Entity Too Large` errors
- `SIZE_LIMIT_ERROR` in diagram rendering
- Large PlantUML diagrams with many components
- Complex Mermaid flowcharts
- Excalidraw diagrams with many elements
- Vega-Lite visualizations with large datasets

### Performance Considerations

Higher limits may impact:
- **Memory usage**: Larger diagrams require more RAM
- **Processing time**: Complex diagrams take longer to render
- **Network bandwidth**: Larger requests consume more bandwidth
- **Storage space**: Rendered images will be larger

### Monitoring and Troubleshooting

- Monitor Docker container logs for size-related errors
- Check memory usage with `docker stats`
- Use health checks to verify service availability
- Test with progressively larger diagrams to find optimal limits

## Local Development Setup

### Running without Docker

For local development or when you prefer not to use Docker:

```bash
# 1. Build the project
npm install
npm run build

# 2. Start Kroki service (required)
docker run -d -p 8000:8000 yuzutech/kroki

# 3. Configure environment
export PORT=3001
export KROKI_URL=http://localhost:8000
export GENERATED_DIAGRAMS_DIR=./generated-diagrams

# 4. Start MCP server
node dist/index.js
```

### Port Configuration for Local Setup

When running locally, you can configure ports using environment variables:

```bash
# Set custom ports
export PORT=3001                    # MCP server port
export KROKI_URL=http://localhost:8001  # If using custom Kroki port

# Start server
node dist/index.js
```

### MCP Client Configuration for Local Setup

Update your MCP client configuration to use the local server:

```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "node",
      "args": ["/path/to/diagram-bridge-mcp/dist/index.js"],
      "env": {
        "PORT": "3001",
        "KROKI_URL": "http://localhost:8000"
      }
    }
  }
}
```

### Health Monitoring

When running locally with `DOCKER_CONTAINER=true`, the server provides HTTP endpoints:

- `http://localhost:PORT/health` - Health check
- `http://localhost:PORT/info` - Server information

**Note**: These endpoints are for monitoring only. MCP protocol uses STDIO communication.

## Storage Configuration

### Default Behavior
By default, rendered diagram files are saved to `{project-root}/generated-diagrams/` with absolute file paths. The project root is automatically detected by searching for `package.json` file.

### Custom Storage Path
```bash
# Set custom storage directory
export DIAGRAM_STORAGE_PATH="/tmp/my-diagrams"

# Or use relative path (resolved to absolute)
export DIAGRAM_STORAGE_PATH="./custom-diagrams"

# Start server with custom path
npm start
```

### Cursor Integration with Custom Path
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/diagram-bridge-mcp",
      "env": {
        "DIAGRAM_STORAGE_PATH": "/Users/you/Documents/diagrams"
      }
    }
  }
}
```

## MCP vs HTTP Protocols

**Important**: The server uses two different protocols for different purposes:

| Protocol | Purpose | Configuration |
|----------|---------|---------------|
| **MCP (STDIO)** | Tool communication with LLM clients | Configure in MCP client settings |
| **HTTP** | Docker health monitoring only | Automatic when `DOCKER_CONTAINER=true` |

### MCP Protocol (Main Interface)
- **Used by**: Cursor IDE, Claude Desktop, VS Code MCP extension
- **Communication**: STDIO (Standard Input/Output)
- **Port**: Not applicable (no network port used)
- **Configuration**: Via MCP client settings

### HTTP Endpoints (Monitoring Only)
- **Used for**: Docker health checks, monitoring, debugging
- **Available at**: `http://localhost:PORT/health` and `http://localhost:PORT/info`
- **When active**: Only when running in Docker container
- **Not for**: MCP client connections

## MCP Client Configuration

### Cursor IDE Setup

**Option 1: Local Installation**
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "node",
      "args": ["/absolute/path/to/diagram-bridge-mcp/dist/index.js"],
      "enabled": true
    }
  }
}
```

**Option 2: Docker Container (Recommended)**
```bash
# First start the container
docker-compose up -d

# Then configure Cursor
```
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "docker",
      "args": ["exec", "-i", "diagram-bridge-mcp", "node", "dist/index.js"],
      "enabled": true
    }
  }
}
```

## MCP Server Configuration

### Adding to Cursor

**Option 1: Using npm start (Development) - Recommended**
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/path/to/diagram-bridge-mcp"
    }
  }
}
```

**Option 2: Using node directly (Production)**
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/diagram-bridge-mcp"
    }
  }
}
```

**Option 3: Global installation**
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "diagram-bridge-mcp"
    }
  }
}
```

## Format Customization

### Extending Format Definitions

Extend the format definitions in `src/resources/diagram-selection-config.ts` to:
- Add new diagram formats
- Customize format characteristics
- Adjust selection heuristics
- Modify format descriptions

### Example Format Addition
```typescript
// In src/resources/diagram-selection-config.ts
export const DIAGRAM_FORMATS = {
  // ...existing formats...
  newformat: {
    name: 'newformat',
    displayName: 'New Format',
    description: 'Description of the new format',
    strengths: ['Strength 1', 'Strength 2'],
    weaknesses: ['Weakness 1'],
    bestFor: ['Use case 1', 'Use case 2'],
    examples: ['Example 1', 'Example 2']
  }
};
```

## Security Configuration

- **Input validation**: Automatic parameter validation and sanitization
- **Content filtering**: Malicious content detection enabled by default
- **Parameter limits**: Maximum code length: 100,000 characters
- **Format validation**: Strict format whitelist validation
- **Error sanitization**: Safe error message handling

## Performance Tuning

### Response Optimization
- **Response optimization**: Base64 encoding/decoding optimization
- **Pipeline efficiency**: Streamlined processing workflows

### Resource Limits
- **Memory**: Optimized for container deployment
- **Response time targets**: 
  - Format selection: <100ms
  - Diagram rendering: <2 seconds
- **Concurrent requests**: Handled efficiently with async processing

## Logging Configuration

Set log levels using the `LOG_LEVEL` environment variable:

- `debug`: Detailed debugging information
- `info`: General operational information (default)
- `warn`: Warning messages only
- `error`: Error messages only

```bash
# Enable debug logging
export LOG_LEVEL=debug
npm start
```

## Health Monitoring

### Health Check Endpoints
- **Format Selection**: `diagram_selection_health`
- **Instructions**: `diagram_instructions_health`  
- **Rendering**: `diagram_rendering_health`

### Metrics Endpoints
- **Selection Metrics**: `diagram_selection_metrics`
- **Instructions Metrics**: `diagram_instructions_metrics`
- **Rendering Metrics**: `diagram_rendering_metrics`

## Troubleshooting Configuration Issues

1. **Storage path issues**: Ensure `DIAGRAM_STORAGE_PATH` points to a writable directory
2. **Kroki connectivity**: Verify `KROKI_URL` is accessible from your network
3. **Port conflicts**: Change `PORT` if 3000 is already in use
4. **Memory issues**: Adjust Node.js memory limits for large diagrams
