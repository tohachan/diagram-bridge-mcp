# API Reference

Complete API documentation for the Diagram Bridge MCP Server.

## MCP Tools

### help_choose_diagram

Generate structured prompts for diagram format selection based on user requirements.

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

**Example Request:**
```json
{
  "user_request": "I need to visualize the authentication flow in my web application"
}
```

**Example Request with Constraints:**
```json
{
  "user_request": "Create a database schema for an e-commerce system",
  "available_formats": ["erd", "plantuml", "c4"]
}
```

### get_diagram_instructions

Generate format-specific instruction prompts for diagram code creation.

**Input Schema:**
```typescript
{
  user_request: string;        // Required: Original diagram request
  diagram_format: string;      // Required: Target format (mermaid|plantuml|c4|d2|graphviz|erd|bpmn|structurizr|excalidraw|vega-lite)
}
```

**Output Schema:**
```typescript
{
  prompt_text: string;         // Format-specific instruction prompt
}
```

**Example Request:**
```json
{
  "user_request": "Create a microservices architecture diagram", 
  "diagram_format": "c4"
}
```

### render_diagram

Render diagram source code into images via Kroki service.

**Input Schema:**
```typescript
{
  code: string;               // Required: Diagram source code (1-100,000 chars)
  diagram_format: string;     // Required: Format (mermaid|plantuml|c4|d2|graphviz|erd|bpmn|structurizr|excalidraw|vega-lite)
  output_format?: string;     // Optional: Output format (png|svg, default: png)
}
```

**Output Schema:**
```typescript
{
  image_data: string;         // Base64 encoded image data
  content_type: string;       // MIME type (image/png | image/svg+xml)
  success: boolean;           // Rendering success status
  file_path?: string;         // Absolute path to saved file (when storage enabled)
  resource_uri?: string;      // MCP resource URI for file access
  file_size?: number;         // File size in bytes
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

**Example Request:**
```json
{
  "code": "flowchart TD\n    A[User] --> B{Login?}\n    B -->|Yes| C[Dashboard]\n    B -->|No| D[Register]",
  "diagram_format": "mermaid",
  "output_format": "png"
}
```

## MCP Resources

### Health Check Resources

#### diagram_selection_health
- **URI**: `health://diagram_selection`
- **Description**: Health check for diagram selection service
- **Response**: System health status and component checks

#### diagram_instructions_health
- **URI**: `health://diagram_instructions`
- **Description**: Health check for diagram instructions service
- **Response**: Service health status and template availability

#### diagram_rendering_health
- **URI**: `health://diagram_rendering`
- **Description**: Health check for diagram rendering service
- **Response**: Kroki connectivity and rendering service status

### Metrics Resources

#### diagram_selection_metrics
- **URI**: `metrics://diagram_selection`
- **Description**: Performance metrics for format selection
- **Response**: Selection performance statistics and usage metrics

#### diagram_instructions_metrics
- **URI**: `metrics://diagram_instructions`
- **Description**: Performance metrics for instruction generation
- **Response**: Template generation performance and usage statistics

#### diagram_rendering_metrics
- **URI**: `metrics://diagram_rendering`
- **Description**: Performance metrics for diagram rendering
- **Response**: Kroki connectivity, rendering performance, error rates

### Catalog Resources

#### diagram_format_catalog
- **URI**: `catalog://diagram_formats`
- **Description**: Complete catalog of supported formats
- **Response**: All supported diagram formats with their characteristics

### File Resources

#### saved_diagram_files
- **URI**: `diagram://saved/{filename}`
- **Description**: Access to rendered diagram files
- **Response**: Binary file content with appropriate MIME type

## Complete Workflow Example

Here's how to use all three tools in sequence:

```json
// Step 1: Choose format
{
  "tool": "help_choose_diagram",
  "arguments": {
    "user_request": "API authentication flow"
  }
}

// Step 2: Get instructions for chosen format  
{
  "tool": "get_diagram_instructions",
  "arguments": {
    "user_request": "API authentication flow", 
    "diagram_format": "mermaid"
  }
}

// Step 3: Render the generated diagram code
{
  "tool": "render_diagram",
  "arguments": {
    "code": "sequenceDiagram\n    Client->>API: Login Request\n    API->>Client: JWT Token",
    "diagram_format": "mermaid",
    "output_format": "svg"
  }
}
```

## Response Examples

### Format Selection Response
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

### Diagram Rendering Success Response
```json
{
  "success": true,
  "image_data": "iVBORw0KGgoAAAANSUhEUgAAA...", 
  "content_type": "image/png",
  "file_path": "/Users/you/projects/diagram-bridge-mcp/generated-diagrams/diagram-mermaid-1234567890.png",
  "resource_uri": "diagram://saved/diagram-mermaid-1234567890.png",
  "file_size": 45678,
  "message": "Diagram rendered successfully"
}
```

### Error Response Example
```json
{
  "error": "Invalid diagram syntax: Expected 'flowchart' but found 'flowchar'",
  "error_type": "SYNTAX_ERROR", 
  "retryable": false,
  "success": false
}
```

## Supported Diagram Formats

| Format | ID | Aliases | PNG | SVG |
|--------|----|---------|----|-----|
| Mermaid | `mermaid` | - | ✅ | ✅ |
| PlantUML | `plantuml` | - | ✅ | ✅ |
| C4 Model | `c4-plantuml` | `c4`, `c4plantuml` | ✅ | ✅ |
| D2 | `d2` | - | ✅ | ✅ |
| GraphViz | `graphviz` | `dot` | ✅ | ✅ |
| ERD | `erd` | - | ✅ | ✅ |
| BPMN | `bpmn` | - | ✅ | ✅ |
| Structurizr | `structurizr` | - | ✅ | ✅ |
| Excalidraw | `excalidraw` | - | ✅ | ✅ |
| Vega-Lite | `vega-lite` | `vegalite` | ✅ | ✅ |

## Error Types

| Error Type | Description | Retryable |
|------------|-------------|-----------|
| `SYNTAX_ERROR` | Invalid diagram syntax | No |
| `FORMAT_ERROR` | Unsupported diagram format | No |
| `KROKI_ERROR` | Kroki service unavailable | Yes |
| `TIMEOUT_ERROR` | Request timeout | Yes |
| `VALIDATION_ERROR` | Input validation failed | No |
| `STORAGE_ERROR` | File storage failed | Yes |

## Rate Limits and Constraints

- **Maximum code length**: 100,000 characters
- **Supported output formats**: PNG, SVG
- **Response timeout**: 30 seconds
- **File storage**: Automatic cleanup of old files
- **Concurrent requests**: No explicit limits (server capacity dependent)

## Security Considerations

- **Input sanitization**: All inputs are validated and sanitized
- **Content filtering**: Malicious content detection enabled
- **File safety**: Generated files are safely stored with controlled access
- **Error handling**: Safe error messages without system information leakage
