/**
 * Example 05: Vision Analysis
 *
 * Run with: npm run example:05
 *
 * Tests vision capabilities with custom images.
 * Requires: OPENAI_API_KEY environment variable
 * Note: Place a sample-ui.png in examples/test-data/
 */

import { createModel } from '../src/index';
import { readFileAsBase64 } from '../src/core/utils';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getsetfit } from './figma-screens/index';

async function main() {
  const imagePath = getsetfit.admin;

  console.log('Testing vision with image...\n');

  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.log('✗ Sample image not found:', imagePath);
    console.log('\nTo test vision:');
    console.log('1. Add a PNG image named "sample-ui.png" to examples/test-data/');
    console.log('2. Run this example again\n');

    // Demonstrate with a placeholder
    console.log('Testing with text-only prompt instead...\n');

    const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
    const response = await model.invoke([
      { role: 'user', content: 'Describe what a typical login screen looks like.' },
    ]);

    console.log('Response:', response.content);
    return;
  }

  const model = createModel({ provider: 'openai', model: 'gpt-4o' });

  // Determine mime type
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType: 'image/png' | 'image/jpeg' = ext === '.png' ? 'image/png' : 'image/jpeg';

  const image = {
    base64: readFileAsBase64(imagePath),
    mimeType,
  };

  const response = await model.generateVision('Describe this UI design in detail.', [image], {
    detail: 'high',
  });

  console.log('Vision analysis:');
  console.log(response.content);
  console.log('\nTokens:', response.usage);
}

main().catch(console.error);
