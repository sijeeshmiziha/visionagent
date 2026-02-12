/**
 * Figma Example: get_variable_defs
 *
 * Get variable definitions (local and published) for a file.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 05-get-variable-defs.ts
 */
import { executeTool, figmaGetVariableDefsTool, parseFigmaUrl } from 'visionagent';

async function main() {
  console.log('=== figma_get_variable_defs ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  if (!process.env.FIGMA_URL) {
    console.error('FIGMA_URL is not set. Set it in your environment and run again.');
    console.error('Example: https://www.figma.com/design/<fileKey>/<fileName>');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL;
  const { fileKey } = parseFigmaUrl(figmaUrl);
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
