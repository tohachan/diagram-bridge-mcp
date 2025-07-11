/**
 * Dynamic schema generation utilities using DiagramFormatsManager
 * Replaces hardcoded z.enum schemas with runtime validation
 */

import { z } from 'zod';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import { 
  isValidDiagramFormat, 
  getSupportedDiagramFormats,
  validateDiagramFormatWithDetails 
} from './format-validation.js';

/**
 * Creates a Zod schema for diagram format validation using runtime format discovery
 */
export function createDiagramFormatSchema() {
  return z.string().refine(
    (format) => isValidDiagramFormat(format),
    (format) => {
      const validation = validateDiagramFormatWithDetails(format);
      return {
        message: validation.error || `Invalid diagram format: ${format}. Supported formats: ${validation.supportedFormats.join(', ')}`
      };
    }
  );
}

/**
 * Creates a Zod schema for available formats array validation
 */
export function createAvailableFormatsSchema() {
  return z.array(createDiagramFormatSchema()).refine(
    (formats) => {
      // Check for duplicates
      const uniqueFormats = new Set(formats);
      return uniqueFormats.size === formats.length;
    },
    {
      message: 'Available formats cannot contain duplicates'
    }
  ).refine(
    (formats) => {
      // Check for reasonable length
      const supportedFormats = getSupportedDiagramFormats();
      return formats.length <= supportedFormats.length;
    },
    (formats) => {
      const supportedFormats = getSupportedDiagramFormats();
      return {
        message: `Too many formats specified. Maximum allowed: ${supportedFormats.length}`
      };
    }
  );
}

/**
 * Creates input schema for help_choose_diagram tool
 */
export function createDiagramSelectionInputSchema() {
  return {
    user_request: z.string()
      .min(5, 'User request must be at least 5 characters')
      .max(1000, 'User request must not exceed 1000 characters')
      .describe('User\'s visualization request describing what they want to diagram'),
    available_formats: createAvailableFormatsSchema()
      .optional()
      .describe('Optional array of available diagram formats to choose from')
  };
}

/**
 * Creates input schema for get_diagram_instructions tool
 */
export function createDiagramInstructionsInputSchema() {
  return {
    user_request: z.string()
      .min(5, 'User request must be at least 5 characters')
      .max(2000, 'User request must not exceed 2000 characters')
      .describe('Original natural language request describing what diagram to create'),
    diagram_format: createDiagramFormatSchema()
      .describe('Target diagram language/format')
  };
}

/**
 * Creates input schema for render_diagram tool
 */
export function createDiagramRenderingInputSchema() {
  return {
    code: z.string()
      .min(1, 'Diagram code is required')
      .max(100000, 'Diagram code must not exceed 100,000 characters')
      .describe('The source code of the diagram to render'),
    diagram_format: createDiagramFormatSchema()
      .describe('The format of the diagram source code'),
    output_format: z.enum(['png', 'svg'])
      .optional()
      .describe('The desired output image format (defaults to the first supported format for the diagram type)')
  };
}

/**
 * Get supported formats for documentation/error messages
 */
export function getSupportedFormatsForDocs(): string {
  const formats = getSupportedDiagramFormats();
  return formats.join(', ');
}

/**
 * Validate format availability at runtime for enhanced error messages
 */
export function validateFormatAvailability(format: string): {
  isValid: boolean;
  message?: string;
  alternatives?: string[];
} {
  const formatManager = DiagramFormatsManager.getInstance();
  
  if (!formatManager.isFormatAvailable(format)) {
    const availableFormats = formatManager.getAllFormats();
    return {
      isValid: false,
      message: `Format '${format}' is not available`,
      alternatives: availableFormats
    };
  }
  
  if (!formatManager.isFormatSupported(format)) {
    return {
      isValid: false,
      message: `Format '${format}' is available but currently disabled`
    };
  }
  
  return { isValid: true };
} 