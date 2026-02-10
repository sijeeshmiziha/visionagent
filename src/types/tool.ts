/**
 * Tool-related types
 * Re-exports AI SDK Tool, tool, zodSchema; keeps ToolConfig and ToolContext for defineTool
 */

import type { z } from 'zod';

export type { Tool } from 'ai';
export { tool, zodSchema, jsonSchema } from 'ai';

/**
 * Configuration for defining a tool (input to defineTool)
 */
export interface ToolConfig<TInput extends z.ZodType = z.ZodType, TOutput = unknown> {
  /** Unique name for the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** Zod schema for input validation */
  input: TInput;
  /** The handler function that executes the tool */
  handler: (input: z.infer<TInput>, context?: ToolContext) => Promise<TOutput>;
}

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
  /** Optional model for tools that need AI capabilities */
  model?: unknown;
  /** Optional logger */
  logger?: unknown;
  /** Additional custom context */
  [key: string]: unknown;
}

/**
 * Result of tool execution (for executeTool / executeToolByName)
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
}
