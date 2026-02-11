/**
 * Figma get_code_connect_suggestions - suggest code component mappings for a node
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi } from '../utils';
import type { CodeConnectSuggestion } from '../types';

export const figmaGetCodeConnectSuggestionsTool = defineTool({
  name: 'figma_get_code_connect_suggestions',
  description:
    'Suggests mappings of Figma components to code components based on component names and file structure.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z.string().describe('Node ID'),
  }),
  handler: async ({ fileKey, nodeId }) => {
    const client = new FigmaClient();
    const id = formatNodeIdForApi(nodeId);
    const [nodesRes, componentsRes] = await Promise.all([
      client.getFileNodes(fileKey, [id]),
      client.getFileComponents(fileKey),
    ]);
    const entry = nodesRes.nodes?.[id.replace(':', '-')];
    const doc = entry?.document;
    const components = (componentsRes.meta?.components as { key: string; name: string }[]) ?? [];
    const suggestions: CodeConnectSuggestion[] = [];
    if (doc) {
      const comp = components.find(c => c.key === doc.id || c.name === doc.name);
      if (comp) {
        suggestions.push({
          nodeId: doc.id,
          componentName: comp.name,
          source: `src/components/${comp.name}.tsx`,
          label: 'React',
        });
      } else {
        suggestions.push({
          nodeId: doc.id,
          componentName: doc.name.replace(/\s+/g, ''),
          source: `src/components/${doc.name.replace(/\s+/g, '')}.tsx`,
          label: 'React',
        });
      }
    }
    return { suggestions };
  },
});
