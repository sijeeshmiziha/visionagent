/**
 * Example 01: Basic Model Invocation
 *
 * Run with: npm run example:01
 *
 * Tests basic model invocation with OpenAI.
 * Requires: OPENAI_API_KEY environment variable
 */

import { createModel } from '../src/index';

async function main() {
  console.log('Testing OpenAI model...\n');

  const model = createModel({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
  });

  const response = await model.invoke([
    { role: 'user', content: 'Explain what TypeScript is in one sentence.' },
  ]);

  console.log('Response:', response.text);
  console.log('Tokens:', response.usage);
}

main().catch(console.error);
