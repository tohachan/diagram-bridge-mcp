import { 
  DiagramSelectionInput, 
  DiagramSelectionOutput, 
  PromptTemplateVariables,
  DiagramFormat
} from '../types/diagram-selection.js';
import { DIAGRAM_FORMAT_DEFINITIONS } from './diagram-selection-config.js';
import { FormatSelectionAnalyzer } from '../utils/selection-heuristics.js';
import { DiagramSelectionPromptTemplate } from '../templates/prompt-template.js';
import { DiagramSelectionValidator } from '../utils/validation.js';

/**
 * Main handler for the help_choose_diagram MCP resource
 */
export class DiagramSelectionHandler {
  private analyzer: FormatSelectionAnalyzer;
  private templateEngine: DiagramSelectionPromptTemplate;
  private validator: DiagramSelectionValidator;

  constructor() {
    this.analyzer = new FormatSelectionAnalyzer();
    this.templateEngine = new DiagramSelectionPromptTemplate();
    this.validator = new DiagramSelectionValidator();
  }

  /**
   * Process diagram selection request and generate prompt
   */
  async processRequest(rawInput: unknown): Promise<DiagramSelectionOutput> {
    // Validate and sanitize input
    const { input, errors } = this.validator.createValidatedInput(rawInput);
    
    if (!input || errors.length > 0) {
      throw new Error(`Invalid input: ${errors.join(', ')}`);
    }

    try {
      // Determine available formats
      const availableFormats = input.available_formats || this.getAllSupportedFormats();
      
      // Check for explicit format preference
      const explicitPreference = this.analyzer.detectExplicitFormatPreference(input.user_request);
      if (explicitPreference && availableFormats.includes(explicitPreference)) {
        return this.generateQuickResponse(input.user_request, explicitPreference);
      }

      // Analyze request and get recommendations
      const recommendations = this.analyzer.analyzeRequest(input.user_request, availableFormats);
      
      // Get format descriptions for available formats
      const formatDescriptions = availableFormats.map(format => DIAGRAM_FORMAT_DEFINITIONS[format]);
      
      // Prepare template variables
      const templateVariables: PromptTemplateVariables = {
        userRequest: input.user_request,
        availableFormats,
        formatDescriptions,
        selectionHeuristics: recommendations
      };

      // Validate template variables
      const templateErrors = this.templateEngine.validateTemplateVariables(templateVariables);
      if (templateErrors.length > 0) {
        throw new Error(`Template validation failed: ${templateErrors.join(', ')}`);
      }

      // Generate the prompt
      const promptText = this.templateEngine.generatePrompt(templateVariables);

      return {
        prompt_text: promptText
      };

    } catch (error) {
      // Fallback to quick prompt on any processing error
      console.error('Error processing diagram selection request:', error);
      return this.generateFallbackResponse(input.user_request, input.available_formats);
    }
  }

  /**
   * Generate a quick response for explicit format preferences
   */
  private generateQuickResponse(userRequest: string, preferredFormat: DiagramFormat): DiagramSelectionOutput {
    const formatInfo = DIAGRAM_FORMAT_DEFINITIONS[preferredFormat];
    
    const quickPrompt = `# Diagram Format Selection - Direct Preference Detected

You mentioned "${preferredFormat}" in your request: "${userRequest}"

## Selected Format: ${formatInfo.displayName}
**Description:** ${formatInfo.description}

**Why this format is suitable:**
${formatInfo.strengths.map(strength => `- ${strength}`).join('\n')}

**Your format choice is confirmed.** Proceed with ${formatInfo.displayName} for your diagram.

**Quick tip:** ${formatInfo.bestFor[0] || 'This format is well-suited for your needs'}.`;

    return {
      prompt_text: quickPrompt
    };
  }

  /**
   * Generate fallback response when processing fails
   */
  private generateFallbackResponse(userRequest: string, availableFormats?: DiagramFormat[]): DiagramSelectionOutput {
    const fallbackPrompt = this.templateEngine.generateQuickPrompt(userRequest, availableFormats);
    
    return {
      prompt_text: `# Diagram Format Selection - Quick Analysis\n\n${fallbackPrompt}`
    };
  }

  /**
   * Get all supported diagram formats
   */
  private getAllSupportedFormats(): DiagramFormat[] {
    return Object.keys(DIAGRAM_FORMAT_DEFINITIONS) as DiagramFormat[];
  }

  /**
   * Health check method to verify all components are working
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string[] }> {
    const issues: string[] = [];

    try {
      // Test basic functionality with sample input
      const testInput: DiagramSelectionInput = {
        user_request: 'Test authentication flow diagram'
      };

      const result = await this.processRequest(testInput);
      
      if (!result.prompt_text || result.prompt_text.length < 50) {
        issues.push('Generated prompt is too short');
      }

      // Test validation
      const validationResult = this.validator.validateInput(testInput);
      if (!validationResult.isValid) {
        issues.push('Validation failed for valid input');
      }

      // Test analyzer
      const recommendations = this.analyzer.analyzeRequest('database schema');
      if (recommendations.length === 0) {
        issues.push('Analyzer failed to generate recommendations');
      }

      // Test template engine
      const templateVars: PromptTemplateVariables = {
        userRequest: 'test',
        availableFormats: ['mermaid'],
        formatDescriptions: [DIAGRAM_FORMAT_DEFINITIONS.mermaid],
        selectionHeuristics: []
      };

      const templateErrors = this.templateEngine.validateTemplateVariables(templateVars);
      if (templateErrors.length > 0) {
        issues.push(`Template validation issues: ${templateErrors.join(', ')}`);
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
   * Get performance metrics (for monitoring)
   */
  async getMetrics(): Promise<{
    supportedFormats: number;
    heuristicsCount: number;
    lastProcessingTime?: number;
  }> {
    const start = Date.now();
    
    // Process a simple test request to measure performance
    try {
      await this.processRequest({
        user_request: 'Performance test request'
      });
    } catch {
      // Ignore errors for metrics
    }
    
    const processingTime = Date.now() - start;

    return {
      supportedFormats: this.getAllSupportedFormats().length,
      heuristicsCount: this.analyzer.analyzeRequest('test').length,
      lastProcessingTime: processingTime
    };
  }

  /**
   * Get detailed information about supported formats
   */
  getFormatCatalog() {
    return Object.entries(DIAGRAM_FORMAT_DEFINITIONS).map(([format, details]) => ({
      format: format as DiagramFormat,
      displayName: details.displayName,
      description: details.description,
      strengths: details.strengths,
      bestFor: details.bestFor,
      examples: details.examples
    }));
  }
} 