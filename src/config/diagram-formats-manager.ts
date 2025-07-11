/**
 * Central manager for diagram formats configuration
 * Provides runtime format discovery and management via singleton pattern
 */

import type { DiagramFormatConfig, DiagramFormatsRegistry, DiagramFormatMetadata } from './diagram-formats-config.js';
import { DiagramFormatsFactory } from './diagram-formats-factory.js';
import { isValidDiagramFormatConfig } from './diagram-formats-config.js';
import type { OutputFormat } from '../types/diagram-rendering.js';

/**
 * Central manager for diagram formats configuration
 * Implements singleton pattern for consistent format management across the application
 */
export class DiagramFormatsManager {
  private static instance: DiagramFormatsManager;
  private registry: DiagramFormatsRegistry;

  private constructor() {
    this.registry = DiagramFormatsFactory.createDefaultRegistry();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DiagramFormatsManager {
    if (!DiagramFormatsManager.instance) {
      DiagramFormatsManager.instance = new DiagramFormatsManager();
    }
    return DiagramFormatsManager.instance;
  }

  /**
   * Get all enabled formats
   */
  getEnabledFormats(): string[] {
    return Object.entries(this.registry.formats)
      .filter(([_, config]) => config.enabled)
      .map(([id, _]) => id);
  }

  /**
   * Get all formats (enabled and disabled)
   */
  getAllFormats(): string[] {
    return Object.keys(this.registry.formats);
  }

  /**
   * Get format configuration
   */
  getFormatConfig(formatId: string): DiagramFormatConfig | undefined {
    return this.registry.formats[formatId];
  }

  /**
   * Check if format is supported and enabled
   */
  isFormatSupported(formatId: string): boolean {
    const config = this.getFormatConfig(formatId);
    return config?.enabled ?? false;
  }

  /**
   * Check if format exists (regardless of enabled status)
   */
  isFormatAvailable(formatId: string): boolean {
    return formatId in this.registry.formats;
  }

  /**
   * Get Kroki format identifier
   */
  getKrokiFormat(formatId: string): string | undefined {
    return this.getFormatConfig(formatId)?.krokiFormat;
  }

  /**
   * Get supported output formats for a diagram format
   */
  getSupportedOutputFormats(formatId: string): OutputFormat[] {
    return this.getFormatConfig(formatId)?.supportedOutputs ?? [];
  }

  /**
   * Get default output format for a diagram format
   */
  getDefaultOutputFormat(formatId: string): OutputFormat | undefined {
    const supportedOutputs = this.getSupportedOutputFormats(formatId);
    return supportedOutputs[0];
  }

  /**
   * Check if format-output combination is supported
   */
  isFormatOutputSupported(formatId: string, outputFormat: OutputFormat): boolean {
    const supportedOutputs = this.getSupportedOutputFormats(formatId);
    return supportedOutputs.includes(outputFormat);
  }

  /**
   * Get format characteristics for selection heuristics
   */
  getFormatCharacteristics(formatId: string) {
    const config = this.getFormatConfig(formatId);
    if (!config) return undefined;

    return {
      name: formatId,
      displayName: config.displayName,
      description: config.description,
      strengths: config.characteristics.strengths,
      weaknesses: config.characteristics.weaknesses,
      bestFor: config.characteristics.bestFor,
      examples: config.characteristics.examples
    };
  }

  /**
   * Get instruction template for format
   */
  getInstructionTemplate(formatId: string) {
    const config = this.getFormatConfig(formatId);
    if (!config) return undefined;

    return {
      format: formatId,
      displayName: config.displayName,
      syntaxGuidelines: config.instructionTemplate.syntaxGuidelines,
      bestPractices: config.instructionTemplate.bestPractices,
      commonPitfalls: config.instructionTemplate.commonPitfalls,
      examplePatterns: config.instructionTemplate.examplePatterns,
      outputSpecifications: config.instructionTemplate.outputSpecifications
    };
  }

  /**
   * Add new format to registry
   */
  addFormat(formatId: string, config: DiagramFormatConfig): void {
    if (!isValidDiagramFormatConfig(config)) {
      throw new Error(`Invalid format configuration for ${formatId}`);
    }

    this.registry.formats[formatId] = config;
    this.registry.lastUpdated = new Date().toISOString();
  }

  /**
   * Update format configuration
   */
  updateFormat(formatId: string, updates: Partial<DiagramFormatConfig>): void {
    const existing = this.registry.formats[formatId];
    if (!existing) {
      throw new Error(`Format ${formatId} not found`);
    }

    const updated = { ...existing, ...updates };
    if (!isValidDiagramFormatConfig(updated)) {
      throw new Error(`Invalid updated configuration for ${formatId}`);
    }

    this.registry.formats[formatId] = updated;
    this.registry.lastUpdated = new Date().toISOString();
  }

  /**
   * Enable/disable format
   */
  setFormatEnabled(formatId: string, enabled: boolean): void {
    const config = this.getFormatConfig(formatId);
    if (!config) {
      throw new Error(`Format ${formatId} not found`);
    }

    config.enabled = enabled;
    this.registry.lastUpdated = new Date().toISOString();
  }

  /**
   * Remove format from registry
   */
  removeFormat(formatId: string): void {
    if (!(formatId in this.registry.formats)) {
      throw new Error(`Format ${formatId} not found`);
    }

    delete this.registry.formats[formatId];
    this.registry.lastUpdated = new Date().toISOString();
  }

  /**
   * Get registry metadata
   */
  getMetadata(): DiagramFormatMetadata {
    const allFormats = this.getAllFormats();
    const enabledFormats = this.getEnabledFormats();
    const allOutputFormats: Set<OutputFormat> = new Set();

    for (const formatId of allFormats) {
      const outputs = this.getSupportedOutputFormats(formatId);
      outputs.forEach(output => allOutputFormats.add(output));
    }

    return {
      totalFormats: allFormats.length,
      enabledFormats: enabledFormats.length,
      supportedOutputFormats: Array.from(allOutputFormats),
      lastConfigUpdate: this.registry.lastUpdated
    };
  }

  /**
   * Export current registry (for backup/debugging)
   */
  exportRegistry(): DiagramFormatsRegistry {
    return JSON.parse(JSON.stringify(this.registry));
  }

  /**
   * Import registry from external source
   */
  importRegistry(registry: DiagramFormatsRegistry): void {
    // Validate registry structure
    if (!registry.formats || typeof registry.formats !== 'object') {
      throw new Error('Invalid registry format: missing or invalid formats');
    }

    // Validate all format configurations
    for (const [formatId, config] of Object.entries(registry.formats)) {
      if (!isValidDiagramFormatConfig(config)) {
        throw new Error(`Invalid format configuration for ${formatId}`);
      }
    }

    this.registry = {
      ...registry,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.registry = DiagramFormatsFactory.createDefaultRegistry();
  }

  /**
   * Validate current registry integrity
   */
  validateRegistry(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check registry structure
    if (!this.registry.formats) {
      errors.push('Registry missing formats object');
    }

    if (!this.registry.defaultFormat) {
      errors.push('Registry missing default format');
    }

    // Check default format exists and is enabled
    const defaultConfig = this.getFormatConfig(this.registry.defaultFormat);
    if (!defaultConfig) {
      errors.push(`Default format '${this.registry.defaultFormat}' not found`);
    } else if (!defaultConfig.enabled) {
      errors.push(`Default format '${this.registry.defaultFormat}' is disabled`);
    }

    // Validate each format configuration
    for (const [formatId, config] of Object.entries(this.registry.formats)) {
      if (!isValidDiagramFormatConfig(config)) {
        errors.push(`Invalid configuration for format '${formatId}'`);
      }

      if (config.id !== formatId) {
        errors.push(`Format ID mismatch for '${formatId}': config.id is '${config.id}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Load formats from external configuration (placeholder for future extensibility)
   */
  loadFromConfig(configPath: string): void {
    // Implementation placeholder for loading from file/URL
    // For now, just use default registry
    console.warn(`loadFromConfig not implemented, using default registry. Path: ${configPath}`);
  }
} 