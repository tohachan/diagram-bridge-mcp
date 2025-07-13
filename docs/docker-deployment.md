# Docker Deployment Guide

Complete guide for deploying Diagram Bridge MCP Server using Docker.

## Quick Start with Docker Compose (Recommended)

**Local-First Architecture**: By default, uses local Docker Kroki with no cloud fallback.

```bash
# Clone the repository
git clone <repository-url>
cd diagram-bridge-mcp

# Start the complete local stack (MCP server + Kroki services)
docker-compose up --build

# Access points:
# - MCP Server: localhost:3000
# - Kroki Dashboard: localhost:8000
```

## Alternative Deployment Modes

### Cloud Mode (External Kroki)
```bash
# Use external Kroki service (only if local setup isn't suitable)
docker-compose -f docker-compose.cloud.yml up --build
```

### Development Mode
```bash
# Start with hot reload for development
docker-compose -f docker-compose.dev.yml up -d

# Or with local Kroki service
docker-compose -f docker-compose.dev.yml --profile local-kroki up -d
```

## Production Deployment

### Option 1: Full Stack with Local Kroki
```bash
# Production setup with all services
docker-compose up -d

# Includes:
# - diagram-bridge-mcp (main server)
# - kroki (diagram rendering service)  
# - mermaid, blockdiag, bpmn, excalidraw (rendering engines)
```

### Option 2: Standalone with External Kroki
```bash
# Build the image
docker build -t diagram-bridge-mcp .

# Run with external Kroki service
docker run -d \
  --name diagram-bridge-mcp \
  -p 3000:3000 \
  -e KROKI_URL=https://kroki.io \
  -e NODE_ENV=production \
  diagram-bridge-mcp
```

## Docker Services Overview

### Complete Stack (`docker-compose.yml`)
- **diagram-bridge-mcp**: Main MCP server
- **kroki**: Core diagram rendering service
- **mermaid**: Mermaid diagram rendering engine
- **blockdiag**: BlockDiag family diagram engine
- **bpmn**: BPMN diagram rendering engine  
- **excalidraw**: Excalidraw diagram rendering engine

### Service URLs
- MCP Server: `http://localhost:3000`
- Kroki Service: `http://localhost:8000`
- Health Check: `http://localhost:3000/health` (when implemented)

## Health Monitoring

```bash
# Check service health
curl http://localhost:3000/health

# Get metrics
curl http://localhost:3000/metrics

# Check Kroki connectivity
curl http://localhost:8000/health
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml or use environment variables
2. **Kroki service unavailable**: Check `docker-compose logs kroki`
3. **Memory issues**: Adjust container limits in docker-compose.yml
4. **Slow rendering**: Check Kroki service health and network connectivity

### Debug Commands
```bash
# View all service logs
docker-compose logs

# Check specific service
docker-compose logs diagram-bridge-mcp

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## Advanced Configuration

For detailed Kroki configuration options, see [KROKI_SETUP.md](../KROKI_SETUP.md).

For environment variables and configuration options, see [Configuration Guide](configuration.md).
