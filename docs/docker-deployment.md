# Docker Deployment Guide

Complete guide for deploying Diagram Bridge MCP Server using Docker.

## Configuration

Before starting, you can customize the ports used by the services:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the file to set your preferred ports
# PORT=3000           # MCP Server external port (default: 3000)
# KROKI_PORT=8000     # Kroki service external port (default: 8000)
```

Alternatively, you can set environment variables directly:

```bash
# Use custom ports
export PORT=4000
export KROKI_PORT=9000
docker-compose up --build
```

## Quick Start with Docker Compose (Recommended)

**Local-First Architecture**: By default, uses local Docker Kroki with no cloud fallback.

```bash
# Clone the repository
git clone <repository-url>
cd diagram-bridge-mcp

# Start the complete local stack (MCP server + Kroki services)
docker-compose up --build

# Access points (using default ports):
# - MCP Server: localhost:3000 (configurable via PORT env var)
# - Kroki Dashboard: localhost:8000 (configurable via KROKI_PORT env var)
```

## Volume Mapping and File Storage

All Docker configurations include automatic volume mapping for generated diagrams:

```yaml
volumes:
  - "./generated-diagrams:/app/generated-diagrams"
```

This means:
- **Generated diagrams are automatically saved** to your local `./generated-diagrams/` directory
- **Files persist** even when containers are stopped/restarted
- **No manual copying** required - files appear immediately in your local filesystem

### Verify Volume Mapping
```bash
# Check that volume mapping works
ls -la ./generated-diagrams/

# Test by generating a diagram and verify it appears locally
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

# Run with custom port (example: port 4000)
docker run -d \
  --name diagram-bridge-mcp \
  -p 4000:3000 \
  -e KROKI_URL=https://kroki.io \
  -e NODE_ENV=production \
  diagram-bridge-mcp
```

## Port Configuration Examples

### Using Environment Variables
```bash
# Example 1: Change both MCP server and Kroki ports
export PORT=4000
export KROKI_PORT=9000
docker-compose up --build
# MCP Server: localhost:4000, Kroki: localhost:9000

# Example 2: Only change MCP server port
export PORT=5000
docker-compose up --build
# MCP Server: localhost:5000, Kroki: localhost:8000 (default)

# Example 3: Only change Kroki port 
export KROKI_PORT=7000
docker-compose up --build  
# MCP Server: localhost:3000 (default), Kroki: localhost:7000
```

### Using .env File
```bash
# Create .env file with your preferred configuration
cat > .env << EOF
PORT=4000
KROKI_PORT=9000
NODE_ENV=production
LOG_LEVEL=info
EOF

# Start with custom configuration
docker-compose up --build
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
- MCP Server: `http://localhost:{PORT}` (default: 3000)
- Kroki Service: `http://localhost:{KROKI_PORT}` (default: 8000)
- Health Check: `http://localhost:{PORT}/health` (when implemented)

## Health Monitoring

When running in Docker containers, the server provides HTTP endpoints for monitoring:

```bash
# Check service health (replace {PORT} with your configured port)
curl http://localhost:${PORT:-3000}/health

# Get server information and available tools
curl http://localhost:${PORT:-3000}/info

# Check Kroki connectivity (replace {KROKI_PORT} with your configured port)
curl http://localhost:${KROKI_PORT:-8000}/health
```

### Health Check Response
The `/health` endpoint returns comprehensive status information:
```json
{
  "status": "healthy|unhealthy",
  "timestamp": "2025-07-20T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "diagram_selection": { "status": "healthy", "details": [] },
    "diagram_instructions": { "status": "healthy", "details": [] },
    "diagram_rendering": { "status": "healthy", "details": ["Kroki connection failed"] }
  }
}
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports using PORT and KROKI_PORT environment variables
   ```bash
   # Check what's using your desired port
   lsof -i :3000
   
   # Use different ports
   export PORT=4000
   export KROKI_PORT=9000
   docker-compose up --build
   ```

2. **Kroki service unavailable**: Check `docker-compose logs kroki`
3. **Memory issues**: Adjust container limits in docker-compose.yml
4. **Slow rendering**: Check Kroki service health and network connectivity

### Port Configuration Troubleshooting

```bash
# Check current port usage
docker-compose ps

# Verify environment variables
docker-compose config

# Check if ports are accessible
curl -f http://localhost:${PORT:-3000}/health
curl -f http://localhost:${KROKI_PORT:-8000}/health
```
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
