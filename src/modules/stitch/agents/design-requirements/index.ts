/**
 * Design Requirements Orchestrator - runs specialized subagents to produce technical requirements from Stitch designs
 */

import { z } from 'zod';
import { StitchClient } from '../../client';
import { buildProjectResourceName } from '../../utils';
import { createModel } from '../../../../lib/models/create-model';
import { defineTool } from '../../../../lib/tools';
import {
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
  screenSummarizerDef,
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
import type { ModelConfig, Model } from '../../../../lib/types/model';
import type { SubagentDefinition } from '../../../../lib/types/subagent';
import { runAnalysisStep } from './utils';
import { buildScreensWithContext, type ScreenWithContext } from './screen-context';
import type { ScreenContentCache } from './screen-content';

export type { ScreenWithContext } from './screen-context';
export type { ScreenContentCache } from './screen-content';

export interface GetDesignContextToolOptions {
  cache?: ScreenContentCache;
  /** When set, screen-summarizer agent runs per screen and screens include screenSummary */
  model?: Model;
  screenSummarizerDef?: SubagentDefinition;
  /** When set, tool returns this for the matching projectId instead of fetching */
  precomputed?: { projectId: string; projectTitle: string; screens: ScreenWithContext[] };
}

/** Tool input: projectId only. Used by subagents to fetch project title and screens with contentSummary. */
export function createGetDesignContextTool(
  config?: StitchConfig,
  options?: GetDesignContextToolOptions
) {
  const cache = options?.cache ?? undefined;
  const model = options?.model;
  const summarizerDef = options?.screenSummarizerDef ?? screenSummarizerDef;
  const precomputed = options?.precomputed;

  return defineTool({
    name: 'get_design_context',
    description:
      'Fetch project title and all screens with content summaries for a Stitch project. Call with projectId (e.g. 4044680601076201931). Returns { projectTitle, projectId, screens: [{ screenId, resourceName, projectId, contentSummary, screenshotDownloadUrl?, screenSummary? }] }.',
    input: z.object({
      projectId: z.string().describe('Stitch project ID (without projects/ prefix)'),
    }),
    handler: async ({ projectId }) => {
      console.log('[design-requirements] get_design_context called', { projectId });
      if (precomputed?.projectId === projectId) {
        return {
          projectTitle: precomputed.projectTitle,
          projectId,
          screens: precomputed.screens,
        };
      }
      const client = new StitchClient(config);
      const projectName = buildProjectResourceName(projectId);
      const project = await client.getProject(projectName);
      const projectTitle = project.title ?? projectId;
      const listResponse = await client.listScreens(projectId);
      const screens = listResponse.screens ?? [];
      const requestCache = cache ?? new Map();
      const screensOut = await buildScreensWithContext(screens, client, {
        cache: requestCache,
        model,
        screenSummarizerDef: summarizerDef,
      });
      console.log('[design-requirements] get_design_context returning', {
        projectTitle,
        screensCount: screensOut.length,
      });
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
 * Design-to-requirements pipeline flow:
 * 1. Fetch project and list screens.
 * 2. buildScreensWithContext: for each screen get HTML, run screen-summarizer → screensWithContext.
 * 3. Create get_design_context tool with precomputed context.
 * 4. Run subagents in order (persona → flow → story → api), parse JSON, assemble DesignRequirementsOutput.
 */
export async function runDesignRequirementsAgent(
  config: DesignRequirementsAgentConfig
): Promise<DesignRequirementsResult> {
  const { input: userInput, projectId, model: modelConfig, stitchMcpConfig } = config;

  console.log('[design-requirements] Starting pipeline', {
    projectId,
    userInput: userInput?.slice(0, 80),
  });

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const client = new StitchClient(stitchMcpConfig);

  const projectName = buildProjectResourceName(projectId);
  const project = await client.getProject(projectName);
  const projectTitle = project.title ?? projectId;
  console.log('[design-requirements] Fetched project', { projectTitle });

  const listResponse = await client.listScreens(projectId);
  const screens = listResponse.screens ?? [];
  console.log('[design-requirements] Listed screens', { count: screens.length });

  const screenContentCache: ScreenContentCache = new Map();
  const screensWithContext = await buildScreensWithContext(screens, client, {
    cache: screenContentCache,
    model,
    screenSummarizerDef,
  });

  const readOnlyStitchTools = createStitchReadOnlyToolSet(stitchMcpConfig);
  const designContextTool = createGetDesignContextTool(stitchMcpConfig, {
    cache: screenContentCache,
    model,
    screenSummarizerDef,
    precomputed: { projectId, projectTitle, screens: screensWithContext },
  });
  const parentTools = { ...readOnlyStitchTools, get_design_context: designContextTool };

  const personas = await runAnalysisStep<UserPersona>(
    'user-persona',
    userPersonaAnalyzerDef,
    { projectId, projectContext: userInput, screens: screensWithContext },
    'personas',
    { model, tools: parentTools }
  );

  const userFlows = await runAnalysisStep<UserFlow>(
    'user-flow',
    userFlowAnalyzerDef,
    { projectId, projectContext: userInput, personas, screens: screensWithContext },
    'userFlows',
    { model, tools: parentTools }
  );

  const userStories = await runAnalysisStep<UserStory>(
    'user-story',
    userStoryGeneratorDef,
    {
      projectId,
      projectContext: userInput,
      personas,
      userFlows,
      screens: screensWithContext,
    },
    'userStories',
    { model, tools: parentTools }
  );

  const apiRequirements = await runAnalysisStep<ApiRequirement>(
    'api-requirements',
    apiRequirementsAnalyzerDef,
    {
      projectId,
      projectContext: userInput,
      userStories,
      screens: screensWithContext,
    },
    'apiRequirements',
    { model, tools: parentTools }
  );

  const output: DesignRequirementsOutput = {
    projectId,
    projectName: projectTitle,
    analyzedAt: new Date().toISOString(),
    personas,
    userFlows,
    userStories,
    apiRequirements,
    summary: {
      totalScreens: screensWithContext.length,
      totalPersonas: personas.length,
      totalFlows: userFlows.length,
      totalStories: userStories.length,
      totalApis: apiRequirements.length,
    },
  };

  console.log('[design-requirements] Pipeline complete', output.summary);
  return { output };
}

export type { DesignRequirementsOutput } from './types';
