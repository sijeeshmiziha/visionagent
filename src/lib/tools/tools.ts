/**
 * Tools: defineTool, createToolSet, execute, zodToJsonSchema
 */

import { z } from 'zod';
import type {
  Tool,
  ToolConfig,
  ToolContext,
  ToolExecutionOptions,
  ToolExecutionResult,
  JsonSchemaObject,
  AnyTool,
} from '../types/tool';
import { ToolError } from '../utils/errors';

/** Build a VisionAgent Tool from config (name is the key in createToolSet). */
export function defineTool<TInput extends z.ZodType, TOutput>(
  config: ToolConfig<TInput, TOutput>
): Tool<z.infer<TInput>, TOutput> {
  const { name, description, input: inputSchema, handler } = config;
  const parameters = zodToJsonSchema(inputSchema);
  return {
    name,
    description,
    parameters,
    execute: async (args: unknown, ctx?: ToolExecutionOptions): Promise<TOutput> => {
      const parsed = inputSchema.safeParse(args);
      if (!parsed.success)
        throw new ToolError(`Invalid input: ${parsed.error.message}`, name, parsed.error);
      try {
        return await handler(parsed.data as z.infer<TInput>, ctx as ToolContext | undefined);
      } catch (e) {
        if (e instanceof ToolError) throw e;
        throw new ToolError(
          `Tool "${name}" failed: ${e instanceof Error ? e.message : String(e)}`,
          name,
          e instanceof Error ? e : undefined
        );
      }
    },
  };
}

export type ToolSet = Record<string, AnyTool>;

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
    });
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
  if (!toolImpl) {
    const available = Object.keys(tools).join(', ') || '(none)';
    throw new ToolError(`Tool not found: "${name}". Available tools: ${available}`);
  }
  return executeTool(toolImpl, input, options);
}

export function zodToJsonSchema(schema: z.ZodType): JsonSchemaObject {
  const result = z.toJSONSchema(schema) as JsonSchemaObject & {
    $schema?: string;
    definitions?: unknown;
  };
  const { $schema: _s, definitions: _d, ...rest } = result;
  return rest as JsonSchemaObject;
}

export type { JsonSchemaObject };
