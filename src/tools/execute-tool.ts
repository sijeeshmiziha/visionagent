/**
 * Execute a tool with error handling (AI SDK Tool.execute)
 */

import type { Tool, ToolExecutionResult } from '../types/tool';
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
export async function executeTool<TOutput>(
  tool: Tool,
  input: unknown,
  toolCallId = ''
): Promise<ToolExecutionResult<TOutput>> {
  if (!tool.execute) {
    return {
      success: false,
      error: 'Tool has no execute function',
    };
  }
  try {
    const result = await tool.execute(input, {
      toolCallId,
      messages: [],
    });
    return {
      success: true,
      result: result as TOutput,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Execute a tool by name from a tool set (Record<string, Tool>)
 */
export async function executeToolByName(
  tools: Record<string, Tool>,
  name: string,
  input: unknown,
  toolCallId = ''
): Promise<ToolExecutionResult> {
  const tool = tools[name];

  if (!tool) {
    throw new ToolError(`Tool not found: ${name}`);
  }

  return executeTool(tool, input, toolCallId);
}
