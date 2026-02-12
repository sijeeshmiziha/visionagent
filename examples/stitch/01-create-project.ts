/**
 * Stitch Example: Create Project
 *
 * Creates a new Stitch project using the stitch_create_project tool.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 01-create-project.ts
 */
import { executeTool, stitchCreateProjectTool } from 'visionagent';

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

  console.log('=== stitch_create_project ===\n');

  const title = process.env.STITCH_TITLE ?? 'My New Project';
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
