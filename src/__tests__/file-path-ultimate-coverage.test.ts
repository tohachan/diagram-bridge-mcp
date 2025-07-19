import * as path from 'path';
import * as fs from 'fs/promises';
import {
  findProjectRoot,
  getDiagramStorageBasePath,
  getDiagramFilePath,
  ensureDiagramStorageDirectory,
  getDiagramStorageInfo,
} from '../utils/file-path';

// Mock all file system operations
jest.mock('fs/promises');
jest.mock('fs');

// Type the mocked modules properly
const mockFs = fs as jest.Mocked<typeof fs>;

describe('file-path.ts - Strategic Branch Coverage', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    // Store original values
    originalEnv = process.env;
    // Reset environment
    process.env = { ...originalEnv };
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    process.env = originalEnv;
  });

  describe('findProjectRoot - Basic Functionality', () => {
    it('should find project root successfully', () => {
      const result = findProjectRoot();
      expect(result).toContain('diagram-bridge-mcp');
    });

    it('should find project root with startDir parameter', () => {
      const result = findProjectRoot(__dirname);
      expect(result).toContain('diagram-bridge-mcp');
    });

    it('should handle empty startDir gracefully', () => {
      const result = findProjectRoot('');
      expect(result).toContain('diagram-bridge-mcp');
    });

    it('should handle non-existent startDir gracefully', () => {
      const result = findProjectRoot('/non/existent/path/that/does/not/exist');
      expect(result).toContain('diagram-bridge-mcp');
    });
  });

  describe('getDiagramStorageBasePath - Environment Variable Branches', () => {
    it('should use environment variable when set', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/custom/storage/path';
      
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('/custom/storage/path'));
    });

    it('should use relative environment path', () => {
      process.env.DIAGRAM_STORAGE_PATH = './relative/path';
      
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('./relative/path'));
    });

    it('should use default path when environment variable not set', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      const result = getDiagramStorageBasePath();
      expect(result).toContain('generated-diagrams');
    });

    it('should handle empty environment variable as default', () => {
      process.env.DIAGRAM_STORAGE_PATH = '';
      
      const result = getDiagramStorageBasePath();
      expect(result).toContain('generated-diagrams');
    });

    it('should handle null environment variable as default', () => {
      process.env.DIAGRAM_STORAGE_PATH = undefined;
      
      const result = getDiagramStorageBasePath();
      expect(result).toContain('generated-diagrams');
    });
  });

  describe('getDiagramFilePath - Path Construction', () => {
    it('should combine base path with filename using custom path', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/storage';
      
      const result = getDiagramFilePath('test-diagram.png');
      expect(result).toBe(path.join('/storage', 'test-diagram.png'));
    });

    it('should work with default base path', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      const result = getDiagramFilePath('diagram.svg');
      expect(result).toContain('diagram.svg');
      expect(result).toContain('generated-diagrams');
    });

    it('should handle complex filenames', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/tmp/diagrams';
      
      const result = getDiagramFilePath('complex-name-123.png');
      expect(result).toBe(path.join('/tmp/diagrams', 'complex-name-123.png'));
    });

    it('should handle filename with subdirectory path', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/base';
      
      const result = getDiagramFilePath('sub/dir/file.png');
      expect(result).toBe(path.join('/base', 'sub/dir/file.png'));
    });
  });

  describe('ensureDiagramStorageDirectory - Error Handling Branches', () => {
    it('should create directory successfully', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      mockFs.mkdir.mockResolvedValue(undefined);
      
      await expect(ensureDiagramStorageDirectory()).resolves.toBeUndefined();
      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/storage', { recursive: true });
    });

    it('should handle mkdir errors with Error instance', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(error);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Permission denied'
      );
    });

    it('should handle non-Error exceptions', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      mockFs.mkdir.mockRejectedValue('string error');
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Unknown error'
      );
    });

    it('should handle complex error objects', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      const complexError = { code: 'EACCES', message: 'Access denied' };
      mockFs.mkdir.mockRejectedValue(complexError);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Unknown error'
      );
    });

    it('should handle null error', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      mockFs.mkdir.mockRejectedValue(null);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Unknown error'
      );
    });
  });

  describe('getDiagramStorageInfo - Source Detection Branches', () => {
    it('should return environment source when env var is set', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/env/path';
      
      const result = getDiagramStorageInfo();
      expect(result).toEqual({
        basePath: path.resolve('/env/path'),
        isCustomPath: true,
        source: 'environment'
      });
    });

    it('should return default source when env var is not set', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      const result = getDiagramStorageInfo();
      expect(result.isCustomPath).toBe(false);
      expect(result.source).toBe('default');
      expect(result.basePath).toContain('generated-diagrams');
    });

    it('should handle empty string env var as default', () => {
      process.env.DIAGRAM_STORAGE_PATH = '';
      
      const result = getDiagramStorageInfo();
      expect(result.isCustomPath).toBe(false);
      expect(result.source).toBe('default');
      expect(result.basePath).toContain('generated-diagrams');
    });

    it('should handle whitespace-only env var as environment', () => {
      process.env.DIAGRAM_STORAGE_PATH = '   ';
      
      const result = getDiagramStorageInfo();
      expect(result.isCustomPath).toBe(true);
      expect(result.source).toBe('environment');
      expect(result.basePath).toBe(path.resolve('   '));
    });

    it('should handle undefined env var explicitly', () => {
      process.env.DIAGRAM_STORAGE_PATH = undefined;
      
      const result = getDiagramStorageInfo();
      expect(result.isCustomPath).toBe(false);
      expect(result.source).toBe('default');
      expect(result.basePath).toContain('generated-diagrams');
    });
  });

  describe('Advanced Path Resolution', () => {
    it('should handle complex environment paths', () => {
      process.env.DIAGRAM_STORAGE_PATH = '../relative/../complex/./path';
      
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('../relative/../complex/./path'));
    });

    it('should handle path with tildes', () => {
      process.env.DIAGRAM_STORAGE_PATH = '~/diagrams';
      
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('~/diagrams'));
    });

    it('should combine multiple path segments correctly', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/base/path';
      
      const result = getDiagramFilePath('sub/directory/file.png');
      expect(result).toBe(path.join('/base/path', 'sub/directory/file.png'));
    });

    it('should handle absolute filename paths correctly', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/base';
      
      // Even with absolute filename, should combine with base
      const result = getDiagramFilePath('/absolute/file.png');
      expect(result).toBe(path.join('/base', '/absolute/file.png'));
    });

    it('should maintain path consistency across calls', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/consistent/path';
      
      const base1 = getDiagramStorageBasePath();
      const base2 = getDiagramStorageBasePath();
      const info = getDiagramStorageInfo();
      
      expect(base1).toBe(base2);
      expect(base1).toBe(info.basePath);
    });
  });
});
