/**
 * Figma Example: add_code_connect_map
 *
 * Adds a mapping between a Figma node and a code component.
 * This is stored locally for the current session (in-memory).
 *
 * Run:  npm run example -- examples/figma/07-add-code-connect-map.ts
 *
 * Does NOT require FIGMA_API_KEY (local-only operation).
 */

import { executeTool } from '../../src/index';
import {
  figmaAddCodeConnectMapTool,
  getStoredMappings,
  parseFigmaUrl,
} from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_add_code_connect_map ===\n');

  const { fileKey, nodeId } = parseFigmaUrl(FIGMA_URL);
  const id = nodeId ?? '11301:18833';

  console.log('File key      :', fileKey);
  console.log('Node ID       :', id);
  console.log('Component name: HeroSection');
  console.log('Source        : src/components/HeroSection.tsx');
  console.log('Label         : React\n');

  const result = await executeTool(figmaAddCodeConnectMapTool, {
    fileKey,
    nodeId: id,
    componentName: 'HeroSection',
    source: 'src/components/HeroSection.tsx',
    label: 'React',
  });

  if (result.success) {
    const out = result.output as { success: boolean; mapping: unknown };
    console.log('Stored successfully!');
    console.log('Mapping:', JSON.stringify(out.mapping, null, 2));

    // Verify it's stored
    const stored = getStoredMappings(fileKey);
    console.log(`\nTotal stored mappings for this file: ${stored.length}`);
  } else {
    console.error('Error:', result.error);
  }

  // Add a second mapping to show multiple entries
  console.log('\n--- Adding a second mapping ---\n');

  const result2 = await executeTool(figmaAddCodeConnectMapTool, {
    fileKey,
    nodeId: '11301:18900',
    componentName: 'NavBar',
    source: 'src/components/NavBar.tsx',
    label: 'React',
  });

  if (result2.success) {
    console.log('Second mapping stored.');
    const stored = getStoredMappings(fileKey);
    console.log(`Total stored mappings: ${stored.length}`);
    for (const m of stored) {
      console.log(`  ${m.nodeId} -> ${m.codeConnectName} (${m.codeConnectSrc})`);
    }
  }
}

main().catch(console.error);
