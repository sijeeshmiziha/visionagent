/**
 * Agent-related types
 * Uses AI SDK types for messages, tool calls/results, and usage
 */

import type { Tool } from 'ai';
import type { Model } from './model';
import type { ModelMessage } from './common';
import type { LanguageModelUsage } from './model';
import type { ModelToolCall } from './model';

/**
 * Tool type for agent context
 * Uses the default Tool type which accepts any input/output schema
 */
export type AgentTool = Tool;

/**
 * Tool result shape (AI SDK compatible)
 */
export interface AgentToolResult {
  toolCallId: string;
  toolName: string;
  output: unknown;
  isError?: boolean;
}

/**
 * Configuration for running an agent
 */
export interface AgentConfig {
  /** The model to use for generation */
  model: Model;
  /** Tools available to the agent */
  tools: Record<string, AgentTool>;
  /** System prompt for the agent */
  systemPrompt: string;
  /** The user's input/query */
  input: string;
  /** Maximum number of iterations (tool call rounds) */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
}

/**
 * A single step in the agent's execution
 */
export interface AgentStep {
  /** The iteration number (0-indexed) */
  iteration: number;
  /** The model's response text (if any) */
  content?: string;
  /** Tool calls made in this step (AI SDK shape) */
  toolCalls?: ModelToolCall[];
  /** Results from tool executions (AI SDK shape) */
  toolResults?: AgentToolResult[];
  /** Token usage for this step */
  usage?: LanguageModelUsage;
}

/**
 * Result of running an agent
 */
export interface AgentResult {
  /** The final output from the agent */
  output: string;
  /** All steps taken during execution */
  steps: AgentStep[];
  /** Total token usage across all steps */
  totalUsage?: LanguageModelUsage;
  /** The full message history (ModelMessage[]) */
  messages: ModelMessage[];
}
