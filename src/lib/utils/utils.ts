/**
 * Utility functions
 */

import type { LanguageModelUsage } from 'ai';

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
