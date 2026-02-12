/**
 * Subagents: define, run, and expose as tools to a parent agent
 */

import { z } from 'zod';
import type { SubagentConfig, SubagentDefinition, SubagentResult } from '../types/subagent';
import type { AgentTool } from '../types/agent';
import type { Model } from '../types/model';
import { runAgent } from '../agents';
import { createModel } from '../models/create-model';
import { defineTool } from '../tools';
import type { ToolSet } from '../tools';
import { SubagentError } from '../utils/errors';

const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validates and creates a subagent definition (analogous to defineTool).
 * Name must be kebab-case.
 */
export function defineSubagent(config: SubagentConfig): SubagentDefinition {
  if (!config.name.trim()) {
    throw new SubagentError('Subagent name is required', undefined);
  }
  if (!NAME_REGEX.test(config.name)) {
    throw new SubagentError(
      `Subagent name must be kebab-case (lowercase letters, numbers, hyphens): ${config.name}`,
      config.name
    );
  }
  return { ...config };
}

export interface RunSubagentOptions {
  /** Parent's tools; used when definition does not specify tools (filtered by disallowedTools) */
  parentTools?: Record<string, AgentTool>;
  /** Parent's model; used when definition does not specify model */
  parentModel?: Model;
}

/**
 * Resolves the tool set for a subagent: definition.tools if set,
 * otherwise parentTools with disallowedTools removed.
 * Subagent tools (keys starting with "subagent_") are never inherited (no nesting).
 */
function resolveTools(
  definition: SubagentDefinition,
  parentTools?: Record<string, AgentTool>
): Record<string, AgentTool> {
  if (definition.tools != null && Object.keys(definition.tools).length > 0) {
    return definition.tools;
  }
  const base = parentTools ?? {};
  const disallowed = new Set(definition.disallowedTools ?? []);
  const filtered: Record<string, AgentTool> = {};
  for (const [key, t] of Object.entries(base)) {
    if (key.startsWith('subagent_')) continue; // no nesting
    if (!disallowed.has(key)) {
      filtered[key] = t;
    }
  }
  return filtered;
}

/**
 * Executes the subagent in isolation: resolves tools and model, runs runAgent, returns SubagentResult.
 */
export async function runSubagent(
  definition: SubagentDefinition,
  input: string,
  options?: RunSubagentOptions
): Promise<SubagentResult> {
  const { parentTools, parentModel } = options ?? {};
  const tools = resolveTools(definition, parentTools);

  const model = definition.model == null ? parentModel : createModel(definition.model);
  if (!model) {
    throw new SubagentError(
      'Subagent has no model: set definition.model or pass parentModel in options',
      definition.name
    );
  }
  const result = await runAgent({
    model,
    tools,
    systemPrompt: definition.systemPrompt,
    input,
    maxIterations: definition.maxIterations ?? 10,
    onStep: definition.onStep,
  });
  return { ...result, subagentName: definition.name };
}

export interface CreateSubagentToolOptions {
  parentTools?: Record<string, AgentTool>;
  parentModel?: Model;
}

/**
 * Wraps a subagent as an AI SDK Tool so a parent agent can delegate via a tool call.
 * Input: { prompt: string }. Returns the subagent's final output string.
 */
export function createSubagentTool(
  definition: SubagentDefinition,
  options?: CreateSubagentToolOptions
): AgentTool {
  const toolName = `subagent_${definition.name}`;
  return defineTool({
    name: toolName,
    description: definition.description,
    input: z.object({
      prompt: z.string().describe('The task or question to delegate to this subagent'),
    }),
    handler: async ({ prompt }) => {
      const result = await runSubagent(definition, prompt, {
        parentTools: options?.parentTools,
        parentModel: options?.parentModel,
      });
      return result.output;
    },
  });
}

/**
 * Creates a Record<string, Tool> from multiple subagent definitions, keyed by subagent_<name>.
 */
export function createSubagentToolSet(
  definitions: SubagentDefinition[],
  options?: CreateSubagentToolOptions
): ToolSet {
  const out: ToolSet = {};
  for (const def of definitions) {
    const tool = createSubagentTool(def, options);
    out[`subagent_${def.name}`] = tool;
  }
  return out;
}
