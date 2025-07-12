import { DiagramFormatsFactory } from '../config/diagram-formats-factory.js';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import { FormatSelectionAnalyzer } from '../utils/selection-heuristics.js';
import { DiagramSelectionHandler } from '../resources/diagram-selection-handler.js';
import { isValidDiagramFormatConfig } from '../config/diagram-formats-config.js';

describe('New Diagram Formats Integration', () => {
  const formatsManager = DiagramFormatsManager.getInstance();
  const analyzer = new FormatSelectionAnalyzer();
  const handler = new DiagramSelectionHandler();

  // Reset manager state before each test
  beforeEach(() => {
    formatsManager.reset();
  });

  const newFormats = ['bpmn', 'c4-plantuml', 'structurizr', 'excalidraw', 'vega-lite'];

  describe('DiagramFormatsFactory - New Format Creation', () => {
    test.each(newFormats)('should create valid %s format configuration', (format) => {
      const config = formatsManager.getFormatConfig(format);
      
      expect(config).toBeDefined();
      expect(isValidDiagramFormatConfig(config!)).toBe(true);
      expect(config!.id).toBe(format);
      expect(config!.enabled).toBe(true);
      
      // Some formats only support SVG, others support both PNG and SVG
      if (['bpmn', 'excalidraw', 'vega-lite', 'structurizr'].includes(format)) {
        expect(config!.supportedOutputs).toEqual(['svg']);
      } else {
        expect(config!.supportedOutputs).toEqual(expect.arrayContaining(['png', 'svg']));
      }
    });

    test('should have updated default registry with all 10 formats', () => {
      const registry = DiagramFormatsFactory.createDefaultRegistry();
      expect(Object.keys(registry.formats)).toHaveLength(10);
      expect(registry.version).toBe('2.0.0');
      
      // Check original formats still exist
      expect(registry.formats.mermaid).toBeDefined();
      expect(registry.formats.plantuml).toBeDefined();
      expect(registry.formats.d2).toBeDefined();
      expect(registry.formats.graphviz).toBeDefined();
      expect(registry.formats.erd).toBeDefined();
      
      // Check new formats exist
      expect(registry.formats.bpmn).toBeDefined();
      expect(registry.formats['c4-plantuml']).toBeDefined();
      expect(registry.formats.structurizr).toBeDefined();
      expect(registry.formats.excalidraw).toBeDefined();
      expect(registry.formats['vega-lite']).toBeDefined();
    });

    test('should have updated getSupportedFormatIds to include new formats', () => {
      const supportedIds = DiagramFormatsFactory.getSupportedFormatIds();
      expect(supportedIds).toHaveLength(10);
      
      newFormats.forEach(format => {
        expect(supportedIds).toContain(format);
      });
    });
  });

  describe('DiagramFormatsManager - Format Support', () => {
    test.each(newFormats)('should support %s format', (format) => {
      expect(formatsManager.isFormatSupported(format)).toBe(true);
      expect(formatsManager.getKrokiFormat(format)).toBeDefined();
    });

    test('should provide format characteristics for new formats', () => {
      newFormats.forEach(format => {
        const characteristics = formatsManager.getFormatCharacteristics(format);
        expect(characteristics).toBeDefined();
        expect(characteristics?.strengths).toBeDefined();
        expect(characteristics?.bestFor).toBeDefined();
        expect(characteristics?.strengths.length).toBeGreaterThan(0);
        expect(characteristics?.bestFor.length).toBeGreaterThan(0);
      });
    });

    test('should provide instruction templates for new formats', () => {
      newFormats.forEach(format => {
        const template = formatsManager.getInstructionTemplate(format);
        expect(template).toBeDefined();
        expect(template?.syntaxGuidelines).toBeDefined();
        expect(template?.bestPractices).toBeDefined();
        expect(template?.syntaxGuidelines.length).toBeGreaterThan(0);
        expect(template?.bestPractices.length).toBeGreaterThan(0);
      });
    });

    test('should have updated format count to 10', () => {
      const enabledFormats = formatsManager.getEnabledFormats();
      expect(enabledFormats).toHaveLength(10);
      
      const metadata = formatsManager.getMetadata();
      expect(metadata.totalFormats).toBe(10);
      expect(metadata.enabledFormats).toBe(10);
    });
  });

  describe('Format Selection Heuristics - New Formats', () => {
    test('should recommend BPMN for business process requests', () => {
      const userRequest = 'I need to document our customer onboarding business process';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const bpmnRecommendation = recommendations.find(r => r.format === 'bpmn');
      expect(bpmnRecommendation).toBeDefined();
      expect(bpmnRecommendation!.confidence).toBeGreaterThan(0.8);
    });

    test('should recommend C4-PlantUML for software architecture', () => {
      const userRequest = 'Show me the system context diagram for our microservices architecture';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const c4Recommendation = recommendations.find(r => r.format === 'c4-plantuml');
      expect(c4Recommendation).toBeDefined();
      expect(c4Recommendation!.confidence).toBeGreaterThan(0.8);
    });

    test('should recommend Structurizr for architecture as code', () => {
      const userRequest = 'I want to create architecture as code with DSL for our enterprise system';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const structurizrRecommendation = recommendations.find(r => r.format === 'structurizr');
      expect(structurizrRecommendation).toBeDefined();
      expect(structurizrRecommendation!.confidence).toBeGreaterThan(0.7);
    });

    test('should recommend Excalidraw for sketches and brainstorming', () => {
      const userRequest = 'I need to sketch some concepts for our brainstorming session';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const excalidrawRecommendation = recommendations.find(r => r.format === 'excalidraw');
      expect(excalidrawRecommendation).toBeDefined();
      expect(excalidrawRecommendation!.confidence).toBeGreaterThan(0.7);
    });

    test('should recommend Vega-Lite for data visualization', () => {
      const userRequest = 'Create a chart showing our performance metrics and KPIs';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const vegaRecommendation = recommendations.find(r => r.format === 'vega-lite');
      expect(vegaRecommendation).toBeDefined();
      expect(vegaRecommendation!.confidence).toBeGreaterThan(0.8);
    });

    test('should handle multiple format recommendations correctly', () => {
      const userRequest = 'I need to document both the business process and the software architecture';
      const recommendations = analyzer.analyzeRequest(userRequest);

      expect(recommendations.length).toBeGreaterThan(1);
      
      const formatNames = recommendations.map(r => r.format);
      expect(formatNames).toContain('bpmn');
      expect(formatNames).toContain('c4-plantuml');
    });
  });

  describe('Format-Specific Configuration Tests', () => {
    test('BPMN should have correct Kroki format mapping', () => {
      const config = formatsManager.getFormatConfig('bpmn');
      expect(config?.krokiFormat).toBe('bpmn');
      expect(config?.supportedOutputs).toEqual(['svg']);
      expect(config?.fileExtensions).toEqual(['.bpmn', '.bpmn2']);
    });

    test('C4-PlantUML should have correct configuration', () => {
      const config = formatsManager.getFormatConfig('c4-plantuml');
      expect(config?.krokiFormat).toBe('c4plantuml');
      expect(config?.displayName).toBe('C4 with PlantUML');
      expect(config?.fileExtensions).toEqual(['.c4', '.puml']);
    });

    test('Structurizr should have correct DSL configuration', () => {
      const config = formatsManager.getFormatConfig('structurizr');
      expect(config?.krokiFormat).toBe('structurizr');
      expect(config?.fileExtensions).toEqual(['.dsl', '.structurizr']);
    });

    test('Excalidraw should have JSON format configuration', () => {
      const config = formatsManager.getFormatConfig('excalidraw');
      expect(config?.krokiFormat).toBe('excalidraw');
      expect(config?.fileExtensions).toEqual(['.excalidraw', '.json']);
    });

    test('Vega-Lite should have correct data visualization configuration', () => {
      const config = formatsManager.getFormatConfig('vega-lite');
      expect(config?.krokiFormat).toBe('vegalite');
      expect(config?.fileExtensions).toEqual(['.vl.json', '.vega']);
    });
  });

  describe('Integration Tests', () => {
    test('should handle format selection requests for new formats', async () => {
      const input = {
        user_request: 'Create a business process diagram for our approval workflow'
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text).toContain('BPMN');
      expect(result.prompt_text.length).toBeGreaterThan(100);
    });

    test('should handle architecture requests correctly', async () => {
      const input = {
        user_request: 'I need to show the system context for our microservices'
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text).toContain('C4');
      expect(result.prompt_text).toContain('architecture');
    });

    test('should handle data visualization requests', async () => {
      const input = {
        user_request: 'Create a dashboard with performance metrics charts'
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text).toContain('Vega-Lite');
      expect(result.prompt_text).toContain('data visualization');
    });

    test('should handle format filtering for new formats', async () => {
      const input = {
        user_request: 'Create a sketch for brainstorming',
        available_formats: ['excalidraw', 'mermaid']
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text).toContain('Excalidraw');
    });
  });

  describe('Performance and Reliability', () => {
    test('format loading should be efficient with extended formats', () => {
      const start = performance.now();
      const formats = formatsManager.getEnabledFormats();
      const end = performance.now();

      expect(formats).toHaveLength(10);
      expect(end - start).toBeLessThan(50); // Should be fast
    });

    test('format selection should handle 10 formats efficiently', async () => {
      const start = performance.now();
      
      const input = {
        user_request: 'Create a comprehensive system documentation'
      };
      
      await handler.processRequest(input);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(200); // Should be reasonable
    });

    test('should handle all format configurations without errors', () => {
      const allFormats = formatsManager.getAllFormats();
      expect(allFormats).toHaveLength(10);

      allFormats.forEach(format => {
        expect(() => {
          const config = formatsManager.getFormatConfig(format);
          const characteristics = formatsManager.getFormatCharacteristics(format);
          const template = formatsManager.getInstructionTemplate(format);
          
          expect(config).toBeDefined();
          expect(characteristics).toBeDefined();
          expect(template).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain support for original 5 formats', () => {
      const originalFormats = ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'];
      
      originalFormats.forEach(format => {
        expect(formatsManager.isFormatSupported(format)).toBe(true);
        expect(formatsManager.getFormatConfig(format)).toBeDefined();
      });
    });

    test('should maintain correct format selection for original formats', () => {
      const testCases = [
        { request: 'database schema', expectedFormat: 'erd' },
        { request: 'sequence diagram', expectedFormat: 'mermaid' },
        { request: 'class diagram', expectedFormat: 'plantuml' },
        { request: 'dependency graph', expectedFormat: 'graphviz' },
        { request: 'system architecture', expectedFormat: 'd2' }
      ];

      testCases.forEach(({ request, expectedFormat }) => {
        const recommendations = analyzer.analyzeRequest(request);
        const topRecommendation = recommendations.find(r => r.format === expectedFormat);
        expect(topRecommendation).toBeDefined();
        expect(topRecommendation!.confidence).toBeGreaterThan(0.7);
      });
    });
  });
}); 