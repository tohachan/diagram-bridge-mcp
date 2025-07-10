import { DiagramFormat, DiagramSelectionInput, ValidationResult } from '../types/diagram-selection.js';
import { DIAGRAM_FORMAT_DEFINITIONS } from '../resources/diagram-selection-config.js';

/**
 * Input validation utility for diagram selection
 */
export class DiagramSelectionValidator {
  /**
   * Validate complete input for the help_choose_diagram resource
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

    const typedInput = input as Partial<DiagramSelectionInput>;

    // Validate user_request
    const userRequestErrors = this.validateUserRequest(typedInput.user_request);
    errors.push(...userRequestErrors);

    // Validate available_formats if provided
    if (typedInput.available_formats !== undefined) {
      const formatsErrors = this.validateAvailableFormats(typedInput.available_formats);
      errors.push(...formatsErrors);
    }

    // Check for unexpected properties
    const allowedProperties = ['user_request', 'available_formats'];
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
    }

    if (trimmedRequest.length < 5) {
      errors.push('user_request must be at least 5 characters long');
    }

    if (trimmedRequest.length > 1000) {
      errors.push('user_request cannot exceed 1000 characters');
    }

    // Check for potentially problematic content
    if (this.containsMaliciousContent(trimmedRequest)) {
      errors.push('user_request contains potentially malicious content');
    }

    return errors;
  }

  /**
   * Validate available_formats field
   */
  private validateAvailableFormats(availableFormats: unknown): string[] {
    const errors: string[] = [];

    if (!Array.isArray(availableFormats)) {
      errors.push('available_formats must be an array');
      return errors;
    }

    if (availableFormats.length === 0) {
      errors.push('available_formats cannot be empty if provided');
      return errors;
    }

    // Check for valid format strings
    const supportedFormats = Object.keys(DIAGRAM_FORMAT_DEFINITIONS) as DiagramFormat[];
    const invalidFormats: unknown[] = [];
    const duplicates: string[] = [];
    const seen = new Set<string>();

    for (const format of availableFormats) {
      if (typeof format !== 'string') {
        invalidFormats.push(format);
        continue;
      }

      if (!supportedFormats.includes(format as DiagramFormat)) {
        invalidFormats.push(format);
        continue;
      }

      if (seen.has(format)) {
        duplicates.push(format);
      } else {
        seen.add(format);
      }
    }

    if (invalidFormats.length > 0) {
      errors.push(`Invalid formats: ${invalidFormats.join(', ')}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    if (duplicates.length > 0) {
      errors.push(`Duplicate formats found: ${duplicates.join(', ')}`);
    }

    if (availableFormats.length > supportedFormats.length) {
      errors.push(`Too many formats specified. Maximum allowed: ${supportedFormats.length}`);
    }

    return errors;
  }

  /**
   * Check for potentially malicious content in user input
   */
  private containsMaliciousContent(content: string): boolean {
    // Basic security checks for potentially malicious patterns
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Sanitize and normalize user input
   */
  sanitizeInput(input: DiagramSelectionInput): DiagramSelectionInput {
    const result: DiagramSelectionInput = {
      user_request: this.sanitizeUserRequest(input.user_request)
    };
    
    if (input.available_formats) {
      result.available_formats = this.sanitizeAvailableFormats(input.available_formats);
    }
    
    return result;
  }

  /**
   * Sanitize user request string
   */
  private sanitizeUserRequest(userRequest: string): string {
    return userRequest
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 1000); // Ensure max length
  }

  /**
   * Sanitize and deduplicate available formats
   */
  private sanitizeAvailableFormats(formats: DiagramFormat[]): DiagramFormat[] {
    const supportedFormats = Object.keys(DIAGRAM_FORMAT_DEFINITIONS) as DiagramFormat[];
    
    // Filter to only supported formats and remove duplicates
    const validFormats = formats.filter(format => supportedFormats.includes(format));
    
    return Array.from(new Set(validFormats));
  }

  /**
   * Create a safe input object with validation
   */
  createValidatedInput(rawInput: unknown): { input: DiagramSelectionInput | null; errors: string[] } {
    const validation = this.validateInput(rawInput);
    
    if (!validation.isValid) {
      return {
        input: null,
        errors: validation.errors
      };
    }

    const typedInput = rawInput as DiagramSelectionInput;
    const sanitizedInput = this.sanitizeInput(typedInput);

    return {
      input: sanitizedInput,
      errors: []
    };
  }
} 