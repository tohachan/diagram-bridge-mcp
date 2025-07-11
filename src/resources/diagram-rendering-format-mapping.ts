import { FormatMapping, OutputFormat } from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { getDynamicFormatMapping, getContentType as getDynamicContentType, validateOutputFormat as validateDynamicOutputFormat } from '../utils/dynamic-format-mapping.js';

/**
 * Mapping from MCP diagram formats to Kroki format identifiers
 * Now dynamically generated from DiagramFormatsManager
 */
export function getKrokiFormatMappings(): FormatMapping[] {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.getFormatMappings();
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getKrokiFormatMappings() instead
 */
export const KROKI_FORMAT_MAPPINGS: FormatMapping[] = getKrokiFormatMappings();

/**
 * Generate lookup table for quick access to Kroki format identifiers
 * Now dynamically generated from DiagramFormatsManager
 */
export function getFormatToKrokiMap(): Record<DiagramFormat, string> {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.generateKrokiLookupTable();
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getFormatToKrokiMap() instead
 */
export const FORMAT_TO_KROKI_MAP: Record<DiagramFormat, string> = getFormatToKrokiMap();

/**
 * Generate lookup table for supported output formats by diagram format
 * Now dynamically generated from DiagramFormatsManager
 */
export function getFormatOutputSupportMap(): Record<DiagramFormat, OutputFormat[]> {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.generateOutputSupportTable();
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getFormatOutputSupportMap() instead
 */
export const FORMAT_OUTPUT_SUPPORT: Record<DiagramFormat, OutputFormat[]> = getFormatOutputSupportMap();

/**
 * Get Kroki format identifier for a given MCP diagram format
 * Now uses dynamic format discovery
 */
export function getKrokiFormat(mcpFormat: DiagramFormat): string {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.getKrokiFormatSafe(mcpFormat);
}

/**
 * Get supported output formats for a given diagram format
 * Now uses dynamic format discovery
 */
export function getSupportedOutputFormats(format: DiagramFormat): OutputFormat[] {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.getSupportedOutputFormats(format);
}

/**
 * Check if a format-output combination is supported
 * Now uses dynamic format discovery
 */
export function isFormatOutputSupported(format: DiagramFormat, outputFormat: OutputFormat): boolean {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.isFormatOutputSupported(format, outputFormat);
}

/**
 * Get all supported diagram formats
 * Now uses dynamic format discovery
 */
export function getSupportedFormats(): DiagramFormat[] {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.getSupportedFormats();
}

/**
 * Get the default output format for a given diagram format
 * Returns the first supported output format for the diagram type
 * Now uses dynamic format discovery
 */
export function getDefaultOutputFormat(format: DiagramFormat): OutputFormat {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.getDefaultOutputFormatSafe(format);
}

/**
 * Get MIME type for output format
 * Now uses centralized implementation from dynamic mapping
 */
export function getContentType(outputFormat: OutputFormat): string {
  return getDynamicContentType(outputFormat);
}

/**
 * Validate that a diagram format is supported
 * Now uses dynamic format discovery
 */
export function validateFormat(format: string): format is DiagramFormat {
  const dynamicMapping = getDynamicFormatMapping();
  return dynamicMapping.validateFormat(format);
}

/**
 * Validate that an output format is supported
 * Now uses centralized implementation from dynamic mapping
 */
export function validateOutputFormat(outputFormat: string): outputFormat is OutputFormat {
  return validateDynamicOutputFormat(outputFormat);
}

/**
 * Generate configuration for diagram format specifics
 * Now dynamically generated from DiagramFormatsManager
 */
export function getDiagramFormatConfig(): Record<DiagramFormat, {
  name: string;
  description: string;
  fileExtensions: string[];
  exampleCode: string;
}> {
  const dynamicMapping = getDynamicFormatMapping();
  const supportedFormats = dynamicMapping.getSupportedFormats();
  const config: Record<string, {
    name: string;
    description: string;
    fileExtensions: string[];
    exampleCode: string;
  }> = {};

  for (const format of supportedFormats) {
    const formatConfig = dynamicMapping.getFormatConfig(format);
    if (formatConfig) {
      config[format] = formatConfig;
    }
  }

  return config;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getDiagramFormatConfig() instead
 */
export const DIAGRAM_FORMAT_CONFIG: Record<DiagramFormat, {
  name: string;
  description: string;
  fileExtensions: string[];
  exampleCode: string;
}> = getDiagramFormatConfig(); 