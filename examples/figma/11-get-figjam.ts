/**
 * Figma Example: get_figjam
 *
 * Returns metadata (XML) and a screenshot URL for a FigJam node.
 * Use this with FigJam boards/diagrams only (not regular Figma design files).
 *
 * Run:  npm run example -- examples/figma/11-get-figjam.ts
 *
 * Requires: FIGMA_API_KEY in .env
 *
 * Note: This tool works with FigJam files. If you point it at a regular design
 * file, it will still return data but the results are most meaningful for FigJam.
 */

import { executeTool } from '../../src/index';
import { figmaGetFigjamTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_figjam ===\n');

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
  console.log('Node ID :', nodeId, '\n');

  const result = await executeTool(figmaGetFigjamTool, { fileKey, nodeId });

  if (result.success) {
    const out = result.output as { metadata?: string | null; screenshotUrl?: string | null };

    if (out.screenshotUrl) {
      console.log('Screenshot URL:', out.screenshotUrl, '\n');
    } else {
      console.log('No screenshot available.\n');
    }

    if (out.metadata) {
      console.log('--- Metadata (preview) ---\n');
      const preview = out.metadata.slice(0, 1500);
      console.log(preview);
      if (out.metadata.length > 1500) {
        console.log(`\n... truncated (${out.metadata.length} total chars)`);
      }
    } else {
      console.log('No metadata returned (node may not exist).');
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
