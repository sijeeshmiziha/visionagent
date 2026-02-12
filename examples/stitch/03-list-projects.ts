/**
 * Stitch Example: List Projects
 *
 * List Stitch projects (owned or shared).
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 03-list-projects.ts
 */
import { executeTool, stitchListProjectsTool } from 'visionagent';

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

  console.log('=== stitch_list_projects ===\n');

  const filter = process.env.STITCH_FILTER ?? 'view=owned';
  const result = await executeTool(stitchListProjectsTool, { filter });

  if (result.success) {
    const out = result.output as {
      projects?: { name: string; title?: string }[];
    };
    const list = out.projects ?? [];
    console.log(`Projects (${list.length}):`);
    list.forEach(p => {
      console.log(' ', p.name, p.title != null ? `- ${p.title}` : '');
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
