/**
 * Tool-related types
 */

import type { z } from 'zod';

/**
 * Configuration for defining a tool
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
 * A defined tool ready for use
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Tool<TInput = any, TOutput = any> {
  /** Unique name for the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** Execute the tool with validated input */
  execute: (input: TInput, context?: ToolContext) => Promise<TOutput>;
  /** Get the JSON Schema for the tool input */
  getInputSchema: () => JsonSchema;
  /** Get the tool definition for LLM */
  toDefinition: () => ToolDefinition;
}

/**
 * Tool definition for LLM function calling
 */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}

/**
 * JSON Schema type (simplified)
 */
export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  description?: string;
  items?: JsonSchema;
  enum?: unknown[];
  default?: unknown;
  [key: string]: unknown;
}

/**
 * Result of tool execution
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
}
