/**
 * Stitch get_project tool - retrieves project details by resource name
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const inputSchema = z.object({
  name: z.string().describe('Resource name of the project, e.g. projects/4044680601076201931'),
});

export const stitchGetProjectTool = defineTool({
  name: 'stitch_get_project',
  description:
    'Retrieves details of a specific Stitch project via MCP. Resource name format: projects/{project_id}.',
  input: inputSchema,
  handler: async ({ name }) => {
    const client = new StitchClient();
    const project = await client.getProject(name);
    return { project };
  },
});

export function createGetProjectTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_get_project',
    description:
      'Retrieves details of a specific Stitch project via MCP. Resource name format: projects/{project_id}.',
    input: inputSchema,
    handler: async ({ name }) => {
      const client = new StitchClient(config);
      const project = await client.getProject(name);
      return { project };
    },
  });
}
