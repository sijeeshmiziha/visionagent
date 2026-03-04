import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { cleanupGeneratedCode } from '../converter/cleaner';

export const figmaCleanupCodeTool = defineTool({
  name: 'figma_cleanup_code',
  description:
    'Clean up machine-generated React/Tailwind code using AI. Removes junk classes, fixes positioning, makes code responsive while preserving visual fidelity. Works with any configured AI provider.',
  input: z.object({
    code: z.string().describe('The React/JSX code to clean up'),
    provider: z
      .enum(['openai', 'anthropic', 'google'])
      .optional()
      .describe('AI provider to use for cleanup (default: google)'),
    model: z.string().optional().describe('Model name (default: gemini-2.0-flash)'),
  }),
  handler: async ({ code, provider, model }) => {
    const modelConfig =
      provider || model
        ? {
            provider: provider ?? 'google',
            model: model ?? 'gemini-2.0-flash',
          }
        : undefined;

    const cleanedCode = await cleanupGeneratedCode(code, modelConfig);
    return { cleanedCode };
  },
});
