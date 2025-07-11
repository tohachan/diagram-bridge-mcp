/**
 * Runtime validation utilities for diagram formats using DiagramFormatsManager
 * Replaces compile-time enum validation with dynamic runtime validation
 */

import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import type { OutputFormat } from '../types/diagram-rendering.js';

/**
 * Type guard to check if a string is a valid diagram format
 * Uses runtime format discovery instead of compile-time enum
 */
export function isValidDiagramFormat(format: unknown): format is string {
  if (typeof format !== 'string') {
    return false;
  }
  
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.isFormatSupported(format);
}

/**
 * Validates an array of diagram formats
 * Returns only valid, enabled formats
 */
export function validateDiagramFormats(formats: unknown): string[] {
  if (!Array.isArray(formats)) {
    return [];
  }
  
  const formatManager = DiagramFormatsManager.getInstance();
  return formats.filter((format): format is string => {
    return typeof format === 'string' && formatManager.isFormatSupported(format);
  });
}

/**
 * Get all supported diagram format IDs
 * Replaces hardcoded arrays with dynamic discovery
 */
export function getSupportedDiagramFormats(): string[] {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getEnabledFormats();
}

/**
 * Get all available diagram format IDs (including disabled ones)
 */
export function getAllDiagramFormats(): string[] {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getAllFormats();
}

/**
 * Validate diagram format and throw descriptive error if invalid
 */
export function assertValidDiagramFormat(format: unknown, context?: string): asserts format is string {
  if (!isValidDiagramFormat(format)) {
    const supportedFormats = getSupportedDiagramFormats();
    const contextMsg = context ? ` (${context})` : '';
    throw new Error(
      `Invalid diagram format${contextMsg}: ${format}. Supported formats: ${supportedFormats.join(', ')}`
    );
  }
}

/**
 * Validate diagram format with detailed error information
 */
export function validateDiagramFormatWithDetails(format: unknown): {
  isValid: boolean;
  format?: string;
  error?: string;
  supportedFormats: string[];
} {
  const supportedFormats = getSupportedDiagramFormats();
  
  if (typeof format !== 'string') {
    return {
      isValid: false,
      error: `Format must be a string, got: ${typeof format}`,
      supportedFormats
    };
  }
  
  if (!isValidDiagramFormat(format)) {
    return {
      isValid: false,
      error: `Unsupported format: ${format}`,
      supportedFormats
    };
  }
  
  return {
    isValid: true,
    format,
    supportedFormats
  };
}

/**
 * Check if a format supports a specific output format
 */
export function isOutputFormatSupported(diagramFormat: string, outputFormat: OutputFormat): boolean {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.isFormatOutputSupported(diagramFormat, outputFormat);
}

/**
 * Get supported output formats for a diagram format
 */
export function getSupportedOutputFormats(diagramFormat: string): OutputFormat[] {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getSupportedOutputFormats(diagramFormat);
}

/**
 * Get default output format for a diagram format
 */
export function getDefaultOutputFormat(diagramFormat: string): OutputFormat | undefined {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getDefaultOutputFormat(diagramFormat);
}

/**
 * Legacy compatibility: Check if format is one of the original enum values
 * This function helps during migration to identify legacy usage
 */
export function isLegacyDiagramFormat(format: string): boolean {
  const legacyFormats = ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'];
  return legacyFormats.includes(format);
}

/**
 * Get Kroki format identifier for a diagram format
 */
export function getKrokiFormat(diagramFormat: string): string | undefined {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getKrokiFormat(diagramFormat);
}

/**
 * Check if format is available but potentially disabled
 */
export function isFormatAvailable(format: string): boolean {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.isFormatAvailable(format);
}

/**
 * Get format configuration details
 */
export function getFormatConfiguration(format: string) {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getFormatConfig(format);
}

/**
 * Get format characteristics for selection heuristics
 */
export function getFormatCharacteristics(format: string) {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getFormatCharacteristics(format);
}

/**
 * Get format instruction template
 */
export function getFormatInstructionTemplate(format: string) {
  const formatManager = DiagramFormatsManager.getInstance();
  return formatManager.getInstructionTemplate(format);
}

/**
 * Validate format mapping consistency
 * Useful for debugging and health checks
 */
export function validateFormatMappingConsistency(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const formatManager = DiagramFormatsManager.getInstance();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const allFormats = formatManager.getAllFormats();
    const enabledFormats = formatManager.getEnabledFormats();
    
    // Check that all enabled formats have valid configurations
    for (const format of enabledFormats) {
      const config = formatManager.getFormatConfig(format);
      if (!config) {
        errors.push(`Enabled format '${format}' has no configuration`);
        continue;
      }
      
      // Check required fields
      if (!config.id || !config.displayName || !config.krokiFormat) {
        errors.push(`Format '${format}' missing required configuration fields`);
      }
      
      // Check output formats
      if (!config.supportedOutputs || config.supportedOutputs.length === 0) {
        errors.push(`Format '${format}' has no supported output formats`);
      }
      
      // Check for valid output formats
      const validOutputs = ['png', 'svg'];
      const invalidOutputs = config.supportedOutputs.filter(output => !validOutputs.includes(output));
      if (invalidOutputs.length > 0) {
        errors.push(`Format '${format}' has invalid output formats: ${invalidOutputs.join(', ')}`);
      }
    }
    
    // Check for disabled formats
    const disabledFormats = allFormats.filter(format => !enabledFormats.includes(format));
    if (disabledFormats.length > 0) {
      warnings.push(`Disabled formats detected: ${disabledFormats.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings
    };
  }
} 