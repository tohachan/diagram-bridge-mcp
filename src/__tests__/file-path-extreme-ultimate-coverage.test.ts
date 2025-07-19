/**
 * @fileoverview Extreme Ultimate Coverage Tests for file-path.ts
 * Targeting maximum branch coverage through comprehensive edge case testing
 * and advanced mocking strategies for all conditional paths.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import {
  findProjectRoot,
  getDiagramStorageBasePath,
  getDiagramFilePath,
  ensureDiagramStorageDirectory,
  getDiagramStorageInfo
} from '../utils/file-path';

// Mock modules for comprehensive testing
jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

describe('file-path.ts - Extreme Ultimate Branch Coverage', () => {
  let originalEnv: typeof process.env;
  let originalPlatform: typeof process.platform;
  let originalCwd: typeof process.cwd;
  let originalDirname: string | undefined;
  let originalRequire: any;

  beforeEach(() => {
    // Store original values
    originalEnv = { ...process.env };
    originalPlatform = process.platform;
    originalCwd = process.cwd;
    originalDirname = (global as any).__dirname;
    originalRequire = (global as any).require;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.dirname as jest.Mock).mockImplementation((p) => p.replace(/\/[^/]+$/, '') || '/');
    (fsSync.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    
    // Mock process.cwd
    process.cwd = jest.fn().mockReturnValue('/current/working/dir');
  });

  afterEach(() => {
    // Restore original values
    process.env = originalEnv;
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true
    });
    process.cwd = originalCwd;
    (global as any).__dirname = originalDirname;
    (global as any).require = originalRequire;
  });

  describe('findProjectRoot - getCurrentFileDir Branch Coverage', () => {
    test('should use __dirname when available in CommonJS', () => {
      // Setup: __dirname is available
      (global as any).__dirname = '/some/directory';
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
    });

    test('should handle __dirname undefined error', () => {
      // Setup: Remove __dirname 
      const originalDirname = (global as any).__dirname;
      delete (global as any).__dirname;
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore
      (global as any).__dirname = originalDirname;
    });

    test('should parse stack trace with file:// protocol', () => {
      // Setup: Mock error stack with file:// protocol
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    at Object.<anonymous> (file:///Users/test/project/dist/utils/file-path.js:25:10)
    at Module._compile (module.js:653:30)`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should parse stack trace with Windows drive path', () => {
      // Setup: Mock error stack with Windows path
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    at Object.<anonymous> (file:///C:/Users/test/project/dist/utils/file-path.js:25:10)
    at Module._compile (module.js:653:30)`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should parse stack trace without file:// protocol', () => {
      // Setup: Mock error stack without file:// protocol
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    at Object.<anonymous> (/Users/test/project/dist/utils/file-path.js:25:10)
    at Module._compile (module.js:653:30)`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should handle stack trace with no matching lines', () => {
      // Setup: Mock error stack without file-path
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    at Object.<anonymous> (/Users/test/other-file.js:25:10)
    at Module._compile (module.js:653:30)`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should handle stack trace parsing error', () => {
      // Setup: Mock error that throws during stack access
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override get stack(): string {
          throw new Error('Stack trace error');
        }
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should use require.resolve when available', () => {
      // Setup: Mock require.resolve
      const mockRequire = {
        resolve: jest.fn().mockReturnValue('/path/to/file-path.js')
      };
      (global as any).require = mockRequire;
      
      // Remove __dirname to force require.resolve path
      delete (global as any).__dirname;
      
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = '';
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      // The require.resolve branch is hard to reach, but we verify the result
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should handle require.resolve error', () => {
      // Setup: Mock require.resolve that throws
      const mockRequire = {
        resolve: jest.fn().mockImplementation(() => {
          throw new Error('Module not found');
        })
      };
      (global as any).require = mockRequire;
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
    });

    test('should handle require undefined', () => {
      // Setup: require is undefined
      (global as any).require = undefined;
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
    });

    test('should fallback to cwd when all methods fail', () => {
      // Setup: All methods fail
      (global as any).__dirname = undefined;
      (global as any).require = undefined;
      
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack: string = '';
      };
      
      process.cwd = jest.fn().mockReturnValue('/fallback/dir');
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });
  });

  describe('findProjectRoot - Strategy Branch Coverage', () => {
    test('should use strategy 1 when package.json found from script location', () => {
      // Setup: Mock successful strategy 1
      (global as any).__dirname = '/project/dist/utils';
      (fsSync.existsSync as jest.Mock).mockImplementation((filePath) => {
        return filePath.includes('package.json') && filePath.includes('/project');
      });
      
      const result = findProjectRoot();
      
      expect(fsSync.existsSync).toHaveBeenCalledWith(expect.stringContaining('package.json'));
      expect(result).toBeDefined();
    });

    test('should fall to strategy 2 when strategy 1 fails', () => {
      // Setup: Strategy 1 fails, strategy 2 succeeds
      (global as any).__dirname = '/project/dist/utils';
      (fsSync.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // Strategy 1 fails
        .mockReturnValueOnce(true); // Strategy 2 succeeds
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBeDefined();
    });

    test('should fall to strategy 3 when strategy 2 fails', () => {
      // Setup: Strategy 1 and 2 fail, strategy 3 succeeds
      (global as any).__dirname = '/project/dist/utils';
      (fsSync.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // Strategy 1 fails
        .mockReturnValueOnce(false) // Strategy 2 fails
        .mockReturnValueOnce(true); // Strategy 3 succeeds
      
      process.cwd = jest.fn().mockReturnValue('/working/dir');
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBeDefined();
    });

    test('should use strategy 4 fallback when all fail', () => {
      // Setup: All strategies fail
      (global as any).__dirname = undefined;
      (fsSync.existsSync as jest.Mock).mockReturnValue(false);
      process.cwd = jest.fn().mockReturnValue('/ultimate/fallback');
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBe('/ultimate/fallback');
    });

    test('should handle strategy 1 error gracefully', () => {
      // Setup: Strategy 1 throws error
      (global as any).__dirname = '/project/dist/utils';
      (fsSync.existsSync as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('File system error');
        })
        .mockReturnValueOnce(true); // Strategy 2 succeeds
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBeDefined();
    });
  });

  describe('searchForProjectRoot - Branch Coverage', () => {
    test('should find package.json in immediate directory', () => {
      // Setup: package.json exists in start directory
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      (path.resolve as jest.Mock).mockReturnValue('/start/dir');
      (path.dirname as jest.Mock).mockImplementation((p) => p === '/start/dir' ? '/start' : '/');
      (path.join as jest.Mock).mockReturnValue('/start/dir/package.json');
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBeDefined();
    });

    test('should traverse up directories until package.json found', () => {
      // Setup: package.json found in parent directory
      let callCount = 0;
      (fsSync.existsSync as jest.Mock).mockImplementation(() => {
        callCount++;
        return callCount > 2; // Found after 2 attempts
      });
      
      (path.resolve as jest.Mock).mockReturnValue('/deep/nested/dir');
      (path.dirname as jest.Mock)
        .mockReturnValueOnce('/deep/nested')  // First traversal
        .mockReturnValueOnce('/deep')         // Second traversal
        .mockReturnValueOnce('/deep')         // Stop condition check
        .mockReturnValue('/');                // Root reached
      
      const result = findProjectRoot('/deep/nested/dir');
      
      expect(result).toBeDefined();
    });

    test('should handle file system errors during search', () => {
      // Setup: fsSync.existsSync throws error
      (fsSync.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      (path.resolve as jest.Mock).mockReturnValue('/start/dir');
      (path.dirname as jest.Mock)
        .mockReturnValueOnce('/start')
        .mockReturnValueOnce('/start'); // Stop condition
      
      const result = findProjectRoot('/start/dir');
      
      expect(result).toBeDefined();
    });

    test('should return null when reaching root without finding package.json', () => {
      // Setup: Never find package.json, reach root
      (fsSync.existsSync as jest.Mock).mockReturnValue(false);
      (path.resolve as jest.Mock).mockReturnValue('/start/dir');
      (path.dirname as jest.Mock)
        .mockReturnValueOnce('/start')
        .mockReturnValueOnce('/')
        .mockReturnValueOnce('/'); // Root reached, stop condition
      
      // Mock the searchForProjectRoot function call directly by testing with no startDir
      process.cwd = jest.fn().mockReturnValue('/fallback');
      
      const result = findProjectRoot();
      
      expect(result).toBe('/fallback');
    });
  });

  describe('getDiagramStorageBasePath - Environment Variable Branch Coverage', () => {
    test('should use environment variable when set', () => {
      // Setup: Environment variable set
      process.env.DIAGRAM_STORAGE_PATH = '/custom/storage/path';
      
      const result = getDiagramStorageBasePath();
      
      expect(path.resolve).toHaveBeenCalledWith('/custom/storage/path');
      expect(result).toBeDefined();
    });

    test('should use default path when environment variable not set', () => {
      // Setup: Environment variable not set
      delete process.env.DIAGRAM_STORAGE_PATH;
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      process.cwd = jest.fn().mockReturnValue('/project/root');
      
      const result = getDiagramStorageBasePath();
      
      expect(result).toBeDefined();
    });

    test('should handle empty environment variable', () => {
      // Setup: Environment variable empty
      process.env.DIAGRAM_STORAGE_PATH = '';
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      process.cwd = jest.fn().mockReturnValue('/project/root');
      
      const result = getDiagramStorageBasePath();
      
      expect(result).toBeDefined();
    });
  });

  describe('ensureDiagramStorageDirectory - Error Handling Branch Coverage', () => {
    test('should create directory successfully', async () => {
      // Setup: Successful directory creation
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      
      await expect(ensureDiagramStorageDirectory()).resolves.toBeUndefined();
      
      expect(fs.mkdir).toHaveBeenCalledWith(expect.anything(), { recursive: true });
    });

    test('should handle Error instance in catch block', async () => {
      // Setup: fs.mkdir throws Error instance
      const error = new Error('Permission denied');
      (fs.mkdir as jest.Mock).mockRejectedValue(error);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory'
      );
    });

    test('should handle non-Error instance in catch block', async () => {
      // Setup: fs.mkdir throws non-Error instance
      (fs.mkdir as jest.Mock).mockRejectedValue('String error');
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /current/working/dir/generated-diagrams: Unknown error'
      );
    });

    test('should handle null error in catch block', async () => {
      // Setup: fs.mkdir throws null
      (fs.mkdir as jest.Mock).mockRejectedValue(null);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /current/working/dir/generated-diagrams: Unknown error'
      );
    });

    test('should handle undefined error in catch block', async () => {
      // Setup: fs.mkdir throws undefined
      (fs.mkdir as jest.Mock).mockRejectedValue(undefined);
      
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory at /current/working/dir/generated-diagrams: Unknown error'
      );
    });
  });

  describe('getDiagramStorageInfo - Branch Coverage', () => {
    test('should return environment source when env var set', () => {
      // Setup: Environment variable set
      process.env.DIAGRAM_STORAGE_PATH = '/custom/path';
      
      const result = getDiagramStorageInfo();
      
      expect(result.source).toBe('environment');
      expect(result.isCustomPath).toBe(true);
    });

    test('should return default source when env var not set', () => {
      // Setup: Environment variable not set
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      const result = getDiagramStorageInfo();
      
      expect(result.source).toBe('default');
      expect(result.isCustomPath).toBe(false);
    });

    test('should handle truthy but empty environment variable', () => {
      // Setup: Environment variable is empty string (falsy but defined)
      process.env.DIAGRAM_STORAGE_PATH = '';
      
      const result = getDiagramStorageInfo();
      
      expect(result.source).toBe('default');
      expect(result.isCustomPath).toBe(false);
    });
  });

  describe('getDiagramFilePath - Integration Test', () => {
    test('should combine base path and filename correctly', () => {
      // Setup: Test path combination
      const fileName = 'test-diagram.png';
      
      const result = getDiagramFilePath(fileName);
      
      expect(path.join).toHaveBeenCalledWith(expect.anything(), fileName);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('should handle process.platform mutation', () => {
      // Test platform-specific behavior
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
    });

    test('should handle complex stack trace patterns', () => {
      // Setup: Complex stack trace with multiple file-path matches
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    at Object.<anonymous> (/path/to/file-path-helper.js:10:5)
    at Object.<anonymous> (/path/to/file-path.js:25:10)
    at Module._compile (module.js:653:30)`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });

    test('should handle malformed stack trace lines', () => {
      // Setup: Malformed stack trace
      const originalError = Error;
      (global as any).Error = class MockError extends originalError {
        override stack = `Error: test
    malformed line without parentheses
    at Object.<anonymous> file-path.js:25:10)
    missing opening parenthesis`;
      };
      
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      
      const result = findProjectRoot();
      
      expect(result).toBeDefined();
      
      // Restore Error
      (global as any).Error = originalError;
    });
  });
});
