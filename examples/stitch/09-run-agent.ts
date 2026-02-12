/**
 * Stitch Example: Run Agent
 *
 * Runs the Stitch agent — an AI-powered loop that can autonomously call any Stitch
 * tool (create project, generate screens, edit screens, etc.) based on a natural-
 * language prompt.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 09-run-agent.ts
 */
import { runStitchAgent } from 'visionagent';
import type { AgentStep } from 'visionagent';

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

  const prompt = process.env.STITCH_PROMPT ?? 'Create a project and generate a login screen';
  const modelName = process.env.STITCH_MODEL ?? 'gpt-4o-mini';
  const maxIterations = Number(process.env.STITCH_MAX_ITERATIONS ?? '10');

  console.log('=== runStitchAgent ===\n');
  console.log('Prompt         :', prompt);
  console.log('Model          :', modelName);
  console.log('Max iterations :', maxIterations);
  console.log('');

  const result = await runStitchAgent({
    input: prompt,
    model: { provider: 'openai', model: modelName },
    maxIterations,
    onStep: (step: AgentStep) => {
      console.log(`--- Step ${step.iteration + 1} ---`);
      if (step.content) {
        console.log('Agent:', step.content);
      }
      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          console.log(`  Tool call: ${tc.toolName}(${JSON.stringify(tc.input)})`);
        }
      }
      if (step.toolResults?.length) {
        for (const tr of step.toolResults) {
          const preview =
            typeof tr.output === 'string'
              ? tr.output.slice(0, 200)
              : JSON.stringify(tr.output).slice(0, 200);
          console.log(`  Result [${tr.toolName}]: ${preview}`);
        }
      }
      if (step.usage) {
        console.log(
          `  Tokens: input=${step.usage.inputTokens ?? '?'} output=${step.usage.outputTokens ?? '?'}`
        );
      }
      console.log('');
    },
  });

  console.log('=== Agent finished ===\n');
  console.log('Final output:\n', result.output);
  console.log(`\nTotal steps: ${result.steps.length}`);
  if (result.totalUsage) {
    console.log(
      `Total tokens: input=${result.totalUsage.inputTokens ?? '?'} output=${result.totalUsage.outputTokens ?? '?'} total=${result.totalUsage.totalTokens ?? '?'}`
    );
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
