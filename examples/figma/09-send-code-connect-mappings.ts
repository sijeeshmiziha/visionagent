/**
 * Figma Example: send_code_connect_mappings
 *
 * Send a batch of Code Connect mappings (nodeId → component).
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 09-send-code-connect-mappings.ts
 */
import {
  executeTool,
  figmaSendCodeConnectMappingsTool,
  getStoredMappings,
  parseFigmaUrl,
} from 'visionagent';

const DEFAULT_FIGMA_URL = 'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1';
const DEFAULT_MAPPINGS_JSON =
  '[{"nodeId":"11301:18833","componentName":"HeroSection","source":"src/components/HeroSection.tsx","label":"React"}]';

async function main() {
  console.log('=== figma_send_code_connect_mappings ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const { fileKey } = parseFigmaUrl(figmaUrl);
  console.log('File key:', fileKey, '\n');

  const mappingsJson = process.env.FIGMA_MAPPINGS_JSON ?? DEFAULT_MAPPINGS_JSON;
  const mappings = JSON.parse(mappingsJson) as {
    nodeId: string;
    componentName: string;
    source: string;
    label: string;
  }[];

  if (mappings.length === 0) {
    console.error(
      'Set FIGMA_MAPPINGS_JSON (JSON array of { nodeId, componentName, source, label }).'
    );
    process.exit(1);
  }

  console.log('Sending batch of', mappings.length, 'mappings:\n');
  for (const m of mappings) {
    console.log(`  ${m.nodeId} -> ${m.componentName} (${m.source})`);
  }
  console.log();

  const result = await executeTool(figmaSendCodeConnectMappingsTool, {
    fileKey,
    mappings,
  });

  if (result.success) {
    const out = result.output as {
      success: boolean;
      count: number;
      stored: unknown[];
    };
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
