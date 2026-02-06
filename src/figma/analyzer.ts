/**
 * Analyze Figma designs using AI vision
 */

import type { FigmaAnalysisConfig, FigmaAnalysisResult } from '../types/figma';
import { FigmaError } from '../core/errors';
import { createLogger, createProgressLogger } from '../core/logger';
import { loadImagesFromFolder, loadImagesFromPaths } from './loader';
import { figmaAnalysisPrompt, figmaSystemPrompt } from './prompts';
import { MAX_IMAGES } from '../types/figma';

const logger = createLogger({ prefix: 'figma-analyzer' });
const progress = createProgressLogger('figma');

/**
 * Analyze Figma designs from a folder or file paths
 *
 * @example
 * ```typescript
 * const result = await analyzeFigmaDesigns({
 *   model: createModel({ provider: 'openai', model: 'gpt-4o' }),
 *   source: '/path/to/figma/exports',
 *   detail: 'high'
 * });
 *
 * console.log(result.analysis);
 * ```
 */
export async function analyzeFigmaDesigns(
  config: FigmaAnalysisConfig
): Promise<FigmaAnalysisResult> {
  const { model, source, maxImages = MAX_IMAGES, detail = 'high', customPrompt } = config;

  logger.info('Starting Figma analysis', {
    source: typeof source === 'string' ? source : `${source.length} files`,
  });

  // Load images based on source type
  progress.start('Loading design images...');

  let loadedImages;
  try {
    if (typeof source === 'string') {
      loadedImages = loadImagesFromFolder(source, maxImages);
    } else {
      loadedImages = loadImagesFromPaths(source, maxImages);
    }
  } catch (error) {
    progress.error('Failed to load images');
    throw error;
  }

  progress.success(`Loaded ${loadedImages.images.length} images`);

  // Analyze with vision API
  progress.start('Analyzing designs with AI...');

  const prompt = customPrompt || figmaAnalysisPrompt;

  try {
    const response = await model.generateVision(prompt, loadedImages.images, {
      systemPrompt: figmaSystemPrompt,
      maxTokens: 8192,
      detail,
    });

    progress.success('Design analysis completed');

    logger.info('Figma analysis completed', {
      imageCount: loadedImages.images.length,
      analysisLength: response.content.length,
    });

    return {
      analysis: response.content,
      imageCount: loadedImages.images.length,
      imagePaths: loadedImages.paths,
    };
  } catch (error) {
    progress.error('Design analysis failed');
    logger.error('Figma analysis failed', error as Error);
    throw new FigmaError(
      'Failed to analyze Figma designs. Please check the images and try again.',
      error as Error
    );
  }
}

/**
 * Analyze Figma designs from specific file paths
 *
 * @example
 * ```typescript
 * const result = await analyzeFigmaFiles(
 *   model,
 *   ['/path/to/screen1.png', '/path/to/screen2.png']
 * );
 * ```
 */
export async function analyzeFigmaFiles(
  model: FigmaAnalysisConfig['model'],
  filePaths: string[],
  options: Omit<FigmaAnalysisConfig, 'model' | 'source'> = {}
): Promise<FigmaAnalysisResult> {
  return analyzeFigmaDesigns({
    model,
    source: filePaths,
    ...options,
  });
}

/**
 * Analyze Figma designs from a folder
 *
 * @example
 * ```typescript
 * const result = await analyzeFigmaFolder(model, '/path/to/exports');
 * ```
 */
export async function analyzeFigmaFolder(
  model: FigmaAnalysisConfig['model'],
  folderPath: string,
  options: Omit<FigmaAnalysisConfig, 'model' | 'source'> = {}
): Promise<FigmaAnalysisResult> {
  return analyzeFigmaDesigns({
    model,
    source: folderPath,
    ...options,
  });
}
