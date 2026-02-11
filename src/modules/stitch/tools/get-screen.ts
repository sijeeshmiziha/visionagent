/**
 * Stitch get_screen tool - retrieves details of a specific screen
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const inputSchema = z.object({
  name: z
    .string()
    .describe(
      'Resource name of the screen, e.g. projects/4044680601076201931/screens/98b50e2ddc9943efb387052637738f61'
    ),
  projectId: z.string().optional().describe('The project ID (without projects/ prefix)'),
  screenId: z.string().optional().describe('The screen ID (without screens/ prefix)'),
});

export const stitchGetScreenTool = defineTool({
  name: 'stitch_get_screen',
  description:
    'Retrieves details of a specific screen via MCP. Resource name format: projects/{project}/screens/{screen}.',
  input: inputSchema,
  handler: async ({ name, projectId, screenId }) => {
    const client = new StitchClient();
    const screen = await client.getScreen(name);
    return {
      screen,
      projectId: projectId ?? screen.projectId,
      screenId: screenId ?? screen.screenId,
    };
  },
});

export function createGetScreenTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_get_screen',
    description:
      'Retrieves details of a specific screen via MCP. Resource name format: projects/{project}/screens/{screen}.',
    input: inputSchema,
    handler: async ({ name, projectId, screenId }) => {
      const client = new StitchClient(config);
      const screen = await client.getScreen(name);
      return {
        screen,
        projectId: projectId ?? screen.projectId,
        screenId: screenId ?? screen.screenId,
      };
    },
  });
}
