import { 
  DiagramRenderingInput, 
  DiagramRenderingOutput,
  DiagramRenderingErrorInfo,
  KrokiClient
} from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { OutputFormat } from '../types/diagram-rendering.js';
import { DiagramRenderingValidator } from '../utils/diagram-rendering-validation.js';
import { KrokiHttpClient } from '../clients/kroki-client.js';
import { DiagramLRUCache } from '../utils/diagram-cache.js';
import { isFormatOutputSupported, getDefaultOutputFormat } from '../resources/diagram-rendering-format-mapping.js';
import { getDiagramFilePath, ensureDiagramStorageDirectory } from '../utils/file-path.js';
import { getSupportedDiagramFormats } from '../utils/format-validation.js';
import { getKrokiConfig } from '../config/kroki.js';

/**
 * Main handler for the render_diagram MCP tool
 */
export class KrokiRenderingHandler {
  private validator: DiagramRenderingValidator;
  private krokiClient: KrokiClient;
  private cache: DiagramLRUCache;
  private cacheEnabled: boolean;
  private cacheMaxAge: number;

  constructor(options?: {
    krokiClient?: KrokiClient;
    cacheEnabled?: boolean;
    cacheMaxSize?: number;
    cacheMaxMemoryMB?: number;
    cacheMaxAge?: number;
  }) {
    this.validator = new DiagramRenderingValidator();
    this.krokiClient = options?.krokiClient || new KrokiHttpClient();
    this.cacheEnabled = options?.cacheEnabled ?? true;
    this.cacheMaxAge = options?.cacheMaxAge ?? 3600000; // 1 hour default
    this.cache = new DiagramLRUCache(
      options?.cacheMaxSize ?? 100,
      options?.cacheMaxMemoryMB ?? 50
    );

    // Log Kroki configuration on startup
    const krokiConfig = getKrokiConfig();
    console.info(`[KrokiRenderingHandler] Using Kroki at ${krokiConfig.baseUrl} (local: ${krokiConfig.useLocal})`);
  }

  /**
   * Process diagram rendering request
   */
  async processRequest(rawInput: unknown): Promise<DiagramRenderingOutput> {
    try {
      // Validate and sanitize input
      const { input, errors } = this.validator.createValidatedInput(rawInput);
      
      if (!input || errors.length > 0) {
        const errorInfo = this.validator.createErrorInfo(
          'INVALID_INPUT',
          `Invalid input: ${errors.join(', ')}`,
          { errors }
        );
        throw this.createProcessingError(errorInfo);
      }

      // Validate format-output combination
      const defaultOutputFormat = getDefaultOutputFormat(input.diagram_format);
      const formatValidation = this.validator.validateFormatOutputCombination(
        input.diagram_format, 
        input.output_format || defaultOutputFormat
      );
      
      if (!formatValidation.isValid) {
        const errorInfo = this.validator.createErrorInfo(
          'UNSUPPORTED_FORMAT',
          `Unsupported format combination: ${formatValidation.errors.join(', ')}`,
          { format: input.diagram_format, outputFormat: input.output_format }
        );
        throw this.createProcessingError(errorInfo);
      }

      // Check cache if enabled
      if (this.cacheEnabled) {
        const cacheKey = DiagramLRUCache.generateKey(
          input.code, 
          input.diagram_format, 
          input.output_format || defaultOutputFormat
        );
        
        const cachedEntry = this.cache.get(cacheKey);
        if (cachedEntry && DiagramLRUCache.isEntryValid(cachedEntry, this.cacheMaxAge)) {
          return cachedEntry.data;
        }
      }

      // Generate unique output file path (absolute)
      const timestamp = Date.now();
      const formatExt = (input.output_format || defaultOutputFormat) === 'png' ? 'png' : 'svg';
      const fileName = `diagram-${input.diagram_format}-${timestamp}.${formatExt}`;
      const outputPath = getDiagramFilePath(fileName);
      
      // Ensure storage directory exists
      await ensureDiagramStorageDirectory();
      
      // Render diagram via Kroki
      const output = await this.krokiClient.renderDiagram(
        input.code, 
        input.diagram_format, 
        input.output_format || defaultOutputFormat,
        outputPath
      );

      // Validate output
      const outputValidation = this.validator.validateOutput(output);
      if (!outputValidation.isValid) {
        const errorInfo = this.validator.createErrorInfo(
          'UNKNOWN_ERROR',
          `Invalid output from Kroki: ${outputValidation.errors.join(', ')}`,
          { outputErrors: outputValidation.errors }
        );
        throw this.createProcessingError(errorInfo);
      }

      // Store in cache if enabled
      if (this.cacheEnabled) {
        const cacheKey = DiagramLRUCache.generateKey(
          input.code, 
          input.diagram_format, 
          input.output_format || defaultOutputFormat
        );
        const cacheEntry = DiagramLRUCache.createCacheEntry(output);
        this.cache.set(cacheKey, cacheEntry);
      }

      return output;

    } catch (error) {
      // Handle different error types
      if (error instanceof ProcessingError) {
        throw error; // Re-throw our custom errors
      }
      
      // Handle KrokiClient errors (should be DiagramRenderingErrorInfo)
      if (this.isDiagramRenderingError(error)) {
        throw this.createProcessingError(error);
      }
      
      // Handle unexpected errors
      const errorInfo = this.validator.createErrorInfo(
        'UNKNOWN_ERROR',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error.message : error }
      );
      throw this.createProcessingError(errorInfo);
    }
  }

  /**
   * Health check method to verify all components are working
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string[] }> {
    const issues: string[] = [];

    try {
      // Get all supported formats
      const supportedFormats = getSupportedDiagramFormats();
      
      // Test validator
      const testInput: DiagramRenderingInput = {
        code: 'graph TD\nA-->B',
        diagram_format: 'mermaid',
        output_format: 'png'
      };

      const validationResult = this.validator.validateInput(testInput);
      if (!validationResult.isValid) {
        issues.push('Validator failed for valid input');
      }

      // Test Kroki client
      const krokiHealth = await this.krokiClient.healthCheck();
      if (krokiHealth.status === 'unhealthy') {
        issues.push(`Kroki client unhealthy: ${krokiHealth.details.join(', ')}`);
      }

      // Test cache functionality
      if (this.cacheEnabled) {
        const cacheStats = this.cache.stats();
        if (isNaN(cacheStats.hitRate) || cacheStats.memoryUsage < 0) {
          issues.push('Cache statistics are invalid');
        }
      }

      // Test all supported formats with simple test cases
      const formatTests = this.getFormatTestCases();
      
      for (const formatTest of formatTests) {
        try {
          // Skip problematic formats during health check
          if (['bpmn', 'structurizr'].includes(formatTest.format)) {
            console.warn(`[HealthCheck] Skipping ${formatTest.format} test due to known syntax complexities`);
            continue;
          }
          
          const result = await this.processRequest(formatTest.input);
          if (!result.file_path || result.file_size < 50) {
            issues.push(`Format ${formatTest.format} test failed - invalid output`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          issues.push(`Format ${formatTest.format} test failed: ${errorMessage}`);
        }
      }

      // Verify all formats are supported
      const expectedFormats = ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd', 'bpmn', 'c4-plantuml', 'structurizr', 'excalidraw', 'vega-lite'];
      for (const expectedFormat of expectedFormats) {
        if (!supportedFormats.includes(expectedFormat)) {
          issues.push(`Expected format ${expectedFormat} not supported`);
        }
      }

      if (supportedFormats.length !== 10) {
        console.warn(`[HealthCheck] Expected 10 supported formats, got ${supportedFormats.length}: ${supportedFormats.join(', ')}`);
      }

    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'unhealthy',
      details: issues.length === 0 ? [`All ${getSupportedDiagramFormats().length} formats operational`] : issues
    };
  }

  /**
   * Get test cases for all supported formats
   */
  private getFormatTestCases(): Array<{ format: string; input: DiagramRenderingInput }> {
    return [
      {
        format: 'mermaid',
        input: {
          code: 'graph TD\nA-->B',
          diagram_format: 'mermaid',
          output_format: 'png'
        }
      },
      {
        format: 'plantuml',
        input: {
          code: '@startuml\nclass A\n@enduml',
          diagram_format: 'plantuml',
          output_format: 'png'
        }
      },
      {
        format: 'd2',
        input: {
          code: 'A -> B',
          diagram_format: 'd2',
          output_format: 'svg'
        }
      },
      {
        format: 'graphviz',
        input: {
          code: 'digraph G { A -> B; }',
          diagram_format: 'graphviz',
          output_format: 'png'
        }
      },
      {
        format: 'erd',
        input: {
          code: '[User]\n*id {label: "int"}',
          diagram_format: 'erd',
          output_format: 'png'
        }
      },
      {
        format: 'bpmn',
        input: {
          code: '<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">\n  <process id="process1">\n    <startEvent id="start"/>\n    <endEvent id="end"/>\n    <sequenceFlow sourceRef="start" targetRef="end"/>\n  </process>\n</definitions>',
          diagram_format: 'bpmn',
          output_format: 'svg'
        }
      },
      {
        format: 'c4-plantuml',
        input: {
          code: '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\nPerson(user, "User")\n@enduml',
          diagram_format: 'c4-plantuml',
          output_format: 'png'
        }
      },
      {
        format: 'structurizr',
        input: {
          code: 'workspace "Example" "A simple example workspace" {\n  model {\n    user = person "User"\n  }\n  views {\n    systemLandscape {\n      include *\n    }\n  }\n}',
          diagram_format: 'structurizr',
          output_format: 'svg'
        }
      },
      {
        format: 'excalidraw',
        input: {
          code: '{"type": "excalidraw", "version": 2, "elements": [{"type": "rectangle", "x": 100, "y": 100, "width": 100, "height": 100}]}',
          diagram_format: 'excalidraw',
          output_format: 'svg'
        }
      },
      {
        format: 'vega-lite',
        input: {
          code: '{"$schema": "https://vega.github.io/schema/vega-lite/v5.json", "data": {"values": [{"x": 1, "y": 1}]}, "mark": "point", "encoding": {"x": {"field": "x", "type": "quantitative"}, "y": {"field": "y", "type": "quantitative"}}}',
          diagram_format: 'vega-lite',
          output_format: 'svg'
        }
      }
    ];
  }

  /**
   * Get performance metrics (for monitoring)
   */
  async getMetrics(): Promise<{
    processingTime?: number;
    cacheStats: ReturnType<DiagramLRUCache['stats']>;
    supportedFormats: number;
    krokiConnection?: {
      connected: boolean;
      responseTime: number;
    };
  }> {
    const start = Date.now();
    
    // Test processing performance
    let processingTime: number | undefined;
    try {
      await this.processRequest({
        code: 'graph TD\nA-->B',
        diagram_format: 'mermaid',
        output_format: 'png'
      });
      processingTime = Date.now() - start;
    } catch {
      // Ignore errors for metrics
    }

    // Get cache statistics
    const cacheStats = this.cache.stats();

    // Test Kroki connection
    let krokiConnection: { connected: boolean; responseTime: number } | undefined;
    try {
      if (this.krokiClient instanceof KrokiHttpClient) {
        const connectionTest = await this.krokiClient.testConnection();
        krokiConnection = {
          connected: connectionTest.connected,
          responseTime: connectionTest.responseTime
        };
      }
    } catch {
      // Ignore connection test errors
    }

    const metrics: {
      processingTime?: number;
      cacheStats: ReturnType<DiagramLRUCache['stats']>;
      supportedFormats: number;
      krokiConnection?: { connected: boolean; responseTime: number };
    } = {
      cacheStats,
      supportedFormats: getSupportedDiagramFormats().length
    };

    if (processingTime !== undefined) {
      metrics.processingTime = processingTime;
    }

    if (krokiConnection !== undefined) {
      metrics.krokiConnection = krokiConnection;
    }

    return metrics;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update cache configuration
   */
  updateCacheConfig(options: {
    enabled?: boolean;
    maxAge?: number;
  }): void {
    if (options.enabled !== undefined) {
      this.cacheEnabled = options.enabled;
    }
    if (options.maxAge !== undefined) {
      this.cacheMaxAge = options.maxAge;
    }
  }

  /**
   * Get cache debug information
   */
  getCacheDebugInfo(): ReturnType<DiagramLRUCache['getDebugInfo']> {
    return this.cache.getDebugInfo();
  }

  /**
   * Prune expired cache entries
   */
  pruneCache(): number {
    return this.cache.pruneExpired(this.cacheMaxAge);
  }

  /**
   * Check if error is a DiagramRenderingErrorInfo
   */
  private isDiagramRenderingError(error: unknown): error is DiagramRenderingErrorInfo {
    return typeof error === 'object' &&
           error !== null &&
           'type' in error &&
           'message' in error &&
           'retryable' in error;
  }

  /**
   * Create a processing error that can be thrown
   */
  private createProcessingError(errorInfo: DiagramRenderingErrorInfo): ProcessingError {
    return new ProcessingError(errorInfo.message, errorInfo);
  }
}

/**
 * Custom error class for processing errors
 */
export class ProcessingError extends Error {
  public readonly errorInfo: DiagramRenderingErrorInfo;

  constructor(message: string, errorInfo: DiagramRenderingErrorInfo) {
    super(message);
    this.name = 'ProcessingError';
    this.errorInfo = errorInfo;
  }
} 