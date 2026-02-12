/**
 * Example: All AI Providers
 *
 * Runs the same prompt with OpenAI, Anthropic, and Google.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *   export ANTHROPIC_API_KEY="sk-ant-..."
 *   export GOOGLE_GENERATIVE_AI_API_KEY="..."
 *
 * Run:
 *   npx tsx 02-all-providers.ts
 */
import { createModel } from 'visionagent';

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
    const model = createModel({
      provider,
      model: modelName,
      apiKey:
        provider === 'openai'
          ? process.env.OPENAI_API_KEY
          : provider === 'anthropic'
            ? process.env.ANTHROPIC_API_KEY
            : process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const response = await model.invoke([{ role: 'user', content: prompt }]);

    console.log('✓', response.text);
    console.log('  Tokens:', response.usage);
  } catch (error) {
    console.log('✗', (error as Error).message);
  }
}

async function main() {
  console.log('Testing all AI providers...');

  const prompt = process.env.PROMPT ?? 'Explain what TypeScript is in one sentence.';
  await testProvider('openai', prompt);
  await testProvider('anthropic', prompt);
  await testProvider('google', prompt);

  console.log('\nDone!');
}

main().catch(console.error);
