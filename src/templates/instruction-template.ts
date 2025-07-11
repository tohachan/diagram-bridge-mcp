import { 
  DiagramFormat, 
  InstructionTemplateVariables, 
  FormatInstructionTemplate,
  ContextEnhancement 
} from '../types/diagram-instructions.js';
import { FORMAT_INSTRUCTION_TEMPLATES } from '../resources/diagram-instructions-config.js';

/**
 * Main instruction template for diagram code generation
 */
const DIAGRAM_INSTRUCTION_PROMPT_TEMPLATE = `# {displayName} Diagram Code Generation Instructions

You are an expert {displayName} developer. Your task is to create syntactically correct {displayName} code for the following request.

## User Request
{userRequest}

## Target Format: {displayName}
{formatDescription}

## Syntax Guidelines
{syntaxGuidelines}

## Best Practices
{bestPractices}

## Common Pitfalls to Avoid
{commonPitfalls}

## Example Patterns
{examplePatterns}

## Output Requirements
{outputSpecifications}

{contextualGuidance}

## Your Task
Generate {displayName} code that:
1. **Accurately represents** the user's request
2. **Follows proper syntax** according to the guidelines above
3. **Implements best practices** for readability and maintainability
4. **Avoids common pitfalls** mentioned above
5. **Uses appropriate {displayName} features** for the specific use case

{complexityGuidance}

**IMPORTANT**: Output ONLY the {displayName} code. Do not include explanations, markdown wrappers, or additional text. The output should be ready to render immediately.`;

/**
 * Complexity-specific guidance templates
 */
const COMPLEXITY_GUIDANCE = {
  simple: `Focus on clarity and simplicity. Use basic {displayName} features and avoid complex nested structures.`,
  moderate: `Balance clarity with functionality. Use intermediate {displayName} features like subgraphs, styling, and proper grouping. Keep the diagram focused and avoid overcomplicating.`,
  complex: `**IMPORTANT**: For complex diagrams, consider breaking them into multiple simpler diagrams instead of creating one overly complex diagram. If you must create a complex diagram:
  • Use clear grouping and hierarchies
  • Limit nesting depth (maximum 3 levels for PlantUML packages)
  • Use aliases for long component names
  • Test with simpler versions first
  • Avoid mixing too many colors or styles
  • Focus on the most important relationships and components
  • Consider splitting into logical sub-diagrams (e.g., separate frontend, backend, and data layers)`
};

/**
 * Domain-specific context enhancements
 */
const DOMAIN_CONTEXTS: Record<string, ContextEnhancement> = {
  database: {
    domainKeywords: ['table', 'schema', 'entity', 'relationship', 'foreign key', 'primary key'],
    complexityIndicators: ['normalization', 'joins', 'indexes', 'constraints'],
    specificInstructions: [
      'Ensure all entities have primary keys clearly marked',
      'Show foreign key relationships with proper cardinality',
      'Group related entities logically',
      'Use meaningful entity and attribute names'
    ]
  },
  api: {
    domainKeywords: ['endpoint', 'request', 'response', 'authentication', 'middleware'],
    complexityIndicators: ['oauth', 'rate limiting', 'caching', 'microservices'],
    specificInstructions: [
      'Show request/response flow clearly',
      'Include authentication steps when relevant',
      'Indicate error handling paths',
      'Use proper sequence for API interactions'
    ]
  },
  architecture: {
    domainKeywords: ['service', 'component', 'layer', 'interface', 'dependency'],
    complexityIndicators: ['microservices', 'distributed', 'scalability', 'patterns'],
    specificInstructions: [
      'Show clear component boundaries',
      'Indicate data flow direction',
      'Group related components logically',
      'Show important dependencies and interfaces',
      'For complex architectures, focus on one layer or aspect at a time',
      'Use simple component names without special characters',
      'Limit package nesting to 3 levels maximum',
      'Consider creating separate diagrams for different architectural views (e.g., logical, physical, deployment)',
      'Use consistent naming conventions across all components',
      'Prioritize readability over comprehensive coverage - omit less critical details'
    ]
  },
  workflow: {
    domainKeywords: ['process', 'step', 'decision', 'state', 'transition'],
    complexityIndicators: ['parallel', 'conditional', 'loops', 'error handling'],
    specificInstructions: [
      'Show clear process flow',
      'Include decision points and alternatives',
      'Indicate start and end states',
      'Use consistent naming for similar actions'
    ]
  }
};

/**
 * Instruction template engine for diagram code generation
 */
export class DiagramInstructionTemplate {
  /**
   * Generate complete instruction prompt for diagram code generation
   */
  generateInstructionPrompt(variables: InstructionTemplateVariables): string {
    const {
      userRequest,
      diagramFormat,
      complexityLevel = 'moderate',
      domainContext,
      additionalGuidance = []
    } = variables;

    const template = FORMAT_INSTRUCTION_TEMPLATES[diagramFormat];
    
    if (!template) {
      throw new Error(`Unsupported diagram format: ${diagramFormat}`);
    }

    // Generate contextual guidance
    const contextualGuidance = this.generateContextualGuidance(
      userRequest, 
      diagramFormat, 
      domainContext, 
      additionalGuidance
    );

    // Generate complexity guidance
    const complexityGuidanceText = COMPLEXITY_GUIDANCE[complexityLevel]
      .replace(/{displayName}/g, template.displayName);

    return DIAGRAM_INSTRUCTION_PROMPT_TEMPLATE
      .replace(/{displayName}/g, template.displayName)
      .replace(/{userRequest}/g, userRequest)
      .replace(/{formatDescription}/g, this.generateFormatDescription(template))
      .replace(/{syntaxGuidelines}/g, this.formatListItems(template.syntaxGuidelines))
      .replace(/{bestPractices}/g, this.formatListItems(template.bestPractices))
      .replace(/{commonPitfalls}/g, this.formatListItems(template.commonPitfalls))
      .replace(/{examplePatterns}/g, this.formatExamplePatterns(template.examplePatterns))
      .replace(/{outputSpecifications}/g, this.formatListItems(template.outputSpecifications))
      .replace(/{contextualGuidance}/g, contextualGuidance)
      .replace(/{complexityGuidance}/g, complexityGuidanceText);
  }

  /**
   * Generate format description
   */
  private generateFormatDescription(template: FormatInstructionTemplate): string {
    return `${template.displayName} is specialized for creating ${template.format} diagrams with specific syntax and conventions.`;
  }

  /**
   * Format list items with bullet points
   */
  private formatListItems(items: string[]): string {
    return items.map(item => `• ${item}`).join('\n');
  }

  /**
   * Format example patterns with proper code blocks
   */
  private formatExamplePatterns(patterns: string[]): string {
    return patterns.map((pattern, index) => 
      `**Example ${index + 1}:**\n\`\`\`\n${pattern}\n\`\`\``
    ).join('\n\n');
  }

  /**
   * Generate contextual guidance based on domain and user request
   */
  private generateContextualGuidance(
    userRequest: string, 
    diagramFormat: DiagramFormat,
    domainContext?: string,
    additionalGuidance: string[] = []
  ): string {
    const guidance: string[] = [];

    // Auto-detect domain context if not provided
    const detectedDomain = domainContext || this.detectDomainContext(userRequest);
    
    if (detectedDomain && DOMAIN_CONTEXTS[detectedDomain]) {
      const context = DOMAIN_CONTEXTS[detectedDomain];
      guidance.push('## Domain-Specific Guidance');
      guidance.push(...context.specificInstructions.map(instruction => `• ${instruction}`));
    }

    // Add additional guidance if provided
    if (additionalGuidance.length > 0) {
      if (guidance.length > 0) guidance.push('');
      guidance.push('## Additional Considerations');
      guidance.push(...additionalGuidance.map(item => `• ${item}`));
    }

    return guidance.length > 0 ? '\n' + guidance.join('\n') + '\n' : '';
  }

  /**
   * Detect domain context from user request
   */
  private detectDomainContext(userRequest: string): string | undefined {
    const lowercaseRequest = userRequest.toLowerCase();
    
    for (const [domain, context] of Object.entries(DOMAIN_CONTEXTS)) {
      const hasKeywords = context.domainKeywords.some(keyword => 
        lowercaseRequest.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        return domain;
      }
    }
    
    return undefined;
  }

  /**
   * Detect complexity level from user request
   */
  detectComplexityLevel(userRequest: string): 'simple' | 'moderate' | 'complex' {
    const lowercaseRequest = userRequest.toLowerCase();
    
    // Simple indicators
    const simpleIndicators = ['simple', 'basic', 'quick', 'show me', 'just'];
    const hasSimple = simpleIndicators.some(indicator => lowercaseRequest.includes(indicator));
    
    // Complex indicators
    const complexIndicators = ['complex', 'comprehensive', 'detailed', 'full', 'complete', 'enterprise'];
    const hasComplex = complexIndicators.some(indicator => lowercaseRequest.includes(indicator));
    
    // Technical complexity indicators
    const technicalComplexity = ['microservices', 'distributed', 'scalable', 'enterprise', 'advanced'];
    const hasTechnical = technicalComplexity.some(indicator => lowercaseRequest.includes(indicator));
    
    if (hasSimple && !hasComplex && !hasTechnical) {
      return 'simple';
    } else if (hasComplex || hasTechnical) {
      return 'complex';
    } else {
      return 'moderate';
    }
  }

  /**
   * Validate template variables before rendering
   */
  validateTemplateVariables(variables: InstructionTemplateVariables): string[] {
    const errors: string[] = [];

    if (!variables.userRequest || variables.userRequest.trim().length === 0) {
      errors.push('User request is required and cannot be empty');
    }

    if (variables.userRequest && variables.userRequest.length > 2000) {
      errors.push('User request exceeds maximum length of 2000 characters');
    }

    if (!variables.diagramFormat) {
      errors.push('Diagram format is required');
    }

    if (variables.diagramFormat && !FORMAT_INSTRUCTION_TEMPLATES[variables.diagramFormat]) {
      errors.push(`Unsupported diagram format: ${variables.diagramFormat}`);
    }

    if (variables.complexityLevel && !['simple', 'moderate', 'complex'].includes(variables.complexityLevel)) {
      errors.push('Complexity level must be simple, moderate, or complex');
    }

    return errors;
  }
} 