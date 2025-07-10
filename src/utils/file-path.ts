import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Get the base directory for storing diagram files
 * Uses DIAGRAM_STORAGE_PATH environment variable if set,
 * otherwise defaults to 'generated-diagrams' in current working directory
 */
export function getDiagramStorageBasePath(): string {
  const envPath = process.env.DIAGRAM_STORAGE_PATH;
  
  if (envPath) {
    // Use the environment variable path as-is (can be relative or absolute)
    return path.resolve(envPath);
  }
  
  // Default: absolute path to generated-diagrams in current working directory
  return path.resolve(process.cwd(), 'generated-diagrams');
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