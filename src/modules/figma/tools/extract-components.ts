import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { transformJsx } from '../converter/transform-jsx';

export const figmaExtractComponentsTool = defineTool({
  name: 'figma_extract_components',
  description:
    'Extract repeated JSX patterns into reusable React sub-components. Analyzes JSX for repeated sibling elements with the same structure and refactors them into named components with props.',
  input: z.object({
    jsx: z.string().describe('The React/JSX code to analyze and extract from'),
    minRepeats: z
      .number()
      .optional()
      .default(2)
      .describe('Minimum repetitions before extracting (default: 2)'),
  }),
  handler: async ({ jsx, minRepeats }) => {
    try {
      const result = transformJsx(jsx, { minRepeats: minRepeats ?? 2 });
      return {
        optimizedJsx: result.code,
        changed: result.changed,
      };
    } catch (error) {
      return {
        optimizedJsx: jsx,
        changed: false,
        error: `Component extraction failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
