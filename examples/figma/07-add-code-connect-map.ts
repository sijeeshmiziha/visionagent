/**
 * Figma Example: add_code_connect_map
 *
 * Add a Code Connect mapping (Figma node → code component).
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 07-add-code-connect-map.ts
 */
import {
  executeTool,
  figmaAddCodeConnectMapTool,
  getStoredMappings,
  parseFigmaUrl,
} from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_add_code_connect_map ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  const id = process.env.FIGMA_NODE_ID ?? nodeId;
  if (!id) {
    console.error('Set FIGMA_NODE_ID in env or use a FIGMA_URL with node-id.');
    process.exit(1);
  }
  const componentName = process.env.FIGMA_COMPONENT_NAME ?? 'HeroSection';
  const source = process.env.FIGMA_SOURCE ?? 'src/components/HeroSection.tsx';
  const label = process.env.FIGMA_LABEL ?? 'React';

  console.log('File key      :', fileKey);
  console.log('Node ID       :', id);
  console.log('Component name:', componentName);
  console.log('Source        :', source);
  console.log('Label         :', label, '\n');

  const result = await executeTool(figmaAddCodeConnectMapTool, {
    fileKey,
    nodeId: id,
    componentName,
    source,
    label,
  });

  if (result.success) {
    const out = result.output as { success: boolean; mapping: unknown };
    console.log('Stored successfully!');
    console.log('Mapping:', JSON.stringify(out.mapping, null, 2));
    const stored = getStoredMappings(fileKey);
    console.log(`\nTotal stored mappings for this file: ${stored.length}`);
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
