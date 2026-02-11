/**
 * Figma Example: get_figjam
 *
 * Run: npm run example -- examples/figma/11-get-figjam.ts
 * Inputs: FIGMA_URL (env or --figma-url=)
 */

import { executeTool } from '../../src/index';
import { figmaGetFigjamTool, parseFigmaUrl } from '../../src/modules/figma';
import { requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_get_figjam ===\n');

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
