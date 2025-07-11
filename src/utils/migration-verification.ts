/**
 * Migration verification utility for dynamic format mapping system
 * Tests that the new dynamic system provides equivalent functionality to the static system
 */

import { getDynamicFormatMapping } from './dynamic-format-mapping.js';
import { validateFormatMappingConsistency } from './format-validation.js';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';

export interface MigrationVerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  details: {
    formatCount: {
      expected: number;
      actual: number;
    };
    mappingVerification: {
      krokiMappings: boolean;
      outputSupport: boolean;
      defaultFormats: boolean;
    };
    functionalityTests: {
      formatValidation: boolean;
      outputValidation: boolean;
      krokiFormatResolution: boolean;
      configurationAccess: boolean;
    };
    performanceMetrics: {
      formatResolutionTime: number;
      mappingGenerationTime: number;
    };
  };
}

/**
 * Verify that the dynamic format mapping migration was successful
 */
export async function verifyMigration(): Promise<MigrationVerificationResult> {
  const result: MigrationVerificationResult = {
    success: true,
    errors: [],
    warnings: [],
    details: {
      formatCount: { expected: 5, actual: 0 },
      mappingVerification: {
        krokiMappings: false,
        outputSupport: false,
        defaultFormats: false
      },
      functionalityTests: {
        formatValidation: false,
        outputValidation: false,
        krokiFormatResolution: false,
        configurationAccess: false
      },
      performanceMetrics: {
        formatResolutionTime: 0,
        mappingGenerationTime: 0
      }
    }
  };

  try {
    const dynamicMapping = getDynamicFormatMapping();
    const formatManager = DiagramFormatsManager.getInstance();

    // Test 1: Format count verification
    const supportedFormats = dynamicMapping.getSupportedFormats();
    result.details.formatCount.actual = supportedFormats.length;
    
    if (supportedFormats.length < result.details.formatCount.expected) {
      result.errors.push(`Expected at least ${result.details.formatCount.expected} formats, got ${supportedFormats.length}`);
    } else if (supportedFormats.length > result.details.formatCount.expected) {
      result.warnings.push(`Found ${supportedFormats.length} formats, more than expected ${result.details.formatCount.expected}. This is okay if new formats were added.`);
    }

    // Test 2: Kroki mapping verification
    try {
      const startTime = performance.now();
      const krokiMappings = dynamicMapping.getFormatMappings();
      result.details.performanceMetrics.mappingGenerationTime = performance.now() - startTime;
      
      result.details.mappingVerification.krokiMappings = krokiMappings.length > 0;
      
      // Verify each mapping has required fields
      for (const mapping of krokiMappings) {
        if (!mapping.mcpFormat || !mapping.krokiFormat || !mapping.supportedOutputs) {
          result.errors.push(`Invalid mapping for format: ${mapping.mcpFormat}`);
        }
      }
    } catch (error) {
      result.errors.push(`Kroki mapping generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Output support verification
    try {
      for (const format of supportedFormats) {
        const outputFormats = dynamicMapping.getSupportedOutputFormats(format);
        if (outputFormats.length === 0) {
          result.errors.push(`Format ${format} has no supported output formats`);
        }
        
        const defaultOutput = dynamicMapping.getDefaultOutputFormat(format);
        if (!defaultOutput) {
          result.errors.push(`Format ${format} has no default output format`);
        } else if (!outputFormats.includes(defaultOutput)) {
          result.errors.push(`Default output format ${defaultOutput} for ${format} is not in supported list`);
        }
      }
      result.details.mappingVerification.outputSupport = result.errors.length === 0;
    } catch (error) {
      result.errors.push(`Output support verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Default format verification
    try {
      for (const format of supportedFormats) {
        const defaultFormat = dynamicMapping.getDefaultOutputFormat(format);
        if (defaultFormat) {
          const isSupported = dynamicMapping.isFormatOutputSupported(format, defaultFormat);
          if (!isSupported) {
            result.errors.push(`Default output format verification failed for ${format}`);
          }
        }
      }
      result.details.mappingVerification.defaultFormats = true;
    } catch (error) {
      result.errors.push(`Default format verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Format validation functionality
    try {
      if (supportedFormats.length > 0) {
        const validFormat = supportedFormats[0];
        const invalidFormat = 'nonexistent_format';
        
        if (validFormat && !dynamicMapping.validateFormat(validFormat)) {
          result.errors.push(`Valid format ${validFormat} failed validation`);
        }
        
        if (dynamicMapping.validateFormat(invalidFormat)) {
          result.errors.push(`Invalid format ${invalidFormat} passed validation`);
        }
      }
      
      result.details.functionalityTests.formatValidation = true;
    } catch (error) {
      result.errors.push(`Format validation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 6: Output format validation
    try {
      if (supportedFormats.length > 0) {
        const firstFormat = supportedFormats[0];
        if (firstFormat && !dynamicMapping.isFormatOutputSupported(firstFormat, 'png')) {
          result.warnings.push(`PNG output not supported for ${firstFormat} - this may be expected`);
        }
      }
      
      result.details.functionalityTests.outputValidation = true;
    } catch (error) {
      result.errors.push(`Output validation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 7: Kroki format resolution performance
    try {
      const startTime = performance.now();
      for (const format of supportedFormats) {
        const krokiFormat = dynamicMapping.getKrokiFormat(format);
        if (!krokiFormat) {
          result.errors.push(`No Kroki format found for ${format}`);
        }
      }
      result.details.performanceMetrics.formatResolutionTime = performance.now() - startTime;
      result.details.functionalityTests.krokiFormatResolution = true;
    } catch (error) {
      result.errors.push(`Kroki format resolution test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 8: Configuration access
    try {
      for (const format of supportedFormats) {
        const config = dynamicMapping.getFormatConfig(format);
        if (!config) {
          result.errors.push(`No configuration found for format ${format}`);
        } else if (!config.name || !config.description) {
          result.errors.push(`Incomplete configuration for format ${format}`);
        }
      }
      result.details.functionalityTests.configurationAccess = true;
    } catch (error) {
      result.errors.push(`Configuration access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 9: Consistency validation
    const consistencyCheck = validateFormatMappingConsistency();
    if (!consistencyCheck.isValid) {
      result.errors.push(...consistencyCheck.errors.map(err => `Consistency check: ${err}`));
    }
    result.warnings.push(...consistencyCheck.warnings.map(warn => `Consistency check: ${warn}`));

    // Performance warnings
    if (result.details.performanceMetrics.formatResolutionTime > 10) {
      result.warnings.push(`Format resolution took ${result.details.performanceMetrics.formatResolutionTime.toFixed(2)}ms - consider optimization`);
    }

    if (result.details.performanceMetrics.mappingGenerationTime > 5) {
      result.warnings.push(`Mapping generation took ${result.details.performanceMetrics.mappingGenerationTime.toFixed(2)}ms - consider caching`);
    }

  } catch (error) {
    result.errors.push(`Migration verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Test adding a new format dynamically (for testing extensibility)
 */
export function testDynamicFormatAddition(): { success: boolean; error?: string } {
  try {
    const formatManager = DiagramFormatsManager.getInstance();
    const testFormatId = 'test_format_temp';
    
    // Add a test format
    formatManager.addFormat(testFormatId, {
      id: testFormatId,
      displayName: 'Test Format',
      description: 'Temporary test format for migration verification',
      krokiFormat: 'test',
      supportedOutputs: ['png'],
      enabled: true,
      fileExtensions: ['.test'],
      exampleCode: 'test diagram code',
      characteristics: {
        strengths: ['Test strength'],
        weaknesses: ['Test weakness'],
        bestFor: ['Testing'],
        examples: ['test example']
      },
      instructionTemplate: {
        syntaxGuidelines: ['Test syntax'],
        bestPractices: ['Test practice'],
        commonPitfalls: ['Test pitfall'],
        examplePatterns: ['test pattern'],
        outputSpecifications: ['test output']
      }
    });

    // Verify it's available
    const dynamicMapping = getDynamicFormatMapping();
    const formats = dynamicMapping.getSupportedFormats();
    const isAdded = formats.includes(testFormatId);

    // Clean up
    formatManager.removeFormat(testFormatId);

    return { success: isAdded };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate a migration report for debugging
 */
export async function generateMigrationReport(): Promise<string> {
  const verification = await verifyMigration();
  const dynamicTest = testDynamicFormatAddition();
  
  const report = [
    '=== Dynamic Format Mapping Migration Report ===',
    '',
    `Migration Status: ${verification.success ? '✅ SUCCESS' : '❌ FAILED'}`,
    '',
    '--- Format Count ---',
    `Expected: ${verification.details.formatCount.expected}`,
    `Actual: ${verification.details.formatCount.actual}`,
    '',
    '--- Mapping Verification ---',
    `Kroki Mappings: ${verification.details.mappingVerification.krokiMappings ? '✅' : '❌'}`,
    `Output Support: ${verification.details.mappingVerification.outputSupport ? '✅' : '❌'}`,
    `Default Formats: ${verification.details.mappingVerification.defaultFormats ? '✅' : '❌'}`,
    '',
    '--- Functionality Tests ---',
    `Format Validation: ${verification.details.functionalityTests.formatValidation ? '✅' : '❌'}`,
    `Output Validation: ${verification.details.functionalityTests.outputValidation ? '✅' : '❌'}`,
    `Kroki Resolution: ${verification.details.functionalityTests.krokiFormatResolution ? '✅' : '❌'}`,
    `Configuration Access: ${verification.details.functionalityTests.configurationAccess ? '✅' : '❌'}`,
    '',
    '--- Performance Metrics ---',
    `Format Resolution: ${verification.details.performanceMetrics.formatResolutionTime.toFixed(2)}ms`,
    `Mapping Generation: ${verification.details.performanceMetrics.mappingGenerationTime.toFixed(2)}ms`,
    '',
    '--- Dynamic Addition Test ---',
    `Dynamic Format Addition: ${dynamicTest.success ? '✅' : '❌'}`,
    dynamicTest.error ? `Error: ${dynamicTest.error}` : '',
    '',
    '--- Issues ---'
  ];

  if (verification.errors.length > 0) {
    report.push('Errors:');
    verification.errors.forEach(error => report.push(`  ❌ ${error}`));
  }

  if (verification.warnings.length > 0) {
    report.push('Warnings:');
    verification.warnings.forEach(warning => report.push(`  ⚠️  ${warning}`));
  }

  if (verification.errors.length === 0 && verification.warnings.length === 0) {
    report.push('No issues detected! 🎉');
  }

  return report.join('\n');
} 