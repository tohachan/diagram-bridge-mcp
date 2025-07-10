/**
 * Type definitions for diagram rendering via Kroki
 */

import type { DiagramFormat } from './diagram-selection.js';

/**
 * Supported output formats for rendered diagrams
 */
export type OutputFormat = 'png' | 'svg';

/**
 * Input schema for the render_diagram MCP tool
 */
export interface DiagramRenderingInput {
  /**
   * The source code of the diagram to render
   */
  code: string;
  
  /**
   * The format of the diagram source code
   */
  diagram_format: DiagramFormat;
  
  /**
   * The desired output image format
   * @default 'png'
   */
  output_format?: OutputFormat;
}

/**
 * Output schema for the render_diagram MCP tool
 */
export interface DiagramRenderingOutput {
  /**
   * Base64 encoded image data
   */
  image_data: string;
  
  /**
   * MIME type of the output image
   */
  content_type: string;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Kroki API request configuration
 */
export interface KrokiRequestConfig {
  /**
   * Kroki service base URL
   */
  baseUrl: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout: number;
  
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;
  
  /**
   * Initial retry delay in milliseconds
   */
  retryDelay: number;
}

/**
 * Kroki client interface
 */
export interface KrokiClient {
  /**
   * Render diagram via Kroki API
   */
  renderDiagram(
    code: string, 
    format: DiagramFormat, 
    outputFormat: OutputFormat
  ): Promise<DiagramRenderingOutput>;
  
  /**
   * Health check for Kroki service
   */
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string[] }>;
}

/**
 * Cache entry for rendered diagrams
 */
export interface CacheEntry {
  /**
   * Cached rendering output
   */
  data: DiagramRenderingOutput;
  
  /**
   * Timestamp when entry was created
   */
  timestamp: number;
  
  /**
   * Size of the cached data in bytes
   */
  size: number;
}

/**
 * Cache interface for diagram rendering
 */
export interface DiagramCache {
  /**
   * Get cached rendering result
   */
  get(key: string): CacheEntry | undefined;
  
  /**
   * Store rendering result in cache
   */
  set(key: string, value: CacheEntry): void;
  
  /**
   * Clear all cached entries
   */
  clear(): void;
  
  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  };
}

/**
 * Format mapping configuration for Kroki
 */
export interface FormatMapping {
  /**
   * MCP format name
   */
  mcpFormat: DiagramFormat;
  
  /**
   * Kroki format identifier
   */
  krokiFormat: string;
  
  /**
   * Supported output formats for this diagram type
   */
  supportedOutputs: OutputFormat[];
}

/**
 * Error types for diagram rendering
 */
export type DiagramRenderingError = 
  | 'INVALID_INPUT'
  | 'UNSUPPORTED_FORMAT'
  | 'SYNTAX_ERROR'
  | 'KROKI_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Structured error for diagram rendering
 */
export interface DiagramRenderingErrorInfo {
  /**
   * Error type classification
   */
  type: DiagramRenderingError;
  
  /**
   * Human-readable error message
   */
  message: string;
  
  /**
   * Optional error details or context
   */
  details?: Record<string, unknown>;
  
  /**
   * Whether the error is retryable
   */
  retryable: boolean;
} 