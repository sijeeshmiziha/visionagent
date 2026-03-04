import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaToReact } from '../converter/figma-react';
import { cleanupGeneratedCode } from '../converter/cleaner';

export const figmaConvertToReactTool = defineTool({
  name: 'figma_convert_to_react',
  description:
    'Convert a Figma design to a React component with Tailwind CSS. Provide either a figmaUrl or a fileKey (with optional nodeId). Returns JSX, CSS, assets (base64), componentName, and fonts.',
  input: z.object({
    figmaUrl: z
      .string()
      .optional()
      .describe('Full Figma URL (e.g. https://www.figma.com/design/ABC123/...)'),
    fileKey: z.string().optional().describe('Figma file key (alternative to figmaUrl)'),
    nodeId: z.string().optional().describe('Node ID to convert (e.g. 1:2 or 1-2)'),
    useTailwind: z
      .boolean()
      .optional()
      .default(true)
      .describe('Use Tailwind CSS classes (default: true)'),
    optimizeComponents: z
      .boolean()
      .optional()
      .default(false)
      .describe('Extract repeated patterns into sub-components'),
    useCodeCleaner: z
      .boolean()
      .optional()
      .default(false)
      .describe('Run AI cleanup on the generated code'),
  }),
  handler: async ({
    figmaUrl,
    fileKey,
    nodeId,
    useTailwind,
    optimizeComponents,
    useCodeCleaner,
  }) => {
    let url: string;

    if (figmaUrl) {
      url = figmaUrl;
    } else if (fileKey) {
      url = nodeId
        ? `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`
        : `https://www.figma.com/design/${fileKey}/`;
    } else {
      return { error: 'Provide either figmaUrl or fileKey' };
    }

    const converter = new FigmaToReact({
      useTailwind: useTailwind ?? true,
      optimizeComponents: optimizeComponents ?? false,
    });

    const result = await converter.convertFromUrl(url);
    if (!result) {
      return { error: 'Conversion failed. Check the URL and API key.' };
    }

    let jsx = result.jsx;
    if (useCodeCleaner) {
      jsx = await cleanupGeneratedCode(jsx);
    }

    const assetsSummary: Record<string, string> = {};
    for (const [filename] of Object.entries(result.assets)) {
      assetsSummary[filename] = `[base64 image - ${filename}]`;
    }

    return {
      jsx,
      css: result.css,
      componentName: result.componentName,
      fonts: result.fonts,
      assetsCount: Object.keys(result.assets).length,
      assets: assetsSummary,
    };
  },
});
