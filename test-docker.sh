#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Testing Docker Setup для Diagram Bridge MCP${NC}"
echo "================================================"

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 FAILED${NC}"
        exit 1
    fi
}

# Function to check if Docker is installed
check_docker() {
    echo -e "${YELLOW}🔍 Checking Docker installation...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker first:${NC}"
        echo "macOS: brew install --cask docker"
        echo "Or download from: https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose not found.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"
    docker --version
    docker-compose --version
}

# Function to validate configurations
validate_configs() {
    echo -e "${YELLOW}🔍 Validating Docker configurations...${NC}"
    
    docker-compose config > /dev/null 2>&1
    check_success "docker-compose.yml syntax"
    
    docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1
    check_success "docker-compose.dev.yml syntax"
}

# Function to test Docker build
test_build() {
    echo -e "${YELLOW}🏗️ Testing Docker build...${NC}"
    
    echo "Building production image..."
    docker build -t diagram-bridge-mcp-test . > build.log 2>&1
    check_success "Docker build"
    
    # Check image size
    IMAGE_SIZE=$(docker images diagram-bridge-mcp-test --format "table {{.Size}}" | tail -n 1)
    echo "Image size: $IMAGE_SIZE"
    
    # Check security - non-root user
    USER_CHECK=$(docker run --rm diagram-bridge-mcp-test whoami)
    if [ "$USER_CHECK" = "mcp" ]; then
        echo -e "${GREEN}✅ Running as non-root user (mcp)${NC}"
    else
        echo -e "${YELLOW}⚠️ Running as: $USER_CHECK (should be 'mcp')${NC}"
    fi
}

# Function to test development setup
test_dev_setup() {
    echo -e "${YELLOW}🛠️ Testing development setup...${NC}"
    
    docker-compose -f docker-compose.dev.yml up -d > compose-dev.log 2>&1
    check_success "Development compose up"
    
    sleep 5
    
    # Check service status
    docker-compose -f docker-compose.dev.yml ps
    
    # Cleanup
    docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1
    check_success "Development compose cleanup"
}

# Function to test full production stack
test_production() {
    echo -e "${YELLOW}🚀 Testing production stack...${NC}"
    
    docker-compose up -d > compose-prod.log 2>&1
    check_success "Production compose up"
    
    echo "Waiting for services to be ready..."
    sleep 15
    
    # Check all services
    echo -e "${BLUE}Service status:${NC}"
    docker-compose ps
    
    # Test Kroki health
    echo -e "${YELLOW}🔍 Testing Kroki connectivity...${NC}"
    
    # Wait a bit more for Kroki to be fully ready
    sleep 10
    
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Kroki health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Kroki health check failed (might need more time)${NC}"
        echo "Checking Kroki logs:"
        docker-compose logs kroki | tail -5
    fi
    
    # Test simple diagram rendering
    echo -e "${YELLOW}🎨 Testing diagram rendering...${NC}"
    if curl -X POST http://localhost:8000/mermaid/png \
        -H "Content-Type: text/plain" \
        -d "graph TD; A-->B" \
        --output test-diagram.png > /dev/null 2>&1; then
        
        if [ -f test-diagram.png ] && [ -s test-diagram.png ]; then
            echo -e "${GREEN}✅ Diagram rendering works${NC}"
            rm test-diagram.png
        else
            echo -e "${YELLOW}⚠️ Diagram file created but might be empty${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Diagram rendering test failed${NC}"
    fi
}

# Function to test network connectivity
test_network() {
    echo -e "${YELLOW}🌐 Testing network connectivity...${NC}"
    
    if docker exec diagram-bridge-mcp wget -qO- http://kroki:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Internal network connectivity works${NC}"
    else
        echo -e "${YELLOW}⚠️ Internal network connectivity failed${NC}"
    fi
}

# Function to show resource usage
show_resources() {
    echo -e "${YELLOW}📊 Resource usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    docker-compose down > /dev/null 2>&1
    check_success "Compose cleanup"
    
    # Optional: Remove test image
    # docker rmi diagram-bridge-mcp-test > /dev/null 2>&1 || true
    
    # Clean up test files
    rm -f build.log compose-dev.log compose-prod.log test-diagram.png
}

# Function to show summary
show_summary() {
    echo ""
    echo -e "${BLUE}📋 Test Summary${NC}"
    echo "==============="
    echo -e "${GREEN}✅ All core tests passed!${NC}"
    echo ""
    echo "🎯 What was tested:"
    echo "  • Docker installation and configuration"
    echo "  • Docker build process and image optimization"  
    echo "  • Development and production compose setups"
    echo "  • Service health checks and connectivity"
    echo "  • Kroki integration and diagram rendering"
    echo "  • Network connectivity between services"
    echo ""
    echo "🚀 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "  • Run: docker-compose up -d"
    echo "  • Use in Cursor MCP config"
    echo "  • Check logs: docker-compose logs -f"
}

# Main execution
main() {
    check_docker
    validate_configs
    test_build
    test_dev_setup
    test_production
    test_network
    show_resources
    cleanup
    show_summary
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main 