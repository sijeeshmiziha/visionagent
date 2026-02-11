/**
 * Stitch list_projects tool - lists all projects accessible to the user
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const inputSchema = z.object({
  filter: z.string().optional().describe('Filter: view=owned (default) or view=shared'),
});

export const stitchListProjectsTool = defineTool({
  name: 'stitch_list_projects',
  description: 'Lists all Stitch projects via MCP. Filter: view=owned (default) or view=shared.',
  input: inputSchema,
  handler: async ({ filter }) => {
    const client = new StitchClient();
    const response = await client.listProjects(filter);
    return {
      projects: response.projects ?? [],
      nextPageToken: response.nextPageToken,
      count: (response.projects ?? []).length,
    };
  },
});

export function createListProjectsTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_list_projects',
    description: 'Lists all Stitch projects via MCP. Filter: view=owned (default) or view=shared.',
    input: inputSchema,
    handler: async ({ filter }) => {
      const client = new StitchClient(config);
      const response = await client.listProjects(filter);
      return {
        projects: response.projects ?? [],
        nextPageToken: response.nextPageToken,
        count: (response.projects ?? []).length,
      };
    },
  });
}
