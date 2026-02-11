/**
 * Figma Example: get_screenshot
 *
 * Run: npm run example -- examples/figma/02-get-screenshot.ts
 * Inputs: FIGMA_URL (env or --figma-url=). Optional: FIGMA_FORMAT, FIGMA_SCALE
 */

import { executeTool } from '../../src/index';
import { figmaGetScreenshotTool, parseFigmaUrl } from '../../src/modules/figma';
import { getInput, requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_get_screenshot ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const figmaUrl = requireInput('FIGMA_URL', 'Set FIGMA_URL in env or pass --figma-url=...');
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    console.error('URL must contain a node-id. Got:', figmaUrl);
    process.exit(1);
  }

  const format = (getInput('FIGMA_FORMAT') ?? 'png') as 'png' | 'jpg' | 'svg' | 'pdf';
  const scaleStr = getInput('FIGMA_SCALE');
  const scale = scaleStr ? Number.parseInt(scaleStr, 10) : 2;

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
