import { z } from 'zod';
import {
  createDiagramFormatSchema,
  createAvailableFormatsSchema,
  createDiagramSelectionInputSchema,
  createDiagramInstructionsInputSchema,
  createDiagramRenderingInputSchema,
  getSupportedFormatsForDocs,
  validateFormatAvailability,
} from '../utils/schema-generation';
import { DiagramFormatsManager } from '../config/diagram-formats-manager';

// Mock dependencies
jest.mock('../config/diagram-formats-manager');
jest.mock('../utils/format-validation', () => ({
  isValidDiagramFormat: jest.fn(),
  getSupportedDiagramFormats: jest.fn(),
  validateDiagramFormatWithDetails: jest.fn(),
}));

const mockFormatValidation = require('../utils/format-validation');
const mockDiagramFormatsManager = DiagramFormatsManager as jest.Mocked<typeof DiagramFormatsManager>;

describe('schema-generation.ts - Comprehensive Branch Coverage', () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockInstance = {
      isFormatAvailable: jest.fn(),
      isFormatSupported: jest.fn(),
      getAllFormats: jest.fn(),
    };
    mockDiagramFormatsManager.getInstance = jest.fn().mockReturnValue(mockInstance);
    
    mockFormatValidation.getSupportedDiagramFormats.mockReturnValue([
      'mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2'
    ]);
  });

  describe('createDiagramFormatSchema - Validation Branches', () => {
    it('should pass validation for valid format', () => {
      const schema = createDiagramFormatSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(true);
      
      const result = schema.safeParse('mermaid');
      expect(result.success).toBe(true);
      expect(mockFormatValidation.isValidDiagramFormat).toHaveBeenCalledWith('mermaid');
    });

    it('should fail validation for invalid format', () => {
      const schema = createDiagramFormatSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: 'Unsupported format',
        supportedFormats: ['mermaid', 'plantuml']
      });
      
      const result = schema.safeParse('invalid-format');
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Unsupported format');
      }
    });

    it('should generate default error message when no specific error provided', () => {
      const schema = createDiagramFormatSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: null,
        supportedFormats: ['mermaid', 'plantuml']
      });
      
      const result = schema.safeParse('unknown-format');
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Invalid diagram format: unknown-format');
        expect(result.error.issues[0].message).toContain('Supported formats: mermaid, plantuml');
      }
    });

    it('should handle empty string format', () => {
      const schema = createDiagramFormatSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: 'Empty format not allowed',
        supportedFormats: ['mermaid']
      });
      
      const result = schema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should handle special characters in format', () => {
      const schema = createDiagramFormatSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: 'Special characters not supported',
        supportedFormats: ['mermaid']
      });
      
      const result = schema.safeParse('format@#$%');
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Special characters not supported');
      }
    });
  });

  describe('createAvailableFormatsSchema - Array Validation Branches', () => {
    beforeEach(() => {
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(true);
    });

    it('should pass validation for valid unique formats array', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue([
        'mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2'
      ]);
      
      const result = schema.safeParse(['mermaid', 'plantuml']);
      expect(result.success).toBe(true);
    });

    it('should fail validation for duplicate formats', () => {
      const schema = createAvailableFormatsSchema();
      
      const result = schema.safeParse(['mermaid', 'plantuml', 'mermaid']);
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toBe('Available formats cannot contain duplicates');
      }
    });

    it('should fail validation for too many formats', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = schema.safeParse(['mermaid', 'plantuml', 'graphviz']);
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Too many formats specified. Maximum allowed: 2');
      }
    });

    it('should handle empty array', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = schema.safeParse([]);
      expect(result.success).toBe(true);
    });

    it('should handle single format array', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = schema.safeParse(['mermaid']);
      expect(result.success).toBe(true);
    });

    it('should fail validation when format validation fails', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: 'Invalid format',
        supportedFormats: ['mermaid']
      });
      
      const result = schema.safeParse(['invalid-format']);
      expect(result.success).toBe(false);
    });

    it('should handle maximum allowed formats exactly', () => {
      const schema = createAvailableFormatsSchema();
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = schema.safeParse(['mermaid', 'plantuml']);
      expect(result.success).toBe(true);
    });
  });

  describe('createDiagramSelectionInputSchema - Input Validation', () => {
    it('should validate correct input schema', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(true);
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = schema.safeParse({
        user_request: 'Create a flowchart showing the process',
        available_formats: ['mermaid', 'plantuml']
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation for too short user_request', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Hi',
        available_formats: ['mermaid']
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('User request must be at least 5 characters');
      }
    });

    it('should fail validation for too long user_request', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      const longRequest = 'a'.repeat(1001);
      
      const result = schema.safeParse({
        user_request: longRequest,
        available_formats: ['mermaid']
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('User request must not exceed 1000 characters');
      }
    });

    it('should pass validation without available_formats (optional)', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Create a simple diagram'
      });
      expect(result.success).toBe(true);
    });

    it('should handle exactly minimum length user_request', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Hello'
      });
      expect(result.success).toBe(true);
    });

    it('should handle exactly maximum length user_request', () => {
      const schema = z.object(createDiagramSelectionInputSchema());
      const maxRequest = 'a'.repeat(1000);
      
      const result = schema.safeParse({
        user_request: maxRequest
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createDiagramInstructionsInputSchema - Input Validation', () => {
    beforeEach(() => {
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(true);
    });

    it('should validate correct input schema', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Create a sequence diagram',
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation for too short user_request', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Hi',
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('User request must be at least 5 characters');
      }
    });

    it('should fail validation for too long user_request', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      const longRequest = 'a'.repeat(2001);
      
      const result = schema.safeParse({
        user_request: longRequest,
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('User request must not exceed 2000 characters');
      }
    });

    it('should handle exactly maximum length user_request', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      const maxRequest = 'a'.repeat(2000);
      
      const result = schema.safeParse({
        user_request: maxRequest,
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing diagram_format', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      
      const result = schema.safeParse({
        user_request: 'Create a diagram'
      });
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid diagram_format', () => {
      const schema = z.object(createDiagramInstructionsInputSchema());
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(false);
      mockFormatValidation.validateDiagramFormatWithDetails.mockReturnValue({
        isValid: false,
        error: 'Invalid format',
        supportedFormats: ['mermaid']
      });
      
      const result = schema.safeParse({
        user_request: 'Create a diagram',
        diagram_format: 'invalid'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createDiagramRenderingInputSchema - Rendering Validation', () => {
    beforeEach(() => {
      mockFormatValidation.isValidDiagramFormat.mockReturnValue(true);
    });

    it('should validate correct rendering input schema', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      
      const result = schema.safeParse({
        code: 'graph TD; A-->B;',
        diagram_format: 'mermaid',
        output_format: 'png'
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation for empty code', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      
      const result = schema.safeParse({
        code: '',
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Diagram code is required');
      }
    });

    it('should fail validation for too long code', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      const longCode = 'a'.repeat(100001);
      
      const result = schema.safeParse({
        code: longCode,
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toContain('Diagram code must not exceed 100,000 characters');
      }
    });

    it('should handle exactly maximum length code', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      const maxCode = 'a'.repeat(100000);
      
      const result = schema.safeParse({
        code: maxCode,
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(true);
    });

    it('should pass validation without output_format (optional)', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      
      const result = schema.safeParse({
        code: 'graph TD; A-->B;',
        diagram_format: 'mermaid'
      });
      expect(result.success).toBe(true);
    });

    it('should validate svg output_format', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      
      const result = schema.safeParse({
        code: 'graph TD; A-->B;',
        diagram_format: 'mermaid',
        output_format: 'svg'
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid output_format', () => {
      const schema = z.object(createDiagramRenderingInputSchema());
      
      const result = schema.safeParse({
        code: 'graph TD; A-->B;',
        diagram_format: 'mermaid',
        output_format: 'jpeg'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('getSupportedFormatsForDocs', () => {
    it('should return formatted string of supported formats', () => {
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue([
        'mermaid', 'plantuml', 'graphviz'
      ]);
      
      const result = getSupportedFormatsForDocs();
      expect(result).toBe('mermaid, plantuml, graphviz');
      expect(mockFormatValidation.getSupportedDiagramFormats).toHaveBeenCalled();
    });

    it('should handle single format', () => {
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue(['mermaid']);
      
      const result = getSupportedFormatsForDocs();
      expect(result).toBe('mermaid');
    });

    it('should handle empty formats array', () => {
      mockFormatValidation.getSupportedDiagramFormats.mockReturnValue([]);
      
      const result = getSupportedFormatsForDocs();
      expect(result).toBe('');
    });
  });

  describe('validateFormatAvailability - Availability Branches', () => {
    it('should return valid for available and supported format', () => {
      mockInstance.isFormatAvailable.mockReturnValue(true);
      mockInstance.isFormatSupported.mockReturnValue(true);
      
      const result = validateFormatAvailability('mermaid');
      expect(result).toEqual({ isValid: true });
      expect(mockInstance.isFormatAvailable).toHaveBeenCalledWith('mermaid');
      expect(mockInstance.isFormatSupported).toHaveBeenCalledWith('mermaid');
    });

    it('should return invalid for unavailable format', () => {
      mockInstance.isFormatAvailable.mockReturnValue(false);
      mockInstance.getAllFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const result = validateFormatAvailability('nonexistent');
      expect(result).toEqual({
        isValid: false,
        message: "Format 'nonexistent' is not available",
        alternatives: ['mermaid', 'plantuml']
      });
      expect(mockInstance.isFormatAvailable).toHaveBeenCalledWith('nonexistent');
      expect(mockInstance.getAllFormats).toHaveBeenCalled();
    });

    it('should return invalid for available but unsupported format', () => {
      mockInstance.isFormatAvailable.mockReturnValue(true);
      mockInstance.isFormatSupported.mockReturnValue(false);
      
      const result = validateFormatAvailability('disabled-format');
      expect(result).toEqual({
        isValid: false,
        message: "Format 'disabled-format' is available but currently disabled"
      });
      expect(mockInstance.isFormatAvailable).toHaveBeenCalledWith('disabled-format');
      expect(mockInstance.isFormatSupported).toHaveBeenCalledWith('disabled-format');
    });

    it('should handle empty alternatives array', () => {
      mockInstance.isFormatAvailable.mockReturnValue(false);
      mockInstance.getAllFormats.mockReturnValue([]);
      
      const result = validateFormatAvailability('unknown');
      expect(result).toEqual({
        isValid: false,
        message: "Format 'unknown' is not available",
        alternatives: []
      });
    });

    it('should handle null/undefined format gracefully', () => {
      mockInstance.isFormatAvailable.mockReturnValue(false);
      mockInstance.getAllFormats.mockReturnValue(['mermaid']);
      
      const result = validateFormatAvailability('');
      expect(result).toEqual({
        isValid: false,
        message: "Format '' is not available",
        alternatives: ['mermaid']
      });
    });
  });
});
