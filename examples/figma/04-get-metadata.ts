/**
 * Figma Example: get_metadata
 *
 * Get metadata (IDs, names, types, positions, sizes) for a node or document.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 04-get-metadata.ts
 */
import { executeTool, figmaGetMetadataTool, parseFigmaUrl } from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_metadata ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
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
