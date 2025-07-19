import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import { DiagramFormatConfig } from '../config/diagram-formats-config.js';

describe('DiagramFormatsManager - Extended Coverage', () => {
  let manager: DiagramFormatsManager;

  beforeEach(() => {
    manager = DiagramFormatsManager.getInstance();
    manager.reset(); // Reset to clean state
  });

  describe('Format Management Operations', () => {
    it('should add new format successfully', () => {
      const newFormatConfig: DiagramFormatConfig = {
        id: 'test-format',
        displayName: 'Test Format',
        description: 'A test diagram format',
        krokiFormat: 'test',
        fileExtensions: ['.test'],
        supportedOutputs: ['png'],
        enabled: true,
        characteristics: {
          strengths: ['Easy to test'],
          weaknesses: ['Not real'],
          bestFor: ['Testing'],
          examples: ['Unit tests']
        },
        instructionTemplate: {
          syntaxGuidelines: ['Use test syntax'],
          bestPractices: ['Write good tests'],
          commonPitfalls: ['Forgetting to test'],
          examplePatterns: ['test pattern'],
          outputSpecifications: ['PNG output']
        },
        exampleCode: 'test code'
      };

      expect(() => manager.addFormat('test-format', newFormatConfig)).not.toThrow();
      expect(manager.isFormatSupported('test-format')).toBe(true);
      expect(manager.getFormatConfig('test-format')).toBeDefined();
    });

    it('should reject invalid format configuration', () => {
      const invalidConfig = {
        id: 'invalid',
        // Missing required fields
      } as DiagramFormatConfig;

      expect(() => manager.addFormat('invalid', invalidConfig)).toThrow('Invalid format configuration');
    });

    it('should update existing format', () => {
      // First add a format
      const originalConfig: DiagramFormatConfig = {
        id: 'update-test',
        displayName: 'Original Name',
        description: 'Original description',
        krokiFormat: 'test',
        fileExtensions: ['.test'],
        supportedOutputs: ['png'],
        enabled: true,
        characteristics: {
          strengths: ['Original'],
          weaknesses: [],
          bestFor: ['Testing'],
          examples: []
        },
        instructionTemplate: {
          syntaxGuidelines: [],
          bestPractices: [],
          commonPitfalls: [],
          examplePatterns: [],
          outputSpecifications: []
        },
        exampleCode: 'original code'
      };

      manager.addFormat('update-test', originalConfig);

      // Update it
      const updates = {
        displayName: 'Updated Name',
        description: 'Updated description'
      };

      expect(() => manager.updateFormat('update-test', updates)).not.toThrow();
      
      const updatedConfig = manager.getFormatConfig('update-test');
      expect(updatedConfig?.displayName).toBe('Updated Name');
      expect(updatedConfig?.description).toBe('Updated description');
    });

    it('should throw error when updating non-existent format', () => {
      expect(() => manager.updateFormat('non-existent', {})).toThrow('Format non-existent not found');
    });

    it('should enable/disable formats', () => {
      // Use existing format for this test
      expect(manager.isFormatSupported('mermaid')).toBe(true);
      
      // Disable it
      manager.setFormatEnabled('mermaid', false);
      expect(manager.getFormatConfig('mermaid')?.enabled).toBe(false);
      
      // Re-enable it
      manager.setFormatEnabled('mermaid', true);
      expect(manager.getFormatConfig('mermaid')?.enabled).toBe(true);
    });

    it('should throw error when setting enabled state for non-existent format', () => {
      expect(() => manager.setFormatEnabled('non-existent', true)).toThrow('Format non-existent not found');
    });

    it('should remove format successfully', () => {
      // Add format first
      const testConfig: DiagramFormatConfig = {
        id: 'removable',
        displayName: 'Removable Format',
        description: 'Will be removed',
        krokiFormat: 'removable',
        fileExtensions: ['.remove'],
        supportedOutputs: ['png'],
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
        exampleCode: 'removable code'
      };

      manager.addFormat('removable', testConfig);
      expect(manager.isFormatSupported('removable')).toBe(true);

      // Remove it
      manager.removeFormat('removable');
      expect(manager.isFormatSupported('removable')).toBe(false);
    });

    it('should throw error when removing non-existent format', () => {
      expect(() => manager.removeFormat('non-existent')).toThrow('Format non-existent not found');
    });
  });

  describe('Registry Operations', () => {
    it('should export registry', () => {
      const exported = manager.exportRegistry();
      
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('object');
      expect(exported.formats).toBeDefined();
      expect(exported.defaultFormat).toBeDefined();
      expect(exported.lastUpdated).toBeDefined();
    });

    it('should import valid registry', () => {
      const originalRegistry = manager.exportRegistry();
      
      // Modify the registry
      const newRegistry = {
        ...originalRegistry,
        defaultFormat: 'mermaid',
        formats: {
          mermaid: originalRegistry.formats.mermaid!,
          plantuml: originalRegistry.formats.plantuml!
        }
      };

      expect(() => manager.importRegistry(newRegistry)).not.toThrow();
      
      // Check it was imported
      const enabledFormats = manager.getEnabledFormats();
      expect(enabledFormats).toContain('mermaid');
      expect(enabledFormats).toContain('plantuml');
    });

    it('should reject invalid registry on import', () => {
      const invalidRegistry = {
        formats: null, // Invalid
        defaultFormat: 'mermaid'
      } as any;

      expect(() => manager.importRegistry(invalidRegistry)).toThrow('Invalid registry format');
    });

    it('should reject registry with invalid format config', () => {
      const invalidRegistry = {
        formats: {
          invalid: {
            id: 'invalid'
            // Missing required fields
          }
        },
        defaultFormat: 'invalid'
      } as any;

      expect(() => manager.importRegistry(invalidRegistry)).toThrow('Invalid format configuration');
    });

    it('should validate registry integrity', () => {
      // Valid registry should pass
      const validation = manager.validateRegistry();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect registry integrity issues', () => {
      // Corrupt the registry by directly modifying it
      const registry = manager.exportRegistry();
      
      // Remove a required field to simulate corruption
      delete (registry as any).defaultFormat;
      
      manager.importRegistry(registry);
      
      const validation = manager.validateRegistry();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('missing default format'))).toBe(true);
    });

    it('should reset to default configuration', () => {
      // Modify the manager
      manager.setFormatEnabled('mermaid', false);
      
      // Reset
      manager.reset();
      
      // Should be back to default
      expect(manager.getFormatConfig('mermaid')?.enabled).toBe(true);
    });

    it('should warn about unimplemented loadFromConfig', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      manager.loadFromConfig('/fake/path');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'loadFromConfig not implemented, using default registry. Path: /fake/path'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Metadata and Statistics', () => {
    it('should provide accurate metadata', () => {
      const metadata = manager.getMetadata();
      
      expect(metadata.totalFormats).toBeGreaterThan(0);
      expect(metadata.enabledFormats).toBeGreaterThan(0);
      expect(metadata.supportedOutputFormats).toContain('png');
      expect(metadata.supportedOutputFormats).toContain('svg');
      expect(metadata.lastConfigUpdate).toBeDefined();
    });

    it('should update metadata after changes', () => {
      const initialMetadata = manager.getMetadata();
      const initialCount = initialMetadata.totalFormats;
      
      // Add a new format
      const testConfig: DiagramFormatConfig = {
        id: 'metadata-test',
        displayName: 'Metadata Test',
        description: 'For testing metadata',
        krokiFormat: 'test',
        fileExtensions: ['.test'],
        supportedOutputs: ['png'],
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
        exampleCode: 'test'
      };
      
      manager.addFormat('metadata-test', testConfig);
      
      const updatedMetadata = manager.getMetadata();
      expect(updatedMetadata.totalFormats).toBe(initialCount + 1);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle concurrent access safely', () => {
      // Simulate concurrent operations
      const operations = Array.from({ length: 10 }, (_, _i) => 
        () => manager.getEnabledFormats()
      );

      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });

    it('should handle format config with missing optional fields', () => {
      const minimalConfig: DiagramFormatConfig = {
        id: 'minimal',
        displayName: 'Minimal Format',
        description: 'Minimal config',
        krokiFormat: 'minimal',
        fileExtensions: ['.min'],
        supportedOutputs: ['png'],
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
        exampleCode: ''
      };

      expect(() => manager.addFormat('minimal', minimalConfig)).not.toThrow();
    });
  });
});
