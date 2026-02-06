/**
 * Screen identification from Figma designs
 */

import type { ScreenIdentification, CodeAnalysisConfig } from '../types/figma';
import { FigmaError } from '../core/errors';
import { createLogger } from '../core/logger';
import { createModel } from '../models/create-model';
import { loadImagesFromFolder, loadImagesFromPaths } from './loader';
import { structuredAnalysisSystemPrompt, screenIdentificationPrompt } from './structured-prompts';

const logger = createLogger({ prefix: 'screen-identifier' });

/**
 * Shape of a raw screen from the parsed JSON response
 */
interface RawScreen {
  screenName?: string;
  screenType?: string;
  description?: string;
  purpose?: string;
  userType?: string;
}

/**
 * Shape of the parsed JSON response from the model
 */
interface ParsedScreenResponse {
  screens?: RawScreen[];
}

/**
 * Default models for each provider
 */
const DEFAULT_MODELS: Record<'openai' | 'anthropic' | 'google', string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-pro',
};

/**
 * Configuration for screen identification
 */
export interface ScreenIdentificationConfig extends Omit<CodeAnalysisConfig, 'images'> {
  images: string | string[];
}

/**
 * Identify screens from Figma design images
 *
 * @example
 * ```typescript
 * const screens = await identifyScreens({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   provider: 'openai',
 *   images: ['./screens/login.png', './screens/dashboard.png']
 * });
 *
 * console.log(screens);
 * // [
 * //   {
 * //     screenName: 'Login Screen',
 * //     screenType: 'Authentication',
 * //     description: '...',
 * //     purpose: '...',
 * //     userType: 'Guest',
 * //     imagePath: './screens/login.png'
 * //   }
 * // ]
 * ```
 */
export async function identifyScreens(
  config: ScreenIdentificationConfig
): Promise<ScreenIdentification[]> {
  const { apiKey, provider, model: modelName, images, maxImages = 20, detail = 'high' } = config;

  logger.info('Starting screen identification', {
    provider,
    model: modelName || DEFAULT_MODELS[provider],
    imageSource: typeof images === 'string' ? images : `${images.length} files`,
  });

  // Create the model
  const model = createModel({
    provider,
    model: modelName || DEFAULT_MODELS[provider],
    apiKey,
    temperature: 0.3, // Low temperature for consistent structured output
  });

  // Load images
  let loadedImages;
  try {
    if (typeof images === 'string') {
      loadedImages = loadImagesFromFolder(images, maxImages);
    } else {
      loadedImages = loadImagesFromPaths(images, maxImages);
    }
  } catch (error) {
    logger.error('Failed to load images', error as Error);
    throw error;
  }

  if (loadedImages.images.length === 0) {
    throw new FigmaError('No valid images found to analyze');
  }

  logger.info(`Loaded ${loadedImages.images.length} images`);

  // Analyze with vision API
  try {
    const response = await model.generateVision(screenIdentificationPrompt, loadedImages.images, {
      systemPrompt: structuredAnalysisSystemPrompt,
      maxTokens: 4096,
      detail,
    });

    // Parse JSON response
    const jsonMatch = /\{[\s\S]*\}/.exec(response.content);
    if (!jsonMatch) {
      throw new FigmaError('Failed to parse structured response from model. Expected JSON format.');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedScreenResponse;

    // Validate and map responses with actual image paths
    if (!parsed.screens || !Array.isArray(parsed.screens)) {
      throw new FigmaError('Invalid response format: missing screens array');
    }

    const screens: ScreenIdentification[] = parsed.screens.map(
      (screen: RawScreen, index: number) => ({
        screenName: screen.screenName || 'Unnamed Screen',
        screenType: screen.screenType || 'Unknown',
        description: screen.description || '',
        purpose: screen.purpose || '',
        userType: screen.userType || 'User',
        imagePath: loadedImages.paths[index] || '',
      })
    );

    logger.info(`Identified ${screens.length} screens`);

    return screens;
  } catch (error) {
    if (error instanceof FigmaError) {
      throw error;
    }

    logger.error('Screen identification failed', error as Error);
    throw new FigmaError(
      'Failed to identify screens. Please check the images and try again.',
      error as Error
    );
  }
}
