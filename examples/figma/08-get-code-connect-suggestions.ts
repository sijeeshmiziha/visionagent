/**
 * Figma Example: get_code_connect_suggestions
 *
 * Get suggested Code Connect mappings for a node.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 08-get-code-connect-suggestions.ts
 */
import { executeTool, figmaGetCodeConnectSuggestionsTool, parseFigmaUrl } from 'visionagent';
import type { CodeConnectSuggestion } from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_code_connect_suggestions ===\n');

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

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId, '\n');

  const result = await executeTool(figmaGetCodeConnectSuggestionsTool, {
    fileKey,
    nodeId,
  });

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
