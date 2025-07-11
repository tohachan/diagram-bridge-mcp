#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DiagramSelectionHandler } from './resources/diagram-selection-handler.js';
import { DiagramInstructionsHandler } from './resources/diagram-instructions-handler.js';
import { KrokiRenderingHandler, ProcessingError } from './resources/kroki-rendering-handler.js';
import { getDiagramFilePath } from './utils/file-path.js';
import { 
  createDiagramSelectionInputSchema,
  createDiagramInstructionsInputSchema,
  createDiagramRenderingInputSchema 
} from './utils/schema-generation.js';

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
    inputSchema: createDiagramSelectionInputSchema()
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
    inputSchema: createDiagramInstructionsInputSchema()
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
    inputSchema: createDiagramRenderingInputSchema()
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
            success: true,
            file_path: result.file_path,
            resource_uri: result.resource_uri,
            content_type: result.content_type,
            file_size: result.file_size,
            message: `Diagram rendered successfully and saved to ${result.file_path}. File size: ${result.file_size} bytes. Access via resource URI: ${result.resource_uri}\n\n⚠️ IMPORTANT: Do not attempt to read or analyze the contents of generated image files (especially SVG). These are binary/encoded image data meant for display, not text processing. Simply copy and use the file path or resource URI as needed.`
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
  'diagram_selection_health',
  'health://diagram_selection',
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
  'diagram_selection_metrics',
  'metrics://diagram_selection',
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
  'diagram_format_catalog',
  'catalog://diagram_formats',
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
  'diagram_instructions_health',
  'health://diagram_instructions',
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
  'diagram_instructions_metrics',
  'metrics://diagram_instructions',
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
  'diagram_rendering_health',
  'health://diagram_rendering',
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
  'diagram_rendering_metrics',
  'metrics://diagram_rendering',
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

// Register diagram file resource for accessing saved diagrams
server.registerResource(
  'saved_diagrams',
  'diagram://saved/',
  {
    title: 'Saved Diagram Files',
    description: 'Access to rendered diagram files',
    mimeType: 'application/octet-stream'
  },
  async (uri) => {
    try {
      // Extract filename from URI path
      const url = new URL(uri.href);
      const filename = url.pathname.split('/').pop();
      
      if (!filename) {
        throw new Error('No filename provided in URI');
      }
      
      // Read file using absolute path from diagram storage
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = getDiagramFilePath(filename);
      
      // Check if file exists and read it
      const buffer = await fs.readFile(filePath);
      
      // Determine MIME type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const mimeType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: mimeType,
          blob: buffer.toString('base64')
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: `Failed to load diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
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
  console.error(`Starting ${SERVER_CONFIG.name} v${SERVER_CONFIG.version}`);
  console.error(`Description: ${SERVER_CONFIG.description}`);
  console.error('');
  
  // Perform initial health checks
  try {
    console.error('Initial health checks:');
    
    const selectionHealthStatus = await diagramHandler.healthCheck();
    console.error(`Diagram Selection: ${selectionHealthStatus.status}`);
    if (selectionHealthStatus.details.length > 0) {
      console.error('  Issues:', selectionHealthStatus.details);
    }
    
    const instructionsHealthStatus = await instructionsHandler.healthCheck();
    console.error(`Diagram Instructions: ${instructionsHealthStatus.status}`);
    if (instructionsHealthStatus.details.length > 0) {
      console.error('  Issues:', instructionsHealthStatus.details);
    }
    
    const renderingHealthStatus = await renderingHandler.healthCheck();
    console.error(`Diagram Rendering: ${renderingHealthStatus.status}`);
    if (renderingHealthStatus.details.length > 0) {
      console.error('  Issues:', renderingHealthStatus.details);
    }
    
    console.error('');
  } catch (error) {
    console.error('Failed to perform initial health checks:', error);
  }

  console.error('Available resources:');
  console.error('- diagram_selection_health: Health check endpoint for the diagram selection service');
  console.error('- diagram_selection_metrics: Performance metrics for the diagram selection service');
  console.error('- diagram_format_catalog: Catalog of all supported diagram formats with their characteristics');
  console.error('- diagram_instructions_health: Health check endpoint for the diagram instructions service');
  console.error('- diagram_instructions_metrics: Performance metrics for the diagram instructions service');
  console.error('- diagram_rendering_health: Health check endpoint for the diagram rendering service');
  console.error('- diagram_rendering_metrics: Performance metrics for the diagram rendering service');
  console.error('');
  
  console.error('Available tools:');
  console.error('- help_choose_diagram: Generate structured prompts for diagram format selection');
  console.error('- get_diagram_instructions: Generate format-specific instruction prompts for diagram code creation');
  console.error('- render_diagram: Render diagram source code into images via Kroki service');
  console.error('');

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server connected and ready!');
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.error('\nShutting down MCP server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\nShutting down MCP server...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch(error => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
}); 