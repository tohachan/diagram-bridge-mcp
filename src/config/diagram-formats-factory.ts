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
        // Original formats
        mermaid: this.createMermaidConfig(),
        plantuml: this.createPlantUMLConfig(),
        d2: this.createD2Config(),
        graphviz: this.createGraphvizConfig(),
        erd: this.createERDConfig(),
        
        // New formats
        bpmn: this.createBPMNConfig(),
        'c4-plantuml': this.createC4PlantUMLConfig(),
        'c4plantuml': this.createC4PlantUMLAliasConfig(), // Alias for c4-plantuml (matches Kroki format)
        'c4': this.createC4ShortAliasConfig(), // Short alias for C4 model diagrams
        structurizr: this.createStructurizrConfig(),
        excalidraw: this.createExcalidrawConfig(),
        'vega-lite': this.createVegaLiteConfig()
      },
      defaultFormat: 'mermaid',
      lastUpdated: new Date().toISOString(),
      version: '2.0.0'
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
          'Wide variety of diagram types',
          'Live editing capabilities'
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
          'Newer format with smaller community'
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
          'Specific syntax requirements',
          'No explicit relationship notation like Mermaid'
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
          'Relationships are expressed through foreign key references',
          'Use meaningful entity and attribute names'
        ],
        bestPractices: [
          'Use clear entity names',
          'Define all primary keys',
          'Specify data types for attributes',
          'Include constraints (not null, unique)',
          'Use consistent naming conventions',
          'Express relationships through foreign key attributes'
        ],
        commonPitfalls: [
          'DO NOT forget primary key definitions',
          'DO NOT use ambiguous entity names',
          'DO NOT omit important relationships',
          'DO NOT ignore data type specifications',
          'DO NOT use explicit relationship lines - use foreign key references instead'
        ],
        examplePatterns: [
          '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}',
          '[Order]\n*id {label: "int, primary key"}\nuser_id {label: "int, foreign key"}\ncreated_at {label: "timestamp"}',
          '[Product]\n*id {label: "int, primary key"}\ncategory_id {label: "int, foreign key"}\nname {label: "varchar, not null"}'
        ],
        outputSpecifications: [
          'Output ONLY the ERD code without markdown code blocks',
          'Include all entities and relationships',
          'Specify primary and foreign keys',
          'Include data types and constraints',
          'Use simple entity definitions with square brackets [EntityName]',
          'Express relationships through foreign key attributes only'
        ]
      },
      fileExtensions: ['.er', '.erd'],
      exampleCode: '[User]\n*id {label: "int, primary key"}\nname {label: "varchar, not null"}\nemail {label: "varchar, unique"}\n\n[Post]\n*id {label: "int, primary key"}\nuser_id {label: "int, foreign key"}\ntitle {label: "varchar, not null"}\ncontent {label: "text"}'
    };
  }

  /**
   * Create BPMN format configuration
   */
  private static createBPMNConfig(): DiagramFormatConfig {
    return {
      id: 'bpmn',
      displayName: 'BPMN',
      description: 'Business Process Model and Notation for modeling business processes',
      krokiFormat: 'bpmn',
      supportedOutputs: ['svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'Standard notation for business processes',
          'Widely recognized in business analysis',
          'Rich set of symbols and constructs',
          'Supports complex process flows',
          'Integration with business tools'
        ],
        weaknesses: [
          'Complex syntax for beginners',
          'Requires understanding of BPMN notation',
          'Limited to process modeling',
          'Only supports SVG output format (no PNG)'
        ],
        bestFor: [
          'Business process documentation',
          'Workflow automation design',
          'Process analysis and optimization',
          'Compliance documentation',
          'Cross-functional process mapping'
        ],
        examples: [
          'Customer onboarding process',
          'Order fulfillment workflow',
          'Approval processes',
          'Error handling procedures'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Use proper BPMN 2.0 XML format with ALL required namespaces',
          'Start with XML declaration: <?xml version="1.0" encoding="UTF-8"?>',
          'Include ALL namespaces: bpmn, bpmndi, dc, di with proper URLs',
          'Add targetNamespace="http://bpmn.io/schema/bpmn" and id="Definitions_1"',
          'Create bpmn:process element with isExecutable="false"',
          'Use standard BPMN elements: startEvent, task, exclusiveGateway, endEvent',
          'Connect elements with sequenceFlow using sourceRef/targetRef attributes',
          'MANDATORY: Include bpmndi:BPMNDiagram section with visual information',
          'Add bpmndi:BPMNShape for each element with dc:Bounds coordinates',
          'Add bpmndi:BPMNEdge for each flow with di:waypoint coordinates',
          'DO NOT use XML comments <!-- --> - they cause parsing errors'
        ],
        bestPractices: [
          'Use clear, descriptive names for tasks and events',
          'Ensure all elements have unique IDs',
          'Use proper BPMN 2.0 element structure',
          'Connect elements with sequenceFlow using sourceRef/targetRef',
          'Include both process logic and visual diagram sections',
          'Use appropriate BPMN elements for process steps'
        ],
        commonPitfalls: [
          'DO NOT request PNG format - BPMN only supports SVG output',
          'DO NOT forget to connect elements with sequenceFlow',
          'DO NOT use special characters in element IDs',
          'DO NOT create processes without start/end events',
          'DO NOT use XML comments <!-- --> - they break parsing',
          'DO NOT omit required XML namespaces and structure'
        ],
        examplePatterns: [
          '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n  <bpmn:process id="Process_1" isExecutable="false">\n    <bpmn:startEvent id="StartEvent_1" name="Start"/>\n    <bpmn:task id="Task_1" name="Process Request"/>\n    <bpmn:endEvent id="EndEvent_1" name="End"/>\n    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>\n    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1"/>\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">\n        <dc:Bounds x="152" y="82" width="36" height="36"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">\n        <dc:Bounds x="240" y="60" width="100" height="80"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">\n        <dc:Bounds x="392" y="82" width="36" height="36"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">\n        <di:waypoint x="188" y="100"/>\n        <di:waypoint x="240" y="100"/>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">\n        <di:waypoint x="340" y="100"/>\n        <di:waypoint x="392" y="100"/>\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>'
        ],
        outputSpecifications: [
          'CRITICAL: BPMN only supports SVG output format - do not request PNG',
          'Output ONLY valid BPMN 2.0 XML without markdown wrapper',
          'Always include XML declaration with UTF-8 encoding',
          'Include ALL four namespaces: bpmn, bpmndi, dc, di',
          'Add targetNamespace and id attributes to definitions',
          'Create single bpmn:process with isExecutable="false"',
          'MANDATORY: Include complete bpmndi:BPMNDiagram section',
          'Add bpmndi:BPMNShape for every element with dc:Bounds',
          'Add bpmndi:BPMNEdge for every flow with di:waypoint',
          'Use proper coordinate positioning for visual layout'
        ]
      },
      fileExtensions: ['.bpmn', '.bpmn2'],
      exampleCode: '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n  <bpmn:process id="Process_1" isExecutable="false">\n    <bpmn:startEvent id="start" name="Start"/>\n    <bpmn:task id="task" name="Process Request"/>\n    <bpmn:endEvent id="end" name="End"/>\n    <bpmn:sequenceFlow id="flow1" sourceRef="start" targetRef="task"/>\n    <bpmn:sequenceFlow id="flow2" sourceRef="task" targetRef="end"/>\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n      <bpmndi:BPMNShape id="start_di" bpmnElement="start">\n        <dc:Bounds x="152" y="82" width="36" height="36"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="task_di" bpmnElement="task">\n        <dc:Bounds x="240" y="60" width="100" height="80"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="end_di" bpmnElement="end">\n        <dc:Bounds x="392" y="82" width="36" height="36"/>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id="flow1_di" bpmnElement="flow1">\n        <di:waypoint x="188" y="100"/>\n        <di:waypoint x="240" y="100"/>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id="flow2_di" bpmnElement="flow2">\n        <di:waypoint x="340" y="100"/>\n        <di:waypoint x="392" y="100"/>\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>'
    };
  }

  /**
   * Create C4-PlantUML format configuration
   */
  private static createC4PlantUMLConfig(): DiagramFormatConfig {
    return {
      id: 'c4-plantuml',
      displayName: 'C4 with PlantUML',
      description: 'C4 model diagrams using PlantUML with C4 standard library',
      krokiFormat: 'c4plantuml',
      supportedOutputs: ['png', 'svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'Standardized software architecture modeling',
          'Multiple abstraction levels (Context, Container, Component, Code)',
          'Clear separation of concerns',
          'Well-defined notation and semantics',
          'Integration with PlantUML ecosystem'
        ],
        weaknesses: [
          'Requires understanding of C4 methodology',
          'PlantUML syntax complexity',
          'Limited to software architecture'
        ],
        bestFor: [
          'Software system architecture documentation',
          'System context diagrams',
          'Container and component diagrams',
          'Technical documentation',
          'Architecture decision records'
        ],
        examples: [
          'Microservices architecture overview',
          'System integration context',
          'Application component structure',
          'Deployment architecture'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Include C4 standard library: !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml',
          'Use C4 macros: Person(), System(), Container(), Component()',
          'Define relationships with Rel() and BiRel() macros',
          'Structure with @startuml/@enduml blocks',
          'Use appropriate C4 diagram types'
        ],
        bestPractices: [
          'Start with context diagram, then drill down',
          'Use consistent naming conventions',
          'Include descriptions in elements',
          'Group related elements with boundaries',
          'Use standard C4 colors and styling'
        ],
        commonPitfalls: [
          'DO NOT forget to include C4 library',
          'DO NOT mix C4 abstraction levels',
          'DO NOT use PlantUML syntax without C4 macros',
          'DO NOT create overly complex single diagrams',
          'DO NOT ignore C4 methodology principles'
        ],
        examplePatterns: [
          '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\n\nPerson(user, "User")\nSystem(system, "System", "Description")\n\nRel(user, system, "Uses")\n@enduml'
        ],
        outputSpecifications: [
          'Output ONLY the C4-PlantUML code',
          'Always include C4 library reference',
          'Use proper C4 macros and syntax',
          'Include @startuml/@enduml wrapper'
        ]
      },
      fileExtensions: ['.c4', '.puml'],
      exampleCode: '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\n\nPerson(user, "User")\nSystem(webapp, "Web Application")\nRel(user, webapp, "Uses")\n@enduml'
    };
  }

  /**
   * Create C4 PlantUML alias configuration (for c4plantuml format)
   * This is an alias that uses the same config as c4-plantuml but with different ID
   */
  private static createC4PlantUMLAliasConfig(): DiagramFormatConfig {
    const baseConfig = this.createC4PlantUMLConfig();
    return {
      ...baseConfig,
      id: 'c4plantuml',  // Different ID but same functionality
      displayName: 'C4 PlantUML (Kroki format)',
      description: 'C4 model diagrams using PlantUML with C4 standard library (Kroki format alias)'
    };
  }

  /**
   * Create C4 short alias configuration (for c4 format)
   * This is a short alias that uses the same config as c4-plantuml
   */
  private static createC4ShortAliasConfig(): DiagramFormatConfig {
    const baseConfig = this.createC4PlantUMLConfig();
    return {
      ...baseConfig,
      id: 'c4',  // Short alias for easier access
      displayName: 'C4 Model',
      description: 'C4 model diagrams - software architecture modeling with standardized notation (short alias for c4-plantuml)'
    };
  }

  /**
   * Create Structurizr format configuration
   */
  private static createStructurizrConfig(): DiagramFormatConfig {
    return {
      id: 'structurizr',
      displayName: 'Structurizr',
      description: 'Structurizr DSL for software architecture diagrams',
      krokiFormat: 'structurizr',
      supportedOutputs: ['svg'],
      enabled: true,
      characteristics: {
        strengths: [
          'C4 model methodology support',
          'Multiple abstraction levels',
          'Architecture as code approach',
          'Enterprise architecture capabilities',
          'Version control friendly'
        ],
        weaknesses: [
          'Complex syntax for beginners',
          'Requires understanding of C4 methodology',
          'Limited to architectural diagrams',
          'Requires Structurizr-specific knowledge'
        ],
        bestFor: [
          'Software architecture documentation',
          'C4 model diagrams',
          'Enterprise architecture',
          'Architecture as code workflows',
          'Team architecture collaboration'
        ],
        examples: [
          'Software system context diagrams',
          'Container architecture diagrams',
          'Component structure diagrams'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Start with: workspace { model { ... } views { ... } }',
          'Define persons: user = person "Name" "Description"',
          'Define software systems: system = softwareSystem "Name" "Description" { ... }',
          'Define containers: container = container "Name" "Description" "Technology" { ... }',
          'Define components: component = component "Name" "Description" "Technology"',
          'Define relationships: user -> system "relationship label"',
          'Define views: systemContext systemName { include * autoLayout }',
          'Container view: container systemName { include * autoLayout }',
          'Component view: component containerName { include * autoLayout }',
          'Use comments with # symbol for organization'
        ],
        bestPractices: [
          'Define multiple views for different abstraction levels',
          'Use C4 hierarchy: person -> softwareSystem -> container -> component',
          'Include technology descriptions for containers and components',
          'Use autoLayout with direction: autoLayout lr/tb/bt/rl',
          'Add meaningful titles to views for clarity',
          'Group components into logical containers (2-4 max)',
          'Define clear system boundaries and separation of concerns'
        ],
        commonPitfalls: [
          'DO NOT duplicate relationships - define each connection only once',
          'DO NOT create flat structure - use proper C4 hierarchy',
          'DO NOT omit technology descriptions',
          'DO NOT forget autoLayout in views',
          'DO NOT mix different abstraction levels incorrectly',
          'DO NOT create circular references in relationships'
        ],
        examplePatterns: [
          'workspace {\n  model {\n    user = person "Developer" "Application developer"\n    system = softwareSystem "Application" {\n      frontend = container "Frontend Layer" "User interface" "React/TypeScript" {\n        pages = component "Pages" "Route components"\n        components = component "Components" "Reusable UI"\n      }\n      backend = container "Backend Layer" "Business logic" "Node.js/Express"\n    }\n    # Define relationships once - no duplicates\n    user -> system "Develops"\n    pages -> components "Uses"\n    frontend -> backend "Calls API"\n  }\n  views {\n    # Container view FIRST for detailed architecture\n    container system { include * autoLayout lr title "Application Architecture" }\n    component frontend { include * autoLayout tb title "Frontend Components" }\n    systemContext system { include * autoLayout title "System Context" }\n  }\n}',
          'workspace {\n  model {\n    customer = person "Customer" "End user"\n    ecommerce = softwareSystem "E-commerce Platform" {\n      web = container "Web Store" "Customer interface" "React/TypeScript" {\n        catalog = component "Product Catalog" "Browse products"\n        cart = component "Shopping Cart" "Manage purchases"\n      }\n      api = container "API Server" "Business logic" "Node.js/Express" {\n        orders = component "Order Service" "Process orders"\n        payments = component "Payment Service" "Handle payments"\n      }\n      data = container "Database" "Data storage" "PostgreSQL"\n    }\n    customer -> ecommerce "Shops using"\n    web -> api "Makes API calls"\n    api -> data "Stores data"\n  }\n  views {\n    systemContext ecommerce { include * autoLayout title "System Context" }\n    container ecommerce { include * autoLayout title "Containers" }\n    component web { include * autoLayout lr title "Web Components" }\n    component api { include * autoLayout td title "API Components" }\n  }\n}',
          'workspace {\n  model {\n    developer = person "Developer"\n    system = softwareSystem "Remix Application" {\n      frontend = container "Frontend Layer" "User interface" "React/TypeScript" {\n        routes = component "Route Handlers" "Remix routes"\n        pages = component "Page Components" "React pages"\n      }\n      build = container "Build Layer" "Compilation" "Vite/Node.js" {\n        client = component "Client Bundle" "Browser code"\n        server = component "Server Bundle" "SSR code"\n      }\n      config = container "Config Layer" "Settings" "JSON/TypeScript" {\n        typescript = component "TS Config" "Compiler settings"\n        vite = component "Vite Config" "Build config"\n      }\n    }\n    developer -> system "Develops"\n    routes -> pages "Renders"\n    frontend -> build "Compiles to"\n    config -> build "Configures"\n  }\n  views {\n    systemContext system { include * autoLayout title "System Overview" }\n    container system { include * autoLayout title "Layer Architecture" }\n    component frontend { include * autoLayout lr title "Frontend Structure" }\n    component build { include * autoLayout title "Build Components" }\n  }\n}'
        ],
        outputSpecifications: [
          'Output ONLY the Structurizr DSL code without markdown wrapper',
          'Start with workspace { and end with matching }',
          'Include multiple views for different abstraction levels',
          'Use C4 hierarchy: person -> softwareSystem -> container -> component',
          'Include autoLayout in all view definitions with optional direction',
          'Add descriptive titles to views for clarity',
          'Include technology descriptions for all containers and components',
          'Ensure proper assignment syntax: name = elementType "Label" "Description" "Technology"'
        ]
      },
      fileExtensions: ['.dsl', '.structurizr'],
      exampleCode: 'workspace {\n  model {\n    user = person "User"\n    system = softwareSystem "Application" {\n      app = container "Web App"\n    }\n    user -> system "Uses"\n  }\n  views {\n    systemContext system {\n      include *\n      autoLayout\n    }\n  }\n}'
    };
  }

  /**
   * Create Excalidraw format configuration
   */
  private static createExcalidrawConfig(): DiagramFormatConfig {
    return {
      id: 'excalidraw',
      displayName: 'Excalidraw',
      description: 'Hand-drawn style diagrams and sketches',
      krokiFormat: 'excalidraw',
      supportedOutputs: ['svg'], // Excalidraw only supports SVG output in Kroki
      enabled: true,
      characteristics: {
        strengths: [
          'Hand-drawn aesthetic',
          'Intuitive and approachable style',
          'Great for brainstorming and sketches',
          'Low barrier to entry',
          'Collaborative friendly'
        ],
        weaknesses: [
          'Limited precision and structure',
          'JSON format complexity',
          'Not suitable for formal documentation',
          'Less standardized notation'
        ],
        bestFor: [
          'Brainstorming sessions',
          'Concept sketches',
          'Informal documentation',
          'Presentation diagrams',
          'Wireframes and mockups'
        ],
        examples: [
          'System concept sketches',
          'Meeting whiteboard captures',
          'Quick architecture ideas',
          'User flow sketches'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Use Excalidraw JSON format with ALL required fields',
          'MANDATORY fields: type, version, source, elements, appState',
          'MANDATORY element fields: id, type, x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeStyle, strokeWidth, roughness, opacity, seed',
          'Use element types: rectangle, ellipse, arrow, text, line, diamond',
          'fillStyle values: "solid", "hachure", "cross-hatch", "dots"',
          'strokeStyle values: "solid", "dashed", "dotted"',
          'roughness: 0-2 (0=smooth, 2=rough)',
          'opacity: 0-100, seed: random integer',
          'Text elements need: text, fontSize, fontFamily',
          'Use unique string IDs for all elements'
        ],
        bestPractices: [
          'Include ALL required fields to prevent rendering errors',
          'Use consistent colors and styles',
          'Generate unique random seeds for each element',
          'Keep drawings simple and clear',
          'Add descriptive text labels',
          'Maintain readable proportions'
        ],
        commonPitfalls: [
          'DO NOT omit fillStyle, strokeStyle, roughness, opacity, seed - these cause rendering errors',
          'DO NOT use invalid fillStyle values (only "solid", "hachure", "cross-hatch", "dots")',
          'DO NOT use invalid strokeStyle values (only "solid", "dashed", "dotted")',
          'DO NOT forget strokeWidth (use 1-3)',
          'DO NOT use roughness outside 0-2 range',
          'DO NOT use invalid JSON format',
          'DO NOT forget unique id for each element',
          'DO NOT create overly complex drawings',
          'DO NOT ignore element positioning',
          'DO NOT omit version and source fields'
        ],
        examplePatterns: [
          '{\n  "type": "excalidraw",\n  "version": 2,\n  "source": "https://excalidraw.com",\n  "elements": [\n    {\n      "id": "rect1",\n      "type": "rectangle",\n      "x": 100,\n      "y": 100,\n      "width": 200,\n      "height": 100,\n      "strokeColor": "#000000",\n      "backgroundColor": "#15aabf",\n      "fillStyle": "solid",\n      "strokeWidth": 2,\n      "strokeStyle": "solid",\n      "roughness": 1,\n      "opacity": 100,\n      "seed": 1234567890\n    }\n  ],\n  "appState": {\n    "viewBackgroundColor": "#ffffff"\n  }\n}'
        ],
        outputSpecifications: [
          'Output ONLY valid Excalidraw JSON without markdown wrapper',
          'MANDATORY: Include type, version, source, elements array, appState object',
          'MANDATORY: Each element must have ALL required fields including fillStyle, strokeStyle, roughness, opacity, seed',
          'Define complete element objects with unique IDs',
          'Use proper coordinate positioning and valid field values',
          'Generate random seeds for consistent rendering'
        ]
      },
      fileExtensions: ['.excalidraw', '.json'],
      exampleCode: '{\n  "type": "excalidraw",\n  "version": 2,\n  "source": "https://excalidraw.com",\n  "elements": [\n    {\n      "id": "rect1",\n      "type": "rectangle",\n      "x": 100,\n      "y": 100,\n      "width": 200,\n      "height": 80,\n      "strokeColor": "#000000",\n      "backgroundColor": "#15aabf",\n      "fillStyle": "solid",\n      "strokeWidth": 2,\n      "strokeStyle": "solid",\n      "roughness": 1,\n      "opacity": 100,\n      "seed": 1968410350\n    },\n    {\n      "id": "text1",\n      "type": "text",\n      "x": 150,\n      "y": 130,\n      "width": 100,\n      "height": 20,\n      "text": "System",\n      "fontSize": 16,\n      "fontFamily": 1,\n      "strokeColor": "#000000",\n      "opacity": 100,\n      "roughness": 1,\n      "seed": 987654321\n    }\n  ],\n  "appState": {\n    "viewBackgroundColor": "#ffffff",\n    "gridSize": 20\n  }\n}'
    };
  }

  /**
   * Create Vega-Lite format configuration
   */
  private static createVegaLiteConfig(): DiagramFormatConfig {
    return {
      id: 'vega-lite',
      displayName: 'Vega-Lite',
      description: 'Grammar of interactive graphics for data visualization',
      krokiFormat: 'vegalite',
      supportedOutputs: ['svg'], // Vega-Lite PNG has Docker Canvas limitations, SVG works perfectly
      enabled: true,
      characteristics: {
        strengths: [
          'Powerful data visualization grammar',
          'Interactive and dynamic charts',
          'Wide variety of chart types',
          'Statistical transformations',
          'JSON-based specification'
        ],
        weaknesses: [
          'Requires understanding of visualization grammar',
          'JSON verbosity',
          'Limited to data visualization'
        ],
        bestFor: [
          'Data analysis dashboards',
          'Statistical reports',
          'Interactive data exploration',
          'Business intelligence visualizations',
          'Scientific data presentation'
        ],
        examples: [
          'Performance metrics charts',
          'User analytics dashboards',
          'Financial reports',
          'Operational KPI displays'
        ]
      },
      instructionTemplate: {
        syntaxGuidelines: [
          'Use valid Vega-Lite JSON schema',
          'Define data, mark, and encoding properties',
          'Specify chart type with mark property',
          'Map data fields to visual channels in encoding',
          'Include title and axis labels'
        ],
        bestPractices: [
          'Start with simple chart types',
          'Use appropriate mark types for data',
          'Include clear titles and labels',
          'Choose appropriate color schemes',
          'Add interactivity when beneficial'
        ],
        commonPitfalls: [
          'DO NOT use invalid JSON schema',
          'DO NOT forget required properties',
          'DO NOT mix incompatible mark types',
          'DO NOT ignore data field types',
          'DO NOT create overly complex visualizations'
        ],
        examplePatterns: [
          '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",\n  "data": {"values": [{"x": 1, "y": 2}]},\n  "mark": "point",\n  "encoding": {\n    "x": {"field": "x", "type": "quantitative"},\n    "y": {"field": "y", "type": "quantitative"}\n  }\n}'
        ],
        outputSpecifications: [
          'Output ONLY valid Vega-Lite JSON',
          'Include schema reference',
          'Define data, mark, and encoding',
          'Use proper field type mappings'
        ]
      },
      fileExtensions: ['.vl.json', '.vega'],
      exampleCode: '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",\n  "data": {"values": [{"month": "Jan", "sales": 100}, {"month": "Feb", "sales": 150}]},\n  "mark": "bar",\n  "encoding": {\n    "x": {"field": "month", "type": "ordinal"},\n    "y": {"field": "sales", "type": "quantitative"}\n  }\n}'
    };
  }

  /**
   * Get all supported format IDs
   */
  static getSupportedFormatIds(): string[] {
    return [
      'mermaid', 'plantuml', 'd2', 'graphviz', 'erd',
      'bpmn', 'c4-plantuml', 'structurizr', 'excalidraw', 'vega-lite'
    ];
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