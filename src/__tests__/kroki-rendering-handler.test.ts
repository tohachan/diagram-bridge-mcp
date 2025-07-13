import { KrokiRenderingHandler } from '../resources/kroki-rendering-handler.js';
import { DiagramRenderingInput, KrokiClient } from '../types/diagram-rendering.js';

// Mock implementations
const mockKrokiClient: KrokiClient = {
  renderDiagram: jest.fn(),
  healthCheck: jest.fn()
};

describe('KrokiRenderingHandler', () => {
  let handler: KrokiRenderingHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new KrokiRenderingHandler({
      krokiClient: mockKrokiClient
    });
  });

  describe('Constructor', () => {
    it('should create handler with default client', () => {
      const defaultHandler = new KrokiRenderingHandler();
      expect(defaultHandler).toBeInstanceOf(KrokiRenderingHandler);
    });

    it('should create handler with custom client', () => {
      const customHandler = new KrokiRenderingHandler({
        krokiClient: mockKrokiClient
      });
      expect(customHandler).toBeInstanceOf(KrokiRenderingHandler);
    });
  });

  describe('processRequest', () => {
    const validInput: DiagramRenderingInput = {
      code: 'graph TD\n  A --> B',
      diagram_format: 'mermaid',
      output_format: 'svg'
    };

    it('should process valid input successfully', async () => {
      // Mock successful rendering
      jest.mocked(mockKrokiClient.renderDiagram).mockResolvedValue({
        file_path: 'generated-diagrams/diagram-mermaid-123456.svg',
        resource_uri: 'file://diagram-mermaid-123456.svg',
        content_type: 'image/svg+xml',
        file_size: 1024
      });

      const result = await handler.processRequest(validInput);
      
      expect(result.file_path).toBeDefined();
      expect(result.content_type).toBe('image/svg+xml');
      expect(mockKrokiClient.renderDiagram).toHaveBeenCalledWith(
        validInput.code,
        validInput.diagram_format,
        validInput.output_format,
        expect.stringContaining('diagram-mermaid-')
      );
    });

    it('should handle validation errors', async () => {
      const invalidInput = {
        code: '',
        diagram_format: 'invalid',
        output_format: 'png'
      };

      await expect(handler.processRequest(invalidInput)).rejects.toThrow();
      expect(mockKrokiClient.renderDiagram).not.toHaveBeenCalled();
    });

    it('should handle rendering errors', async () => {
      jest.mocked(mockKrokiClient.renderDiagram).mockRejectedValue(
        new Error('Kroki rendering failed')
      );

      await expect(handler.processRequest(validInput)).rejects.toThrow();
      expect(mockKrokiClient.renderDiagram).toHaveBeenCalled();
    });

    it('should use default output format when not specified', async () => {
      const inputWithoutOutput: DiagramRenderingInput = {
        code: 'graph TD\n  A --> B',
        diagram_format: 'mermaid'
      };

      jest.mocked(mockKrokiClient.renderDiagram).mockResolvedValue({
        file_path: 'generated-diagrams/diagram-mermaid-123456.svg',
        resource_uri: 'file://diagram-mermaid-123456.svg',
        content_type: 'image/svg+xml',
        file_size: 1024
      });

      const result = await handler.processRequest(inputWithoutOutput);
      
      expect(result.file_path).toBeDefined();
      expect(mockKrokiClient.renderDiagram).toHaveBeenCalledWith(
        inputWithoutOutput.code,
        inputWithoutOutput.diagram_format,
        'png', // default format for mermaid is actually PNG
        expect.stringContaining('diagram-mermaid-')
      );
    });
  });

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      jest.mocked(mockKrokiClient.healthCheck).mockResolvedValue({
        status: 'healthy',
        details: ['Kroki service is responsive']
      });

      const result = await handler.healthCheck();
      
      expect(result.status).toBe('healthy');
      expect(result.details).toBeDefined();
      expect(Array.isArray(result.details)).toBe(true);
    });

    it('should handle health check failures', async () => {
      jest.mocked(mockKrokiClient.healthCheck).mockRejectedValue(
        new Error('Health check failed')
      );

      const result = await handler.healthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.details[0]).toContain('Health check failed');
    });
  });

  describe('getMetrics', () => {
    it('should return metrics', async () => {
      const metrics = await handler.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      jest.mocked(mockKrokiClient.renderDiagram).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const input: DiagramRenderingInput = {
        code: 'graph TD\n  A --> B',
        diagram_format: 'mermaid',
        output_format: 'svg'
      };

      await expect(handler.processRequest(input)).rejects.toThrow();
    });
  });
});
