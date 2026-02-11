/**
 * Stitch generate_variants tool - generates design variants of existing screens
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
const creativeRangeEnum = z.enum(['CREATIVE_RANGE_UNSPECIFIED', 'REFINE', 'EXPLORE', 'REIMAGINE']);
const variantAspectEnum = z.enum([
  'VARIANT_ASPECT_UNSPECIFIED',
  'LAYOUT',
  'COLOR_SCHEME',
  'IMAGES',
  'TEXT_FONT',
  'TEXT_CONTENT',
]);
const inputSchema = z.object({
  projectId: z.string().describe('The project ID containing the screens'),
  selectedScreenIds: z.array(z.string()).describe('Screen IDs to generate variants from'),
  prompt: z.string().describe('Text description guiding variant generation'),
  variantCount: z.number().min(1).max(5).optional().describe('Number of variants (default 3)'),
  creativeRange: creativeRangeEnum
    .optional()
    .describe('REFINE (subtle), EXPLORE (default), REIMAGINE (radical)'),
  aspects: z
    .array(variantAspectEnum)
    .optional()
    .describe('Focus: LAYOUT, COLOR_SCHEME, IMAGES, TEXT_FONT, TEXT_CONTENT'),
  deviceType: deviceTypeEnum.optional(),
  modelId: modelIdEnum.optional(),
});

export const stitchGenerateVariantsTool = defineTool({
  name: 'stitch_generate_variants',
  description:
    'Generates design variants of existing screens via MCP. Options: variantCount (1-5), creativeRange (REFINE, EXPLORE, REIMAGINE), aspects (LAYOUT, COLOR_SCHEME, etc.).',
  input: inputSchema,
  handler: async ({
    projectId,
    selectedScreenIds,
    prompt,
    variantCount,
    creativeRange,
    aspects,
    deviceType,
    modelId,
  }) => {
    const client = new StitchClient();
    const response = await client.generateVariants(
      projectId,
      selectedScreenIds,
      prompt,
      {
        variantCount: variantCount ?? 3,
        creativeRange: creativeRange ?? 'EXPLORE',
        aspects: aspects ?? [],
      },
      {
        deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
        modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
      }
    );
    return {
      screens: response.screens ?? [],
      count: (response.screens ?? []).length,
    };
  },
});

export function createGenerateVariantsTool(config?: StitchConfig) {
  return defineTool({
    name: 'stitch_generate_variants',
    description:
      'Generates design variants of existing screens via MCP. Options: variantCount (1-5), creativeRange (REFINE, EXPLORE, REIMAGINE), aspects (LAYOUT, COLOR_SCHEME, etc.).',
    input: inputSchema,
    handler: async ({
      projectId,
      selectedScreenIds,
      prompt,
      variantCount,
      creativeRange,
      aspects,
      deviceType,
      modelId,
    }) => {
      const client = new StitchClient(config);
      const response = await client.generateVariants(
        projectId,
        selectedScreenIds,
        prompt,
        {
          variantCount: variantCount ?? 3,
          creativeRange: creativeRange ?? 'EXPLORE',
          aspects: aspects ?? [],
        },
        {
          deviceType: deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
          modelId: modelId ?? 'MODEL_ID_UNSPECIFIED',
        }
      );
      return {
        screens: response.screens ?? [],
        count: (response.screens ?? []).length,
      };
    },
  });
}
