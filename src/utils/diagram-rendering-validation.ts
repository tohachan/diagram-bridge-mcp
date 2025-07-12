import { 
  DiagramRenderingInput, 
  DiagramRenderingOutput,
  ValidationResult,
  OutputFormat,
  DiagramRenderingError,
  DiagramRenderingErrorInfo
} from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { 
  isValidDiagramFormat, 
  getSupportedDiagramFormats,
  validateDiagramFormatWithDetails,
  isOutputFormatSupported,
  getSupportedOutputFormats,
  getDefaultOutputFormat
} from './format-validation.js';

/**
 * Input validation utility for diagram rendering
 */
export class DiagramRenderingValidator {
  private readonly MAX_CODE_LENGTH = 100000;
  private readonly MIN_CODE_LENGTH = 1;
  private readonly SUPPORTED_OUTPUT_FORMATS: OutputFormat[] = ['png', 'svg'];

  /**
   * Validate complete input for the render_diagram tool
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

    const typedInput = input as Partial<DiagramRenderingInput>;

    // Validate code
    const codeErrors = this.validateCode(typedInput.code);
    errors.push(...codeErrors);

    // Validate diagram_format
    const formatErrors = this.validateDiagramFormat(typedInput.diagram_format);
    errors.push(...formatErrors);

    // Validate output_format if provided
    if (typedInput.output_format !== undefined) {
      const outputFormatErrors = this.validateOutputFormat(typedInput.output_format);
      errors.push(...outputFormatErrors);
    }

    // Check for unexpected properties
    const allowedProperties = ['code', 'diagram_format', 'output_format'];
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
   * Validate code field
   */
  private validateCode(code: unknown): string[] {
    const errors: string[] = [];

    if (code === undefined || code === null) {
      errors.push('code is required');
      return errors;
    }

    if (typeof code !== 'string') {
      errors.push('code must be a string');
      return errors;
    }

    const trimmedCode = code.trim();

    if (trimmedCode.length === 0) {
      errors.push('code cannot be empty');
    }

    if (trimmedCode.length < this.MIN_CODE_LENGTH) {
      errors.push(`code must be at least ${this.MIN_CODE_LENGTH} character long`);
    }

    if (trimmedCode.length > this.MAX_CODE_LENGTH) {
      errors.push(`code cannot exceed ${this.MAX_CODE_LENGTH} characters`);
    }

    // Check for potentially malicious content
    if (this.containsMaliciousContent(trimmedCode)) {
      errors.push('code contains potentially malicious content');
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
   * Validate output_format field
   */
  private validateOutputFormat(outputFormat: unknown): string[] {
    const errors: string[] = [];

    if (typeof outputFormat !== 'string') {
      errors.push('output_format must be a string');
      return errors;
    }

    if (!this.SUPPORTED_OUTPUT_FORMATS.includes(outputFormat as OutputFormat)) {
      errors.push(`Unsupported output format: ${outputFormat}. Supported formats: ${this.SUPPORTED_OUTPUT_FORMATS.join(', ')}`);
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
      /\s+on[a-z]+\s*=/gi, // HTML event handlers (with space before 'on')
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
      // Additional patterns for diagram code
      /file:\/\//gi,
      /\\x[0-9a-f]{2}/gi, // hex encoding
      /eval\s*\(/gi,
      /exec\s*\(/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Sanitize and normalize user input
   */
  sanitizeInput(input: DiagramRenderingInput): DiagramRenderingInput {
    // Get default output format if not provided
    const defaultOutput = getDefaultOutputFormat(input.diagram_format);
    const outputFormat = input.output_format || defaultOutput || 'png'; // fallback to png
    
    const result: DiagramRenderingInput = {
      code: this.sanitizeCode(input.code),
      diagram_format: input.diagram_format,
      output_format: outputFormat
    };
    
    return result;
  }

  /**
   * Sanitize diagram code
   */
  private sanitizeCode(code: string): string {
    return code
      .trim()
      .substring(0, this.MAX_CODE_LENGTH); // Ensure max length
  }

  /**
   * Create a safe input object with validation
   */
  createValidatedInput(rawInput: unknown): { input: DiagramRenderingInput | null; errors: string[] } {
    const validation = this.validateInput(rawInput);
    
    if (!validation.isValid) {
      return {
        input: null,
        errors: validation.errors
      };
    }

    try {
      const typedInput = rawInput as DiagramRenderingInput;
      const sanitizedInput = this.sanitizeInput(typedInput);
      
      return {
        input: sanitizedInput,
        errors: []
      };
    } catch (error) {
      return {
        input: null,
        errors: [`Failed to create validated input: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validate format-output combination compatibility
   * Now uses dynamic format discovery instead of hardcoded restrictions
   */
  validateFormatOutputCombination(format: DiagramFormat, outputFormat: OutputFormat): ValidationResult {
    const errors: string[] = [];

    // Use dynamic format discovery to check compatibility
    if (!isOutputFormatSupported(format, outputFormat)) {
      const supportedOutputs = getSupportedOutputFormats(format);
      errors.push(`Format ${format} does not support ${outputFormat} output. Supported outputs: ${supportedOutputs.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create error info object for standardized error handling
   */
  createErrorInfo(
    type: DiagramRenderingError, 
    message: string, 
    details?: Record<string, unknown>
  ): DiagramRenderingErrorInfo {
    const retryableErrors: DiagramRenderingError[] = [
      'KROKI_UNAVAILABLE',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR'
    ];

    const result: DiagramRenderingErrorInfo = {
      type,
      message,
      retryable: retryableErrors.includes(type)
    };

    if (details) {
      result.details = details;
    }

    return result;
  }

  /**
   * Validate output data structure
   */
  validateOutput(output: unknown): ValidationResult {
    const errors: string[] = [];

    if (!output || typeof output !== 'object') {
      return {
        isValid: false,
        errors: ['Output must be a valid object']
      };
    }

    const typedOutput = output as Partial<DiagramRenderingOutput>;

    // Validate file_path
    if (!typedOutput.file_path || typeof typedOutput.file_path !== 'string') {
      errors.push('file_path is required and must be a string');
    }

    // Validate resource_uri
    if (!typedOutput.resource_uri || typeof typedOutput.resource_uri !== 'string') {
      errors.push('resource_uri is required and must be a string');
    }

    // Validate content_type
    if (!typedOutput.content_type || typeof typedOutput.content_type !== 'string') {
      errors.push('content_type is required and must be a string');
    } else {
      const validContentTypes = ['image/png', 'image/svg+xml'];
      if (!validContentTypes.includes(typedOutput.content_type)) {
        errors.push(`Invalid content_type: ${typedOutput.content_type}. Must be one of: ${validContentTypes.join(', ')}`);
      }
    }

    // Validate file_size
    if (typeof typedOutput.file_size !== 'number' || typedOutput.file_size < 0) {
      errors.push('file_size is required and must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 