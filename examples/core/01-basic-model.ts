/**
 * Example: Basic Model Invocation
 *
 * Creates a model and makes a simple API call.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-basic-model.ts
 */
import { createModel } from 'visionagent';

async function main() {
  console.log('Testing model...\n');

  // --- Configuration --------------------------------------------------------
  // Provider: 'openai' | 'anthropic' | 'google'
  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';

  // Model name (e.g. 'gpt-4o-mini', 'claude-3-haiku-20240307', 'gemini-1.5-flash')
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const model = createModel({
    provider,
    model: modelName,
    apiKey: process.env.OPENAI_API_KEY, // Optional: auto-reads from env if not set
    temperature: 0.7,
  });

  // --- Invoke ---------------------------------------------------------------
  const prompt = process.env.PROMPT ?? 'Explain what TypeScript is in one sentence.';
  const response = await model.invoke([{ role: 'user', content: prompt }]);

  console.log('Response:', response.text);
  console.log('Tokens:', response.usage);
}

main().catch(console.error);
