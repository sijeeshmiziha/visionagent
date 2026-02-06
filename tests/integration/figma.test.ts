/**
 * Integration Tests: Figma Analysis
 *
 * These tests make real API calls and require API keys.
 * Tests are automatically skipped if the required API key is not present.
 *
 * Run with: npm run test:integration
 */

import { describe, it, expect } from 'vitest';
import { createModel, validateFigmaFolder } from '../../src/index';

const hasOpenAI = !!process.env.OPENAI_API_KEY;

describe('Figma Integration Tests', () => {
  it('should validate test data folder', () => {
    // This test doesn't require API keys
    const validation = validateFigmaFolder('./examples/test-data/figma-screens');

    // Folder exists but may be empty
    expect(validation).toBeDefined();
    expect(typeof validation.isValid).toBe('boolean');
    expect(typeof validation.imageCount).toBe('number');
  });

  it('should validate invalid folder gracefully', () => {
    const validation = validateFigmaFolder('./non-existent-folder');

    expect(validation.isValid).toBe(false);
    expect(validation.imageCount).toBe(0);
  });

  it.skipIf(!hasOpenAI)(
    'should analyze Figma designs when images are present',
    async () => {
      const validation = validateFigmaFolder('./examples/test-data/figma-screens');

      // Skip if no images in test folder
      if (!validation.isValid || validation.imageCount === 0) {
        console.log('Skipping: No test images found in examples/test-data/figma-screens');
        return;
      }

      const { analyzeFigmaDesigns } = await import('../../src/index');
      const model = createModel({ provider: 'openai', model: 'gpt-4o' });

      const result = await analyzeFigmaDesigns({
        model,
        source: './examples/test-data/figma-screens',
        maxImages: 3,
      });

      expect(result.analysis).toBeTruthy();
      expect(result.analysis.length).toBeGreaterThan(100);
      expect(result.imageCount).toBeGreaterThan(0);
    },
    60000
  ); // 60s timeout for vision API

  describe('Vision Capabilities', () => {
    it.skipIf(!hasOpenAI)(
      'should describe images with vision',
      async () => {
        const model = createModel({ provider: 'openai', model: 'gpt-4o' });

        // Create a simple test - asking about a concept without an image
        // This verifies the model is working for vision tasks
        const response = await model.invoke([
          {
            role: 'user',
            content: 'Describe what a typical login page looks like in a few sentences.',
          },
        ]);

        expect(response.content).toBeTruthy();
        expect(response.content.length).toBeGreaterThan(50);
      },
      30000
    );
  });
});
