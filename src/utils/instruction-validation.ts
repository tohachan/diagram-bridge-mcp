import { DiagramInstructionsInput, ValidationResult } from '../types/diagram-instructions.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { 
  isValidDiagramFormat, 
  getSupportedDiagramFormats,
  validateDiagramFormatWithDetails,
  getFormatInstructionTemplate
} from './format-validation.js';

/**
 * Input validation utility for diagram instructions
 */
export class DiagramInstructionsValidator {
  /**
   * Validate complete input for the get_diagram_instructions resource
   */
  validateInput(input: unknown): ValidationResult {
    const errors: string[] = [];

    // Check if input is an object
    if (!input || typeof input !== 'object') {
      return {
        isValid: false,
        errors: ['Input must be a valid object']
      };
    }

    const typedInput = input as Partial<DiagramInstructionsInput>;

    // Validate user_request
    const userRequestErrors = this.validateUserRequest(typedInput.user_request);
    errors.push(...userRequestErrors);

    // Validate diagram_format
    const formatErrors = this.validateDiagramFormat(typedInput.diagram_format);
    errors.push(...formatErrors);

    // Check for unexpected properties
    const allowedProperties = ['user_request', 'diagram_format'];
    const inputKeys = Object.keys(typedInput);
    const unexpectedProperties = inputKeys.filter(key => !allowedProperties.includes(key));
    
    if (unexpectedProperties.length > 0) {
      errors.push(`Unexpected properties: ${unexpectedProperties.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user_request field
   */
  private validateUserRequest(userRequest: unknown): string[] {
    const errors: string[] = [];

    if (userRequest === undefined || userRequest === null) {
      errors.push('user_request is required');
      return errors;
    }

    if (typeof userRequest !== 'string') {
      errors.push('user_request must be a string');
      return errors;
    }

    const trimmedRequest = userRequest.trim();

    if (trimmedRequest.length === 0) {
      errors.push('user_request cannot be empty');
    } else if (trimmedRequest.length < 5) {
      errors.push('user_request must be at least 5 characters long');
    } else if (trimmedRequest.length > 2000) {
      errors.push('user_request must not exceed 2000 characters');
    }

    // Check for potentially malicious content
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    const hasMaliciousContent = maliciousPatterns.some(pattern => pattern.test(userRequest));
    if (hasMaliciousContent) {
      errors.push('user_request contains potentially malicious content');
    }

    return errors;
  }

  /**
   * Validate diagram_format field
   */
  private validateDiagramFormat(diagramFormat: unknown): string[] {
    const errors: string[] = [];

    if (diagramFormat === undefined || diagramFormat === null) {
      errors.push('diagram_format is required');
      return errors;
    }

    const validationResult = validateDiagramFormatWithDetails(diagramFormat);
    if (!validationResult.isValid) {
      errors.push(validationResult.error || 'Invalid diagram format');
    }

    return errors;
  }

  /**
   * Sanitize input to prevent potential security issues
   */
  sanitizeInput(input: DiagramInstructionsInput): DiagramInstructionsInput {
    return {
      user_request: this.sanitizeString(input.user_request),
      diagram_format: input.diagram_format // No sanitization needed for enum values
    };
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(str: string): string {
    // Remove potential HTML/script tags
    const sanitized = str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '');

    // Normalize whitespace
    return sanitized.replace(/\s+/g, ' ').trim();
  }

  /**
   * Create a safe input object with validation
   */
  createValidatedInput(rawInput: unknown): { input: DiagramInstructionsInput | null; errors: string[] } {
    const validation = this.validateInput(rawInput);
    
    if (!validation.isValid) {
      return {
        input: null,
        errors: validation.errors
      };
    }

    const typedInput = rawInput as DiagramInstructionsInput;
    const sanitizedInput = this.sanitizeInput(typedInput);

    return {
      input: sanitizedInput,
      errors: []
    };
  }

  /**
   * Validate that template exists for the given format
   * Now uses dynamic format discovery
   */
  validateFormatSupport(format: DiagramFormat): boolean {
    const template = getFormatInstructionTemplate(format);
    return template !== undefined;
  }

  /**
   * Get all supported formats
   */
  getSupportedFormats(): DiagramFormat[] {
    return getSupportedDiagramFormats();
  }
} 