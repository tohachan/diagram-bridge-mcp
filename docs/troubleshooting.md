# Troubleshooting Guide

Common issues and solutions for the Diagram Bridge MCP Server.

## Common Deployment Issues ✅

### 🗂️ Files Save Inside Container (SOLVED)
**Problem**: Generated diagrams aren't visible on local filesystem

**Solution**: Volume mapping is already configured in all Docker Compose files:
```yaml
volumes:
  - "./generated-diagrams:/app/generated-diagrams"
```

**Verification**:
```bash
# Check that files appear locally
ls -la ./generated-diagrams/
```

### 🔌 Local Port Configuration (SOLVED)  
**Problem**: Need to configure ports when running Node.js server locally

**Solution**: Use environment variables:
```bash
# Set ports and start
export PORT=3001
export KROKI_URL=http://localhost:8000
node dist/index.js
```

**MCP Client Configuration**:
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

## Installation Issues

### Node.js Version Problems
**Problem**: Build or runtime errors related to Node.js version
```
Error: Unsupported Node.js version
```

**Solution**: 
- Ensure Node.js 18.0 or higher is installed
- Check version: `node --version`
- Update Node.js if needed: [nodejs.org](https://nodejs.org/)

### NPM Installation Failures
**Problem**: Dependencies fail to install
```
npm ERR! Failed to install dependencies
```

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use yarn as alternative
yarn install
```

### Build Failures
**Problem**: TypeScript compilation errors
```
error TS2307: Cannot find module
```

**Solutions**:
```bash
# Clean build artifacts
npm run clean

# Reinstall dependencies
npm install

# Rebuild project
npm run build
```

## Docker Issues

### Port Conflicts
**Problem**: Docker services fail to start due to port conflicts
```
Error: Port 3000 is already in use
```

**Solutions**:
```bash
# Check what's using the port
lsof -i :3000

# Kill the process using the port
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different external port
```

### Kroki Service Unavailable
**Problem**: Diagram rendering fails with Kroki errors
```
Error: Kroki service unavailable
```

**Solutions**:
```bash
# Check Kroki service status
docker-compose logs kroki

# Restart Kroki service
docker-compose restart kroki

# Check Kroki health
curl http://localhost:8000/health

# Use external Kroki as fallback
export KROKI_URL=https://kroki.io
```

### Memory Issues
**Problem**: Services crash due to insufficient memory
```
Error: Container killed due to memory limit
```

**Solutions**:
```yaml
# Increase memory limits in docker-compose.yml
services:
  diagram-bridge-mcp:
    mem_limit: 1g
  kroki:
    mem_limit: 2g
```

### Service Connectivity Issues
**Problem**: Services cannot communicate
```
Error: Connection refused to kroki:8000
```

**Solutions**:
```bash
# Check Docker network
docker network ls
docker network inspect diagram-bridge-mcp_default

# Restart all services
docker-compose down && docker-compose up -d

# Check service logs
docker-compose logs --tail=50
```

## Runtime Issues

### Diagram Rendering Failures

#### Syntax Errors
**Problem**: Invalid diagram syntax
```json
{
  "error": "Invalid diagram syntax",
  "error_type": "SYNTAX_ERROR"
}
```

**Solutions**:
- Verify diagram syntax matches the format requirements
- Check examples in the [API Reference](api-reference.md)
- Use format-specific instructions from `get_diagram_instructions`
- Test with minimal examples first

#### Unsupported Formats
**Problem**: Format not recognized
```json
{
  "error": "Unsupported diagram format: 'unknown'",
  "error_type": "FORMAT_ERROR"
}
```

**Solutions**:
- Check supported formats list in [API Reference](api-reference.md)
- Use correct format identifiers (e.g., `mermaid`, `plantuml`, `c4-plantuml`)
- Verify spelling of format names

#### Timeout Errors
**Problem**: Rendering takes too long
```json
{
  "error": "Request timeout after 30 seconds",
  "error_type": "TIMEOUT_ERROR"
}
```

**Solutions**:
- Simplify complex diagrams
- Check Kroki service health: `curl http://localhost:8000/health`
- Verify network connectivity to Kroki
- Split large diagrams into smaller components

### Storage Issues

#### File Permission Errors
**Problem**: Cannot save rendered diagrams
```
Error: EACCES: permission denied, open '/path/to/diagram.png'
```

**Solutions**:
```bash
# Check directory permissions
ls -la /path/to/generated-diagrams/

# Fix permissions
chmod 755 /path/to/generated-diagrams/
chown $USER:$USER /path/to/generated-diagrams/

# Use custom storage path
export DIAGRAM_STORAGE_PATH="/tmp/diagrams"
```

#### Disk Space Issues
**Problem**: No space left on device
```
Error: ENOSPC: no space left on device
```

**Solutions**:
```bash
# Check disk space
df -h

# Clean old diagram files
find /path/to/generated-diagrams/ -type f -mtime +7 -delete

# Configure automatic cleanup in environment
export DIAGRAM_CLEANUP_DAYS=3
```

## MCP Integration Issues

### Cursor Configuration Problems
**Problem**: MCP server doesn't appear in Cursor
```
MCP server failed to start
```

**Solutions**:
1. **Check Cursor settings syntax**:
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/absolute/path/to/diagram-bridge-mcp"
    }
  }
}
```

2. **Verify absolute paths**:
```bash
# Get absolute path
pwd
# Use this full path in Cursor config
```

3. **Check server startup**:
```bash
# Test server manually
cd /path/to/diagram-bridge-mcp
npm start
```

### Tool Not Available
**Problem**: MCP tools don't appear in LLM interface
```
Tool 'help_choose_diagram' not found
```

**Solutions**:
- Restart Cursor/VS Code
- Check MCP server logs for errors
- Verify server is running: `ps aux | grep diagram-bridge`
- Test with manual MCP connection

### Communication Errors
**Problem**: MCP communication failures
```
Error: JSON-RPC communication failed
```

**Solutions**:
- Check server logs: `npm start` and look for errors
- Verify JSON-RPC protocol compliance
- Restart MCP client (Cursor/VS Code)
- Test with minimal MCP requests

## Performance Issues

### Slow Response Times
**Problem**: Operations take too long

**Diagnosis**:
```bash
# Check system resources
top
htop
free -h

# Monitor server logs with timestamps
npm start | ts '[%Y-%m-%d %H:%M:%S]'
```

**Solutions**:
- Check Kroki service health and response times
- Monitor response times via metrics endpoints
- Optimize diagram complexity
- Consider local Kroki deployment for better performance

### Memory Consumption
**Problem**: High memory usage

**Solutions**:
```bash
# Monitor memory usage
ps aux | grep diagram-bridge

# Check for memory leaks in logs
npm start | grep -i "memory\|heap"

# Restart service if needed
docker-compose restart diagram-bridge-mcp
```

## Debugging Techniques

### Enable Debug Logging
```bash
# Enable detailed logging
export LOG_LEVEL=debug
npm start
```

### Docker Service Debugging
```bash
# View logs for all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f diagram-bridge-mcp

# Check service health
docker-compose ps
```

### Manual Testing
```bash
# Test MCP tools manually (if MCP client available)
echo '{"method": "tools/list"}' | mcp-client

# Test Kroki directly
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"diagram_format": "mermaid", "code": "graph TD; A-->B"}' \
  http://localhost:8000/render
```

### Network Debugging
```bash
# Test network connectivity
ping kroki
nslookup kroki

# Check port accessibility
telnet localhost 8000
nc -zv localhost 8000
```

## Getting Help

### Log Collection
When reporting issues, include:

1. **Error messages** with full stack traces
2. **System information**: OS, Node.js version, Docker version
3. **Configuration**: Environment variables, Docker Compose setup
4. **Reproduction steps**: Minimal example that reproduces the issue

### Useful Commands for Support
```bash
# System information
node --version
npm --version
docker --version
docker-compose --version

# Service status
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:8000/health

# Recent logs
docker-compose logs --tail=100 diagram-bridge-mcp
```

### Community Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check all docs files for detailed information
- **Examples**: Review test files for usage examples

### Known Issues

1. **SVG Support**: Some diagram formats may have limited SVG support
2. **Large Diagrams**: Very complex diagrams may hit Kroki timeout limits
3. **Windows Paths**: Use forward slashes in configuration paths on Windows
4. **Docker on Apple Silicon**: Some services may need platform specification
