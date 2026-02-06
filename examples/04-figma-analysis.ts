/**
 * Example 04: Figma Design Analysis
 *
 * Run with: npm run example:04
 *
 * Analyzes Figma design images to extract requirements.
 * Requires: OPENAI_API_KEY environment variable
 * Note: Place PNG/JPG images in examples/figma-screens/
 */

import { createModel, analyzeFigmaDesigns, validateFigmaFolder } from '../src/index';
import { getsetfit } from './figma-screens/index';

async function main() {
  const folderPath = getsetfit.admin;

  console.log('Validating test data folder...\n');

  const validation = validateFigmaFolder(folderPath);

  if (!validation.isValid) {
    console.log('✗ No valid images found in:', folderPath);
    console.log('\nTo test Figma analysis:');
    console.log('1. Add PNG/JPG screenshots to:', folderPath);
    console.log('2. Run this example again\n');

    // Create a placeholder message
    console.log('Tip: You can add any UI screenshots to test the analysis.');
    return;
  }

  console.log(`✓ Found ${validation.imageCount} images to analyze`);
  console.log('\nAnalyzing Figma designs...\n');

  const model = createModel({ provider: 'openai', model: 'gpt-4o' });

  const result = await analyzeFigmaDesigns({
    model,
    source: folderPath,
    detail: 'high',
    maxImages: 5,
  });

  console.log('Analysis complete!');
  console.log('Images analyzed:', result.imageCount);
  console.log('\n--- ANALYSIS ---\n');
  console.log(result.analysis);
}

main().catch(console.error);
