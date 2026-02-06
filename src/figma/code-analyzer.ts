/**
 * Comprehensive Figma-to-Code analysis
 * Combines screen identification, component extraction, and API generation
 */

import type { CodeAnalysisConfig, CodeAnalysisResult } from '../types/figma';
import { FigmaError } from '../core/errors';
import { createLogger, createProgressLogger } from '../core/logger';
import { createModel } from '../models/create-model';
import { identifyScreens } from './screen-identifier';
import { extractComponents } from './component-extractor';
import { generateAPIEndpoints } from './api-generator';
import { analyzeFigmaDesigns } from './analyzer';

const logger = createLogger({ prefix: 'code-analyzer' });
const progress = createProgressLogger('figma-code');

/**
 * Default models for each provider
 */
const DEFAULT_MODELS: Record<'openai' | 'anthropic' | 'google', string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-pro',
};

/**
 * Analyze Figma designs for code generation
 * Returns structured data: screens, components, API endpoints, and requirements
 *
 * @example
 * ```typescript
 * const result = await analyzeFigmaForCode({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   provider: 'openai',
 *   images: ['./screens/login.png', './screens/dashboard.png']
 * });
 *
 * console.log('Screens:', result.screens);
 * console.log('Components:', result.components);
 * console.log('API Endpoints:', result.apiEndpoints);
 * console.log('Requirements:', result.requirements);
 * ```
 */
export async function analyzeFigmaForCode(config: CodeAnalysisConfig): Promise<CodeAnalysisResult> {
  const { apiKey, provider, model: modelName, images, maxImages = 20, detail = 'high' } = config;

  logger.info('Starting comprehensive Figma code analysis', {
    provider,
    model: modelName || DEFAULT_MODELS[provider],
    imageSource: typeof images === 'string' ? images : `${images.length} files`,
  });

  const sharedConfig = {
    apiKey,
    provider,
    model: modelName,
    images,
    maxImages,
    detail,
  };

  try {
    // Step 1: Identify screens
    progress.start('Identifying screens...');
    const screens = await identifyScreens(sharedConfig);
    progress.success(`Identified ${screens.length} screens`);

    // Step 2: Extract components
    progress.start('Extracting UI components...');
    const componentsData = await extractComponents(sharedConfig);
    const totalComponents = componentsData.reduce((sum, c) => sum + c.components.length, 0);
    progress.success(`Extracted ${totalComponents} components`);

    // Step 3: Generate API endpoints
    progress.start('Generating API endpoints...');
    const apiEndpoints = await generateAPIEndpoints(sharedConfig);
    progress.success(`Generated ${apiEndpoints.endpoints.length} endpoints`);

    // Step 4: Get requirements (using existing analyzer for markdown output)
    progress.start('Analyzing requirements...');
    const model = createModel({
      provider,
      model: modelName || DEFAULT_MODELS[provider],
      apiKey,
    });

    const requirementsResult = await analyzeFigmaDesigns({
      model,
      source: images,
      maxImages,
      detail,
    });
    progress.success('Requirements analysis complete');

    logger.info('Comprehensive code analysis completed successfully', {
      screens: screens.length,
      components: totalComponents,
      endpoints: apiEndpoints.endpoints.length,
    });

    return {
      screens,
      components: componentsData,
      apiEndpoints,
      requirements: requirementsResult.analysis,
    };
  } catch (error) {
    progress.error('Code analysis failed');
    logger.error('Comprehensive code analysis failed', error as Error);

    if (error instanceof FigmaError) {
      throw error;
    }

    throw new FigmaError(
      'Failed to analyze Figma designs for code generation. Please check the images and configuration.',
      error as Error
    );
  }
}
