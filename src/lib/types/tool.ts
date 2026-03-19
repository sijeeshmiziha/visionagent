/**
 * Tool-related types
 * VisionAgent Tool type and context (no AI SDK dependency)
 */

import type { z } from 'zod';

/** JSON Schema object for tool parameters (provider-agnostic) */
export type JsonSchemaObject = Record<string, unknown>;

/**
 * VisionAgent Tool: description, parameters schema, and execute handler.
 * Used by defineTool and by provider adapters to convert to provider-specific tool format.
 * Use Tool<any, any> for tool sets so that specific tools (Tool<X, Y>) are assignable.
 */
export interface Tool<TInput = unknown, TOutput = unknown> {
  /** Optional tool name (usually the key in the tool set) */
  name?: string;
  /** Description of what the tool does */
  description: string;
  /** JSON Schema for tool input (from zodToJsonSchema) */
  parameters?: JsonSchemaObject;
  /** Execute the tool with validated input */
  execute: (input: TInput, context?: ToolExecutionOptions) => Promise<TOutput>;
}

/** Tool type for use in Record<string, Tool> / tool sets (accepts any specific tool). Uses broad generics for assignability. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional for ToolSet/AgentTool variance
export type AnyTool = Tool<any, any>;

/**
 * Options passed to tool execute (e.g. toolCallId, abortSignal)
 */
export interface ToolExecutionOptions {
  toolCallId?: string;
  messages?: unknown[];
  abortSignal?: AbortSignal;
}

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
