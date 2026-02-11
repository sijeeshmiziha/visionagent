/**
 * Figma get_metadata tool - sparse XML with IDs, names, types, positions, sizes
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi, buildNodeTree } from '../utils';

export const figmaGetMetadataTool = defineTool({
  name: 'figma_get_metadata',
  description:
    'Returns sparse XML representation of the selection: node IDs, names, types, positions, sizes. Use for large files before get_design_context.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z
      .string()
      .optional()
      .describe('Optional node ID; if omitted, returns full document root'),
  }),
  handler: async ({ fileKey, nodeId }) => {
    const client = new FigmaClient();
    if (nodeId) {
      const id = formatNodeIdForApi(nodeId);
      const res = await client.getFileNodes(fileKey, [id]);
      const entry = res.nodes?.[id.replace(':', '-')];
      const doc = entry?.document;
      if (!doc) return { error: 'Node not found', metadata: null };
      const metadata = buildNodeTree(doc);
      return { metadata };
    }
    const file = await client.getFile(fileKey);
    const metadata = buildNodeTree(file.document);
    return { metadata };
  },
});
