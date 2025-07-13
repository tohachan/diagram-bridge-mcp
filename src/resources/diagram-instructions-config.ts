import { FormatInstructionTemplate } from '../types/diagram-instructions.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { DiagramFormatsFactory } from '../config/diagram-formats-factory.js';

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
          enum: DiagramFormatsFactory.getSupportedFormatIds(),
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
 * Get format-specific instruction template
 * Delegates to DiagramFormatsFactory as single source of truth
 */
export function getFormatInstructionTemplate(format: DiagramFormat): FormatInstructionTemplate | null {
  return DiagramFormatsFactory.getInstructionTemplate(format) as FormatInstructionTemplate | null;
}

/**
 * Get all available instruction templates
 */
export function getAllInstructionTemplates(): Record<DiagramFormat, FormatInstructionTemplate> {
  const supportedFormats = DiagramFormatsFactory.getSupportedFormatIds() as DiagramFormat[];
  const templates: Record<string, FormatInstructionTemplate> = {};
  
  for (const format of supportedFormats) {
    const template = DiagramFormatsFactory.getInstructionTemplate(format);
    if (template) {
      templates[format] = template as FormatInstructionTemplate;
    }
  }
  
  return templates as Record<DiagramFormat, FormatInstructionTemplate>;
}

/**
 * @deprecated Use getFormatInstructionTemplate() instead
 * Legacy constant maintained for backwards compatibility
 * This will be removed in future versions
 */
export const FORMAT_INSTRUCTION_TEMPLATES: Record<DiagramFormat, FormatInstructionTemplate> = getAllInstructionTemplates();