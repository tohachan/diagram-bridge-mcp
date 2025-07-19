import {
  DIAGRAM_SELECTION_RESOURCE_CONFIG,
  DIAGRAM_FORMAT_DEFINITIONS
} from '../resources/diagram-selection-config';

describe('Diagram Selection Configuration', () => {
  describe('DIAGRAM_SELECTION_RESOURCE_CONFIG', () => {
    it('should be a valid resource configuration object', () => {
      expect(DIAGRAM_SELECTION_RESOURCE_CONFIG).toBeDefined();
      expect(typeof DIAGRAM_SELECTION_RESOURCE_CONFIG).toBe('object');
    });

    it('should have correct basic properties', () => {
      const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
      
      expect(config.name).toBe('help_choose_diagram');
      expect(typeof config.description).toBe('string');
      expect(config.description.length).toBeGreaterThan(10);
    });

    it('should have behavior configuration', () => {
      const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
      
      expect(config.behavior).toBeDefined();
      expect(config.behavior.input).toBeDefined();
      expect(config.behavior.output).toBeDefined();
    });

    it('should specify input requirements correctly', () => {
      const inputConfig = DIAGRAM_SELECTION_RESOURCE_CONFIG.behavior.input;
      
      expect(Array.isArray(inputConfig.required)).toBe(true);
      expect(inputConfig.required).toContain('user_request');
      
      expect(Array.isArray(inputConfig.optional)).toBe(true);
      expect(inputConfig.optional).toContain('available_formats');
    });

    it('should have input validation rules', () => {
      const validation = DIAGRAM_SELECTION_RESOURCE_CONFIG.behavior.input.validation;
      
      expect(validation.user_request).toBeDefined();
      expect(validation.user_request.type).toBe('string');
      expect(validation.user_request.minLength).toBe(5);
      expect(validation.user_request.maxLength).toBe(1000);
      
      expect(validation.available_formats).toBeDefined();
      expect(validation.available_formats.type).toBe('array');
      expect(Array.isArray(validation.available_formats.items)).toBe(true);
    });

    it('should specify output format configuration', () => {
      const outputConfig = DIAGRAM_SELECTION_RESOURCE_CONFIG.behavior.output;
      
      expect(outputConfig.format).toBe('structured_prompt');
      expect(outputConfig.content).toBeDefined();
      expect(outputConfig.content.prompt_text).toBeDefined();
      expect(outputConfig.content.prompt_text.type).toBe('string');
    });

    it('should have constraints configuration', () => {
      const constraints = DIAGRAM_SELECTION_RESOURCE_CONFIG.constraints;
      
      expect(constraints).toBeDefined();
      expect(constraints.performance).toBeDefined();
      expect(constraints.reliability).toBeDefined();
    });

    it('should specify performance constraints', () => {
      const performance = DIAGRAM_SELECTION_RESOURCE_CONFIG.constraints.performance;
      
      expect(performance.maxResponseTime).toBeDefined();
      expect(typeof performance.description).toBe('string');
    });

    it('should specify reliability constraints', () => {
      const reliability = DIAGRAM_SELECTION_RESOURCE_CONFIG.constraints.reliability;
      
      expect(reliability.errorHandling).toBeDefined();
      expect(reliability.fallback).toBeDefined();
    });

    it('should validate structure consistency', () => {
      const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
      
      // Check that all top-level properties are defined
      expect(config.name).toBeDefined();
      expect(config.description).toBeDefined();
      expect(config.behavior).toBeDefined();
      expect(config.constraints).toBeDefined();
      
      // Verify nested structure completeness
      expect(config.behavior.input.required.length).toBeGreaterThan(0);
      expect(config.behavior.input.validation).toBeDefined();
      expect(config.behavior.output.format).toBeDefined();
    });
  });

  describe('DIAGRAM_FORMAT_DEFINITIONS', () => {
    it('should be a valid format definitions object', () => {
      expect(DIAGRAM_FORMAT_DEFINITIONS).toBeDefined();
      expect(typeof DIAGRAM_FORMAT_DEFINITIONS).toBe('object');
    });

    it('should contain expected diagram formats', () => {
      const expectedFormats = ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd', 'bpmn'];
      
      expectedFormats.forEach(format => {
        expect(DIAGRAM_FORMAT_DEFINITIONS[format]).toBeDefined();
      });
    });

    it('should have complete format definitions for mermaid', () => {
      const mermaid = DIAGRAM_FORMAT_DEFINITIONS.mermaid;
      
      expect(mermaid).toBeDefined();
      if (mermaid) {
        expect(mermaid.name).toBe('mermaid');
        expect(typeof mermaid.description).toBe('string');
        expect(Array.isArray(mermaid.strengths)).toBe(true);
        expect(Array.isArray(mermaid.weaknesses)).toBe(true);
        expect(Array.isArray(mermaid.bestFor)).toBe(true);
        expect(Array.isArray(mermaid.examples)).toBe(true);
      }
    });

    it('should have complete format definitions for plantuml', () => {
      const plantuml = DIAGRAM_FORMAT_DEFINITIONS.plantuml;
      
      expect(plantuml).toBeDefined();
      if (plantuml) {
        expect(plantuml.name).toBe('plantuml');
        expect(typeof plantuml.description).toBe('string');
        expect(Array.isArray(plantuml.strengths)).toBe(true);
        expect(Array.isArray(plantuml.weaknesses)).toBe(true);
        expect(Array.isArray(plantuml.bestFor)).toBe(true);
        expect(Array.isArray(plantuml.examples)).toBe(true);
      }
    });

    it('should have complete format definitions for d2', () => {
      const d2 = DIAGRAM_FORMAT_DEFINITIONS.d2;
      
      expect(d2).toBeDefined();
      if (d2) {
        expect(d2.name).toBe('d2');
        expect(typeof d2.description).toBe('string');
        expect(Array.isArray(d2.strengths)).toBe(true);
        expect(Array.isArray(d2.weaknesses)).toBe(true);
        expect(Array.isArray(d2.bestFor)).toBe(true);
        expect(Array.isArray(d2.examples)).toBe(true);
      }
    });

    it('should have complete format definitions for graphviz', () => {
      const graphviz = DIAGRAM_FORMAT_DEFINITIONS.graphviz;
      
      expect(graphviz).toBeDefined();
      if (graphviz) {
        expect(graphviz.name).toBe('graphviz');
        expect(typeof graphviz.description).toBe('string');
        expect(Array.isArray(graphviz.strengths)).toBe(true);
        expect(Array.isArray(graphviz.weaknesses)).toBe(true);
        expect(Array.isArray(graphviz.bestFor)).toBe(true);
        expect(Array.isArray(graphviz.examples)).toBe(true);
      }
    });

    it('should have complete format definitions for erd', () => {
      const erd = DIAGRAM_FORMAT_DEFINITIONS.erd;
      
      expect(erd).toBeDefined();
      if (erd) {
        expect(erd.name).toBe('erd');
        expect(typeof erd.description).toBe('string');
        expect(Array.isArray(erd.strengths)).toBe(true);
        expect(Array.isArray(erd.weaknesses)).toBe(true);
        expect(Array.isArray(erd.bestFor)).toBe(true);
        expect(Array.isArray(erd.examples)).toBe(true);
      }
    });

    it('should have complete format definitions for bpmn', () => {
      const bpmn = DIAGRAM_FORMAT_DEFINITIONS.bpmn;
      
      expect(bpmn).toBeDefined();
      if (bpmn) {
        expect(bpmn.name).toBe('bpmn');
        expect(typeof bpmn.description).toBe('string');
        expect(Array.isArray(bpmn.strengths)).toBe(true);
        expect(Array.isArray(bpmn.weaknesses)).toBe(true);
        expect(Array.isArray(bpmn.bestFor)).toBe(true);
        expect(Array.isArray(bpmn.examples)).toBe(true);
      }
    });

    it('should have meaningful content in format definitions', () => {
      Object.values(DIAGRAM_FORMAT_DEFINITIONS).forEach(format => {
        expect(format.description.length).toBeGreaterThan(20);
        expect(format.strengths.length).toBeGreaterThan(0);
        expect(format.weaknesses.length).toBeGreaterThan(0);
        expect(format.bestFor.length).toBeGreaterThan(0);
        expect(format.examples.length).toBeGreaterThan(0);
        
        // Check that all array items are strings
        format.strengths.forEach(strength => {
          expect(typeof strength).toBe('string');
          expect(strength.length).toBeGreaterThan(5);
        });
        
        format.weaknesses.forEach(weakness => {
          expect(typeof weakness).toBe('string');
          expect(weakness.length).toBeGreaterThan(5);
        });
        
        format.bestFor.forEach(use => {
          expect(typeof use).toBe('string');
          expect(use.length).toBeGreaterThan(5);
        });
        
        format.examples.forEach(example => {
          expect(typeof example).toBe('string');
          expect(example.length).toBeGreaterThan(5);
        });
      });
    });

    it('should have unique names for each format', () => {
      const names = Object.values(DIAGRAM_FORMAT_DEFINITIONS).map(format => format.name);
      const uniqueNames = new Set(names);
      
      expect(names.length).toBe(uniqueNames.size);
    });

    it('should provide practical examples for each format', () => {
      Object.entries(DIAGRAM_FORMAT_DEFINITIONS).forEach(([_key, format]) => {
        expect(format.examples.length).toBeGreaterThan(0);
        
        // Check that examples seem relevant to the format
        format.examples.forEach(example => {
          expect(example).toMatch(/[a-zA-Z]/); // Contains letters
          expect(example.length).toBeGreaterThan(10); // Substantial content
        });
      });
    });

    it('should have consistent structure across all formats', () => {
      Object.values(DIAGRAM_FORMAT_DEFINITIONS).forEach(format => {
        expect(format.name).toBeDefined();
        expect(format.description).toBeDefined();
        expect(format.strengths).toBeDefined();
        expect(format.weaknesses).toBeDefined();
        expect(format.bestFor).toBeDefined();
        expect(format.examples).toBeDefined();
        
        expect(typeof format.name).toBe('string');
        expect(typeof format.description).toBe('string');
        expect(Array.isArray(format.strengths)).toBe(true);
        expect(Array.isArray(format.weaknesses)).toBe(true);
        expect(Array.isArray(format.bestFor)).toBe(true);
        expect(Array.isArray(format.examples)).toBe(true);
        
        expect(format.name.length).toBeGreaterThan(0);
        expect(format.description.length).toBeGreaterThan(0);
        expect(format.strengths.length).toBeGreaterThan(0);
        expect(format.weaknesses.length).toBeGreaterThan(0);
        expect(format.bestFor.length).toBeGreaterThan(0);
        expect(format.examples.length).toBeGreaterThan(0);
      });
    });

    it('should provide comprehensive coverage of diagram types', () => {
      const allFormats = Object.keys(DIAGRAM_FORMAT_DEFINITIONS);
      
      // Should have at least these essential formats
      const essentialFormats = ['mermaid', 'plantuml', 'd2', 'graphviz'];
      essentialFormats.forEach(format => {
        expect(allFormats).toContain(format);
      });
      
      // Should have at least 5 different formats
      expect(allFormats.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Configuration integration', () => {
    it('should have aligned format support between config and definitions', () => {
      const configFormats = DIAGRAM_SELECTION_RESOURCE_CONFIG.behavior.input.validation.available_formats.items;
      const definitionFormats = Object.keys(DIAGRAM_FORMAT_DEFINITIONS);
      
      // All formats in config should have definitions
      configFormats.forEach(format => {
        expect(definitionFormats).toContain(format);
      });
    });

    it('should provide complete resource configuration', () => {
      const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
      
      // Verify all required sections are present and meaningful
      expect(config.name).toMatch(/[a-z_]+/);
      expect(config.description.length).toBeGreaterThan(20); // Meaningful description
      expect(config.behavior.input.required.length).toBeGreaterThan(0);
      expect(config.behavior.output.format).toBeTruthy();
      expect(config.constraints.performance).toBeTruthy();
      expect(config.constraints.reliability).toBeTruthy();
    });

    it('should have sensible performance constraints', () => {
      const performance = DIAGRAM_SELECTION_RESOURCE_CONFIG.constraints.performance;
      
      expect(performance.maxResponseTime).toMatch(/\d+ms/); // Should be numeric + ms
      expect(performance.description.toLowerCase()).toMatch(/response|time|experience/i);
    });

    it('should have appropriate reliability configuration', () => {
      const reliability = DIAGRAM_SELECTION_RESOURCE_CONFIG.constraints.reliability;
      
      expect(reliability.errorHandling).toBeTruthy();
      expect(reliability.fallback).toBeTruthy();
      expect(typeof reliability.errorHandling).toBe('string');
      expect(typeof reliability.fallback).toBe('string');
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle missing or undefined gracefully', () => {
      // Test that accessing properties doesn't throw
      expect(() => {
        const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
        const definitions = DIAGRAM_FORMAT_DEFINITIONS;
        
        // Access nested properties
        const behaviorInput = config.behavior?.input;
        const constraintsPerf = config.constraints?.performance;
        const mermaidDef = definitions?.mermaid;
        
        return { behaviorInput, constraintsPerf, mermaidDef };
      }).not.toThrow();
    });

    it('should have valid configuration values', () => {
      const config = DIAGRAM_SELECTION_RESOURCE_CONFIG;
      
      // Test numeric values are reasonable
      const userRequestMinLength = config.behavior.input.validation.user_request.minLength;
      const userRequestMaxLength = config.behavior.input.validation.user_request.maxLength;
      
      expect(userRequestMinLength).toBeGreaterThan(0);
      expect(userRequestMaxLength).toBeGreaterThan(userRequestMinLength);
      expect(userRequestMaxLength).toBeLessThan(10000); // Reasonable upper bound
    });

    it('should have non-empty arrays in format definitions', () => {
      Object.values(DIAGRAM_FORMAT_DEFINITIONS).forEach(format => {
        expect(format.strengths).toBeDefined();
        expect(Array.isArray(format.strengths)).toBe(true);
        expect(format.strengths.length).toBeGreaterThan(0);
        
        expect(format.weaknesses).toBeDefined();
        expect(Array.isArray(format.weaknesses)).toBe(true);
        expect(format.weaknesses.length).toBeGreaterThan(0);
        
        expect(format.bestFor).toBeDefined();
        expect(Array.isArray(format.bestFor)).toBe(true);
        expect(format.bestFor.length).toBeGreaterThan(0);
        
        expect(format.examples).toBeDefined();
        expect(Array.isArray(format.examples)).toBe(true);
        expect(format.examples.length).toBeGreaterThan(0);
        
        // Ensure no empty strings in arrays
        format.strengths.forEach((item: string) => {
          expect(typeof item).toBe('string');
          expect(item.trim().length).toBeGreaterThan(0);
        });
        
        format.weaknesses.forEach((item: string) => {
          expect(typeof item).toBe('string');
          expect(item.trim().length).toBeGreaterThan(0);
        });
        
        format.bestFor.forEach((item: string) => {
          expect(typeof item).toBe('string');
          expect(item.trim().length).toBeGreaterThan(0);
        });
        
        format.examples.forEach((item: string) => {
          expect(typeof item).toBe('string');
          expect(item.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });
});
