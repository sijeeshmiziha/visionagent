/**
 * Utility functions
 */

import type { LanguageModelUsage } from 'ai';

/**
 * Retry a function with exponential backoff and jitter.
 * Retries on any error by default; supply `shouldRetry` to restrict.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: {
    maxAttempts?: number;
    baseDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 500, shouldRetry } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (shouldRetry && !shouldRetry(error)) throw error;
      if (attempt === maxAttempts - 1) break;

      // Exponential backoff with jitter: base * 2^attempt + random(0, base)
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

const emptyDetails = {
  noCacheTokens: undefined as number | undefined,
  cacheReadTokens: undefined as number | undefined,
  cacheWriteTokens: undefined as number | undefined,
};
const emptyOutputDetails = {
  textTokens: undefined as number | undefined,
  reasoningTokens: undefined as number | undefined,
};

/**
 * Sum token usage from multiple steps (AI SDK LanguageModelUsage)
 */
export function sumTokenUsage(usages: (LanguageModelUsage | undefined)[]): LanguageModelUsage {
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;

  for (const usage of usages) {
    if (usage) {
      inputTokens += usage.inputTokens ?? 0;
      outputTokens += usage.outputTokens ?? 0;
      totalTokens += usage.totalTokens ?? 0;
    }
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    inputTokenDetails: emptyDetails,
    outputTokenDetails: emptyOutputDetails,
  };
}
