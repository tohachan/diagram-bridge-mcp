import { DiagramCache, CacheEntry, DiagramRenderingOutput } from '../types/diagram-rendering.js';
import { DiagramFormat } from '../types/diagram-selection.js';
import { OutputFormat } from '../types/diagram-rendering.js';

/**
 * Node in the doubly linked list for LRU implementation
 */
interface CacheNode {
  key: string;
  value: CacheEntry;
  prev: CacheNode | null;
  next: CacheNode | null;
}

/**
 * LRU Cache implementation for diagram rendering results
 */
export class DiagramLRUCache implements DiagramCache {
  private maxSize: number;
  private maxMemoryUsage: number; // in bytes
  private currentMemoryUsage: number;
  private cache: Map<string, CacheNode>;
  private head: CacheNode;
  private tail: CacheNode;
  private hitCount: number;
  private missCount: number;

  constructor(maxSize: number = 100, maxMemoryUsageMB: number = 50) {
    this.maxSize = maxSize;
    this.maxMemoryUsage = maxMemoryUsageMB * 1024 * 1024; // Convert MB to bytes
    this.currentMemoryUsage = 0;
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;

    // Initialize dummy head and tail nodes for easier list manipulation
    this.head = { key: '', value: { data: { file_path: '', resource_uri: '', content_type: '', file_size: 0 }, timestamp: 0, size: 0 }, prev: null, next: null };
    this.tail = { key: '', value: { data: { file_path: '', resource_uri: '', content_type: '', file_size: 0 }, timestamp: 0, size: 0 }, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get cached rendering result
   */
  get(key: string): CacheEntry | undefined {
    const node = this.cache.get(key);
    
    if (!node) {
      this.missCount++;
      return undefined;
    }

    // Move to head (mark as recently used)
    this.moveToHead(node);
    this.hitCount++;
    
    return node.value;
  }

  /**
   * Store rendering result in cache
   */
  set(key: string, value: CacheEntry): void {
    const existingNode = this.cache.get(key);
    
    if (existingNode) {
      // Update existing entry
      this.currentMemoryUsage -= existingNode.value.size;
      existingNode.value = value;
      this.currentMemoryUsage += value.size;
      this.moveToHead(existingNode);
    } else {
      // Add new entry
      const newNode: CacheNode = {
        key,
        value,
        prev: null,
        next: null
      };
      
      this.addToHead(newNode);
      this.cache.set(key, newNode);
      this.currentMemoryUsage += value.size;
      
      // Check size constraints and evict if necessary
      this.enforceConstraints();
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.currentMemoryUsage = 0;
    this.hitCount = 0;
    this.missCount = 0;
    
    // Reset linked list
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimal places
      memoryUsage: this.currentMemoryUsage
    };
  }

  /**
   * Generate cache key for diagram rendering request
   */
  static generateKey(code: string, format: DiagramFormat, outputFormat: OutputFormat): string {
    // Create a simple hash of the input parameters
    const input = `${format}:${outputFormat}:${code}`;
    return Buffer.from(input).toString('base64').substring(0, 64); // Limit key length
  }

  /**
   * Create cache entry from rendering output
   */
  static createCacheEntry(output: DiagramRenderingOutput): CacheEntry {
    // Use actual file size from output
    const size = output.file_size;
    
    return {
      data: output,
      timestamp: Date.now(),
      size
    };
  }

  /**
   * Check if a cache entry is still valid
   */
  static isEntryValid(entry: CacheEntry, maxAge: number = 3600000): boolean { // Default 1 hour
    return (Date.now() - entry.timestamp) < maxAge;
  }

  /**
   * Move node to head of the list (mark as most recently used)
   */
  private moveToHead(node: CacheNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Add node to head of the list
   */
  private addToHead(node: CacheNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    
    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;
  }

  /**
   * Remove node from the list
   */
  private removeNode(node: CacheNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
  }

  /**
   * Remove and return the tail node (least recently used)
   */
  private removeTail(): CacheNode | null {
    const lastNode = this.tail.prev;
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode);
      return lastNode;
    }
    return null;
  }

  /**
   * Enforce cache size and memory constraints
   */
  private enforceConstraints(): void {
    // Enforce size constraint
    while (this.cache.size > this.maxSize) {
      const removed = this.removeTail();
      if (removed) {
        this.cache.delete(removed.key);
        this.currentMemoryUsage -= removed.value.size;
      } else {
        break; // Safety break
      }
    }
    
    // Enforce memory constraint
    while (this.currentMemoryUsage > this.maxMemoryUsage && this.cache.size > 0) {
      const removed = this.removeTail();
      if (removed) {
        this.cache.delete(removed.key);
        this.currentMemoryUsage -= removed.value.size;
      } else {
        break; // Safety break
      }
    }
  }

  /**
   * Get detailed cache information for debugging
   */
  getDebugInfo(): {
    size: number;
    maxSize: number;
    memoryUsage: number;
    maxMemoryUsage: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    entries: { key: string; timestamp: number; size: number }[];
  } {
    const stats = this.stats();
    const entries: { key: string; timestamp: number; size: number }[] = [];
    
    // Walk through the linked list from head to tail
    let current = this.head.next;
    while (current && current !== this.tail) {
      entries.push({
        key: current.key,
        timestamp: current.value.timestamp,
        size: current.value.size
      });
      current = current.next;
    }
    
    return {
      size: stats.size,
      maxSize: this.maxSize,
      memoryUsage: stats.memoryUsage,
      maxMemoryUsage: this.maxMemoryUsage,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: stats.hitRate,
      entries
    };
  }

  /**
   * Prune expired entries from cache
   */
  pruneExpired(maxAge: number = 3600000): number { // Default 1 hour
    const now = Date.now();
    let removedCount = 0;
    
    // Collect keys to remove (to avoid modifying map while iterating)
    const keysToRemove: string[] = [];
    
    for (const [key, node] of this.cache.entries()) {
      if (now - node.value.timestamp > maxAge) {
        keysToRemove.push(key);
      }
    }
    
    // Remove expired entries
    for (const key of keysToRemove) {
      const node = this.cache.get(key);
      if (node) {
        this.removeNode(node);
        this.cache.delete(key);
        this.currentMemoryUsage -= node.value.size;
        removedCount++;
      }
    }
    
    return removedCount;
  }
} 