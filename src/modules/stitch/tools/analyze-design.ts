/**
 * Stitch analyze_design tool - extracts design information from screens for requirements analysis
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import { buildScreenResourceName, parseScreenName } from '../utils';
import type { StitchConfig, StitchScreen } from '../types';

const inputSchema = z.object({
  projectId: z
    .string()
    .describe('The project ID (e.g. 4044680601076201931, without projects/ prefix)'),
  screenIds: z
    .array(z.string())
    .optional()
    .describe(
      'Optional list of screen IDs to analyze; if omitted, all screens in the project are fetched'
    ),
});

/** Lightweight screen summary for analysis agents (design may be large) */
export interface ScreenDesignSummary {
  screenId: string;
  name: string;
  projectId: string;
  designSummary: unknown;
  createTime?: string;
  updateTime?: string;
}

function summarizeScreen(
  screen: StitchScreen,
  projectId: string,
  screenId: string
): ScreenDesignSummary {
  return {
    screenId,
    name: screen.name ?? `projects/${projectId}/screens/${screenId}`,
    projectId,
    designSummary: screen.design ?? {},
    createTime: screen.createTime,
    updateTime: screen.updateTime,
  };
}

export const stitchAnalyzeDesignTool = defineTool({
  name: 'stitch_analyze_design',
  description:
    'Extract detailed design information from Stitch screens for requirements analysis. Fetches screen list and full screen details (including design data). Use before running design-requirements subagents.',
  input: inputSchema,
  handler: async ({ projectId, screenIds }) => {
    const client = new StitchClient();
    const listResponse = await client.listScreens(projectId);
    const screens = listResponse.screens ?? [];

    const idsToFetch =
      screenIds && screenIds.length > 0
        ? screenIds
        : (screens.map(s => parseScreenName(s.name)?.screenId).filter(Boolean) as string[]);

    if (idsToFetch.length === 0) {
      return {
        projectId,
        screens: [],
        count: 0,
        message: 'No screens found in project or no screen IDs to fetch.',
      };
    }

    const summaries: ScreenDesignSummary[] = [];
    for (const screenId of idsToFetch) {
      const name = buildScreenResourceName(projectId, screenId);
      const screen = await client.getScreen(name);
      summaries.push(summarizeScreen(screen, projectId, screenId));
    }

    return {
      projectId,
      screens: summaries,
      count: summaries.length,
    };
  },
});

export function createAnalyzeDesignTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_analyze_design',
    description:
      'Extract detailed design information from Stitch screens for requirements analysis. Fetches screen list and full screen details (including design data). Use before running design-requirements subagents.',
    input: inputSchema,
    handler: async ({ projectId, screenIds }) => {
      const client = new StitchClient(config);
      const listResponse = await client.listScreens(projectId);
      const screens = listResponse.screens ?? [];

      const idsToFetch =
        screenIds && screenIds.length > 0
          ? screenIds
          : (screens.map(s => parseScreenName(s.name)?.screenId).filter(Boolean) as string[]);

      if (idsToFetch.length === 0) {
        return {
          projectId,
          screens: [],
          count: 0,
          message: 'No screens found in project or no screen IDs to fetch.',
        };
      }

      const summaries: ScreenDesignSummary[] = [];
      for (const screenId of idsToFetch) {
        const name = buildScreenResourceName(projectId, screenId);
        const screen = await client.getScreen(name);
        summaries.push(summarizeScreen(screen, projectId, screenId));
      }

      return {
        projectId,
        screens: summaries,
        count: summaries.length,
      };
    },
  });
}
