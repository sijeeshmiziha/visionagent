/**
 * Figma Example: get_code_connect_suggestions
 *
 * Suggests code component mappings for a Figma node based on component names
 * and file structure. Useful when you want automated suggestions before
 * confirming with add_code_connect_map.
 *
 * Run:  npm run example -- examples/figma/08-get-code-connect-suggestions.ts
 *
 * Requires: FIGMA_API_KEY in .env
 */

import { executeTool } from '../../src/index';
import { figmaGetCodeConnectSuggestionsTool, parseFigmaUrl } from '../../src/modules/figma';
import type { CodeConnectSuggestion } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_code_connect_suggestions ===\n');

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

  const result = await executeTool(figmaGetCodeConnectSuggestionsTool, { fileKey, nodeId });

  if (result.success) {
    const out = result.output as { suggestions: CodeConnectSuggestion[] };
    if (out.suggestions.length > 0) {
      console.log(`Found ${out.suggestions.length} suggestion(s):\n`);
      for (const s of out.suggestions) {
        console.log(`  Node     : ${s.nodeId}`);
        console.log(`  Component: ${s.componentName}`);
        console.log(`  Source   : ${s.source}`);
        console.log(`  Label    : ${s.label}`);
        console.log();
      }
    } else {
      console.log('No suggestions found for this node.');
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
