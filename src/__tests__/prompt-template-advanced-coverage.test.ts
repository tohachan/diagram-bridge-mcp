import { DiagramSelectionPromptTemplate } from '../templates/prompt-template.js';
import { 
  DiagramFormat, 
  PromptTemplateVariables, 
  FormatSelectionHeuristic 
} from '../types/diagram-selection.js';
import { getSupportedDiagramFormats, getFormatConfiguration } from '../utils/format-validation.js';

// Mock dependencies
jest.mock('../utils/format-validation.js');
jest.mock('../utils/selection-heuristics.js');

const mockGetSupportedDiagramFormats = getSupportedDiagramFormats as jest.MockedFunction<typeof getSupportedDiagramFormats>;
const mockGetFormatConfiguration = getFormatConfiguration as jest.MockedFunction<typeof getFormatConfiguration>;

describe('DiagramSelectionPromptTemplate - Complete Branch Coverage', () => {
  let template: DiagramSelectionPromptTemplate;
  let mockFormatConfig: any;
  let mockHeuristics: FormatSelectionHeuristic[];

  beforeEach(() => {
    jest.clearAllMocks();
    template = new DiagramSelectionPromptTemplate();

    // Default format configuration mock
    mockFormatConfig = {
      displayName: 'Test Format',
      description: 'Test description',
      characteristics: {
        strengths: ['Test strength'],
        bestFor: ['Test use case'],
        examples: ['Test example']
      }
    };

    mockGetFormatConfiguration.mockReturnValue(mockFormatConfig);
    mockGetSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml', 'd2']);

    // Default heuristics mock
    mockHeuristics = [
      {
        format: 'mermaid',
        keywords: ['flowchart', 'process'],
        confidence: 0.85,
        reasoning: 'Great for flowcharts'
      },
      {
        format: 'plantuml',
        keywords: ['uml', 'class'],
        confidence: 0.9,
        reasoning: 'Best for UML diagrams'
      }
    ];

    Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
      value: mockHeuristics,
      writable: true
    });
  });

  describe('generatePrompt()', () => {
    it('should generate complete prompt with user request and heuristics', () => {
      const variables: PromptTemplateVariables = {
        userRequest: 'Create a flowchart for user login process',
        availableFormats: ['mermaid', 'plantuml'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('Create a flowchart for user login process');
      expect(result).toContain('Format Selection Heuristics:');
      expect(result).toContain('TEST FORMAT:'); // From mocked displayName
      expect(result).toContain('flowchart, process');
      expect(result).toContain('Confidence: 85%');
      expect(result).toContain('Great for flowcharts');
    });

    it('should handle multiple formats in heuristics grouping', () => {
      const extendedHeuristics = [
        ...mockHeuristics,
        {
          format: 'mermaid',
          keywords: ['sequence'],
          confidence: 0.75,
          reasoning: 'Good for sequence diagrams'
        }
      ];

      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: extendedHeuristics,
        writable: true
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('flowchart, process');
      expect(result).toContain('Confidence: 85%');
      expect(result).toContain('sequence');
      expect(result).toContain('Confidence: 75%');
    });

    it('should handle missing format configuration with fallback', () => {
      mockGetFormatConfiguration.mockReturnValue(undefined);

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['unknown'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('MERMAID:'); // Falls back to format name
      expect(result).toContain('PLANTUML:'); // Falls back to format name
    });

    it('should handle empty heuristics gracefully', () => {
      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: [],
        writable: true
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('Test request');
      expect(result).toContain('Format Selection Heuristics:');
      // Should not contain any format-specific content
      expect(result).not.toContain('Confidence:');
    });
  });

  describe('generateQuickPrompt()', () => {
    it('should generate quick prompt with available formats', () => {
      const availableFormats: DiagramFormat[] = ['mermaid', 'd2'];
      
      const result = template.generateQuickPrompt('Create a system diagram', availableFormats);

      expect(result).toContain('Create a system diagram');
      expect(result).toContain('Available formats: Test Format, Test Format'); // Mocked displayName
      expect(result).toContain('Consider:');
      expect(result).toContain('Mermaid: Best for flowcharts');
      expect(result).toContain('PlantUML: Best for UML diagrams');
    });

    it('should handle missing format configuration in quick prompt', () => {
      mockGetFormatConfiguration.mockReturnValue(undefined);
      const availableFormats: DiagramFormat[] = ['mermaid', 'plantuml'];
      
      const result = template.generateQuickPrompt('Test request', availableFormats);

      expect(result).toContain('Available formats: mermaid, plantuml'); // Falls back to format names
    });

    it('should use default formats when none provided', () => {
      const result = template.generateQuickPrompt('Test request');

      expect(result).toContain('Available formats: Mermaid, PlantUML, D2, GraphViz');
      expect(result).toContain('ERD: Best for database schemas'); // Should be commented out
    });

    it('should handle empty available formats array', () => {
      const result = template.generateQuickPrompt('Test request', []);

      expect(result).toContain('Available formats: '); // Empty string after colon
      expect(result).toContain('Consider:'); // Rest of template should still be there
    });
  });

  describe('validateTemplateVariables()', () => {
    it('should return no errors for valid variables', () => {
      const variables: PromptTemplateVariables = {
        userRequest: 'Valid request',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toHaveLength(0);
    });

    it('should detect missing user request', () => {
      const variables: PromptTemplateVariables = {
        userRequest: '',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('User request is required and cannot be empty');
    });

    it('should detect whitespace-only user request', () => {
      const variables: PromptTemplateVariables = {
        userRequest: '   \t\n   ',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('User request is required and cannot be empty');
    });

    it('should detect user request exceeding maximum length', () => {
      const longRequest = 'a'.repeat(1001);
      const variables: PromptTemplateVariables = {
        userRequest: longRequest,
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('User request exceeds maximum length of 1000 characters');
    });

    it('should accept user request at maximum length', () => {
      const maxLengthRequest = 'a'.repeat(1000);
      const variables: PromptTemplateVariables = {
        userRequest: maxLengthRequest,
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).not.toContain('User request exceeds maximum length of 1000 characters');
    });

    it('should detect non-array availableFormats', () => {
      const variables: any = {
        userRequest: 'Valid request',
        availableFormats: 'not an array',
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('Available formats must be an array');
    });

    it('should detect non-array formatDescriptions', () => {
      const variables: any = {
        userRequest: 'Valid request',
        availableFormats: [],
        formatDescriptions: 'not an array',
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('Format descriptions must be an array');
    });

    it('should detect non-array selectionHeuristics', () => {
      const variables: any = {
        userRequest: 'Valid request',
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: 'not an array'
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('Selection heuristics must be an array');
    });

    it('should detect unsupported formats', () => {
      mockGetSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml']);
      
      const variables: PromptTemplateVariables = {
        userRequest: 'Valid request',
        availableFormats: ['mermaid', 'unsupported', 'also-unsupported'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('Unsupported formats: unsupported, also-unsupported');
    });

    it('should handle all supported formats correctly', () => {
      mockGetSupportedDiagramFormats.mockReturnValue(['mermaid', 'plantuml', 'd2']);
      
      const variables: PromptTemplateVariables = {
        userRequest: 'Valid request',
        availableFormats: ['mermaid', 'plantuml', 'd2'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).not.toContain(expect.stringContaining('Unsupported formats'));
    });

    it('should collect multiple validation errors', () => {
      const variables: any = {
        userRequest: '', // Empty request
        availableFormats: 'not array', // Not array
        formatDescriptions: null, // Not array
        selectionHeuristics: {} // Not array
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('User request is required and cannot be empty');
      expect(errors).toContain('Available formats must be an array');
      expect(errors).toContain('Format descriptions must be an array');
      expect(errors).toContain('Selection heuristics must be an array');
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle null and undefined array fields', () => {
      const variables: any = {
        userRequest: 'Valid request',
        availableFormats: null,
        formatDescriptions: undefined,
        selectionHeuristics: []
      };

      const errors = template.validateTemplateVariables(variables);

      expect(errors).toContain('Available formats must be an array');
      expect(errors).toContain('Format descriptions must be an array');
    });
  });

  describe('Private methods through public interface', () => {
    it('should handle format configuration fallback in heuristics formatting', () => {
      // Test when getFormatConfiguration returns undefined/null for some formats
      mockGetFormatConfiguration.mockImplementation((format) => {
        if (format === 'mermaid') return mockFormatConfig;
        return undefined; // Simulate missing config for plantuml
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['mermaid', 'plantuml'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('TEST FORMAT:'); // mermaid with config
      expect(result).toContain('PLANTUML:'); // plantuml without config, falls back to format name
    });

    it('should handle empty or undefined displayName in format config', () => {
      mockGetFormatConfiguration.mockReturnValue({
        id: 'test',
        displayName: '', // Empty display name
        description: 'Test',
        krokiFormat: 'test',
        supportedOutputs: ['png'],
        enabled: true,
        fileExtensions: ['.test'],
        exampleCode: 'test',
        characteristics: {
          strengths: ['test'],
          weaknesses: ['test'],
          bestFor: ['test'],
          examples: ['test']
        },
        instructionTemplate: {
          syntaxGuidelines: ['test'],
          bestPractices: ['test'],
          commonPitfalls: ['test'],
          examplePatterns: ['test'],
          outputSpecifications: ['test']
        }
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('MERMAID:'); // Should fall back to format name
    });

    it('should handle heuristics with different confidence values', () => {
      const variousConfidenceHeuristics = [
        {
          format: 'mermaid',
          keywords: ['test1'],
          confidence: 0.123, // Should round to 12%
          reasoning: 'Low confidence'
        },
        {
          format: 'mermaid',
          keywords: ['test2'],
          confidence: 0.567, // Should round to 57%
          reasoning: 'Medium confidence'
        },
        {
          format: 'mermaid',
          keywords: ['test3'],
          confidence: 0.999, // Should round to 100%
          reasoning: 'High confidence'
        }
      ];

      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: variousConfidenceHeuristics,
        writable: true
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['mermaid'],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('Confidence: 12%');
      expect(result).toContain('Confidence: 57%');
      expect(result).toContain('Confidence: 100%');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined heuristics array', () => {
      // Mock undefined FORMAT_SELECTION_HEURISTICS
      const originalHeuristics = require('../utils/selection-heuristics.js').FORMAT_SELECTION_HEURISTICS;
      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const template = new DiagramSelectionPromptTemplate();
      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: ['mermaid'],
        formatDescriptions: [mockFormatConfig],
        selectionHeuristics: []
      };

      // Since undefined.forEach() throws, this should throw TypeError
      expect(() => template.generatePrompt(variables)).toThrow(TypeError);

      // Restore original value
      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: originalHeuristics,
        writable: true,
        configurable: true
      });
    });

    it('should handle heuristics with missing properties', () => {
      const incompleteHeuristics = [
        {
          format: 'testFormat',
          keywords: [], // Empty keywords array
          confidence: 0.8,
          reasoning: 'Test reasoning'
        },
        {
          format: '', // Empty format - should show as Unknown
          keywords: ['test'],
          confidence: 0.5,
          reasoning: 'Test'
        }
      ];

      Object.defineProperty(require('../utils/selection-heuristics.js'), 'FORMAT_SELECTION_HEURISTICS', {
        value: incompleteHeuristics,
        writable: true
      });

      const variables: PromptTemplateVariables = {
        userRequest: 'Test request',
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const result = template.generatePrompt(variables);

      expect(result).toContain('Keywords: '); // Empty keywords should work
      expect(result).toContain('TEST FORMAT:'); // Should show testFormat format
      expect(result).toContain('Confidence: 80%'); // Should handle format properly
    });

    it('should handle very long user requests in quick prompt', () => {
      const longRequest = 'Very long request '.repeat(50); // ~850 characters
      
      const result = template.generateQuickPrompt(longRequest);

      expect(result).toContain(longRequest);
      expect(result.length).toBeGreaterThan(1000); // Should not crash or truncate
    });
  });
});
