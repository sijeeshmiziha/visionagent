/**
 * Figma get_screenshot tool - returns image URL(s) for a node
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi } from '../utils';

export const figmaGetScreenshotTool = defineTool({
  name: 'figma_get_screenshot',
  description:
    'Returns rendered image URL(s) for the given Figma node. Use to preserve layout fidelity.',
  input: z.object({
    fileKey: z.string().describe('Figma file key from the file URL'),
    nodeId: z.string().describe('Node ID (e.g. 1:2 or 1-2)'),
    format: z.enum(['png', 'jpg', 'svg']).optional().describe('Image format'),
    scale: z.number().min(0.01).max(4).optional().describe('Scale factor 1-4'),
  }),
  handler: async ({ fileKey, nodeId, format, scale }) => {
    const client = new FigmaClient();
    const id = formatNodeIdForApi(nodeId);
    const res = await client.getImage(fileKey, [id], { format, scale });
    if (res.err) return { error: res.err, images: null };
    const url = res.images?.[id.replace(':', '-')];
    return { images: res.images, primaryUrl: url ?? null };
  },
});
