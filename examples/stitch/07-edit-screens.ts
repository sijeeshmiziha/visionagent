/**
 * Stitch Example: edit_screens
 *
 * Edits existing screens with a text prompt (may take a few minutes).
 *
 * Run:  npm run example -- examples/stitch/07-edit-screens.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * Optional: STITCH_PROJECT_ID, STITCH_SCREEN_ID (comma-separated for multiple)
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchEditScreensTool } from '../../src/modules/stitch';

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
  const screenIdsEnv = process.env.STITCH_SCREEN_ID;
  const selectedScreenIds = screenIdsEnv
    ? screenIdsEnv.split(',').map(s => s.trim())
    : ['98b50e2ddc9943efb387052637738f61'];

  console.log('=== stitch_edit_screens ===\n');
  console.log('Editing screens (this may take a few minutes)...\n');

  const result = await executeTool(stitchEditScreensTool, {
    projectId,
    selectedScreenIds,
    prompt: 'Change the primary button color to blue.',
  });

  if (result.success) {
    const out = result.output as { count?: number; screens?: unknown[] };
    console.log('Edited', out.count ?? 0, 'screen(s).');
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
