/**
 * Figma create_design_system_rules - generate a rule file for design system context
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

export const figmaCreateDesignSystemRulesTool = defineTool({
  name: 'figma_create_design_system_rules',
  description:
    'Creates a design system rule file (markdown) from a Figma file: variables, styles, and structure. Save to .cursor/rules or instructions for the agent.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    outputPath: z.string().optional().describe('Suggested path to save the rule file'),
  }),
  handler: async ({ fileKey, outputPath }) => {
    const client = new FigmaClient();
    const [file, stylesRes, localVars] = await Promise.all([
      client.getFile(fileKey),
      client.getFileStyles(fileKey),
      client.getLocalVariables(fileKey),
    ]);
    const variables = flattenVariables(localVars);
    const styles = (stylesRes.meta?.styles as { name: string; styleType: string }[]) ?? [];
    const lines: string[] = [
      '# Design system rules (from Figma)',
      '',
      `Generated from file: ${file.name}`,
      '',
      '## Variables (tokens)',
      '',
      'Use these token names in generated code when they match design intent:',
      '',
      '```',
      ...Object.entries(variables).map(([k, v]) => `${k}: ${v}`),
      '```',
      '',
      '## Styles',
      '',
      ...styles.map(s => `- ${s.name} (${s.styleType})`),
      '',
      '## Guidelines',
      '',
      '- Prefer semantic layer names from Figma when generating components.',
      '- Use Auto Layout equivalents (flexbox/grid) for responsive behavior.',
      '- Map Figma variables to CSS variables or theme tokens in code.',
      '',
    ];
    const markdown = lines.join('\n');
    return {
      ruleContent: markdown,
      outputPath: outputPath ?? '.cursor/rules/figma-design-system.md',
      variableCount: Object.keys(variables).length,
      styleCount: styles.length,
    };
  },
});
