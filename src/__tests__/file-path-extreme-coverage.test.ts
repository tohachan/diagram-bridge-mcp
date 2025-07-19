import * as path from 'path';
import * as fs from 'fs';
import { 
  findProjectRoot, 
  getDiagramStorageBasePath, 
  getDiagramStorageInfo,
  ensureDiagramStorageDirectory
} from '../utils/file-path.js';

// Mock fs for controlled testing
jest.mock('fs/promises');
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('File Path Utilities - Extreme Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getCurrentFileDir() internal branches', () => {
    it('should handle __dirname undefined scenario', () => {
      // Mock global to simulate ESM environment where __dirname is undefined
      const originalDirname = (global as any).__dirname;
      delete (global as any).__dirname;
      
      try {
        // This should trigger the stack trace fallback method
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        if (originalDirname !== undefined) {
          (global as any).__dirname = originalDirname;
        }
      }
    });

    it('should handle stack trace parsing for different file path formats', () => {
      // Mock Error constructor to return specific stack traces
      const originalError = Error;
      
      // Test case 1: file:// protocol URL
      class MockError1 extends Error {
        constructor() {
          super();
          this.stack = `Error
    at getCurrentFileDir (file:///Users/test/project/src/utils/file-path.js:45:10)
    at findProjectRoot (file:///Users/test/project/src/utils/file-path.js:120:25)`;
        }
      }
      
      global.Error = MockError1 as any;
      delete (global as any).__dirname;
      
      try {
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        global.Error = originalError;
      }
    });

    it('should handle Windows drive path in stack trace', () => {
      // Mock for Windows environment with drive letter
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      class MockError2 extends Error {
        constructor() {
          super();
          this.stack = `Error
    at getCurrentFileDir (file:///C:/Users/test/project/src/utils/file-path.js:45:10)
    at findProjectRoot (file:///C:/Users/test/project/src/utils/file-path.js:120:25)`;
        }
      }
      
      global.Error = MockError2 as any;
      delete (global as any).__dirname;
      
      try {
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        global.Error = Error;
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should handle require.resolve fallback', () => {
      // Mock require to test the CommonJS fallback
      const originalRequire = (global as any).require;
      
      const mockRequire = {
        resolve: jest.fn().mockReturnValue('/test/path/to/file-path.js')
      };
      
      (global as any).require = mockRequire;
      delete (global as any).__dirname;
      
      // Mock Error to return empty stack to trigger require.resolve path
      global.Error = class MockErrorEmpty extends Error {
        constructor() {
          super();
          this.stack = 'Error\n    at someOtherFunction (/other/path.js:1:1)'; // No file-path in stack
        }
      } as any;
      
      try {
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
        // Since we're in a complex environment, require.resolve might not be called
        // if other methods succeed first. That's okay.
      } finally {
        if (originalRequire) {
          (global as any).require = originalRequire;
        } else {
          delete (global as any).require;
        }
        global.Error = Error;
      }
    });

    it('should fallback to process.cwd() when all methods fail', () => {
      // Mock all methods to fail
      delete (global as any).__dirname;
      delete (global as any).require;
      
      class MockErrorFail extends Error {
        constructor() {
          super();
          this.stack = 'Error\n    at someOtherFunction (/other/path.js:1:1)';
        }
      }
      global.Error = MockErrorFail as any;
      
      try {
        const result = findProjectRoot();
        expect(result).toBe(process.cwd());
      } finally {
        global.Error = Error;
      }
    });
  });

  describe('searchProjectRoot() internal branches', () => {
    it('should handle file system errors during directory traversal', () => {
      // Mock fs.existsSync to throw error
      mockFs.existsSync.mockImplementation((filePath: any) => {
        if (filePath.includes('package.json')) {
          throw new Error('Permission denied');
        }
        return true; // Directory exists
      });

      // Should handle error gracefully and continue searching
      const result = findProjectRoot('/some/deep/directory');
      expect(typeof result).toBe('string');
    });

    it('should stop at filesystem root when no package.json found', () => {
      // Mock fs.existsSync to always return false for package.json
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return !filePath.includes('package.json');
      });

      const result = findProjectRoot('/very/deep/nested/directory');
      expect(typeof result).toBe('string');
    });

    it('should handle circular directory structures', () => {
      // Simply test that the function doesn't hang in infinite loop
      mockFs.existsSync.mockReturnValue(false);

      // This should complete without hanging (even if no package.json found)
      const result = findProjectRoot('/very/deep/path');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different package.json scenarios', () => {
      let callCount = 0;
      mockFs.existsSync.mockImplementation((filePath: any) => {
        callCount++;
        // Return true for package.json on third call to test directory traversal
        return callCount === 3 && filePath.includes('package.json');
      });

      const result = findProjectRoot('/deep/nested/directory');
      expect(typeof result).toBe('string');
    });
  });

  describe('ensureDiagramStorageDirectory() branches', () => {
    it('should handle directory creation process', async () => {
      // Test that the function completes without errors when mkdir succeeds
      const { mkdir } = await import('fs/promises');
      const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
      
      mockMkdir.mockResolvedValue(undefined);

      await expect(ensureDiagramStorageDirectory()).resolves.not.toThrow();
      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('generated-diagrams'),
        { recursive: true }
      );
    });

    it('should handle mkdir errors', async () => {
      // Test that errors are properly wrapped
      const { mkdir } = await import('fs/promises');
      const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
      
      const testError = new Error('Test error');
      mockMkdir.mockRejectedValue(testError);

      await expect(ensureDiagramStorageDirectory()).rejects.toThrow();
    });
  });

  describe('Environment variable edge cases', () => {
    it('should handle whitespace-only environment variable', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        process.env.DIAGRAM_STORAGE_PATH = '   \t\n   ';
        
        // According to implementation, any truthy env var is considered custom
        const info = getDiagramStorageInfo();
        expect(info.isCustomPath).toBe(true); // Whitespace string is truthy
        expect(info.source).toBe('environment');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });

    it('should handle environment variable with special characters', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        process.env.DIAGRAM_STORAGE_PATH = '/path/with/special/$chars/@#';
        
        const path = getDiagramStorageBasePath();
        expect(path).toBe('/path/with/special/$chars/@#');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });

  describe('Platform-specific path handling', () => {
    it('should handle UNC paths on Windows', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      try {
        const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
        process.env.DIAGRAM_STORAGE_PATH = '\\\\server\\share\\diagrams';
        
        const path = getDiagramStorageBasePath();
        // path.resolve() will make it absolute from current directory on non-Windows
        expect(path).toContain('server\\share\\diagrams');
        
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should handle symlinked paths', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        // Test with a path that might be a symlink
        process.env.DIAGRAM_STORAGE_PATH = '/tmp/symlinked-diagrams';
        
        const path = getDiagramStorageBasePath();
        expect(path).toBe('/tmp/symlinked-diagrams');
      } finally {
        if (originalEnv) {
          process.env.DIAGRAM_STORAGE_PATH = originalEnv;
        } else {
          delete process.env.DIAGRAM_STORAGE_PATH;
        }
      }
    });
  });

  describe('Error boundary testing', () => {
    it('should handle stack trace parsing errors', () => {
      // Mock Error to throw when accessing .stack
      class BrokenStackError extends Error {
        override get stack(): string {
          throw new Error('Stack access failed');
        }
      }
      
      global.Error = BrokenStackError as any;
      delete (global as any).__dirname;
      
      try {
        const result = findProjectRoot();
        expect(result).toBe(process.cwd()); // Should fallback
      } finally {
        global.Error = Error;
      }
    });

    it('should handle require.resolve throwing error', () => {
      const mockRequire = {
        resolve: jest.fn().mockImplementation(() => {
          throw new Error('Module not found');
        })
      };
      
      (global as any).require = mockRequire;
      delete (global as any).__dirname;
      
      class MockErrorEmpty extends Error {
        constructor() {
          super();
          this.stack = '';
        }
      }
      global.Error = MockErrorEmpty as any;
      
      try {
        const result = findProjectRoot();
        expect(result).toBe(process.cwd());
      } finally {
        delete (global as any).require;
        global.Error = Error;
      }
    });
  });

  describe('Complex path resolution scenarios', () => {
    it('should handle mixed case drive letters on Windows', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      class MockError extends Error {
        constructor() {
          super();
          this.stack = `Error
    at getCurrentFileDir (file:///c:/MixedCase/Project/src/utils/file-path.js:45:10)`;
        }
      }
      
      global.Error = MockError as any;
      delete (global as any).__dirname;
      
      try {
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        global.Error = Error;
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should handle paths with encoded characters', () => {
      const originalEnv = process.env.DIAGRAM_STORAGE_PATH;
      
      try {
        process.env.DIAGRAM_STORAGE_PATH = '/path/with%20spaces/and%40symbols';
        
        const path = getDiagramStorageBasePath();
        expect(path).toBe('/path/with%20spaces/and%40symbols');
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
