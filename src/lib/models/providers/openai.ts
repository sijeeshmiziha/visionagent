/**
 * OpenAI model provider using AI SDK
 */

import type { Model, ModelConfig } from '../../types/model';
import { createAIModel } from './base';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Create an OpenAI model instance
 */
export function createOpenAIModel(config: ModelConfig): Model {
  const { model: modelName, apiKey, baseUrl } = config;

  const provider = createOpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    baseURL: baseUrl,
  });

  return createAIModel({
    provider: 'openai',
    modelName,
    getModel: () => provider.chat(modelName),
  });
}
