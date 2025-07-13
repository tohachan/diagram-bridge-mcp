import { DiagramSelectionHandler } from '../resources/diagram-selection-handler.js';
import { DiagramSelectionValidator } from '../utils/validation.js';
import { FormatSelectionAnalyzer } from '../utils/selection-heuristics.js';
import { DiagramSelectionPromptTemplate } from '../templates/prompt-template.js';
import { DiagramFormat } from '../types/diagram-selection.js';

describe('Diagram Selection System', () => {
  let handler: DiagramSelectionHandler;
  let validator: DiagramSelectionValidator;
  let analyzer: FormatSelectionAnalyzer;
  let templateEngine: DiagramSelectionPromptTemplate;

  beforeEach(() => {
    handler = new DiagramSelectionHandler();
    validator = new DiagramSelectionValidator();
    analyzer = new FormatSelectionAnalyzer();
    templateEngine = new DiagramSelectionPromptTemplate();
  });

  describe('Input Validation', () => {
    it('should validate correct input', () => {
      const input = {
        user_request: 'I need to create a database schema for an e-commerce system',
        available_formats: ['mermaid', 'erd']
      };

      const result = validator.validateInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty user request', () => {
      const input = {
        user_request: '',
        available_formats: ['mermaid']
      };

      const result = validator.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request cannot be empty');
    });

    it('should reject invalid formats', () => {
      const input = {
        user_request: 'Test request',
        available_formats: ['invalid_format']
      };

      const result = validator.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid formats'))).toBe(true);
    });

    it('should reject too short user request', () => {
      const input = {
        user_request: 'Hi',
        available_formats: ['mermaid']
      };

      const result = validator.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user_request must be at least 5 characters long');
    });
  });

  describe('Format Selection Analysis', () => {
    it('should recommend ERD for database schema requests', () => {
      const userRequest = 'I need to create a database schema for an e-commerce system';
      const recommendations = analyzer.analyzeRequest(userRequest);

      expect(recommendations.length).toBeGreaterThan(0);
      const erdRecommendation = recommendations.find(r => r.format === 'erd');
      expect(erdRecommendation).toBeDefined();
      expect(erdRecommendation!.confidence).toBeGreaterThan(0.7);
    });

    it('should recommend Mermaid for sequence diagrams', () => {
      const userRequest = 'Show me the API request sequence for user authentication';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const mermaidRecommendation = recommendations.find(r => r.format === 'mermaid');
      expect(mermaidRecommendation).toBeDefined();
      expect(mermaidRecommendation!.confidence).toBeGreaterThan(0.8);
    });

    it('should recommend PlantUML for UML diagrams', () => {
      const userRequest = 'Create a class diagram for our component architecture';
      const recommendations = analyzer.analyzeRequest(userRequest);

      const plantumlRecommendation = recommendations.find(r => r.format === 'plantuml');
      expect(plantumlRecommendation).toBeDefined();
      expect(plantumlRecommendation!.confidence).toBeGreaterThan(0.9);
    });

    it('should filter by available formats', () => {
      const userRequest = 'Database schema diagram';
      const availableFormats: DiagramFormat[] = ['mermaid', 'plantuml'];
      const recommendations = analyzer.analyzeRequest(userRequest, availableFormats);

      recommendations.forEach(rec => {
        expect(availableFormats).toContain(rec.format);
      });
    });

    it('should detect explicit format preferences', () => {
      const userRequest = 'Create a mermaid diagram for the authentication flow';
      const preference = analyzer.detectExplicitFormatPreference(userRequest);
      expect(preference).toBe('mermaid');
    });
  });

  describe('Template Generation', () => {
    it('should generate valid prompts with all variables', () => {
      const variables = {
        userRequest: 'Create a database schema',
        availableFormats: ['mermaid', 'erd'] as DiagramFormat[],
        formatDescriptions: [
          {
            name: 'mermaid' as const,
            displayName: 'Mermaid',
            description: 'Simple diagramming tool',
            strengths: ['Easy to learn'],
            weaknesses: ['Limited customization'],
            bestFor: ['Simple flows'],
            examples: ['User flows']
          },
          {
            name: 'erd' as const,
            displayName: 'ERD',
            description: 'Entity relationship diagrams',
            strengths: ['Database focused'],
            weaknesses: ['Limited scope'],
            bestFor: ['Database design'],
            examples: ['E-commerce schema']
          }
        ],
        selectionHeuristics: []
      };

      const prompt = templateEngine.generatePrompt(variables);
      expect(prompt).toContain('Create a database schema');
      expect(prompt).toContain('Format Selection Heuristics');
      expect(prompt).toContain('expert systems analyst');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should validate template variables', () => {
      const invalidVariables = {
        userRequest: '',
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const errors = templateEngine.validateTemplateVariables(invalidVariables);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('User request is required and cannot be empty');
    });

    it('should generate quick prompts', () => {
      const userRequest = 'Create a flow diagram';
      const quickPrompt = templateEngine.generateQuickPrompt(userRequest, ['mermaid']);
      
      expect(quickPrompt).toContain(userRequest);
      expect(quickPrompt).toContain('Mermaid');
      expect(quickPrompt.length).toBeGreaterThan(50);
    });
  });

  describe('End-to-End Handler', () => {
    it('should process valid requests successfully', async () => {
      const input = {
        user_request: 'I need to visualize the authentication flow in my web application',
        available_formats: ['mermaid', 'plantuml']
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text.length).toBeGreaterThan(100);
      expect(result.prompt_text).toContain('authentication flow');
    });

    it('should handle explicit format preferences', async () => {
      const input = {
        user_request: 'Create a mermaid diagram for user registration flow'
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toContain('mermaid');
      expect(result.prompt_text).toContain('Direct Preference Detected');
    });

    it('should reject invalid input', async () => {
      const input = {
        user_request: '',
        available_formats: ['invalid']
      };

      await expect(handler.processRequest(input)).rejects.toThrow('Invalid input');
    });

    it('should handle processing gracefully', async () => {
      // Test that the handler works with edge case input
      const input = {
        user_request: 'A very short req'
      };

      const result = await handler.processRequest(input);
      expect(result.prompt_text).toBeDefined();
      expect(result.prompt_text.length).toBeGreaterThan(50);
    });
  });

  describe('Health Check', () => {
    it('should pass health check for working system', async () => {
      const health = await handler.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.details).toHaveLength(0);
    });
  });

  describe('Metrics', () => {
    it('should provide system metrics', async () => {
      const metrics = await handler.getMetrics();
      expect(metrics.supportedFormats).toBe(12); // All supported formats including new ones and aliases
      expect(metrics.heuristicsCount).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.lastProcessingTime).toBe('number');
    });
  });

  describe('Format Catalog', () => {
    it('should provide complete format catalog', () => {
      const catalog = handler.getFormatCatalog();
      expect(catalog).toHaveLength(12);
      
      const formatNames = catalog.map(f => f.format);
      expect(formatNames).toContain('mermaid');
      expect(formatNames).toContain('plantuml');
      expect(formatNames).toContain('d2');
      expect(formatNames).toContain('graphviz');
      expect(formatNames).toContain('erd');

      catalog.forEach(format => {
        expect(format.displayName).toBeDefined();
        expect(format.description).toBeDefined();
        expect(format.strengths.length).toBeGreaterThan(0);
        expect(format.bestFor.length).toBeGreaterThan(0);
        expect(format.examples.length).toBeGreaterThan(0);
      });
    });
  });
}); 