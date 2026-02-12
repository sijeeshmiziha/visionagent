/**
 * Figma Example: get_screenshot
 *
 * Export a node as PNG, JPG, SVG, or PDF.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 02-get-screenshot.ts
 */
import { executeTool, figmaGetScreenshotTool, parseFigmaUrl } from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_screenshot ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    console.error('URL must contain a node-id. Got:', figmaUrl);
    process.exit(1);
  }

  const format = (process.env.FIGMA_FORMAT ?? 'png') as 'png' | 'jpg' | 'svg' | 'pdf';
  const scale = Number(process.env.FIGMA_SCALE ?? '2') || 2;

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId);
  console.log('Format  :', format, '\n');

  const result = await executeTool(figmaGetScreenshotTool, {
    fileKey,
    nodeId,
    format,
    scale,
  });

  if (result.success) {
    const out = result.output as {
      primaryUrl?: string;
      images?: Record<string, string>;
    };
    console.log('Screenshot URL:', out.primaryUrl ?? '(none)');
    if (out.images) {
      console.log('\nAll images:');
      for (const [id, url] of Object.entries(out.images)) {
        console.log(`  ${id}: ${url}`);
      }
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
