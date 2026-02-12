/**
 * Stitch Example: Generate Variants
 *
 * Generate design variants of screen(s) with a prompt.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 08-generate-variants.ts
 */
import { executeTool, stitchGenerateVariantsTool } from 'visionagent';

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
  const screenIdsEnv = process.env.STITCH_SCREEN_ID ?? '98b50e2ddc9943efb387052637738f61';
  const selectedScreenIds = screenIdsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const prompt = process.env.STITCH_PROMPT ?? 'Try a dark theme with accent color variations.';
  const variantCount = Number(process.env.STITCH_VARIANT_COUNT ?? '2') || 2;
  const creativeRangeRaw = process.env.STITCH_CREATIVE_RANGE ?? 'EXPLORE';
  const creativeRange =
    creativeRangeRaw === 'REFINE' ||
    creativeRangeRaw === 'EXPLORE' ||
    creativeRangeRaw === 'REIMAGINE'
      ? creativeRangeRaw
      : 'EXPLORE';

  console.log('=== stitch_generate_variants ===\n');
  console.log('Generating variants...\n');

  const result = await executeTool(stitchGenerateVariantsTool, {
    projectId,
    selectedScreenIds,
    prompt,
    variantCount,
    creativeRange,
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
