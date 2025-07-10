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
      'Use skinparam for styling when needed',
      'Class diagrams: class ClassName { fields, methods }',
      'Sequence diagrams: Actor -> Object : message',
      'Component diagrams: [Component] as alias',
      'Use -- for associations, --> for dependencies',
      'Comments start with \' or //'
    ],
    bestPractices: [
      'Use meaningful names for classes and components',
      'Group related elements with packages',
      'Add stereotypes <<interface>>, <<abstract>> when appropriate',
      'Use notes to add important documentation',
      'Keep diagrams focused on specific aspects',
      'Use proper UML relationship types'
    ],
    commonPitfalls: [
      'DO NOT forget @startuml/@enduml tags',
      'DO NOT mix diagram types in single diagram',
      'DO NOT use invalid UML relationship syntax',
      'DO NOT create overly complex single diagrams',
      'DO NOT ignore proper UML stereotypes',
      'DO NOT use spaces in entity names without quotes'
    ],
    examplePatterns: [
      '@startuml\nclass User {\n  +name: String\n  +login()\n}\nUser --> Order\n@enduml',
      '@startuml\nactor User\nUser -> System : authenticate\nSystem --> User : token\n@enduml',
      '@startuml\npackage "Core" {\n  [UserService]\n  [AuthService]\n}\n@enduml'
    ],
    outputSpecifications: [
      'Output ONLY the PlantUML code without markdown wrapper',
      'Always include @startuml at the beginning',
      'Always include @enduml at the end',
      'Use proper UML syntax and relationships',
      'Ensure all referenced entities are defined'
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
      'Define shapes: A.shape: circle, square, diamond',
      'Add styles: A.style.fill: blue',
      'Comments start with #'
    ],
    bestPractices: [
      'Use hierarchical naming for complex systems',
      'Group related components logically',
      'Apply consistent styling themes',
      'Use meaningful connection labels',
      'Leverage D2\'s automatic layout capabilities',
      'Keep object names descriptive but concise'
    ],
    commonPitfalls: [
      'DO NOT use spaces in object names without quotes',
      'DO NOT create overly deep nesting',
      'DO NOT mix arrow styles inconsistently',
      'DO NOT overuse styling - focus on content first',
      'DO NOT ignore D2\'s layout suggestions',
      'DO NOT use invalid shape names'
    ],
    examplePatterns: [
      'frontend -> backend: "API calls"\nbackend -> database: "queries"\ndatabase.shape: cylinder',
      'users: {\n  shape: person\n}\nusers -> system: "interact"\nsystem.style.fill: lightblue',
      'network: {\n  router -> switch\n  switch -> servers\n}'
    ],
    outputSpecifications: [
      'Output ONLY the D2 code without markdown wrapper',
      'Use clean, declarative syntax',
      'Define all objects before referencing them',
      'Apply styles consistently',
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