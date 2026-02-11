/**
 * Example 02: All AI Providers
 *
 * Run with: npm run example -- examples/core/02-all-providers.ts
 * Inputs: PROMPT (env or --key=value)
 */

import { createModel } from '../../src/index';
import { requireInput } from '../lib/input';

const MODEL_MAP: Record<string, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  google: 'gemini-1.5-flash',
};

async function testProvider(provider: 'openai' | 'anthropic' | 'google', prompt: string) {
  console.log(`\nTesting ${provider.toUpperCase()}...`);

  try {
    const modelName = MODEL_MAP[provider];
    if (!modelName) throw new Error(`Unknown provider: ${provider}`);
    const model = createModel({ provider, model: modelName });
    const response = await model.invoke([{ role: 'user', content: prompt }]);

    console.log('✓', response.text);
    console.log('  Tokens:', response.usage);
  } catch (error) {
    console.log('✗', (error as Error).message);
  }
}

async function main() {
  console.log('Testing all AI providers...');

  const prompt = requireInput('PROMPT');
  await testProvider('openai', prompt);
  await testProvider('anthropic', prompt);
  await testProvider('google', prompt);

  console.log('\nDone!');
}

main().catch(console.error);
