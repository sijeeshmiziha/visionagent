/**
 * Stitch Example: get_screen
 *
 * Retrieves a screen by resource name (projects/{projectId}/screens/{screenId}).
 *
 * Run:  npm run example -- examples/stitch/05-get-screen.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * Optional: STITCH_PROJECT_ID, STITCH_SCREEN_ID
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchGetScreenTool } from '../../src/modules/stitch';

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
  const screenId = process.env.STITCH_SCREEN_ID ?? '98b50e2ddc9943efb387052637738f61';
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
