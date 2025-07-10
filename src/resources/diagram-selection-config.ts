import { DiagramFormat, DiagramFormatCharacteristics } from '../types/diagram-selection.js';

/**
 * MCP Resource Configuration for help_choose_diagram
 */
export const DIAGRAM_SELECTION_RESOURCE_CONFIG = {
  name: 'help_choose_diagram',
  description: 'Provides a structured prompt to help LLMs choose the most appropriate diagram format for a user request',
  
  // Resource behavior documentation
  behavior: {
    input: {
      required: ['user_request'],
      optional: ['available_formats'],
      validation: {
        user_request: {
          type: 'string',
          minLength: 5,
          maxLength: 1000,
          description: 'Must be a non-empty string describing the visualization need'
        },
        available_formats: {
          type: 'array',
          items: ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'],
          description: 'Optional subset of supported formats to consider'
        }
      }
    },
    
    output: {
      format: 'structured_prompt',
      content: {
        prompt_text: {
          type: 'string',
          description: 'Ready-to-use prompt for LLM diagram format selection'
        }
      }
    }
  },
  
  // Resource constraints
  constraints: {
    performance: {
      maxResponseTime: '100ms',
      description: 'Resource must respond within 100ms for optimal user experience'
    },
    
    reliability: {
      errorHandling: 'graceful_degradation',
      fallback: 'default_to_all_formats',
      description: 'Must handle invalid inputs gracefully and provide meaningful error messages'
    },
    
    compatibility: {
      mcpVersion: '>=1.0.0',
      nodeVersion: '>=18.0.0',
      description: 'Compatible with MCP specification 1.0+ and Node.js 18+'
    }
  },
  
  // Usage examples
  examples: [
    {
      input: {
        user_request: 'I need to show the authentication flow in my web application',
        available_formats: ['mermaid', 'plantuml']
      },
      expectedOutput: 'Structured prompt recommending format with reasoning'
    },
    {
      input: {
        user_request: 'Create a database schema diagram for an e-commerce system'
      },
      expectedOutput: 'Prompt considering all available formats with ERD emphasis'
    }
  ]
} as const;

/**
 * All supported diagram formats with their detailed characteristics
 */
export const DIAGRAM_FORMAT_DEFINITIONS: Record<DiagramFormat, DiagramFormatCharacteristics> = {
  mermaid: {
    name: 'mermaid',
    displayName: 'Mermaid',
    description: 'JavaScript-based diagramming and charting tool with simple syntax',
    strengths: [
      'Easy to learn and write',
      'Great for flowcharts and sequence diagrams',
      'Built-in support in many platforms (GitHub, GitLab)',
      'Live editing capabilities',
      'User journey diagrams'
    ],
    weaknesses: [
      'Limited customization options',
      'Not suitable for complex UML diagrams',
      'Less precise layout control'
    ],
    bestFor: [
      'Process flows and workflows',
      'Sequence diagrams for API interactions',
      'Git workflows and branching strategies',
      'User journey mapping',
      'Simple organizational charts'
    ],
    examples: [
      'User authentication flow',
      'API request sequence',
      'Decision tree processes',
      'State machines'
    ]
  },
  
  plantuml: {
    name: 'plantuml',
    displayName: 'PlantUML',
    description: 'Comprehensive UML diagramming tool with extensive diagram type support',
    strengths: [
      'Complete UML diagram support',
      'Class and component diagrams',
      'Activity and use case diagrams',
      'Deployment and timing diagrams',
      'Professional output quality'
    ],
    weaknesses: [
      'Steeper learning curve',
      'More verbose syntax',
      'Java dependency for rendering'
    ],
    bestFor: [
      'Software architecture documentation',
      'Class and component relationships',
      'Use case specifications',
      'Activity workflows',
      'System deployment diagrams'
    ],
    examples: [
      'Microservices architecture',
      'Class inheritance hierarchies',
      'Use case scenarios',
      'Component interactions'
    ]
  },
  
  d2: {
    name: 'd2',
    displayName: 'D2',
    description: 'Modern declarative language for system architecture and technical diagrams',
    strengths: [
      'Clean, declarative syntax',
      'Excellent for system architecture',
      'Automatic layout algorithms',
      'Modern visual styling',
      'Great for technical documentation'
    ],
    weaknesses: [
      'Newer tool with smaller community',
      'Limited third-party integrations',
      'Learning curve for advanced features'
    ],
    bestFor: [
      'System architecture diagrams',
      'Infrastructure layouts',
      'Service mesh visualizations',
      'Cloud architecture diagrams',
      'Technical system overviews'
    ],
    examples: [
      'Microservices architecture',
      'Cloud infrastructure',
      'Network topology',
      'Data flow systems'
    ]
  },
  
  graphviz: {
    name: 'graphviz',
    displayName: 'GraphViz (DOT)',
    description: 'Powerful graph visualization software with precise layout control',
    strengths: [
      'Precise layout algorithms',
      'Excellent for complex graphs',
      'Highly customizable',
      'Mathematical precision',
      'Multiple output formats'
    ],
    weaknesses: [
      'Complex syntax for beginners',
      'Requires understanding of graph theory',
      'Limited built-in styling options'
    ],
    bestFor: [
      'Complex network diagrams',
      'Dependency graphs',
      'Organizational hierarchies',
      'Data structure visualizations',
      'Call graphs and control flows'
    ],
    examples: [
      'Package dependency trees',
      'Call graph analysis',
      'Network topologies',
      'Abstract syntax trees'
    ]
  },
  
  erd: {
    name: 'erd',
    displayName: 'Entity Relationship Diagram',
    description: 'Specialized tool for database schema and entity relationship modeling',
    strengths: [
      'Database-specific features',
      'Entity relationship modeling',
      'Cardinality specifications',
      'Attribute definitions',
      'Schema documentation'
    ],
    weaknesses: [
      'Limited to database diagrams',
      'Not suitable for other diagram types',
      'Less flexible for general use'
    ],
    bestFor: [
      'Database schema design',
      'Entity relationship modeling',
      'Data model documentation',
      'Table relationship visualization',
      'Database normalization planning'
    ],
    examples: [
      'E-commerce database schema',
      'User management system tables',
      'Blog platform data model',
      'Inventory management schema'
    ]
  }
}; 