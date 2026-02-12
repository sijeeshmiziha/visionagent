/**
 * Example: Hello World Agent
 *
 * Minimal agent with a greeting tool.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-hello-world.ts
 */
import { runHelloWorldAgent } from 'visionagent';
import type { AgentStep } from 'visionagent';

async function main() {
  console.log('=== Hello World Agent ===\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? 'Greet Alice and Bob.';
  const systemPrompt =
    process.env.SYSTEM_PROMPT ??
    'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions.';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '5') || 5;

  const result = await runHelloWorldAgent({
    input: agentInput,
    model: { provider, model: modelName },
    systemPrompt,
    maxIterations,
    onStep: (step: AgentStep) => {
      const stepNum = step.iteration + 1;

      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          const args = tc.input as Record<string, unknown>;
          console.log(`  [Step ${stepNum}] Tool: ${tc.toolName}(${JSON.stringify(args)})`);
        }
      } else {
        const preview = step.content?.slice(0, 80) ?? '';
        console.log(
          `  [Step ${stepNum}] Response: ${preview}${step.content && step.content.length > 80 ? '...' : ''}`
        );
      }

      if (step.toolResults?.length) {
        for (const tr of step.toolResults) {
          const status = tr.isError ? 'ERROR' : 'OK';
          console.log(`           -> ${tr.toolName} [${status}]: ${JSON.stringify(tr.output)}`);
        }
      }

      if (step.usage) {
        console.log(
          `           tokens: input=${step.usage.inputTokens ?? 0} output=${step.usage.outputTokens ?? 0}`
        );
      }
      console.log();
    },
  });

  console.log('--- Final output ---');
  console.log(result.output);
  console.log(`\nTotal steps: ${result.steps.length}`);
  if (result.totalUsage) {
    console.log(
      `Total tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
    );
  }
}

main().catch(console.error);
