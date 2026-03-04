/**
 * Figma agents - general assistant and design-to-code
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

export interface FigmaToCodeAgentConfig extends FigmaAgentConfig {
  /** Enable Tailwind CSS output (default: true) */
  useTailwind?: boolean;
  /** Extract repeated patterns into sub-components (default: true) */
  optimizeComponents?: boolean;
  /** Run AI cleanup on generated code (default: true) */
  useCodeCleaner?: boolean;
}

const DEFAULT_SYSTEM_PROMPT = `You are a Figma design assistant. You can inspect Figma files, extract design context, retrieve screenshots, get design tokens and variables, manage Code Connect mappings, and generate diagrams. Use the available figma_ tools to help the user work with their Figma designs.

When the user provides a Figma URL, extract the fileKey and nodeId from it.
When generating code from designs, preserve layout fidelity and use semantic naming.`;

const CODE_GENERATION_SYSTEM_PROMPT = `You are a Figma design-to-code specialist. Your primary job is to convert Figma designs into production-ready React components with Tailwind CSS.

When the user provides a Figma URL:
1. First use figma_get_design_context to understand the layout structure, typography, and color palette.
2. Then use figma_convert_to_react to generate the React component with Tailwind CSS.
3. If the user wants cleaner code, use figma_cleanup_code to refine the output.
4. If the user wants component extraction, use figma_extract_components to refactor repeated patterns.

Guidelines:
- Always preserve visual fidelity to the original design.
- Use semantic HTML elements (section, header, nav, main, footer, article).
- Prefer Tailwind CSS classes over inline styles.
- Extract the fileKey and nodeId from any Figma URL the user provides.
- Report the component name, number of assets, and font imports in your response.
- If conversion fails, explain the error and suggest alternatives.`;

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

export async function runFigmaToCodeAgent(config: FigmaToCodeAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    systemPrompt = CODE_GENERATION_SYSTEM_PROMPT,
    maxIterations = 15,
    onStep,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o' });
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
