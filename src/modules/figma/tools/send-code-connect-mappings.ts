/**
 * Figma send_code_connect_mappings - batch confirm/store Code Connect mappings
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { getStoredMappings, setStoredMappings } from './add-code-connect-map';

export const figmaSendCodeConnectMappingsTool = defineTool({
  name: 'figma_send_code_connect_mappings',
  description:
    'Confirm and store a batch of Code Connect mappings (nodeId -> component path/name/label).',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    mappings: z
      .array(
        z.object({
          nodeId: z.string(),
          componentName: z.string(),
          source: z.string(),
          label: z.string().optional(),
        })
      )
      .describe('List of mappings to store'),
  }),
  handler: async ({ fileKey, mappings }) => {
    const existing = getStoredMappings(fileKey);
    const byNode = new Map(existing.map(m => [m.nodeId, m]));
    for (const m of mappings) {
      byNode.set(m.nodeId, {
        nodeId: m.nodeId,
        codeConnectSrc: m.source,
        codeConnectName: m.componentName,
        label: m.label,
      });
    }
    const list = Array.from(byNode.values());
    setStoredMappings(fileKey, list);
    return { success: true, count: list.length, stored: list };
  },
});
