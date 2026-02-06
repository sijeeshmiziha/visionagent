/**
 * API endpoint generation from Figma designs
 */

import type { APIEndpoint, APIEndpointList, CodeAnalysisConfig } from '../types/figma';
import { FigmaError } from '../core/errors';
import { createLogger } from '../core/logger';
import { createModel } from '../models/create-model';
import { loadImagesFromFolder, loadImagesFromPaths } from './loader';
import { structuredAnalysisSystemPrompt, apiEndpointGenerationPrompt } from './structured-prompts';

const logger = createLogger({ prefix: 'api-generator' });

/**
 * Shape of a raw endpoint from the parsed JSON response
 */
interface RawEndpoint {
  method?: string;
  path?: string;
  description?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  authentication?: boolean;
  relatedScreen?: string;
}

/**
 * Shape of the parsed JSON response from the model
 */
interface ParsedAPIResponse {
  endpoints?: RawEndpoint[];
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
 * Configuration for API endpoint generation
 */
export interface APIGenerationConfig extends Omit<CodeAnalysisConfig, 'images'> {
  images: string | string[];
}

/**
 * Generate API endpoints from Figma design images
 *
 * @example
 * ```typescript
 * const apiList = await generateAPIEndpoints({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   provider: 'openai',
 *   images: ['./screens/login.png', './screens/dashboard.png']
 * });
 *
 * console.log(apiList.endpoints);
 * // [
 * //   {
 * //     method: 'POST',
 * //     path: '/api/auth/login',
 * //     description: 'Authenticate user with email and password',
 * //     requestBody: { email: 'string', password: 'string' },
 * //     responseBody: { token: 'string', user: {} },
 * //     authentication: false,
 * //     relatedScreen: 'Login Screen'
 * //   }
 * // ]
 * ```
 */
export async function generateAPIEndpoints(config: APIGenerationConfig): Promise<APIEndpointList> {
  const { apiKey, provider, model: modelName, images, maxImages = 20, detail = 'high' } = config;

  logger.info('Starting API endpoint generation', {
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
    const response = await model.generateVision(apiEndpointGenerationPrompt, loadedImages.images, {
      systemPrompt: structuredAnalysisSystemPrompt,
      maxTokens: 4096,
      detail,
    });

    // Parse JSON response
    const jsonMatch = /\{[\s\S]*\}/.exec(response.content);
    if (!jsonMatch) {
      throw new FigmaError('Failed to parse structured response from model. Expected JSON format.');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedAPIResponse;

    // Validate response
    if (!parsed.endpoints || !Array.isArray(parsed.endpoints)) {
      throw new FigmaError('Invalid response format: missing endpoints array');
    }

    const endpoints: APIEndpointList = {
      endpoints: parsed.endpoints.map((endpoint: RawEndpoint) => ({
        method: (endpoint.method || 'GET') as APIEndpoint['method'],
        path: endpoint.path || '/api/unknown',
        description: endpoint.description || '',
        requestBody: endpoint.requestBody || undefined,
        responseBody: endpoint.responseBody || undefined,
        authentication:
          typeof endpoint.authentication === 'boolean' ? endpoint.authentication : false,
        relatedScreen: endpoint.relatedScreen || 'Unknown',
      })),
    };

    logger.info(`Generated ${endpoints.endpoints.length} API endpoints`);

    return endpoints;
  } catch (error) {
    if (error instanceof FigmaError) {
      throw error;
    }

    logger.error('API endpoint generation failed', error as Error);
    throw new FigmaError(
      'Failed to generate API endpoints. Please check the images and try again.',
      error as Error
    );
  }
}
