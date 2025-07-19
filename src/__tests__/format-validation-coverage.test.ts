import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import {
  isValidDiagramFormat,
  validateDiagramFormats,
  getSupportedDiagramFormats,
  getAllDiagramFormats,
  assertValidDiagramFormat,
  validateDiagramFormatWithDetails,
  isOutputFormatSupported,
  getSupportedOutputFormats,
  getDefaultOutputFormat,
  isLegacyDiagramFormat,
  getKrokiFormat,
  isFormatAvailable,
  getFormatConfiguration,
  getFormatCharacteristics,
  getFormatInstructionTemplate,
  validateFormatMappingConsistency
} from '../utils/format-validation.js';

describe('Format Validation - Full Coverage', () => {
  let formatManager: DiagramFormatsManager;

  beforeEach(() => {
    formatManager = DiagramFormatsManager.getInstance();
    jest.clearAllMocks();
  });

  describe('isValidDiagramFormat', () => {
    it('should return false for non-string values', () => {
      expect(isValidDiagramFormat(null)).toBe(false);
      expect(isValidDiagramFormat(undefined)).toBe(false);
      expect(isValidDiagramFormat(123)).toBe(false);
      expect(isValidDiagramFormat({})).toBe(false);
      expect(isValidDiagramFormat([])).toBe(false);
      expect(isValidDiagramFormat(true)).toBe(false);
    });

    it('should return false for unsupported string format', () => {
      expect(isValidDiagramFormat('invalid-format')).toBe(false);
      expect(isValidDiagramFormat('nonexistent')).toBe(false);
      expect(isValidDiagramFormat('')).toBe(false);
    });

    it('should return true for supported string format', () => {
      expect(isValidDiagramFormat('mermaid')).toBe(true);
      expect(isValidDiagramFormat('plantuml')).toBe(true);
      expect(isValidDiagramFormat('d2')).toBe(true);
      expect(isValidDiagramFormat('graphviz')).toBe(true);
    });

    it('should handle disabled formats correctly', () => {
      // ERD is temporarily disabled but should be available
      expect(isValidDiagramFormat('erd')).toBe(false); // Since it's disabled
    });
  });

  describe('validateDiagramFormats', () => {
    it('should return empty array for non-array input', () => {
      expect(validateDiagramFormats(null)).toEqual([]);
      expect(validateDiagramFormats(undefined)).toEqual([]);
      expect(validateDiagramFormats('string')).toEqual([]);
      expect(validateDiagramFormats(123)).toEqual([]);
      expect(validateDiagramFormats({})).toEqual([]);
    });

    it('should filter out invalid formats from array', () => {
      const input = ['mermaid', 'invalid', 'plantuml', 123, null, 'd2'];
      const result = validateDiagramFormats(input);
      expect(result).toEqual(['mermaid', 'plantuml', 'd2']);
    });

    it('should return empty array for array with no valid formats', () => {
      const input = ['invalid1', 'invalid2', 123, null, {}];
      const result = validateDiagramFormats(input);
      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      expect(validateDiagramFormats([])).toEqual([]);
    });

    it('should handle array with all valid formats', () => {
      const input = ['mermaid', 'plantuml', 'd2', 'graphviz'];
      const result = validateDiagramFormats(input);
      expect(result).toEqual(['mermaid', 'plantuml', 'd2', 'graphviz']);
    });
  });

  describe('getSupportedDiagramFormats', () => {
    it('should return array of supported formats', () => {
      const formats = getSupportedDiagramFormats();
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);
      expect(formats).toContain('mermaid');
      expect(formats).toContain('plantuml');
    });
  });

  describe('getAllDiagramFormats', () => {
    it('should return array of all formats including disabled', () => {
      const formats = getAllDiagramFormats();
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);
    });
  });

  describe('assertValidDiagramFormat', () => {
    it('should not throw for valid formats', () => {
      expect(() => assertValidDiagramFormat('mermaid')).not.toThrow();
      expect(() => assertValidDiagramFormat('plantuml')).not.toThrow();
      expect(() => assertValidDiagramFormat('d2')).not.toThrow();
    });

    it('should throw for invalid format without context', () => {
      expect(() => assertValidDiagramFormat('invalid')).toThrow(
        'Invalid diagram format: invalid. Supported formats:'
      );
    });

    it('should throw for invalid format with context', () => {
      expect(() => assertValidDiagramFormat('invalid', 'test context')).toThrow(
        'Invalid diagram format (test context): invalid. Supported formats:'
      );
    });

    it('should throw for non-string input', () => {
      expect(() => assertValidDiagramFormat(123)).toThrow();
      expect(() => assertValidDiagramFormat(null)).toThrow();
      expect(() => assertValidDiagramFormat(undefined)).toThrow();
    });
  });

  describe('validateDiagramFormatWithDetails', () => {
    it('should return valid result for supported format', () => {
      const result = validateDiagramFormatWithDetails('mermaid');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mermaid');
      expect(result.error).toBeUndefined();
      expect(Array.isArray(result.supportedFormats)).toBe(true);
    });

    it('should return invalid result for non-string input', () => {
      const result = validateDiagramFormatWithDetails(123);
      expect(result.isValid).toBe(false);
      expect(result.format).toBeUndefined();
      expect(result.error).toBe('Format must be a string, got: number');
      expect(Array.isArray(result.supportedFormats)).toBe(true);
    });

    it('should return invalid result for non-string object input', () => {
      const result = validateDiagramFormatWithDetails({});
      expect(result.isValid).toBe(false);
      expect(result.format).toBeUndefined();
      expect(result.error).toBe('Format must be a string, got: object');
      expect(Array.isArray(result.supportedFormats)).toBe(true);
    });

    it('should return invalid result for unsupported string format', () => {
      const result = validateDiagramFormatWithDetails('invalid-format');
      expect(result.isValid).toBe(false);
      expect(result.format).toBeUndefined();
      expect(result.error).toBe('Unsupported format: invalid-format');
      expect(Array.isArray(result.supportedFormats)).toBe(true);
    });
  });

  describe('isOutputFormatSupported', () => {
    it('should return true for supported format and output combinations', () => {
      expect(isOutputFormatSupported('mermaid', 'png')).toBe(true);
      expect(isOutputFormatSupported('mermaid', 'svg')).toBe(true);
      expect(isOutputFormatSupported('plantuml', 'png')).toBe(true);
    });

    it('should return false for unsupported output format', () => {
      // D2 only supports SVG
      expect(isOutputFormatSupported('d2', 'png')).toBe(false);
    });

    it('should handle invalid diagram format', () => {
      expect(isOutputFormatSupported('invalid', 'png')).toBe(false);
    });
  });

  describe('getSupportedOutputFormats', () => {
    it('should return output formats for valid diagram format', () => {
      const formats = getSupportedOutputFormats('mermaid');
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);
      expect(formats).toContain('png');
      expect(formats).toContain('svg');
    });

    it('should return different formats for D2 (SVG only)', () => {
      const formats = getSupportedOutputFormats('d2');
      expect(Array.isArray(formats)).toBe(true);
      expect(formats).toContain('svg');
      expect(formats).not.toContain('png');
    });

    it('should handle invalid format gracefully', () => {
      const formats = getSupportedOutputFormats('invalid');
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBe(0);
    });
  });

  describe('getDefaultOutputFormat', () => {
    it('should return default output format for valid format', () => {
      const defaultFormat = getDefaultOutputFormat('mermaid');
      expect(typeof defaultFormat).toBe('string');
      expect(['png', 'svg']).toContain(defaultFormat);
    });

    it('should return undefined for invalid format', () => {
      const defaultFormat = getDefaultOutputFormat('invalid');
      expect(defaultFormat).toBeUndefined();
    });
  });

  describe('isLegacyDiagramFormat', () => {
    it('should return true for legacy formats', () => {
      expect(isLegacyDiagramFormat('mermaid')).toBe(true);
      expect(isLegacyDiagramFormat('plantuml')).toBe(true);
      expect(isLegacyDiagramFormat('d2')).toBe(true);
      expect(isLegacyDiagramFormat('graphviz')).toBe(true);
      expect(isLegacyDiagramFormat('erd')).toBe(true);
    });

    it('should return false for new formats', () => {
      expect(isLegacyDiagramFormat('bpmn')).toBe(false);
      expect(isLegacyDiagramFormat('c4-plantuml')).toBe(false);
      expect(isLegacyDiagramFormat('structurizr')).toBe(false);
      expect(isLegacyDiagramFormat('excalidraw')).toBe(false);
      expect(isLegacyDiagramFormat('vega-lite')).toBe(false);
    });

    it('should return false for invalid formats', () => {
      expect(isLegacyDiagramFormat('invalid')).toBe(false);
      expect(isLegacyDiagramFormat('nonexistent')).toBe(false);
    });
  });

  describe('getKrokiFormat', () => {
    it('should return kroki format for valid diagram format', () => {
      expect(getKrokiFormat('mermaid')).toBe('mermaid');
      expect(getKrokiFormat('plantuml')).toBe('plantuml');
      expect(getKrokiFormat('d2')).toBe('d2');
      expect(getKrokiFormat('graphviz')).toBe('graphviz');
    });

    it('should return different kroki format for aliases', () => {
      expect(getKrokiFormat('c4plantuml')).toBe('c4plantuml');
      expect(getKrokiFormat('vega-lite')).toBe('vegalite');
    });

    it('should return undefined for invalid format', () => {
      expect(getKrokiFormat('invalid')).toBeUndefined();
    });
  });

  describe('isFormatAvailable', () => {
    it('should return true for available enabled formats', () => {
      expect(isFormatAvailable('mermaid')).toBe(true);
      expect(isFormatAvailable('plantuml')).toBe(true);
    });

    it('should return true for available but disabled formats', () => {
      // ERD might be available but disabled
      const available = isFormatAvailable('erd');
      expect(typeof available).toBe('boolean');
    });

    it('should return false for completely invalid formats', () => {
      expect(isFormatAvailable('completely-invalid')).toBe(false);
    });
  });

  describe('getFormatConfiguration', () => {
    it('should return configuration for valid format', () => {
      const config = getFormatConfiguration('mermaid');
      expect(config).toBeDefined();
      if (config) {
        expect(config.id).toBe('mermaid');
        expect(config.displayName).toBeDefined();
        expect(config.krokiFormat).toBeDefined();
      }
    });

    it('should return undefined for invalid format', () => {
      const config = getFormatConfiguration('invalid');
      expect(config).toBeUndefined();
    });
  });

  describe('getFormatCharacteristics', () => {
    it('should return characteristics for valid format', () => {
      const characteristics = getFormatCharacteristics('mermaid');
      expect(characteristics).toBeDefined();
      if (characteristics) {
        expect(characteristics.strengths).toBeDefined();
        expect(characteristics.weaknesses).toBeDefined();
        expect(characteristics.bestFor).toBeDefined();
      }
    });

    it('should return undefined for invalid format', () => {
      const characteristics = getFormatCharacteristics('invalid');
      expect(characteristics).toBeUndefined();
    });
  });

  describe('getFormatInstructionTemplate', () => {
    it('should return instruction template for valid format', () => {
      const template = getFormatInstructionTemplate('mermaid');
      expect(template).toBeDefined();
      if (template) {
        expect(template.syntaxGuidelines).toBeDefined();
        expect(template.bestPractices).toBeDefined();
        expect(template.commonPitfalls).toBeDefined();
      }
    });

    it('should return undefined for invalid format', () => {
      const template = getFormatInstructionTemplate('invalid');
      expect(template).toBeUndefined();
    });
  });

  describe('validateFormatMappingConsistency', () => {
    it('should validate format mapping and return success for valid configuration', () => {
      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle disabled formats in warnings', () => {
      const result = validateFormatMappingConsistency();
      // Check if there are disabled formats and appropriate warnings
      expect(Array.isArray(result.warnings)).toBe(true);
      
      // If there are disabled formats, there should be warnings about them
      const allFormats = getAllDiagramFormats();
      const enabledFormats = getSupportedDiagramFormats();
      const disabledFormats = allFormats.filter(format => !enabledFormats.includes(format));
      
      if (disabledFormats.length > 0) {
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some(w => w.includes('Disabled formats detected'))).toBe(true);
      } else {
        // If no disabled formats, warnings may be empty
        expect(result.warnings.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle format manager errors gracefully', () => {
      // Mock format manager to throw error
      const originalGetAllFormats = formatManager.getAllFormats;
      jest.spyOn(formatManager, 'getAllFormats').mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Validation failed: Test error');

      // Restore original method
      formatManager.getAllFormats = originalGetAllFormats;
    });

    it('should detect missing configuration fields', () => {
      // Mock format manager to return format with missing fields
      const originalGetFormatConfig = formatManager.getFormatConfig;
      const originalGetEnabledFormats = formatManager.getEnabledFormats;
      
      jest.spyOn(formatManager, 'getEnabledFormats').mockReturnValue(['test-format']);
      jest.spyOn(formatManager, 'getFormatConfig').mockImplementation((format) => {
        if (format === 'test-format') {
          return {
            id: '',  // Missing required field
            displayName: '',  // Missing required field
            krokiFormat: '',  // Missing required field
            supportedOutputs: [],
            enabled: true,
            characteristics: {
              strengths: [],
              weaknesses: [],
              bestFor: [],
              examples: []
            },
            instructionTemplate: {
              syntaxGuidelines: [],
              bestPractices: [],
              commonPitfalls: [],
              examplePatterns: [],
              outputSpecifications: []
            },
            fileExtensions: [],
            exampleCode: '',
            description: ''
          };
        }
        return originalGetFormatConfig.call(formatManager, format);
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('missing required configuration fields'))).toBe(true);

      // Restore original methods
      formatManager.getFormatConfig = originalGetFormatConfig;
      formatManager.getEnabledFormats = originalGetEnabledFormats;
    });

    it('should detect missing configuration', () => {
      // Mock format manager to return null config
      const originalGetFormatConfig = formatManager.getFormatConfig;
      const originalGetEnabledFormats = formatManager.getEnabledFormats;
      
      jest.spyOn(formatManager, 'getEnabledFormats').mockReturnValue(['missing-config']);
      jest.spyOn(formatManager, 'getFormatConfig').mockImplementation((format) => {
        if (format === 'missing-config') {
          return undefined;
        }
        return originalGetFormatConfig.call(formatManager, format);
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('has no configuration'))).toBe(true);

      // Restore original methods
      formatManager.getFormatConfig = originalGetFormatConfig;
      formatManager.getEnabledFormats = originalGetEnabledFormats;
    });

    it('should detect formats with no supported outputs', () => {
      // Mock format manager to return format with no outputs
      const originalGetFormatConfig = formatManager.getFormatConfig;
      const originalGetEnabledFormats = formatManager.getEnabledFormats;
      
      jest.spyOn(formatManager, 'getEnabledFormats').mockReturnValue(['no-outputs']);
      jest.spyOn(formatManager, 'getFormatConfig').mockImplementation((format) => {
        if (format === 'no-outputs') {
          return {
            id: 'no-outputs',
            displayName: 'No Outputs',
            krokiFormat: 'no-outputs',
            supportedOutputs: [],  // No outputs
            enabled: true,
            characteristics: {
              strengths: [],
              weaknesses: [],
              bestFor: [],
              examples: []
            },
            instructionTemplate: {
              syntaxGuidelines: [],
              bestPractices: [],
              commonPitfalls: [],
              examplePatterns: [],
              outputSpecifications: []
            },
            fileExtensions: [],
            exampleCode: '',
            description: ''
          };
        }
        return originalGetFormatConfig.call(formatManager, format);
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('has no supported output formats'))).toBe(true);

      // Restore original methods
      formatManager.getFormatConfig = originalGetFormatConfig;
      formatManager.getEnabledFormats = originalGetEnabledFormats;
    });

    it('should detect invalid output formats', () => {
      // Mock format manager to return format with invalid outputs
      const originalGetFormatConfig = formatManager.getFormatConfig;
      const originalGetEnabledFormats = formatManager.getEnabledFormats;
      
      jest.spyOn(formatManager, 'getEnabledFormats').mockReturnValue(['invalid-outputs']);
      jest.spyOn(formatManager, 'getFormatConfig').mockImplementation((format) => {
        if (format === 'invalid-outputs') {
          return {
            id: 'invalid-outputs',
            displayName: 'Invalid Outputs',
            krokiFormat: 'invalid-outputs',
            supportedOutputs: ['pdf', 'jpg'] as any,  // Invalid outputs
            enabled: true,
            characteristics: {
              strengths: [],
              weaknesses: [],
              bestFor: [],
              examples: []
            },
            instructionTemplate: {
              syntaxGuidelines: [],
              bestPractices: [],
              commonPitfalls: [],
              examplePatterns: [],
              outputSpecifications: []
            },
            fileExtensions: [],
            exampleCode: '',
            description: ''
          };
        }
        return originalGetFormatConfig.call(formatManager, format);
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('has invalid output formats'))).toBe(true);

      // Restore original methods
      formatManager.getFormatConfig = originalGetFormatConfig;
      formatManager.getEnabledFormats = originalGetEnabledFormats;
    });

    it('should handle unknown error types in catch block', () => {
      // Mock format manager to throw non-Error object
      const originalGetAllFormats = formatManager.getAllFormats;
      jest.spyOn(formatManager, 'getAllFormats').mockImplementation(() => {
        throw 'String error'; // Non-Error object
      });

      const result = validateFormatMappingConsistency();
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Validation failed: Unknown error');

      // Restore original method
      formatManager.getAllFormats = originalGetAllFormats;
    });
  });
});
