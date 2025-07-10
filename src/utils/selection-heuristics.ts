import { DiagramFormat, FormatSelectionHeuristic } from '../types/diagram-selection.js';

/**
 * Decision heuristics based on keywords and patterns in user requests
 */
export const FORMAT_SELECTION_HEURISTICS: FormatSelectionHeuristic[] = [
  // Mermaid heuristics
  {
    keywords: ['flow', 'sequence', 'workflow', 'process', 'step', 'user journey', 'timeline', 'state machine', 'authentication'],
    format: 'mermaid',
    confidence: 0.9,
    reasoning: 'Mermaid excels at flowcharts, sequence diagrams, and process visualization with simple syntax'
  },
  {
    keywords: ['api', 'request', 'response', 'interaction', 'call', 'sequence'],
    format: 'mermaid',
    confidence: 0.85,
    reasoning: 'Sequence diagrams are one of Mermaid\'s strongest features for API interactions'
  },
  {
    keywords: ['git', 'branch', 'merge', 'commit', 'version control'],
    format: 'mermaid',
    confidence: 0.8,
    reasoning: 'Mermaid is well-suited for Git workflow visualization'
  },
  
  // PlantUML heuristics
  {
    keywords: ['class', 'uml', 'component', 'architecture', 'inheritance', 'relationship'],
    format: 'plantuml',
    confidence: 0.95,
    reasoning: 'PlantUML is the premier choice for comprehensive UML diagrams and software architecture'
  },
  {
    keywords: ['use case', 'actor', 'scenario', 'requirements'],
    format: 'plantuml',
    confidence: 0.9,
    reasoning: 'PlantUML provides excellent support for use case diagrams and requirements modeling'
  },
  {
    keywords: ['activity', 'business process', 'workflow', 'swimlane'],
    format: 'plantuml',
    confidence: 0.8,
    reasoning: 'PlantUML offers sophisticated activity diagrams with swimlane support'
  },
  {
    keywords: ['deployment', 'infrastructure', 'server', 'node', 'artifact'],
    format: 'plantuml',
    confidence: 0.85,
    reasoning: 'PlantUML deployment diagrams are ideal for infrastructure visualization'
  },
  
  // D2 heuristics
  {
    keywords: ['system', 'architecture', 'service', 'microservice', 'distributed', 'cloud'],
    format: 'd2',
    confidence: 0.9,
    reasoning: 'D2 specializes in modern system architecture and cloud infrastructure diagrams'
  },
  {
    keywords: ['mesh', 'network', 'topology', 'infrastructure', 'kubernetes', 'container'],
    format: 'd2',
    confidence: 0.85,
    reasoning: 'D2 provides excellent support for modern infrastructure and container orchestration'
  },
  {
    keywords: ['technical', 'overview', 'platform', 'ecosystem'],
    format: 'd2',
    confidence: 0.8,
    reasoning: 'D2\'s declarative approach is perfect for high-level technical overviews'
  },
  
  // GraphViz heuristics
  {
    keywords: ['dependency', 'graph', 'tree', 'hierarchy', 'network', 'relationship'],
    format: 'graphviz',
    confidence: 0.9,
    reasoning: 'GraphViz is the gold standard for complex graph visualizations and hierarchies'
  },
  {
    keywords: ['call graph', 'control flow', 'data structure', 'ast', 'syntax tree'],
    format: 'graphviz',
    confidence: 0.95,
    reasoning: 'GraphViz excels at representing complex algorithmic and data structures'
  },
  {
    keywords: ['package', 'module', 'import', 'export', 'reference'],
    format: 'graphviz',
    confidence: 0.85,
    reasoning: 'GraphViz is ideal for visualizing package dependencies and module relationships'
  },
  {
    keywords: ['organization', 'org chart', 'reporting', 'management'],
    format: 'graphviz',
    confidence: 0.8,
    reasoning: 'GraphViz provides precise layout control for organizational hierarchies'
  },
  
  // ERD heuristics
  {
    keywords: ['database', 'schema', 'table', 'entity', 'relationship', 'erd'],
    format: 'erd',
    confidence: 0.95,
    reasoning: 'ERD is specifically designed for database schema and entity relationship modeling'
  },
  {
    keywords: ['data model', 'sql', 'primary key', 'foreign key', 'cardinality'],
    format: 'erd',
    confidence: 0.9,
    reasoning: 'ERD provides specialized features for database design and normalization'
  },
  {
    keywords: ['e-commerce', 'user management', 'blog', 'cms', 'inventory'],
    format: 'erd',
    confidence: 0.7,
    reasoning: 'These domains often require database schema design best served by ERD'
  }
];

/**
 * Analyze user request and provide format recommendations
 */
export class FormatSelectionAnalyzer {
  /**
   * Analyze user request and return scored recommendations
   */
  analyzeRequest(userRequest: string, availableFormats?: DiagramFormat[]): FormatSelectionHeuristic[] {
    const lowercaseRequest = userRequest.toLowerCase();
    const matchedHeuristics: Array<FormatSelectionHeuristic & { matchCount: number }> = [];
    
    // Filter heuristics by available formats if specified
    const relevantHeuristics = availableFormats 
      ? FORMAT_SELECTION_HEURISTICS.filter(h => availableFormats.includes(h.format))
      : FORMAT_SELECTION_HEURISTICS;
    
    // Find matching heuristics and count keyword matches
    for (const heuristic of relevantHeuristics) {
      const matchingKeywords = heuristic.keywords.filter(keyword => 
        lowercaseRequest.includes(keyword.toLowerCase())
      );
      
      if (matchingKeywords.length > 0) {
        matchedHeuristics.push({
          ...heuristic,
          matchCount: matchingKeywords.length
        });
      }
    }
    
    // Calculate adjusted confidence scores based on match count and keyword specificity
    const scoredHeuristics = matchedHeuristics.map(heuristic => {
      const baseConfidence = heuristic.confidence;
      const matchBonus = Math.min(heuristic.matchCount * 0.1, 0.3); // Max 30% bonus
      const adjustedConfidence = Math.min(baseConfidence + matchBonus, 1.0);
      
      return {
        keywords: heuristic.keywords,
        format: heuristic.format,
        confidence: adjustedConfidence,
        reasoning: `${heuristic.reasoning} (${heuristic.matchCount} keyword matches)`
      };
    });
    
    // Sort by confidence and remove duplicates (keep highest confidence per format)
    const formatMap = new Map<DiagramFormat, FormatSelectionHeuristic>();
    
    scoredHeuristics
      .sort((a, b) => b.confidence - a.confidence)
      .forEach(heuristic => {
        if (!formatMap.has(heuristic.format) || 
            formatMap.get(heuristic.format)!.confidence < heuristic.confidence) {
          formatMap.set(heuristic.format, heuristic);
        }
      });
    
    return Array.from(formatMap.values()).sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get the top recommended format with reasoning
   */
  getTopRecommendation(userRequest: string, availableFormats?: DiagramFormat[]): FormatSelectionHeuristic | null {
    const recommendations = this.analyzeRequest(userRequest, availableFormats);
    return recommendations.length > 0 ? recommendations[0] ?? null : null;
  }
  
  /**
   * Check if user request contains specific format preferences
   */
  detectExplicitFormatPreference(userRequest: string): DiagramFormat | null {
    const lowercaseRequest = userRequest.toLowerCase();
    
    // Check for explicit format mentions
    if (lowercaseRequest.includes('mermaid')) return 'mermaid';
    if (lowercaseRequest.includes('plantuml') || lowercaseRequest.includes('plant uml')) return 'plantuml';
    if (lowercaseRequest.includes('d2')) return 'd2';
    if (lowercaseRequest.includes('graphviz') || lowercaseRequest.includes('dot')) return 'graphviz';
    if (lowercaseRequest.includes('erd') || lowercaseRequest.includes('entity relationship')) return 'erd';
    
    return null;
  }
} 