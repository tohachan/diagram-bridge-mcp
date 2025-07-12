/**
 * Kroki Configuration
 * Prioritizes local Docker setup over cloud services
 */

export interface KrokiConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  useLocal: boolean;
  cloudFallback: boolean;
  cloudUrl: string;
}

/**
 * Get Kroki configuration from environment variables
 * Default behavior: Always use local Docker Kroki
 */
export function getKrokiConfig(): KrokiConfig {
  const useLocal = process.env.KROKI_USE_LOCAL !== 'false'; // Default: true
  const cloudFallback = process.env.KROKI_CLOUD_FALLBACK === 'true'; // Default: false
  
  // Auto-detect environment and set appropriate URL
  let localUrl: string;
  if (process.env.KROKI_URL) {
    // Explicit URL from environment
    localUrl = process.env.KROKI_URL;
  } else if (process.env.NODE_ENV === 'production' && process.env.DOCKER_CONTAINER) {
    // Running inside Docker container
    localUrl = 'http://kroki:8000';
  } else {
    // Running locally (development or local MCP)
    localUrl = 'http://localhost:8000';
  }
  
  // Cloud service URL (only used if explicitly enabled)
  const cloudUrl = process.env.KROKI_CLOUD_URL || 'https://kroki.io';
  
  return {
    baseUrl: useLocal ? localUrl : cloudUrl,
    timeout: parseInt(process.env.KROKI_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.KROKI_MAX_RETRIES || '3'),
    useLocal,
    cloudFallback,
    cloudUrl
  };
}

/**
 * Validate Kroki configuration
 */
export function validateKrokiConfig(config: KrokiConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.baseUrl) {
    errors.push('KROKI_URL is required');
  }
  
  if (config.timeout < 1000) {
    errors.push('KROKI_TIMEOUT must be at least 1000ms');
  }
  
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push('KROKI_MAX_RETRIES must be between 0 and 10');
  }
  
  // Validate local setup requirements
  if (config.useLocal) {
    if (!config.baseUrl.includes('kroki:8000') && !config.baseUrl.includes('localhost:8000')) {
      console.warn('Warning: KROKI_USE_LOCAL=true but URL does not point to local Docker service');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(config: KrokiConfig): string {
  if (config.useLocal) {
    return `Local Docker Kroki at ${config.baseUrl} (cloud fallback: ${config.cloudFallback ? 'enabled' : 'disabled'})`;
  } else {
    return `Cloud Kroki at ${config.baseUrl}`;
  }
}

// Export default configuration
export const KROKI_CONFIG = getKrokiConfig();
