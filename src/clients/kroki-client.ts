import { 
  KrokiClient, 
  KrokiRequestConfig, 
  DiagramRenderingOutput, 
  DiagramRenderingError,
  DiagramRenderingErrorInfo
} from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { OutputFormat } from '../types/diagram-rendering.js';
import { getKrokiFormat, getContentType } from '../resources/diagram-rendering-format-mapping.js';
import { getDiagramFilePath } from '../utils/file-path.js';

/**
 * HTTP client for Kroki diagram rendering service
 */
export class KrokiHttpClient implements KrokiClient {
  private config: KrokiRequestConfig;

  constructor(config?: Partial<KrokiRequestConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.KROKI_URL || 'https://kroki.io',
      timeout: config?.timeout || 30000, // 30 seconds
      maxRetries: config?.maxRetries || 3,
      retryDelay: config?.retryDelay || 1000 // 1 second
    };
  }

  /**
   * Render diagram via Kroki API and save to file
   */
  async renderDiagram(
    code: string, 
    format: DiagramFormat, 
    outputFormat: OutputFormat = 'png',
    outputPath: string
  ): Promise<DiagramRenderingOutput> {
    const krokiFormat = getKrokiFormat(format);
    const url = this.buildUrl(krokiFormat, outputFormat);
    
    let lastError: Error = new Error('No attempts made');
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Add delay between retries (but not on first attempt)
        if (attempt > 0) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
        }
        
        const response = await this.makeRequest(url, code, format);
        return await this.processResponse(response, outputFormat, outputPath);
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain types of errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Log retry attempt
        console.error(`Kroki request attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    // All retries exhausted, throw the last error
    throw this.createRenderingError(lastError);
  }

  /**
   * Health check for Kroki service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string[] }> {
    const details: string[] = [];
    
    try {
      // Test with a simple mermaid diagram
      const testCode = 'graph TD\nA-->B';
      const fileName = `health-check-${Date.now()}.png`;
      const testPath = getDiagramFilePath(fileName);
      const result = await this.renderDiagram(testCode, 'mermaid', 'png', testPath);
      
      if (!result.file_path || result.file_size < 100) {
        details.push('Response file is too small or missing');
      }
      
      if (result.content_type !== 'image/png') {
        details.push(`Unexpected content type: ${result.content_type}`);
      }
      
      // Clean up test file
      try {
        const fs = await import('fs/promises');
        await fs.unlink(result.file_path);
      } catch {
        // Ignore cleanup errors
      }
      
      return {
        status: details.length === 0 ? 'healthy' : 'unhealthy',
        details
      };
      
    } catch (error) {
      details.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        status: 'unhealthy',
        details
      };
    }
  }

  /**
   * Build request URL for Kroki API
   */
  private buildUrl(krokiFormat: string, outputFormat: OutputFormat): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    return `${baseUrl}/${krokiFormat}/${outputFormat}`;
  }

  /**
   * Make HTTP request with timeout
   */
  private async makeRequest(url: string, code: string, format: DiagramFormat): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // JSON-based formats need special handling
      const isJsonFormat = this.isJsonBasedFormat(format);
      
      const headers: Record<string, string> = {
        'Accept': '*/*'
      };
      
      let body: string;
      
      if (isJsonFormat) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ diagram_source: code });
      } else {
        headers['Content-Type'] = 'text/plain';
        body = code;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Read the actual error message from Kroki API
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody && errorBody.trim()) {
            // Include the detailed error message from Kroki
            errorMessage = `Error ${response.status}: ${errorBody}`;
          }
        } catch (readError) {
          // If we can't read the error body, fall back to status text
          console.warn('Failed to read error response body:', readError);
        }
        throw new Error(errorMessage);
      }
      
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Check if the format requires JSON payload
   */
  private isJsonBasedFormat(format: DiagramFormat): boolean {
    const jsonFormats = ['excalidraw', 'vega-lite'];
    return jsonFormats.includes(format);
  }

  /**
   * Process successful response and save to file
   */
  private async processResponse(response: Response, outputFormat: OutputFormat, outputPath: string): Promise<DiagramRenderingOutput> {
    try {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = getContentType(outputFormat);
      
      if (!buffer || buffer.length < 100) {
        throw new Error('Received empty or invalid image data from Kroki');
      }
      
      // Save to file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(outputPath, buffer);
      
      // Create resource URI
      const resourceUri = `diagram://saved/${path.basename(outputPath)}`;
      
      return {
        file_path: outputPath,
        resource_uri: resourceUri,
        content_type: contentType,
        file_size: buffer.length
      };
      
    } catch (error) {
      throw new Error(`Failed to process Kroki response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const message = error.message.toLowerCase();
    
    // Don't retry on client errors (4xx) or syntax errors
    return message.includes('http 4') || 
           message.includes('syntax') ||
           message.includes('invalid') ||
           message.includes('malformed');
  }

  /**
   * Create appropriate rendering error from caught error
   */
  private createRenderingError(error: Error): DiagramRenderingErrorInfo {
    const message = error.message.toLowerCase();
    const originalMessage = error.message; // Preserve original message
    
    if (message.includes('timeout')) {
      return {
        type: 'TIMEOUT_ERROR' as DiagramRenderingError,
        message: originalMessage, // Use original message for timeout errors
        retryable: true
      };
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'NETWORK_ERROR' as DiagramRenderingError,
        message: originalMessage, // Use original message for network errors
        retryable: true
      };
    }
    
    if (message.includes('http 5')) {
      return {
        type: 'KROKI_UNAVAILABLE' as DiagramRenderingError,
        message: originalMessage, // Use original message for server errors
        retryable: true
      };
    }
    
    // Distinguish between syntax errors and size/complexity errors
    if (message.includes('http 400') || message.includes('error 400')) {
      // Check for explicit syntax/parsing error indicators
      if (message.includes('parse') || 
          message.includes('syntax') || 
          message.includes('unable to parse') ||
          message.includes('invalid input') ||
          message.includes('valid rank directions') ||
          message.includes('malformed') ||
          message.includes('relationship') ||
          message.includes('already exists')) {
        return {
          type: 'SYNTAX_ERROR' as DiagramRenderingError,
          message: originalMessage, // Use original detailed message from Kroki
          retryable: false
        };
      }
      
      // Check for size/complexity indicators (only use SIZE_LIMIT_ERROR for actual size issues)
      if (message.includes('too large') ||
          message.includes('size limit') ||
          message.includes('payload too large') ||
          message.includes('request entity too large') ||
          message.includes('413')) {
        return {
          type: 'SIZE_LIMIT_ERROR' as DiagramRenderingError,
          message: originalMessage, // Use original message for size errors
          retryable: false
        };
      }
      
      // Default HTTP 400 to syntax error (most common case)
      return {
        type: 'SYNTAX_ERROR' as DiagramRenderingError,
        message: originalMessage, // Use original detailed message from Kroki
        retryable: false
      };
    }
    
    // Other HTTP 4xx errors or explicit syntax errors
    if (message.includes('http 4') || message.includes('syntax') || message.includes('invalid') || message.includes('malformed')) {
      return {
        type: 'SYNTAX_ERROR' as DiagramRenderingError,
        message: originalMessage, // Use original detailed message
        retryable: false
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR' as DiagramRenderingError,
      message: originalMessage, // Use original message for unknown errors
      retryable: false
    };
  }

  /**
   * Sleep for specified number of milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<KrokiRequestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): KrokiRequestConfig {
    return { ...this.config };
  }

  /**
   * Test connection to Kroki service
   */
  async testConnection(): Promise<{ connected: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for test
      
      const response = await fetch(this.config.baseUrl, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          connected: true,
          responseTime
        };
      } else {
        return {
          connected: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        connected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }
} 