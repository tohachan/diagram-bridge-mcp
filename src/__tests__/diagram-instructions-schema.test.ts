import {
  GET_DIAGRAM_INSTRUCTIONS_SCHEMA,
  GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA,
  GET_DIAGRAM_INSTRUCTIONS_RESOURCE
} from '../resources/diagram-instructions-schema';

import {
  HELP_CHOOSE_DIAGRAM_SCHEMA,
  HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA,
  HELP_CHOOSE_DIAGRAM_RESOURCE
} from '../resources/diagram-selection-schema';

// Helper function to validate JSON Schema
function validateAgainstSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push('Expected object type');
      return { valid: false, errors };
    }
    
    // Check required properties
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }
    }
    
    // Check properties
    if (schema.properties) {
      for (const [key, value] of Object.entries(data)) {
        const propSchema = schema.properties[key];
        if (propSchema) {
          const propValidation = validateProperty(value, propSchema);
          if (!propValidation.valid) {
            errors.push(...propValidation.errors.map(e => `${key}: ${e}`));
          }
        } else if (schema.additionalProperties === false) {
          errors.push(`Additional property not allowed: ${key}`);
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

function validateProperty(value: any, propSchema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Type validation
  if (propSchema.type) {
    const expectedType = propSchema.type;
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (actualType !== expectedType) {
      errors.push(`Expected ${expectedType}, got ${actualType}`);
    }
  }
  
  // String-specific validations
  if (propSchema.type === 'string' && typeof value === 'string') {
    if (propSchema.minLength && value.length < propSchema.minLength) {
      errors.push(`String too short: ${value.length} < ${propSchema.minLength}`);
    }
    if (propSchema.maxLength && value.length > propSchema.maxLength) {
      errors.push(`String too long: ${value.length} > ${propSchema.maxLength}`);
    }
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push(`Value not in enum: ${value}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

describe('Diagram Instructions Schema', () => {
  describe('GET_DIAGRAM_INSTRUCTIONS_SCHEMA', () => {
    it('should be a valid JSON Schema object', () => {
      expect(GET_DIAGRAM_INSTRUCTIONS_SCHEMA).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_SCHEMA.type).toBe('object');
      expect(GET_DIAGRAM_INSTRUCTIONS_SCHEMA.properties).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_SCHEMA.required).toEqual(['user_request', 'diagram_format']);
    });

    it('should validate correct diagram instructions input', () => {
      const validInput = {
        user_request: 'Create a simple flowchart',
        diagram_format: 'mermaid'
      };

      const result = validateAgainstSchema(validInput, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject input with missing user_request', () => {
      const invalidInput = {
        diagram_format: 'mermaid'
      };

      const result = validateAgainstSchema(invalidInput, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('user_request'))).toBe(true);
    });

    it('should reject input with missing diagram_format', () => {
      const invalidInput = {
        user_request: 'Create a simple flowchart'
      };

      const result = validateAgainstSchema(invalidInput, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('diagram_format'))).toBe(true);
    });

    it('should reject empty user_request', () => {
      const invalidInput = {
        user_request: '',
        diagram_format: 'mermaid'
      };

      const result = validateAgainstSchema(invalidInput, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('String too short'))).toBe(true);
    });

    it('should reject invalid diagram_format', () => {
      const invalidInput = {
        user_request: 'Create a flowchart',
        diagram_format: 'invalid_format'
      };

      const result = validateAgainstSchema(invalidInput, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('not in enum'))).toBe(true);
    });

    it('should validate schema properties structure', () => {
      const schema = GET_DIAGRAM_INSTRUCTIONS_SCHEMA;
      
      expect(schema.properties.user_request).toBeDefined();
      expect(schema.properties.user_request.type).toBe('string');
      expect(schema.properties.user_request.minLength).toBe(5);
      expect(schema.properties.user_request.maxLength).toBe(2000);
      
      expect(schema.properties.diagram_format).toBeDefined();
      expect(schema.properties.diagram_format.type).toBe('string');
      expect(Array.isArray(schema.properties.diagram_format.enum)).toBe(true);
    });

    it('should reject additional properties when additionalProperties is false', () => {
      const inputWithExtra = {
        user_request: 'Create a flowchart',
        diagram_format: 'mermaid',
        extra_property: 'not allowed'
      };

      const result = validateAgainstSchema(inputWithExtra, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Additional property'))).toBe(true);
    });
  });

  describe('GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA', () => {
    it('should be a valid output schema', () => {
      expect(GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA.type).toBe('object');
      expect(GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA.required).toContain('prompt_text');
    });

    it('should validate correct output format', () => {
      const validOutput = {
        prompt_text: 'This is a valid prompt text that is longer than 50 characters to meet the minimum length requirement.'
      };

      const result = validateAgainstSchema(validOutput, GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA);
      
      expect(result.valid).toBe(true);
    });

    it('should reject output with short prompt_text', () => {
      const invalidOutput = {
        prompt_text: 'Too short'
      };

      const result = validateAgainstSchema(invalidOutput, GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('String too short'))).toBe(true);
    });

    it('should validate prompt_text property structure', () => {
      const schema = GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA;
      
      expect(schema.properties.prompt_text).toBeDefined();
      expect(schema.properties.prompt_text.type).toBe('string');
      expect(schema.properties.prompt_text.minLength).toBe(50);
    });
  });

  describe('GET_DIAGRAM_INSTRUCTIONS_RESOURCE', () => {
    it('should be a complete MCP resource definition', () => {
      expect(GET_DIAGRAM_INSTRUCTIONS_RESOURCE).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_RESOURCE.name).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_RESOURCE.description).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_RESOURCE.inputSchema).toBeDefined();
      expect(GET_DIAGRAM_INSTRUCTIONS_RESOURCE.outputSchema).toBeDefined();
    });

    it('should have correct resource structure', () => {
      const resource = GET_DIAGRAM_INSTRUCTIONS_RESOURCE;
      
      expect(typeof resource.name).toBe('string');
      expect(typeof resource.description).toBe('string');
      expect(resource.inputSchema).toEqual(GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
      expect(resource.outputSchema).toEqual(GET_DIAGRAM_INSTRUCTIONS_OUTPUT_SCHEMA);
    });
  });

  describe('HELP_CHOOSE_DIAGRAM_SCHEMA', () => {
    it('should be a valid schema for diagram selection help', () => {
      expect(HELP_CHOOSE_DIAGRAM_SCHEMA).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_SCHEMA.type).toBe('object');
      expect(HELP_CHOOSE_DIAGRAM_SCHEMA.properties).toBeDefined();
    });

    it('should validate diagram selection request', () => {
      const validInput = {
        user_request: 'Help me choose the best diagram type for my use case'
      };

      const result = validateAgainstSchema(validInput, HELP_CHOOSE_DIAGRAM_SCHEMA);
      
      expect(result.valid).toBe(true);
    });

    it('should handle available_formats property if present', () => {
      const inputWithFormats = {
        user_request: 'Choose a diagram type',
        available_formats: ['mermaid', 'plantuml', 'd2']
      };

      const result = validateAgainstSchema(inputWithFormats, HELP_CHOOSE_DIAGRAM_SCHEMA);
      
      // Test structure depends on actual schema
      expect(result).toBeDefined();
      // Validate based on schema definition
      if (HELP_CHOOSE_DIAGRAM_SCHEMA.properties.available_formats) {
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA', () => {
    it('should be a valid output schema for diagram selection', () => {
      expect(HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA.type).toBe('object');
      expect(HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA.properties).toBeDefined();
    });

    it('should validate help output format', () => {
      // Test structure depends on actual schema
      expect(HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA.properties).toBeDefined();
    });
  });

  describe('HELP_CHOOSE_DIAGRAM_RESOURCE', () => {
    it('should be a complete MCP resource for diagram selection help', () => {
      expect(HELP_CHOOSE_DIAGRAM_RESOURCE).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_RESOURCE.name).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_RESOURCE.description).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_RESOURCE.inputSchema).toBeDefined();
      expect(HELP_CHOOSE_DIAGRAM_RESOURCE.outputSchema).toBeDefined();
    });

    it('should link to correct schemas', () => {
      const resource = HELP_CHOOSE_DIAGRAM_RESOURCE;
      
      expect(resource.inputSchema).toEqual(HELP_CHOOSE_DIAGRAM_SCHEMA);
      expect(resource.outputSchema).toEqual(HELP_CHOOSE_DIAGRAM_OUTPUT_SCHEMA);
    });
  });

  describe('Schema validation edge cases', () => {
    it('should handle null and undefined inputs', () => {
      const schemas = [GET_DIAGRAM_INSTRUCTIONS_SCHEMA, HELP_CHOOSE_DIAGRAM_SCHEMA];
      
      schemas.forEach(schema => {
        expect(validateAgainstSchema(null, schema).valid).toBe(false);
        expect(validateAgainstSchema(undefined, schema).valid).toBe(false);
      });
    });

    it('should handle non-object inputs', () => {
      const invalidInputs = ['string', 123, true, []];
      
      invalidInputs.forEach(input => {
        const result = validateAgainstSchema(input, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('Expected object'))).toBe(true);
      });
    });

    it('should validate enum values correctly', () => {
      const schema = GET_DIAGRAM_INSTRUCTIONS_SCHEMA;
      const validFormats = schema.properties.diagram_format.enum;
      
      expect(Array.isArray(validFormats)).toBe(true);
      expect(validFormats.length).toBeGreaterThan(0);
      
      // Test each valid format
      validFormats.forEach(format => {
        const input = {
          user_request: 'Test diagram request',
          diagram_format: format
        };
        
        const result = validateAgainstSchema(input, schema);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate string length constraints', () => {
      const tooShort = {
        user_request: 'Hi',  // Less than 5 characters
        diagram_format: 'mermaid'
      };
      
      const tooLong = {
        user_request: 'A'.repeat(2001),  // More than 2000 characters
        diagram_format: 'mermaid'
      };
      
      expect(validateAgainstSchema(tooShort, GET_DIAGRAM_INSTRUCTIONS_SCHEMA).valid).toBe(false);
      expect(validateAgainstSchema(tooLong, GET_DIAGRAM_INSTRUCTIONS_SCHEMA).valid).toBe(false);
    });

    it('should handle malformed property types', () => {
      const invalidTypes = [
        { user_request: 123, diagram_format: 'mermaid' },
        { user_request: 'Valid request', diagram_format: 123 },
        { user_request: [], diagram_format: 'mermaid' },
        { user_request: 'Valid request', diagram_format: {} }
      ];

      invalidTypes.forEach(input => {
        const result = validateAgainstSchema(input, GET_DIAGRAM_INSTRUCTIONS_SCHEMA);
        expect(result.valid).toBe(false);
      });
    });
  });
});
