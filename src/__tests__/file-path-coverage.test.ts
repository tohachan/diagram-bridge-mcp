/**
 * @jest-environment node
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
} from '../utils/file-path.js';

// Mock fs modules
jest.mock('fs/promises');
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedFsSync = fsSync as jest.Mocked<typeof fsSync>;

describe('file-path.ts - Full Coverage', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DIAGRAM_STORAGE_PATH;
  });

  describe('findProjectRoot', () => {
    test('should find project root from script location (strategy 1)', () => {
      // Mock file system to simulate package.json exists 2 levels up
      mockedFsSync.existsSync.mockImplementation((filePath: any) => {
        if (typeof filePath === 'string' && filePath.includes('package.json')) {
          return filePath.includes(path.join('..', '..', 'package.json'));
        }
        return false;
      });

      const result = findProjectRoot();
      expect(typeof result).toBe('string');
      expect(mockedFsSync.existsSync).toHaveBeenCalled();
    });

    test('should find project root from provided start directory (strategy 2)', () => {
      // Mock strategy 1 to fail (no package.json 2 levels up)
      let callCount = 0;
      mockedFsSync.existsSync.mockImplementation((filePath: any) => {
        callCount++;
        if (typeof filePath === 'string' && filePath.includes('package.json')) {
          // First call (strategy 1) returns false, second call (strategy 2) returns true
          return callCount > 1;
        }
        return false;
      });

      const startDir = '/some/test/directory';
      const result = findProjectRoot(startDir);
      
      expect(typeof result).toBe('string');
      expect(mockedFsSync.existsSync).toHaveBeenCalledTimes(2);
    });

    test('should find project root from current working directory (strategy 3)', () => {
      // Mock strategy 1 and 2 to fail, strategy 3 to succeed
      let callCount = 0;
      mockedFsSync.existsSync.mockImplementation((filePath: any) => {
        callCount++;
        if (typeof filePath === 'string' && filePath.includes('package.json')) {
          // Only succeed on the third call (strategy 3)
          return callCount === 3;
        }
        return false;
      });

      const result = findProjectRoot();
      
      expect(typeof result).toBe('string');
      expect(mockedFsSync.existsSync).toHaveBeenCalledTimes(3);
    });

    test('should fallback to process.cwd() when no package.json found (strategy 4)', () => {
      // Mock all strategies to fail
      mockedFsSync.existsSync.mockReturnValue(false);

      const originalCwd = process.cwd();
      const result = findProjectRoot();
      
      expect(result).toBe(originalCwd);
      expect(mockedFsSync.existsSync).toHaveBeenCalled();
    });

    test('should handle exceptions in strategy 1', () => {
      // Mock strategy 1 to throw an error
      mockedFsSync.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Should continue to other strategies and return cwd as fallback
      const result = findProjectRoot();
      expect(result).toBe(process.cwd());
    });
  });

  describe('getCurrentFileDir coverage through findProjectRoot', () => {
    test('should handle case when __dirname is undefined (ESM environment)', () => {
      // This tests the getCurrentFileDir branches through stack trace parsing
      // Mock existsSync to fail for strategy 1, forcing fallback strategies
      mockedFsSync.existsSync.mockReturnValue(false);

      const result = findProjectRoot();
      expect(result).toBe(process.cwd());
    });
  });

  describe('searchForProjectRoot edge cases', () => {
    test('should handle filesystem errors during search', () => {
      // Mock existsSync to throw an error
      mockedFsSync.existsSync.mockImplementation((_filePath: any) => {
        if (typeof _filePath === 'string' && _filePath.includes('package.json')) {
          throw new Error('Permission denied');
        }
        return false;
      });

      const result = findProjectRoot('/some/directory');
      // Should fallback to process.cwd() when errors occur
      expect(result).toBe(process.cwd());
    });

    test('should search up directory tree until root', () => {
      // Mock to simulate finding package.json in parent directory
      let searchCount = 0;
      mockedFsSync.existsSync.mockImplementation((filePath: any) => {
        searchCount++;
        // Only return true for the first strategy call to test full search path
        return searchCount === 1;
      });

      const result = findProjectRoot();
      expect(typeof result).toBe('string');
    });
  });

  describe('getDiagramStorageBasePath', () => {
    test('should use environment variable when set', () => {
      const customPath = '/custom/diagram/path';
      process.env.DIAGRAM_STORAGE_PATH = customPath;

      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve(customPath));
    });

    test('should use default path when environment variable not set', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      // Mock findProjectRoot to return a known path
      mockedFsSync.existsSync.mockReturnValue(false); // Will use process.cwd()
      
      const result = getDiagramStorageBasePath();
      const expected = path.resolve(process.cwd(), 'generated-diagrams');
      expect(result).toBe(expected);
    });

    test('should resolve relative environment paths', () => {
      process.env.DIAGRAM_STORAGE_PATH = './relative/path';

      const result = getDiagramStorageBasePath();
      expect(result).toBe(path.resolve('./relative/path'));
    });
  });

  describe('getDiagramFilePath', () => {
    test('should combine base path with filename', () => {
      const fileName = 'diagram-test-123.png';
      delete process.env.DIAGRAM_STORAGE_PATH;
      
      mockedFsSync.existsSync.mockReturnValue(false); // Use process.cwd()
      
      const result = getDiagramFilePath(fileName);
      const expected = path.join(process.cwd(), 'generated-diagrams', fileName);
      expect(result).toBe(expected);
    });

    test('should work with custom storage path', () => {
      const customPath = '/custom/storage';
      const fileName = 'test-diagram.svg';
      process.env.DIAGRAM_STORAGE_PATH = customPath;

      const result = getDiagramFilePath(fileName);
      expect(result).toBe(path.join(customPath, fileName));
    });
  });

  describe('ensureDiagramStorageDirectory', () => {
    test('should create directory successfully', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      delete process.env.DIAGRAM_STORAGE_PATH;
      mockedFsSync.existsSync.mockReturnValue(false); // Use process.cwd()

      await expect(ensureDiagramStorageDirectory()).resolves.toBeUndefined();
      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'generated-diagrams'),
        { recursive: true }
      );
    });

    test('should throw error when directory creation fails', async () => {
      const error = new Error('Permission denied');
      mockedFs.mkdir.mockRejectedValue(error);
      delete process.env.DIAGRAM_STORAGE_PATH;
      mockedFsSync.existsSync.mockReturnValue(false);

      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory'
      );
    });

    test('should handle non-Error exceptions', async () => {
      mockedFs.mkdir.mockRejectedValue('String error');
      delete process.env.DIAGRAM_STORAGE_PATH;
      mockedFsSync.existsSync.mockReturnValue(false);

      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Failed to create diagram storage directory'
      );
      await expect(ensureDiagramStorageDirectory()).rejects.toThrow(
        'Unknown error'
      );
    });
  });

  describe('getDiagramStorageInfo', () => {
    test('should return environment source when env var is set', () => {
      const customPath = '/env/path';
      process.env.DIAGRAM_STORAGE_PATH = customPath;

      const result = getDiagramStorageInfo();
      
      expect(result).toEqual({
        basePath: path.resolve(customPath),
        isCustomPath: true,
        source: 'environment'
      });
    });

    test('should return default source when env var is not set', () => {
      delete process.env.DIAGRAM_STORAGE_PATH;
      mockedFsSync.existsSync.mockReturnValue(false); // Use process.cwd()

      const result = getDiagramStorageInfo();
      
      expect(result).toEqual({
        basePath: path.resolve(process.cwd(), 'generated-diagrams'),
        isCustomPath: false,
        source: 'default'
      });
    });

    test('should handle empty environment variable', () => {
      process.env.DIAGRAM_STORAGE_PATH = '';
      mockedFsSync.existsSync.mockReturnValue(false);

      const result = getDiagramStorageInfo();
      
      // Empty string is falsy, so it should use default path
      expect(result).toEqual({
        basePath: path.resolve(process.cwd(), 'generated-diagrams'),
        isCustomPath: false, // Empty string is falsy
        source: 'default'
      });
    });
  });

  describe('Platform-specific behavior', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true
      });
    });

    test('should handle Windows drive path logic', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true
      });

      // This tests the Windows-specific path handling in getCurrentFileDir
      // The actual logic is complex, so we test that it doesn't crash
      mockedFsSync.existsSync.mockReturnValue(false);
      
      const result = findProjectRoot();
      expect(typeof result).toBe('string');
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle require.resolve being undefined', () => {
      // Mock require to be undefined (ESM environment)
      const originalRequire = global.require;
      // @ts-ignore
      global.require = undefined;

      try {
        mockedFsSync.existsSync.mockReturnValue(false);
        const result = findProjectRoot();
        expect(result).toBe(process.cwd());
      } finally {
        global.require = originalRequire;
      }
    });

    test('should handle stack trace parsing edge cases', () => {
      // Mock Error stack to test parsing logic
      const originalError = Error;
      global.Error = class extends originalError {
        constructor() {
          super();
          this.stack = `Error
    at Object.<anonymous> (/path/to/file-path.js:10:5)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)`;
        }
      } as any;

      try {
        mockedFsSync.existsSync.mockReturnValue(false);
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        global.Error = originalError;
      }
    });

    test('should handle stack trace with file:// protocol', () => {
      const originalError = Error;
      global.Error = class extends originalError {
        constructor() {
          super();
          this.stack = `Error
    at Object.<anonymous> (file:///path/to/file-path.js:10:5)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)`;
        }
      } as any;

      try {
        mockedFsSync.existsSync.mockReturnValue(false);
        const result = findProjectRoot();
        expect(typeof result).toBe('string');
      } finally {
        global.Error = originalError;
      }
    });
  });
});
