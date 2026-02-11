/**
 * Example 01: Basic Model Invocation
 *
 * Run with: npm run example -- examples/core/01-basic-model.ts
 * Inputs: PROVIDER, MODEL, PROMPT (env or --key=value). Optional: TEMPERATURE
 */

import { createModel } from '../../src/index';
import { getInput, requireInput } from '../lib/input';

async function main() {
  console.log('Testing model...\n');

  const provider = requireInput('PROVIDER') as 'openai' | 'anthropic' | 'google';
  const modelName = requireInput('MODEL');
  const userPrompt = requireInput('PROMPT');
  const temp = getInput('TEMPERATURE');
  const temperature = temp ? Number.parseFloat(temp) : 0.7;

  const model = createModel({
    provider,
    model: modelName,
    temperature,
  });

  const response = await model.invoke([{ role: 'user', content: userPrompt }]);

  console.log('Response:', response.text);
  console.log('Tokens:', response.usage);
}

main().catch(console.error);
