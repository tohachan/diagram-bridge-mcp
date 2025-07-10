/**
 * MCP Tool Schema Definition for render_diagram
 * Following MCP specification for Tool resources
 */

export const RENDER_DIAGRAM_SCHEMA = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: "The source code of the diagram to render",
      minLength: 1,
      maxLength: 100000,
      examples: [
        "flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]",
        "@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml",
        "users -> database: query\ndatabase -> users: results"
      ]
    },
    diagram_format: {
      type: "string",
      description: "The format of the diagram source code",
      enum: ["mermaid", "plantuml", "d2", "graphviz", "erd"],
      examples: ["mermaid", "plantuml", "d2"]
    },
    output_format: {
      type: "string",
      description: "The desired output image format (defaults to the first supported format for the diagram type: PNG for most formats, SVG for D2)",
      enum: ["png", "svg"],
      examples: ["png", "svg"]
    }
  },
  required: ["code", "diagram_format"],
  additionalProperties: false
} as const;

export const RENDER_DIAGRAM_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    image_data: {
      type: "string",
      description: "Base64 encoded image data",
      minLength: 100
    },
    content_type: {
      type: "string",
      description: "MIME type of the output image",
      enum: ["image/png", "image/svg+xml"],
      examples: ["image/png", "image/svg+xml"]
    }
  },
  required: ["image_data", "content_type"],
  additionalProperties: false
} as const;

/**
 * Complete MCP Tool Definition
 */
export const RENDER_DIAGRAM_TOOL = {
  name: "render_diagram",
  title: "Render Diagram",
  description: "Render diagram source code into an image using Kroki service",
  
  // Input validation schema
  inputSchema: RENDER_DIAGRAM_SCHEMA,
  
  // Output format schema
  outputSchema: RENDER_DIAGRAM_OUTPUT_SCHEMA,
  
  // Tool metadata
  metadata: {
    version: "1.0.0",
    author: "diagram-bridge-mcp",
    tags: ["diagram", "rendering", "kroki", "visualization", "image"],
    category: "diagram-generation"
  }
} as const;

/**
 * MCP Resource Configuration for render_diagram tool
 */
export const DIAGRAM_RENDERING_RESOURCE_CONFIG = {
  name: 'render_diagram',
  description: 'Renders diagram source code into images via Kroki service with comprehensive error handling and performance optimization',
  
  // Resource behavior documentation
  behavior: {
    input: {
      required: ['code', 'diagram_format'],
      optional: ['output_format'],
      validation: {
        code: {
          type: 'string',
          minLength: 1,
          maxLength: 100000,
          description: 'Must be valid diagram source code'
        },
        diagram_format: {
          type: 'string',
          enum: ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'],
          description: 'Must be a supported diagram format'
        },
        output_format: {
          type: 'string',
          enum: ['png', 'svg'],
          default: 'png',
          description: 'Must be a supported output format'
        }
      }
    },
    
    output: {
      format: 'rendered_image',
      content: {
        image_data: {
          type: 'string',
          description: 'Base64 encoded image data ready for display'
        },
        content_type: {
          type: 'string',
          description: 'MIME type for proper image handling'
        }
      }
    }
  },
  
  // Resource constraints
  constraints: {
    performance: {
      maxResponseTime: '2000ms',
      description: 'Tool must respond within 2 seconds for optimal user experience'
    },
    
    reliability: {
      errorHandling: 'comprehensive_error_classification',
      fallback: 'detailed_error_messages',
      description: 'Must handle Kroki failures, syntax errors, and network issues gracefully'
    },
    
    compatibility: {
      mcpVersion: '>=1.0.0',
      nodeVersion: '>=18.0.0',
      description: 'Compatible with MCP specification 1.0+ and Node.js 18+'
    }
  },
  
  // Cache configuration
  caching: {
    enabled: true,
    strategy: 'lru',
    maxSize: 100,
    ttl: 3600000, // 1 hour
    description: 'LRU cache for identical diagram rendering requests'
  }
} as const; 