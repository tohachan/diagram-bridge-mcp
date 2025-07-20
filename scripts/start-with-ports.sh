#!/bin/bash

# Diagram Bridge MCP Server - Port Configuration Helper
# This script helps you easily start the server with custom ports

set -e

DEFAULT_PORT=3000
DEFAULT_KROKI_PORT=8000

echo "🚀 Diagram Bridge MCP Server - Port Configuration"
echo "================================================="

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Get user input for ports
read -p "Enter MCP Server port (default: $DEFAULT_PORT): " MCP_PORT
read -p "Enter Kroki service port (default: $DEFAULT_KROKI_PORT): " KROKI_PORT

# Use defaults if empty
MCP_PORT=${MCP_PORT:-$DEFAULT_PORT}
KROKI_PORT=${KROKI_PORT:-$DEFAULT_KROKI_PORT}

echo ""
echo "📋 Configuration Summary:"
echo "  MCP Server port: $MCP_PORT"
echo "  Kroki service port: $KROKI_PORT"
echo ""

# Check if ports are available
echo "🔍 Checking port availability..."
if ! check_port $MCP_PORT; then
    echo "Please choose a different port for MCP Server"
    exit 1
fi

if ! check_port $KROKI_PORT; then
    echo "Please choose a different port for Kroki service"
    exit 1
fi

echo ""
echo "🛠️  Starting services with custom ports..."

# Export environment variables and start docker-compose
export PORT=$MCP_PORT
export KROKI_PORT=$KROKI_PORT

echo "Environment variables set:"
echo "  PORT=$PORT"
echo "  KROKI_PORT=$KROKI_PORT"
echo ""

# Start docker-compose
echo "🚀 Running: docker-compose up --build"
docker-compose up --build

echo ""
echo "🎉 Services started successfully!"
echo "📍 Access points:"
echo "  MCP Server: http://localhost:$MCP_PORT"
echo "  Kroki Service: http://localhost:$KROKI_PORT"
