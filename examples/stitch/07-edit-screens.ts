/**
 * Stitch Example: edit_screens
 *
 * Run: npm run example -- examples/stitch/07-edit-screens.ts
 * Inputs: STITCH_PROJECT_ID, STITCH_SCREEN_ID (comma-separated), STITCH_PROMPT (env or --key=value)
 */

import { executeTool } from '../../src/index';
import { stitchEditScreensTool } from '../../src/modules/stitch';
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
  const screenIdsEnv = requireInput(
    'STITCH_SCREEN_ID',
    'Set STITCH_SCREEN_ID or pass --stitch-screen-id=... (comma-separated for multiple)'
  );
  const selectedScreenIds = screenIdsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const prompt = requireInput('STITCH_PROMPT', 'Set STITCH_PROMPT or pass --stitch-prompt=...');

  console.log('=== stitch_edit_screens ===\n');
  console.log('Editing screens (this may take a few minutes)...\n');

  const result = await executeTool(stitchEditScreensTool, {
    projectId,
    selectedScreenIds,
    prompt,
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
