import { DiagramFormat, FormatInstructionTemplate } from '../types/diagram-instructions.js';

/**
 * MCP Resource Configuration for get_diagram_instructions
 */
export const DIAGRAM_INSTRUCTIONS_RESOURCE_CONFIG = {
  name: 'get_diagram_instructions',
  description: 'Provides format-specific instruction prompts to help LLMs generate syntactically correct diagram code',
  
  // Resource behavior documentation
  behavior: {
    input: {
      required: ['user_request', 'diagram_format'],
      validation: {
        user_request: {
          type: 'string',
          minLength: 5,
          maxLength: 2000,
          description: 'Must be a descriptive request for diagram creation'
        },
        diagram_format: {
          type: 'string',
          enum: ['mermaid', 'plantuml', 'd2', 'graphviz', 'erd'],
          description: 'Must be a supported diagram format'
        }
      }
    },
    
    output: {
      format: 'instruction_prompt',
      content: {
        prompt_text: {
          type: 'string',
          description: 'Ready-to-use instruction prompt for LLM diagram code generation'
        }
      }
    }
  },
  
  // Resource constraints
  constraints: {
    performance: {
      maxResponseTime: '50ms',
      description: 'Resource must respond within 50ms for optimal user experience'
    },
    
    reliability: {
      errorHandling: 'graceful_degradation',
      fallback: 'basic_template',
      description: 'Must handle invalid inputs gracefully and provide meaningful error messages'
    },
    
    compatibility: {
      mcpVersion: '>=1.0.0',
      nodeVersion: '>=18.0.0',
      description: 'Compatible with MCP specification 1.0+ and Node.js 18+'
    }
  },
  
  // Template configuration
  templates: {
    variableSubstitution: true,
    contextEnhancement: true,
    complexityDetection: true,
    errorPrevention: true
  }
};

/**
 * Format-specific instruction templates with comprehensive guidance
 */
export const FORMAT_INSTRUCTION_TEMPLATES: Record<DiagramFormat, FormatInstructionTemplate> = {
  mermaid: {
    format: 'mermaid',
    displayName: 'Mermaid',
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

  plantuml: {
    format: 'plantuml',
    displayName: 'PlantUML',
    syntaxGuidelines: [
      'Start with @startuml and end with @enduml',
      'Use skinparam for global styling: skinparam packageBackgroundColor LightYellow',
      'AVOID !theme directive - it may cause compatibility issues with some Kroki versions',
      'Use only safe, standard colors: White, LightGray, LightBlue, LightGreen, LightYellow, LightSalmon, LightCyan, LightPink',
      'Class diagrams: class ClassName { fields, methods }',
      'Sequence diagrams: Actor -> Object : message',
      'Component diagrams: [Component] as alias - use simple names without special characters',
      'Package styling: package "Name" #LightBlue { ... }',
      'Use -- for associations, --> for dependencies',
      'Comments start with \' or //',
      'Keep component names simple: [UserService] not [/_complex-name_/]',
      'AVOID !define - use skinparam or inline colors instead'
    ],
    bestPractices: [
      'Use meaningful but simple names for classes and components',
      'Group related elements with packages, but avoid excessive nesting (max 3 levels)',
      'Use standard stereotypes: <<interface>>, <<abstract>>, <<entity>>',
      'Apply colors directly: package "Name" #LightYellow { ... }',
      'Use skinparam for consistent global styling',
      'Use notes to add important documentation, but keep them concise',
      'Keep diagrams focused on specific aspects - split complex diagrams into multiple simpler ones',
      'Use proper UML relationship types',
      'Prefer standard PlantUML colors over custom color names',
      'Test with simple diagrams first, then add complexity gradually',
      'Use aliases for long component names: [VeryLongComponentName] as VLC'
    ],
    commonPitfalls: [
      'DO NOT forget @startuml/@enduml tags',
      'DO NOT use !define for colors - use skinparam or inline colors',
      'DO NOT use !theme directive - it may cause compatibility issues with Kroki',
      'DO NOT use custom colors in stereotypes like <<CUSTOMCOLOR>>',
      'DO NOT mix diagram types in single diagram',
      'DO NOT use invalid UML relationship syntax',
      'DO NOT create overly complex single diagrams - split into multiple diagrams',
      'DO NOT use spaces in entity names without quotes',
      'DO NOT use <<COLORNAME>> as stereotypes - use standard UML stereotypes only',
      'DO NOT use special characters in component names like [/_index] - use [Index] instead',
      'DO NOT nest packages more than 3 levels deep',
      'DO NOT use obscure color names - stick to standard ones: LightBlue, LightGreen, etc.',
      'DO NOT create diagrams with more than 20-30 components without grouping',
      'DO NOT use complex skinparam combinations that might not be supported',
      'DO NOT mix too many different background colors in a single diagram'
    ],
    examplePatterns: [
      '@startuml\nskinparam packageBackgroundColor LightYellow\nclass User {\n  +name: String\n  +login()\n}\nUser --> Order\n@enduml',
      '@startuml\nactor User\nUser -> System : authenticate\nSystem --> User : token\n@enduml',
      '@startuml\npackage "Core" #LightBlue {\n  [UserService] as US\n  [AuthService] as AS\n}\nUS --> AS\n@enduml',
      '@startuml\nskinparam componentBackgroundColor LightGreen\npackage "Frontend" #LightCyan {\n  [WebUI] <<interface>>\n  [Router]\n}\npackage "Backend" #LightYellow {\n  [API]\n  [Database]\n}\n[WebUI] --> [API]\n@enduml',
      '@startuml\ntitle Simple Component Architecture\nskinparam packageBackgroundColor LightGray\npackage "Application Layer" {\n  [Controller]\n  [Service]\n}\npackage "Data Layer" {\n  [Repository]\n}\n[Controller] --> [Service]\n[Service] --> [Repository]\n@enduml'
    ],
    outputSpecifications: [
      'Output ONLY the PlantUML code without markdown wrapper',
      'Always include @startuml at the beginning',
      'Always include @enduml at the end',
      'Use skinparam for styling, not !define or !theme',
      'Use inline package colors: package "Name" #Color { ... }',
      'Use only standard UML stereotypes in << >>',
      'Use proper UML syntax and relationships',
      'Ensure all referenced entities are defined',
      'Keep component names simple without special characters',
      'Use standard colors: LightBlue, LightGreen, LightYellow, LightGray, LightCyan, LightPink, LightSalmon',
      'Avoid excessive nesting - maximum 3 package levels',
      'If diagram becomes too complex, suggest splitting into multiple simpler diagrams',
      'Use aliases for long names: [LongComponentName] as LCN',
      'Test compatibility - start simple and add complexity gradually'
    ]
  },

  d2: {
    format: 'd2',
    displayName: 'D2',
    syntaxGuidelines: [
      'Use simple object.property syntax for definitions',
      'Connect objects with arrows: A -> B',
      'Add labels with quotes: A -> B: "connection label"',
      'Use {} for nested structures and styling',
      'Define shapes: A.shape: rectangle, circle, diamond, cloud, text, cylinder, person',
      'Add styles with hex colors: A.style.fill: "#3B82F6"',
      'For titles, create objects: title: "My Title" { style.font-size: 20 }',
      'Comments start with #'
    ],
    bestPractices: [
      'Use hierarchical naming for complex systems',
      'Group related components with container objects',
      'Apply consistent hex color styling themes',
      'Use meaningful connection labels',
      'Leverage D2\'s automatic layout capabilities',
      'Keep object names descriptive but concise',
      'Create title objects instead of using title: syntax'
    ],
    commonPitfalls: [
      'DO NOT use spaces in object names without quotes',
      'DO NOT use CSS color names - use hex colors like "#FF5733"',
      'DO NOT use title: syntax - create title objects instead',
      'DO NOT use shape names like "square" or "package" - use valid D2 shapes',
      'DO NOT create overly deep nesting',
      'DO NOT mix arrow styles inconsistently',
      'DO NOT use invalid shape names like "square" (use "rectangle")'
    ],
    examplePatterns: [
      'frontend -> backend: "API calls"\nbackend -> database: "queries"\ndatabase.shape: cylinder\ndatabase.style.fill: "#E5E7EB"',
      'title: "System Overview" {\n  style.font-size: 20\n}\nusers.shape: person\nusers -> system: "interact"\nsystem.style.fill: "#3B82F6"',
      'network: {\n  router -> switch\n  switch -> servers\n  style.fill: "#F3F4F6"\n}\nservers.shape: rectangle'
    ],
    outputSpecifications: [
      'Output ONLY the D2 code without markdown wrapper',
      'Use clean, declarative syntax',
      'Define all objects before referencing them',
      'Use only hex colors for styling (e.g., "#FF5733", not "red")',
      'Use valid D2 shape names only',
      'Create title objects instead of using title: syntax',
      'Ensure proper nesting structure'
    ]
  },

  graphviz: {
    format: 'graphviz',
    displayName: 'GraphViz (DOT)',
    syntaxGuidelines: [
      'Start with digraph name { and end with }',
      'Define nodes: nodeid [label="Label", shape=box]',
      'Connect nodes: A -> B [label="edge label"]',
      'Use rankdir for layout direction: rankdir=LR',
      'Subgraphs: subgraph cluster_name { ... }',
      'Node shapes: box, circle, diamond, ellipse',
      'Comments start with //'
    ],
    bestPractices: [
      'Use consistent node and edge styling',
      'Group related nodes in subgraphs',
      'Choose appropriate layout direction',
      'Use meaningful node labels',
      'Apply proper ranking for hierarchies',
      'Keep color schemes professional'
    ],
    commonPitfalls: [
      'DO NOT forget opening/closing braces',
      'DO NOT mix directed and undirected edges randomly',
      'DO NOT use invalid shape names',
      'DO NOT create overly complex layouts',
      'DO NOT ignore proper DOT syntax rules',
      'DO NOT use spaces in node IDs without quotes'
    ],
    examplePatterns: [
      'digraph G {\n  rankdir=LR;\n  A [label="Start"];\n  A -> B -> C;\n}',
      'digraph arch {\n  subgraph cluster_0 {\n    label="Frontend";\n    UI;\n  }\n  UI -> API;\n}',
      'digraph deps {\n  node [shape=box];\n  ModuleA -> ModuleB;\n  ModuleB -> ModuleC;\n}'
    ],
    outputSpecifications: [
      'Output ONLY the DOT code without markdown wrapper',
      'Always include digraph declaration and closing brace',
      'Use proper DOT syntax throughout',
      'Define node attributes before connections when needed',
      'Ensure all referenced nodes are properly declared'
    ]
  },

  erd: {
    format: 'erd',
    displayName: 'Entity Relationship Diagram',
    syntaxGuidelines: [
      'Define entities with attributes: User { id, name, email }',
      'Show relationships with cardinality: User ||--o{ Order',
      'Use proper ERD notation for relationships',
      'Define primary keys: id PK',
      'Define foreign keys: user_id FK',
      'Add indexes when relevant: email "unique"',
      'Use meaningful entity and attribute names'
    ],
    bestPractices: [
      'Use clear, descriptive entity names',
      'Define all primary and foreign keys',
      'Show relationship cardinalities accurately',
      'Group related entities visually',
      'Use standard ERD notation',
      'Include important attributes only'
    ],
    commonPitfalls: [
      'DO NOT mix ERD notation styles',
      'DO NOT omit cardinality specifications',
      'DO NOT create many-to-many without junction tables',
      'DO NOT use technical column types unless necessary',
      'DO NOT ignore foreign key relationships',
      'DO NOT overcomplicate with too many attributes'
    ],
    examplePatterns: [
      'User {\n  id PK\n  email "unique"\n  name\n}\nUser ||--o{ Order',
      'Customer ||--o{ Order {\n  id PK\n  customer_id FK\n  order_date\n}',
      'Product }o--|| Category\nProduct {\n  id PK\n  name\n  category_id FK\n}'
    ],
    outputSpecifications: [
      'Output ONLY the ERD code without markdown wrapper',
      'Use consistent relationship notation',
      'Define all entities with their attributes',
      'Show all relevant relationships',
      'Use proper cardinality symbols'
    ]
  }
}; 