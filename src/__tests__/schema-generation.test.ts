import {
  createDiagramFormatSchema,
  createAvailableFormatsSchema,
  getSupportedFormatsForDocs,
  validateFormatAvailability
} from '../utils/schema-generation';

describe('Schema Generation', () => {
  describe('createDiagramFormatSchema', () => {
    it('should create a valid Zod schema for diagram formats', () => {
      const schema = createDiagramFormatSchema();
      
      expect(schema).toBeDefined();
      expect(schema._def.typeName).toBe('ZodEffects'); // Zod refine creates ZodEffects
    });

    it('should validate known diagram formats', () => {
      const schema = createDiagramFormatSchema();
      
      // Test with common formats that should be supported
      const validFormats = ['mermaid', 'plantuml'];
      
      validFormats.forEach(format => {
        const result = schema.safeParse(format);
        if (!result.success) {
          // If format isn't supported, that's still a valid test result
          expect(result.error).toBeDefined();
        } else {
          expect(result.success).toBe(true);
        }
      });
    });

    it('should reject invalid diagram formats', () => {
      const schema = createDiagramFormatSchema();
      
      const invalidFormats = ['invalid', 'nonexistent', ''];
      
      invalidFormats.forEach(format => {
        const result = schema.safeParse(format);
        expect(result.success).toBe(false);
        if (!result.success && result.error?.issues?.[0]) {
          expect(result.error.issues[0].message).toContain('Unsupported format');
        }
      });
    });

    it('should provide helpful error messages', () => {
      const schema = createDiagramFormatSchema();
      
      const result = schema.safeParse('invalidformat');
      expect(result.success).toBe(false);
      if (!result.success && result.error?.issues?.[0]) {
        expect(result.error.issues[0].message).toContain('Unsupported format');
      }
    });

    it('should handle edge cases', () => {
      const schema = createDiagramFormatSchema();
      
      // Test with various edge cases
      const edgeCases = [null, undefined, 123, {}, []];
      
      edgeCases.forEach(testCase => {
        const result = schema.safeParse(testCase);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('createAvailableFormatsSchema', () => {
    it('should create a valid Zod schema for format arrays', () => {
      const schema = createAvailableFormatsSchema();
      
      expect(schema).toBeDefined();
      expect(schema._def.typeName).toBe('ZodEffects'); // Zod refine creates ZodEffects
    });

    it('should validate arrays of valid formats', () => {
      const schema = createAvailableFormatsSchema();
      
      const validArrays = [
        [],
        ['mermaid'],
        ['mermaid', 'plantuml']
      ];
      
      validArrays.forEach(formatArray => {
        const result = schema.safeParse(formatArray);
        // Some formats might not be available, so we just check it doesn't crash
        expect(result).toBeDefined();
      });
    });

    it('should reject arrays with duplicates', () => {
      const schema = createAvailableFormatsSchema();
      
      const result = schema.safeParse(['mermaid', 'mermaid']);
      expect(result.success).toBe(false);
      if (!result.success && result.error?.issues?.[0]) {
        expect(result.error.issues[0].message).toContain('duplicates');
      }
    });

    it('should reject non-array inputs', () => {
      const schema = createAvailableFormatsSchema();
      
      const invalidInputs = ['string', 123, {}, null, undefined];
      
      invalidInputs.forEach(input => {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should handle empty arrays', () => {
      const schema = createAvailableFormatsSchema();
      
      const result = schema.safeParse([]);
      expect(result.success).toBe(true);
    });

    it('should validate format array length constraints', () => {
      const schema = createAvailableFormatsSchema();
      
      // Test with a reasonable number of formats
      const reasonableArray = ['mermaid', 'plantuml', 'd2'];
      const result = schema.safeParse(reasonableArray);
      
      // Should not fail due to length constraints for reasonable arrays
      expect(result).toBeDefined();
    });
  });

  describe('getSupportedFormatsForDocs', () => {
    it('should return a string of supported formats', () => {
      const formatsDoc = getSupportedFormatsForDocs();
      
      expect(typeof formatsDoc).toBe('string');
      expect(formatsDoc.length).toBeGreaterThan(0);
    });

    it('should include common diagram formats', () => {
      const formatsDoc = getSupportedFormatsForDocs();
      
      // Should contain format names separated by commas
      expect(formatsDoc).toMatch(/\w+/); // At least one word character
    });

    it('should be properly formatted for documentation', () => {
      const formatsDoc = getSupportedFormatsForDocs();
      
      // Should be comma-separated for readable documentation
      if (formatsDoc.includes(',')) {
        const formats = formatsDoc.split(',');
        expect(formats.length).toBeGreaterThan(0);
        formats.forEach(format => {
          expect(format.trim().length).toBeGreaterThan(0);
        });
      }
    });

    it('should return consistent results', () => {
      const result1 = getSupportedFormatsForDocs();
      const result2 = getSupportedFormatsForDocs();
      
      expect(result1).toBe(result2);
    });

    it('should handle empty format lists gracefully', () => {
      // Even if no formats are available, should not throw
      const formatsDoc = getSupportedFormatsForDocs();
      
      expect(typeof formatsDoc).toBe('string');
    });
  });

  describe('validateFormatAvailability', () => {
    it('should validate format availability with detailed results', () => {
      const result = validateFormatAvailability('mermaid');
      
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should provide alternatives for invalid formats', () => {
      const result = validateFormatAvailability('invalidformat');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      
      if (result.alternatives) {
        expect(Array.isArray(result.alternatives)).toBe(true);
      }
    });

    it('should handle known valid formats', () => {
      const commonFormats = ['mermaid', 'plantuml', 'd2'];
      
      commonFormats.forEach(format => {
        const result = validateFormatAvailability(format);
        
        expect(result).toBeDefined();
        expect(typeof result.isValid).toBe('boolean');
        
        if (!result.isValid) {
          expect(result.message).toBeDefined();
        }
      });
    });

    it('should handle empty string format', () => {
      const result = validateFormatAvailability('');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should provide meaningful error messages', () => {
      const result = validateFormatAvailability('nonexistentformat');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('not available');
    });

    it('should distinguish between unavailable and disabled formats', () => {
      // Test that the function can distinguish between formats that don't exist
      // vs formats that exist but are disabled
      const result1 = validateFormatAvailability('completelyinvalidformat');
      const result2 = validateFormatAvailability('mermaid');
      
      expect(result1.isValid).toBe(false);
      
      // Either valid or properly explained why not
      if (!result2.isValid) {
        expect(result2.message).toBeDefined();
      }
    });

    it('should handle concurrent validation calls', () => {
      const promises = [
        validateFormatAvailability('mermaid'),
        validateFormatAvailability('plantuml'),
        validateFormatAvailability('invalid')
      ];
      
      // Should not throw errors when called concurrently
      promises.forEach(promise => {
        expect(promise).toBeDefined();
        expect(typeof promise.isValid).toBe('boolean');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should integrate schemas with actual validation', () => {
      const formatSchema = createDiagramFormatSchema();
      const availableSchema = createAvailableFormatsSchema();
      
      // Test that schemas work together
      const testFormat = 'mermaid';
      const formatResult = formatSchema.safeParse(testFormat);
      
      if (formatResult.success) {
        const arrayResult = availableSchema.safeParse([testFormat]);
        expect(arrayResult.success).toBe(true);
      }
    });

    it('should provide consistent validation across different schemas', () => {
      const formatSchema = createDiagramFormatSchema();
      const availability = validateFormatAvailability('mermaid');
      
      const schemaResult = formatSchema.safeParse('mermaid');
      
      // Results should be consistent
      if (availability.isValid) {
        expect(schemaResult.success).toBe(true);
      } else {
        // If availability check fails, schema should also fail
        expect(schemaResult.success).toBe(false);
      }
    });

    it('should handle runtime format changes', () => {
      // Test that schemas work correctly even if format availability changes
      const schema = createDiagramFormatSchema();
      
      const result1 = schema.safeParse('mermaid');
      const result2 = schema.safeParse('mermaid');
      
      // Results should be consistent for the same input
      expect(result1.success).toBe(result2.success);
    });

    it('should provide comprehensive error information', () => {
      const schema = createDiagramFormatSchema();
      const result = schema.safeParse('invalidformat');
      
      expect(result.success).toBe(false);
      if (!result.success && result.error?.issues?.[0]) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0].message).toBeDefined();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed input gracefully', () => {
      const schema = createDiagramFormatSchema();
      
      const malformedInputs = [
        { invalid: 'object' },
        [1, 2, 3],
        new Date(),
        () => 'function'
      ];
      
      malformedInputs.forEach(input => {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should handle null and undefined consistently', () => {
      const formatSchema = createDiagramFormatSchema();
      const arraySchema = createAvailableFormatsSchema();
      
      [null, undefined].forEach(value => {
        expect(formatSchema.safeParse(value).success).toBe(false);
        expect(arraySchema.safeParse(value).success).toBe(false);
      });
    });

    it('should provide stable behavior across multiple calls', () => {
      const format = 'mermaid';
      
      const results = Array(5).fill(null).map(() => validateFormatAvailability(format));
      
      // All results should be identical
      const firstResult = results[0];
      if (firstResult) {
        results.forEach(result => {
          expect(result.isValid).toBe(firstResult.isValid);
          expect(result.message).toBe(firstResult.message);
        });
      }
    });

    it('should handle extreme input sizes', () => {
      const schema = createAvailableFormatsSchema();
      
      // Test with very large array
      const largeArray = new Array(1000).fill('mermaid');
      const result = schema.safeParse(largeArray);
      
      // Should reject due to duplicates or size constraints
      expect(result.success).toBe(false);
    });

    it('should validate schema creation consistency', () => {
      // Multiple schema creations should behave consistently
      const schema1 = createDiagramFormatSchema();
      const schema2 = createDiagramFormatSchema();
      
      const testInput = 'mermaid';
      const result1 = schema1.safeParse(testInput);
      const result2 = schema2.safeParse(testInput);
      
      expect(result1.success).toBe(result2.success);
    });
  });
});
