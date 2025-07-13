import { getFormatInstructionTemplate, getAllInstructionTemplates } from '../resources/diagram-instructions-config.js';

describe('Diagram Instructions Config', () => {
  describe('getFormatInstructionTemplate', () => {
    it('should return template for mermaid format', () => {
      const template = getFormatInstructionTemplate('mermaid');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('mermaid');
        expect(template.displayName).toBeDefined();
        expect(Array.isArray(template.syntaxGuidelines)).toBe(true);
        expect(Array.isArray(template.bestPractices)).toBe(true);
        expect(Array.isArray(template.commonPitfalls)).toBe(true);
        expect(Array.isArray(template.examplePatterns)).toBe(true);
        expect(Array.isArray(template.outputSpecifications)).toBe(true);
      }
    });

    it('should return template for plantuml format', () => {
      const template = getFormatInstructionTemplate('plantuml');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('plantuml');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for d2 format', () => {
      const template = getFormatInstructionTemplate('d2');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('d2');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for graphviz format', () => {
      const template = getFormatInstructionTemplate('graphviz');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('graphviz');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for structurizr format', () => {
      const template = getFormatInstructionTemplate('structurizr');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('structurizr');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for c4plantuml format', () => {
      const template = getFormatInstructionTemplate('c4plantuml');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('c4plantuml');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for excalidraw format', () => {
      const template = getFormatInstructionTemplate('excalidraw');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('excalidraw');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for vega-lite format', () => {
      const template = getFormatInstructionTemplate('vega-lite');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('vega-lite');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should return template for bpmn format', () => {
      const template = getFormatInstructionTemplate('bpmn');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('bpmn');
        expect(template.displayName).toBeDefined();
        expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
      }
    });

    it('should handle unknown format gracefully', () => {
      const template = getFormatInstructionTemplate('unknown' as any);
      
      expect(template).toBeNull();
    });
  });

  describe('getAllInstructionTemplates', () => {
    it('should return all instruction templates', () => {
      const templates = getAllInstructionTemplates();
      
      expect(templates).toBeDefined();
      expect(typeof templates).toBe('object');
      expect(Object.keys(templates).length).toBeGreaterThan(0);
    });

    it('should include templates for all major formats', () => {
      const templates = getAllInstructionTemplates();
      
      const expectedFormats = [
        'mermaid',
        'plantuml', 
        'd2',
        'graphviz',
        'structurizr',
        'c4plantuml',
        'excalidraw',
        'vega-lite',
        'bpmn'
      ];

      expectedFormats.forEach(format => {
        expect(templates).toHaveProperty(format);
        const template = templates[format as keyof typeof templates];
        if (template) {
          expect(template.format).toBe(format);
          expect(template.displayName).toBeDefined();
          expect(Array.isArray(template.syntaxGuidelines)).toBe(true);
          expect(template.syntaxGuidelines.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have consistent template structure', () => {
      const templates = getAllInstructionTemplates();
      
      Object.entries(templates).forEach(([format, template]) => {
        expect(typeof format).toBe('string');
        expect(template).toBeDefined();
        expect(template.format).toBe(format);
        expect(typeof template.displayName).toBe('string');
        expect(Array.isArray(template.syntaxGuidelines)).toBe(true);
        expect(Array.isArray(template.bestPractices)).toBe(true);
        expect(Array.isArray(template.commonPitfalls)).toBe(true);
        expect(Array.isArray(template.examplePatterns)).toBe(true);
        expect(Array.isArray(template.outputSpecifications)).toBe(true);
      });
    });
  });
});
