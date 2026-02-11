/**
 * Example 05: Hello World Agent
 *
 * Run with: npm run example -- examples/05-hello-world.ts
 *
 * Demonstrates the hello world module agent with onStep callback
 * that reports progress across multiple tool-call iterations.
 * Requires: OPENAI_API_KEY environment variable
 */

import { runHelloWorldAgent } from '../src/modules/hello-world';
import type { AgentStep } from '../src/lib/types/agent';

async function main() {
  console.log('=== Hello World Agent (multiple greetings) ===\n');

  const result = await runHelloWorldAgent({
    input: 'Say hello to Alice, Bob, and Charlie — greet each of them individually using the tool.',
    model: { provider: 'openai', model: 'gpt-4o-mini' },
    systemPrompt:
      'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions. ' +
      'Call the tool once per person. After greeting everyone, write a short summary.',
    maxIterations: 5,
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
