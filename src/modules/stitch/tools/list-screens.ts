/**
 * Stitch list_screens tool - lists all screens within a project
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const inputSchema = z.object({
  projectId: z
    .string()
    .describe('The project ID (e.g. 4044680601076201931, without projects/ prefix)'),
});

export const stitchListScreensTool = defineTool({
  name: 'stitch_list_screens',
  description: 'Lists all screens within a given Stitch project via MCP.',
  input: inputSchema,
  handler: async ({ projectId }) => {
    const client = new StitchClient();
    const response = await client.listScreens(projectId);
    return {
      screens: response.screens ?? [],
      nextPageToken: response.nextPageToken,
      count: (response.screens ?? []).length,
    };
  },
});

export function createListScreensTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_list_screens',
    description: 'Lists all screens within a given Stitch project via MCP.',
    input: inputSchema,
    handler: async ({ projectId }) => {
      const client = new StitchClient(config);
      const response = await client.listScreens(projectId);
      return {
        screens: response.screens ?? [],
        nextPageToken: response.nextPageToken,
        count: (response.screens ?? []).length,
      };
    },
  });
}
