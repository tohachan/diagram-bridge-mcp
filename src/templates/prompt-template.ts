import { DiagramFormat, DiagramFormatCharacteristics, PromptTemplateVariables, FormatSelectionHeuristic } from '../types/diagram-selection.js';
import { getSupportedDiagramFormats, getFormatConfiguration } from '../utils/format-validation.js';
import { FORMAT_SELECTION_HEURISTICS } from '../utils/selection-heuristics.js';

/**
 * Main prompt template for diagram format selection
 */
const DIAGRAM_SELECTION_PROMPT_TEMPLATE = `You are an expert systems analyst. Analyze the user's request based on keywords and the following meta-attributes: Formality (informal, semi-formal, formal), Audience (developer, manager, architect), and Data Source (structure-driven, data-driven). Based on this analysis, select the best diagram format from the provided heuristics. Justify your choice briefly.

User Request: "{userRequest}"

{FORMAT_SELECTION_HEURISTICS}`;

/**
 * Template for format characteristics section
 */
const FORMAT_CHARACTERISTICS_TEMPLATE = `### {displayName} ({name})
**Description:** {description}

**Strengths:**
{strengthsList}

**Best For:**
{bestForList}

**Example Use Cases:**
{examplesList}

---`;

/**
 * Template for recommendation analysis section
 */
const RECOMMENDATION_ANALYSIS_TEMPLATE = `### {format} (Confidence: {confidence}%)
**Reasoning:** {reasoning}

`;

/**
 * Prompt template engine for diagram format selection
 */
export class DiagramSelectionPromptTemplate {
  /**
   * Generate complete prompt for diagram format selection
   */
  generatePrompt(variables: PromptTemplateVariables): string {
    const { userRequest } = variables;
    
    // Format heuristics data for the prompt
    const formattedHeuristics = this.formatHeuristicsForPrompt(FORMAT_SELECTION_HEURISTICS);
    
    return DIAGRAM_SELECTION_PROMPT_TEMPLATE
      .replace('{userRequest}', userRequest)
      .replace('{FORMAT_SELECTION_HEURISTICS}', formattedHeuristics);
  }

  /**
   * Format FORMAT_SELECTION_HEURISTICS array for prompt inclusion
   */
  private formatHeuristicsForPrompt(heuristics: FormatSelectionHeuristic[]): string {
    const groupedHeuristics = this.groupHeuristicsByFormat(heuristics);
    
    let formattedText = 'Format Selection Heuristics:\n\n';
    
    Object.entries(groupedHeuristics).forEach(([format, formatHeuristics]) => {
      const config = getFormatConfiguration(format as DiagramFormat);
      const displayName = config?.displayName || format || 'Unknown';
      
      formattedText += `${displayName.toUpperCase()}:\n`;
      formatHeuristics.forEach(heuristic => {
        formattedText += `- Keywords: ${heuristic.keywords.join(', ')}\n`;
        formattedText += `  Confidence: ${Math.round(heuristic.confidence * 100)}%\n`;
        formattedText += `  Reasoning: ${heuristic.reasoning}\n\n`;
      });
    });
    
    return formattedText;
  }

  /**
   * Group heuristics by diagram format
   */
  private groupHeuristicsByFormat(heuristics: FormatSelectionHeuristic[]): Record<string, FormatSelectionHeuristic[]> {
    const grouped: Record<string, FormatSelectionHeuristic[]> = {};
    
    heuristics.forEach(heuristic => {
      if (!grouped[heuristic.format]) {
        grouped[heuristic.format] = [];
      }
      grouped[heuristic.format]!.push(heuristic);
    });
    
    return grouped;
  }

  /**
   * Generate the available formats section
   */
  private generateAvailableFormatsSection(availableFormats: DiagramFormat[]): string {
    if (availableFormats.length === 0) {
      return 'All supported formats are available for consideration.';
    }

    const formatNames = availableFormats
      .map(format => {
        const config = getFormatConfiguration(format);
        return config?.displayName || format;
      })
      .join(', ');

    return `The following formats are available for this request: ${formatNames}`;
  }

  /**
   * Generate detailed format analysis section
   */
  private generateFormatAnalysisSection(formatDescriptions: DiagramFormatCharacteristics[]): string {
    return formatDescriptions
      .map(format => this.generateFormatCharacteristics(format))
      .join('\n');
  }

  /**
   * Generate characteristics for a single format
   */
  private generateFormatCharacteristics(format: DiagramFormatCharacteristics): string {
    const strengthsList = format.strengths
      .map(strength => `- ${strength}`)
      .join('\n');

    const bestForList = format.bestFor
      .map(use => `- ${use}`)
      .join('\n');

    const examplesList = format.examples
      .map(example => `- ${example}`)
      .join('\n');

    return FORMAT_CHARACTERISTICS_TEMPLATE
      .replace('{displayName}', format.displayName)
      .replace('{name}', format.name)
      .replace('{description}', format.description)
      .replace('{strengthsList}', strengthsList)
      .replace('{bestForList}', bestForList)
      .replace('{examplesList}', examplesList);
  }

  /**
   * Generate AI recommendations section based on heuristics
   */
  private generateRecommendationsSection(recommendations: FormatSelectionHeuristic[]): string {
    if (recommendations.length === 0) {
      return 'No specific format recommendations found based on keyword analysis. Consider all available formats equally.';
    }

    const header = '### AI Analysis Recommendations\n\nBased on keyword analysis of your request:\n\n';
    
    const recommendationTexts = recommendations
      .map(rec => this.generateRecommendationAnalysis(rec))
      .join('\n');

    return header + recommendationTexts;
  }

  /**
   * Generate individual recommendation analysis
   */
  private generateRecommendationAnalysis(recommendation: FormatSelectionHeuristic): string {
    const confidencePercent = Math.round(recommendation.confidence * 100);
    const config = getFormatConfiguration(recommendation.format);
    const formatName = config?.displayName || recommendation.format || 'Unknown';

    return RECOMMENDATION_ANALYSIS_TEMPLATE
      .replace('{format}', formatName)
      .replace('{confidence}', confidencePercent.toString())
      .replace('{reasoning}', recommendation.reasoning);
  }

  /**
   * Generate a simplified prompt for quick format selection
   */
  generateQuickPrompt(userRequest: string, availableFormats?: DiagramFormat[]): string {
    const formatsText = availableFormats 
      ? availableFormats.map(f => {
          const config = getFormatConfiguration(f);
          return config?.displayName || f;
        }).join(', ')
      : 'Mermaid, PlantUML, D2, GraphViz'; // ERD temporarily disabled

    return `Choose the best diagram format for this request: "${userRequest}"

Available formats: ${formatsText}

Consider:
- Mermaid: Best for flowcharts, sequences, and simple processes
- PlantUML: Best for UML diagrams and software architecture
- D2: Best for system architecture and modern infrastructure
- GraphViz: Best for complex graphs, dependencies, and hierarchies
// - ERD: Best for database schemas and entity relationships (temporarily disabled)

Recommend the most suitable format with a brief explanation.`;
  }

  /**
   * Validate template variables before generation
   */
  validateTemplateVariables(variables: PromptTemplateVariables): string[] {
    const errors: string[] = [];

    if (!variables.userRequest || variables.userRequest.trim().length === 0) {
      errors.push('User request is required and cannot be empty');
    }

    if (variables.userRequest && variables.userRequest.length > 1000) {
      errors.push('User request exceeds maximum length of 1000 characters');
    }

    if (!Array.isArray(variables.availableFormats)) {
      errors.push('Available formats must be an array');
    }

    if (!Array.isArray(variables.formatDescriptions)) {
      errors.push('Format descriptions must be an array');
    }

    if (!Array.isArray(variables.selectionHeuristics)) {
      errors.push('Selection heuristics must be an array');
    }

    // Validate available formats are supported
    const supportedFormats = getSupportedDiagramFormats();
    const invalidFormats = variables.availableFormats.filter(format => 
      !supportedFormats.includes(format)
    );

    if (invalidFormats.length > 0) {
      errors.push(`Unsupported formats: ${invalidFormats.join(', ')}`);
    }

    return errors;
  }
} 