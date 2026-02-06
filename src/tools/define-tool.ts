/**
 * Define a tool with Zod schema validation
 */

import type { z } from 'zod';
import type { Tool, ToolConfig, ToolContext, ToolDefinition } from '../types/tool';
import { zodToJsonSchema } from './schema';
import { ValidationError, ToolError } from '../core/errors';

/**
 * Define a tool with input validation using Zod
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
 * ```
 */
export function defineTool<TInput extends z.ZodType, TOutput>(
  config: ToolConfig<TInput, TOutput>
): Tool<z.infer<TInput>, TOutput> {
  const { name, description, input: inputSchema, handler } = config;

  // Generate JSON Schema once
  const jsonSchema = zodToJsonSchema(inputSchema, name);

  return {
    name,
    description,

    async execute(input: z.infer<TInput>, context?: ToolContext): Promise<TOutput> {
      // Validate input
      const parseResult = inputSchema.safeParse(input);

      if (!parseResult.success) {
        throw new ValidationError(
          `Invalid input for tool "${name}": ${parseResult.error.message}`,
          parseResult.error.errors
        );
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await handler(parseResult.data, context);
      } catch (error) {
        if (error instanceof ValidationError || error instanceof ToolError) {
          throw error;
        }
        throw new ToolError(
          `Tool "${name}" execution failed: ${(error as Error).message}`,
          name,
          error as Error
        );
      }
    },

    getInputSchema() {
      return jsonSchema;
    },

    toDefinition(): ToolDefinition {
      return {
        type: 'function',
        function: {
          name,
          description,
          parameters: jsonSchema,
        },
      };
    },
  };
}
