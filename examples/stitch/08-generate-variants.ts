/**
 * Stitch Example: generate_variants
 *
 * Generates design variants of existing screens.
 *
 * Run:  npm run example -- examples/stitch/08-generate-variants.ts
 *
 * Requires: STITCH_MCP_URL or STITCH_MCP_COMMAND in .env
 * Optional: STITCH_PROJECT_ID, STITCH_SCREEN_ID (comma-separated)
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { executeTool } from '../../src/index';
import { stitchGenerateVariantsTool } from '../../src/modules/stitch';

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
  const screenIdsEnv = process.env.STITCH_SCREEN_ID;
  const selectedScreenIds = screenIdsEnv
    ? screenIdsEnv.split(',').map(s => s.trim())
    : ['98b50e2ddc9943efb387052637738f61'];

  console.log('=== stitch_generate_variants ===\n');
  console.log('Generating variants...\n');

  const result = await executeTool(stitchGenerateVariantsTool, {
    projectId,
    selectedScreenIds,
    prompt: 'Create a darker, high-contrast version.',
    variantCount: 2,
    creativeRange: 'EXPLORE',
    aspects: ['COLOR_SCHEME'],
  });

  if (result.success) {
    const out = result.output as { count?: number; screens?: unknown[] };
    console.log('Generated', out.count ?? 0, 'variant(s).');
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
