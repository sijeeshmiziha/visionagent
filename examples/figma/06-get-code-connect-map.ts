/**
 * Figma Example: get_code_connect_map
 *
 * Get Code Connect mapping (node → code component) for a node.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 06-get-code-connect-map.ts
 */
import { executeTool, figmaGetCodeConnectMapTool, parseFigmaUrl } from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_code_connect_map ===\n');

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

  const result = await executeTool(figmaGetCodeConnectMapTool, {
    fileKey,
    nodeId,
  });

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
