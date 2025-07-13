# Diagram Bridge MCP Server

A comprehensive MCP server that bridges the gap between LLMs and diagram creation through three powerful, independent tools: **intelligent format selection**, **format-specific instruction generation**, and **professional diagram rendering** (using kroki server). Each tool can be used standalone or combined in sequence for complete diagram workflows - from choosing the right format to generating the final image.

**Supported Formats**: Mermaid, PlantUML, C4 Model, D2, GraphViz, BPMN, Structurizr, Excalidraw, Vega-Lite

![Demo](docs/diagram-briedge-mcp.gif)


## 🚀 Quick Start

1. **Prerequisites**:
   - Node.js 18.0 or higher
   - Docker and Docker Compose

2. **Install and build**:
```bash
git clone git@github.com:tohachan/diagram-bridge-mcp.git
cd diagram-bridge-mcp
npm install && npm run build
```

3. **Start services**:
```bash
docker-compose up --build
```

4. **Add to Cursor** (or any MCP client):
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

5. **Start using**: The server provides three MCP tools ready for use!

## 💡 Usage Example

Here's a simple prompt to demonstrate the complete workflow:

```
"Choose the best diagram format for visualizing a current project architecture, then generate the diagram code and render it to an image file. Save the result as 'architecture-diagram'."
```

This single prompt will:
1. **Analyze your request** and recommend the optimal format
2. **Get specific instructions** for creating the diagram in that format
3. **Create and render** the final diagram to a PNG/SVG file

## 🎨 Examples Gallery

Want to see what's possible? Check out **[Examples Gallery](docs/examples.md)**

## 🛠️ Tools Overview

### `help_choose_diagram`
**Purpose**: Intelligent format selection based on your requirements

- Analyzes your request using AI-powered heuristics
- Provides confidence-scored recommendations  
- Works with format constraints when needed
- Generates structured prompts for optimal LLM decision-making

**Example**: "I need to show database relationships" → Recommends Mermaid ER diagram format with detailed reasoning

### `get_diagram_instructions`  
**Purpose**: Generate format-specific coding instructions

- Creates tailored prompts for any supported diagram format
- Includes syntax guidelines, best practices, and common pitfalls
- Provides working examples and output specifications
- Ensures LLMs generate syntactically correct diagram code

**Example**: For Mermaid format → Detailed Mermaid syntax guide with examples

### `render_diagram`
**Purpose**: Transform diagram code into professional images

- Renders diagrams via integrated Kroki service  
- Supports PNG and SVG output formats
- Includes intelligent caching for performance
- Provides file storage with absolute paths for easy access

**Example**: Mermaid code → High-quality PNG/SVG image file

## ⚙️ Configuration

### Basic Setup
- **Default storage**: `{project-root}/generated-diagrams/`
- **Default Kroki**: Uses local Docker Kroki service
- **Default port**: 3000

For advanced configuration, see our [Configuration Guide](docs/configuration.md).

## 📚 Documentation

- **[Installation Guide](docs/installation.md)** - Detailed setup instructions
- **[Docker Deployment](docs/docker-deployment.md)** - Container deployment options  
- **[API Reference](docs/api-reference.md)** - Complete tool and resource documentation
- **[Configuration Guide](docs/configuration.md)** - Environment variables and customization
- **[Development Guide](docs/development.md)** - Contributing and development setup
- **[Architecture](docs/architecture.md)** - System architecture and design patterns
- **[Performance & Security](docs/performance.md)** - Performance metrics and security features  
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

---

**Perfect for**: LLMs that need to create diagrams but don't know which format to use or how to render them professionally.

**Powered by**: [Kroki](https://kroki.io) - Universal diagram rendering service

**Made with ❤️**
