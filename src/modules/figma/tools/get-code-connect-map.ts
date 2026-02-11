/**
 * Figma get_code_connect_map tool - node ID to code component mapping
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi } from '../utils';
import type { CodeConnectMapping } from '../types';

export const figmaGetCodeConnectMapTool = defineTool({
  name: 'figma_get_code_connect_map',
  description:
    'Retrieves mapping between Figma node IDs and code components (codeConnectSrc, codeConnectName). Code Connect must be set up in Figma.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z.string().describe('Node ID to look up'),
  }),
  handler: async ({ fileKey, nodeId }) => {
    const client = new FigmaClient();
    const id = formatNodeIdForApi(nodeId);
    const componentsRes = await client.getFileComponents(fileKey);
    const components =
      (componentsRes.meta?.components as { key: string; name: string; description?: string }[]) ??
      [];
    const nodesRes = await client.getFileNodes(fileKey, [id]);
    const entry = nodesRes.nodes?.[id.replace(':', '-')];
    const doc = entry?.document;
    const mapping: Record<string, CodeConnectMapping> = {};
    if (doc?.id) {
      const comp = components.find(c => c.key === doc.id || c.name === doc.name);
      if (comp?.description) {
        try {
          const parsed = JSON.parse(comp.description) as { source?: string; name?: string };
          mapping[doc.id] = {
            nodeId: doc.id,
            codeConnectSrc: parsed.source ?? '',
            codeConnectName: parsed.name ?? comp.name,
          };
        } catch {
          mapping[doc.id] = {
            nodeId: doc.id,
            codeConnectSrc: '',
            codeConnectName: comp.name,
          };
        }
      }
    }
    return { mapping: Object.keys(mapping).length ? mapping : null };
  },
});
