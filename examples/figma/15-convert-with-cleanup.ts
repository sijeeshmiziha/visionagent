/**
 * Figma Example: convert_to_react with AI cleanup
 *
 * Convert a Figma design to React + Tailwind, then clean up
 * the generated code using an AI model (any provider).
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *   export FIGMA_URL="https://www.figma.com/design/ABC123/...?node-id=1-2"
 *   export GOOGLE_GENERATIVE_AI_API_KEY="..."  # or OPENAI_API_KEY / ANTHROPIC_API_KEY
 *
 * Run:
 *   npx tsx examples/figma/15-convert-with-cleanup.ts
 */
import { convertFigmaToReact, cleanupGeneratedCode } from 'visionagent';

async function main() {
  console.log('=== Figma → React + Tailwind + AI Cleanup ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set.');
    process.exit(1);
  }

  if (!process.env.FIGMA_URL) {
    console.error('FIGMA_URL is not set.');
    process.exit(1);
  }

  console.log('Step 1: Converting Figma design to React...');
  const result = await convertFigmaToReact(process.env.FIGMA_URL, {
    useTailwind: true,
    optimizeComponents: true,
  });

  if (!result) {
    console.error('Conversion failed.');
    process.exit(1);
  }

  console.log(`  Component: ${result.componentName}`);
  console.log(`  Assets: ${Object.keys(result.assets).length}`);
  console.log(`  Raw JSX length: ${result.jsx.length} chars\n`);

  console.log('Step 2: Cleaning up with AI...');
  const cleaned = await cleanupGeneratedCode(result.jsx, {
    provider: 'google',
    model: 'gemini-2.0-flash',
  });

  console.log(`  Cleaned JSX length: ${cleaned.length} chars\n`);
  console.log('--- Cleaned JSX ---');
  console.log(cleaned.slice(0, 3000));
}

main().catch(console.error);
