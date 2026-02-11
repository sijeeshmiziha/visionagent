/**
 * Figma Example: send_code_connect_mappings
 *
 * Batch-stores multiple Code Connect mappings at once.
 * This is a local-only operation (no Figma API call).
 *
 * Run:  npm run example -- examples/figma/09-send-code-connect-mappings.ts
 *
 * Does NOT require FIGMA_API_KEY (local-only operation).
 */

import { executeTool } from '../../src/index';
import {
  figmaSendCodeConnectMappingsTool,
  getStoredMappings,
  parseFigmaUrl,
} from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_send_code_connect_mappings ===\n');

  const { fileKey } = parseFigmaUrl(FIGMA_URL);
  console.log('File key:', fileKey, '\n');

  const mappings = [
    {
      nodeId: '11301:18833',
      componentName: 'HeroSection',
      source: 'src/components/HeroSection.tsx',
      label: 'React',
    },
    {
      nodeId: '11301:18900',
      componentName: 'NavBar',
      source: 'src/components/NavBar.tsx',
      label: 'React',
    },
    {
      nodeId: '11301:19000',
      componentName: 'Footer',
      source: 'src/components/Footer.tsx',
      label: 'React',
    },
  ];

  console.log('Sending batch of', mappings.length, 'mappings:\n');
  for (const m of mappings) {
    console.log(`  ${m.nodeId} -> ${m.componentName} (${m.source})`);
  }
  console.log();

  const result = await executeTool(figmaSendCodeConnectMappingsTool, { fileKey, mappings });

  if (result.success) {
    const out = result.output as { success: boolean; count: number; stored: unknown[] };
    console.log(`Stored ${out.count} mapping(s) successfully.`);

    // Verify
    const stored = getStoredMappings(fileKey);
    console.log(`\nVerification — getStoredMappings() returns ${stored.length} entries:`);
    for (const m of stored) {
      console.log(`  ${m.nodeId} -> ${m.codeConnectName} (${m.codeConnectSrc})`);
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
