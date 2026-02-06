/**
 * Run an agent with tools
 */

import type { AgentConfig, AgentResult } from '../types/agent';
import { agentLoop } from './agent-loop';

/**
 * Run an agent with the given configuration
 *
 * @example
 * ```typescript
 * const result = await runAgent({
 *   model: createModel({ provider: 'openai', model: 'gpt-4o' }),
 *   tools: [searchTool, calculatorTool],
 *   systemPrompt: 'You are a helpful assistant.',
 *   input: 'What is 2 + 2?',
 *   maxIterations: 10
 * });
 *
 * console.log(result.output);
 * ```
 */
export async function runAgent(config: AgentConfig): Promise<AgentResult> {
  return agentLoop(config);
}
