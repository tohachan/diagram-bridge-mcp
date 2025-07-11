/**
 * Dynamic diagram format configuration interfaces and types
 * This provides the foundation for runtime format discovery and management
 */

import type { OutputFormat } from '../types/diagram-rendering.js';

/**
 * Complete configuration for a single diagram format
 */
export interface DiagramFormatConfig {
  /** Internal format identifier */
  id: string;
  /** Display name for UI */
  displayName: string;
  /** Format description */
  description: string;
  /** Kroki service identifier */
  krokiFormat: string;
  /** Supported output formats */
  supportedOutputs: OutputFormat[];
  /** Whether format is enabled */
  enabled: boolean;
  /** Format characteristics for selection */
  characteristics: {
    strengths: string[];
    weaknesses: string[];
    bestFor: string[];
    examples: string[];
  };
  /** Instruction templates */
  instructionTemplate: {
    syntaxGuidelines: string[];
    bestPractices: string[];
    commonPitfalls: string[];
    examplePatterns: string[];
    outputSpecifications: string[];
  };
  /** File extensions */
  fileExtensions: string[];
  /** Example code */
  exampleCode: string;
}

/**
 * Complete diagram formats registry
 */
export interface DiagramFormatsRegistry {
  formats: Record<string, DiagramFormatConfig>;
  defaultFormat: string;
  lastUpdated: string;
  version: string;
}

/**
 * Configuration metadata and validation helpers
 */
export interface DiagramFormatMetadata {
  totalFormats: number;
  enabledFormats: number;
  supportedOutputFormats: OutputFormat[];
  lastConfigUpdate: string;
}

/**
 * Type guard for validating DiagramFormatConfig
 */
export function isValidDiagramFormatConfig(config: unknown): config is DiagramFormatConfig {
  if (!config || typeof config !== 'object') return false;
  
  const c = config as Partial<DiagramFormatConfig>;
  
  return !!(
    typeof c.id === 'string' &&
    typeof c.displayName === 'string' &&
    typeof c.description === 'string' &&
    typeof c.krokiFormat === 'string' &&
    Array.isArray(c.supportedOutputs) &&
    typeof c.enabled === 'boolean' &&
    c.characteristics &&
    c.instructionTemplate &&
    Array.isArray(c.fileExtensions) &&
    typeof c.exampleCode === 'string'
  );
}

/**
 * Type guard for validating DiagramFormatsRegistry
 */
export function isValidDiagramFormatsRegistry(registry: unknown): registry is DiagramFormatsRegistry {
  if (!registry || typeof registry !== 'object') return false;
  
  const r = registry as Partial<DiagramFormatsRegistry>;
  
  return !!(
    r.formats &&
    typeof r.formats === 'object' &&
    typeof r.defaultFormat === 'string' &&
    typeof r.lastUpdated === 'string' &&
    typeof r.version === 'string'
  );
} 