/**
 * Utility functions
 */

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
