/**
 * Figma Example: Design-to-Code Agent
 *
 * Run a full agent that analyzes a Figma design and generates
 * production-ready React + Tailwind code. The agent autonomously
 * decides which tools to use (design context, conversion, cleanup).
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *   export FIGMA_URL="https://www.figma.com/design/ABC123/...?node-id=1-2"
 *   export OPENAI_API_KEY="sk-..."  # or any provider
 *
 * Run:
 *   npx tsx examples/figma/16-figma-to-code-agent.ts
 */
import { runFigmaToCodeAgent } from 'visionagent';

async function main() {
  console.log('=== Figma Design-to-Code Agent ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set.');
    process.exit(1);
  }

  if (!process.env.FIGMA_URL) {
    console.error('FIGMA_URL is not set.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL;

  console.log(`Figma URL: ${figmaUrl}`);
  console.log('Starting agent...\n');

  const result = await runFigmaToCodeAgent({
    input: `Convert this Figma design to a React component with Tailwind CSS: ${figmaUrl}. Use the convert tool with Tailwind enabled and component optimization. Return the generated JSX.`,
    model: { provider: 'openai', model: 'gpt-4o' },
    maxIterations: 10,
    onStep: step => {
      console.log(`[Step ${step.iteration}]`);
      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          console.log(`  Tool: ${tc.toolName}`);
        }
      }
      if (step.content) {
        console.log(`  Response: ${step.content.slice(0, 200)}...`);
      }
    },
  });

  console.log('\n=== Agent Result ===');
  console.log(result.output.slice(0, 5000));
  console.log('\nTotal steps:', result.steps.length);
  console.log('Token usage:', result.totalUsage);
}

main().catch(console.error);
