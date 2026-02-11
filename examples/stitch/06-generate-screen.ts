/**
 * Stitch Example: generate_screen_from_text
 *
 * Run: npm run example -- examples/stitch/06-generate-screen.ts
 * Inputs: STITCH_PROJECT_ID, STITCH_PROMPT (env or --key=). Optional: STITCH_DEVICE_TYPE
 */

import { executeTool } from '../../src/index';
import { stitchGenerateScreenTool } from '../../src/modules/stitch';
import { getInput, requireInput } from '../lib/input';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  const projectId = requireInput(
    'STITCH_PROJECT_ID',
    'Set STITCH_PROJECT_ID or pass --stitch-project-id=...'
  );
  const prompt = requireInput('STITCH_PROMPT', 'Set STITCH_PROMPT or pass --stitch-prompt=...');
  const deviceTypeRaw = getInput('STITCH_DEVICE_TYPE') ?? 'MOBILE';
  const deviceType =
    deviceTypeRaw === 'MOBILE' ||
    deviceTypeRaw === 'DESKTOP' ||
    deviceTypeRaw === 'TABLET' ||
    deviceTypeRaw === 'AGNOSTIC'
      ? deviceTypeRaw
      : 'DEVICE_TYPE_UNSPECIFIED';

  console.log('=== stitch_generate_screen ===\n');
  console.log('Generating screen (this may take a few minutes)...\n');

  const result = await executeTool(stitchGenerateScreenTool, {
    projectId,
    prompt,
    deviceType: deviceType === 'DEVICE_TYPE_UNSPECIFIED' ? 'DEVICE_TYPE_UNSPECIFIED' : deviceType,
  });

  if (result.success) {
    const out = result.output as { screen?: { name: string }; outputComponents?: string[] };
    console.log('Screen:', out.screen?.name ?? '—');
    if (out.outputComponents?.length) console.log('Output:', out.outputComponents);
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
