/**
 * Define a tool with Zod schema validation (AI SDK tool() + inputSchema)
 */

import type { z } from 'zod';
import { tool } from 'ai';
import type { ToolConfig, ToolContext } from '../types/tool';
import type { Tool } from '../types/tool';
import { ToolError } from '../core/errors';

/**
 * Return type: named tool for use with createToolSet or manual record.
 */
export interface NamedTool {
  name: string;
  tool: Tool;
}

/**
 * Define a tool with input validation using Zod. Returns { name, tool } for createToolSet or use .tool in a record.
 * Use as: createToolSet([defineTool({...})]) or { [defineTool({...}).name]: defineTool({...}).tool }
 *
 * @example
 * ```typescript
 * const searchTool = defineTool({
 *   name: 'web_search',
 *   description: 'Search the web for information',
 *   input: z.object({
 *     query: z.string().describe('The search query'),
 *     limit: z.number().optional().default(10)
 *   }),
 *   handler: async ({ query, limit }) => {
 *     const results = await search(query, limit);
 *     return { results };
 *   }
 * });
 * const tools = createToolSet([searchTool]);
 * ```
 */
export function defineTool<TInput extends z.ZodType, TOutput>(
  config: ToolConfig<TInput, TOutput>
): NamedTool {
  const { name, description, input: inputSchema, handler } = config;

  const toolConfig = {
    description,
    inputSchema,
    execute: async (
      args: unknown,
      _opts: { toolCallId: string; messages: unknown[] }
    ): Promise<TOutput> => {
      const parsed = inputSchema.safeParse(args);
      if (!parsed.success) {
        throw new ToolError(`Invalid input: ${parsed.error.message}`, name, parsed.error);
      }
      try {
        // Context is optional for handlers, pass undefined
        const context: ToolContext | undefined = undefined;
        return await handler(parsed.data, context);
      } catch (error) {
        if (error instanceof ToolError) {
          throw error;
        }
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ToolError(`Tool "${name}" execution failed: ${err.message}`, name, err);
      }
    },
  };
  // Zod 4 ZodType and AI SDK 6 FlexibleSchema overload resolution: cast via unknown
  const toolImpl = tool(toolConfig as unknown as Parameters<typeof tool>[0]);
  return { name, tool: toolImpl };
}
