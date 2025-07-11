/**
 * MCP Resource Schema Definition for help_choose_diagram
 * Following MCP specification for Prompt resources
 */

export const HELP_CHOOSE_DIAGRAM_SCHEMA = {
  type: "object",
  properties: {
    user_request: {
      type: "string",
      description: "User's visualization request describing what they want to diagram",
      minLength: 5,
      maxLength: 1000,
      examples: [
        "I need to show the authentication flow in my web application",
        "Create a database schema diagram for an e-commerce system",
        "Visualize the microservices architecture of our platform"
      ]
    },
    available_formats: {
      type: "array",
      description: "Optional array of available diagram formats to choose from",
      items: {
        type: "string",
        enum: ["mermaid", "plantuml", "d2", "graphviz", "erd", "bpmn", "c4-plantuml", "structurizr", "excalidraw", "vega-lite"]
      },
      uniqueItems: true,
      examples: [
        ["mermaid", "plantuml"],
        ["d2", "graphviz"],
        ["erd"]
      ]
    }
  },
  required: ["user_request"],
  additionalProperties: false
} as const;

export const HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    prompt_text: {
      type: "string",
      description: "Constructed prompt text for the LLM to help choose the best diagram format",
      minLength: 100
    }
  },
  required: ["prompt_text"],
  additionalProperties: false
} as const;

/**
 * Complete MCP Resource Definition
 */
export const HELP_CHOOSE_DIAGRAM_RESOURCE = {
  uri: "help_choose_diagram",
  name: "Diagram Format Selection Helper",
  description: "Provides a structured prompt to help LLMs choose the most appropriate diagram format for a given user request",
  mimeType: "text/plain",
  
  // Input validation schema
  inputSchema: HELP_CHOOSE_DIAGRAM_SCHEMA,
  
  // Output format schema
  outputSchema: HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA,
  
  // Resource metadata
  metadata: {
    version: "1.0.0",
    author: "diagram-bridge-mcp",
    tags: ["diagram", "selection", "prompt", "visualization"],
    category: "ai-assistance"
  }
} as const; 