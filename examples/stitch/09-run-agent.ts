/**
 * Stitch Example: runStitchAgent
 *
 * Runs the Stitch agent — an AI-powered loop that can autonomously call any Stitch
 * tool (create project, generate screens, edit screens, etc.) based on a natural-
 * language prompt.
 *
 * Run: npm run example -- examples/stitch/09-run-agent.ts
 * Inputs:
 *   STITCH_PROMPT  (env or --stitch-prompt=)  Required — the task for the agent.
 *   OPENAI_API_KEY (env)                      Required — used by the default model.
 *   STITCH_MODEL   (env or --stitch-model=)   Optional — model name (default: gpt-4o-mini).
 *   STITCH_MAX_ITERATIONS (env or --stitch-max-iterations=) Optional — default 10.
 */

import { runStitchAgent } from '../../src/modules/stitch';
import type { AgentStep } from '../../src/lib/types/agent';
import { getInput, requireInput } from '../lib/input';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  // --- Pre-flight checks ---------------------------------------------------
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured. Set STITCH_MCP_URL or STITCH_MCP_COMMAND (and optionally STITCH_MCP_ARGS) in .env.\nSee:',
      STITCH_SETUP
    );
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is required for the default model (gpt-4o-mini).');
    process.exit(1);
  }

  // --- Inputs ---------------------------------------------------------------
  const prompt = requireInput(
    'STITCH_PROMPT',
    'Set STITCH_PROMPT or pass --stitch-prompt="Create a project and generate a login screen"'
  );
  const modelName = getInput('STITCH_MODEL') ?? 'gpt-4o-mini';
  const maxIterations = Number(getInput('STITCH_MAX_ITERATIONS') ?? '10');

  console.log('=== runStitchAgent ===\n');
  console.log('Prompt        :', prompt);
  console.log('Model         :', modelName);
  console.log('Max iterations:', maxIterations);
  console.log('');

  // --- Run the agent --------------------------------------------------------
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

  // --- Output ---------------------------------------------------------------
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
