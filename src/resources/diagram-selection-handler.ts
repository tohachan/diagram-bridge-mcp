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
      // Check for explicit format preference
      const availableFormats = input.available_formats || this.getAllSupportedFormats();
      const explicitPreference = this.analyzer.detectExplicitFormatPreference(input.user_request);
      if (explicitPreference && availableFormats.includes(explicitPreference)) {
        return this.generateQuickResponse(input.user_request, explicitPreference);
      }

      // Prepare simplified template variables (only user request needed now)
      const templateVariables: PromptTemplateVariables = {
        userRequest: input.user_request,
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      // Generate the prompt using simplified template
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

      // Test analyzer for explicit format detection
      const explicitFormat = this.analyzer.detectExplicitFormatPreference('use mermaid for flowchart');
      if (explicitFormat !== 'mermaid') {
        issues.push('Analyzer failed to detect explicit format preference');
      }

      // Test template engine with simplified variables
      const templateVars: PromptTemplateVariables = {
        userRequest: 'test',
        availableFormats: [],
        formatDescriptions: [],
        selectionHeuristics: []
      };

      const templateResult = this.templateEngine.generatePrompt(templateVars);
      if (!templateResult || templateResult.length < 100) {
        issues.push('Template engine failed to generate adequate prompt');
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