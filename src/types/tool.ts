/**
 * Tool-related types
 * Re-exports AI SDK Tool, tool, jsonSchema, ToolExecutionOptions; keeps ToolConfig and ToolContext for defineTool
 */

import type { z } from 'zod';

export type { Tool, ToolExecutionOptions } from 'ai';
export { tool, jsonSchema } from 'ai';

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
 * Logger interface for tool context
 */
export interface ToolLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | Record<string, unknown>): void;
}

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
  /** Optional model for tools that need AI capabilities */
  model?: { invoke: (...args: unknown[]) => Promise<unknown> };
  /** Optional logger */
  logger?: ToolLogger;
  /** Additional custom context */
  [key: string]: unknown;
}

/**
 * Result of tool execution (for executeTool / executeToolByName)
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  output?: T;
  error?: string;
}
