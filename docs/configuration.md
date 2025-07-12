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

Change KROKI_URL to https://kroki.io for cloud Kroki service

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

### Caching Configuration
- **LRU cache**: Enabled for diagram rendering (identical requests)
- **Template cache**: Format definitions and templates cached in memory
- **Response optimization**: Base64 encoding/decoding optimization

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
