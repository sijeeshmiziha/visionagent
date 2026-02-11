/**
 * Figma whoami tool - returns the authenticated user (GET /v1/me)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';

export const figmaWhoamiTool = defineTool({
  name: 'figma_whoami',
  description:
    'Returns the identity of the user authenticated to Figma (email, handle, teams). Uses FIGMA_API_KEY.',
  input: z.object({}),
  handler: async () => {
    const client = new FigmaClient();
    const user = await client.getMe();
    return {
      id: user.id,
      email: user.email,
      handle: user.handle,
      img_url: user.img_url,
      team_id: user.team_id,
    };
  },
});
