/**
 * Figma Example: send_code_connect_mappings
 *
 * Run: npm run example -- examples/figma/09-send-code-connect-mappings.ts
 * Inputs: FIGMA_URL (env or --figma-url=). Mappings via FIGMA_MAPPINGS_JSON (JSON array of { nodeId, componentName, source, label })
 */

import { executeTool } from '../../src/index';
import {
  figmaSendCodeConnectMappingsTool,
  getStoredMappings,
  parseFigmaUrl,
} from '../../src/modules/figma';
import { getInput, requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_send_code_connect_mappings ===\n');

  const figmaUrl = requireInput('FIGMA_URL', 'Set FIGMA_URL in env or pass --figma-url=...');
  const { fileKey } = parseFigmaUrl(figmaUrl);
  console.log('File key:', fileKey, '\n');

  const mappingsJson = getInput('FIGMA_MAPPINGS_JSON');
  const mappings = mappingsJson
    ? (JSON.parse(mappingsJson) as {
        nodeId: string;
        componentName: string;
        source: string;
        label: string;
      }[])
    : [];

  if (mappings.length === 0) {
    console.error(
      'Set FIGMA_MAPPINGS_JSON (JSON array of { nodeId, componentName, source, label }) or pass --figma-mappings-json=...'
    );
    process.exit(1);
  }

  console.log('Sending batch of', mappings.length, 'mappings:\n');
  for (const m of mappings) {
    console.log(`  ${m.nodeId} -> ${m.componentName} (${m.source})`);
  }
  console.log();

  const result = await executeTool(figmaSendCodeConnectMappingsTool, { fileKey, mappings });

  if (result.success) {
    const out = result.output as { success: boolean; count: number; stored: unknown[] };
    console.log(`Stored ${out.count} mapping(s) successfully.`);
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
