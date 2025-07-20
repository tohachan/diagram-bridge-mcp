# Quick Start: Port Configuration

## TL;DR - Change Ports Fast

### Option 1: Interactive Setup (Recommended)
```bash
# Interactive setup with port selection and validation
./scripts/start-with-ports.sh
```

### Option 2: Direct Environment Variables
```bash
# Custom ports: MCP=4000, Kroki=9000
PORT=4000 KROKI_PORT=9000 docker-compose up --build
```

### Option 3: Create .env File
```bash
# Copy example and edit
cp .env.example .env
# Edit .env file, then:
docker-compose up --build
```

## Most Common Scenarios

### Avoid Port 3000 Conflict (Next.js, React, etc.)
```bash
# Use port 3001 for MCP Server
PORT=3001 docker-compose up --build
```

### Avoid Port 8000 Conflict (Django, other services)
```bash
# Use port 8001 for Kroki
KROKI_PORT=8001 docker-compose up --build
```

### Multiple Development Instances
```bash
# Instance 1
PORT=3000 KROKI_PORT=8000 docker-compose -f docker-compose.dev.yml up -d

# Instance 2 (in another terminal)
PORT=3001 KROKI_PORT=8001 docker-compose -f docker-compose.dev.yml up -d
```

## Troubleshooting

### Check What's Using Your Ports
```bash
# Check specific ports
lsof -i :3000
lsof -i :8000

# Or use our interactive script (includes checking)
./scripts/start-with-ports.sh
```

### Quick Fix for Port Conflicts
```bash
# Find free ports and use them
PORT=3001 KROKI_PORT=8001 docker-compose up --build
```

## Available Docker Compose Commands
```bash
docker-compose up --build          # Default ports
docker-compose -f docker-compose.dev.yml up  # Development mode
docker-compose -f docker-compose.cloud.yml up # Cloud Kroki mode
docker-compose ps                   # Check status
docker-compose logs                 # View logs
docker-compose down                 # Stop services
```

That's it! Your services will start with your custom ports. Access them at:
- MCP Server: `http://localhost:{your_PORT}`
- Kroki Service: `http://localhost:{your_KROKI_PORT}`

## Health Monitoring

When running in Docker, you can monitor your services:
```bash
# Check if MCP server is healthy
curl http://localhost:${PORT:-3000}/health

# Get server info
curl http://localhost:${PORT:-3000}/info

# Check Kroki service
curl http://localhost:${KROKI_PORT:-8000}/health
```
