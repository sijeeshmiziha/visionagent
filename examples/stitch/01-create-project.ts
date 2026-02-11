/**
 * Stitch Example: create_project
 *
 * Run: npm run example -- examples/stitch/01-create-project.ts
 * Inputs: STITCH_TITLE (env or --stitch-title=). Optional.
 */

import { executeTool } from '../../src/index';
import { stitchCreateProjectTool } from '../../src/modules/stitch';
import { getInput } from '../lib/input';

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

  const title = getInput('STITCH_TITLE') ?? '';

  const result = await executeTool(stitchCreateProjectTool, { title });

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
