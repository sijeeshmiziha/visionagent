/**
 * Figma Example: create_design_system_rules
 *
 * Generate design system rules (Markdown) from a Figma file's variables and styles.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 10-create-design-system-rules.ts
 */
import { executeTool, figmaCreateDesignSystemRulesTool, parseFigmaUrl } from 'visionagent';

const DEFAULT_FIGMA_URL = 'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1';

async function main() {
  console.log('=== figma_create_design_system_rules ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const { fileKey } = parseFigmaUrl(figmaUrl);
  const outputPath = process.env.FIGMA_OUTPUT_PATH ?? '.cursor/rules/figma-design-system.md';
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
