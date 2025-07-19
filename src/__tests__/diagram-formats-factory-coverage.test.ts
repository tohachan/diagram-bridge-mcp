/**
 * @jest-environment node
 */

import { DiagramFormatsFactory } from '../config/diagram-formats-factory.js';
import type { DiagramFormatConfig } from '../config/diagram-formats-config.js';

describe('DiagramFormatsFactory - Coverage Completion', () => {
  
  describe('createCustomFormat method', () => {
    test('should create custom format with minimal config', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'custom-format',
        'Custom Format',
        {}
      );

      expect(customFormat).toMatchObject({
        id: 'custom-format',
        displayName: 'Custom Format',
        description: 'Custom Format diagram format',
        krokiFormat: 'custom-format',
        supportedOutputs: ['png'],
        enabled: true
      });

      expect(customFormat.characteristics).toEqual({
        strengths: [],
        weaknesses: [],
        bestFor: [],
        examples: []
      });

      expect(customFormat.instructionTemplate).toEqual({
        syntaxGuidelines: [],
        bestPractices: [],
        commonPitfalls: [],
        examplePatterns: [],
        outputSpecifications: []
      });

      expect(customFormat.fileExtensions).toEqual([]);
      expect(customFormat.exampleCode).toBe('');
    });

    test('should create custom format with partial config - description override', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'test-format',
        'Test Format',
        {
          description: 'Custom description for test format'
        }
      );

      expect(customFormat.description).toBe('Custom description for test format');
      expect(customFormat.krokiFormat).toBe('test-format');
      expect(customFormat.supportedOutputs).toEqual(['png']);
      expect(customFormat.enabled).toBe(true);
    });

    test('should create custom format with krokiFormat override', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'format-id',
        'Format Name',
        {
          krokiFormat: 'different-kroki-name'
        }
      );

      expect(customFormat.krokiFormat).toBe('different-kroki-name');
      expect(customFormat.id).toBe('format-id');
    });

    test('should create custom format with supportedOutputs override', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'svg-format',
        'SVG Format',
        {
          supportedOutputs: ['svg', 'png']
        }
      );

      expect(customFormat.supportedOutputs).toEqual(['svg', 'png']);
    });

    test('should create custom format with enabled=false', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'disabled-format',
        'Disabled Format',
        {
          enabled: false
        }
      );

      expect(customFormat.enabled).toBe(false);
    });

    test('should create custom format with enabled=undefined (defaults to true)', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'undefined-enabled',
        'Undefined Enabled',
        {
          // Don't pass enabled at all to test the default behavior
        }
      );

      expect(customFormat.enabled).toBe(true);
    });

    test('should create custom format with custom characteristics', () => {
      const customCharacteristics = {
        strengths: ['Fast rendering', 'Easy syntax'],
        weaknesses: ['Limited features'],
        bestFor: ['Quick prototypes'],
        examples: ['Simple diagrams']
      };

      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'quick-format',
        'Quick Format',
        {
          characteristics: customCharacteristics
        }
      );

      expect(customFormat.characteristics).toEqual(customCharacteristics);
    });

    test('should create custom format with custom instruction template', () => {
      const customTemplate = {
        syntaxGuidelines: ['Use simple syntax'],
        bestPractices: ['Keep it simple'],
        commonPitfalls: ['Avoid complexity'],
        examplePatterns: ['pattern: example'],
        outputSpecifications: ['Output plain text']
      };

      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'simple-format',
        'Simple Format',
        {
          instructionTemplate: customTemplate
        }
      );

      expect(customFormat.instructionTemplate).toEqual(customTemplate);
    });

    test('should create custom format with custom file extensions', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'ext-format',
        'Extension Format',
        {
          fileExtensions: ['.custom', '.ext']
        }
      );

      expect(customFormat.fileExtensions).toEqual(['.custom', '.ext']);
    });

    test('should create custom format with example code', () => {
      const exampleCode = 'example { code: "sample" }';
      
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'code-format',
        'Code Format',
        {
          exampleCode
        }
      );

      expect(customFormat.exampleCode).toBe(exampleCode);
    });

    test('should create custom format with full configuration', () => {
      const fullConfig: Partial<DiagramFormatConfig> = {
        description: 'Full custom format',
        krokiFormat: 'full-kroki',
        supportedOutputs: ['svg', 'png'],
        enabled: true,
        characteristics: {
          strengths: ['Comprehensive'],
          weaknesses: ['Complex'],
          bestFor: ['Full scenarios'],
          examples: ['Complete examples']
        },
        instructionTemplate: {
          syntaxGuidelines: ['Full syntax'],
          bestPractices: ['Best practices'],
          commonPitfalls: ['Common issues'],
          examplePatterns: ['Full patterns'],
          outputSpecifications: ['Full output specs']
        },
        fileExtensions: ['.full', '.complete'],
        exampleCode: 'full { example: true }'
      };

      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'full-format',
        'Full Format',
        fullConfig
      );

      expect(customFormat).toMatchObject({
        id: 'full-format',
        displayName: 'Full Format',
        ...fullConfig
      });
    });

    test('should handle falsy enabled value (null)', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'null-enabled',
        'Null Enabled',
        {
          enabled: null as any
        }
      );

      // null with ?? operator should result in true (default value)
      expect(customFormat.enabled).toBe(true);
    });

    test('should handle explicitly false enabled value', () => {
      const customFormat = DiagramFormatsFactory.createCustomFormat(
        'false-enabled',
        'False Enabled',
        {
          enabled: false
        }
      );

      expect(customFormat.enabled).toBe(false);
    });
  });

  describe('Private method coverage through reflection', () => {
    test('should access createERDConfig through class methods', () => {
      // Since createERDConfig is private but exists in the class,
      // we can verify it exists and would work if called
      const factoryClass = DiagramFormatsFactory as any;
      
      // Check that the method exists
      expect(typeof factoryClass.createERDConfig).toBe('function');
      
      // Actually call it to get coverage
      const erdConfig = factoryClass.createERDConfig();
      
      expect(erdConfig).toMatchObject({
        id: 'erd',
        displayName: 'ERD',
        description: expect.stringContaining('Entity-Relationship'),
        krokiFormat: 'erd',
        supportedOutputs: ['png', 'svg'],
        enabled: true
      });

      expect(erdConfig.characteristics).toBeDefined();
      expect(erdConfig.instructionTemplate).toBeDefined();
      expect(Array.isArray(erdConfig.fileExtensions)).toBe(true);
      expect(typeof erdConfig.exampleCode).toBe('string');
    });
  });

  describe('Registry creation edge cases', () => {
    test('should create registry with current timestamp', () => {
      const beforeTime = new Date().toISOString();
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      const afterTime = new Date().toISOString();

      // The timestamp should be between before and after
      expect(registry.lastUpdated >= beforeTime).toBe(true);
      expect(registry.lastUpdated <= afterTime).toBe(true);
      expect(registry.version).toBe('2.0.0');
      expect(registry.defaultFormat).toBe('mermaid');
    });

    test('should verify all formats are properly instantiated', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      // Check that all formats exist and are valid
      const formatIds = Object.keys(registry.formats);
      expect(formatIds.length).toBeGreaterThan(0);
      
      for (const formatId of formatIds) {
        const format = registry.formats[formatId];
        expect(format).toBeDefined();
        
        if (format) {
          expect(format.id).toBe(formatId);
          expect(typeof format.displayName).toBe('string');
          expect(typeof format.description).toBe('string');
          expect(Array.isArray(format.supportedOutputs)).toBe(true);
          expect(typeof format.enabled).toBe('boolean');
        }
      }
    });
  });
});
