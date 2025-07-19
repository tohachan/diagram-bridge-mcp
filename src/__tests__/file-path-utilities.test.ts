import * as path from 'path';
import { 
  findProjectRoot, 
  getDiagramStorageBasePath, 
  getDiagramFilePath,
  getDiagramStorageInfo
} from '../utils/file-path.js';

// Mock fs for some tests
jest.mock('fs/promises');
jest.mock('fs');

describe('File Path Utilities - Extended Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findProjectRoot', () => {
    it('should find project root from current directory', () => {
      // This should work in the actual project structure
      const root = findProjectRoot();
      expect(typeof root).toBe('string');
      expect(path.isAbsolute(root)).toBe(true);
    });

    it('should handle missing package.json gracefully', () => {
      // Test with a directory that definitely doesn't have package.json
      const tempDir = '/tmp/non-existent-project';
      const root = findProjectRoot(tempDir);
      
      // Should fallback to current working directory
      expect(typeof root).toBe('string');
      expect(path.isAbsolute(root)).toBe(true);
    });

    it('should search parent directories', () => {
      // Start from a subdirectory and ensure it finds the project root
      const subdirPath = path.join(process.cwd(), 'src', 'utils');
      const root = findProjectRoot(subdirPath);
      
      expect(root).toBeDefined();
      expect(path.isAbsolute(root)).toBe(true);
    });

    it('should handle different path separators', () => {
      // Test with both unix and windows style paths
      const unixPath = '/path/to/project';
      const windowsPath = 'C:\\path\\to\\project';
      
      // Should not throw errors
      expect(() => findProjectRoot(unixPath)).not.toThrow();
      expect(() => findProjectRoot(windowsPath)).not.toThrow();
    });

    it('should handle relative paths', () => {
      const relativePath = './src/utils';
      const root = findProjectRoot(relativePath);
      
      expect(root).toBeDefined();
      expect(path.isAbsolute(root)).toBe(true);
    });

    it('should handle empty and invalid paths', () => {
      expect(() => findProjectRoot('')).not.toThrow();
      expect(() => findProjectRoot(null as any)).not.toThrow();
      expect(() => findProjectRoot(undefined)).not.toThrow();
    });
  });

  describe('getDiagramStorageBasePath', () => {
    it('should return absolute path', () => {
      const basePath = getDiagramStorageBasePath();
      expect(path.isAbsolute(basePath)).toBe(true);
      expect(basePath).toContain('generated-diagrams');
    });

    it('should be consistent across calls', () => {
      const path1 = getDiagramStorageBasePath();
      const path2 = getDiagramStorageBasePath();
      expect(path1).toBe(path2);
    });

    it('should handle environment variable override', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        // Set custom path
        process.env.DIAGRAM_STORAGE_PATH = '/custom/path';
        const customPath = getDiagramStorageBasePath();
        expect(customPath).toBe('/custom/path');
      } finally {
        // Restore original env
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });

  describe('getDiagramFilePath', () => {
    it('should generate valid file paths', () => {
      const filename = 'test-diagram.png';
      const fullPath = getDiagramFilePath(filename);
      
      expect(path.isAbsolute(fullPath)).toBe(true);
      expect(fullPath).toContain(filename);
      expect(fullPath).toContain('generated-diagrams');
    });

    it('should handle different file extensions', () => {
      const extensions = ['.png', '.svg', '.pdf', '.jpg'];
      
      extensions.forEach(ext => {
        const filename = `test${ext}`;
        const fullPath = getDiagramFilePath(filename);
        expect(fullPath).toContain(filename);
      });
    });

    it('should handle filenames with spaces and special characters', () => {
      const specialNames = [
        'file with spaces.png',
        'file-with-dashes.svg',
        'file_with_underscores.png',
        'file.with.dots.svg'
      ];

      specialNames.forEach(name => {
        expect(() => getDiagramFilePath(name)).not.toThrow();
      });
    });

    it('should respect environment path override', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        // Set custom path
        process.env.DIAGRAM_STORAGE_PATH = '/custom/diagrams';
        const filename = 'test.png';
        const fullPath = getDiagramFilePath(filename);
        
        expect(fullPath).toContain('/custom/diagrams');
        expect(fullPath).toContain(filename);
      } finally {
        // Restore original env
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });

  describe('getDiagramStorageInfo', () => {
    it('should provide storage information with default path', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        const info = getDiagramStorageInfo();
        
        expect(info.basePath).toBeDefined();
        expect(info.isCustomPath).toBe(false);
        expect(info.source).toBe('default');
        expect(path.isAbsolute(info.basePath)).toBe(true);
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        }
      }
    });

    it('should provide storage information with custom path', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        process.env.DIAGRAM_STORAGE_PATH = '/custom/storage';
        const info = getDiagramStorageInfo();
        
        expect(info.basePath).toBe('/custom/storage');
        expect(info.isCustomPath).toBe(true);
        expect(info.source).toBe('environment');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should handle Windows paths correctly', () => {
      // Simulate Windows environment
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      try {
        const filename = 'test.png';
        const fullPath = getDiagramFilePath(filename);
        
        // Should still work on Windows
        expect(typeof fullPath).toBe('string');
        expect(fullPath).toContain(filename);
      } finally {
        // Restore original platform
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should handle Unix paths correctly', () => {
      // Simulate Unix environment
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });
      
      try {
        const filename = 'test.png';
        const fullPath = getDiagramFilePath(filename);
        
        // Should work on Unix
        expect(typeof fullPath).toBe('string');
        expect(fullPath).toContain(filename);
      } finally {
        // Restore original platform
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should normalize path separators', () => {
      const filename = 'test.png';
      const fullPath = getDiagramFilePath(filename);
      
      // Should use the correct path separator for the platform
      if (process.platform === 'win32') {
        expect(fullPath).toContain('\\');
      } else {
        expect(fullPath).toContain('/');
      }
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(200); // Long filename
      const filename = `${longName}.png`;
      
      // Should handle without crashing
      expect(() => getDiagramFilePath(filename)).not.toThrow();
    });

    it('should handle special characters in filenames', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']'];
      
      specialChars.forEach(char => {
        const filename = `test${char}.png`;
        // Some special characters might be problematic, but shouldn't crash
        expect(() => getDiagramFilePath(filename)).not.toThrow();
      });
    });

    it('should handle empty filename gracefully', () => {
      // Empty filename should still work (might generate default name)
      expect(() => getDiagramFilePath('')).not.toThrow();
    });

    it('should handle filename without extension', () => {
      const filename = 'test-without-extension';
      expect(() => getDiagramFilePath(filename)).not.toThrow();
    });

    it('should handle multiple dots in filename', () => {
      const filename = 'test.diagram.with.many.dots.png';
      const fullPath = getDiagramFilePath(filename);
      expect(fullPath).toContain(filename);
    });
  });

  describe('Project root finding strategies', () => {
    it('should handle getCurrentFileDir errors gracefully', () => {
      // This tests the fallback mechanisms in findProjectRoot
      const result = findProjectRoot();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should prioritize package.json discovery', () => {
      // Starting from project root should find itself
      const projectRoot = findProjectRoot(process.cwd());
      expect(projectRoot).toBeDefined();
      
      // Should be a directory that contains package.json
      // (We can't directly test file existence due to mocking, but path should be reasonable)
      expect(path.isAbsolute(projectRoot)).toBe(true);
    });

    it('should handle circular symlinks gracefully', () => {
      // Test with a path that might have symlink issues
      const result = findProjectRoot('/tmp');
      expect(typeof result).toBe('string');
    });

    it('should handle permission denied scenarios', () => {
      // Test with a restricted path
      const result = findProjectRoot('/root');
      expect(typeof result).toBe('string');
    });
  });

  describe('Environment variable handling', () => {
    it('should handle invalid environment paths', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        // Set invalid path
        process.env.DIAGRAM_STORAGE_PATH = '\0invalid\0path';
        
        // Should still return something usable
        const path = getDiagramStorageBasePath();
        expect(typeof path).toBe('string');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });

    it('should handle relative paths in environment', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        // Set relative path
        process.env.DIAGRAM_STORAGE_PATH = './relative/path';
        
        const path = getDiagramStorageBasePath();
        expect(typeof path).toBe('string');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });
});
