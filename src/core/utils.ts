/**
 * Utility functions
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory
 */
export function isDirectory(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read a file as base64
 */
export function readFileAsBase64(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: 'base64' });
}

/**
 * Get file extension (lowercase)
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Get file name without extension
 */
export function getFileName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Read directory contents
 */
export function readDirectory(dirPath: string): string[] {
  return fs.readdirSync(dirPath);
}

/**
 * Join paths
 */
export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error = new Error('Retry failed');
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Sum token usage
 */
export function sumTokenUsage(
  usages: ({ input: number; output: number; total: number } | undefined)[]
): { input: number; output: number; total: number } {
  let input = 0;
  let output = 0;
  let total = 0;

  for (const usage of usages) {
    if (usage) {
      input += usage.input;
      output += usage.output;
      total += usage.total;
    }
  }

  return { input, output, total };
}
