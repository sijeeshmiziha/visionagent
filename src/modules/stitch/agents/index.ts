/**
 * Stitch agent - runs an agent with all Stitch tools (MCP)
 */

import type { AgentResult, AgentStep } from '../../../lib/types/agent';
import type { ModelConfig } from '../../../lib/types/model';
import { runAgent } from '../../../lib/agents';
import { createModel } from '../../../lib/models/create-model';
import { createStitchToolSet } from '../tools';
import type { StitchConfig } from '../types';

export interface StitchAgentConfig {
  /** User input (e.g. "Create a project and generate a login screen") */
  input: string;
  /** Model config; defaults to OpenAI gpt-4o-mini */
  model?: ModelConfig;
  /** System prompt override */
  systemPrompt?: string;
  /** Max iterations; default 10 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Stitch MCP config override (url, command, args); defaults to env STITCH_MCP_* */
  stitchMcpConfig?: StitchConfig;
}

const DEFAULT_SYSTEM_PROMPT = `You are a Stitch design assistant. Stitch is a UI design tool from Google. You can create and manage projects, list and get screens, generate new screens from text prompts, edit existing screens, and generate design variants.

Available tools:
- stitch_create_project: create a new project (optional title).
- stitch_list_projects: list projects (optional filter: view=owned or view=shared).
- stitch_get_project: get a project by resource name (projects/{id}).
- stitch_list_screens: list screens in a project (projectId without projects/ prefix).
- stitch_get_screen: get a screen by resource name (projects/{p}/screens/{s}).
- stitch_generate_screen: generate a new screen from a text prompt (projectId, prompt; optional deviceType, modelId). Generation can take a few minutes; do not retry on slow response.
- stitch_edit_screens: edit existing screens with a text prompt (projectId, selectedScreenIds, prompt).
- stitch_generate_variants: generate design variants (projectId, selectedScreenIds, prompt, variantOptions: variantCount, creativeRange, aspects).

When the user refers to a project or screen, use the IDs from list/get responses. Generation and edit operations may be slow; inform the user if needed.`;

export async function runStitchAgent(config: StitchAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxIterations = 10,
    onStep,
    stitchMcpConfig,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createStitchToolSet(stitchMcpConfig);

  return runAgent({
    model,
    tools,
    systemPrompt,
    input,
    maxIterations,
    onStep,
  });
}

export { runDesignRequirementsAgent } from './design-requirements';
export type {
  DesignRequirementsAgentConfig,
  DesignRequirementsResult,
  DesignRequirementsOutput,
} from './design-requirements';
