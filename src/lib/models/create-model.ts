/**
 * Create a model instance based on provider
 */

import type { Model, ModelConfig } from '../types/model';
import { ModelError } from '../utils/errors';
import { createOpenAIModel } from './providers/openai';
import { createAnthropicModel } from './providers/anthropic';
import { createGoogleModel } from './providers/google';

// ─── Known models registry (for validation hints) ───────────────────────────

export const KNOWN_MODELS: Record<string, readonly string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o1-mini', 'o3-mini'],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-4-5',
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    'claude-haiku-4-6',
  ],
  google: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
};

// ─── Provider extension registry ────────────────────────────────────────────

interface ProviderFactory {
  create(config: ModelConfig): Model;
}

const providerRegistry = new Map<string, ProviderFactory>();

/**
 * Register a custom model provider.
 * The provider will be used when `createModel({ provider: name })` is called.
 *
 * @example
 * ```typescript
 * registerProvider('ollama', {
 *   create(config) { return createOllamaModel(config); }
 * });
 * ```
 */
export function registerProvider(name: string, factory: ProviderFactory): void {
  providerRegistry.set(name, factory);
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a model instance for the given provider.
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
  const { provider, model } = config;

  // Warn on unknown model names (not an error — user may be on a preview model)
  const knownForProvider = KNOWN_MODELS[provider];
  if (knownForProvider && !knownForProvider.includes(model)) {
    console.warn(
      `[visionagent] Unknown model "${model}" for provider "${provider}". ` +
        `Known models: ${knownForProvider.join(', ')}`
    );
  }

  // Check custom provider registry first
  const custom = providerRegistry.get(provider);
  if (custom) return custom.create(config);

  switch (provider) {
    case 'openai':
      return createOpenAIModel(config);
    case 'anthropic':
      return createAnthropicModel(config);
    case 'google':
      return createGoogleModel(config);
    default: {
      const allProviders = ['openai', 'anthropic', 'google', ...providerRegistry.keys()];
      throw new ModelError(
        `Unsupported provider: "${provider}". Supported providers: ${allProviders.join(', ')}`
      );
    }
  }
}
