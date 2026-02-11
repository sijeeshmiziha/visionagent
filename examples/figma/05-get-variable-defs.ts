/**
 * Figma Example: get_variable_defs
 *
 * Returns design tokens (variables) from a Figma file: colors, spacing, typography values.
 *
 * Run:  npm run example -- examples/figma/05-get-variable-defs.ts
 *
 * Requires: FIGMA_API_KEY in .env
 * Note: Your token must have the `file_variables:read` scope enabled.
 */

import { executeTool } from '../../src/index';
import { figmaGetVariableDefsTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_get_variable_defs ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const { fileKey } = parseFigmaUrl(FIGMA_URL);
  console.log('File key:', fileKey, '\n');

  const result = await executeTool(figmaGetVariableDefsTool, { fileKey });

  if (result.success) {
    const out = result.output as {
      local?: Record<string, string | number>;
      published?: Record<string, string | number>;
      combined?: Record<string, string | number>;
    };

    const localCount = Object.keys(out.local ?? {}).length;
    const publishedCount = Object.keys(out.published ?? {}).length;
    const combinedCount = Object.keys(out.combined ?? {}).length;

    console.log(
      `Found ${combinedCount} variables (${localCount} local, ${publishedCount} published)\n`
    );

    if (out.local && localCount > 0) {
      console.log('--- Local variables ---');
      for (const [name, value] of Object.entries(out.local).slice(0, 20)) {
        console.log(`  ${name}: ${value}`);
      }
      if (localCount > 20) console.log(`  ... and ${localCount - 20} more`);
      console.log();
    }

    if (out.published && publishedCount > 0) {
      console.log('--- Published variables ---');
      for (const [name, value] of Object.entries(out.published).slice(0, 20)) {
        console.log(`  ${name}: ${value}`);
      }
      if (publishedCount > 20) console.log(`  ... and ${publishedCount - 20} more`);
    }
  } else {
    console.error('Error:', result.error);
    console.log('\nHint: Make sure your token has the `file_variables:read` scope.');
  }
}

main().catch(console.error);
