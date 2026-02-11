/**
 * Stitch Example: generate_variants
 *
 * Run: npm run example -- examples/stitch/08-generate-variants.ts
 * Inputs: STITCH_PROJECT_ID, STITCH_SCREEN_ID, STITCH_PROMPT (env or --key=value). Optional: STITCH_VARIANT_COUNT, STITCH_CREATIVE_RANGE
 */

import { executeTool } from '../../src/index';
import { stitchGenerateVariantsTool } from '../../src/modules/stitch';
import { getInput, requireInput } from '../lib/input';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  const projectId = requireInput(
    'STITCH_PROJECT_ID',
    'Set STITCH_PROJECT_ID or pass --stitch-project-id=...'
  );
  const screenIdsEnv = requireInput(
    'STITCH_SCREEN_ID',
    'Set STITCH_SCREEN_ID or pass --stitch-screen-id=... (comma-separated)'
  );
  const selectedScreenIds = screenIdsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const prompt = requireInput('STITCH_PROMPT', 'Set STITCH_PROMPT or pass --stitch-prompt=...');
  const variantCountStr = getInput('STITCH_VARIANT_COUNT');
  const variantCount = variantCountStr ? Number.parseInt(variantCountStr, 10) : 2;
  const creativeRange = getInput('STITCH_CREATIVE_RANGE') ?? 'EXPLORE';

  console.log('=== stitch_generate_variants ===\n');
  console.log('Generating variants...\n');

  const result = await executeTool(stitchGenerateVariantsTool, {
    projectId,
    selectedScreenIds,
    prompt,
    variantCount,
    creativeRange:
      creativeRange === 'REFINE' || creativeRange === 'EXPLORE' || creativeRange === 'REIMAGINE'
        ? creativeRange
        : 'EXPLORE',
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
