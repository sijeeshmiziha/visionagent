/**
 * Figma get_variable_defs tool - design tokens (colors, spacing, typography)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import type { FigmaVariable } from '../types';

function flattenVariables(res: {
  meta?: { variables?: Record<string, FigmaVariable> };
}): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  const vars = res.meta?.variables;
  if (!vars) return out;
  for (const v of Object.values(vars)) {
    const modeKey = v.valuesByMode ? Object.keys(v.valuesByMode)[0] : undefined;
    const val = modeKey != null ? v.valuesByMode[modeKey] : undefined;
    if (val != null) {
      if (typeof val === 'object' && val !== null && 'r' in val) {
        const c = val as { r: number; g: number; b: number; a?: number };
        out[v.name] =
          `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a ?? 1})`;
      } else {
        out[v.name] = val as string | number;
      }
    }
  }
  return out;
}

export const figmaGetVariableDefsTool = defineTool({
  name: 'figma_get_variable_defs',
  description:
    'Returns variables and styles used in the file: colors, spacing, typography tokens (names and values).',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z.string().optional().describe('Optional; variables are file-level'),
  }),
  handler: async ({ fileKey }) => {
    const client = new FigmaClient();
    const [local, published] = await Promise.all([
      client.getLocalVariables(fileKey),
      client.getPublishedVariables(fileKey),
    ]);
    const localVars = flattenVariables(local);
    const publishedVars = flattenVariables(published);
    return {
      local: localVars,
      published: publishedVars,
      combined: { ...publishedVars, ...localVars },
    };
  },
});
