/**
 * Figma Example: convert_to_react
 *
 * Convert a Figma design node to a React component with CSS.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *   export FIGMA_URL="https://www.figma.com/design/ABC123/...?node-id=1-2"
 *
 * Run:
 *   npx tsx examples/figma/13-convert-to-react.ts
 */
import { executeTool, figmaConvertToReactTool } from 'visionagent';

async function main() {
  console.log('=== figma_convert_to_react (basic) ===\n');

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
    useTailwind: false,
    optimizeComponents: false,
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
    console.log('\n--- JSX ---');
    console.log(out.jsx.slice(0, 2000));
    if (out.css) {
      console.log('\n--- CSS ---');
      console.log(out.css.slice(0, 500));
    }
    if (out.fonts) {
      console.log('\n--- Fonts ---');
      console.log(out.fonts);
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
