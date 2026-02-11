/**
 * Figma Example: get_screenshot
 *
 * Renders a Figma node as an image and returns the URL.
 *
 * Run:  npm run example -- examples/figma/02-get-screenshot.ts
 *
 * Requires: FIGMA_API_KEY in .env
 */

import { executeTool } from '../../src/index';
import { figmaGetScreenshotTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_screenshot ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const { fileKey, nodeId } = parseFigmaUrl(FIGMA_URL);
  if (!nodeId) {
    console.error('URL must contain a node-id. Got:', FIGMA_URL);
    process.exit(1);
  }

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId);
  console.log('Format  : png\n');

  const result = await executeTool(figmaGetScreenshotTool, {
    fileKey,
    nodeId,
    format: 'png',
    scale: 2,
  });

  if (result.success) {
    const out = result.output as { primaryUrl?: string; images?: Record<string, string> };
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
