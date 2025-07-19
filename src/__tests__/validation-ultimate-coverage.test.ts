/**
 * @fileoverview Ultimate Branch Coverage Tests for validation.ts
 * Targeting all conditional branches and edge cases for maximum coverage improvement.
 */

import { DiagramSelectionValidator } from '../utils/validation';
import { DiagramFormat } from '../types/diagram-selection';

// Mock dependencies
jest.mock('../utils/format-validation', () => ({
  isValidDiagramFormat: jest.fn(),
  getSupportedDiagramFormats: jest.fn(),
  validateDiagramFormats: jest.fn()
}));

import { 
  isValidDiagramFormat, 
  getSupportedDiagramFormats,
  validateDiagramFormats 
} from '../utils/format-validation';

describe('validation.ts - Ultimate Branch Coverage', () => {
  let validator: DiagramSelectionValidator;

  beforeEach(() => {
    validator = new DiagramSelectionValidator();
    jest.clearAllMocks();

    // Default mocks
    (getSupportedDiagramFormats as jest.Mock).mockReturnValue(['mermaid', 'plantuml', 'graphviz']);
    (isValidDiagramFormat as unknown as jest.Mock).mockImplementation((format: string) => 
      ['mermaid', 'plantuml', 'graphviz'].includes(format)
    );
    (validateDiagramFormats as jest.Mock).mockImplementation((formats: string[]) => 
      formats.filter(f => ['mermaid', 'plantuml', 'graphviz'].includes(f))
    );
  });

  describe('validateInput - Main Input Validation Branch Coverage', () => {
    test('should reject null input', () => {
      const result = validator.validateInput(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should reject undefined input', () => {
      const result = validator.validateInput(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should reject string input', () => {
      const result = validator.validateInput('string input');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should reject number input', () => {
      const result = validator.validateInput(42);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should reject boolean input', () => {
      const result = validator.validateInput(true);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should reject array input', () => {
      const result = validator.validateInput(['array', 'input']);
      
      expect(result.isValid).toBe(false);
      // Arrays are objects in JavaScript, so they pass the object check but fail validation
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should accept valid input with user_request only', () => {
      const input = { user_request: 'Create a flowchart diagram' };
      
      const result = validator.validateInput(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid input with available_formats undefined', () => {
      const input = { 
        user_request: 'Create a flowchart diagram',
        available_formats: undefined 
      };
      
      const result = validator.validateInput(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate available_formats when provided', () => {
      const input = { 
        user_request: 'Create a flowchart diagram',
        available_formats: ['mermaid', 'plantuml'] 
      };
      
      const result = validator.validateInput(input);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect unexpected properties', () => {
      const input = { 
        user_request: 'Create a flowchart diagram',
        unexpected_prop: 'value',
        another_prop: 42
      };
      
      const result = validator.validateInput(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Unexpected properties'))).toBe(true);
      expect(result.errors.some(e => e.includes('unexpected_prop'))).toBe(true);
      expect(result.errors.some(e => e.includes('another_prop'))).toBe(true);
    });

    test('should accumulate multiple validation errors', () => {
      const input = { 
        user_request: null,
        available_formats: 'not an array',
        unexpected_prop: 'value'
      };
      
      const result = validator.validateInput(input);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateUserRequest - User Request Branch Coverage', () => {
    test('should reject undefined user_request', () => {
      const result = validator.validateInput({ user_request: undefined });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request is required');
    });

    test('should reject null user_request', () => {
      const result = validator.validateInput({ user_request: null });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request is required');
    });

    test('should reject non-string user_request', () => {
      const result = validator.validateInput({ user_request: 42 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request must be a string');
    });

    test('should reject object user_request', () => {
      const result = validator.validateInput({ user_request: { type: 'object' } });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request must be a string');
    });

    test('should reject array user_request', () => {
      const result = validator.validateInput({ user_request: ['array'] });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request must be a string');
    });

    test('should reject empty string user_request', () => {
      const result = validator.validateInput({ user_request: '' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request cannot be empty');
    });

    test('should reject whitespace-only user_request', () => {
      const result = validator.validateInput({ user_request: '   \n\t  ' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request cannot be empty');
    });

    test('should reject too short user_request', () => {
      const result = validator.validateInput({ user_request: 'abc' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request must be at least 5 characters long');
    });

    test('should accept exactly 5 character user_request', () => {
      const result = validator.validateInput({ user_request: 'abcde' });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject too long user_request', () => {
      const longRequest = 'a'.repeat(1001);
      const result = validator.validateInput({ user_request: longRequest });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request cannot exceed 1000 characters');
    });

    test('should accept exactly 1000 character user_request', () => {
      const maxRequest = 'a'.repeat(1000);
      const result = validator.validateInput({ user_request: maxRequest });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect script tag malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram <script>alert("xss")</script>' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should detect javascript: malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram javascript:alert("xss")' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should detect HTML event handler malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram with onclick=alert("xss")' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should detect data:text/html malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram data:text/html,<script>alert(1)</script>' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should detect vbscript: malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram vbscript:msgbox("xss")' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should detect expression() malicious content', () => {
      const result = validator.validateInput({ 
        user_request: 'Create diagram expression(alert("xss"))' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request contains potentially malicious content');
    });

    test('should accept clean user_request', () => {
      const result = validator.validateInput({ 
        user_request: 'Create a nice flowchart diagram for my project' 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAvailableFormats - Available Formats Branch Coverage', () => {
    test('should reject non-array available_formats', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: 'not array' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('available_formats must be an array');
    });

    test('should reject object available_formats', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: { format: 'mermaid' } 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('available_formats must be an array');
    });

    test('should reject empty array available_formats', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: [] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('available_formats cannot be empty if provided');
    });

    test('should detect non-string formats', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 42, 'plantuml'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid formats: 42'))).toBe(true);
    });

    test('should detect invalid string formats', () => {
      (isValidDiagramFormat as unknown as jest.Mock).mockImplementation((format: string) => 
        format !== 'invalid_format'
      );
      
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 'invalid_format'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid formats: invalid_format'))).toBe(true);
    });

    test('should detect duplicate formats', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 'plantuml', 'mermaid'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate formats found: mermaid'))).toBe(true);
    });

    test('should detect multiple duplicates', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 'plantuml', 'mermaid', 'plantuml', 'graphviz'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate formats found: mermaid, plantuml'))).toBe(true);
    });

    test('should detect too many formats', () => {
      (getSupportedDiagramFormats as jest.Mock).mockReturnValue(['mermaid', 'plantuml']);
      
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 'plantuml', 'graphviz'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Too many formats specified. Maximum allowed: 2'))).toBe(true);
    });

    test('should accept valid formats array', () => {
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 'plantuml'] 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accumulate multiple format errors', () => {
      (isValidDiagramFormat as unknown as jest.Mock).mockImplementation((format: string) => 
        format === 'mermaid'
      );
      
      const result = validator.validateInput({ 
        user_request: 'valid request',
        available_formats: ['mermaid', 42, 'invalid', 'mermaid'] 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeInput - Sanitization Branch Coverage', () => {
    test('should sanitize input with user_request only', () => {
      const input = { user_request: '  Create   diagram  ' };
      
      const result = validator.sanitizeInput(input);
      
      expect(result.user_request).toBe('Create diagram');
      expect(result.available_formats).toBeUndefined();
    });

    test('should sanitize input with available_formats', () => {
      (validateDiagramFormats as jest.Mock).mockReturnValue(['mermaid', 'plantuml']);
      
      const input = { 
        user_request: '  Create   diagram  ',
        available_formats: ['mermaid', 'plantuml', 'invalid'] as DiagramFormat[]
      };
      
      const result = validator.sanitizeInput(input);
      
      expect(result.user_request).toBe('Create diagram');
      expect(result.available_formats).toEqual(['mermaid', 'plantuml']);
    });

    test('should trim and normalize whitespace in user_request', () => {
      const input = { user_request: '  \n\t Create   multiple   spaces  \n\t  ' };
      
      const result = validator.sanitizeInput(input);
      
      expect(result.user_request).toBe('Create multiple spaces');
    });

    test('should truncate long user_request', () => {
      const longRequest = 'a'.repeat(1500);
      const input = { user_request: longRequest };
      
      const result = validator.sanitizeInput(input);
      
      expect(result.user_request).toHaveLength(1000);
    });

    test('should deduplicate available_formats', () => {
      (validateDiagramFormats as jest.Mock).mockReturnValue(['mermaid', 'plantuml', 'mermaid']);
      
      const input = { 
        user_request: 'valid request',
        available_formats: ['mermaid', 'plantuml', 'mermaid'] as DiagramFormat[]
      };
      
      const result = validator.sanitizeInput(input);
      
      expect(result.available_formats).toEqual(['mermaid', 'plantuml']);
    });
  });

  describe('createValidatedInput - Full Validation and Sanitization Branch Coverage', () => {
    test('should return null input for invalid data', () => {
      const result = validator.createValidatedInput(null);
      
      expect(result.input).toBeNull();
      expect(result.errors).toContain('Input must be a valid object');
    });

    test('should return sanitized input for valid data', () => {
      const rawInput = { 
        user_request: '  Create   diagram  ',
        available_formats: ['mermaid', 'plantuml']
      };
      
      const result = validator.createValidatedInput(rawInput);
      
      expect(result.input).not.toBeNull();
      expect(result.input?.user_request).toBe('Create diagram');
      expect(result.errors).toHaveLength(0);
    });

    test('should return validation errors for invalid data', () => {
      const rawInput = { 
        user_request: 'ab', // too short
        available_formats: []  // empty
      };
      
      const result = validator.createValidatedInput(rawInput);
      
      expect(result.input).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('containsMaliciousContent - Security Pattern Testing', () => {
    test('should detect case-insensitive script tags', () => {
      const testCases = [
        '<SCRIPT>alert(1)</SCRIPT>',
        '<Script>alert(1)</Script>',
        '<script type="text/javascript">alert(1)</script>'
      ];
      
      testCases.forEach(testCase => {
        const result = validator.validateInput({ user_request: testCase });
        expect(result.isValid).toBe(false);
      });
    });

    test('should detect case-insensitive javascript protocol', () => {
      const testCases = [
        'JAVASCRIPT:alert(1)',
        'JavaScript:alert(1)',
        'javascript:void(0)'
      ];
      
      testCases.forEach(testCase => {
        const result = validator.validateInput({ user_request: testCase });
        expect(result.isValid).toBe(false);
      });
    });

    test('should detect event handlers with spaces', () => {
      const testCases = [
        'text onclick=alert(1)',
        'text onmouseover=alert(1)',
        'text onload=alert(1)'
      ];
      
      testCases.forEach(testCase => {
        const result = validator.validateInput({ user_request: testCase });
        expect(result.isValid).toBe(false);
      });
    });

    test('should detect expression with spaces', () => {
      const testCases = [
        'expression (alert(1))',
        'expression(alert(1))',
        'css expression (alert(1))'
      ];
      
      testCases.forEach(testCase => {
        const result = validator.validateInput({ user_request: testCase });
        expect(result.isValid).toBe(false);
      });
    });

    test('should not flag safe content', () => {
      const safeCases = [
        'Create a diagram showing data flow',
        'I want a script for deployment (not malicious)',
        'Show me an expression tree diagram',
        'Create an onclick flow diagram'
      ];
      
      safeCases.forEach(safeCase => {
        const result = validator.validateInput({ user_request: safeCase });
        expect(result.isValid).toBe(true);
      });
    });
  });
});
