import { KrokiHttpClient } from '../clients/kroki-client.js';
import { DiagramFormatsManager } from '../config/diagram-formats-manager.js';
import { getDiagramFilePath, getDiagramStorageBasePath, findProjectRoot } from '../utils/file-path.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Comprehensive Docker Integration Tests for all diagram formats
 * Tests actual rendering through Kroki service in Docker environment
 * Records all discovered issues in ISSUES.md
 */

// Skip Docker tests when Docker is not available
// To run Docker tests: ensure docker-compose is up and set ENABLE_DOCKER_TESTS=true
const shouldRunDockerTests = process.env.ENABLE_DOCKER_TESTS === 'true';

(shouldRunDockerTests ? describe : describe.skip)('Docker Rendering Integration Tests', () => {
  const krokiClient = new KrokiHttpClient({
    baseUrl: process.env.KROKI_URL || 'http://localhost:8000',
    timeout: 60000, // 60 seconds for Docker tests
    maxRetries: 2
  });
  
  const formatsManager = DiagramFormatsManager.getInstance();
  const issuesFile = path.join(findProjectRoot(), 'ISSUES.md');
  
  // Helper function to safely get error message
  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      try {
        return JSON.stringify(error);
      } catch {
        return error.toString();
      }
    }
    return String(error);
  }
  
  // Ensure output directory exists
  beforeAll(async () => {
    const outputDir = getDiagramStorageBasePath();
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create output directory:', error);
    }
  });

  // Helper function to record issues
  async function recordIssue(category: string, formatName: string, outputFormat: string, error: unknown) {
    const errorMessage = getErrorMessage(error);
    const issueText = `
### ${category} - ${formatName} (${outputFormat})
- **Error**: ${errorMessage}
- **Timestamp**: ${new Date().toISOString()}
- **Test Type**: Docker Rendering Integration
- **Details**: ${JSON.stringify(error, null, 2)}
`;

    try {
      const currentContent = await fs.readFile(issuesFile, 'utf-8');
      const updatedContent = currentContent.replace(
        `### ${category}
(None discovered yet)`,
        `### ${category}
${issueText}
(Additional issues may be recorded above)`
      );
      await fs.writeFile(issuesFile, updatedContent, 'utf-8');
    } catch (writeError) {
      console.error('Failed to record issue:', writeError);
    }
  }

  // Helper function to update test status
  async function updateTestStatus(formatName: string, outputFormats: string[], status: string, issues?: string) {
    try {
      const currentContent = await fs.readFile(issuesFile, 'utf-8');
      const outputFormatsText = outputFormats.join(', ');
      const issuesText = issues ? `\n- Issues: ${issues}` : '\n- Issues: None discovered';
      
      const updatedContent = currentContent.replace(
        `### ${formatName.charAt(0).toUpperCase() + formatName.slice(1)} (${outputFormatsText})
- Status: Not tested yet
- Issues: None discovered yet`,
        `### ${formatName.charAt(0).toUpperCase() + formatName.slice(1)} (${outputFormatsText})
- Status: ${status}${issuesText}`
      );
      await fs.writeFile(issuesFile, updatedContent, 'utf-8');
    } catch (writeError) {
      console.error('Failed to update test status:', writeError);
    }
  }

  describe('Kroki Service Health Check', () => {
    test('should verify Kroki service is available', async () => {
      try {
        const health = await krokiClient.healthCheck();
        expect(health.status).toBe('healthy');
        
        if (health.status !== 'healthy') {
          await recordIssue('Critical Issues', 'Kroki Service', 'N/A', 
            `Health check failed: ${health.details.join(', ')}`);
        }
      } catch (error) {
        await recordIssue('Critical Issues', 'Kroki Service', 'N/A', error);
        throw error;
      }
    }, 30000);
  });

  describe('Format-Specific Rendering Tests', () => {
    
    test('Mermaid rendering (PNG, SVG)', async () => {
      const format = 'mermaid';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test PNG rendering
        const pngPath = getDiagramFilePath(`test-${format}.png`);
        await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
        
        const pngStats = await fs.stat(pngPath);
        expect(pngStats.size).toBeGreaterThan(100);
        
        // Test SVG rendering
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        await updateTestStatus(format, ['png', 'svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'png/svg', error);
        await updateTestStatus(format, ['png', 'svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('PlantUML rendering (PNG, SVG)', async () => {
      const format = 'plantuml';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test PNG rendering
        const pngPath = getDiagramFilePath(`test-${format}.png`);
        await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
        
        const pngStats = await fs.stat(pngPath);
        expect(pngStats.size).toBeGreaterThan(100);
        
        // Test SVG rendering
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        await updateTestStatus(format, ['png', 'svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'png/svg', error);
        await updateTestStatus(format, ['png', 'svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('D2 rendering (SVG only)', async () => {
      const format = 'd2';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test SVG rendering only (D2 doesn't support PNG)
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        // Verify PNG is not supported
        try {
          const pngPath = getDiagramFilePath(`test-${format}-invalid.png`);
          await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
          issues.push('PNG rendering unexpectedly succeeded for D2');
        } catch (pngError) {
          // Expected to fail - this is correct behavior
        }
        
        await updateTestStatus(format, ['svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`SVG rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'svg', error);
        await updateTestStatus(format, ['svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('GraphViz rendering (PNG, SVG)', async () => {
      const format = 'graphviz';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test PNG rendering
        const pngPath = getDiagramFilePath(`test-${format}.png`);
        await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
        
        const pngStats = await fs.stat(pngPath);
        expect(pngStats.size).toBeGreaterThan(100);
        
        // Test SVG rendering
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        await updateTestStatus(format, ['png', 'svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'png/svg', error);
        await updateTestStatus(format, ['png', 'svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('BPMN rendering (SVG only)', async () => {
      const format = 'bpmn';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // BPMN only supports SVG output format
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        // Verify it's valid SVG content
        const svgContent = await fs.readFile(svgPath, 'utf-8');
        expect(svgContent).toContain('<svg');
        expect(svgContent).toContain('</svg>');
        
        await updateTestStatus(format, ['svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'svg', error);
        await updateTestStatus(format, ['svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('C4-PlantUML rendering (PNG, SVG)', async () => {
      const format = 'c4-plantuml';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test PNG rendering
        const pngPath = getDiagramFilePath(`test-c4-plantuml.png`);
        await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
        
        const pngStats = await fs.stat(pngPath);
        expect(pngStats.size).toBeGreaterThan(100);
        
        // Test SVG rendering
        const svgPath = getDiagramFilePath(`test-c4-plantuml.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        await updateTestStatus('c4-plantuml', ['png', 'svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'png/svg', error);
        await updateTestStatus('c4-plantuml', ['png', 'svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('Structurizr rendering (PNG, SVG)', async () => {
      const format = 'structurizr';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test PNG rendering
        const pngPath = getDiagramFilePath(`test-${format}.png`);
        await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
        
        const pngStats = await fs.stat(pngPath);
        expect(pngStats.size).toBeGreaterThan(100);
        
        // Test SVG rendering
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        await updateTestStatus(format, ['png', 'svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`Rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'png/svg', error);
        await updateTestStatus(format, ['png', 'svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('Excalidraw rendering (SVG only)', async () => {
      const format = 'excalidraw';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test SVG rendering only (Excalidraw doesn't support PNG in Kroki)
        const svgPath = getDiagramFilePath(`test-${format}.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        // Verify PNG is not supported
        try {
          const pngPath = getDiagramFilePath(`test-${format}-invalid.png`);
          await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
          issues.push('PNG rendering unexpectedly succeeded for Excalidraw');
        } catch (pngError) {
          // Expected to fail - this is correct behavior
        }
        
        await updateTestStatus(format, ['svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`SVG rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'svg', error);
        await updateTestStatus(format, ['svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);

    test('Vega-Lite rendering (SVG only)', async () => {
      const format = 'vega-lite';
      const config = formatsManager.getFormatConfig(format);
      expect(config).toBeDefined();
      
      const testCode = config!.exampleCode;
      const issues: string[] = [];
      
      try {
        // Test SVG rendering only (Vega-Lite doesn't support PNG in our Docker configuration)
        const svgPath = getDiagramFilePath(`test-vega-lite.svg`);
        await krokiClient.renderDiagram(testCode, format as any, 'svg', svgPath);
        
        const svgStats = await fs.stat(svgPath);
        expect(svgStats.size).toBeGreaterThan(100);
        
        // Verify PNG is not supported
        try {
          const pngPath = getDiagramFilePath(`test-${format}-invalid.png`);
          await krokiClient.renderDiagram(testCode, format as any, 'png', pngPath);
          issues.push('PNG rendering unexpectedly succeeded for Vega-Lite');
        } catch (pngError) {
          // Expected to fail - this is correct behavior
        }
        
        await updateTestStatus('vega-lite', ['svg'], 'PASSED');
        
      } catch (error) {
        issues.push(`SVG rendering failed: ${getErrorMessage(error)}`);
        await recordIssue('Major Issues', format, 'svg', error);
        await updateTestStatus('vega-lite', ['svg'], 'FAILED', issues.join('; '));
        throw error;
      }
    }, 60000);
  });

  describe('Comprehensive Format Validation', () => {
    test('should validate all format configurations match Kroki support', async () => {
      const allFormats = formatsManager.getEnabledFormats();
      const validationIssues: string[] = [];
      
      for (const format of allFormats) {
        const config = formatsManager.getFormatConfig(format);
        if (!config) {
          validationIssues.push(`Missing configuration for format: ${format}`);
          continue;
        }
        
        // Validate supported outputs match actual Kroki capabilities
        for (const outputFormat of config.supportedOutputs) {
          try {
            // Quick validation render (small timeout)
            const testPath = getDiagramFilePath(`validation-${format}.${outputFormat}`);
            await krokiClient.renderDiagram(
              config.exampleCode, 
              format as any, 
              outputFormat as any, 
              testPath
            );
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            validationIssues.push(`${format} -> ${outputFormat}: ${errorMsg}`);
          }
        }
      }
      
      if (validationIssues.length > 0) {
        console.log('Validation issues found:', validationIssues);
        await recordIssue('Documentation Issues', 'Format Validation', 'Multiple', 
          `Configuration mismatches: ${validationIssues.join('; ')}`);
      }
      
      expect(validationIssues.length).toBe(0);
    }, 120000); // 2 minutes for comprehensive validation
    
    test('should verify example code syntax correctness', async () => {
      const allFormats = formatsManager.getEnabledFormats();
      const syntaxIssues: string[] = [];
      
      for (const format of allFormats) {
        const config = formatsManager.getFormatConfig(format);
        if (!config) continue;
        
        const exampleCode = config.exampleCode;
        
        // Basic syntax validation based on format
        switch (format) {
          case 'mermaid':
            if (!exampleCode.includes('flowchart') && !exampleCode.includes('graph')) {
              syntaxIssues.push(`${format}: example missing diagram type declaration`);
            }
            break;
          case 'plantuml':
          case 'c4-plantuml':
            if (!exampleCode.includes('@startuml') || !exampleCode.includes('@enduml')) {
              syntaxIssues.push(`${format}: example missing @startuml/@enduml wrapper`);
            }
            break;
          case 'bpmn':
            if (!exampleCode.includes('<?xml') || !exampleCode.includes('bpmn:definitions')) {
              syntaxIssues.push(`${format}: example missing XML declaration or BPMN namespace`);
            }
            break;
          case 'excalidraw':
          case 'vega-lite':
            try {
              JSON.parse(exampleCode);
            } catch {
              syntaxIssues.push(`${format}: example contains invalid JSON`);
            }
            break;
        }
      }
      
      if (syntaxIssues.length > 0) {
        await recordIssue('Documentation Issues', 'Example Code', 'Multiple', 
          `Syntax issues: ${syntaxIssues.join('; ')}`);
      }
      
      expect(syntaxIssues.length).toBe(0);
    });
  });

  describe('Performance and Reliability Tests', () => {
    test('should handle concurrent rendering requests', async () => {
      const formats = ['mermaid', 'plantuml', 'graphviz'];
      const concurrentPromises = formats.map(async (format) => {
        const config = formatsManager.getFormatConfig(format);
        const testPath = getDiagramFilePath(`concurrent-${format}.png`);
        return krokiClient.renderDiagram(config!.exampleCode, format as any, 'png', testPath);
      });
      
      try {
        await Promise.all(concurrentPromises);
      } catch (error) {
        await recordIssue('Major Issues', 'Concurrent Rendering', 'Multiple', error);
        throw error;
      }
    }, 90000);

    test('should handle large diagram rendering', async () => {
      // Test with a larger Mermaid diagram
      const largeDiagram = `flowchart TD
        A[Start] --> B{Decision}
        B -->|Yes| C[Action 1]
        B -->|No| D[Action 2]
        C --> E[Process 1]
        D --> F[Process 2]
        E --> G[End]
        F --> G
        G --> H[Final Step]
        H --> I[Complete]
        I --> J[Archive]
        J --> K[Cleanup]
        K --> L[Finish]`;
      
      try {
        const testPath = getDiagramFilePath('large-test.png');
        await krokiClient.renderDiagram(largeDiagram, 'mermaid', 'png', testPath);
        
        const stats = await fs.stat(testPath);
        expect(stats.size).toBeGreaterThan(1000); // Should be larger than simple diagrams
      } catch (error) {
        await recordIssue('Major Issues', 'Large Diagram Rendering', 'PNG', error);
        throw error;
      }
    }, 90000);
  });

  // Cleanup after tests
  afterAll(async () => {
    try {
      // Optional cleanup of test files
      console.log('Docker rendering tests completed. Check ISSUES.md for any discovered problems.');
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });
}); 