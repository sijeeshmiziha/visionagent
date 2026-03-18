/**
 * Example: Vision (Image Understanding)
 *
 * Send an image to the model and ask it to describe what it sees.
 * Uses generateVision with a base64-encoded PNG fetched from a public URL.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."     # or ANTHROPIC_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY
 *
 * Run:
 *   npx tsx examples/core/06-vision.ts
 */
import { createModel } from 'visionagent';

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: 'image/png' }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { base64, mimeType: 'image/png' };
}

async function main() {
  console.log('=== Vision Example ===\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName =
    process.env.MODEL ??
    (provider === 'openai'
      ? 'gpt-4o-mini'
      : provider === 'anthropic'
        ? 'claude-haiku-4-5'
        : 'gemini-2.0-flash');

  const model = createModel({ provider, model: modelName });

  console.log(`Provider: ${provider} / ${modelName}`);

  // Fetch a small public test image (100x100 PNG color grid)
  const imageUrl = process.env.IMAGE_URL ?? 'https://www.gstatic.com/webp/gallery/1.png';

  console.log(`Image: ${imageUrl}\n`);

  let image: { base64: string; mimeType: 'image/png' };
  try {
    image = await fetchImageAsBase64(imageUrl);
    console.log(`Image fetched: ${image.base64.length} base64 chars\n`);
  } catch (err) {
    console.error('Could not fetch image:', (err as Error).message);
    process.exit(1);
  }

  const prompt = process.env.PROMPT ?? 'Describe this image in detail. What do you see?';

  const response = await model.generateVision(prompt, [image], {
    systemPrompt: 'You are a vision assistant. Describe images accurately and concisely.',
  });

  console.log('--- Response ---');
  console.log(response.text);
  console.log('\n--- Usage ---');
  console.log(response.usage);
}

main().catch(console.error);
