import { DiagramInstructionsHandler } from '../resources/diagram-instructions-handler.js';
import { DiagramInstructionsValidator } from '../utils/instruction-validation.js';
import { DiagramInstructionTemplate } from '../templates/instruction-template.js';
import { DiagramFormat } from '../types/diagram-selection.js';

describe('Diagram Instructions System', () => {
  let handler: DiagramInstructionsHandler;
  let validator: DiagramInstructionsValidator;
  let templateEngine: DiagramInstructionTemplate;

  beforeEach(() => {
    handler = new DiagramInstructionsHandler();
    validator = new DiagramInstructionsValidator();
    templateEngine = new DiagramInstructionTemplate();
  });

  describe('Input Validation', () => {
    it('should validate correct input', () => {
      const input = {
        user_request: 'Create a database schema for an e-commerce system',
        diagram_format: 'erd' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should reject empty user request', () => {
      const input = {
        user_request: '',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('user_request cannot be empty');
    });

    it('should reject too short user request', () => {
      const input = {
        user_request: 'Hi',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('user_request must be at least 5 characters long');
    });

    it('should reject too long user request', () => {
      const input = {
        user_request: 'A'.repeat(2001),
        diagram_format: 'mermaid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('user_request must not exceed 2000 characters');
    });

    it('should reject invalid diagram format', () => {
      const input = {
        user_request: 'Create a diagram',
        diagram_format: 'invalid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unsupported format: invalid');
    });

    it('should reject missing user_request', () => {
      const input = {
        diagram_format: 'mermaid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('user_request is required');
    });

    it('should reject missing diagram_format', () => {
      const input = {
        user_request: 'Create a diagram'
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('diagram_format is required');
    });

    it('should sanitize malicious content', () => {
      const input = {
        user_request: 'Create a diagram <script>alert("xss")</script>',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const validation = validator.validateInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('user_request contains potentially malicious content');
    });
  });

  describe('Template Engine', () => {
    it('should generate Mermaid instructions', () => {
      const variables = {
        userRequest: 'Create an authentication flow',
        diagramFormat: 'mermaid' as DiagramFormat,
        complexityLevel: 'moderate' as const
      };

      const prompt = templateEngine.generateInstructionPrompt(variables);
      
      expect(prompt).toContain('Mermaid Diagram Code Generation Instructions');
      expect(prompt).toContain('Create an authentication flow');
      expect(prompt).toContain('sequenceDiagram');
      expect(prompt).toContain('Output ONLY the Mermaid code');
    });

    it('should generate PlantUML instructions', () => {
      const variables = {
        userRequest: 'Design a class hierarchy',
        diagramFormat: 'plantuml' as DiagramFormat,
        complexityLevel: 'complex' as const
      };

      const prompt = templateEngine.generateInstructionPrompt(variables);
      
      expect(prompt).toContain('PlantUML Diagram Code Generation Instructions');
      expect(prompt).toContain('Design a class hierarchy');
      expect(prompt).toContain('@startuml');
      expect(prompt).toContain('@enduml');
    });

    it('should generate D2 instructions', () => {
      const variables = {
        userRequest: 'Show system architecture',
        diagramFormat: 'd2' as DiagramFormat
      };

      const prompt = templateEngine.generateInstructionPrompt(variables);
      
      expect(prompt).toContain('D2 Diagram Code Generation Instructions');
      expect(prompt).toContain('Show system architecture');
      expect(prompt).toContain('hierarchical dot notation');
    });

    it('should generate GraphViz instructions', () => {
      const variables = {
        userRequest: 'Visualize dependencies',
        diagramFormat: 'graphviz' as DiagramFormat
      };

      const prompt = templateEngine.generateInstructionPrompt(variables);
      
      expect(prompt).toContain('GraphViz Diagram Code Generation Instructions');
      expect(prompt).toContain('Visualize dependencies');
      expect(prompt).toContain('digraph');
    });

    it('should generate ERD instructions', () => {
      const variables = {
        userRequest: 'Database schema for e-commerce',
        diagramFormat: 'erd' as DiagramFormat
      };

      const prompt = templateEngine.generateInstructionPrompt(variables);
      
      expect(prompt).toContain('ERD Diagram Code Generation Instructions');
      expect(prompt).toContain('Database schema for e-commerce');
      expect(prompt).toContain('primary key');
      expect(prompt).toContain('foreign key');
    });

    it('should detect complexity levels', () => {
      expect(templateEngine.detectComplexityLevel('simple flowchart')).toBe('simple');
      expect(templateEngine.detectComplexityLevel('comprehensive enterprise architecture')).toBe('complex');
      expect(templateEngine.detectComplexityLevel('show user workflow')).toBe('moderate');
    });

    it('should validate template variables', () => {
      const validVariables = {
        userRequest: 'Create diagram',
        diagramFormat: 'mermaid' as DiagramFormat
      };

      const errors = templateEngine.validateTemplateVariables(validVariables);
      expect(errors).toEqual([]);
    });

    it('should reject invalid template variables', () => {
      const invalidVariables = {
        userRequest: '',
        diagramFormat: 'invalid' as DiagramFormat
      };

      const errors = templateEngine.validateTemplateVariables(invalidVariables);
      expect(errors.length).toBeGreaterThan(0);
    });

    test('should include supported image formats in instructions', () => {
      const templateEngine = new DiagramInstructionTemplate();
      
      // Test Mermaid (PNG, SVG)
      const mermaidInstructions = templateEngine.generateInstructionPrompt({
        userRequest: 'Create a simple flowchart',
        diagramFormat: 'mermaid'
      });
      
      expect(mermaidInstructions).toContain('Supported Image Formats');
      expect(mermaidInstructions).toContain('PNG, SVG');
      
      // Test Excalidraw (SVG only)
      const excalidrawInstructions = templateEngine.generateInstructionPrompt({
        userRequest: 'Create a simple sketch',
        diagramFormat: 'excalidraw'
      });
      
      expect(excalidrawInstructions).toContain('Supported Image Formats');
      expect(excalidrawInstructions).toContain('SVG');
      expect(excalidrawInstructions).not.toContain('PNG, SVG');
      
      // Test D2 (SVG only)
      const d2Instructions = templateEngine.generateInstructionPrompt({
        userRequest: 'Create a system diagram',
        diagramFormat: 'd2'
      });
      
      expect(d2Instructions).toContain('Supported Image Formats');
      expect(d2Instructions).toContain('SVG');
      expect(d2Instructions).not.toContain('PNG, SVG');
      
      // Test PlantUML (PNG, SVG)
      const plantumlInstructions = templateEngine.generateInstructionPrompt({
        userRequest: 'Create a class diagram',
        diagramFormat: 'plantuml'
      });
      
      expect(plantumlInstructions).toContain('Supported Image Formats');
      expect(plantumlInstructions).toContain('PNG, SVG');
    });
  });

  describe('Instructions Handler', () => {
    it('should process valid request successfully', async () => {
      const input = {
        user_request: 'Create an authentication sequence diagram',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const result = await handler.processRequest(input);
      
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text.length).toBeGreaterThan(100);
      expect(result.prompt_text).toContain('Mermaid');
      expect(result.prompt_text).toContain('authentication sequence diagram');
    });

    it('should detect database domain context', async () => {
      const input = {
        user_request: 'Create a database schema with tables and relationships',
        diagram_format: 'erd' as DiagramFormat
      };

      const result = await handler.processRequest(input);
      
      expect(result.prompt_text).toContain('Domain-Specific Guidance');
      expect(result.prompt_text).toContain('primary keys');
    });

    it('should detect API domain context', async () => {
      const input = {
        user_request: 'Show REST API endpoints and authentication flow',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const result = await handler.processRequest(input);
      
      expect(result.prompt_text).toContain('request/response flow');
    });

    it('should handle all supported formats', async () => {
      const formats: DiagramFormat[] = ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd', 'bpmn', 'c4-plantuml', 'c4plantuml', 'c4', 'structurizr', 'excalidraw', 'vega-lite'];
      
      for (const format of formats) {
        const input = {
          user_request: `Create a ${format} diagram`,
          diagram_format: format
        };

        const result = await handler.processRequest(input);
        expect(result.prompt_text).toBeDefined();
        expect(result.prompt_text.length).toBeGreaterThan(50);
      }
    });

    it('should throw error for invalid input', async () => {
      const input = {
        user_request: '',
        diagram_format: 'mermaid' as DiagramFormat
      };

      await expect(handler.processRequest(input)).rejects.toThrow('Invalid input');
    });

    it('should throw error for unsupported format', async () => {
      const input = {
        user_request: 'Create a diagram',
        diagram_format: 'unsupported' as DiagramFormat
      };

      await expect(handler.processRequest(input)).rejects.toThrow('Unsupported format: unsupported');
    });

    it('should pass health check', async () => {
      const health = await handler.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.details).toEqual([]);
    });

    it('should provide metrics', async () => {
      const metrics = await handler.getMetrics();
      
      expect(metrics.supportedFormats).toBe(12);
      expect(metrics.validationRules).toBe(4);
      expect(Object.keys(metrics.templateSize)).toHaveLength(12);
    });

    it('should get all supported formats', () => {
      const formats = handler.getAllSupportedFormats();
      
      expect(formats).toEqual(['mermaid', 'plantuml', 'd2', 'graphviz', 'erd', 'bpmn', 'c4-plantuml', 'c4plantuml', 'c4', 'structurizr', 'excalidraw', 'vega-lite']);
    });

    it('should get format template information', () => {
      const template = handler.getFormatTemplate('mermaid');
      
      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      if (template) {
        expect(template.format).toBe('mermaid');
        expect(template.displayName).toBe('Mermaid');
        expect(template.syntaxGuidelines).toBeDefined();
        expect(template.bestPractices).toBeDefined();
      }
    });
  });

  describe('Context Enhancement', () => {
    it('should provide additional guidance for e-commerce ERD', async () => {
      const input = {
        user_request: 'Create an e-commerce database schema with users, products, and orders',
        diagram_format: 'erd' as DiagramFormat
      };

      const result = await handler.processRequest(input);
      
      expect(result.prompt_text).toContain('e-commerce entities');
      expect(result.prompt_text).toContain('User, Product, Order');
    });

    it('should provide sequence-specific guidance for Mermaid', async () => {
      const input = {
        user_request: 'Show sequence of interactions between user and system',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const result = await handler.processRequest(input);
      
      expect(result.prompt_text).toContain('sequenceDiagram type');
      expect(result.prompt_text).toContain('participant declarations');
    });

    it('should adapt complexity guidance', async () => {
      const simpleInput = {
        user_request: 'Simple basic user login flow',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const complexInput = {
        user_request: 'Comprehensive enterprise authentication architecture',
        diagram_format: 'mermaid' as DiagramFormat
      };

      const simpleResult = await handler.processRequest(simpleInput);
      const complexResult = await handler.processRequest(complexInput);
      
      expect(simpleResult.prompt_text).toContain('clarity and simplicity');
      expect(complexResult.prompt_text).toContain('breaking them into multiple simpler diagrams');
    });
  });
}); 