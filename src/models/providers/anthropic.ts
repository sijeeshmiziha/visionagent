/**
 * Anthropic model provider using AI SDK
 */

import type { Model, ModelConfig } from '../../types/model';
import { createAIModel } from './base';
import { createAnthropic } from '@ai-sdk/anthropic';

/**
 * Create an Anthropic model instance
 */
export function createAnthropicModel(config: ModelConfig): Model {
  const { model: modelName, apiKey } = config;

  const provider = createAnthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
  });

  return createAIModel({
    provider: 'anthropic',
    modelName,
    getModel: () => provider(modelName),
  });
}
