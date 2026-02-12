/**
 * Design Requirements Orchestrator - runs specialized subagents to produce technical requirements from Stitch designs
 */

import { z } from 'zod';
import { StitchClient } from '../../client';
import { buildProjectResourceName, parseScreenName } from '../../utils';
import { createModel } from '../../../../lib/models/create-model';
import { runSubagent } from '../../../../lib/subagents';
import { defineTool } from '../../../../lib/tools';
import {
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
} from './subagents';
import type {
  DesignRequirementsOutput,
  UserPersona,
  UserFlow,
  UserStory,
  ApiRequirement,
} from './types';
import type { StitchConfig } from '../../types';
import { createStitchReadOnlyToolSet } from '../../tools';
import type { ModelConfig } from '../../../../lib/types/model';

/** Extract JSON from subagent output (may be wrapped in ```json ... ```) */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const codeBlock = codeBlockRegex.exec(trimmed);
  const str = codeBlock?.[1]?.trim() ?? trimmed;
  return JSON.parse(str);
}

const MAX_DESIGN_DEPTH = 10;
const MAX_DESIGN_TEXT_LEN = 800;
const TEXT_KEYS = new Set([
  'text',
  'label',
  'title',
  'content',
  'name',
  'placeholder',
  'heading',
  'description',
  'caption',
  'alt',
  'value',
  'ariaLabel',
  'hint',
]);

/**
 * Recursively extract readable text from a design object so the model can infer
 * screen purpose, features, and user flows. Skips long hashes and IDs.
 */
function summarizeDesign(design: unknown, depth = 0): string {
  if (depth > MAX_DESIGN_DEPTH) return '';
  if (design == null) return '';
  if (typeof design === 'string') {
    const t = design.trim();
    if (t.length > 0 && t.length < 120 && !/^[a-f0-9-]{20,}$/i.test(t)) return t;
    return '';
  }
  if (Array.isArray(design)) {
    return design
      .map(item => summarizeDesign(item, depth + 1))
      .filter(Boolean)
      .join(' ');
  }
  if (typeof design === 'object') {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(design)) {
      const keyLower = key.toLowerCase();
      const isTextLike =
        TEXT_KEYS.has(keyLower) || keyLower.endsWith('text') || keyLower.endsWith('label');
      if (typeof val === 'string' && val.trim().length > 0 && val.length < 200) {
        if (isTextLike || !/^[a-f0-9-]{20,}$/i.test(val)) parts.push(val.trim());
      } else if (val !== null && typeof val === 'object') {
        const nested = summarizeDesign(val, depth + 1);
        if (nested) parts.push(nested);
      }
    }
    const out = parts.join(' ').replace(/\s+/g, ' ').trim();
    return out.length > MAX_DESIGN_TEXT_LEN ? out.slice(0, MAX_DESIGN_TEXT_LEN) + '…' : out;
  }
  return '';
}

/** Tool input: projectId only. Used by subagents to fetch project title and screens with contentSummary. */
export function createGetDesignContextTool(config?: StitchConfig) {
  return defineTool({
    name: 'get_design_context',
    description:
      'Fetch project title and all screens with content summaries for a Stitch project. Call with projectId (e.g. 4044680601076201931). Returns { projectTitle, projectId, screens: [{ screenId, resourceName, projectId, contentSummary }] }.',
    input: z.object({
      projectId: z.string().describe('Stitch project ID (without projects/ prefix)'),
    }),
    handler: async ({ projectId }) => {
      const client = new StitchClient(config);
      const projectName = buildProjectResourceName(projectId);
      const project = await client.getProject(projectName);
      const projectTitle = project.title ?? projectId;
      const listResponse = await client.listScreens(projectId);
      const screens = listResponse.screens ?? [];
      const screensOut: {
        screenId: string;
        resourceName: string;
        projectId: string;
        contentSummary: string;
      }[] = [];
      for (const s of screens) {
        const parsed = parseScreenName(s.name);
        if (!parsed) continue;
        const full = await client.getScreen(s.name);
        const contentSummary =
          summarizeDesign(full.design) || '(No text content extracted from design)';
        screensOut.push({
          screenId: parsed.screenId,
          resourceName: s.name,
          projectId: parsed.projectId,
          contentSummary,
        });
      }
      return { projectTitle, projectId, screens: screensOut };
    },
  });
}

export interface DesignRequirementsAgentConfig {
  /** User instruction or context (e.g. "Analyze this e-commerce app design") */
  input: string;
  /** Stitch project ID to analyze (without projects/ prefix) */
  projectId: string;
  /** Model config; defaults to OpenAI gpt-4o-mini */
  model?: ModelConfig;
  /** Stitch MCP config override */
  stitchMcpConfig?: StitchConfig;
}

export interface DesignRequirementsResult {
  /** Structured requirements output */
  output: DesignRequirementsOutput;
}

/**
 * Runs the design-to-requirements pipeline: fetches screens, runs persona/flow/story/API
 * subagents in order, and returns structured output plus optional Markdown PRD.
 */
export async function runDesignRequirementsAgent(
  config: DesignRequirementsAgentConfig
): Promise<DesignRequirementsResult> {
  const { input: userInput, projectId, model: modelConfig, stitchMcpConfig } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const client = new StitchClient(stitchMcpConfig);

  const readOnlyStitchTools = createStitchReadOnlyToolSet(stitchMcpConfig);
  const designContextTool = createGetDesignContextTool(stitchMcpConfig);
  const parentTools = { ...readOnlyStitchTools, get_design_context: designContextTool };

  const projectName = buildProjectResourceName(projectId);
  const project = await client.getProject(projectName);
  const projectTitle = project.title ?? projectId;

  const listResponse = await client.listScreens(projectId);
  const screens = listResponse.screens ?? [];
  const screenSummaries = [];

  for (const s of screens) {
    const parsed = parseScreenName(s.name);
    if (!parsed) continue;
    const full = await client.getScreen(s.name);
    const designSummaryText =
      summarizeDesign(full.design) || '(No text content extracted from design)';
    screenSummaries.push({
      screenId: parsed.screenId,
      name: s.name,
      projectId: parsed.projectId,
      designSummaryText,
      design: full.design ?? {},
      createTime: full.createTime,
      updateTime: full.updateTime,
    });
  }

  // Minimal payloads: no screens in prompt. Subagents must call get_design_context(projectId) to fetch screen data.
  const personaPayload = JSON.stringify({ projectId, projectContext: userInput }, null, 2);
  const personaResult = await runSubagent(userPersonaAnalyzerDef, personaPayload, {
    parentModel: model,
    parentTools,
  });
  const personaData = extractJson(personaResult.output) as { personas: UserPersona[] };
  const personas = personaData.personas ?? [];

  // Minimal payload: no screens. Subagent must call get_design_context(projectId) to fetch screens.
  const flowsPayload = JSON.stringify({ projectId, projectContext: userInput, personas }, null, 2);
  const flowResult = await runSubagent(userFlowAnalyzerDef, flowsPayload, {
    parentModel: model,
    parentTools,
  });
  const flowData = extractJson(flowResult.output) as { userFlows: UserFlow[] };
  const userFlows = flowData.userFlows ?? [];

  const storiesPayload = JSON.stringify(
    { projectId, projectContext: userInput, personas, userFlows },
    null,
    2
  );
  const storyResult = await runSubagent(userStoryGeneratorDef, storiesPayload, {
    parentModel: model,
    parentTools,
  });
  const storyData = extractJson(storyResult.output) as { userStories: UserStory[] };
  const userStories = storyData.userStories ?? [];

  // Minimal payload: no screens. Subagent must call get_design_context(projectId) to fetch screen content.
  const apiPayload = JSON.stringify({ projectId, projectContext: userInput, userStories }, null, 2);
  const apiResult = await runSubagent(apiRequirementsAnalyzerDef, apiPayload, {
    parentModel: model,
    parentTools,
  });
  const apiData = extractJson(apiResult.output) as { apiRequirements: ApiRequirement[] };
  const apiRequirements = apiData.apiRequirements ?? [];

  const output: DesignRequirementsOutput = {
    projectId,
    projectName: projectTitle,
    analyzedAt: new Date().toISOString(),
    personas,
    userFlows,
    userStories,
    apiRequirements,
    summary: {
      totalScreens: screenSummaries.length,
      totalPersonas: personas.length,
      totalFlows: userFlows.length,
      totalStories: userStories.length,
      totalApis: apiRequirements.length,
    },
  };

  return { output };
}

export type { DesignRequirementsOutput } from './types';
