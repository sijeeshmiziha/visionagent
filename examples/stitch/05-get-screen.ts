/**
 * Stitch Example: get_screen
 *
 * Run: npm run example -- examples/stitch/05-get-screen.ts
 * Inputs: STITCH_PROJECT_ID, STITCH_SCREEN_ID (env or --stitch-project-id=, --stitch-screen-id=)
 */

import { executeTool } from '../../src/index';
import { stitchGetScreenTool } from '../../src/modules/stitch';
import { requireInput } from '../lib/input';

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
  const screenId = requireInput(
    'STITCH_SCREEN_ID',
    'Set STITCH_SCREEN_ID or pass --stitch-screen-id=...'
  );
  const name = `projects/${projectId}/screens/${screenId}`;

  console.log('=== stitch_get_screen ===\n');

  const result = await executeTool(stitchGetScreenTool, { name });

  if (result.success) {
    const out = result.output as { screen?: { name: string; design?: unknown } };
    console.log('Screen:', out.screen?.name ?? '—');
    if (out.screen?.design) console.log('  (design payload present)');
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
