/**
 * Figma Example: get_metadata
 *
 * Returns a sparse XML representation of a node or entire document:
 * IDs, names, types, positions, and sizes. Useful for exploring large files
 * before calling get_design_context on specific nodes.
 *
 * Run:  npm run example -- examples/figma/04-get-metadata.ts
 *
 * Requires: FIGMA_API_KEY in .env
 */

import { executeTool } from '../../src/index';
import { figmaGetMetadataTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_metadata ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const { fileKey, nodeId } = parseFigmaUrl(FIGMA_URL);

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId ?? '(full document)', '\n');

  const result = await executeTool(figmaGetMetadataTool, {
    fileKey,
    ...(nodeId ? { nodeId } : {}),
  });

  if (result.success) {
    const out = result.output as { metadata?: string; error?: string };
    if (out.metadata) {
      // Print first 2000 chars of XML to avoid flooding the terminal
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
