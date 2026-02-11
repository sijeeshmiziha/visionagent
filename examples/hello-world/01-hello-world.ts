/**
 * Example 01: Hello World Agent
 *
 * Run with: npm run example -- examples/hello-world/01-hello-world.ts
 * Inputs: PROVIDER, MODEL, AGENT_INPUT, SYSTEM_PROMPT, MAX_ITERATIONS (env or --key=value)
 */

import { runHelloWorldAgent } from '../../src/modules/hello-world';
import type { AgentStep } from '../../src/lib/types/agent';
import { requireInput } from '../lib/input';

async function main() {
  console.log('=== Hello World Agent ===\n');

  const provider = requireInput('PROVIDER') as 'openai' | 'anthropic' | 'google';
  const modelName = requireInput('MODEL');
  const agentInput = requireInput('AGENT_INPUT');
  const systemPrompt = requireInput('SYSTEM_PROMPT');
  const maxIterStr = requireInput('MAX_ITERATIONS');
  const maxIterations = Number.parseInt(maxIterStr, 10) || 5;

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
