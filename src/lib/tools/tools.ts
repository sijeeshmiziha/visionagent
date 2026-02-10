/**
 * Tools: defineTool, createToolSet, execute, zodToJsonSchema
 */

import { z } from 'zod';
import { tool } from 'ai';
import type { Tool, ToolExecutionOptions } from 'ai';
import type { ToolConfig, ToolContext, ToolExecutionResult } from '../types/tool';
import { ToolError } from '../utils/errors';

/** Tool has description (and optional title) in config; name is the key in createToolSet. */
export function defineTool<TInput extends z.ZodType, TOutput>(
  config: ToolConfig<TInput, TOutput>
): Tool {
  const { name, description, input: inputSchema, handler } = config;
  return tool({
    description,
    inputSchema,
    execute: async (args: unknown): Promise<TOutput> => {
      const parsed = inputSchema.safeParse(args);
      if (!parsed.success)
        throw new ToolError(`Invalid input: ${parsed.error.message}`, name, parsed.error);
      try {
        return await handler(parsed.data as z.infer<TInput>, undefined as ToolContext | undefined);
      } catch (e) {
        if (e instanceof ToolError) throw e;
        throw new ToolError(
          `Tool "${name}" failed: ${e instanceof Error ? e.message : String(e)}`,
          name,
          e instanceof Error ? e : undefined
        );
      }
    },
  } as unknown as Parameters<typeof tool>[0]);
}

export type ToolSet = Record<string, Tool>;

/** Pass a record: key = tool name (same as in defineTool config). */
export function createToolSet(tools: ToolSet): ToolSet {
  return tools;
}

export function getTools(toolSet: ToolSet): Tool[] {
  return Object.values(toolSet);
}

export function getTool(toolSet: ToolSet, name: string): Tool | undefined {
  return toolSet[name];
}

export async function executeTool<TInput, TOutput>(
  toolImpl: Tool<TInput, TOutput>,
  input: TInput,
  options?: { toolCallId?: string; abortSignal?: AbortSignal }
): Promise<ToolExecutionResult<TOutput>> {
  if (!toolImpl.execute) return { success: false, error: 'Tool has no execute function' };
  try {
    const out = await toolImpl.execute(input, {
      toolCallId: options?.toolCallId ?? '',
      messages: [],
      abortSignal: options?.abortSignal,
    } as ToolExecutionOptions);
    return { success: true, output: out as TOutput };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

export async function executeToolByName(
  tools: ToolSet,
  name: string,
  input: unknown,
  options?: { toolCallId?: string; abortSignal?: AbortSignal }
): Promise<ToolExecutionResult> {
  const toolImpl = tools[name];
  if (!toolImpl) throw new ToolError(`Tool not found: ${name}`);
  return executeTool(toolImpl, input, options);
}

export type JsonSchemaObject = Record<string, unknown>;

export function zodToJsonSchema(schema: z.ZodType): JsonSchemaObject {
  const result = z.toJSONSchema(schema) as JsonSchemaObject & {
    $schema?: string;
    definitions?: unknown;
  };
  const { $schema: _s, definitions: _d, ...rest } = result;
  return rest as JsonSchemaObject;
}
