import {
  DynamicFormatMapping,
  getDynamicFormatMapping,
  validateOutputFormat,
  getContentType,
} from '../utils/dynamic-format-mapping';
import { DiagramFormatsManager } from '../config/diagram-formats-manager';
import { DiagramFormat } from '../types/diagram-selection';
import { OutputFormat } from '../types/diagram-rendering';

// Mock dependencies
jest.mock('../config/diagram-formats-manager');

const mockDiagramFormatsManager = DiagramFormatsManager as jest.Mocked<typeof DiagramFormatsManager>;

describe('dynamic-format-mapping.ts - Comprehensive Branch Coverage', () => {
  let mockInstance: any;
  let dynamicMapping: DynamicFormatMapping;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset singleton
    (getDynamicFormatMapping as any).dynamicMapping = undefined;
    
    // Setup default mock
    mockInstance = {
      getKrokiFormat: jest.fn(),
      getSupportedOutputFormats: jest.fn(),
      isFormatOutputSupported: jest.fn(),
      getEnabledFormats: jest.fn(),
      getDefaultOutputFormat: jest.fn(),
      isFormatSupported: jest.fn(),
      getFormatConfig: jest.fn(),
      isFormatAvailable: jest.fn(),
      getMetadata: jest.fn(),
    };
    
    mockDiagramFormatsManager.getInstance = jest.fn().mockReturnValue(mockInstance);
    dynamicMapping = new DynamicFormatMapping();
  });

  describe('DynamicFormatMapping Constructor', () => {
    it('should create instance with format manager', () => {
      expect(mockDiagramFormatsManager.getInstance).toHaveBeenCalled();
      expect(dynamicMapping).toBeInstanceOf(DynamicFormatMapping);
    });
  });

  describe('getKrokiFormat - Format Resolution', () => {
    it('should return kroki format for valid MCP format', () => {
      mockInstance.getKrokiFormat.mockReturnValue('mermaid');
      
      const result = dynamicMapping.getKrokiFormat('mermaid' as DiagramFormat);
      expect(result).toBe('mermaid');
      expect(mockInstance.getKrokiFormat).toHaveBeenCalledWith('mermaid');
    });

    it('should return undefined for unsupported format', () => {
      mockInstance.getKrokiFormat.mockReturnValue(undefined);
      
      const result = dynamicMapping.getKrokiFormat('unknown' as DiagramFormat);
      expect(result).toBeUndefined();
    });
  });

  describe('getKrokiFormatSafe - Error Handling Branches', () => {
    it('should return kroki format when available', () => {
      mockInstance.getKrokiFormat.mockReturnValue('plantuml');
      
      const result = dynamicMapping.getKrokiFormatSafe('plantuml' as DiagramFormat);
      expect(result).toBe('plantuml');
    });

    it('should throw error when kroki format not available', () => {
      mockInstance.getKrokiFormat.mockReturnValue(undefined);
      
      expect(() => {
        dynamicMapping.getKrokiFormatSafe('unsupported' as DiagramFormat);
      }).toThrow('Unsupported diagram format: unsupported');
    });

    it('should throw error when kroki format is null', () => {
      mockInstance.getKrokiFormat.mockReturnValue(null);
      
      expect(() => {
        dynamicMapping.getKrokiFormatSafe('invalid' as DiagramFormat);
      }).toThrow('Unsupported diagram format: invalid');
    });

    it('should throw error when kroki format is empty string', () => {
      mockInstance.getKrokiFormat.mockReturnValue('');
      
      expect(() => {
        dynamicMapping.getKrokiFormatSafe('empty' as DiagramFormat);
      }).toThrow('Unsupported diagram format: empty');
    });
  });

  describe('getSupportedOutputFormats', () => {
    it('should return supported output formats', () => {
      const expectedFormats: OutputFormat[] = ['png', 'svg'];
      mockInstance.getSupportedOutputFormats.mockReturnValue(expectedFormats);
      
      const result = dynamicMapping.getSupportedOutputFormats('mermaid' as DiagramFormat);
      expect(result).toEqual(expectedFormats);
      expect(mockInstance.getSupportedOutputFormats).toHaveBeenCalledWith('mermaid');
    });

    it('should handle empty output formats array', () => {
      mockInstance.getSupportedOutputFormats.mockReturnValue([]);
      
      const result = dynamicMapping.getSupportedOutputFormats('unknown' as DiagramFormat);
      expect(result).toEqual([]);
    });
  });

  describe('isFormatOutputSupported', () => {
    it('should return true for supported format-output combination', () => {
      mockInstance.isFormatOutputSupported.mockReturnValue(true);
      
      const result = dynamicMapping.isFormatOutputSupported('mermaid' as DiagramFormat, 'png');
      expect(result).toBe(true);
      expect(mockInstance.isFormatOutputSupported).toHaveBeenCalledWith('mermaid', 'png');
    });

    it('should return false for unsupported format-output combination', () => {
      mockInstance.isFormatOutputSupported.mockReturnValue(false);
      
      const result = dynamicMapping.isFormatOutputSupported('mermaid' as DiagramFormat, 'jpg' as OutputFormat);
      expect(result).toBe(false);
    });
  });

  describe('getSupportedFormats', () => {
    it('should return list of enabled formats', () => {
      const expectedFormats: DiagramFormat[] = ['mermaid', 'plantuml', 'd2'];
      mockInstance.getEnabledFormats.mockReturnValue(expectedFormats);
      
      const result = dynamicMapping.getSupportedFormats();
      expect(result).toEqual(expectedFormats);
      expect(mockInstance.getEnabledFormats).toHaveBeenCalled();
    });

    it('should handle empty enabled formats array', () => {
      mockInstance.getEnabledFormats.mockReturnValue([]);
      
      const result = dynamicMapping.getSupportedFormats();
      expect(result).toEqual([]);
    });
  });

  describe('getDefaultOutputFormat', () => {
    it('should return default output format when available', () => {
      mockInstance.getDefaultOutputFormat.mockReturnValue('png');
      
      const result = dynamicMapping.getDefaultOutputFormat('mermaid' as DiagramFormat);
      expect(result).toBe('png');
      expect(mockInstance.getDefaultOutputFormat).toHaveBeenCalledWith('mermaid');
    });

    it('should return undefined when no default format available', () => {
      mockInstance.getDefaultOutputFormat.mockReturnValue(undefined);
      
      const result = dynamicMapping.getDefaultOutputFormat('unknown' as DiagramFormat);
      expect(result).toBeUndefined();
    });
  });

  describe('getDefaultOutputFormatSafe - Error Handling Branches', () => {
    it('should return default output format when available', () => {
      mockInstance.getDefaultOutputFormat.mockReturnValue('svg');
      
      const result = dynamicMapping.getDefaultOutputFormatSafe('plantuml' as DiagramFormat);
      expect(result).toBe('svg');
    });

    it('should throw error when no default format available', () => {
      mockInstance.getDefaultOutputFormat.mockReturnValue(undefined);
      
      expect(() => {
        dynamicMapping.getDefaultOutputFormatSafe('unsupported' as DiagramFormat);
      }).toThrow('No supported output formats for diagram format: unsupported');
    });

    it('should throw error when default format is null', () => {
      mockInstance.getDefaultOutputFormat.mockReturnValue(null);
      
      expect(() => {
        dynamicMapping.getDefaultOutputFormatSafe('invalid' as DiagramFormat);
      }).toThrow('No supported output formats for diagram format: invalid');
    });
  });

  describe('validateFormat', () => {
    it('should return true for supported format', () => {
      mockInstance.isFormatSupported.mockReturnValue(true);
      
      const result = dynamicMapping.validateFormat('mermaid');
      expect(result).toBe(true);
      expect(mockInstance.isFormatSupported).toHaveBeenCalledWith('mermaid');
    });

    it('should return false for unsupported format', () => {
      mockInstance.isFormatSupported.mockReturnValue(false);
      
      const result = dynamicMapping.validateFormat('unknown');
      expect(result).toBe(false);
    });

    it('should handle empty string format', () => {
      mockInstance.isFormatSupported.mockReturnValue(false);
      
      const result = dynamicMapping.validateFormat('');
      expect(result).toBe(false);
    });
  });

  describe('getFormatMappings - Legacy Compatibility Branches', () => {
    it('should return format mappings for all supported formats', () => {
      const supportedFormats: DiagramFormat[] = ['mermaid', 'plantuml'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getFormatConfig
        .mockReturnValueOnce({
          krokiFormat: 'mermaid',
          supportedOutputs: ['png', 'svg'],
          displayName: 'Mermaid',
          description: 'Mermaid diagrams'
        })
        .mockReturnValueOnce({
          krokiFormat: 'plantuml',
          supportedOutputs: ['png'],
          displayName: 'PlantUML',
          description: 'PlantUML diagrams'
        });
      
      const result = dynamicMapping.getFormatMappings();
      expect(result).toEqual([
        {
          mcpFormat: 'mermaid',
          krokiFormat: 'mermaid',
          supportedOutputs: ['png', 'svg']
        },
        {
          mcpFormat: 'plantuml',
          krokiFormat: 'plantuml',
          supportedOutputs: ['png']
        }
      ]);
    });

    it('should throw error when format configuration not found', () => {
      const supportedFormats: DiagramFormat[] = ['unknown'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      mockInstance.getFormatConfig.mockReturnValue(undefined);
      
      expect(() => {
        dynamicMapping.getFormatMappings();
      }).toThrow('Format configuration not found for: unknown');
    });

    it('should handle empty supported formats', () => {
      mockInstance.getEnabledFormats.mockReturnValue([]);
      
      const result = dynamicMapping.getFormatMappings();
      expect(result).toEqual([]);
    });

    it('should throw error when config is null', () => {
      const supportedFormats: DiagramFormat[] = ['invalid'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      mockInstance.getFormatConfig.mockReturnValue(null);
      
      expect(() => {
        dynamicMapping.getFormatMappings();
      }).toThrow('Format configuration not found for: invalid');
    });
  });

  describe('generateKrokiLookupTable', () => {
    it('should generate lookup table with valid kroki formats', () => {
      const supportedFormats: DiagramFormat[] = ['mermaid', 'plantuml', 'd2'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getKrokiFormat
        .mockReturnValueOnce('mermaid')
        .mockReturnValueOnce('plantuml')
        .mockReturnValueOnce('d2');
      
      const result = dynamicMapping.generateKrokiLookupTable();
      expect(result).toEqual({
        mermaid: 'mermaid',
        plantuml: 'plantuml',
        d2: 'd2'
      });
    });

    it('should skip formats without kroki mapping', () => {
      const supportedFormats: DiagramFormat[] = ['mermaid', 'unknown'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getKrokiFormat
        .mockReturnValueOnce('mermaid')
        .mockReturnValueOnce(undefined);
      
      const result = dynamicMapping.generateKrokiLookupTable();
      expect(result).toEqual({
        mermaid: 'mermaid'
      });
    });

    it('should handle empty supported formats', () => {
      mockInstance.getEnabledFormats.mockReturnValue([]);
      
      const result = dynamicMapping.generateKrokiLookupTable();
      expect(result).toEqual({});
    });

    it('should skip formats with null kroki mapping', () => {
      const supportedFormats: DiagramFormat[] = ['valid', 'invalid'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getKrokiFormat
        .mockReturnValueOnce('valid-kroki')
        .mockReturnValueOnce(null);
      
      const result = dynamicMapping.generateKrokiLookupTable();
      expect(result).toEqual({
        valid: 'valid-kroki'
      });
    });
  });

  describe('generateOutputSupportTable', () => {
    it('should generate output support table for all formats', () => {
      const supportedFormats: DiagramFormat[] = ['mermaid', 'plantuml'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getSupportedOutputFormats
        .mockReturnValueOnce(['png', 'svg'])
        .mockReturnValueOnce(['png']);
      
      const result = dynamicMapping.generateOutputSupportTable();
      expect(result).toEqual({
        mermaid: ['png', 'svg'],
        plantuml: ['png']
      });
    });

    it('should handle formats with no supported outputs', () => {
      const supportedFormats: DiagramFormat[] = ['mermaid', 'unknown'];
      mockInstance.getEnabledFormats.mockReturnValue(supportedFormats);
      
      mockInstance.getSupportedOutputFormats
        .mockReturnValueOnce(['png'])
        .mockReturnValueOnce([]);
      
      const result = dynamicMapping.generateOutputSupportTable();
      expect(result).toEqual({
        mermaid: ['png'],
        unknown: []
      });
    });

    it('should handle empty supported formats', () => {
      mockInstance.getEnabledFormats.mockReturnValue([]);
      
      const result = dynamicMapping.generateOutputSupportTable();
      expect(result).toEqual({});
    });
  });

  describe('getFormatConfig - Configuration Branches', () => {
    it('should return format configuration when available', () => {
      const mockConfig = {
        displayName: 'Mermaid',
        description: 'Mermaid diagrams',
        krokiFormat: 'mermaid',
        supportedOutputs: ['png', 'svg'] as OutputFormat[]
      };
      mockInstance.getFormatConfig.mockReturnValue(mockConfig);
      
      const result = dynamicMapping.getFormatConfig('mermaid' as DiagramFormat);
      expect(result).toEqual({
        name: 'Mermaid',
        description: 'Mermaid diagrams',
        fileExtensions: ['.mmd', '.mermaid'],
        exampleCode: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]'
      });
    });

    it('should return undefined when config not found', () => {
      mockInstance.getFormatConfig.mockReturnValue(undefined);
      
      const result = dynamicMapping.getFormatConfig('unknown' as DiagramFormat);
      expect(result).toBeUndefined();
    });

    it('should return undefined when config is null', () => {
      mockInstance.getFormatConfig.mockReturnValue(null);
      
      const result = dynamicMapping.getFormatConfig('invalid' as DiagramFormat);
      expect(result).toBeUndefined();
    });

    it('should handle different format configurations', () => {
      const mockConfig = {
        displayName: 'PlantUML',
        description: 'PlantUML diagrams',
        krokiFormat: 'plantuml',
        supportedOutputs: ['png'] as OutputFormat[]
      };
      mockInstance.getFormatConfig.mockReturnValue(mockConfig);
      
      const result = dynamicMapping.getFormatConfig('plantuml' as DiagramFormat);
      expect(result).toEqual({
        name: 'PlantUML',
        description: 'PlantUML diagrams',
        fileExtensions: ['.puml', '.plantuml'],
        exampleCode: '@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml'
      });
    });

    it('should generate default file extensions for unknown formats', () => {
      const mockConfig = {
        displayName: 'Custom Format',
        description: 'Custom diagram format',
        krokiFormat: 'custom',
        supportedOutputs: ['png'] as OutputFormat[]
      };
      mockInstance.getFormatConfig.mockReturnValue(mockConfig);
      
      const result = dynamicMapping.getFormatConfig('custom' as DiagramFormat);
      expect(result?.fileExtensions).toEqual(['.custom']);
    });

    it('should generate default example code for unknown formats', () => {
      const mockConfig = {
        displayName: 'Custom Format',
        description: 'Custom diagram format',
        krokiFormat: 'custom',
        supportedOutputs: ['png'] as OutputFormat[]
      };
      mockInstance.getFormatConfig.mockReturnValue(mockConfig);
      
      const result = dynamicMapping.getFormatConfig('custom' as DiagramFormat);
      expect(result?.exampleCode).toBe('# custom diagram example');
    });
  });

  describe('isFormatAvailable', () => {
    it('should return true for available format', () => {
      mockInstance.isFormatAvailable.mockReturnValue(true);
      
      const result = dynamicMapping.isFormatAvailable('mermaid');
      expect(result).toBe(true);
      expect(mockInstance.isFormatAvailable).toHaveBeenCalledWith('mermaid');
    });

    it('should return false for unavailable format', () => {
      mockInstance.isFormatAvailable.mockReturnValue(false);
      
      const result = dynamicMapping.isFormatAvailable('unknown');
      expect(result).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata from format manager', () => {
      const mockMetadata = { version: '1.0', formats: ['mermaid', 'plantuml'] };
      mockInstance.getMetadata.mockReturnValue(mockMetadata);
      
      const result = dynamicMapping.getMetadata();
      expect(result).toBe(mockMetadata);
      expect(mockInstance.getMetadata).toHaveBeenCalled();
    });
  });

  describe('getDynamicFormatMapping - Singleton Pattern', () => {
    it('should return singleton instance', () => {
      const instance1 = getDynamicFormatMapping();
      const instance2 = getDynamicFormatMapping();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(DynamicFormatMapping);
    });

    it('should create new instance only once', () => {
      // Clear any existing instance
      (getDynamicFormatMapping as any).dynamicMapping = undefined;
      
      const instance1 = getDynamicFormatMapping();
      const instance2 = getDynamicFormatMapping();
      
      expect(instance1).toBe(instance2);
      // Should only call getInstance twice (once for each test instance creation)
      expect(mockDiagramFormatsManager.getInstance).toHaveBeenCalled();
    });
  });

  describe('validateOutputFormat - Validation Branches', () => {
    it('should return true for png format', () => {
      const result = validateOutputFormat('png');
      expect(result).toBe(true);
    });

    it('should return true for svg format', () => {
      const result = validateOutputFormat('svg');
      expect(result).toBe(true);
    });

    it('should return false for unsupported format', () => {
      const result = validateOutputFormat('jpg');
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = validateOutputFormat('');
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = validateOutputFormat(null as any);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = validateOutputFormat(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe('getContentType - Content Type Mapping', () => {
    it('should return correct content type for png', () => {
      const result = getContentType('png');
      expect(result).toBe('image/png');
    });

    it('should return correct content type for svg', () => {
      const result = getContentType('svg');
      expect(result).toBe('image/svg+xml');
    });

    it('should throw error for unsupported format', () => {
      expect(() => {
        getContentType('jpg' as OutputFormat);
      }).toThrow('Unsupported output format: jpg');
    });

    it('should throw error for empty format', () => {
      expect(() => {
        getContentType('' as OutputFormat);
      }).toThrow('Unsupported output format: ');
    });

    it('should throw error for null format', () => {
      expect(() => {
        getContentType(null as any);
      }).toThrow('Unsupported output format: null');
    });
  });
});
