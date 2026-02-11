/**
 * Figma Example: get_code_connect_map
 *
 * Run: npm run example -- examples/figma/06-get-code-connect-map.ts
 * Inputs: FIGMA_URL (env or --figma-url=)
 */

import { executeTool } from '../../src/index';
import { figmaGetCodeConnectMapTool, parseFigmaUrl } from '../../src/modules/figma';
import { requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_get_code_connect_map ===\n');

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
