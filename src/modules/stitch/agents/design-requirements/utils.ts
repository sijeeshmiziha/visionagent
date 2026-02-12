/**
 * Design requirements utilities: JSON extraction and subagent runner
 */

import { runSubagent } from '../../../../lib/subagents';
import type { AgentTool } from '../../../../lib/types/agent';
import type { Model } from '../../../../lib/types/model';
import type { SubagentDefinition } from '../../../../lib/types/subagent';

/** Extract JSON from subagent output (may be wrapped in ```json ... ```) */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const codeBlock = codeBlockRegex.exec(trimmed);
  const str = codeBlock?.[1]?.trim() ?? trimmed;
  return JSON.parse(str);
}

export interface RunAnalysisStepOptions {
  model: Model;
  tools: Record<string, AgentTool>;
}

/**
 * Run a single analysis subagent and parse its JSON output into an array by key.
 * Encapsulates the pattern: log → stringify payload → runSubagent → extractJson → extract field.
 */
export async function runAnalysisStep<T>(
  name: string,
  definition: SubagentDefinition,
  payload: Record<string, unknown>,
  outputKey: string,
  options: RunAnalysisStepOptions
): Promise<T[]> {
  console.log(`[design-requirements] Running subagent: ${name}`);
  const raw = JSON.stringify(payload, null, 2);
  const result = await runSubagent(definition, raw, {
    parentModel: options.model,
    parentTools: options.tools,
  });
  const parsed = extractJson(result.output) as Record<string, T[]>;
  const items = parsed[outputKey] ?? [];
  console.log(`[design-requirements] ${name} done`, {
    [outputKey]: items.length,
  });
  return items;
}
