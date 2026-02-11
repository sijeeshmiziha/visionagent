/**
 * Figma Example: get_metadata
 *
 * Run: npm run example -- examples/figma/04-get-metadata.ts
 * Inputs: FIGMA_URL (env or --figma-url=)
 */

import { executeTool } from '../../src/index';
import { figmaGetMetadataTool, parseFigmaUrl } from '../../src/modules/figma';
import { requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_get_metadata ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const figmaUrl = requireInput('FIGMA_URL', 'Set FIGMA_URL in env or pass --figma-url=...');
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId ?? '(full document)', '\n');

  const result = await executeTool(figmaGetMetadataTool, {
    fileKey,
    ...(nodeId ? { nodeId } : {}),
  });

  if (result.success) {
    const out = result.output as { metadata?: string; error?: string };
    if (out.metadata) {
      const preview = out.metadata.slice(0, 2000);
      console.log(preview);
      if (out.metadata.length > 2000) {
        console.log(`\n... truncated (${out.metadata.length} total chars)`);
      }
    } else {
      console.log('Node not found.');
      if (out.error) console.log('Reason:', out.error);
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
