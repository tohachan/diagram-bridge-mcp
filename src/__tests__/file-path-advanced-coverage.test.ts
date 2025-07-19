import { jest } from '@jest/globals';
import * as path from 'path';

// Mock modules
const mockExistsSync = jest.fn() as jest.MockedFunction<typeof import('fs').existsSync>;
const mockMkdir = jest.fn() as jest.MockedFunction<typeof import('fs/promises').mkdir>;

jest.mock('fs', () => ({
  existsSync: mockExistsSync
}));

jest.mock('fs/promises', () => ({
  mkdir: mockMkdir
}));

import { 
  findProjectRoot, 
  getDiagramStorageBasePath, 
  getDiagramFilePath, 
  ensureDiagramStorageDirectory,
  getDiagramStorageInfo
} from '../utils/file-path.js';

describe('File Path Utilities - Branch Coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('findProjectRoot', () => {
    it('should find project root from current working directory', () => {
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const result = findProjectRoot();
      expect(result).toBe(mockCwd);
    });

    it('should search parent directories for package.json', () => {
      const mockCwd = '/test/project/nested/deep';
      const projectRoot = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(projectRoot, 'package.json');
      });

      const result = findProjectRoot();
      expect(result).toBe(projectRoot);
    });

    it('should use provided startDir parameter', () => {
      const startDir = '/custom/start/dir';
      const projectRoot = '/custom/start';
      
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(projectRoot, 'package.json');
      });

      const result = findProjectRoot(startDir);
      expect(result).toBe(projectRoot);
    });

    it('should return current directory when package.json not found', () => {
      const mockCwd = '/test/noproject';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockReturnValue(false);

      const result = findProjectRoot();
      expect(result).toBe(mockCwd);
    });

    it('should handle errors when reading directories', () => {
      const mockCwd = '/test/error';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = findProjectRoot();
      expect(result).toBe(mockCwd);
    });

    it('should search up to root directory', () => {
      const mockCwd = '/deep/nested/structure';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockReturnValue(false);

      const result = findProjectRoot();
      expect(result).toBe(mockCwd);
    });
  });

  describe('getDiagramStorageBasePath', () => {
    it('should use environment variable when set', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/custom/storage/path';
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('/custom/storage/path'));
    });

    it('should use relative environment path', () => {
      process.env.DIAGRAM_STORAGE_PATH = './custom/relative/path';
      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('./custom/relative/path'));
    });

    it('should default to generated-diagrams in project root', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve(mockCwd, 'generated-diagrams'));
    });

    it('should handle empty environment variable', () => {
      process.env.DIAGRAM_STORAGE_PATH = '';
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve(mockCwd, 'generated-diagrams'));
    });
  });

  describe('getDiagramFilePath', () => {
    it('should generate correct file path with custom storage', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/custom/storage';
      const fileName = 'test-diagram.png';
      const result = getDiagramFilePath(fileName);
      expect(result).toBe(path.join('/custom/storage', fileName));
    });

    it('should generate correct file path with default storage', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const fileName = 'test-diagram.png';
      const result = getDiagramFilePath(fileName);
      expect(result).toBe(path.join(mockCwd, 'generated-diagrams', fileName));
    });

    it('should handle complex file names', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/storage';
      const fileName = 'diagram-mermaid-1234567890.svg';
      const result = getDiagramFilePath(fileName);
      expect(result).toBe(path.join('/storage', fileName));
    });
  });

  describe('ensureDiagramStorageDirectory', () => {
    it('should create directory successfully', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      mockMkdir.mockResolvedValue(undefined);

      await expect(ensureDiagramStorageDirectory()).resolves.toBeUndefined();
      expect(mockMkdir).toHaveBeenCalledWith('/test/storage', { recursive: true });
    });

    it('should handle directory creation failure', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      const error = new Error('Permission denied');
      mockMkdir.mockRejectedValue(error);

      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Permission denied'
      );
    });

    it('should handle non-Error objects in mkdir failure', async () => {
      process.env.DIAGRAM_STORAGE_PATH = '/test/storage';
      mockMkdir.mockRejectedValue('string error');

      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /test/storage: Unknown error'
      );
    });

    it('should work with default directory path', async () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });
      
      mockMkdir.mockResolvedValue(undefined);

      await expect(ensureDiagramStorageDirectory()).resolves.toBeUndefined();
      expect(mockMkdir).toHaveBeenCalledWith(
        path.resolve(mockCwd, 'generated-diagrams'), 
        { recursive: true }
      );
    });
  });

  describe('getDiagramStorageInfo', () => {
    it('should return custom path info when environment variable is set', () => {
      process.env.DIAGRAM_STORAGE_PATH = '/custom/path';
      
      const result = getDiagramStorageInfo();
      
      expect(result).toEqual({
        basePath: path.resolve('/custom/path'),
        isCustomPath: true,
        source: 'environment'
      });
    });

    it('should return default path info when no environment variable', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const result = getDiagramStorageInfo();
      
      expect(result).toEqual({
        basePath: path.resolve(mockCwd, 'generated-diagrams'),
        isCustomPath: false,
        source: 'default'
      });
    });

    it('should handle empty environment variable as default', () => {
      process.env.DIAGRAM_STORAGE_PATH = '';
      const mockCwd = '/test/project';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
      mockExistsSync.mockImplementation((filePath) => {
        return filePath === path.join(mockCwd, 'package.json');
      });

      const result = getDiagramStorageInfo();
      
      expect(result).toEqual({
        basePath: path.resolve(mockCwd, 'generated-diagrams'),
        isCustomPath: false,
        source: 'default'
      });
    });

    it('should handle whitespace-only environment variable as custom', () => {
      process.env.DIAGRAM_STORAGE_PATH = '   ';
      
      const result = getDiagramStorageInfo();
      
      expect(result.isCustomPath).toBe(true);
      expect(result.source).toBe('environment');
      expect(result.basePath).toBe(path.resolve('   '));
    });
  });
});
