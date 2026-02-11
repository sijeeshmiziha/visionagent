/**
 * Stitch generate_screen_from_text tool - AI-generates a screen from a text prompt
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { StitchClient } from '../client';
import type { StitchConfig } from '../types';

const deviceTypeEnum = z.enum([
  'DEVICE_TYPE_UNSPECIFIED',
  'MOBILE',
  'DESKTOP',
  'TABLET',
  'AGNOSTIC',
]);
const modelIdEnum = z.enum(['MODEL_ID_UNSPECIFIED', 'GEMINI_3_PRO', 'GEMINI_3_FLASH']);
const inputSchema = z.object({
  projectId: z.string().describe('The project ID to generate the screen in'),
  prompt: z.string().describe('Natural language description of the screen to generate'),
  deviceType: deviceTypeEnum
    .optional()
    .describe('Device type: MOBILE, DESKTOP, TABLET, or AGNOSTIC'),
  modelId: modelIdEnum
    .optional()
    .describe('Model: GEMINI_3_PRO (quality) or GEMINI_3_FLASH (faster)'),
});

export const stitchGenerateScreenTool = defineTool({
  name: 'stitch_generate_screen',
  description:
    'Generates a new screen within a project from a text prompt via MCP. May take a few minutes. Do not retry on slow response.',
  input: inputSchema,
  handler: async ({ projectId, prompt, deviceType, modelId }) => {
    const client = new StitchClient();
    const response = await client.generateScreenFromText(projectId, prompt, {
      deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return {
      screen: response.screen,
      outputComponents: response.outputComponents,
      suggestions: Array.isArray(response.outputComponents)
        ? response.outputComponents
        : response.outputComponents
          ? [response.outputComponents]
          : undefined,
    };
  },
});

export function createGenerateScreenTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_generate_screen',
    description:
      'Generates a new screen within a project from a text prompt via MCP. May take a few minutes. Do not retry on slow response.',
    input: inputSchema,
    handler: async ({ projectId, prompt, deviceType, modelId }) => {
      const client = new StitchClient(config);
      const response = await client.generateScreenFromText(projectId, prompt, {
        deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
        modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
      });
      return {
        screen: response.screen,
        outputComponents: response.outputComponents,
        suggestions: Array.isArray(response.outputComponents)
          ? response.outputComponents
          : response.outputComponents
            ? [response.outputComponents]
            : undefined,
      };
    },
  });
}
