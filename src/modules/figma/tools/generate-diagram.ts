/**
 * Figma generate_diagram tool - generate diagram from Mermaid syntax (no Figma API)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';

export const figmaGenerateDiagramTool = defineTool({
  name: 'figma_generate_diagram',
  description:
    'Generates a diagram from Mermaid.js syntax. Supported: flowchart, sequenceDiagram, stateDiagram, gantt. Returns the Mermaid source and a note to use Figma MCP generate_diagram for FigJam.',
  input: z.object({
    name: z.string().describe('Title for the diagram'),
    mermaidSyntax: z.string().describe('Mermaid.js diagram definition'),
  }),
  handler: async ({ name, mermaidSyntax }) => {
    return {
      name,
      mermaidSyntax,
      message:
        'Diagram source generated. To create an interactive FigJam diagram, use the Figma MCP server generate_diagram tool with this syntax.',
      diagram: mermaidSyntax,
    };
  },
});
