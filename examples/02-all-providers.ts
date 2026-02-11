/**
 * Example 02: All AI Providers
 *
 * Run with: npm run example -- examples/02-all-providers.ts
 *
 * Tests all 3 AI providers: OpenAI, Anthropic, and Google.
 * Requires: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY
 */

import { createModel } from '../src/index';

async function testProvider(provider: 'openai' | 'anthropic' | 'google') {
  console.log(`\nTesting ${provider.toUpperCase()}...`);

  const modelMap = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-1.5-flash',
  };

  try {
    const model = createModel({ provider, model: modelMap[provider] });
    const response = await model.invoke([
      { role: 'user', content: 'Say "Hello from ' + provider + '"' },
    ]);

    console.log('✓', response.text);
    console.log('  Tokens:', response.usage);
  } catch (error) {
    console.log('✗', (error as Error).message);
  }
}

async function main() {
  console.log('Testing all AI providers...');

  await testProvider('openai');
  await testProvider('anthropic');
  await testProvider('google');

  console.log('\nDone!');
}

main().catch(console.error);
