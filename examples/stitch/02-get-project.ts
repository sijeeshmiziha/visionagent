/**
 * Stitch Example: get_project
 *
 * Retrieves a project by resource name (projects/{projectId}).
 *
 * Run:  npm run example -- examples/stitch/02-get-project.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchGetProjectTool } from '../../src/modules/stitch';

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
  const name = `projects/${projectId}`;

  console.log('=== stitch_get_project ===\n');

  const result = await executeTool(stitchGetProjectTool, { name });

  if (result.success) {
    const out = result.output as { name?: string; title?: string };
    console.log('Project:', out.name, out.title != null ? `- ${out.title}` : '');
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
