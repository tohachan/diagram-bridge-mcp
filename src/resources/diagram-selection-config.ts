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
  },

  bpmn: {
    name: 'bpmn',
    displayName: 'BPMN',
    description: 'Business Process Model and Notation for standardized business process diagrams',
    strengths: [
      'Industry standard for business processes',
      'Comprehensive process modeling notation',
      'Swimlane and cross-functional support',
      'Event-driven process flows',
      'Standardized symbols and semantics'
    ],
    weaknesses: [
      'Complex notation for simple processes',
      'Requires understanding of BPMN standards',
      'Can be overwhelming for non-technical users'
    ],
    bestFor: [
      'Business process documentation',
      'Workflow automation planning',
      'Process optimization analysis',
      'Compliance and audit documentation',
      'Cross-functional process mapping'
    ],
    examples: [
      'Employee onboarding process',
      'Order fulfillment workflow',
      'Approval and review processes',
      'Error handling procedures'
    ]
  },

  'c4-plantuml': {
    name: 'c4-plantuml',
    displayName: 'C4-PlantUML',
    description: 'C4 model implementation using PlantUML for software architecture documentation',
    strengths: [
      'Structured architecture documentation',
      'Multiple abstraction levels (Context, Container, Component)',
      'Consistent architectural notation',
      'Software architecture best practices',
      'Hierarchical system representation'
    ],
    weaknesses: [
      'Specific to software architecture',
      'Requires understanding of C4 methodology',
      'PlantUML syntax complexity'
    ],
    bestFor: [
      'Software architecture documentation',
      'System context diagrams',
      'Container and component architecture',
      'Technical documentation standards',
      'Architecture decision records'
    ],
    examples: [
      'Microservices system overview',
      'Application architecture layers',
      'Integration architecture',
      'Component interaction diagrams'
    ]
  },

  structurizr: {
    name: 'structurizr',
    displayName: 'Structurizr',
    description: 'Architecture as code platform with comprehensive modeling capabilities',
    strengths: [
      'Architecture as code approach',
      'Multiple view support',
      'Comprehensive modeling language',
      'Version control integration',
      'Enterprise architecture support'
    ],
    weaknesses: [
      'Requires learning Structurizr DSL',
      'Complex for simple diagrams',
      'Enterprise-focused complexity'
    ],
    bestFor: [
      'Enterprise architecture documentation',
      'Architecture as code workflows',
      'Multi-view system architecture',
      'Large-scale system modeling',
      'Team collaboration on architecture'
    ],
    examples: [
      'Enterprise system landscapes',
      'Multi-level architecture views',
      'Deployment architecture',
      'System integration maps'
    ]
  },

  excalidraw: {
    name: 'excalidraw',
    displayName: 'Excalidraw',
    description: 'Hand-drawn style diagramming tool for sketches and informal diagrams',
    strengths: [
      'Informal, approachable visual style',
      'Quick sketching capabilities',
      'Collaborative whiteboarding',
      'Flexible and creative freedom',
      'Great for brainstorming'
    ],
    weaknesses: [
      'Less formal and structured',
      'Limited standardization',
      'Not suitable for official documentation'
    ],
    bestFor: [
      'Brainstorming and ideation',
      'Informal system sketches',
      'Collaborative whiteboarding',
      'Concept visualization',
      'Presentation and meeting diagrams'
    ],
    examples: [
      'Concept sketches',
      'Brainstorming diagrams',
      'Informal system overviews',
      'Meeting collaboration boards'
    ]
  },

  'vega-lite': {
    name: 'vega-lite',
    displayName: 'Vega-Lite',
    description: 'Grammar of interactive graphics for data visualization and charts',
    strengths: [
      'Powerful data visualization capabilities',
      'Interactive and dynamic charts',
      'Declarative visualization grammar',
      'Wide range of chart types',
      'Data-driven visual encoding'
    ],
    weaknesses: [
      'Requires understanding of data visualization principles',
      'JSON-based configuration complexity',
      'Limited to data visualization use cases'
    ],
    bestFor: [
      'Data visualization and analytics',
      'Interactive dashboards',
      'Statistical chart creation',
      'Business intelligence reporting',
      'Scientific data presentation'
    ],
    examples: [
      'Sales performance dashboards',
      'Statistical analysis charts',
      'Interactive data exploration',
      'Business metrics visualization'
    ]
  }
}; 