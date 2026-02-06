/**
 * Component extraction from Figma designs
 */

import type { ComponentExtraction, CodeAnalysisConfig } from '../types/figma';
import { FigmaError } from '../core/errors';
import { createLogger } from '../core/logger';
import { createModel } from '../models/create-model';
import { loadImagesFromFolder, loadImagesFromPaths } from './loader';
import { structuredAnalysisSystemPrompt, componentExtractionPrompt } from './structured-prompts';

const logger = createLogger({ prefix: 'component-extractor' });

/**
 * Shape of a raw component from the parsed JSON response
 */
interface RawComponent {
  name?: string;
  type?: string;
  props?: string[];
  description?: string;
}

/**
 * Shape of a raw extraction from the parsed JSON response
 */
interface RawExtraction {
  screenName?: string;
  components?: RawComponent[];
}

/**
 * Shape of the parsed JSON response from the model
 */
interface ParsedExtractionResponse {
  extractions?: RawExtraction[];
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
 * Configuration for component extraction
 */
export interface ComponentExtractionConfig extends Omit<CodeAnalysisConfig, 'images'> {
  images: string | string[];
}

/**
 * Extract UI components from Figma design images
 *
 * @example
 * ```typescript
 * const components = await extractComponents({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   provider: 'openai',
 *   images: ['./screens/login.png', './screens/dashboard.png']
 * });
 *
 * console.log(components);
 * // [
 * //   {
 * //     screenName: 'Login Screen',
 * //     components: [
 * //       {
 * //         name: 'LoginButton',
 * //         type: 'Button',
 * //         props: ['label', 'onClick', 'disabled'],
 * //         description: 'Primary action button for login'
 * //       }
 * //     ],
 * //     imagePath: './screens/login.png'
 * //   }
 * // ]
 * ```
 */
export async function extractComponents(
  config: ComponentExtractionConfig
): Promise<ComponentExtraction[]> {
  const { apiKey, provider, model: modelName, images, maxImages = 20, detail = 'high' } = config;

  logger.info('Starting component extraction', {
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
    const response = await model.generateVision(componentExtractionPrompt, loadedImages.images, {
      systemPrompt: structuredAnalysisSystemPrompt,
      maxTokens: 4096,
      detail,
    });

    // Parse JSON response
    const jsonMatch = /\{[\s\S]*\}/.exec(response.content);
    if (!jsonMatch) {
      throw new FigmaError('Failed to parse structured response from model. Expected JSON format.');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedExtractionResponse;

    // Validate and map responses with actual image paths
    if (!parsed.extractions || !Array.isArray(parsed.extractions)) {
      throw new FigmaError('Invalid response format: missing extractions array');
    }

    const extractions: ComponentExtraction[] = parsed.extractions.map(
      (extraction: RawExtraction, index: number) => ({
        screenName: extraction.screenName || 'Unnamed Screen',
        components: Array.isArray(extraction.components)
          ? extraction.components.map((comp: RawComponent) => ({
              name: comp.name || 'UnnamedComponent',
              type: comp.type || 'Component',
              props: Array.isArray(comp.props) ? comp.props : [],
              description: comp.description || '',
            }))
          : [],
        imagePath: loadedImages.paths[index] || '',
      })
    );

    const totalComponents = extractions.reduce((sum, ext) => sum + ext.components.length, 0);
    logger.info(`Extracted ${totalComponents} components from ${extractions.length} screens`);

    return extractions;
  } catch (error) {
    if (error instanceof FigmaError) {
      throw error;
    }

    logger.error('Component extraction failed', error as Error);
    throw new FigmaError(
      'Failed to extract components. Please check the images and try again.',
      error as Error
    );
  }
}
