# Diagram Bridge MCP Server

A "bridge" MCP server with a unique Prompt+Tool design that helps LLMs seamlessly generate and render diagrams by automatically selecting the most appropriate diagram format.

## 🚀 Overview

This MCP (Model Context Protocol) server provides automated diagram format selection capabilities, helping LLMs choose the best diagramming format (Mermaid, PlantUML, D2, GraphViz, ERD) based on user requirements. It acts as an intelligent bridge between user requests and diagram generation tools.

## ✨ Features

- **Smart Format Selection**: AI-powered analysis to recommend the best diagram format
- **Comprehensive Format Support**: Supports 5 major diagram formats with detailed characteristics
- **Input Validation**: Robust parameter validation and sanitization
- **Template Engine**: Structured prompt generation for consistent LLM interactions
- **Health Monitoring**: Built-in health checks and performance metrics
- **MCP Compliant**: Full compliance with Model Context Protocol specification
- **TypeScript**: Complete type safety and modern development experience

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

## 📖 Usage

### As an MCP Server

The server provides the following MCP capabilities:

#### Resources
- `help_choose_diagram`: Main prompt resource for format selection
- `diagram_selection_health`: Health check endpoint
- `diagram_selection_metrics`: Performance metrics
- `diagram_format_catalog`: Complete format catalog

#### Tools
- `help_choose_diagram`: Generate structured prompts for diagram format selection

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

#### Basic Request
```json
{
  "user_request": "I need to visualize the authentication flow in my web application"
}
```

#### With Format Constraints
```json
{
  "user_request": "Create a database schema for an e-commerce system",
  "available_formats": ["erd", "plantuml"]
}
```

#### Response
The server returns a structured prompt that helps LLMs make informed decisions:

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

### MCP Resource: help_choose_diagram

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

- Response time target: <100ms
- Memory efficient processing
- Caching of format definitions
- Optimized template rendering
- Comprehensive error handling

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
