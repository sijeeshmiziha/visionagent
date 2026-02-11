/**
 * Figma Example: add_code_connect_map
 *
 * Run: npm run example -- examples/figma/07-add-code-connect-map.ts
 * Inputs: FIGMA_URL, FIGMA_NODE_ID (optional), FIGMA_COMPONENT_NAME, FIGMA_SOURCE, FIGMA_LABEL (env or --key=value)
 */

import { executeTool } from '../../src/index';
import {
  figmaAddCodeConnectMapTool,
  getStoredMappings,
  parseFigmaUrl,
} from '../../src/modules/figma';
import { getInput, requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_add_code_connect_map ===\n');

  const figmaUrl = requireInput('FIGMA_URL', 'Set FIGMA_URL in env or pass --figma-url=...');
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  const id = getInput('FIGMA_NODE_ID') ?? nodeId;
  if (!id) {
    console.error(
      'Set FIGMA_NODE_ID in env or pass --figma-node-id=... (or use a FIGMA_URL with node-id)'
    );
    process.exit(1);
  }
  const componentName = requireInput(
    'FIGMA_COMPONENT_NAME',
    'Set FIGMA_COMPONENT_NAME or pass --figma-component-name=...'
  );
  const source = requireInput('FIGMA_SOURCE', 'Set FIGMA_SOURCE or pass --figma-source=...');
  const label = getInput('FIGMA_LABEL') ?? 'React';

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
