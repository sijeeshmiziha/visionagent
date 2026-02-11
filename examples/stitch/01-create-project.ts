/**
 * Stitch Example: create_project
 *
 * Creates a new Stitch project (optional title).
 *
 * Run:  npm run example -- examples/stitch/01-create-project.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND (and optionally STITCH_MCP_ARGS) in .env
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchCreateProjectTool } from '../../src/modules/stitch';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND (and optionally STITCH_MCP_ARGS) in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  console.log('=== stitch_create_project ===\n');

  const result = await executeTool(stitchCreateProjectTool, { title: 'VisionAgent Test Project' });

  if (result.success) {
    const out = result.output as { name?: string; title?: string };
    console.log('Project created:');
    console.log('  Name :', out.name);
    console.log('  Title:', out.title);
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
