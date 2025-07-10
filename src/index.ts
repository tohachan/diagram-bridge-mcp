#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DiagramSelectionHandler } from './resources/diagram-selection-handler.js';

/**
 * Diagram Bridge MCP Server
 * Provides automated diagram format selection through intelligent heuristics
 */

// Initialize the handler
const diagramHandler = new DiagramSelectionHandler();

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
  
  // Perform initial health check
  try {
    const healthStatus = await diagramHandler.healthCheck();
    console.log('Initial health check:');
    console.log(`Status: ${healthStatus.status}`);
    if (healthStatus.details.length > 0) {
      console.log('Issues:', healthStatus.details);
    }
    console.log('');
  } catch (error) {
    console.error('Failed to perform initial health check:', error);
  }

  console.log('Available resources:');
  console.log('- diagram_selection_health: Health check endpoint for the diagram selection service');
  console.log('- diagram_selection_metrics: Performance metrics for the diagram selection service');
  console.log('- diagram_format_catalog: Catalog of all supported diagram formats with their characteristics');
  console.log('');
  
  console.log('Available tools:');
  console.log('- help_choose_diagram: Generate structured prompts for diagram format selection');
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