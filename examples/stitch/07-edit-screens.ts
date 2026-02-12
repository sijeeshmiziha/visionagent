/**
 * Stitch Example: Edit Screens
 *
 * Edit existing screen(s) with a text prompt.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 07-edit-screens.ts
 */
import { executeTool, stitchEditScreensTool } from 'visionagent';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured.\n' +
        'Set STITCH_MCP_URL or STITCH_MCP_COMMAND in your environment.\n' +
        'See: ' +
        STITCH_SETUP
    );
    process.exit(1);
  }

  const projectId = process.env.STITCH_PROJECT_ID ?? '4044680601076201931';
  const screenIdsEnv = process.env.STITCH_SCREEN_ID ?? '98b50e2ddc9943efb387052637738f61';
  const selectedScreenIds = screenIdsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const prompt =
    process.env.STITCH_PROMPT ?? 'Make the primary button blue and add a subtle shadow.';

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
