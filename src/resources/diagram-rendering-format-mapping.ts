import { FormatMapping, OutputFormat } from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';

/**
 * Mapping from MCP diagram formats to Kroki format identifiers
 */
export const KROKI_FORMAT_MAPPINGS: FormatMapping[] = [
  {
    mcpFormat: 'mermaid',
    krokiFormat: 'mermaid',
    supportedOutputs: ['png', 'svg']
  },
  {
    mcpFormat: 'plantuml',
    krokiFormat: 'plantuml',
    supportedOutputs: ['png', 'svg']
  },
  {
    mcpFormat: 'd2',
    krokiFormat: 'd2',
    supportedOutputs: ['svg']  // D2 in Kroki only supports SVG output
  },
  {
    mcpFormat: 'graphviz',
    krokiFormat: 'graphviz',
    supportedOutputs: ['png', 'svg']
  },
  {
    mcpFormat: 'erd',
    krokiFormat: 'erd',
    supportedOutputs: ['png', 'svg']
  }
];

/**
 * Lookup table for quick access to Kroki format identifiers
 */
export const FORMAT_TO_KROKI_MAP: Record<DiagramFormat, string> = {
  mermaid: 'mermaid',
  plantuml: 'plantuml',
  d2: 'd2',
  graphviz: 'graphviz',
  erd: 'erd'
};

/**
 * Lookup table for supported output formats by diagram format
 */
export const FORMAT_OUTPUT_SUPPORT: Record<DiagramFormat, OutputFormat[]> = {
  mermaid: ['png', 'svg'],
  plantuml: ['png', 'svg'],
  d2: ['svg'],  // D2 in Kroki only supports SVG
  graphviz: ['png', 'svg'],
  erd: ['png', 'svg']
};

/**
 * Get Kroki format identifier for a given MCP diagram format
 */
export function getKrokiFormat(mcpFormat: DiagramFormat): string {
  const krokiFormat = FORMAT_TO_KROKI_MAP[mcpFormat];
  if (!krokiFormat) {
    throw new Error(`Unsupported diagram format: ${mcpFormat}`);
  }
  return krokiFormat;
}

/**
 * Get supported output formats for a given diagram format
 */
export function getSupportedOutputFormats(format: DiagramFormat): OutputFormat[] {
  return FORMAT_OUTPUT_SUPPORT[format] || [];
}

/**
 * Check if a format-output combination is supported
 */
export function isFormatOutputSupported(format: DiagramFormat, outputFormat: OutputFormat): boolean {
  const supportedOutputs = getSupportedOutputFormats(format);
  return supportedOutputs.includes(outputFormat);
}

/**
 * Get all supported diagram formats
 */
export function getSupportedFormats(): DiagramFormat[] {
  return Object.keys(FORMAT_TO_KROKI_MAP) as DiagramFormat[];
}

/**
 * Get the default output format for a given diagram format
 * Returns the first supported output format for the diagram type
 */
export function getDefaultOutputFormat(format: DiagramFormat): OutputFormat {
  const supportedOutputs = getSupportedOutputFormats(format);
  if (supportedOutputs.length === 0) {
    throw new Error(`No supported output formats for diagram format: ${format}`);
  }
  return supportedOutputs[0]!; // Safe because we checked length > 0
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

/**
 * Validate that a diagram format is supported
 */
export function validateFormat(format: string): format is DiagramFormat {
  return Object.keys(FORMAT_TO_KROKI_MAP).includes(format);
}

/**
 * Validate that an output format is supported
 */
export function validateOutputFormat(outputFormat: string): outputFormat is OutputFormat {
  return ['png', 'svg'].includes(outputFormat);
}

/**
 * Configuration for diagram format specifics
 */
export const DIAGRAM_FORMAT_CONFIG: Record<DiagramFormat, {
  name: string;
  description: string;
  fileExtensions: string[];
  exampleCode: string;
}> = {
  mermaid: {
    name: 'Mermaid',
    description: 'Modern diagramming and charting tool using JavaScript',
    fileExtensions: ['.mmd', '.mermaid'],
    exampleCode: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]'
  },
  plantuml: {
    name: 'PlantUML',
    description: 'Open-source tool for creating UML diagrams from text descriptions',
    fileExtensions: ['.puml', '.plantuml'],
    exampleCode: '@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml'
  },
  d2: {
    name: 'D2',
    description: 'Modern diagram scripting language that turns text to diagrams',
    fileExtensions: ['.d2'],
    exampleCode: 'users -> database: query\ndatabase -> users: results\napi: {\n  shape: rectangle\n  style.fill: lightblue\n}'
  },
  graphviz: {
    name: 'GraphViz',
    description: 'Open source graph visualization software with DOT language',
    fileExtensions: ['.dot', '.gv'],
    exampleCode: 'digraph G {\n  A -> B;\n  B -> C;\n  A -> C;\n}'
  },
  erd: {
    name: 'ERD',
    description: 'Entity-Relationship Diagrams for database design',
    fileExtensions: ['.er', '.erd'],
    exampleCode: '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}'
  }
}; 