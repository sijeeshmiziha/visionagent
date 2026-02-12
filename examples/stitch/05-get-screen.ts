/**
 * Stitch Example: Get Screen
 *
 * Get screen details by project and screen ID.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 05-get-screen.ts
 */
import { executeTool, stitchGetScreenTool } from 'visionagent';

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
  const screenId = process.env.STITCH_SCREEN_ID ?? '98b50e2ddc9943efb387052637738f61';
  const name = `projects/${projectId}/screens/${screenId}`;

  console.log('=== stitch_get_screen ===\n');

  const result = await executeTool(stitchGetScreenTool, { name });

  if (result.success) {
    const out = result.output as {
      screen?: { name: string; design?: unknown };
    };
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
