#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DiagramSelectionHandler } from './resources/diagram-selection-handler.js';
import { DiagramInstructionsHandler } from './resources/diagram-instructions-handler.js';
import { KrokiRenderingHandler, ProcessingError } from './resources/kroki-rendering-handler.js';

/**
 * Diagram Bridge MCP Server
 * Provides automated diagram format selection through intelligent heuristics
 */

// Initialize the handlers
const diagramHandler = new DiagramSelectionHandler();
const instructionsHandler = new DiagramInstructionsHandler();
const renderingHandler = new KrokiRenderingHandler();

// Create the MCP server
const server = new McpServer({
  name: 'diagram-bridge-mcp',
  version: '1.0.0',
});

// Register the main tool for diagram format selection
server.registerTool(
  'help_choose_diagram',
  {
    title: 'Help Choose Diagram Format',
    description: 'Generate structured prompts for automated diagram format selection based on user requirements',
    inputSchema: {
      user_request: z.string()
        .min(5, 'User request must be at least 5 characters')
        .max(1000, 'User request must not exceed 1000 characters')
        .describe('User\'s visualization request describing what they want to diagram'),
      available_formats: z.array(z.enum(['mermaid', 'plantuml', 'd2', 'graphviz', 'erd']))
        .optional()
        .describe('Optional array of available diagram formats to choose from')
    }
  },
  async ({ user_request, available_formats }) => {
    try {
      const result = await diagramHandler.processRequest({
        user_request,
        available_formats
      });
      
      return {
        content: [{
          type: 'text',
          text: result.prompt_text
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register the diagram instructions tool
server.registerTool(
  'get_diagram_instructions',
  {
    title: 'Get Diagram Instructions',
    description: 'Generate format-specific instruction prompts to help LLMs create syntactically correct diagram code',
    inputSchema: {
      user_request: z.string()
        .min(5, 'User request must be at least 5 characters')
        .max(2000, 'User request must not exceed 2000 characters')
        .describe('Original natural language request describing what diagram to create'),
      diagram_format: z.enum(['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'])
        .describe('Target diagram language/format')
    }
  },
  async ({ user_request, diagram_format }) => {
    try {
      const result = await instructionsHandler.processRequest({
        user_request,
        diagram_format
      });
      
      return {
        content: [{
          type: 'text',
          text: result.prompt_text
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
);

// Register the diagram rendering tool
server.registerTool(
  'render_diagram',
  {
    title: 'Render Diagram',
    description: 'Render diagram source code into an image using Kroki service',
    inputSchema: {
      code: z.string()
        .min(1, 'Diagram code is required')
        .max(100000, 'Diagram code must not exceed 100,000 characters')
        .describe('The source code of the diagram to render'),
      diagram_format: z.enum(['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'])
        .describe('The format of the diagram source code'),
      output_format: z.enum(['png', 'svg'])
        .optional()
        .describe('The desired output image format (defaults to the first supported format for the diagram type)')
    }
  },
  async ({ code, diagram_format, output_format }) => {
    try {
      const result = await renderingHandler.processRequest({
        code,
        diagram_format,
        output_format
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            image_data: result.image_data,
            content_type: result.content_type,
            success: true
          }, null, 2)
        }]
      };
    } catch (error) {
      // Handle ProcessingError specifically for better error reporting
      if (error instanceof ProcessingError) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: error.message,
              error_type: error.errorInfo.type,
              retryable: error.errorInfo.retryable,
              success: false
            }, null, 2)
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register health check resource
server.registerResource(
  'health',
  'diagram_selection_health',
  {
    title: 'Diagram Selection Health Check',
    description: 'Health check endpoint for the diagram selection service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const healthStatus = await diagramHandler.healthCheck();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(healthStatus, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register metrics resource
server.registerResource(
  'metrics',
  'diagram_selection_metrics',
  {
    title: 'Diagram Selection Metrics',
    description: 'Performance metrics for the diagram selection service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const metrics = await diagramHandler.getMetrics();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(metrics, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register format catalog resource
server.registerResource(
  'catalog',
  'diagram_format_catalog',
  {
    title: 'Diagram Format Catalog',
    description: 'Catalog of all supported diagram formats with their characteristics',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const catalog = diagramHandler.getFormatCatalog();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(catalog, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register instruction health check resource
server.registerResource(
  'health',
  'diagram_instructions_health',
  {
    title: 'Diagram Instructions Health Check',
    description: 'Health check endpoint for the diagram instructions service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const healthStatus = await instructionsHandler.healthCheck();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(healthStatus, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register instruction metrics resource
server.registerResource(
  'metrics',
  'diagram_instructions_metrics',
  {
    title: 'Diagram Instructions Metrics',
    description: 'Performance metrics for the diagram instructions service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const metrics = await instructionsHandler.getMetrics();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(metrics, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register diagram rendering health check resource
server.registerResource(
  'health',
  'diagram_rendering_health',
  {
    title: 'Diagram Rendering Health Check',
    description: 'Health check endpoint for the diagram rendering service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const healthStatus = await renderingHandler.healthCheck();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(healthStatus, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Register diagram rendering metrics resource
server.registerResource(
  'metrics',
  'diagram_rendering_metrics',
  {
    title: 'Diagram Rendering Metrics',
    description: 'Performance metrics for the diagram rendering service',
    mimeType: 'application/json'
  },
  async (uri) => {
    try {
      const metrics = await renderingHandler.getMetrics();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(metrics, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
);

// Server configuration
const SERVER_CONFIG = {
  name: 'diagram-bridge-mcp',
  version: '1.0.0',
  description: 'A "bridge" MCP server that helps LLMs choose the most appropriate diagram format for visualization requests',
  author: 'Anton An',
  license: 'MIT'
};

// Start the server
async function main() {
  console.log(`Starting ${SERVER_CONFIG.name} v${SERVER_CONFIG.version}`);
  console.log(`Description: ${SERVER_CONFIG.description}`);
  console.log('');
  
  // Perform initial health checks
  try {
    console.log('Initial health checks:');
    
    const selectionHealthStatus = await diagramHandler.healthCheck();
    console.log(`Diagram Selection: ${selectionHealthStatus.status}`);
    if (selectionHealthStatus.details.length > 0) {
      console.log('  Issues:', selectionHealthStatus.details);
    }
    
    const instructionsHealthStatus = await instructionsHandler.healthCheck();
    console.log(`Diagram Instructions: ${instructionsHealthStatus.status}`);
    if (instructionsHealthStatus.details.length > 0) {
      console.log('  Issues:', instructionsHealthStatus.details);
    }
    
    const renderingHealthStatus = await renderingHandler.healthCheck();
    console.log(`Diagram Rendering: ${renderingHealthStatus.status}`);
    if (renderingHealthStatus.details.length > 0) {
      console.log('  Issues:', renderingHealthStatus.details);
    }
    
    console.log('');
  } catch (error) {
    console.error('Failed to perform initial health checks:', error);
  }

  console.log('Available resources:');
  console.log('- diagram_selection_health: Health check endpoint for the diagram selection service');
  console.log('- diagram_selection_metrics: Performance metrics for the diagram selection service');
  console.log('- diagram_format_catalog: Catalog of all supported diagram formats with their characteristics');
  console.log('- diagram_instructions_health: Health check endpoint for the diagram instructions service');
  console.log('- diagram_instructions_metrics: Performance metrics for the diagram instructions service');
  console.log('- diagram_rendering_health: Health check endpoint for the diagram rendering service');
  console.log('- diagram_rendering_metrics: Performance metrics for the diagram rendering service');
  console.log('');
  
  console.log('Available tools:');
  console.log('- help_choose_diagram: Generate structured prompts for diagram format selection');
  console.log('- get_diagram_instructions: Generate format-specific instruction prompts for diagram code creation');
  console.log('- render_diagram: Render diagram source code into images via Kroki service');
  console.log('');

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP server connected and ready!');
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nShutting down MCP server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down MCP server...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch(error => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
}); 