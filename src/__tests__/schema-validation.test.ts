import { createDiagramFormatSchema, createAvailableFormatsSchema } from '../utils/schema-generation.js';
import { DiagramSelectionValidator } from '../utils/validation.js';

describe('Schema Validation Tests', () => {
  describe('Dynamic Schema Generation', () => {
    it('should create valid diagram format schema', () => {
      const schema = createDiagramFormatSchema();
      
      // Valid formats should pass
      expect(() => schema.parse('mermaid')).not.toThrow();
      expect(() => schema.parse('plantuml')).not.toThrow();
      expect(() => schema.parse('d2')).not.toThrow();
      
      // Invalid formats should fail
      expect(() => schema.parse('invalid-format')).toThrow();
      expect(() => schema.parse('')).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should create valid available formats array schema', () => {
      const schema = createAvailableFormatsSchema();
      
      // Valid arrays should pass
      expect(() => schema.parse(['mermaid', 'plantuml'])).not.toThrow();
      expect(() => schema.parse(['d2'])).not.toThrow();
      expect(() => schema.parse([])).not.toThrow();
      
      // Invalid arrays should fail
      expect(() => schema.parse(['mermaid', 'mermaid'])).toThrow(); // duplicates
      expect(() => schema.parse(['invalid-format'])).toThrow(); // invalid format
      expect(() => schema.parse('not-array')).toThrow(); // not array
    });

    it('should validate complex format combinations', () => {
      const schema = createAvailableFormatsSchema();
      
      // Test with all valid formats
      const allFormats = ['mermaid', 'plantuml', 'd2', 'graphviz', 'bpmn', 'c4-plantuml', 'structurizr', 'excalidraw', 'vega-lite'];
      expect(() => schema.parse(allFormats)).not.toThrow();
      
      // Test with some invalid mixed in
      const mixedFormats = ['mermaid', 'invalid', 'plantuml'];
      expect(() => schema.parse(mixedFormats)).toThrow();
    });
  });

  describe('Input Validation', () => {
    let validator: DiagramSelectionValidator;

    beforeEach(() => {
      validator = new DiagramSelectionValidator();
    });

    it('should validate basic input structure', () => {
      const validInput = {
        user_request: 'Create a flowchart for user authentication',
        available_formats: ['mermaid', 'plantuml']
      };

      const result = validator.validateInput(validInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject malformed input', () => {
      const invalidInputs = [
        { user_request: '', available_formats: ['mermaid'] }, // empty request
        { user_request: 'test', available_formats: [] }, // empty formats
        { user_request: 'a', available_formats: ['mermaid'] }, // too short
        { user_request: 'test', available_formats: ['invalid'] }, // invalid format
      ];

      invalidInputs.forEach(input => {
        const result = validator.validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle edge cases in validation', () => {
      // Test very long requests
      const longRequest = 'a'.repeat(5000);
      const result1 = validator.validateInput({
        user_request: longRequest,
        available_formats: ['mermaid']
      });
      expect(result1.isValid).toBe(false);

      // Test special characters
      const specialCharsRequest = 'Create diagram with émojis 🚀 and spëcial chars';
      const result2 = validator.validateInput({
        user_request: specialCharsRequest,
        available_formats: ['mermaid']
      });
      expect(result2.isValid).toBe(true);
    });
  });

  describe('Security Validation', () => {
    let validator: DiagramSelectionValidator;

    beforeEach(() => {
      validator = new DiagramSelectionValidator();
    });

    it('should detect potentially malicious content', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("test")',
        'expression(alert(1))',
        '<img onload="alert(1)" src="x">',
      ];

      maliciousInputs.forEach(maliciousRequest => {
        const result = validator.validateInput({
          user_request: maliciousRequest,
          available_formats: ['mermaid']
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.includes('malicious')
        )).toBe(true);
      });
    });

    it('should allow safe technical content', () => {
      const safeInputs = [
        'Create API documentation for /api/users endpoint',
        'Show database schema with user_id and email fields',
        'Document the authentication flow using JWT tokens',
        'Create architecture diagram for microservices',
      ];

      safeInputs.forEach(safeRequest => {
        const result = validator.validateInput({
          user_request: safeRequest,
          available_formats: ['mermaid']
        });
        expect(result.isValid).toBe(true);
      });
    });
  });
});
