/**
 * Hello World agent - runs an agent with the hello world tool
 */

import type { AgentResult, AgentStep } from '../../lib/types/agent';
import type { ModelConfig } from '../../lib/types/model';
import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { helloWorldTool } from './tool';

export interface HelloWorldAgentConfig {
  /** User input (e.g. "Say hello to Alice") */
  input: string;
  /** Model config; defaults to OpenAI gpt-4o-mini */
  model?: ModelConfig;
  /** System prompt override */
  systemPrompt?: string;
  /** Max iterations; default 3 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
}

const DEFAULT_SYSTEM_PROMPT =
  'You are a friendly greeter. Use the hello_world tool to greet users.';

export async function runHelloWorldAgent(config: HelloWorldAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxIterations = 3,
    onStep,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });

  return runAgent({
    model,
    tools: createToolSet({ hello_world: helloWorldTool }),
    systemPrompt,
    input,
    maxIterations,
    onStep,
  });
}
