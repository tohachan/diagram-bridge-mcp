import { 
  DiagramInstructionsInput, 
  DiagramInstructionsOutput, 
  InstructionTemplateVariables
} from '../types/diagram-instructions.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { DiagramInstructionTemplate } from '../templates/instruction-template.js';
import { DiagramInstructionsValidator } from '../utils/instruction-validation.js';
import { 
  getSupportedDiagramFormats,
  getFormatInstructionTemplate 
} from '../utils/format-validation.js';

/**
 * Main handler for the get_diagram_instructions MCP resource
 */
export class DiagramInstructionsHandler {
  private templateEngine: DiagramInstructionTemplate;
  private validator: DiagramInstructionsValidator;

  constructor() {
    this.templateEngine = new DiagramInstructionTemplate();
    this.validator = new DiagramInstructionsValidator();
  }

  /**
   * Process diagram instructions request and generate format-specific prompt
   */
  async processRequest(rawInput: unknown): Promise<DiagramInstructionsOutput> {
    // Validate and sanitize input
    const { input, errors } = this.validator.createValidatedInput(rawInput);
    
    if (!input || errors.length > 0) {
      throw new Error(`Invalid input: ${errors.join(', ')}`);
    }

    try {
      // Validate format support
      if (!this.validator.validateFormatSupport(input.diagram_format)) {
        throw new Error(`Unsupported diagram format: ${input.diagram_format}`);
      }

      // Detect complexity level from user request
      const complexityLevel = this.templateEngine.detectComplexityLevel(input.user_request);

      // Prepare template variables
      const detectedDomain = this.detectDomainContext(input.user_request);
      const templateVariables: InstructionTemplateVariables = {
        userRequest: input.user_request,
        diagramFormat: input.diagram_format,
        complexityLevel,
        ...(detectedDomain && { domainContext: detectedDomain }),
        additionalGuidance: this.generateAdditionalGuidance(input.user_request, input.diagram_format)
      };

      // Validate template variables
      const templateErrors = this.templateEngine.validateTemplateVariables(templateVariables);
      if (templateErrors.length > 0) {
        throw new Error(`Template validation failed: ${templateErrors.join(', ')}`);
      }

      // Generate the instruction prompt
      const promptText = this.templateEngine.generateInstructionPrompt(templateVariables);

      return {
        prompt_text: promptText
      };

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during instruction generation');
    }
  }

  /**
   * Detect domain context from user request
   */
  private detectDomainContext(userRequest: string): string | undefined {
    const lowercaseRequest = userRequest.toLowerCase();
    
    // Database domain
    if (/\b(database|schema|table|entity|relationship|foreign key|primary key|sql|mysql|postgres)\b/.test(lowercaseRequest)) {
      return 'database';
    }
    
    // API domain
    if (/\b(api|endpoint|request|response|authentication|rest|graphql|oauth|middleware)\b/.test(lowercaseRequest)) {
      return 'api';
    }
    
    // Architecture domain
    if (/\b(architecture|service|component|microservice|system|platform|infrastructure|deployment)\b/.test(lowercaseRequest)) {
      return 'architecture';
    }
    
    // Workflow domain
    if (/\b(workflow|process|flow|step|state|transition|decision|journey)\b/.test(lowercaseRequest)) {
      return 'workflow';
    }
    
    return undefined;
  }

  /**
   * Generate additional guidance based on user request and format
   */
  private generateAdditionalGuidance(userRequest: string, diagramFormat: DiagramFormat): string[] {
    const guidance: string[] = [];
    const lowercaseRequest = userRequest.toLowerCase();

    // Format-specific guidance
    switch (diagramFormat) {
      case 'mermaid':
        if (lowercaseRequest.includes('sequence') || lowercaseRequest.includes('interaction')) {
          guidance.push('Use sequenceDiagram type for interactions between actors/systems');
          guidance.push('Include proper participant declarations');
        }
        if (lowercaseRequest.includes('flow') || lowercaseRequest.includes('process')) {
          guidance.push('Use flowchart TD or LR for process flows');
          guidance.push('Use decision diamonds for conditional logic');
        }
        break;

      case 'plantuml':
        if (lowercaseRequest.includes('class') || lowercaseRequest.includes('inheritance')) {
          guidance.push('Use proper UML class diagram syntax with relationships');
          guidance.push('Include method signatures and field types when relevant');
        }
        if (lowercaseRequest.includes('component') || lowercaseRequest.includes('architecture')) {
          guidance.push('Use component diagram with proper interface definitions');
          guidance.push('Group related components in packages');
        }
        break;

      case 'd2':
        if (lowercaseRequest.includes('system') || lowercaseRequest.includes('infrastructure')) {
          guidance.push('Use hierarchical naming for system components');
          guidance.push('Apply consistent styling for component types');
        }
        break;

      case 'graphviz':
        if (lowercaseRequest.includes('dependency') || lowercaseRequest.includes('hierarchy')) {
          guidance.push('Use rankdir for appropriate layout direction');
          guidance.push('Group related nodes in subgraphs for clarity');
        }
        break;

      case 'erd':
        if (lowercaseRequest.includes('e-commerce') || lowercaseRequest.includes('ecommerce')) {
          guidance.push('Include common e-commerce entities: User, Product, Order, Category');
          guidance.push('Show proper many-to-many relationships with junction tables');
        }
        break;
    }

    // General guidance based on request content
    if (lowercaseRequest.includes('complex') || lowercaseRequest.includes('enterprise')) {
      guidance.push('Break down complex relationships into manageable chunks');
      guidance.push('Use proper labeling and documentation for clarity');
    }

    if (lowercaseRequest.includes('simple') || lowercaseRequest.includes('basic')) {
      guidance.push('Focus on core elements and avoid unnecessary complexity');
      guidance.push('Use clear, descriptive names for better readability');
    }

    return guidance;
  }

  /**
   * Get all supported formats
   */
  getAllSupportedFormats(): DiagramFormat[] {
    return this.validator.getSupportedFormats();
  }

  /**
   * Get format template information
   */
  getFormatTemplate(format: DiagramFormat) {
    return getFormatInstructionTemplate(format);
  }

  /**
   * Health check method to verify all components are working
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string[] }> {
    const issues: string[] = [];

    try {
      // Test basic functionality with sample input
      const testInput: DiagramInstructionsInput = {
        user_request: 'Create a simple user authentication flow',
        diagram_format: 'mermaid'
      };

      const result = await this.processRequest(testInput);
      
      if (!result.prompt_text || result.prompt_text.length < 100) {
        issues.push('Generated instruction prompt is too short');
      }

      // Test validation
      const validationResult = this.validator.validateInput(testInput);
      if (!validationResult.isValid) {
        issues.push('Validation failed for valid input');
      }

      // Test template engine
      const templateVars: InstructionTemplateVariables = {
        userRequest: 'test authentication flow',
        diagramFormat: 'mermaid',
        complexityLevel: 'simple'
      };

      const templateErrors = this.templateEngine.validateTemplateVariables(templateVars);
      if (templateErrors.length > 0) {
        issues.push(`Template validation issues: ${templateErrors.join(', ')}`);
      }

      // Test all supported formats
      const supportedFormats = this.getAllSupportedFormats();
      for (const format of supportedFormats) {
        if (!this.validator.validateFormatSupport(format)) {
          issues.push(`Format ${format} not properly supported`);
        }
      }

      // Test template generation for each format
      for (const format of supportedFormats) {
        try {
          const testVars: InstructionTemplateVariables = {
            userRequest: 'test diagram',
            diagramFormat: format
          };
          
          const prompt = this.templateEngine.generateInstructionPrompt(testVars);
          if (!prompt || prompt.length < 50) {
            issues.push(`Template generation failed for format: ${format}`);
          }
        } catch (error) {
          issues.push(`Template error for ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'unhealthy',
      details: issues
    };
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<{ 
    supportedFormats: number; 
    templateSize: Record<DiagramFormat, number>;
    validationRules: number;
  }> {
    const supportedFormats = this.getAllSupportedFormats();
    const templateSize: Record<DiagramFormat, number> = {} as Record<DiagramFormat, number>;
    
    // Calculate template sizes
    for (const format of supportedFormats) {
      const template = this.getFormatTemplate(format);
      templateSize[format] = JSON.stringify(template).length;
    }

    return {
      supportedFormats: supportedFormats.length,
      templateSize,
      validationRules: 4 // user_request, diagram_format, security, format support
    };
  }
} 