/**
 * Hello World agent - runs an agent with the hello world tool
 */

import type { AgentResult } from '../types/agent';
import type { ModelConfig } from '../types/model';
import { runAgent } from '../agents';
import { createModel } from '../models/create-model';
import { createToolSet } from '../tools/tool-set';
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
}

const DEFAULT_SYSTEM_PROMPT =
  'You are a friendly greeter. Use the hello_world tool to greet users.';

export async function runHelloWorldAgent(config: HelloWorldAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxIterations = 3,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });

  return runAgent({
    model,
    tools: createToolSet([helloWorldTool]),
    systemPrompt,
    input,
    maxIterations,
  });
}
