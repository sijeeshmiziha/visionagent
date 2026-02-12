/**
 * Subagent-related types
 * Specialized agents with custom prompts, tool restrictions, and isolated context
 */

import type { AgentTool, AgentResult, AgentStep } from './agent';
import type { ModelConfig } from './model';

/**
 * Configuration for defining a subagent (input to defineSubagent)
 */
export interface SubagentConfig {
  /** Unique identifier (kebab-case) */
  name: string;
  /** When the parent agent should delegate to this subagent */
  description: string;
  /** The subagent's system prompt */
  systemPrompt: string;
  /** Allowed tools; if omitted, subagent inherits parent's tools (minus disallowedTools) */
  tools?: Record<string, AgentTool>;
  /** Tools to deny from inherited set */
  disallowedTools?: string[];
  /** Model override; if omitted, subagent uses parent's model */
  model?: ModelConfig;
  /** Maximum iterations; defaults to 10 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
}

/**
 * Validated subagent definition (returned by defineSubagent)
 */
export interface SubagentDefinition extends SubagentConfig {
  /** Same as name; present for convenience */
  name: string;
}

/**
 * Result of running a subagent (extends AgentResult)
 */
export interface SubagentResult extends AgentResult {
  /** Which subagent produced this result */
  subagentName: string;
}
