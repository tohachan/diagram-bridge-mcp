import { 
  DiagramSelectionInput, 
  DiagramSelectionOutput, 
  PromptTemplateVariables,
  DiagramFormat
} from '../types/diagram-selection.js';
import { FormatSelectionAnalyzer } from '../utils/selection-heuristics.js';
import { DiagramSelectionPromptTemplate } from '../templates/prompt-template.js';
import { DiagramSelectionValidator } from '../utils/validation.js';
import { 
  getSupportedDiagramFormats,
  getFormatConfiguration,
  getFormatCharacteristics
} from '../utils/format-validation.js';

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
      const formatDescriptions = availableFormats.map(format => {
        const config = getFormatConfiguration(format);
        const characteristics = getFormatCharacteristics(format);
        return config ? {
          name: format,
          displayName: config.displayName,
          description: config.description,
          strengths: characteristics?.strengths || [],
          weaknesses: characteristics?.weaknesses || [],
          bestFor: characteristics?.bestFor || [],
          examples: characteristics?.examples || []
        } : null;
      }).filter(desc => desc !== null);
      
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
    const formatConfig = getFormatConfiguration(preferredFormat);
    const formatCharacteristics = getFormatCharacteristics(preferredFormat);
    
    if (!formatConfig || !formatCharacteristics) {
      // Fallback if format configuration is not found
      return this.generateFallbackResponse(userRequest, [preferredFormat]);
    }
    
    const quickPrompt = `# Diagram Format Selection - Direct Preference Detected

You mentioned "${preferredFormat}" in your request: "${userRequest}"

## Selected Format: ${formatConfig.displayName}
**Description:** ${formatConfig.description}

**Why this format is suitable:**
${formatCharacteristics.strengths.map((strength: string) => `- ${strength}`).join('\n')}

**Your format choice is confirmed.** Proceed with ${formatConfig.displayName} for your diagram.

**Quick tip:** ${formatCharacteristics.bestFor[0] || 'This format is well-suited for your needs'}.`;

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
    return getSupportedDiagramFormats();
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
      const testFormatConfig = getFormatConfiguration('mermaid');
      const testFormatCharacteristics = getFormatCharacteristics('mermaid');
      const testFormatDescription = testFormatConfig && testFormatCharacteristics ? {
        name: 'mermaid',
        displayName: testFormatConfig.displayName,
        description: testFormatConfig.description,
        strengths: testFormatCharacteristics.strengths,
        weaknesses: testFormatCharacteristics.weaknesses,
        bestFor: testFormatCharacteristics.bestFor,
        examples: testFormatCharacteristics.examples
      } : null;

      const templateVars: PromptTemplateVariables = {
        userRequest: 'test',
        availableFormats: ['mermaid'],
        formatDescriptions: testFormatDescription ? [testFormatDescription] : [],
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
    const supportedFormats = getSupportedDiagramFormats();
    return supportedFormats.map(format => {
      const config = getFormatConfiguration(format);
      const characteristics = getFormatCharacteristics(format);
      
      if (!config || !characteristics) {
        return null;
      }
      
      return {
        format: format as DiagramFormat,
        displayName: config.displayName,
        description: config.description,
        strengths: characteristics.strengths,
        bestFor: characteristics.bestFor,
        examples: characteristics.examples
      };
    }).filter(entry => entry !== null);
  }
} 