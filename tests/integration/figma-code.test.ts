/**
 * Integration tests for Figma-to-Code analysis functions
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  identifyScreens,
  extractComponents,
  generateAPIEndpoints,
  analyzeFigmaForCode,
} from '../../src/index';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, '../test-data');
const FIGMA_SCREENS_DIR = path.join(TEST_DATA_DIR, 'figma-screens');

// Check if we have test images
const hasTestImages = fs.existsSync(FIGMA_SCREENS_DIR);

// Skip tests if no API key or test images
const skipTests = !process.env.OPENAI_API_KEY || !hasTestImages;

describe.skipIf(skipTests)('Figma to Code Analysis', () => {
  const apiKey = process.env.OPENAI_API_KEY!;
  const provider = 'openai' as const;
  let testImages: string[];

  beforeAll(() => {
    if (hasTestImages) {
      const files = fs.readdirSync(FIGMA_SCREENS_DIR);
      testImages = files
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map(f => path.join(FIGMA_SCREENS_DIR, f))
        .slice(0, 2); // Limit to 2 images for faster tests
    }
  });

  describe('identifyScreens', () => {
    it('should identify screens from images', async () => {
      const screens = await identifyScreens({
        apiKey,
        provider,
        images: testImages,
      });

      expect(screens).toBeDefined();
      expect(Array.isArray(screens)).toBe(true);
      expect(screens.length).toBeGreaterThan(0);

      const firstScreen = screens[0]!;
      expect(firstScreen).toHaveProperty('screenName');
      expect(firstScreen).toHaveProperty('screenType');
      expect(firstScreen).toHaveProperty('description');
      expect(firstScreen).toHaveProperty('purpose');
      expect(firstScreen).toHaveProperty('userType');
      expect(firstScreen).toHaveProperty('imagePath');

      expect(typeof firstScreen.screenName).toBe('string');
      expect(typeof firstScreen.screenType).toBe('string');
      expect(typeof firstScreen.description).toBe('string');
      expect(typeof firstScreen.purpose).toBe('string');
      expect(typeof firstScreen.userType).toBe('string');
      expect(typeof firstScreen.imagePath).toBe('string');
    });

    it('should work with folder path', async () => {
      const screens = await identifyScreens({
        apiKey,
        provider,
        images: FIGMA_SCREENS_DIR,
        maxImages: 2,
      });

      expect(screens).toBeDefined();
      expect(Array.isArray(screens)).toBe(true);
      expect(screens.length).toBeGreaterThan(0);
    });

    it('should support different providers', async () => {
      const screens = await identifyScreens({
        apiKey,
        provider: 'openai',
        model: 'gpt-4o-mini',
        images: testImages,
      });

      expect(screens).toBeDefined();
      expect(screens.length).toBeGreaterThan(0);
    });
  });

  describe('extractComponents', () => {
    it('should extract components from images', async () => {
      const components = await extractComponents({
        apiKey,
        provider,
        images: testImages,
      });

      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);

      const firstExtraction = components[0]!;
      expect(firstExtraction).toHaveProperty('screenName');
      expect(firstExtraction).toHaveProperty('components');
      expect(firstExtraction).toHaveProperty('imagePath');

      expect(typeof firstExtraction.screenName).toBe('string');
      expect(Array.isArray(firstExtraction.components)).toBe(true);

      if (firstExtraction.components.length > 0) {
        const component = firstExtraction.components[0]!;
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('props');
        expect(component).toHaveProperty('description');

        expect(typeof component.name).toBe('string');
        expect(typeof component.type).toBe('string');
        expect(Array.isArray(component.props)).toBe(true);
        expect(typeof component.description).toBe('string');
      }
    });

    it('should work with folder path', async () => {
      const components = await extractComponents({
        apiKey,
        provider,
        images: FIGMA_SCREENS_DIR,
        maxImages: 2,
      });

      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
    });
  });

  describe('generateAPIEndpoints', () => {
    it('should generate API endpoints from images', async () => {
      const apiList = await generateAPIEndpoints({
        apiKey,
        provider,
        images: testImages,
      });

      expect(apiList).toBeDefined();
      expect(apiList).toHaveProperty('endpoints');
      expect(Array.isArray(apiList.endpoints)).toBe(true);
      expect(apiList.endpoints.length).toBeGreaterThan(0);

      const firstEndpoint = apiList.endpoints[0]!;
      expect(firstEndpoint).toHaveProperty('method');
      expect(firstEndpoint).toHaveProperty('path');
      expect(firstEndpoint).toHaveProperty('description');
      expect(firstEndpoint).toHaveProperty('authentication');
      expect(firstEndpoint).toHaveProperty('relatedScreen');

      expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(firstEndpoint.method);
      expect(typeof firstEndpoint.path).toBe('string');
      expect(typeof firstEndpoint.description).toBe('string');
      expect(typeof firstEndpoint.authentication).toBe('boolean');
      expect(typeof firstEndpoint.relatedScreen).toBe('string');
    });

    it('should work with folder path', async () => {
      const apiList = await generateAPIEndpoints({
        apiKey,
        provider,
        images: FIGMA_SCREENS_DIR,
        maxImages: 2,
      });

      expect(apiList).toBeDefined();
      expect(apiList.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeFigmaForCode', () => {
    it('should perform comprehensive analysis', async () => {
      const result = await analyzeFigmaForCode({
        apiKey,
        provider,
        images: testImages,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('screens');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('apiEndpoints');
      expect(result).toHaveProperty('requirements');

      expect(Array.isArray(result.screens)).toBe(true);
      expect(Array.isArray(result.components)).toBe(true);
      expect(Array.isArray(result.apiEndpoints.endpoints)).toBe(true);
      expect(typeof result.requirements).toBe('string');

      expect(result.screens.length).toBeGreaterThan(0);
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.apiEndpoints.endpoints.length).toBeGreaterThan(0);
      expect(result.requirements.length).toBeGreaterThan(0);
    });

    it('should work with folder path and options', async () => {
      const result = await analyzeFigmaForCode({
        apiKey,
        provider,
        model: 'gpt-4o',
        images: FIGMA_SCREENS_DIR,
        maxImages: 2,
        detail: 'high',
      });

      expect(result).toBeDefined();
      expect(result.screens.length).toBeGreaterThan(0);
    });

    it('should return valid JSON-serializable data', async () => {
      const result = await analyzeFigmaForCode({
        apiKey,
        provider,
        images: testImages,
      });

      // Should be JSON-serializable
      expect(() => JSON.stringify(result)).not.toThrow();

      const json = JSON.stringify(result);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(result);
    });
  });

  describe('Error handling', () => {
    it('should throw error with invalid API key', async () => {
      await expect(
        identifyScreens({
          apiKey: 'invalid-key',
          provider: 'openai',
          images: testImages,
        })
      ).rejects.toThrow();
    });

    it('should throw error with non-existent images', async () => {
      await expect(
        identifyScreens({
          apiKey,
          provider,
          images: ['/non/existent/path.png'],
        })
      ).rejects.toThrow();
    });

    it('should throw error with empty image array', async () => {
      await expect(
        identifyScreens({
          apiKey,
          provider,
          images: [],
        })
      ).rejects.toThrow();
    });
  });
});
