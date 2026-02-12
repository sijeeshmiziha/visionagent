/**
 * Stitch Example: List Screens
 *
 * List screens in a Stitch project.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 04-list-screens.ts
 */
import { executeTool, stitchListScreensTool } from 'visionagent';

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

  if (!process.env.STITCH_PROJECT_ID) {
    console.error('STITCH_PROJECT_ID is not set. Set it in your environment and run again.');
    console.error('Example: 4044680601076201931');
    process.exit(1);
  }

  const projectId = process.env.STITCH_PROJECT_ID;

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
