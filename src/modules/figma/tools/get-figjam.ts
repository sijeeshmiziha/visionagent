/**
 * Figma get_figjam tool - FigJam node metadata plus screenshot URLs
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi, buildNodeTree } from '../utils';

export const figmaGetFigjamTool = defineTool({
  name: 'figma_get_figjam',
  description:
    'Returns metadata (XML) and screenshot URLs for a FigJam node. Use for FigJam boards/diagrams only.',
  input: z.object({
    fileKey: z.string().describe('Figma/FigJam file key'),
    nodeId: z.string().describe('Node ID'),
  }),
  handler: async ({ fileKey, nodeId }) => {
    const client = new FigmaClient();
    const id = formatNodeIdForApi(nodeId);
    const [nodesRes, imageRes] = await Promise.all([
      client.getFileNodes(fileKey, [id]),
      client.getImage(fileKey, [id], { format: 'png' }),
    ]);
    const entry = nodesRes.nodes?.[id.replace(':', '-')];
    const doc = entry?.document;
    const metadata = doc ? buildNodeTree(doc) : null;
    const imageUrl = imageRes.images?.[id.replace(':', '-')] ?? null;
    return { metadata, screenshotUrl: imageUrl };
  },
});
