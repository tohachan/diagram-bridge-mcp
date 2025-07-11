/**
 * MCP Resource Schema Definition for get_diagram_instructions
 * Following MCP specification for Prompt resources
 */

export const GET_DIAGRAM_INSTRUCTIONS_SCHEMA = {
  type: "object",
  properties: {
    user_request: {
      type: "string",
      description: "Original natural language request from the user describing what diagram they want to create",
      minLength: 5,
      maxLength: 2000,
      examples: [
        "Create an authentication flow for my web application with OAuth integration",
        "Show database relationships for an e-commerce system with users, orders, and products",
        "Visualize microservices architecture with API gateway and service mesh"
      ]
    },
    diagram_format: {
      type: "string",
      description: "Target diagram language/format",
      enum: ["mermaid", "plantuml", "d2", "graphviz", "erd", "bpmn", "c4-plantuml", "structurizr", "excalidraw", "vega-lite"],
      examples: ["mermaid", "plantuml", "d2", "bpmn", "c4-plantuml"]
    }
  },
  required: ["user_request", "diagram_format"],
  additionalProperties: false
} as const;

/**
 * Output schema for the get_diagram_instructions resource
 */
export const GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    prompt_text: {
      type: "string",
      description: "Constructed instruction prompt for LLM to generate diagram code",
      minLength: 50
    }
  },
  required: ["prompt_text"],
  additionalProperties: false
} as const;

/**
 * Complete MCP Resource Definition
 */
export const GET_DIAGRAM_INSTRUCTIONS_RESOURCE = {
  uri: "get_diagram_instructions",
  name: "Diagram Code Generation Instructions",
  description: "Provides format-specific instruction prompts to help LLMs generate syntactically correct diagram code",
  mimeType: "text/plain",
  
  // Input validation schema
  inputSchema: GET_DIAGRAM_INSTRUCTIONS_SCHEMA,
  
  // Output format schema
  outputSchema: GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA,
  
  // Resource metadata
  metadata: {
    version: "1.0.0",
    author: "diagram-bridge-mcp",
    tags: ["diagram", "instructions", "code-generation", "template"],
    category: "ai-assistance"
  }
} as const; 