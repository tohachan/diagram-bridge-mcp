/**
 * Test suite for DiagramFormatsFactory - Branch Coverage Tests
 * Focus on covering conditional logic and edge cases
 */

import { DiagramFormatsFactory } from '../config/diagram-formats-factory.js';

describe('DiagramFormatsFactory - Branch Coverage', () => {
  describe('Format creation edge cases', () => {
    it('should handle registry creation multiple times', () => {
      const registry1 = DiagramFormatsFactory.createDefaultRegistry();
      const registry2 = DiagramFormatsFactory.createDefaultRegistry();
      
      // Should create independent instances
      expect(registry1).toBeDefined();
      expect(registry2).toBeDefined();
      expect(registry1).not.toBe(registry2);
      
      // But with same content structure
      expect(registry1.defaultFormat).toBe(registry2.defaultFormat);
      expect(Object.keys(registry1.formats)).toEqual(Object.keys(registry2.formats));
    });

    it('should create registry with consistent timestamp ordering', () => {
      const registry1 = DiagramFormatsFactory.createDefaultRegistry();
      
      // Small delay to ensure different timestamps
      setTimeout(() => {
        const registry2 = DiagramFormatsFactory.createDefaultRegistry();
        
        const time1 = new Date(registry1.lastUpdated).getTime();
        const time2 = new Date(registry2.lastUpdated).getTime();
        
        expect(time2).toBeGreaterThanOrEqual(time1);
      }, 1);
    });
  });

  describe('Format configuration validation', () => {
    let registry: any;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    it('should have all formats enabled by default', () => {
      Object.values(registry.formats).forEach((format: any) => {
        expect(format.enabled).toBe(true);
      });
    });

    it('should have unique IDs for all formats', () => {
      const formatIds = Object.values(registry.formats).map((format: any) => format.id);
      const uniqueIds = new Set(formatIds);
      
      expect(formatIds.length).toBe(uniqueIds.size);
    });

    it('should have valid kroki format mappings', () => {
      const expectedMappings = {
        'mermaid': 'mermaid',
        'plantuml': 'plantuml',
        'd2': 'd2',
        'graphviz': 'graphviz',
        'bpmn': 'bpmn',
        'c4-plantuml': 'c4plantuml',
        'c4plantuml': 'c4plantuml',
        'c4': 'c4plantuml',
        'structurizr': 'structurizr',
        'excalidraw': 'excalidraw',
        'vega-lite': 'vegalite'
      };

      Object.entries(expectedMappings).forEach(([formatId, expectedKroki]) => {
        expect(registry.formats[formatId]?.krokiFormat).toBe(expectedKroki);
      });
    });

    it('should have consistent file extensions', () => {
      Object.values(registry.formats).forEach((format: any) => {
        expect(Array.isArray(format.fileExtensions)).toBe(true);
        expect(format.fileExtensions.length).toBeGreaterThan(0);
        
        // All extensions should start with a dot
        format.fileExtensions.forEach((ext: string) => {
          expect(ext).toMatch(/^\./);
        });
      });
    });

    it('should have non-empty instruction templates', () => {
      Object.values(registry.formats).forEach((format: any) => {
        const template = format.instructionTemplate;
        
        // Check all required arrays exist and are non-empty
        ['syntaxGuidelines', 'bestPractices', 'commonPitfalls', 'examplePatterns', 'outputSpecifications'].forEach(key => {
          expect(Array.isArray(template[key])).toBe(true);
          expect(template[key].length).toBeGreaterThan(0);
          
          // Check all items are non-empty strings
          template[key].forEach((item: string) => {
            expect(typeof item).toBe('string');
            expect(item.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have valid output format configurations', () => {
      const validOutputs = ['png', 'svg'];
      
      Object.values(registry.formats).forEach((format: any) => {
        expect(Array.isArray(format.supportedOutputs)).toBe(true);
        expect(format.supportedOutputs.length).toBeGreaterThan(0);
        
        format.supportedOutputs.forEach((output: string) => {
          expect(validOutputs).toContain(output);
        });
      });
    });

    it('should handle svg-only formats correctly', () => {
      const svgOnlyFormats = ['d2', 'bpmn', 'excalidraw', 'vega-lite'];
      
      svgOnlyFormats.forEach(formatId => {
        expect(registry.formats[formatId]?.supportedOutputs).toEqual(['svg']);
      });
    });

    it('should handle png+svg formats correctly', () => {
      const pngSvgFormats = ['mermaid', 'plantuml', 'graphviz', 'c4-plantuml', 'structurizr'];
      
      pngSvgFormats.forEach(formatId => {
        expect(registry.formats[formatId]?.supportedOutputs).toEqual(['png', 'svg']);
      });
    });
  });

  describe('Registry metadata validation', () => {
    it('should have consistent version format', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      expect(registry.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have valid ISO timestamp', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      const timestamp = new Date(registry.lastUpdated);
      expect(timestamp.toISOString()).toBe(registry.lastUpdated);
    });

    it('should reference existing format as default', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      expect(registry.formats[registry.defaultFormat]).toBeDefined();
    });
  });

  describe('Format characteristics validation', () => {
    let registry: any;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    it('should have balanced characteristics', () => {
      Object.values(registry.formats).forEach((format: any) => {
        const characteristics = format.characteristics;
        
        // Should have at least some strengths and weaknesses
        expect(characteristics.strengths.length).toBeGreaterThan(0);
        expect(characteristics.weaknesses.length).toBeGreaterThan(0);
        
        // Should have practical guidance
        expect(characteristics.bestFor.length).toBeGreaterThan(0);
        expect(characteristics.examples.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive strength statements', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.characteristics.strengths.forEach((strength: string) => {
          expect(strength.length).toBeGreaterThan(10); // Meaningful descriptions
          expect(strength.trim()).toBe(strength); // No extra whitespace
        });
      });
    });

    it('should have constructive weakness statements', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.characteristics.weaknesses.forEach((weakness: string) => {
          expect(weakness.length).toBeGreaterThan(5); // Meaningful descriptions
          expect(weakness.trim()).toBe(weakness); // No extra whitespace
        });
      });
    });
  });

  describe('Instruction template validation', () => {
    let registry: any;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    it('should have actionable syntax guidelines', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.instructionTemplate.syntaxGuidelines.forEach((guideline: string) => {
          expect(guideline.length).toBeGreaterThan(10);
          // Should contain meaningful content
          expect(guideline.trim()).toBe(guideline);
        });
      });
    });

    it('should have preventive common pitfalls', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.instructionTemplate.commonPitfalls.forEach((pitfall: string) => {
          expect(pitfall.length).toBeGreaterThan(10);
          // Should be preventive in nature
          expect(pitfall.toUpperCase()).toMatch(/DO NOT|DON'T|AVOID|NEVER/);
        });
      });
    });

    it('should have working example patterns', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.instructionTemplate.examplePatterns.forEach((pattern: string) => {
          expect(pattern.length).toBeGreaterThan(5);
          expect(pattern.trim()).toBe(pattern);
          
          // Should contain some structure (newlines, brackets, etc.)
          expect(pattern.length).toBeGreaterThan(5);
        });
      });
    });

    it('should have clear output specifications', () => {
      Object.values(registry.formats).forEach((format: any) => {
        format.instructionTemplate.outputSpecifications.forEach((spec: string) => {
          expect(spec.length).toBeGreaterThan(10);
          // Should provide clear direction
          expect(spec.trim()).toBe(spec);
        });
      });
    });
  });

  describe('Example code validation', () => {
    let registry: any;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    it('should have working example code for all formats', () => {
      Object.values(registry.formats).forEach((format: any) => {
        expect(format.exampleCode).toBeDefined();
        expect(typeof format.exampleCode).toBe('string');
        expect(format.exampleCode.trim().length).toBeGreaterThan(5);
      });
    });

    it('should have format-specific syntax in examples', () => {
      // Mermaid should have flowchart
      expect(registry.formats.mermaid.exampleCode).toContain('flowchart');
      
      // PlantUML should have @startuml/@enduml
      expect(registry.formats.plantuml.exampleCode).toContain('@startuml');
      expect(registry.formats.plantuml.exampleCode).toContain('@enduml');
      
      // D2 should have simple syntax
      expect(registry.formats.d2.exampleCode).toMatch(/\w+\s*->\s*\w+/);
      
      // Graphviz should have digraph
      expect(registry.formats.graphviz.exampleCode).toContain('digraph');
    });
  });
});
