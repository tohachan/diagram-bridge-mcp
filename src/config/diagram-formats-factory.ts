/**
 * Factory for creating diagram format configurations
 * Centralizes format definition and provides consistent default configurations
 */

import type { DiagramFormatConfig, DiagramFormatsRegistry } from './diagram-formats-config.js';
import type { OutputFormat } from '../types/diagram-rendering.js';

/**
 * Factory for creating diagram format configurations
 */
export class DiagramFormatsFactory {
  
  /**
   * Create default formats registry with all supported formats
   */
  static createDefaultRegistry(): DiagramFormatsRegistry {
    return {
      formats: {
        mermaid: this.createMermaidConfig(),
        plantuml: this.createPlantUMLConfig(),
        d2: this.createD2Config(),
        graphviz: this.createGraphvizConfig(),
        erd: this.createERDConfig()
      },
      defaultFormat: 'mermaid',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Create Mermaid format configuration
   */
  private static createMermaidConfig(): DiagramFormatConfig {
    return {
      id: 'mermaid',
      displayName: 'Mermaid',
      description: 'JavaScript-based diagramming and charting tool with simple syntax',
      krokiFormat: 'mermaid',
      supportedOutputs: ['png', 'svg'],
      enabled: true,
      characteristics: {
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
      instructionTemplate: {
        syntaxGuidelines: [
          'Start with diagram type declaration (flowchart TD, sequenceDiagram, etc.)',
          'Use descriptive node IDs without spaces (use underscores or camelCase)',
          'Connect nodes with arrows: A --> B (flowchart), A->>B (sequence)',
          'Use brackets for node shapes: A[Rectangle], B(Rounded), C{Diamond}',
          'Add labels with quotes: A["User Login"]',
          'Use %% for comments',
          'Subgraphs: subgraph title ... end'
        ],
        bestPractices: [
          'Keep node IDs short but meaningful',
          'Use consistent arrow styles within same diagram',
          'Group related elements in subgraphs for clarity',
          'Add descriptive labels to improve readability',
          'Use appropriate diagram type for the content',
          'Avoid deeply nested structures in flowcharts'
        ],
        commonPitfalls: [
          'DO NOT use spaces in node IDs',
          'DO NOT mix arrow types randomly',
          'DO NOT create cycles in flowcharts without clear purpose',
          'DO NOT use special characters in node IDs',
          'DO NOT forget semicolons at line ends when needed',
          'DO NOT use markdown syntax inside node labels'
        ],
        examplePatterns: [
          'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[Alternative]',
          'sequenceDiagram\n    participant U as User\n    participant S as Server\n    U->>S: Request\n    S-->>U: Response',
          'journey\n    title User Journey\n    section Planning\n      Research: 5: User\n      Compare: 3: User'
        ],
        outputSpecifications: [
          'Output ONLY the Mermaid code without markdown code blocks',
          'Do not wrap in ```mermaid``` blocks',
          'Start directly with diagram type declaration',
          'End with proper syntax completion',
          'Ensure all nodes and connections are properly defined'
        ]
      },
      fileExtensions: ['.mmd', '.mermaid'],
      exampleCode: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]'
    };
  }

  /**
   * Create PlantUML format configuration
   */
  private static createPlantUMLConfig(): DiagramFormatConfig {
    return {
      id: 'plantuml',
      displayName: 'PlantUML',
      description: 'Comprehensive UML diagramming tool with extensive diagram type support',
      krokiFormat: 'plantuml',
      supportedOutputs: ['png', 'svg'],
      enabled: true,
      characteristics: {
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
      instructionTemplate: {
        syntaxGuidelines: [
          'Start with @startuml and end with @enduml',
          'Use proper UML syntax for each diagram type',
          'Define relationships with arrows: --> (dependency), -|> (inheritance)',
          'Use participant for sequence diagrams',
          'Class syntax: class ClassName { +method() }',
          'Packages: package "Package Name" { }'
        ],
        bestPractices: [
          'Use meaningful class and component names',
          'Group related elements in packages',
          'Include method signatures and field types',
          'Use proper UML stereotypes when applicable',
          'Add notes for clarification',
          'Use consistent naming conventions'
        ],
        commonPitfalls: [
          'DO NOT forget @startuml/@enduml wrapper',
          'DO NOT mix different diagram types in one diagram',
          'DO NOT use invalid UML syntax',
          'DO NOT create overly complex single diagrams',
          'DO NOT ignore relationship directions'
        ],
        examplePatterns: [
          '@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml',
          '@startuml\nUser --> Database : queries\nDatabase --> User : results\n@enduml',
          '@startuml\npackage "Web Layer" {\n  [Controller]\n}\n@enduml'
        ],
        outputSpecifications: [
          'Output ONLY the PlantUML code without markdown code blocks',
          'Always wrap in @startuml/@enduml',
          'Use proper UML syntax for the diagram type',
          'Include all necessary declarations and relationships'
        ]
      },
      fileExtensions: ['.puml', '.plantuml'],
      exampleCode: '@startuml\nclass User {\n  +name: String\n  +login()\n}\n@enduml'
    };
  }

  /**
   * Create D2 format configuration
   */
  private static createD2Config(): DiagramFormatConfig {
    return {
      id: 'd2',
      displayName: 'D2',
      description: 'Modern diagram scripting language that turns text to diagrams',
      krokiFormat: 'd2',
      supportedOutputs: ['svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'Declarative syntax',
          'Automatic layout',
          'Modern styling capabilities',
          'Great for system architecture',
          'Hierarchical structure support'
        ],
        weaknesses: [
          'Limited output format support (SVG only)',
          'Newer format with smaller community',
          'Learning curve for syntax'
        ],
        bestFor: [
          'System architecture diagrams',
          'Infrastructure layouts',
          'Data flow diagrams',
          'Network topologies',
          'Hierarchical representations'
        ],
        examples: [
          'Microservices architecture',
          'Cloud infrastructure',
          'Data pipelines',
          'Network diagrams'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Use hierarchical dot notation: users.frontend',
          'Connect with arrows: users -> database',
          'Add styling: shape: rectangle, style.fill: color',
          'Use containers: { } for grouping',
          'Labels with quotes: "User Interface"',
          'Comments with # symbol'
        ],
        bestPractices: [
          'Use consistent hierarchical naming',
          'Group related components in containers',
          'Apply consistent styling for component types',
          'Use meaningful connection labels',
          'Organize complex diagrams with clear structure'
        ],
        commonPitfalls: [
          'DO NOT mix naming conventions',
          'DO NOT create overly deep hierarchies',
          'DO NOT forget to close containers with }',
          'DO NOT use reserved keywords as identifiers'
        ],
        examplePatterns: [
          'users -> database: query\ndatabase -> users: results',
          'api: {\n  shape: rectangle\n  style.fill: lightblue\n}',
          'frontend -> api -> database'
        ],
        outputSpecifications: [
          'Output ONLY the D2 code without markdown code blocks',
          'Use proper D2 syntax',
          'Include necessary styling and structure',
          'Ensure all connections are properly defined'
        ]
      },
      fileExtensions: ['.d2'],
      exampleCode: 'users -> database: query\ndatabase -> users: results\napi: {\n  shape: rectangle\n  style.fill: lightblue\n}'
    };
  }

  /**
   * Create Graphviz format configuration
   */
  private static createGraphvizConfig(): DiagramFormatConfig {
    return {
      id: 'graphviz',
      displayName: 'GraphViz',
      description: 'Open source graph visualization software with DOT language',
      krokiFormat: 'graphviz',
      supportedOutputs: ['png', 'svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'Precise layout control',
          'Mathematical precision',
          'Excellent for complex graphs',
          'Wide range of layout algorithms',
          'Mature and stable'
        ],
        weaknesses: [
          'Complex syntax',
          'Steep learning curve',
          'Less intuitive for simple diagrams'
        ],
        bestFor: [
          'Dependency graphs',
          'Network topologies',
          'State machines',
          'Call graphs',
          'Mathematical graphs'
        ],
        examples: [
          'Module dependencies',
          'Process flows',
          'Network connections',
          'Decision trees'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Start with digraph G { for directed graphs',
          'Use A -> B; for directed edges',
          'Node attributes: A [label="Node A", shape=box];',
          'Edge attributes: A -> B [label="edge"];',
          'Subgraphs: subgraph cluster_name { }',
          'End with closing brace }'
        ],
        bestPractices: [
          'Use meaningful node names',
          'Group related nodes in subgraphs',
          'Apply consistent styling',
          'Use appropriate layout algorithm',
          'Add labels for clarity'
        ],
        commonPitfalls: [
          'DO NOT forget semicolons after statements',
          'DO NOT mix directed and undirected syntax',
          'DO NOT create circular dependencies without purpose',
          'DO NOT forget closing braces'
        ],
        examplePatterns: [
          'digraph G {\n  A -> B;\n  B -> C;\n  A -> C;\n}',
          'digraph G {\n  A [shape=box, label="Start"];\n  A -> B;\n}'
        ],
        outputSpecifications: [
          'Output ONLY the GraphViz DOT code without markdown code blocks',
          'Use proper DOT syntax',
          'Include all necessary declarations',
          'Ensure proper graph structure'
        ]
      },
      fileExtensions: ['.dot', '.gv'],
      exampleCode: 'digraph G {\n  A -> B;\n  B -> C;\n  A -> C;\n}'
    };
  }

  /**
   * Create ERD format configuration
   */
  private static createERDConfig(): DiagramFormatConfig {
    return {
      id: 'erd',
      displayName: 'ERD',
      description: 'Entity-Relationship Diagrams for database design',
      krokiFormat: 'erd',
      supportedOutputs: ['png', 'svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'Database-specific features',
          'Clear entity relationships',
          'Cardinality specifications',
          'Primary/foreign key support',
          'Clean visual output'
        ],
        weaknesses: [
          'Limited to database schemas',
          'Less flexible than general diagramming tools',
          'Specific syntax requirements'
        ],
        bestFor: [
          'Database schema design',
          'Entity relationship modeling',
          'Data model documentation',
          'Database planning',
          'Schema visualization'
        ],
        examples: [
          'E-commerce database schema',
          'User management system',
          'Blog platform data model',
          'Inventory management schema'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Define entities: [EntityName]',
          'Primary keys: *id {label: "int, primary key"}',
          'Foreign keys: customer_id {label: "int, foreign key"}',
          'Attributes: name {label: "varchar, not null"}',
          'Relationships defined by proximity and naming',
          'Use meaningful entity and attribute names'
        ],
        bestPractices: [
          'Use clear entity names',
          'Define all primary keys',
          'Specify data types for attributes',
          'Include constraints (not null, unique)',
          'Use consistent naming conventions'
        ],
        commonPitfalls: [
          'DO NOT forget primary key definitions',
          'DO NOT use ambiguous entity names',
          'DO NOT omit important relationships',
          'DO NOT ignore data type specifications'
        ],
        examplePatterns: [
          '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}',
          '[Order]\n*id {label: "int, primary key"}\nuser_id {label: "int, foreign key"}'
        ],
        outputSpecifications: [
          'Output ONLY the ERD code without markdown code blocks',
          'Include all entities and relationships',
          'Specify primary and foreign keys',
          'Include data types and constraints'
        ]
      },
      fileExtensions: ['.er', '.erd'],
      exampleCode: '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}'
    };
  }

  /**
   * Get all supported format IDs
   */
  static getSupportedFormatIds(): string[] {
    return ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'];
  }

  /**
   * Create a custom format configuration
   */
  static createCustomFormat(
    id: string,
    displayName: string,
    config: Partial<DiagramFormatConfig>
  ): DiagramFormatConfig {
    return {
      id,
      displayName,
      description: config.description || `${displayName} diagram format`,
      krokiFormat: config.krokiFormat || id,
      supportedOutputs: config.supportedOutputs || ['png'],
      enabled: config.enabled ?? true,
      characteristics: config.characteristics || {
        strengths: [],
        weaknesses: [],
        bestFor: [],
        examples: []
      },
      instructionTemplate: config.instructionTemplate || {
        syntaxGuidelines: [],
        bestPractices: [],
        commonPitfalls: [],
        examplePatterns: [],
        outputSpecifications: []
      },
      fileExtensions: config.fileExtensions || [],
      exampleCode: config.exampleCode || ''
    };
  }
} 