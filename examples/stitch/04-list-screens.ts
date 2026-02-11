/**
 * Stitch Example: list_screens
 *
 * Run: npm run example -- examples/stitch/04-list-screens.ts
 * Inputs: STITCH_PROJECT_ID (env or --stitch-project-id=)
 */

import { executeTool } from '../../src/index';
import { stitchListScreensTool } from '../../src/modules/stitch';
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

  console.log('=== stitch_list_screens ===\n');

  const result = await executeTool(stitchListScreensTool, { projectId });

  if (result.success) {
    const out = result.output as { screens?: { name: string }[] };
    const list = out.screens ?? [];
    console.log(`Screens (${list.length}):`);
    list.forEach(s => {
      console.log(' ', s.name);
    });
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
