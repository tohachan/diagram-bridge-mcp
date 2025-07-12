# MCP Server Architecture Diagram

## Overview
This diagram shows the architecture of the Diagram Bridge MCP Server using the C4 Container model. It illustrates how the server processes diagram requests from AI clients through a structured pipeline of handlers and utilities.

## Key Components

### 1. MCP Server Core
- **Technology**: Node.js/TypeScript
- **Purpose**: Handles MCP protocol communication, tool registration, and client requests
- **Tools Exposed**: 
  - `help_choose_diagram` - AI-powered format selection
  - `get_diagram_instructions` - Format-specific coding instructions
  - `render_diagram` - Complete diagram rendering

### 2. Processing Handlers
- **Diagram Selection Handler**: Uses AI heuristics to recommend optimal diagram formats
- **Instructions Handler**: Generates format-specific coding instructions for LLMs
- **Kroki Rendering Handler**: Manages diagram rendering through external Kroki service

### 3. Utilities & Services
- **Validation Layer**: Zod-based input validation and sanitization
- **LRU Cache**: Performance optimization for diagram operations
- **File Management**: File path resolution and storage operations

### 4. Templates & Configuration
- **Format Configuration**: Diagram format definitions and capability mappings
- **Instruction Templates**: Template engine for generating format-specific instructions

### 5. External Dependencies
- **Kroki Service**: External service for high-quality diagram rendering
- **File System**: Local storage for generated diagram files

## Data Flow
1. AI Client sends MCP requests to the server
2. MCP Server Core routes requests to appropriate handlers
3. Handlers utilize validation, caching, and configuration services
4. For rendering, the server communicates with external Kroki service
5. Generated diagrams are saved to local file system
6. Results are returned to the client via MCP protocol

## Architecture Benefits
- **Separation of Concerns**: Clear boundaries between protocol handling, processing, and utilities
- **Extensibility**: Easy to add new diagram formats or handlers
- **Performance**: LRU caching and efficient file management
- **Reliability**: Comprehensive validation and error handling
- **Maintainability**: TypeScript with clear component interfaces

## Files
- `mcp-server-architecture.svg` - Scalable vector version
- `mcp-server-architecture.png` - Raster version for presentations

Generated using C4 Container model with PlantUML.
