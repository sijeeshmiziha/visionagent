/**
 * Figma Example: convert_to_react with Tailwind CSS
 *
 * Convert a Figma design to a React component with Tailwind utility classes.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *   export FIGMA_URL="https://www.figma.com/design/ABC123/...?node-id=1-2"
 *
 * Run:
 *   npx tsx examples/figma/14-convert-with-tailwind.ts
 */
import { executeTool, figmaConvertToReactTool } from 'visionagent';

async function main() {
  console.log('=== figma_convert_to_react (Tailwind) ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set.');
    process.exit(1);
  }

  if (!process.env.FIGMA_URL) {
    console.error('FIGMA_URL is not set.');
    process.exit(1);
  }

  const result = await executeTool(figmaConvertToReactTool, {
    figmaUrl: process.env.FIGMA_URL,
    useTailwind: true,
    optimizeComponents: true,
    useCodeCleaner: false,
  });

  if (result.success) {
    const out = result.output as {
      jsx: string;
      css: string;
      componentName: string;
      fonts: string;
      assetsCount: number;
    };
    console.log('Component:', out.componentName);
    console.log('Assets:', out.assetsCount);
    console.log('\n--- JSX (with Tailwind classes) ---');
    console.log(out.jsx.slice(0, 3000));
    if (out.css) {
      console.log('\n--- Fallback CSS (unsupported by Tailwind) ---');
      console.log(out.css.slice(0, 500));
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
