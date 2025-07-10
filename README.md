# Diagram Bridge MCP Server

A comprehensive MCP server that provides intelligent diagram format selection AND complete diagram rendering capabilities. From format selection to final image generation - all in one place.

## 🚀 Overview

This MCP (Model Context Protocol) server provides a complete diagram workflow solution:

1. **Intelligent Format Selection** - AI-powered analysis to recommend the best diagram format
2. **Format-Specific Instructions** - Generated prompts to help LLMs create correct diagram code  
3. **High-Quality Rendering** - Direct integration with Kroki for professional diagram rendering

Perfect for LLMs that need to create diagrams but don't know which format to use or how to render them.

## ✨ Features

### 🧠 Intelligent Format Selection
- **Smart Analysis**: AI-powered keyword analysis and context detection
- **Format Recommendations**: Confidence-based scoring for optimal format selection
- **Constraint Support**: Works with available format limitations

### 🎨 Professional Diagram Rendering  
- **Kroki Integration**: High-quality rendering via self-hosted or public Kroki service
- **Multiple Output Formats**: PNG and SVG support for all diagram types
- **Performance Optimized**: LRU caching and <2 second response times
- **Error Handling**: Comprehensive error classification and retry logic

### 🛠️ Developer Experience
- **Complete MCP Compliance**: Full Model Context Protocol specification support
- **TypeScript**: Complete type safety and modern development experience
- **Docker Ready**: Production-ready containerization with full stack setup
- **Health Monitoring**: Built-in health checks and performance metrics
- **Input Validation**: Robust parameter validation and sanitization

### 🔧 Infrastructure
- **Scalable Architecture**: Microservice-ready with proper separation of concerns
- **Caching Layer**: LRU cache for performance optimization
- **Monitoring**: Comprehensive metrics and debugging capabilities
- **Security**: Input sanitization and malicious content detection

## 🎯 Supported Diagram Formats

| Format | Best For | Strengths |
|--------|----------|-----------|
| **Mermaid** | Flowcharts, sequences, user journeys | Easy syntax, GitHub support, live editing |
| **PlantUML** | UML diagrams, software architecture | Complete UML support, professional output |
| **D2** | System architecture, infrastructure | Modern syntax, automatic layouts |
| **GraphViz** | Complex graphs, dependencies | Precise layouts, mathematical precision |
| **ERD** | Database schemas, entity relationships | Database-specific features, cardinality specs |

## 🛠️ Installation

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd diagram-bridge-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the complete stack with diagram rendering capabilities:

```bash
# Clone the repository
git clone <repository-url>
cd diagram-bridge-mcp

# Start the complete stack (MCP server + Kroki services)
docker-compose up -d

# Check the status
docker-compose ps

# View logs
docker-compose logs -f diagram-bridge-mcp
```

The server will be available at `http://localhost:3000` with full diagram rendering capabilities.

### Development Setup

For development with hot reload:

```bash
# Start with external Kroki (uses public kroki.io)
docker-compose -f docker-compose.dev.yml up -d

# Or with local Kroki service
docker-compose -f docker-compose.dev.yml --profile local-kroki up -d
```

### Production Deployment

#### Option 1: Full Stack with Local Kroki
```bash
# Production setup with all services
docker-compose up -d

# Includes:
# - diagram-bridge-mcp (main server)
# - kroki (diagram rendering service)  
# - mermaid, blockdiag, bpmn, excalidraw (rendering engines)
```

#### Option 2: Standalone with External Kroki
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

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3000` | Server port |
| `KROKI_URL` | `https://kroki.io` | Kroki service URL |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |

### Docker Services Overview

#### Complete Stack (`docker-compose.yml`)
- **diagram-bridge-mcp**: Main MCP server
- **kroki**: Core diagram rendering service
- **mermaid**: Mermaid diagram rendering engine
- **blockdiag**: BlockDiag family diagram engine
- **bpmn**: BPMN diagram rendering engine  
- **excalidraw**: Excalidraw diagram rendering engine

#### Service URLs
- MCP Server: `http://localhost:3000`
- Kroki Service: `http://localhost:8000`
- Health Check: `http://localhost:3000/health` (when implemented)

### Health Monitoring

```bash
# Check service health
curl http://localhost:3000/health

# Get metrics
curl http://localhost:3000/metrics

# Check Kroki connectivity
curl http://localhost:8000/health
```

### Troubleshooting

**Common Issues:**

1. **Port conflicts**: Change ports in docker-compose.yml or use environment variables
2. **Kroki service unavailable**: Check `docker-compose logs kroki`
3. **Memory issues**: Adjust container limits in docker-compose.yml
4. **Slow rendering**: Check cache settings and Kroki service health

**Debug Commands:**
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

## 📖 Usage

### As an MCP Server

The server provides comprehensive MCP capabilities for the complete diagram workflow:

#### Tools
- `help_choose_diagram`: Generate structured prompts for diagram format selection
- `get_diagram_instructions`: Generate format-specific instruction prompts for diagram code creation
- `render_diagram`: Render diagram source code into images via Kroki service

#### Resources
- `diagram_selection_health`: Health check for diagram selection service
- `diagram_selection_metrics`: Performance metrics for format selection
- `diagram_format_catalog`: Complete catalog of supported formats
- `diagram_instructions_health`: Health check for diagram instructions service  
- `diagram_instructions_metrics`: Performance metrics for instruction generation
- `diagram_rendering_health`: Health check for diagram rendering service
- `diagram_rendering_metrics`: Performance metrics for diagram rendering (cache stats, Kroki connectivity)

#### Adding to Cursor

To use this MCP server with Cursor, add the following configuration to your Cursor settings:

**Option 1: Using npm start (Development)**
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
```bash
# First, install globally
npm install -g diagram-bridge-mcp

# Then use in Cursor config:
```
```json
{
  "mcpServers": {
    "diagram-bridge": {
      "command": "diagram-bridge-mcp"
    }
  }
}
```

Replace `/path/to/diagram-bridge-mcp` with the actual path to your cloned repository.

### Example Usage

#### 1. Format Selection (help_choose_diagram)
```json
{
  "user_request": "I need to visualize the authentication flow in my web application"
}
```

#### 2. Format Selection with Constraints  
```json
{
  "user_request": "Create a database schema for an e-commerce system",
  "available_formats": ["erd", "plantuml"]
}
```

#### 3. Get Format-Specific Instructions (get_diagram_instructions)
```json
{
  "user_request": "Create a user authentication sequence diagram",
  "diagram_format": "mermaid"
}
```

#### 4. Render Diagram to Image (render_diagram)
```json
{
  "code": "flowchart TD\n    A[User] --> B{Login?}\n    B -->|Yes| C[Dashboard]\n    B -->|No| D[Register]",
  "diagram_format": "mermaid",
  "output_format": "png"
}
```

#### 5. Complete Workflow Example
```json
// Step 1: Choose format
{"user_request": "API authentication flow"}

// Step 2: Get instructions for chosen format  
{"user_request": "API authentication flow", "diagram_format": "mermaid"}

// Step 3: Render the generated diagram code
{
  "code": "sequenceDiagram\n    Client->>API: Login Request\n    API->>Client: JWT Token",
  "diagram_format": "mermaid",
  "output_format": "svg"
}
```

#### Response Examples

**Format Selection Response:**
```text
# Diagram Format Selection Assistant

You are an expert in diagram formats and data visualization...

## User Request
I need to visualize the authentication flow in my web application

## Available Formats
Mermaid, PlantUML, D2, GraphViz, ERD

## Format Analysis
[Detailed analysis of each format...]

## Selection Recommendations
### AI Analysis Recommendations
Based on keyword analysis:
- Mermaid (Confidence: 90%): Excellent for sequence diagrams and API flows
- PlantUML (Confidence: 75%): Good for complex authentication workflows

## Your Task
[Instructions for the LLM to make the final recommendation...]
```

**Diagram Rendering Response:**
```json
{
  "image_data": "iVBORw0KGgoAAAANSUhEUgAAA...", 
  "content_type": "image/png",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Invalid diagram syntax: Expected 'flowchart' but found 'flowchar'",
  "error_type": "SYNTAX_ERROR", 
  "retryable": false,
  "success": false
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- Input validation tests
- Format selection analysis tests
- Template generation tests
- End-to-end integration tests
- Health check and metrics tests

Test coverage includes 19 test cases covering all major functionality.

## 🔧 Development

### Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Run in development mode with auto-reload
- `npm start`: Start the production server
- `npm test`: Run the test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run clean`: Clean build artifacts

### Project Structure

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
│   └── diagram-selection.test.ts
└── index.ts           # Main server entry point
```

## 🧠 How It Works

### 1. Request Analysis
The server analyzes user requests using keyword-based heuristics to identify:
- Domain context (database, API, architecture, etc.)
- Diagram type hints (sequence, class, flow, etc.)
- Explicit format preferences
- Complexity indicators

### 2. Format Scoring
Each format receives a confidence score based on:
- Keyword matches in the user request
- Format strengths and capabilities
- Use case alignment
- Available format constraints

### 3. Prompt Generation
The template engine creates structured prompts that include:
- User request context
- Available format options
- Detailed format analysis
- AI-generated recommendations
- Clear decision framework

### 4. LLM Integration
The generated prompt provides LLMs with:
- Comprehensive format knowledge
- Decision-making criteria
- Structured response format
- Reasoning guidelines

## ⚙️ Configuration

### Environment Variables

- `PORT`: HTTP server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Format Customization

Extend the format definitions in `src/resources/diagram-selection-config.ts` to:
- Add new diagram formats
- Customize format characteristics
- Adjust selection heuristics
- Modify format descriptions

## 🔍 API Reference

### MCP Tool: help_choose_diagram

**Input Schema:**
```typescript
{
  user_request: string;        // Required: User's visualization request
  available_formats?: string[]; // Optional: Subset of supported formats
}
```

**Output Schema:**
```typescript
{
  prompt_text: string;         // Generated structured prompt
}
```

### MCP Tool: get_diagram_instructions

**Input Schema:**
```typescript
{
  user_request: string;        // Required: Original diagram request
  diagram_format: string;      // Required: Target format (mermaid|plantuml|d2|graphviz|erd)
}
```

**Output Schema:**
```typescript
{
  prompt_text: string;         // Format-specific instruction prompt
}
```

### MCP Tool: render_diagram

**Input Schema:**
```typescript
{
  code: string;               // Required: Diagram source code (1-100,000 chars)
  diagram_format: string;     // Required: Format (mermaid|plantuml|d2|graphviz|erd)
  output_format?: string;     // Optional: Output format (png|svg, default: png)
}
```

**Output Schema:**
```typescript
{
  image_data: string;         // Base64 encoded image data
  content_type: string;       // MIME type (image/png | image/svg+xml)
  success: boolean;           // Rendering success status
}
```

**Error Response:**
```typescript
{
  error: string;              // Error message
  error_type: string;         // Error classification
  retryable: boolean;         // Whether error is retryable
  success: false;             // Always false for errors
}
```

### Health Check Resource

**Endpoint:** `diagram_selection_health`
**Response:** System health status and component checks

### Metrics Resource

**Endpoint:** `diagram_selection_metrics`
**Response:** Performance metrics and usage statistics

### Format Catalog Resource

**Endpoint:** `diagram_format_catalog`
**Response:** Complete catalog of supported formats

## 🔒 Security

- Input validation and sanitization
- Malicious content detection
- Parameter length limits
- Format whitelist validation
- Error message sanitization

## 📊 Performance

### Format Selection & Instructions
- Response time target: <100ms for format analysis
- Memory efficient processing with optimized algorithms
- Caching of format definitions and templates
- Optimized template rendering pipeline

### Diagram Rendering  
- Response time target: <2 seconds for diagram rendering
- LRU caching for identical diagram requests
- Efficient Base64 encoding/decoding
- Retry logic with exponential backoff
- Memory optimization for container deployment

### Infrastructure
- Health checks and monitoring endpoints
- Comprehensive error handling and classification
- Resource usage optimization
- Concurrent request handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol) - The official MCP specification
- [Mermaid](https://mermaid.js.org/) - Diagram and flowchart generation
- [PlantUML](https://plantuml.com/) - UML diagram generation
- [D2](https://d2lang.com/) - Modern diagram scripting language
- [GraphViz](https://graphviz.org/) - Graph visualization software

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Check the documentation
- Review existing discussions

---

**Made with ❤️ for the LLM and diagram generation community**
