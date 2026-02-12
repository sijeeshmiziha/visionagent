/**
 * Stitch Example: Design to Technical Requirements
 *
 * Runs the Design Requirements agent — an orchestrator that uses specialized
 * subagents to analyze a Stitch project and produce:
 * - User personas
 * - User flows
 * - User stories
 * - API requirements per screen
 * - Tech stack recommendations
 *
 * Output is returned as structured JSON (result.output).
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *   export STITCH_PROJECT_ID="4044680601076201931"  # your Stitch project ID
 *
 * Run:
 *   npx tsx 10-design-requirements.ts
 */
import { runDesignRequirementsAgent } from 'visionagent';

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

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is required for the default model (gpt-4o-mini).');
    process.exit(1);
  }

  const projectId = process.env.STITCH_PROJECT_ID ?? '4044680601076201931';
  const input =
    process.env.STITCH_REQUIREMENTS_INPUT ??
    'Analyze this app design and generate technical requirements.';

  console.log('=== runDesignRequirementsAgent ===\n');
  console.log('Project ID     :', projectId);
  console.log('Input          :', input);
  console.log('');

  const result = await runDesignRequirementsAgent({
    input,
    projectId,
    model: { provider: 'openai', model: process.env.STITCH_MODEL ?? 'gpt-4o-mini' },
  });

  console.log('=== Full JSON output ===\n');
  console.log(JSON.stringify(result.output, null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
