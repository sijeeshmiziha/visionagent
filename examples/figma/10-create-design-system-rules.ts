/**
 * Figma Example: create_design_system_rules
 *
 * Generates a markdown design system rule file from a Figma file's
 * variables, styles, and structure. Useful for feeding into AI agents.
 *
 * Run:  npm run example -- examples/figma/10-create-design-system-rules.ts
 *
 * Requires: FIGMA_API_KEY in .env
 * Note: Your token must have the `file_variables:read` scope enabled.
 */

import { executeTool } from '../../src/index';
import { figmaCreateDesignSystemRulesTool, parseFigmaUrl } from '../../src/modules/figma';

const FIGMA_URL =
  process.env.FIGMA_URL ??
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

async function main() {
  console.log('=== figma_create_design_system_rules ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const { fileKey } = parseFigmaUrl(FIGMA_URL);
  console.log('File key:', fileKey, '\n');

  const result = await executeTool(figmaCreateDesignSystemRulesTool, {
    fileKey,
    outputPath: '.cursor/rules/figma-design-system.md',
  });

  if (result.success) {
    const out = result.output as {
      ruleContent: string;
      outputPath: string;
      variableCount: number;
      styleCount: number;
    };

    console.log(`Variables: ${out.variableCount}`);
    console.log(`Styles   : ${out.styleCount}`);
    console.log(`Output   : ${out.outputPath}\n`);

    console.log('--- Generated rule content (preview) ---\n');
    const preview = out.ruleContent.slice(0, 1500);
    console.log(preview);
    if (out.ruleContent.length > 1500) {
      console.log(`\n... truncated (${out.ruleContent.length} total chars)`);
    }
  } else {
    console.error('Error:', result.error);
    console.log('\nHint: Make sure your token has the `file_variables:read` scope.');
  }
}

main().catch(console.error);
