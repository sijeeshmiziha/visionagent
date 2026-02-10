/**
 * Create a model instance based on provider
 */

import type { Model, ModelConfig } from '../types/model';
import { ModelError } from '../utils/errors';
import { createOpenAIModel } from './providers/openai';
import { createAnthropicModel } from './providers/anthropic';
import { createGoogleModel } from './providers/google';

/**
 * Create a model instance for the given provider
 *
 * @example
 * ```typescript
 * const model = createModel({
 *   provider: 'openai',
 *   model: 'gpt-4o',
 *   temperature: 0.7
 * });
 *
 * const response = await model.invoke([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export function createModel(config: ModelConfig): Model {
  const { provider } = config;

  switch (provider) {
    case 'openai':
      return createOpenAIModel(config);
    case 'anthropic':
      return createAnthropicModel(config);
    case 'google':
      return createGoogleModel(config);
    default:
      throw new ModelError(
        `Unsupported provider: ${provider}. Supported providers: openai, anthropic, google`
      );
  }
}
