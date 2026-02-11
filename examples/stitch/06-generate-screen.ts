/**
 * Stitch Example: generate_screen_from_text
 *
 * Generates a new screen from a text prompt (may take a few minutes).
 *
 * Run:  npm run example -- examples/stitch/06-generate-screen.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * Optional: STITCH_PROJECT_ID
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchGenerateScreenTool } from '../../src/modules/stitch';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  const projectId = process.env.STITCH_PROJECT_ID ?? '4044680601076201931';

  console.log('=== stitch_generate_screen ===\n');
  console.log('Generating screen (this may take a few minutes)...\n');

  const result = await executeTool(stitchGenerateScreenTool, {
    projectId,
    prompt: 'A simple login screen with email and password fields and a sign-in button.',
    deviceType: 'MOBILE',
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
