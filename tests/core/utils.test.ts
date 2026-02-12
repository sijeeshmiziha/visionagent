/**
 * Tests for sumTokenUsage
 */

import { describe, it, expect } from 'vitest';
import { sumTokenUsage } from '../../src/lib/utils/utils';

import type { LanguageModelUsage } from 'ai';

function usage(input: number, output: number, total?: number): LanguageModelUsage {
  return {
    inputTokens: input,
    outputTokens: output,
    totalTokens: total ?? input + output,
    inputTokenDetails: {
      noCacheTokens: undefined,
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
    },
    outputTokenDetails: {
      textTokens: undefined,
      reasoningTokens: undefined,
    },
  };
}

describe('sumTokenUsage', () => {
  it('should sum multiple usages', () => {
    const result = sumTokenUsage([usage(10, 5), usage(20, 10), usage(5, 15)]);
    expect(result.inputTokens).toBe(35);
    expect(result.outputTokens).toBe(30);
    expect(result.totalTokens).toBe(65);
  });

  it('should return zeros for empty array', () => {
    const result = sumTokenUsage([]);
    expect(result.inputTokens).toBe(0);
    expect(result.outputTokens).toBe(0);
    expect(result.totalTokens).toBe(0);
  });

  it('should skip undefined entries', () => {
    const result = sumTokenUsage([usage(10, 5), undefined, usage(20, 10), undefined]);
    expect(result.inputTokens).toBe(30);
    expect(result.outputTokens).toBe(15);
    expect(result.totalTokens).toBe(45);
  });

  it('should handle single usage', () => {
    const result = sumTokenUsage([usage(100, 50)]);
    expect(result.inputTokens).toBe(100);
    expect(result.outputTokens).toBe(50);
    expect(result.totalTokens).toBe(150);
  });

  it('should handle mixed defined and undefined values', () => {
    const result = sumTokenUsage([undefined, usage(1, 2), undefined, usage(3, 4)]);
    expect(result.inputTokens).toBe(4);
    expect(result.outputTokens).toBe(6);
    expect(result.totalTokens).toBe(10);
  });

  it('should return correct inputTokenDetails and outputTokenDetails structure', () => {
    const result = sumTokenUsage([usage(1, 1)]);
    expect(result).toHaveProperty('inputTokenDetails');
    expect(result).toHaveProperty('outputTokenDetails');
    expect(result.inputTokenDetails).toEqual({
      noCacheTokens: undefined,
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
    });
    expect(result.outputTokenDetails).toEqual({
      textTokens: undefined,
      reasoningTokens: undefined,
    });
  });

  it('should use usage.totalTokens when provided', () => {
    const result = sumTokenUsage([usage(5, 5, 12)]);
    expect(result.totalTokens).toBe(12);
  });
});
