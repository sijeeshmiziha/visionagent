/**
 * Google (Gemini) model provider using AI SDK
 */

import type { Model, ModelConfig } from '../../types/model';
import { createAIModel } from './base';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Create a Google (Gemini) model instance
 */
export function createGoogleModel(config: ModelConfig): Model {
  const { model: modelName, apiKey } = config;

  const provider = createGoogleGenerativeAI({
    apiKey: apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  return createAIModel({
    provider: 'google',
    modelName,
    getModel: () => provider(modelName),
  });
}
