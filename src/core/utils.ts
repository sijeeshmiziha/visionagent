/**
 * Utility functions
 */

import type { LanguageModelUsage } from 'ai';

/**
 * Sum token usage from multiple steps (AI SDK LanguageModelUsage)
 */
export function sumTokenUsage(usages: (LanguageModelUsage | undefined)[]): LanguageModelUsage {
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;

  for (const usage of usages) {
    if (usage) {
      promptTokens += usage.promptTokens;
      completionTokens += usage.completionTokens;
      totalTokens += usage.totalTokens;
    }
  }

  return { promptTokens, completionTokens, totalTokens };
}
