/**
 * Test suite for DiagramFormatsFactory
 * Tests format configuration creation and factory methods
 */

import { DiagramFormatsFactory } from '../config/diagram-formats-factory.js';
import type { DiagramFormatsRegistry } from '../config/diagram-formats-config.js';

describe('DiagramFormatsFactory', () => {
  describe('createDefaultRegistry', () => {
    let registry: DiagramFormatsRegistry;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    it('should create a registry with all expected formats', () => {
      expect(registry).toBeDefined();
      expect(registry.formats).toBeDefined();
      expect(registry.defaultFormat).toBe('mermaid');
      expect(registry.version).toBe('2.0.0');
      expect(registry.lastUpdated).toBeDefined();
    });

    it('should include all core formats', () => {
      const expectedFormats = [
        'mermaid',
        'plantuml', 
        'd2',
        'graphviz',
        'bpmn',
        'c4-plantuml',
        'c4plantuml',
        'c4',
        'structurizr',
        'excalidraw',
        'vega-lite'
      ];

      expectedFormats.forEach(formatId => {
        expect(registry.formats[formatId]).toBeDefined();
        expect(registry.formats[formatId]?.id).toBe(formatId);
      });
    });

    it('should create valid format configurations', () => {
      Object.values(registry.formats).forEach(format => {
        expect(format.id).toBeDefined();
        expect(format.displayName).toBeDefined();
        expect(format.description).toBeDefined();
        expect(format.krokiFormat).toBeDefined();
        expect(Array.isArray(format.supportedOutputs)).toBe(true);
        expect(typeof format.enabled).toBe('boolean');
        expect(format.characteristics).toBeDefined();
        expect(format.instructionTemplate).toBeDefined();
        expect(Array.isArray(format.fileExtensions)).toBe(true);
        expect(format.exampleCode).toBeDefined();
      });
    });

    it('should have valid characteristics for each format', () => {
      Object.values(registry.formats).forEach(format => {
        expect(Array.isArray(format.characteristics.strengths)).toBe(true);
        expect(Array.isArray(format.characteristics.weaknesses)).toBe(true);
        expect(Array.isArray(format.characteristics.bestFor)).toBe(true);
        expect(Array.isArray(format.characteristics.examples)).toBe(true);
        
        expect(format.characteristics.strengths.length).toBeGreaterThan(0);
        expect(format.characteristics.weaknesses.length).toBeGreaterThan(0);
        expect(format.characteristics.bestFor.length).toBeGreaterThan(0);
        expect(format.characteristics.examples.length).toBeGreaterThan(0);
      });
    });

    it('should have valid instruction templates for each format', () => {
      Object.values(registry.formats).forEach(format => {
        const template = format.instructionTemplate;
        expect(Array.isArray(template.syntaxGuidelines)).toBe(true);
        expect(Array.isArray(template.bestPractices)).toBe(true);
        expect(Array.isArray(template.commonPitfalls)).toBe(true);
        expect(Array.isArray(template.examplePatterns)).toBe(true);
        expect(Array.isArray(template.outputSpecifications)).toBe(true);
        
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
        expect(template.bestPractices.length).toBeGreaterThan(0);
        expect(template.commonPitfalls.length).toBeGreaterThan(0);
        expect(template.examplePatterns.length).toBeGreaterThan(0);
        expect(template.outputSpecifications.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Format-specific configurations', () => {
    let registry: DiagramFormatsRegistry;

    beforeEach(() => {
      registry = DiagramFormatsFactory.createDefaultRegistry();
    });

    describe('Mermaid configuration', () => {
      it('should have correct mermaid configuration', () => {
        const mermaid = registry.formats.mermaid;
        expect(mermaid).toBeDefined();
        expect(mermaid?.displayName).toBe('Mermaid');
        expect(mermaid?.krokiFormat).toBe('mermaid');
        expect(mermaid?.supportedOutputs).toEqual(['png', 'svg']);
        expect(mermaid?.enabled).toBe(true);
        expect(mermaid?.fileExtensions).toContain('.mmd');
        expect(mermaid?.fileExtensions).toContain('.mermaid');
      });

      it('should have flowchart example code', () => {
        const mermaid = registry.formats.mermaid;
        expect(mermaid).toBeDefined();
        expect(mermaid?.exampleCode).toContain('flowchart TD');
        expect(mermaid?.exampleCode).toContain('A[Start]');
        expect(mermaid?.exampleCode).toContain('-->');
      });
    });

    describe('PlantUML configuration', () => {
      it('should have correct plantuml configuration', () => {
        const plantuml = registry.formats.plantuml;
        expect(plantuml).toBeDefined();
        expect(plantuml?.displayName).toBe('PlantUML');
        expect(plantuml?.krokiFormat).toBe('plantuml');
        expect(plantuml?.supportedOutputs).toEqual(['png', 'svg']);
        expect(plantuml?.enabled).toBe(true);
        expect(plantuml?.fileExtensions).toContain('.puml');
        expect(plantuml?.fileExtensions).toContain('.plantuml');
      });
    });

    describe('D2 configuration', () => {
      it('should have correct d2 configuration', () => {
        const d2 = registry.formats.d2;
        expect(d2).toBeDefined();
        expect(d2?.displayName).toBe('D2');
        expect(d2?.krokiFormat).toBe('d2');
        expect(d2?.supportedOutputs).toEqual(['svg']);
        expect(d2?.enabled).toBe(true);
        expect(d2?.fileExtensions).toContain('.d2');
      });
    });

    describe('Graphviz configuration', () => {
      it('should have correct graphviz configuration', () => {
        const graphviz = registry.formats.graphviz;
        expect(graphviz).toBeDefined();
        expect(graphviz?.displayName).toBe('GraphViz');
        expect(graphviz?.krokiFormat).toBe('graphviz');
        expect(graphviz?.supportedOutputs).toEqual(['png', 'svg']);
        expect(graphviz?.enabled).toBe(true);
        expect(graphviz?.fileExtensions).toContain('.dot');
        expect(graphviz?.fileExtensions).toContain('.gv');
      });
    });

    describe('BPMN configuration', () => {
      it('should have correct bpmn configuration', () => {
        const bpmn = registry.formats.bpmn;
        expect(bpmn).toBeDefined();
        expect(bpmn?.displayName).toBe('BPMN');
        expect(bpmn?.krokiFormat).toBe('bpmn');
        expect(bpmn?.supportedOutputs).toEqual(['svg']);
        expect(bpmn?.enabled).toBe(true);
        expect(bpmn?.fileExtensions).toContain('.bpmn');
      });
    });

    describe('C4 PlantUML configurations', () => {
      it('should have correct c4-plantuml configuration', () => {
        const c4plantuml = registry.formats['c4-plantuml'];
        expect(c4plantuml).toBeDefined();
        expect(c4plantuml?.displayName).toBe('C4 with PlantUML');
        expect(c4plantuml?.krokiFormat).toBe('c4plantuml');
        expect(c4plantuml?.supportedOutputs).toEqual(['png', 'svg']);
        expect(c4plantuml?.enabled).toBe(true);
        expect(c4plantuml?.fileExtensions).toContain('.c4');
        expect(c4plantuml?.fileExtensions).toContain('.puml');
      });

      it('should have c4plantuml alias configuration', () => {
        const c4alias = registry.formats['c4plantuml'];
        expect(c4alias).toBeDefined();
        expect(c4alias?.displayName).toBe('C4 PlantUML (Kroki format)');
        expect(c4alias?.krokiFormat).toBe('c4plantuml');
      });

      it('should have c4 short alias configuration', () => {
        const c4short = registry.formats['c4'];
        expect(c4short).toBeDefined();
        expect(c4short?.displayName).toBe('C4 Model');
        expect(c4short?.krokiFormat).toBe('c4plantuml');
      });
    });

    describe('Structurizr configuration', () => {
      it('should have correct structurizr configuration', () => {
        const structurizr = registry.formats.structurizr;
        expect(structurizr).toBeDefined();
        expect(structurizr?.displayName).toBe('Structurizr');
        expect(structurizr?.krokiFormat).toBe('structurizr');
        expect(structurizr?.supportedOutputs).toEqual(['png', 'svg']);
        expect(structurizr?.enabled).toBe(true);
        expect(structurizr?.fileExtensions).toContain('.dsl');
      });
    });

    describe('Excalidraw configuration', () => {
      it('should have correct excalidraw configuration', () => {
        const excalidraw = registry.formats.excalidraw;
        expect(excalidraw).toBeDefined();
        expect(excalidraw?.displayName).toBe('Excalidraw');
        expect(excalidraw?.krokiFormat).toBe('excalidraw');
        expect(excalidraw?.supportedOutputs).toEqual(['svg']);
        expect(excalidraw?.enabled).toBe(true);
        expect(excalidraw?.fileExtensions).toContain('.excalidraw');
      });
    });

    describe('Vega-Lite configuration', () => {
      it('should have correct vega-lite configuration', () => {
        const vegalite = registry.formats['vega-lite'];
        expect(vegalite).toBeDefined();
        expect(vegalite?.displayName).toBe('Vega-Lite');
        expect(vegalite?.krokiFormat).toBe('vegalite');
        expect(vegalite?.supportedOutputs).toEqual(['svg']);
        expect(vegalite?.enabled).toBe(true);
        expect(vegalite?.fileExtensions).toContain('.vl.json');
        expect(vegalite?.fileExtensions).toContain('.vega');
      });
    });
  });

  describe('Registry metadata', () => {
    it('should create registry with current timestamp', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      const lastUpdated = new Date(registry.lastUpdated);
      const now = new Date();
      
      // Should be within the last few seconds
      expect(now.getTime() - lastUpdated.getTime()).toBeLessThan(5000);
    });

    it('should have consistent version', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      expect(registry.version).toBe('2.0.0');
    });

    it('should use mermaid as default format', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      expect(registry.defaultFormat).toBe('mermaid');
      expect(registry.formats[registry.defaultFormat]).toBeDefined();
    });
  });

  describe('Format validation', () => {
    it('should have valid output formats for all configs', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      const validOutputs = ['png', 'svg'];
      
      Object.values(registry.formats).forEach(format => {
        format.supportedOutputs.forEach(output => {
          expect(validOutputs).toContain(output);
        });
      });
    });

    it('should have non-empty example code for all formats', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      Object.values(registry.formats).forEach(format => {
        expect(format.exampleCode).toBeDefined();
        expect(format.exampleCode.length).toBeGreaterThan(0);
        expect(format.exampleCode.trim()).not.toBe('');
      });
    });

    it('should have consistent kroki format mapping', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      
      // Check that aliases point to correct kroki formats
      expect(registry.formats['c4plantuml']?.krokiFormat).toBe('c4plantuml');
      expect(registry.formats['c4']?.krokiFormat).toBe('c4plantuml');
      expect(registry.formats['vega-lite']?.krokiFormat).toBe('vegalite');
    });
  });
});
