import { FormatInstructionTemplate } from '../types/diagram-instructions.js';
import { DiagramFormat } from '../types/diagram-selection.js';

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
      'Define entities: [EntityName]',
      'Add attributes: EntityName { attribute1, attribute2 }',
      'Define relationships: Entity1 ||--o{ Entity2 : "relationship"',
      'Use cardinality symbols: ||--o{ (one-to-many), }o--|| (many-to-one)',
      'Add relationship labels with quotes',
      'Use proper ERD notation for keys and attributes',
      'Comments start with %%'
    ],
    bestPractices: [
      'Use meaningful entity and attribute names',
      'Define primary keys explicitly',
      'Show cardinality relationships clearly',
      'Group related entities logically',
      'Use consistent naming conventions',
      'Add relationship descriptions'
    ],
    commonPitfalls: [
      'DO NOT forget entity definitions',
      'DO NOT use incorrect cardinality symbols',
      'DO NOT mix different ERD notations',
      'DO NOT create overly complex single diagrams',
      'DO NOT ignore primary key specifications',
      'DO NOT use inconsistent naming patterns'
    ],
    examplePatterns: [
      'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  PRODUCT ||--o{ LINE-ITEM : ordered',
      'erDiagram\n  USER {\n    int id\n    string name\n    string email\n  }\n  USER ||--o{ POST : creates',
      'erDiagram\n  AUTHOR ||--o{ BOOK : writes\n  BOOK }o--|| PUBLISHER : published_by'
    ],
    outputSpecifications: [
      'Output ONLY the ERD code without markdown wrapper',
      'Start with erDiagram declaration',
      'Use proper cardinality notation',
      'Define entities and relationships clearly',
      'Include meaningful relationship labels'
    ]
  },

  bpmn: {
    format: 'bpmn',
    displayName: 'BPMN',
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
      'Start with simple single-process diagrams',
      'Use clear, descriptive names for tasks and events',
      'Keep process flows linear and easy to follow',
      'Use exclusiveGateway for simple decision points',
      'Ensure all elements have unique IDs',
      'Test with simple examples before adding complexity',
      'Focus on single participant processes',
      'Use proper BPMN 2.0 element structure',
      'Use one gateway per decision point - avoid reusing gateways',
      'Create clear linear paths without complex cycles',
      'Validate that every element has proper incoming/outgoing flows',
      'Design for readability - complex processes can be split into multiple diagrams if needed'
    ],
    commonPitfalls: [
      'DO NOT request PNG format - BPMN only supports SVG output',
      'DO NOT use collaboration and messageFlow - causes validation errors',
      'DO NOT create multiple processes in single diagram',
      'DO NOT use complex gateway combinations',
      'DO NOT forget to connect elements with sequenceFlow',
      'DO NOT use special characters in element IDs',
      'DO NOT create processes without start/end events',
      'DO NOT use unsupported BPMN elements',
      'DO NOT overcomplicate simple workflows',
      'DO NOT use XML comments <!-- --> - they break parsing',
      'DO NOT create complex loops or cycles - they cause validation errors',
      'DO NOT use same gateway for conflicting decision paths',
      'DO NOT create elements without proper flow connections'
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
      'Use proper coordinate positioning for visual layout',
      'Design comprehensive business processes as needed - complexity is supported'
    ]
  },

  'c4-plantuml': {
    format: 'c4-plantuml',
    displayName: 'C4-PlantUML',
    syntaxGuidelines: [
      'Start with @startuml and end with @enduml',
      'Include C4 library: !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml',
      'Define persons: Person(alias, "Label", "Description")',
      'Define systems: System(alias, "Label", "Description")',
      'Define containers: Container(alias, "Label", "Technology", "Description")',
      'Define components: Component(alias, "Label", "Technology", "Description")',
      'Define relationships: Rel(from, to, "Label", "Technology")',
      'Use LAYOUT_WITH_LEGEND() for automatic legend',
      'Add titles with title'
    ],
    bestPractices: [
      'Use appropriate C4 abstraction level',
      'Define clear system boundaries',
      'Use consistent naming conventions',
      'Add meaningful descriptions',
      'Include technology stack information',
      'Use proper relationship labels',
      'Apply C4 methodology principles'
    ],
    commonPitfalls: [
      'DO NOT forget @startuml/@enduml tags',
      'DO NOT mix different C4 diagram types',
      'DO NOT omit required C4 library includes',
      'DO NOT use invalid C4 element syntax',
      'DO NOT create diagrams without clear scope',
      'DO NOT ignore C4 abstraction levels',
      'DO NOT use unclear element descriptions'
    ],
    examplePatterns: [
      '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\ntitle System Context\nPerson(user, "User", "End user")\nSystem(system, "System", "Main system")\nRel(user, system, "Uses")\nLAYOUT_WITH_LEGEND()\n@enduml',
      '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml\ntitle Container Diagram\nContainer(web, "Web App", "React", "Frontend")\nContainer(api, "API", "Node.js", "Backend")\nRel(web, api, "Makes API calls", "HTTPS")\n@enduml',
      '@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml\ntitle Component Diagram\nComponent(ctrl, "Controller", "Class", "Handles requests")\nComponent(svc, "Service", "Class", "Business logic")\nRel(ctrl, svc, "Calls")\n@enduml'
    ],
    outputSpecifications: [
      'Output ONLY the C4-PlantUML code without markdown wrapper',
      'Always include @startuml at the beginning',
      'Always include @enduml at the end',
      'Include appropriate C4 library import',
      'Use proper C4 element syntax',
      'Define clear relationships between elements',
      'Include title and legend when appropriate',
      'Follow C4 methodology principles'
    ]
  },

  structurizr: {
    format: 'structurizr',
    displayName: 'Structurizr',
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
      'Use comments with # symbol'
    ],
    bestPractices: [
      'ALWAYS define multiple views - start with component view for detailed structure',
      'Use C4 hierarchy: person -> softwareSystem -> container -> component',
      'Group into 2-4 logical containers max (Frontend/Backend/Build/Config layers)',
      'Include technology stratification in descriptions ("React/TypeScript", "Node.js/Vite")',
      'Component views show actual code structure - use them for implementation details',
              'Use autoLayout with direction: autoLayout lr (left-right) or tb (top-bottom)',
      'Add meaningful titles to views: title "Container Architecture"',
      'Define clear system boundaries and separation of concerns'
    ],
    commonPitfalls: [
      'DO NOT use only systemContext view - results in oversimplified diagrams',
      'DO NOT create flat structure - use proper C4 hierarchy',
      'DO NOT define too many containers (>4) - creates visual chaos',
      'DO NOT omit technology descriptions - unclear component purposes',
      'DO NOT forget autoLayout in views',
      'DO NOT mix different abstraction levels incorrectly',
      'DO NOT create circular references in relationships',
      'DO NOT ignore component views for detailed architectural documentation'
    ],
    examplePatterns: [
      'workspace {\n  model {\n    user = person "Developer" "Application developer"\n    system = softwareSystem "Application" {\n      frontend = container "Frontend Layer" "User interface" "React/TypeScript" {\n        pages = component "Pages" "Route components"\n        components = component "Components" "Reusable UI"\n      }\n      backend = container "Backend Layer" "Business logic" "Node.js/Express"\n    }\n    user -> system "Develops"\n  }\n  views {\n    systemContext system {\n      include *\n      autoLayout\n      title "System Overview"\n    }\n    container system {\n      include *\n      autoLayout\n      title "Container Architecture"\n    }\n    component frontend {\n      include *\n      autoLayout lr\n      title "Frontend Components"\n    }\n  }\n}',
      'workspace {\n  model {\n    customer = person "Customer" "End user"\n    ecommerce = softwareSystem "E-commerce Platform" {\n      web = container "Web Store" "Customer interface" "React/TypeScript" {\n        catalog = component "Product Catalog" "Browse products"\n        cart = component "Shopping Cart" "Manage purchases"\n      }\n      api = container "API Server" "Business logic" "Node.js/Express" {\n        orders = component "Order Service" "Process orders"\n        payments = component "Payment Service" "Handle payments"\n      }\n      data = container "Database" "Data storage" "PostgreSQL"\n    }\n    customer -> ecommerce "Shops using"\n    web -> api "Makes API calls"\n    api -> data "Stores data"\n  }\n  views {\n    systemContext ecommerce { include * autoLayout title "System Context" }\n    container ecommerce { include * autoLayout title "Containers" }\n    component web { include * autoLayout lr title "Web Components" }\n    component api { include * autoLayout td title "API Components" }\n  }\n}',
      'workspace {\n  model {\n    developer = person "Developer"\n    system = softwareSystem "Remix Application" {\n      frontend = container "Frontend Layer" "User interface" "React/TypeScript" {\n        routes = component "Route Handlers" "Remix routes"\n        pages = component "Page Components" "React pages"\n      }\n      build = container "Build Layer" "Compilation" "Vite/Node.js" {\n        client = component "Client Bundle" "Browser code"\n        server = component "Server Bundle" "SSR code"\n      }\n      config = container "Config Layer" "Settings" "JSON/TypeScript" {\n        typescript = component "TS Config" "Compiler settings"\n        vite = component "Vite Config" "Build config"\n      }\n    }\n    developer -> system "Develops"\n    routes -> pages "Renders"\n    frontend -> build "Compiles to"\n    config -> build "Configures"\n  }\n  views {\n    systemContext system { include * autoLayout title "System Overview" }\n    container system { include * autoLayout title "Layer Architecture" }\n    component frontend { include * autoLayout lr title "Frontend Structure" }\n    component build { include * autoLayout title "Build Components" }\n  }\n}'
    ],
    outputSpecifications: [
      'Output ONLY the Structurizr DSL code without markdown wrapper',
      'Start with workspace { and end with matching }',
      'ALWAYS include multiple views (systemContext, container, component)',
      'Use C4 hierarchy: person -> softwareSystem -> container -> component',
              'Include autoLayout in all view definitions with optional direction (lr/tb/bt/rl)',
      'Add descriptive titles to views for clarity',
      'Group components into 2-4 logical containers maximum',
      'Include technology descriptions for all containers and components',
      'Use component views to show detailed internal structure',
      'Ensure proper assignment syntax: name = elementType "Label" "Description" "Technology"'
    ]
  },

  excalidraw: {
    format: 'excalidraw',
    displayName: 'Excalidraw',
    syntaxGuidelines: [
      'Use Excalidraw JSON structure with type, version, source, elements, appState',
      'MANDATORY: Include all required fields for each element',
      'Required element fields: id, type, x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeStyle, strokeWidth, roughness, opacity, seed',
      'Use element types: rectangle, ellipse, arrow, text, line, diamond',
      'CRITICAL: Line elements MUST include "points" array field: [[x1,y1], [x2,y2], ...]',
      'fillStyle values: "solid", "hachure", "cross-hatch", "dots"',
      'strokeStyle values: "solid", "dashed", "dotted"',
      'roughness: number 0-2 (0=smooth, 2=rough)',
      'opacity: number 0-100',
      'seed: random integer for consistent rendering',
      'Use unique string IDs for all elements',
      'Connect elements with arrows using startBinding/endBinding',
      'Text elements need text, fontSize, fontFamily properties'
    ],
    bestPractices: [
      'Always include ALL required fields to prevent rendering errors',
      'Use fillStyle "solid" for filled shapes, "hachure" for sketchy style',
      'Set roughness to 1 for balanced hand-drawn aesthetic',
      'Use opacity 100 for solid elements',
      'Generate unique seeds (random integers) for each element',
      'Keep diagrams simple and focused',
      'Use consistent color schemes',
      'Group related elements with groupIds',
      'Make text readable with appropriate fontSize (12-20)',
      'Use arrows to show clear relationships'
    ],
    commonPitfalls: [
      'DO NOT omit required fields (fillStyle, roughness, opacity, seed, strokeStyle)',
      'DO NOT use invalid fillStyle values - only "solid", "hachure", "cross-hatch", "dots"',
      'DO NOT use invalid strokeStyle values - only "solid", "dashed", "dotted"',
      'DO NOT forget strokeWidth (typically 1-3)',
      'DO NOT use roughness outside 0-2 range',
      'DO NOT forget unique id for each element',
      'DO NOT create overly complex JSON structures',
      'DO NOT use tiny or huge elements',
      'DO NOT mix too many different colors',
      'DO NOT ignore appState section',
      'CRITICAL: DO NOT create line elements without "points" array - this causes rendering errors',
      'DO NOT use line elements with only width/height - must include points field'
    ],
    examplePatterns: [
      '{\n  "type": "excalidraw",\n  "version": 2,\n  "source": "https://excalidraw.com",\n  "elements": [\n    {\n      "id": "rect1",\n      "type": "rectangle",\n      "x": 100,\n      "y": 100,\n      "width": 200,\n      "height": 100,\n      "strokeColor": "#000000",\n      "backgroundColor": "#15aabf",\n      "fillStyle": "solid",\n      "strokeWidth": 2,\n      "strokeStyle": "solid",\n      "roughness": 1,\n      "opacity": 100,\n      "seed": 1234567890\n    },\n    {\n      "id": "text1",\n      "type": "text",\n      "x": 150,\n      "y": 130,\n      "width": 100,\n      "height": 20,\n      "text": "Component",\n      "fontSize": 16,\n      "fontFamily": 1,\n      "strokeColor": "#000000",\n      "opacity": 100,\n      "roughness": 1,\n      "seed": 9876543210\n    }\n  ],\n  "appState": {\n    "viewBackgroundColor": "#ffffff"\n  }\n}',
      '{\n  "type": "excalidraw",\n  "version": 2,\n  "source": "https://excalidraw.com",\n  "elements": [\n    {\n      "id": "line1",\n      "type": "line",\n      "x": 50,\n      "y": 50,\n      "width": 100,\n      "height": 50,\n      "strokeColor": "#1e1e1e",\n      "backgroundColor": "transparent",\n      "fillStyle": "solid",\n      "strokeWidth": 2,\n      "strokeStyle": "solid",\n      "roughness": 1,\n      "opacity": 100,\n      "seed": 1111111111,\n      "points": [[0, 0], [100, 50]]\n    }\n  ],\n  "appState": {\n    "viewBackgroundColor": "#ffffff"\n  }\n}',
      '{\n  "type": "excalidraw",\n  "version": 2,\n  "source": "https://excalidraw.com",\n  "elements": [\n    {\n      "id": "ellipse1",\n      "type": "ellipse",\n      "x": 50,\n      "y": 50,\n      "width": 120,\n      "height": 80,\n      "strokeColor": "#1e1e1e",\n      "backgroundColor": "transparent",\n      "fillStyle": "hachure",\n      "strokeWidth": 2,\n      "strokeStyle": "solid",\n      "roughness": 1,\n      "opacity": 100,\n      "seed": 5555555555\n    }\n  ],\n  "appState": {\n    "viewBackgroundColor": "#ffffff"\n  }\n}'
    ],
    outputSpecifications: [
      'Output ONLY the complete Excalidraw JSON without markdown wrapper',
      'MANDATORY: Include type, version, source, elements array, appState object',
      'MANDATORY: Each element must have ALL required fields',
      'Use valid JSON structure with proper syntax',
      'Include unique IDs for all elements',
      'Set appropriate fillStyle, strokeStyle, roughness, opacity, seed for each element',
      'Use strokeWidth 1-3, roughness 0-2, opacity 0-100',
      'Generate random integer seeds for consistent rendering',
      'Focus on conceptual clarity over precision'
    ]
  },

  'vega-lite': {
    format: 'vega-lite',
    displayName: 'Vega-Lite',
    syntaxGuidelines: [
      'Use JSON structure with $schema, data, mark, encoding',
      'Define schema: "$schema": "https://vega.github.io/schema/vega-lite/v5.json"',
      'Define data: "data": {"values": [...]} or "data": {"url": "..."}',
      'Define mark type: "mark": "point", "bar", "line", "area", etc.',
      'Define encoding: "encoding": {"x": {...}, "y": {...}}',
      'Use field and type for data mapping: {"field": "name", "type": "quantitative"}',
      'Add titles and labels: "title": "Chart Title"',
      'Use transforms for data manipulation when needed'
    ],
    bestPractices: [
      'Choose appropriate mark types for data',
      'Use meaningful field names and types',
      'Add descriptive titles and axis labels',
      'Apply consistent color schemes',
      'Use transforms for data preparation',
      'Include legends when helpful',
      'Keep visualizations focused and clear'
    ],
    commonPitfalls: [
      'DO NOT forget required schema declaration',
      'DO NOT mix incompatible mark and encoding combinations',
      'DO NOT use incorrect field type specifications',
      'DO NOT create overly complex single visualizations',
      'DO NOT ignore data structure requirements',
      'DO NOT omit essential encoding properties',
      'DO NOT use unclear or missing titles'
    ],
    examplePatterns: [
      '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "data": {"values": [{"x": 1, "y": 2}, {"x": 2, "y": 5}]},\n  "mark": "point",\n  "encoding": {\n    "x": {"field": "x", "type": "quantitative"},\n    "y": {"field": "y", "type": "quantitative"}\n  }\n}',
      '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "title": "Sales by Month",\n  "data": {"values": [{"month": "Jan", "sales": 100}, {"month": "Feb", "sales": 150}]},\n  "mark": "bar",\n  "encoding": {\n    "x": {"field": "month", "type": "ordinal"},\n    "y": {"field": "sales", "type": "quantitative"}\n  }\n}',
      '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "data": {"values": [{"date": "2023-01", "value": 10}, {"date": "2023-02", "value": 15}]},\n  "mark": "line",\n  "encoding": {\n    "x": {"field": "date", "type": "temporal"},\n    "y": {"field": "value", "type": "quantitative"}\n  }\n}'
    ],
    outputSpecifications: [
      'Output ONLY valid Vega-Lite JSON without markdown wrapper',
      'Include required $schema declaration',
      'Use proper data structure and format',
      'Define appropriate mark type for visualization',
      'Include complete encoding specifications',
      'Use correct field types (quantitative, ordinal, temporal, nominal)',
      'Add titles and labels for clarity',
      'Ensure JSON is valid and well-formatted'
    ]
  }
}; 