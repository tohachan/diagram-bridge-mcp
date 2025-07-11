/**
 * Type definitions for diagram code generation instructions
 */

import type { DiagramFormat } from './diagram-selection.js';

/**
 * Input schema for the get_diagram_instructions MCP resource
 */
export interface DiagramInstructionsInput {
  /**
   * Original natural language request from the user
   */
  user_request: string;
  
  /**
   * Target diagram language/format
   */
  diagram_format: DiagramFormat;
}

/**
 * Output schema for the get_diagram_instructions MCP resource
 */
export interface DiagramInstructionsOutput {
  /**
   * Constructed instruction prompt for LLM
   */
  prompt_text: string;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Template variables for instruction generation
 */
export interface InstructionTemplateVariables {
  userRequest: string;
  diagramFormat: DiagramFormat;
  complexityLevel?: 'simple' | 'moderate' | 'complex';
  domainContext?: string;
  additionalGuidance?: string[];
}

/**
 * Format-specific instruction template configuration
 */
export interface FormatInstructionTemplate {
  format: DiagramFormat;
  displayName: string;
  syntaxGuidelines: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  examplePatterns: string[];
  outputSpecifications: string[];
}

/**
 * Context enhancement configuration
 */
export interface ContextEnhancement {
  domainKeywords: string[];
  complexityIndicators: string[];
  specificInstructions: string[];
} 