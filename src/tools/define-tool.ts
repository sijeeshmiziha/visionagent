/**
 * Define a tool with Zod schema validation (AI SDK tool() + zodSchema)
 */

import type { z } from 'zod';
import { tool, zodSchema } from 'ai';
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

  const toolImpl = tool({
    description,
    parameters: zodSchema(inputSchema),
    execute: async (args, _opts) => {
      const parsed = inputSchema.safeParse(args);
      if (!parsed.success) {
        throw new ToolError(`Invalid input: ${parsed.error.message}`, name, parsed.error);
      }
      try {
        return await handler(parsed.data, undefined as unknown as ToolContext);
      } catch (error) {
        if (error instanceof ToolError) {
          throw error;
        }
        throw new ToolError(
          `Tool "${name}" execution failed: ${(error as Error).message}`,
          name,
          error as Error
        );
      }
    },
  });
  return { name, tool: toolImpl };
}
