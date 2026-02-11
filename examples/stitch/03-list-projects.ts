/**
 * Stitch Example: list_projects
 *
 * Lists Stitch projects (optional filter: view=owned or view=shared).
 *
 * Run:  npm run example -- examples/stitch/03-list-projects.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchListProjectsTool } from '../../src/modules/stitch';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  console.log('=== stitch_list_projects ===\n');

  const result = await executeTool(stitchListProjectsTool, { filter: 'view=owned' });

  if (result.success) {
    const out = result.output as { projects?: { name: string; title?: string }[] };
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
