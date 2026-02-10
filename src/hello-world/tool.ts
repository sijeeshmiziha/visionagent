/**
 * Hello World tool
 */

import { z } from 'zod';
import { defineTool } from '../tools/define-tool';

export const helloWorldTool = defineTool({
  name: 'hello_world',
  description: 'Returns a greeting message for the given name',
  input: z.object({
    name: z.string().describe('Name to greet'),
  }),
  handler: async ({ name }) => {
    return { greeting: `Hello, ${name}! Welcome to VisionAgent.` };
  },
});
