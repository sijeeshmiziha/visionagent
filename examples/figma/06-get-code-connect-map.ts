/**
 * Figma Example: get_code_connect_map
 *
 * Retrieves the mapping between a Figma node and its corresponding code component.
 * Code Connect must be set up in Figma for this to return results.
 *
 * Run:  npm run example -- examples/figma/06-get-code-connect-map.ts
 *
 * Requires: FIGMA_API_KEY in .env
 */

import { executeTool } from '../../src/index';
import { figmaGetCodeConnectMapTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_code_connect_map ===\n');

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

  const result = await executeTool(figmaGetCodeConnectMapTool, { fileKey, nodeId });

  if (result.success) {
    const out = result.output as {
      mapping?: Record<string, { codeConnectSrc: string; codeConnectName: string }> | null;
    };
    if (out.mapping) {
      console.log('Code Connect mappings:');
      for (const [id, map] of Object.entries(out.mapping)) {
        console.log(`  Node ${id}:`);
        console.log(`    Component: ${map.codeConnectName}`);
        console.log(`    Source   : ${map.codeConnectSrc}`);
      }
    } else {
      console.log('No Code Connect mapping found for this node.');
      console.log(
        'Hint: Set up Code Connect in Figma or use figma_add_code_connect_map to create one.'
      );
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
