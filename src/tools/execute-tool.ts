/**
 * Execute a tool with error handling
 */

import type { Tool, ToolContext, ToolExecutionResult } from '../types/tool';
import { ToolError } from '../core/errors';

/**
 * Execute a tool and return a result object
 *
 * @example
 * ```typescript
 * const result = await executeTool(searchTool, { query: 'hello' });
 * if (result.success) {
 *   console.log(result.result);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function executeTool<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
  input: TInput,
  context?: ToolContext
): Promise<ToolExecutionResult<TOutput>> {
  try {
    const result = await tool.execute(input, context);
    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Execute a tool by name from a list of tools
 */
export async function executeToolByName(
  tools: Tool[],
  name: string,
  input: unknown,
  context?: ToolContext
): Promise<ToolExecutionResult> {
  const tool = tools.find(t => t.name === name);

  if (!tool) {
    throw new ToolError(`Tool not found: ${name}`);
  }

  return executeTool(tool, input, context);
}
