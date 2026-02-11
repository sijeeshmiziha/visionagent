/**
 * Figma Example: create_design_system_rules
 *
 * Run: npm run example -- examples/figma/10-create-design-system-rules.ts
 * Inputs: FIGMA_URL (env or --figma-url=). Optional: FIGMA_OUTPUT_PATH
 */

import { executeTool } from '../../src/index';
import { figmaCreateDesignSystemRulesTool, parseFigmaUrl } from '../../src/modules/figma';
import { getInput, requireInput } from '../lib/input';

async function main() {
  console.log('=== figma_create_design_system_rules ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
    process.exit(1);
  }

  const figmaUrl = requireInput('FIGMA_URL', 'Set FIGMA_URL in env or pass --figma-url=...');
  const { fileKey } = parseFigmaUrl(figmaUrl);
  const outputPath = getInput('FIGMA_OUTPUT_PATH') ?? '.cursor/rules/figma-design-system.md';
  console.log('File key:', fileKey);
  console.log('Output  :', outputPath, '\n');

  const result = await executeTool(figmaCreateDesignSystemRulesTool, {
    fileKey,
    outputPath,
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
