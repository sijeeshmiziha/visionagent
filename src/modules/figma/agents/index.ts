/**
 * Figma agent - runs an agent with all Figma tools
 */

import type { AgentResult, AgentStep } from '../../../lib/types/agent';
import type { ModelConfig } from '../../../lib/types/model';
import { runAgent } from '../../../lib/agents';
import { createModel } from '../../../lib/models/create-model';
import { createFigmaToolSet } from '../tools';

export interface FigmaAgentConfig {
  /** User input (e.g. "Get metadata for this Figma URL: ...") */
  input: string;
  /** Model config; defaults to OpenAI gpt-4o-mini */
  model?: ModelConfig;
  /** System prompt override */
  systemPrompt?: string;
  /** Max iterations; default 10 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Figma API key override (defaults to FIGMA_API_KEY env) */
  figmaApiKey?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are a Figma design assistant. You can inspect Figma files, extract design context, retrieve screenshots, get design tokens and variables, manage Code Connect mappings, and generate diagrams. Use the available figma_ tools to help the user work with their Figma designs.

When the user provides a Figma URL, extract the fileKey and nodeId from it.
When generating code from designs, preserve layout fidelity and use semantic naming.`;

export async function runFigmaAgent(config: FigmaAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxIterations = 10,
    onStep,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createFigmaToolSet(config.figmaApiKey ? { apiKey: config.figmaApiKey } : undefined);

  return runAgent({
    model,
    tools,
    systemPrompt,
    input,
    maxIterations,
    onStep,
  });
}
