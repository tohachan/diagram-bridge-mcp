# Development Guide

Complete guide for developing and contributing to the Diagram Bridge MCP Server.

## Development Setup

### Prerequisites
- Node.js 18.0 or higher
- Docker and Docker Compose (for integration testing)
- Git

### Getting Started
```bash
# Clone and setup
git clone <repository-url>
cd diagram-bridge-mcp
npm install

# Development mode with auto-reload
npm run dev

# Build the project
npm run build

# Start production server
npm start
```

## Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Run in development mode with auto-reload
- `npm start`: Start the production server
- `npm test`: Run the test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run clean`: Clean build artifacts

## Project Structure

```
src/
├── types/              # TypeScript type definitions
│   └── diagram-selection.ts
├── resources/          # MCP resource configurations
│   ├── diagram-selection-config.ts
│   ├── diagram-selection-handler.ts
│   └── diagram-selection-schema.ts
├── templates/          # Prompt template engine
│   └── prompt-template.ts
├── utils/              # Utility functions
│   ├── selection-heuristics.ts
│   └── validation.ts
├── __tests__/          # Test files
│   ├── diagram-selection.test.ts    # Unit tests for format selection
│   └── docker-rendering.test.ts     # Docker integration tests for all formats
└── index.ts           # Main server entry point
```

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run specific unit tests
npm test -- src/__tests__/diagram-selection.test.ts

# Run tests in watch mode
npm run test:watch
```

### Docker Integration Tests
```bash
# Start Docker environment with all Kroki services
docker-compose up -d

# Run Docker integration tests (requires Docker to be running)
npm test -- src/__tests__/docker-rendering.test.ts

# Run with verbose output to see detailed test results
npm test -- src/__tests__/docker-rendering.test.ts --verbose
```

**What the Docker tests cover:**
- ✅ All 12+ diagram formats with actual Kroki rendering
- ✅ PNG and SVG output validation (where supported)
- ✅ Health checks for Kroki service connectivity
- ✅ Format-specific rendering with example diagrams
- ✅ Comprehensive format validation against real Kroki API
- ✅ Performance and reliability testing
- ✅ Error handling and edge cases

### Test Coverage
Combined test coverage includes 34+ test cases covering all functionality from format selection to diagram rendering:

**Unit Tests (19 test cases):**
- Input validation tests
- Format selection analysis tests
- Template generation tests
- Health check and metrics tests

**Docker Integration Tests (15 test cases):**
- Real diagram rendering through Kroki services
- All diagram formats validation
- PNG/SVG output format testing
- Performance and reliability testing

## Architecture Overview

The Diagram Bridge MCP Server follows a clean, modular architecture:

### Core Components
1. **Format Selection Handler** - Analyzes requests and recommends formats
2. **Instructions Generator** - Creates format-specific coding instructions
3. **Diagram Renderer** - Renders diagrams via Kroki integration
4. **Health Monitoring** - Tracks system health and performance

### Design Patterns
- **Pipeline Architecture** - Sequential processing of diagram workflow
- **Resource Pattern** - MCP resource management for health and metrics
- **Template Engine** - Dynamic prompt generation for LLMs
- **Caching Layer** - LRU cache for performance optimization

## Contributing Guidelines

### Code Style
- Follow existing TypeScript patterns
- Use proper type definitions
- Maintain comprehensive error handling
- Add tests for new functionality

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

### Adding New Diagram Formats

To add a new diagram format:

1. **Update format configuration** in `src/resources/diagram-selection-config.ts`:
```typescript
newformat: {
  name: 'newformat',
  displayName: 'New Format',
  description: 'Format description',
  strengths: ['Strength 1'],
  weaknesses: ['Weakness 1'],
  bestFor: ['Use case 1'],
  examples: ['Example 1']
}
```

2. **Add instruction template** in `src/resources/diagram-instructions-config.ts`:
```typescript
newformat: {
  format: 'newformat',
  displayName: 'New Format',
  syntaxGuidelines: ['Guideline 1'],
  bestPractices: ['Practice 1'],
  commonPitfalls: ['Pitfall 1'],
  examplePatterns: ['Example code'],
  outputSpecifications: ['Spec 1']
}
```

3. **Add tests** in `src/__tests__/` for the new format
4. **Update documentation** as needed

## Debugging

### Development Debugging
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev
```

### Docker Debugging
```bash
# View all service logs
docker-compose logs

# Check specific service
docker-compose logs diagram-bridge-mcp

# Restart services
docker-compose restart
```

### Common Development Issues

1. **Build failures**: Clear dist and rebuild: `npm run clean && npm run build`
2. **Test failures**: Ensure Docker services are running for integration tests
3. **Type errors**: Check TypeScript configuration in `tsconfig.json`
4. **Performance issues**: Review caching implementation and Kroki connectivity

## Performance Monitoring

### Local Metrics
- Response time tracking for all operations
- Cache hit/miss ratios
- Error rates and classifications
- Memory usage monitoring

### Health Checks
- Format selection service health
- Instruction generation service health
- Diagram rendering service health
- Kroki connectivity status

## Release Process

1. **Version bump**: Update version in `package.json`
2. **Test coverage**: Ensure all tests pass
3. **Documentation**: Update relevant documentation
4. **Docker**: Test Docker deployment
5. **Tag release**: Create Git tag for the version
