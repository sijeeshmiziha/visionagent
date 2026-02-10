/**
 * Example 09: Hello World Agent
 *
 * Run with: npm run example:09
 *
 * Demonstrates the hello world module agent (LangChain-backed model).
 * Requires: OPENAI_API_KEY environment variable
 */

import { runHelloWorldAgent } from '../src/hello-world';

async function main() {
  console.log('Hello World agent...\n');

  const result = await runHelloWorldAgent({
    input: 'Say hello to Alice',
  });

  console.log('Output:', result.output);
  console.log('Steps taken:', result.steps.length);
}

main().catch(console.error);
