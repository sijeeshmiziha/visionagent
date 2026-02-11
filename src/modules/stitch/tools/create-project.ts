/**
 * Stitch create_project tool - creates a new Stitch project
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const inputSchema = z.object({
  title: z.string().optional().describe('Optional title for the project'),
});

export const stitchCreateProjectTool = defineTool({
  name: 'stitch_create_project',
  description:
    'Creates a new Stitch project. A project is a container for UI designs and screens. Uses Stitch MCP (STITCH_MCP_URL or STITCH_MCP_COMMAND).',
  input: inputSchema,
  handler: async ({ title }) => {
    const client = new StitchClient();
    const project = await client.createProject(title);
    return { project, name: project.name, title: project.title };
  },
});

export function createCreateProjectTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_create_project',
    description:
      'Creates a new Stitch project. A project is a container for UI designs and screens. Uses Stitch MCP (STITCH_MCP_URL or STITCH_MCP_COMMAND).',
    input: inputSchema,
    handler: async ({ title }) => {
      const client = new StitchClient(config);
      const project = await client.createProject(title);
      return { project, name: project.name, title: project.title };
    },
  });
}
