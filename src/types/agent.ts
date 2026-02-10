/**
 * Agent-related types
 */

import type { Model } from './model';
import type { Tool } from './tool';
import type { Message, ToolCall, ToolResult, TokenUsage } from './common';

/**
 * Configuration for running an agent
 */
export interface AgentConfig {
  /** The model to use for generation */
  model: Model;
  /** Tools available to the agent */
  tools: Tool[];
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
  /** The model's response content (if any) */
  content?: string;
  /** Tool calls made in this step */
  toolCalls?: ToolCall[];
  /** Results from tool executions */
  toolResults?: ToolResult[];
  /** Token usage for this step */
  usage?: TokenUsage;
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
  totalUsage?: TokenUsage;
  /** The full message history */
  messages: Message[];
}

