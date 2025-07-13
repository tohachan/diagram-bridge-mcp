/**
 * Dynamic format mapping system using DiagramFormatsManager
 * Replaces static mappings with runtime format discovery
 */

import { FormatMapping, OutputFormat } from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';

/**
 * Dynamic format mapping class that provides format-related utilities
 * using runtime format discovery instead of static mappings
 */
export class DynamicFormatMapping {
  private formatManager: DiagramFormatsManager;

  constructor() {
    this.formatManager = DiagramFormatsManager.getInstance();
  }

  /**
   * Get Kroki format identifier for a given MCP diagram format
   */
  getKrokiFormat(mcpFormat: DiagramFormat): string | undefined {
    return this.formatManager.getKrokiFormat(mcpFormat);
  }

  /**
   * Get Kroki format identifier with error handling
   */
  getKrokiFormatSafe(mcpFormat: DiagramFormat): string {
    const krokiFormat = this.getKrokiFormat(mcpFormat);
    if (!krokiFormat) {
      throw new Error(`Unsupported diagram format: ${mcpFormat}`);
    }
    return krokiFormat;
  }

  /**
   * Get supported output formats for a given diagram format
   */
  getSupportedOutputFormats(format: DiagramFormat): OutputFormat[] {
    return this.formatManager.getSupportedOutputFormats(format);
  }

  /**
   * Check if a format-output combination is supported
   */
  isFormatOutputSupported(format: DiagramFormat, outputFormat: OutputFormat): boolean {
    return this.formatManager.isFormatOutputSupported(format, outputFormat);
  }

  /**
   * Get all supported diagram formats
   */
  getSupportedFormats(): DiagramFormat[] {
    return this.formatManager.getEnabledFormats();
  }

  /**
   * Get the default output format for a given diagram format
   */
  getDefaultOutputFormat(format: DiagramFormat): OutputFormat | undefined {
    return this.formatManager.getDefaultOutputFormat(format);
  }

  /**
   * Get default output format with error handling
   */
  getDefaultOutputFormatSafe(format: DiagramFormat): OutputFormat {
    const defaultFormat = this.getDefaultOutputFormat(format);
    if (!defaultFormat) {
      throw new Error(`No supported output formats for diagram format: ${format}`);
    }
    return defaultFormat;
  }

  /**
   * Validate that a diagram format is supported
   */
  validateFormat(format: string): format is DiagramFormat {
    return this.formatManager.isFormatSupported(format);
  }

  /**
   * Get format mappings in the legacy format for compatibility
   */
  getFormatMappings(): FormatMapping[] {
    const supportedFormats = this.getSupportedFormats();
    
    return supportedFormats.map(format => {
      const config = this.formatManager.getFormatConfig(format);
      if (!config) {
        throw new Error(`Format configuration not found for: ${format}`);
      }

      return {
        mcpFormat: format,
        krokiFormat: config.krokiFormat,
        supportedOutputs: config.supportedOutputs
      };
    });
  }

  /**
   * Generate lookup table for Kroki format identifiers (for compatibility)
   */
  generateKrokiLookupTable(): Record<DiagramFormat, string> {
    const supportedFormats = this.getSupportedFormats();
    const lookupTable: Record<string, string> = {};

    for (const format of supportedFormats) {
      const krokiFormat = this.getKrokiFormat(format);
      if (krokiFormat) {
        lookupTable[format] = krokiFormat;
      }
    }

    return lookupTable;
  }

  /**
   * Generate output support lookup table (for compatibility)
   */
  generateOutputSupportTable(): Record<DiagramFormat, OutputFormat[]> {
    const supportedFormats = this.getSupportedFormats();
    const supportTable: Record<string, OutputFormat[]> = {};

    for (const format of supportedFormats) {
      const supportedOutputs = this.getSupportedOutputFormats(format);
      supportTable[format] = supportedOutputs;
    }

    return supportTable;
  }

  /**
   * Get format configuration information
   */
  getFormatConfig(format: DiagramFormat): {
    name: string;
    description: string;
    fileExtensions: string[];
    exampleCode: string;
  } | undefined {
    const config = this.formatManager.getFormatConfig(format);
    if (!config) {
      return undefined;
    }

    // Extract format-specific information from the configuration
    // This is a simplified version - you might want to add more specific fields to DiagramFormatConfig
    return {
      name: config.displayName,
      description: config.description,
      fileExtensions: this.generateFileExtensions(format),
      exampleCode: this.generateExampleCode(format)
    };
  }

  /**
   * Generate file extensions for a format (could be moved to config)
   */
  private generateFileExtensions(format: DiagramFormat): string[] {
    const extensionMap: Record<string, string[]> = {
      mermaid: ['.mmd', '.mermaid'],
      plantuml: ['.puml', '.plantuml'],
      d2: ['.d2'],
      graphviz: ['.dot', '.gv'],
      // erd: ['.er', '.erd'], // ERD temporarily disabled
    };

    return extensionMap[format] || [`.${format}`];
  }

  /**
   * Generate example code for a format (could be moved to config)
   */
  private generateExampleCode(format: DiagramFormat): string {
    const exampleMap: Record<string, string> = {
      mermaid: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]',
      plantuml: '@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml',
      d2: 'users -> database: query\ndatabase -> users: results\napi: {\n  shape: rectangle\n  style.fill: lightblue\n}',
      graphviz: 'digraph G {\n  A -> B;\n  B -> C;\n  A -> C;\n}',
      // erd: '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}' // ERD temporarily disabled
    };

    return exampleMap[format] || `# ${format} diagram example`;
  }

  /**
   * Check if format is available (exists but might be disabled)
   */
  isFormatAvailable(format: string): boolean {
    return this.formatManager.isFormatAvailable(format);
  }

  /**
   * Get metadata about all formats
   */
  getMetadata() {
    return this.formatManager.getMetadata();
  }
}

// Singleton instance for global access
let dynamicMapping: DynamicFormatMapping | undefined;

/**
 * Get singleton instance of DynamicFormatMapping
 */
export function getDynamicFormatMapping(): DynamicFormatMapping {
  if (!dynamicMapping) {
    dynamicMapping = new DynamicFormatMapping();
  }
  return dynamicMapping;
}

/**
 * Validate that an output format is supported
 */
export function validateOutputFormat(outputFormat: string): outputFormat is OutputFormat {
  return ['png', 'svg'].includes(outputFormat);
}

/**
 * Get MIME type for output format
 */
export function getContentType(outputFormat: OutputFormat): string {
  const contentTypeMap: Record<OutputFormat, string> = {
    png: 'image/png',
    svg: 'image/svg+xml'
  };

  const contentType = contentTypeMap[outputFormat];
  if (!contentType) {
    throw new Error(`Unsupported output format: ${outputFormat}`);
  }
  
  return contentType;
} 