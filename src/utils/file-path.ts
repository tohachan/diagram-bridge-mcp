import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

/**
 * Find the project root directory by looking for package.json
 * Uses multiple strategies to locate the project root:
 * 1. From the current script location (works when file is in dist/utils/)
 * 2. From provided start directory
 * 3. From current working directory
 * 4. Fallback to current working directory
 */
export function findProjectRoot(startDir?: string): string {
  // Strategy 1: Try to find project root from current script location
  // This works when this file is compiled to dist/utils/file-path.js
  try {
    // In the compiled version, this file should be at dist/utils/file-path.js
    // So the project root should be 2 levels up
    const scriptDir = getCurrentFileDir();
    const possibleProjectRoot = path.resolve(scriptDir, '..', '..');
    
    if (fsSync.existsSync(path.join(possibleProjectRoot, 'package.json'))) {
      return possibleProjectRoot;
    }
  } catch (error) {
    // Continue to next strategy
  }
  
  // Strategy 2: Search from provided start directory
  if (startDir) {
    const found = searchForProjectRoot(startDir);
    if (found) return found;
  }
  
  // Strategy 3: Search from current working directory
  const found = searchForProjectRoot(process.cwd());
  if (found) return found;
  
  // Strategy 4: Ultimate fallback
  return process.cwd();
}

/**
 * Get the directory containing this source file
 * Uses different methods for ESM and CommonJS
 */
function getCurrentFileDir(): string {
  try {
    // For CommonJS modules (when __dirname is available)
    if (typeof __dirname !== 'undefined') {
      return __dirname;
    }
  } catch (error) {
    // Fall through to next method
  }
  
  try {
    // Alternative method using stack trace to get current file location
    // This works in both ESM and CommonJS without TypeScript issues
    const err = new Error();
    const stack = err.stack;
    if (stack) {
      const stackLines = stack.split('\n');
      // Look for this file in the stack trace
      for (const line of stackLines) {
        if (line.includes('file-path') && (line.includes('.js') || line.includes('.ts'))) {
          // Extract file path from stack trace line
          // Format: "at ... (file:///path/to/file.js:line:col)" or "at ... (/path/to/file.js:line:col)"
          const match = line.match(/\((.+?file-path[^:)]+)/);
          if (match && match[1]) {
            let filePath = match[1];
            // Remove file:// protocol if present
            if (filePath.startsWith('file://')) {
              filePath = filePath.substring(7);
            }
            // On Windows, remove leading slash if it's a drive path
            if (process.platform === 'win32' && filePath.match(/^\/[A-Za-z]:/)) {
              filePath = filePath.substring(1);
            }
            return path.dirname(filePath);
          }
        }
      }
    }
  } catch (error) {
    // Fall through to next method
  }
  
  try {
    // Try using module resolution (for CommonJS environments)
    if (typeof require !== 'undefined' && require.resolve) {
      // This might work in some Node.js environments
      const modulePath = require.resolve('./file-path');
      if (modulePath) {
        return path.dirname(modulePath);
      }
    }
  } catch (error) {
    // Fall through to fallback
  }
  
  // Fallback to current working directory
  // This works for most cases since we also have other strategies
  // to find the project root (from cwd, from provided startDir, etc.)
  return process.cwd();
}

/**
 * Search for project root starting from a given directory
 * @param startDir - Directory to start searching from
 * @returns Project root path or null if not found
 */
function searchForProjectRoot(startDir: string): string | null {
  let currentDir = path.resolve(startDir);
  
  while (currentDir !== path.dirname(currentDir)) {
    try {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fsSync.existsSync(packageJsonPath)) {
        return currentDir;
      }
    } catch (error) {
      // Continue searching if package.json doesn't exist or can't be read
    }
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * Get the base directory for storing diagram files
 * Uses DIAGRAM_STORAGE_PATH environment variable if set,
 * otherwise defaults to 'generated-diagrams' in project root directory
 */
export function getDiagramStorageBasePath(): string {
  const envPath = process.env.DIAGRAM_STORAGE_PATH;
  
  if (envPath) {
    // Use the environment variable path as-is (can be relative or absolute)
    return path.resolve(envPath);
  }
  
  // Default: absolute path to generated-diagrams in project root directory
  const projectRoot = findProjectRoot();
  return path.resolve(projectRoot, 'generated-diagrams');
}

/**
 * Generate absolute path for a diagram file
 * @param fileName - The name of the file (e.g., 'diagram-mermaid-123456789.png')
 * @returns Absolute path to the diagram file
 */
export function getDiagramFilePath(fileName: string): string {
  const basePath = getDiagramStorageBasePath();
  return path.join(basePath, fileName);
}

/**
 * Ensure the diagram storage directory exists
 * @returns Promise that resolves when directory is created/verified
 */
export async function ensureDiagramStorageDirectory(): Promise<void> {
  const basePath = getDiagramStorageBasePath();
  
  try {
    await fs.mkdir(basePath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create diagram storage directory at ${basePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get information about the diagram storage configuration
 * @returns Object with storage path info and whether it's from environment variable
 */
export function getDiagramStorageInfo(): {
  basePath: string;
  isCustomPath: boolean;
  source: 'environment' | 'default';
} {
  const envPath = process.env.DIAGRAM_STORAGE_PATH;
  const basePath = getDiagramStorageBasePath();
  
  return {
    basePath,
    isCustomPath: !!envPath,
    source: envPath ? 'environment' : 'default'
  };
} 