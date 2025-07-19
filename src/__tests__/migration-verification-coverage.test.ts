import {
  verifyMigration,
  testDynamicFormatAddition,
  generateMigrationReport
} from '../utils/migration-verification.js';
import { getDynamicFormatMapping } from '../utils/dynamic-format-mapping.js';
import { validateFormatMappingConsistency } from '../utils/format-validation.js';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';

// Mock dependencies
jest.mock('../utils/dynamic-format-mapping.js');
jest.mock('../utils/format-validation.js');
jest.mock('../config/diagram-formats-manager.js');

const mockGetDynamicFormatMapping = getDynamicFormatMapping as jest.MockedFunction<typeof getDynamicFormatMapping>;
const mockValidateFormatMappingConsistency = validateFormatMappingConsistency as jest.MockedFunction<typeof validateFormatMappingConsistency>;

describe('Migration Verification - Complete Branch Coverage', () => {
  let mockDynamicMapping: any;
  let mockFormatManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock dynamic mapping with default behavior
    mockDynamicMapping = {
      getSupportedFormats: jest.fn().mockReturnValue(['mermaid', 'plantuml', 'graphviz']),
      getFormatMappings: jest.fn().mockReturnValue([
        { mcpFormat: 'mermaid', krokiFormat: 'mermaid', supportedOutputs: ['png', 'svg'] },
        { mcpFormat: 'plantuml', krokiFormat: 'plantuml', supportedOutputs: ['png', 'svg'] }
      ]),
      getSupportedOutputFormats: jest.fn().mockReturnValue(['png', 'svg']),
      getDefaultOutputFormat: jest.fn().mockReturnValue('png'),
      isFormatOutputSupported: jest.fn().mockReturnValue(true),
      validateFormat: jest.fn().mockImplementation((format: string) => format !== 'nonexistent_format'),
      getKrokiFormat: jest.fn().mockReturnValue('mermaid'),
      getFormatConfig: jest.fn().mockReturnValue({
        name: 'Test Format',
        description: 'Test description'
      })
    };

    mockGetDynamicFormatMapping.mockReturnValue(mockDynamicMapping);

    // Mock format manager
    mockFormatManager = {
      addFormat: jest.fn(),
      removeFormat: jest.fn()
    };
    
    // Mock DiagramFormatsManager.getInstance
    (DiagramFormatsManager.getInstance as jest.MockedFunction<typeof DiagramFormatsManager.getInstance>)
      .mockReturnValue(mockFormatManager);

    // Mock consistency validation
    mockValidateFormatMappingConsistency.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });

    // Mock performance.now
    global.performance = {
      now: jest.fn().mockReturnValue(100)
    } as any;
  });

  describe('verifyMigration()', () => {
    it('should succeed with valid configuration', async () => {
      // Set up conditions for success - need 5+ formats
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2']);
      
      const result = await verifyMigration();
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.details.formatCount.actual).toBe(5);
      expect(result.details.mappingVerification.krokiMappings).toBe(true);
    });

    it('should handle insufficient format count', async () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml']); // Only 2 formats
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Expected at least 5 formats, got 2');
      expect(result.success).toBe(false);
    });

    it('should handle excess format count with warning', async () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue([
        'mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2', 'extra1', 'extra2'
      ]);
      
      const result = await verifyMigration();
      
      expect(result.warnings).toContain(
        'Found 7 formats, more than expected 5. This is okay if new formats were added.'
      );
    });

    it('should handle empty format mappings', async () => {
      mockDynamicMapping.getFormatMappings.mockReturnValue([]);
      
      const result = await verifyMigration();
      
      expect(result.details.mappingVerification.krokiMappings).toBe(false);
    });

    it('should detect invalid mappings missing required fields', async () => {
      mockDynamicMapping.getFormatMappings.mockReturnValue([
        { mcpFormat: 'mermaid', krokiFormat: '', supportedOutputs: ['png'] }, // Missing krokiFormat
        { mcpFormat: '', krokiFormat: 'plantuml', supportedOutputs: ['png'] }, // Missing mcpFormat
        { mcpFormat: 'graphviz', krokiFormat: 'graphviz', supportedOutputs: undefined } // Missing supportedOutputs
      ]);
      // Ensure we have 3 formats so only mapping errors fail
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2']);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Invalid mapping for format: mermaid');
      expect(result.errors).toContain('Invalid mapping for format: ');
      expect(result.errors).toContain('Invalid mapping for format: graphviz');
      expect(result.success).toBe(false);
    });

    it('should handle kroki mapping generation errors', async () => {
      mockDynamicMapping.getFormatMappings.mockImplementation(() => {
        throw new Error('Mapping generation failed');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Kroki mapping generation failed: Mapping generation failed');
      expect(result.success).toBe(false);
    });

    it('should handle formats with no supported output formats', async () => {
      mockDynamicMapping.getSupportedOutputFormats.mockReturnValue([]);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Format mermaid has no supported output formats');
      expect(result.errors).toContain('Format plantuml has no supported output formats');
      expect(result.success).toBe(false);
    });

    it('should handle formats with no default output format', async () => {
      mockDynamicMapping.getDefaultOutputFormat.mockReturnValue(null);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Format mermaid has no default output format');
      expect(result.errors).toContain('Format plantuml has no default output format');
      expect(result.success).toBe(false);
    });

    it('should handle default output format not in supported list', async () => {
      mockDynamicMapping.getDefaultOutputFormat.mockReturnValue('pdf');
      mockDynamicMapping.getSupportedOutputFormats.mockReturnValue(['png', 'svg']);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Default output format pdf for mermaid is not in supported list');
      expect(result.success).toBe(false);
    });

    it('should handle output support verification errors', async () => {
      mockDynamicMapping.getSupportedOutputFormats.mockImplementation(() => {
        throw new Error('Output formats error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Output support verification failed: Output formats error');
      expect(result.success).toBe(false);
    });

    it('should handle default format verification failure', async () => {
      mockDynamicMapping.isFormatOutputSupported.mockReturnValue(false);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Default output format verification failed for mermaid');
      expect(result.success).toBe(false);
    });

    it('should handle default format verification errors', async () => {
      mockDynamicMapping.isFormatOutputSupported.mockImplementation(() => {
        throw new Error('Default format verification error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Default format verification failed: Default format verification error');
      expect(result.success).toBe(false);
    });

    it('should handle valid format failing validation', async () => {
      mockDynamicMapping.validateFormat.mockImplementation((format: string) => {
        if (format === 'mermaid') return false; // Valid format fails validation
        return format !== 'nonexistent_format';
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Valid format mermaid failed validation');
      expect(result.success).toBe(false);
    });

    it('should handle invalid format passing validation', async () => {
      mockDynamicMapping.validateFormat.mockReturnValue(true); // Invalid format passes
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Invalid format nonexistent_format passed validation');
      expect(result.success).toBe(false);
    });

    it('should handle format validation test errors', async () => {
      mockDynamicMapping.validateFormat.mockImplementation(() => {
        throw new Error('Format validation error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Format validation test failed: Format validation error');
      expect(result.success).toBe(false);
    });

    it('should handle output validation warnings for missing PNG support', async () => {
      mockDynamicMapping.isFormatOutputSupported.mockImplementation((format: string, output: string) => {
        return !(format === 'mermaid' && output === 'png');
      });
      
      const result = await verifyMigration();
      
      expect(result.warnings).toContain('PNG output not supported for mermaid - this may be expected');
    });

    it('should handle output validation test errors', async () => {
      mockDynamicMapping.isFormatOutputSupported.mockImplementation((format: string, output: string) => {
        if (output === 'png') throw new Error('Output validation error');
        return true;
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Output validation test failed: Output validation error');
      expect(result.success).toBe(false);
    });

    it('should handle missing kroki format for supported format', async () => {
      mockDynamicMapping.getKrokiFormat.mockReturnValue(null);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('No Kroki format found for mermaid');
      expect(result.errors).toContain('No Kroki format found for plantuml');
      expect(result.success).toBe(false);
    });

    it('should handle kroki format resolution errors', async () => {
      mockDynamicMapping.getKrokiFormat.mockImplementation(() => {
        throw new Error('Kroki format resolution error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Kroki format resolution test failed: Kroki format resolution error');
      expect(result.success).toBe(false);
    });

    it('should handle missing configuration for format', async () => {
      mockDynamicMapping.getFormatConfig.mockReturnValue(null);
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('No configuration found for format mermaid');
      expect(result.errors).toContain('No configuration found for format plantuml');
      expect(result.success).toBe(false);
    });

    it('should handle incomplete configuration', async () => {
      mockDynamicMapping.getFormatConfig.mockReturnValue({ name: '', description: 'Test' }); // Missing name
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Incomplete configuration for format mermaid');
      expect(result.success).toBe(false);
    });

    it('should handle configuration access errors', async () => {
      mockDynamicMapping.getFormatConfig.mockImplementation(() => {
        throw new Error('Configuration access error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Configuration access test failed: Configuration access error');
      expect(result.success).toBe(false);
    });

    it('should handle consistency validation failures', async () => {
      mockValidateFormatMappingConsistency.mockReturnValue({
        isValid: false,
        errors: ['Consistency error 1', 'Consistency error 2'],
        warnings: ['Consistency warning 1']
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Consistency check: Consistency error 1');
      expect(result.errors).toContain('Consistency check: Consistency error 2');
      expect(result.warnings).toContain('Consistency check: Consistency warning 1');
      expect(result.success).toBe(false);
    });

    it('should add performance warnings for slow format resolution', async () => {
      let callCount = 0;
      global.performance.now = jest.fn().mockImplementation(() => {
        callCount++;
        // First call: start of mapping generation (0ms)
        // Second call: end of mapping generation (5ms)  
        // Third call: start of format resolution (5ms)
        // Fourth call: end of format resolution (20ms) = 15ms total
        return callCount === 1 ? 0 : callCount === 2 ? 5 : callCount === 3 ? 5 : 20;
      });
      
      // Ensure enough formats for success
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2']);
      
      const result = await verifyMigration();
      
      expect(result.warnings).toContain('Format resolution took 15.00ms - consider optimization');
    });

    it('should add performance warnings for slow mapping generation', async () => {
      let callCount = 0;
      global.performance.now = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 10; // 10ms for mapping generation
      });
      
      const result = await verifyMigration();
      
      expect(result.warnings).toContain('Mapping generation took 10.00ms - consider caching');
    });

    it('should handle general migration verification errors', async () => {
      mockGetDynamicFormatMapping.mockImplementation(() => {
        throw new Error('General migration error');
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Migration verification failed: General migration error');
      expect(result.success).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockGetDynamicFormatMapping.mockImplementation(() => {
        throw 'String error';
      });
      
      const result = await verifyMigration();
      
      expect(result.errors).toContain('Migration verification failed: Unknown error');
      expect(result.success).toBe(false);
    });
  });

  describe('testDynamicFormatAddition()', () => {
    it('should successfully add and remove test format', () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'test_format_temp']);
      
      const result = testDynamicFormatAddition();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFormatManager.addFormat).toHaveBeenCalledWith('test_format_temp', expect.any(Object));
      expect(mockFormatManager.removeFormat).toHaveBeenCalledWith('test_format_temp');
    });

    it('should handle format addition failure', () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml']); // Test format not added
      
      const result = testDynamicFormatAddition();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should handle addFormat errors', () => {
      mockFormatManager.addFormat.mockImplementation(() => {
        throw new Error('Add format error');
      });
      
      const result = testDynamicFormatAddition();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Add format error');
    });

    it('should handle non-Error exceptions in format addition', () => {
      mockFormatManager.addFormat.mockImplementation(() => {
        throw 'String error';
      });
      
      const result = testDynamicFormatAddition();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('generateMigrationReport()', () => {
    it('should generate successful report', async () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'graphviz', 'd2', 'bpmn']);
      // Ensure dynamic addition succeeds
      mockDynamicMapping.getSupportedFormats.mockReturnValueOnce(['mermaid', 'plantuml', 'graphviz', 'd2', 'bpmn'])
                                           .mockReturnValueOnce(['mermaid', 'plantuml', 'test_format_temp']);
      
      const report = await generateMigrationReport();
      
      expect(report).toContain('Migration Status: ✅ SUCCESS');
      expect(report).toContain('Actual: 5');
      expect(report).toContain('No issues detected! 🎉');
      expect(report).toContain('Dynamic Format Addition: ✅');
    });

    it('should generate failed report with errors and warnings', async () => {
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid']); // Insufficient formats
      mockDynamicMapping.getFormatMappings.mockReturnValue([]); // No mappings
      mockValidateFormatMappingConsistency.mockReturnValue({
        isValid: false,
        errors: ['Test consistency error'],
        warnings: ['Test consistency warning']
      });
      
      const report = await generateMigrationReport();
      
      expect(report).toContain('Migration Status: ❌ FAILED');
      expect(report).toContain('❌ Expected at least 5 formats, got 1');
      expect(report).toContain('❌ Consistency check: Test consistency error');
      expect(report).toContain('⚠️  Consistency check: Test consistency warning');
    });

    it('should include dynamic addition test failure', async () => {
      mockFormatManager.addFormat.mockImplementation(() => {
        throw new Error('Dynamic test error');
      });
      
      const report = await generateMigrationReport();
      
      expect(report).toContain('Dynamic Format Addition: ❌');
      expect(report).toContain('Error: Dynamic test error');
    });

    it('should show performance metrics', async () => {
      let callCount = 0;
      global.performance.now = jest.fn().mockImplementation(() => {
        callCount++;
        // Track both mapping generation and format resolution times
        return callCount === 1 ? 0 : callCount === 2 ? 7.5 : callCount === 3 ? 7.5 : 22.75; // 15.25ms for format resolution
      });
      
      // Ensure we have enough formats to avoid format count errors
      mockDynamicMapping.getSupportedFormats.mockReturnValue(['mermaid', 'plantuml', 'graphviz', 'bpmn', 'd2']);
      
      const report = await generateMigrationReport();
      
      expect(report).toContain('Format Resolution: 15.25ms');
      expect(report).toContain('Mapping Generation: 7.50ms');
    });
  });
});
