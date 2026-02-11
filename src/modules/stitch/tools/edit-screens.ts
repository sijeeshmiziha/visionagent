/**
 * Stitch edit_screens tool - edits existing screens using a text prompt
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
  projectId: z.string().describe('The project ID containing the screens to edit'),
  selectedScreenIds: z
    .array(z.string())
    .describe('Array of screen IDs to edit (without screens/ prefix)'),
  prompt: z.string().describe('Natural language instructions for the edit'),
  deviceType: deviceTypeEnum.optional(),
  modelId: modelIdEnum.optional(),
});

export const stitchEditScreensTool = defineTool({
  name: 'stitch_edit_screens',
  description:
    'Edits existing screens within a project using a text prompt via MCP. May take a few minutes. Do not retry on connection errors.',
  input: inputSchema,
  handler: async ({ projectId, selectedScreenIds, prompt, deviceType, modelId }) => {
    const client = new StitchClient();
    const response = await client.editScreens(projectId, selectedScreenIds, prompt, {
      deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return {
      screens: response.screens ?? [],
      count: (response.screens ?? []).length,
    };
  },
});

export function createEditScreensTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_edit_screens',
    description:
      'Edits existing screens within a project using a text prompt via MCP. May take a few minutes. Do not retry on connection errors.',
    input: inputSchema,
    handler: async ({ projectId, selectedScreenIds, prompt, deviceType, modelId }) => {
      const client = new StitchClient(config);
      const response = await client.editScreens(projectId, selectedScreenIds, prompt, {
        deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
        modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
      });
      return {
        screens: response.screens ?? [],
        count: (response.screens ?? []).length,
      };
    },
  });
}
