/**
 * @fileoverview Ultimate Branch Coverage Tests for diagram-formats-manager.ts
 * Targeting all conditional branches and edge cases for maximum coverage improvement.
 */

import { DiagramFormatsManager } from '../config/diagram-formats-manager';
import { DiagramFormatsFactory } from '../config/diagram-formats-factory';
import { isValidDiagramFormatConfig } from '../config/diagram-formats-config';
import { OutputFormat } from '../types/diagram-rendering';

// Mock dependencies
jest.mock('../config/diagram-formats-factory');
jest.mock('../config/diagram-formats-config');

const mockIsValidDiagramFormatConfig = isValidDiagramFormatConfig as unknown as jest.Mock;

describe('diagram-formats-manager.ts - Ultimate Branch Coverage', () => {
  let manager: DiagramFormatsManager;
  let mockRegistry: any;

  beforeEach(() => {
    // Clear singleton instance
    (DiagramFormatsManager as any).instance = undefined;
    
    jest.clearAllMocks();

    // Create mock registry
    mockRegistry = {
      formats: {
        mermaid: {
          id: 'mermaid',
          displayName: 'Mermaid',
          description: 'Mermaid description',
          krokiFormat: 'mermaid',
          supportedOutputs: ['png', 'svg'] as OutputFormat[],
          enabled: true,
          characteristics: {
            strengths: ['Easy to use'],
            weaknesses: ['Limited features'],
            bestFor: ['Flowcharts'],
            examples: ['flowchart TD']
          },
          instructionTemplate: {
            syntaxGuidelines: ['Use arrows'],
            bestPractices: ['Keep simple'],
            commonPitfalls: ['Avoid complexity'],
            examplePatterns: ['TD for top-down'],
            outputSpecifications: ['Clear layout']
          },
          fileExtensions: ['.mmd'],
          exampleCode: 'flowchart TD\n  A --> B'
        },
        plantuml: {
          id: 'plantuml',
          displayName: 'PlantUML',
          description: 'PlantUML description',
          krokiFormat: 'plantuml',
          supportedOutputs: ['png', 'svg', 'pdf'] as OutputFormat[],
          enabled: false,
          characteristics: {
            strengths: ['Powerful'],
            weaknesses: ['Complex syntax'],
            bestFor: ['UML diagrams'],
            examples: ['@startuml']
          },
          instructionTemplate: {
            syntaxGuidelines: ['Use @startuml'],
            bestPractices: ['Follow UML standards'],
            commonPitfalls: ['Missing @enduml'],
            examplePatterns: ['@startuml/@enduml'],
            outputSpecifications: ['UML compliant']
          },
          fileExtensions: ['.puml'],
          exampleCode: '@startuml\nAlice -> Bob\n@enduml'
        }
      },
      defaultFormat: 'mermaid',
      lastUpdated: '2023-01-01T00:00:00.000Z',
      version: '1.0.0'
    };

    // Mock factory
    (DiagramFormatsFactory.createDefaultRegistry as jest.Mock).mockReturnValue(mockRegistry);
    mockIsValidDiagramFormatConfig.mockReturnValue(true);

    manager = DiagramFormatsManager.getInstance();
  });

  describe('Singleton Pattern Branch Coverage', () => {
    test('should return same instance on multiple calls', () => {
      const instance1 = DiagramFormatsManager.getInstance();
      const instance2 = DiagramFormatsManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    test('should create new instance when none exists', () => {
      // Clear instance to test initial creation
      (DiagramFormatsManager as any).instance = undefined;

      const instance = DiagramFormatsManager.getInstance();

      expect(instance).toBeInstanceOf(DiagramFormatsManager);
      expect(DiagramFormatsFactory.createDefaultRegistry).toHaveBeenCalled();
    });

    test('should return existing instance when already created', () => {
      const existingInstance = DiagramFormatsManager.getInstance();
      (DiagramFormatsFactory.createDefaultRegistry as jest.Mock).mockClear();

      const newInstance = DiagramFormatsManager.getInstance();

      expect(newInstance).toBe(existingInstance);
      expect(DiagramFormatsFactory.createDefaultRegistry).not.toHaveBeenCalled();
    });
  });

  describe('getEnabledFormats - Filter Branch Coverage', () => {
    test('should return only enabled formats', () => {
      const result = manager.getEnabledFormats();

      expect(result).toEqual(['mermaid']);
      expect(result).not.toContain('plantuml');
    });

    test('should return empty array when no formats enabled', () => {
      // Disable all formats
      mockRegistry.formats.mermaid.enabled = false;
      mockRegistry.formats.plantuml.enabled = false;

      const result = manager.getEnabledFormats();

      expect(result).toEqual([]);
    });

    test('should handle formats with undefined enabled property', () => {
      mockRegistry.formats.test = {
        id: 'test',
        enabled: undefined
      };

      const result = manager.getEnabledFormats();

      expect(result).not.toContain('test');
    });
  });

  describe('getFormatConfig - Existence Branch Coverage', () => {
    test('should return config for existing format', () => {
      const result = manager.getFormatConfig('mermaid');

      expect(result).toEqual(mockRegistry.formats.mermaid);
    });

    test('should return undefined for non-existing format', () => {
      const result = manager.getFormatConfig('nonexistent');

      expect(result).toBeUndefined();
    });

    test('should handle empty string format', () => {
      const result = manager.getFormatConfig('');

      expect(result).toBeUndefined();
    });
  });

  describe('isFormatSupported - Enabled Check Branch Coverage', () => {
    test('should return true for enabled format', () => {
      const result = manager.isFormatSupported('mermaid');

      expect(result).toBe(true);
    });

    test('should return false for disabled format', () => {
      const result = manager.isFormatSupported('plantuml');

      expect(result).toBe(false);
    });

    test('should return false for non-existing format', () => {
      const result = manager.isFormatSupported('nonexistent');

      expect(result).toBe(false);
    });

    test('should handle format with undefined enabled property', () => {
      mockRegistry.formats.test = {
        id: 'test',
        enabled: undefined
      };

      const result = manager.isFormatSupported('test');

      expect(result).toBe(false);
    });

    test('should handle format with null enabled property', () => {
      mockRegistry.formats.test = {
        id: 'test',
        enabled: null
      };

      const result = manager.isFormatSupported('test');

      expect(result).toBe(false);
    });
  });

  describe('getKrokiFormat - Undefined Property Branch Coverage', () => {
    test('should return kroki format for existing format', () => {
      const result = manager.getKrokiFormat('mermaid');

      expect(result).toBe('mermaid');
    });

    test('should return undefined for non-existing format', () => {
      const result = manager.getKrokiFormat('nonexistent');

      expect(result).toBeUndefined();
    });

    test('should return undefined when format config has no krokiFormat', () => {
      mockRegistry.formats.test = {
        id: 'test',
        krokiFormat: undefined
      };

      const result = manager.getKrokiFormat('test');

      expect(result).toBeUndefined();
    });
  });

  describe('getSupportedOutputFormats - Array Fallback Branch Coverage', () => {
    test('should return supported outputs for existing format', () => {
      const result = manager.getSupportedOutputFormats('mermaid');

      expect(result).toEqual(['png', 'svg']);
    });

    test('should return empty array for non-existing format', () => {
      const result = manager.getSupportedOutputFormats('nonexistent');

      expect(result).toEqual([]);
    });

    test('should return empty array when format has undefined supportedOutputs', () => {
      mockRegistry.formats.test = {
        id: 'test',
        supportedOutputs: undefined
      };

      const result = manager.getSupportedOutputFormats('test');

      expect(result).toEqual([]);
    });

    test('should return empty array when format has null supportedOutputs', () => {
      mockRegistry.formats.test = {
        id: 'test',
        supportedOutputs: null
      };

      const result = manager.getSupportedOutputFormats('test');

      expect(result).toEqual([]);
    });
  });

  describe('getDefaultOutputFormat - Array Access Branch Coverage', () => {
    test('should return first output format for existing format', () => {
      const result = manager.getDefaultOutputFormat('mermaid');

      expect(result).toBe('png');
    });

    test('should return undefined for format with empty outputs', () => {
      mockRegistry.formats.test = {
        id: 'test',
        supportedOutputs: []
      };

      const result = manager.getDefaultOutputFormat('test');

      expect(result).toBeUndefined();
    });

    test('should return undefined for non-existing format', () => {
      const result = manager.getDefaultOutputFormat('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('isFormatOutputSupported - Array Includes Branch Coverage', () => {
    test('should return true for supported output format', () => {
      const result = manager.isFormatOutputSupported('mermaid', 'png');

      expect(result).toBe(true);
    });

    test('should return false for unsupported output format', () => {
      const result = manager.isFormatOutputSupported('mermaid', 'pdf' as OutputFormat);

      expect(result).toBe(false);
    });

    test('should return false for non-existing format', () => {
      const result = manager.isFormatOutputSupported('nonexistent', 'png');

      expect(result).toBe(false);
    });

    test('should return false when format has empty supportedOutputs', () => {
      mockRegistry.formats.test = {
        id: 'test',
        supportedOutputs: []
      };

      const result = manager.isFormatOutputSupported('test', 'png');

      expect(result).toBe(false);
    });
  });

  describe('getFormatCharacteristics - Undefined Check Branch Coverage', () => {
    test('should return characteristics for existing format', () => {
      const result = manager.getFormatCharacteristics('mermaid');

      expect(result).toEqual({
        name: 'mermaid',
        displayName: 'Mermaid',
        description: 'Mermaid description',
        strengths: ['Easy to use'],
        weaknesses: ['Limited features'],
        bestFor: ['Flowcharts'],
        examples: ['flowchart TD']
      });
    });

    test('should return undefined for non-existing format', () => {
      const result = manager.getFormatCharacteristics('nonexistent');

      expect(result).toBeUndefined();
    });

    test('should handle format with missing characteristics', () => {
      mockRegistry.formats.test = {
        id: 'test',
        displayName: 'Test',
        description: 'Test format'
        // characteristics is intentionally undefined
      };

      expect(() => {
        manager.getFormatCharacteristics('test');
      }).toThrow();
    });
  });

  describe('getInstructionTemplate - Undefined Check Branch Coverage', () => {
    test('should return instruction template for existing format', () => {
      const result = manager.getInstructionTemplate('mermaid');

      expect(result).toEqual({
        format: 'mermaid',
        displayName: 'Mermaid',
        syntaxGuidelines: ['Use arrows'],
        bestPractices: ['Keep simple'],
        commonPitfalls: ['Avoid complexity'],
        examplePatterns: ['TD for top-down'],
        outputSpecifications: ['Clear layout']
      });
    });

    test('should return undefined for non-existing format', () => {
      const result = manager.getInstructionTemplate('nonexistent');

      expect(result).toBeUndefined();
    });

    test('should handle format with missing instruction template', () => {
      mockRegistry.formats.test = {
        id: 'test',
        instructionTemplate: undefined
      };

      expect(() => {
        manager.getInstructionTemplate('test');
      }).toThrow();
    });
  });

  describe('addFormat - Validation Branch Coverage', () => {
    test('should add valid format successfully', () => {
      const newConfig = {
        id: 'newformat',
        displayName: 'New Format',
        description: 'New format description',
        krokiFormat: 'newformat',
        supportedOutputs: ['png'] as OutputFormat[],
        enabled: true,
        characteristics: {
          strengths: ['Test strength'],
          weaknesses: ['Test weakness'],
          bestFor: ['Test usage'],
          examples: ['test example']
        },
        instructionTemplate: {
          syntaxGuidelines: ['Test syntax'],
          bestPractices: ['Test practice'],
          commonPitfalls: ['Test pitfall'],
          examplePatterns: ['Test pattern'],
          outputSpecifications: ['Test output']
        },
        fileExtensions: ['.new'],
        exampleCode: 'example'
      };

      manager.addFormat('newformat', newConfig);

      expect(manager.getFormatConfig('newformat')).toEqual(newConfig);
    });

    test('should throw error for invalid format configuration', () => {
      mockIsValidDiagramFormatConfig.mockReturnValue(false);

      const invalidConfig = { id: 'invalid' };

      expect(() => {
        manager.addFormat('invalid', invalidConfig as any);
      }).toThrow('Invalid format configuration for invalid');
    });

    test('should update lastUpdated timestamp when adding format', () => {
      const originalLastUpdated = mockRegistry.lastUpdated;
      
      const newConfig = {
        id: 'newformat',
        displayName: 'New Format',
        description: 'New format description',
        krokiFormat: 'newformat',
        supportedOutputs: ['png'] as OutputFormat[],
        enabled: true,
        characteristics: {
          strengths: ['Test strength'],
          weaknesses: ['Test weakness'],
          bestFor: ['Test usage'],
          examples: ['test example']
        },
        instructionTemplate: {
          syntaxGuidelines: ['Test syntax'],
          bestPractices: ['Test practice'],
          commonPitfalls: ['Test pitfall'],
          examplePatterns: ['Test pattern'],
          outputSpecifications: ['Test output']
        },
        fileExtensions: ['.new'],
        exampleCode: 'example'
      };

      manager.addFormat('newformat', newConfig);

      const metadata = manager.getMetadata();
      expect(metadata.lastConfigUpdate).not.toBe(originalLastUpdated);
    });
  });

  describe('updateFormat - Error Handling Branch Coverage', () => {
    test('should update existing format successfully', () => {
      const updates = { displayName: 'Updated Mermaid' };

      manager.updateFormat('mermaid', updates);

      const config = manager.getFormatConfig('mermaid');
      expect(config?.displayName).toBe('Updated Mermaid');
    });

    test('should throw error for non-existing format', () => {
      expect(() => {
        manager.updateFormat('nonexistent', { displayName: 'Updated' });
      }).toThrow('Format nonexistent not found');
    });

    test('should throw error for invalid updated configuration', () => {
      mockIsValidDiagramFormatConfig.mockReturnValue(false);

      expect(() => {
        manager.updateFormat('mermaid', { displayName: 'Updated' });
      }).toThrow('Invalid updated configuration for mermaid');
    });
  });

  describe('setFormatEnabled - Error Handling Branch Coverage', () => {
    test('should enable disabled format', () => {
      manager.setFormatEnabled('plantuml', true);

      expect(manager.isFormatSupported('plantuml')).toBe(true);
    });

    test('should disable enabled format', () => {
      manager.setFormatEnabled('mermaid', false);

      expect(manager.isFormatSupported('mermaid')).toBe(false);
    });

    test('should throw error for non-existing format', () => {
      expect(() => {
        manager.setFormatEnabled('nonexistent', true);
      }).toThrow('Format nonexistent not found');
    });
  });

  describe('removeFormat - Error Handling Branch Coverage', () => {
    test('should remove existing format', () => {
      manager.removeFormat('plantuml');

      expect(manager.isFormatAvailable('plantuml')).toBe(false);
    });

    test('should throw error for non-existing format', () => {
      expect(() => {
        manager.removeFormat('nonexistent');
      }).toThrow('Format nonexistent not found');
    });
  });

  describe('importRegistry - Validation Branch Coverage', () => {
    test('should import valid registry', () => {
      const newRegistry = {
        formats: {
          test: {
            id: 'test',
            displayName: 'Test',
            description: 'Test format',
            krokiFormat: 'test',
            supportedOutputs: ['png'] as OutputFormat[],
            enabled: true,
            characteristics: {
              strengths: ['Test strength'],
              weaknesses: ['Test weakness'],
              bestFor: ['Test usage'],
              examples: ['test example']
            },
            instructionTemplate: {
              syntaxGuidelines: ['Test syntax'],
              bestPractices: ['Test practice'],
              commonPitfalls: ['Test pitfall'],
              examplePatterns: ['Test pattern'],
              outputSpecifications: ['Test output']
            },
            fileExtensions: ['.test'],
            exampleCode: 'test'
          }
        },
        defaultFormat: 'test',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        version: '1.0.0'
      };

      manager.importRegistry(newRegistry);

      expect(manager.getFormatConfig('test')).toBeDefined();
    });

    test('should throw error for registry with missing formats', () => {
      const invalidRegistry = {
        defaultFormat: 'test',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        version: '1.0.0'
      } as any;

      expect(() => {
        manager.importRegistry(invalidRegistry);
      }).toThrow('Invalid registry format: missing or invalid formats');
    });

    test('should throw error for registry with invalid formats object', () => {
      const invalidRegistry = {
        formats: 'not an object',
        defaultFormat: 'test',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        version: '1.0.0'
      } as any;

      expect(() => {
        manager.importRegistry(invalidRegistry);
      }).toThrow('Invalid registry format: missing or invalid formats');
    });

    test('should throw error for invalid format configuration in registry', () => {
      mockIsValidDiagramFormatConfig.mockReturnValue(false);

      const invalidRegistry = {
        formats: {
          invalid: { id: 'invalid' }
        },
        defaultFormat: 'invalid',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        version: '1.0.0'
      } as any;

      expect(() => {
        manager.importRegistry(invalidRegistry);
      }).toThrow('Invalid format configuration for invalid');
    });
  });

  describe('validateRegistry - Comprehensive Validation Branch Coverage', () => {
    test('should validate valid registry', () => {
      const result = manager.validateRegistry();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect missing formats object', () => {
      const originalFormats = (manager as any).registry.formats;
      delete (manager as any).registry.formats;

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Registry missing formats object'))).toBe(true);

      // Restore for other tests
      (manager as any).registry.formats = originalFormats;
    });

    test('should detect missing default format', () => {
      delete (manager as any).registry.defaultFormat;

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Registry missing default format');
    });

    test('should detect non-existing default format', () => {
      (manager as any).registry.defaultFormat = 'nonexistent';

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Default format \'nonexistent\' not found');
    });

    test('should detect disabled default format', () => {
      (manager as any).registry.formats.mermaid.enabled = false;

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Default format \'mermaid\' is disabled');
    });

    test('should detect invalid format configuration', () => {
      mockIsValidDiagramFormatConfig.mockImplementation((config) => 
        (config as any).id !== 'mermaid'
      );

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid configuration for format \'mermaid\''))).toBe(true);
    });

    test('should detect format ID mismatch', () => {
      (manager as any).registry.formats.mermaid.id = 'different_id';

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format ID mismatch for \'mermaid\': config.id is \'different_id\'');
    });

    test('should accumulate multiple validation errors', () => {
      const originalFormats = (manager as any).registry.formats;
      const originalDefaultFormat = (manager as any).registry.defaultFormat;
      
      delete (manager as any).registry.formats;
      delete (manager as any).registry.defaultFormat;

      const result = manager.validateRegistry();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Registry missing formats object'))).toBe(true);

      // Restore for other tests
      (manager as any).registry.formats = originalFormats;
      (manager as any).registry.defaultFormat = originalDefaultFormat;
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('should handle loadFromConfig placeholder', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      manager.loadFromConfig('/path/to/config');

      expect(consoleSpy).toHaveBeenCalledWith(
        'loadFromConfig not implemented, using default registry. Path: /path/to/config'
      );

      consoleSpy.mockRestore();
    });

    test('should reset to default configuration', () => {
      // Setup fresh default registry for reset
      const resetMockRegistry = {
        formats: {
          mermaid: {
            id: 'mermaid',
            displayName: 'Mermaid',
            description: 'Mermaid description',
            krokiFormat: 'mermaid',
            supportedOutputs: ['png', 'svg'] as OutputFormat[],
            enabled: true,
            characteristics: {
              strengths: ['Easy to use'],
              weaknesses: ['Limited features'],
              bestFor: ['Flowcharts'],
              examples: ['flowchart TD']
            },
            instructionTemplate: {
              syntaxGuidelines: ['Use arrows'],
              bestPractices: ['Keep simple'],
              commonPitfalls: ['Avoid complexity'],
              examplePatterns: ['TD for top-down'],
              outputSpecifications: ['Clear layout']
            },
            fileExtensions: ['.mmd'],
            exampleCode: 'flowchart TD\n  A --> B'
          }
        },
        defaultFormat: 'mermaid',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        version: '1.0.0'
      };

      // Modify registry by adding test format
      manager.addFormat('test', {
        id: 'test',
        displayName: 'Test',
        description: 'Test format',
        krokiFormat: 'test',
        supportedOutputs: ['png'] as OutputFormat[],
        enabled: true,
        characteristics: {
          strengths: ['Test strength'],
          weaknesses: ['Test weakness'],
          bestFor: ['Test usage'],
          examples: ['test example']
        },
        instructionTemplate: {
          syntaxGuidelines: ['Test syntax'],
          bestPractices: ['Test practice'],
          commonPitfalls: ['Test pitfall'],
          examplePatterns: ['Test pattern'],
          outputSpecifications: ['Test output']
        },
        fileExtensions: ['.test'],
        exampleCode: 'test'
      });

      expect(manager.isFormatAvailable('test')).toBe(true);

      // Mock factory to return clean registry on reset
      (DiagramFormatsFactory.createDefaultRegistry as jest.Mock).mockReturnValue(resetMockRegistry);
      
      manager.reset();

      // After reset, should only have default formats
      expect(manager.isFormatAvailable('test')).toBe(false);
      expect(manager.isFormatAvailable('mermaid')).toBe(true);
      expect(DiagramFormatsFactory.createDefaultRegistry).toHaveBeenCalledTimes(2);
    });

    test('should export registry as deep copy', () => {
      const exported = manager.exportRegistry();

      expect(exported).toEqual(mockRegistry);
      expect(exported).not.toBe(mockRegistry);
    });

    test('should handle format with partial characteristics', () => {
      mockRegistry.formats.partial = {
        id: 'partial',
        displayName: 'Partial',
        description: 'Partial format',
        characteristics: {
          strengths: ['Good'],
          // Missing other properties
        }
      };

      const result = manager.getFormatCharacteristics('partial');

      expect(result?.strengths).toEqual(['Good']);
      expect(result?.weaknesses).toBeUndefined();
    });

    test('should handle format with partial instruction template', () => {
      mockRegistry.formats.partial = {
        id: 'partial',
        displayName: 'Partial',
        instructionTemplate: {
          syntaxGuidelines: ['Basic syntax'],
          // Missing other properties
        }
      };

      const result = manager.getInstructionTemplate('partial');

      expect(result?.syntaxGuidelines).toEqual(['Basic syntax']);
      expect(result?.bestPractices).toBeUndefined();
    });
  });
});
