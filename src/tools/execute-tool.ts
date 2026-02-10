/**
 * Execute a tool with error handling (AI SDK Tool.execute)
 */

import type { Tool, ToolExecutionOptions } from 'ai';
import type { ToolExecutionResult } from '../types/tool';
import { ToolError } from '../core/errors';

/** Minimal options for tool execution (subset of ToolExecutionOptions) */
interface ExecuteToolOptions {
  toolCallId?: string;
  abortSignal?: AbortSignal;
}

/**
 * Execute a tool and return a result object
 *
 * @example
 * ```typescript
 * const result = await executeTool(searchTool, { query: 'hello' });
 * if (result.success) {
 *   console.log(result.output);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function executeTool<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
  input: TInput,
  options?: ExecuteToolOptions
): Promise<ToolExecutionResult<TOutput>> {
  if (!tool.execute) {
    return {
      success: false,
      error: 'Tool has no execute function',
    };
  }
  try {
    const execOptions: ToolExecutionOptions = {
      toolCallId: options?.toolCallId ?? '',
      messages: [],
      abortSignal: options?.abortSignal,
    };
    // Tool.execute returns AsyncIterable<TOutput> | PromiseLike<TOutput> | TOutput
    // For non-streaming execution, we await and cast to TOutput
    const rawResult = await tool.execute(input, execOptions);
    const result = rawResult as TOutput;
    return {
      success: true,
      output: result,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Execute a tool by name from a tool set (Record<string, Tool>)
 *
 * @remarks
 * Uses the default Tool type since specific input/output types are not known
 * at compile time when looking up tools dynamically by name.
 */
export async function executeToolByName(
  tools: Record<string, Tool>,
  name: string,
  input: unknown,
  options?: ExecuteToolOptions
): Promise<ToolExecutionResult> {
  const tool = tools[name];

  if (!tool) {
    throw new ToolError(`Tool not found: ${name}`);
  }

  return executeTool(tool, input, options);
}
