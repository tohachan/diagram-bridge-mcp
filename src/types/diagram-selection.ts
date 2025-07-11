/**
 * Diagram format identifier
 * Changed from union type to string to support dynamic format discovery
 * Use runtime validation functions from format-validation.ts for type safety
 */
export type DiagramFormat = string;

/**
 * Input schema for the help_choose_diagram MCP resource
 */
export interface DiagramSelectionInput {
  /**
   * User's visualization request describing what they want to diagram
   */
  user_request: string;
  
  /**
   * Optional array of available diagram formats to choose from
   * If not provided, all supported formats will be considered
   */
  available_formats?: DiagramFormat[];
}

/**
 * Output schema for the help_choose_diagram MCP resource
 */
export interface DiagramSelectionOutput {
  /**
   * Constructed prompt text for the LLM to help choose the best diagram format
   */
  prompt_text: string;
}

/**
 * Characteristics of each diagram format for decision making
 */
export interface DiagramFormatCharacteristics {
  name: DiagramFormat;
  displayName: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  examples: string[];
}

/**
 * Decision heuristics for format selection
 */
export interface FormatSelectionHeuristic {
  keywords: string[];
  format: DiagramFormat;
  confidence: number;
  reasoning: string;
}

/**
 * Template variables for prompt generation
 */
export interface PromptTemplateVariables {
  userRequest: string;
  availableFormats: DiagramFormat[];
  formatDescriptions: DiagramFormatCharacteristics[];
  selectionHeuristics: FormatSelectionHeuristic[];
}

/**
 * Validation result for input parameters
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
} 