/**
 * Tests for createModel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelError } from '../../../src/lib/utils/errors';
import type { ModelConfig } from '../../../src/lib/types/model';

const mockModel = {
  provider: 'openai' as const,
  modelName: 'gpt-4o-mini',
  invoke: vi.fn(),
  generateVision: vi.fn(),
};

vi.mock('../../../src/lib/models/providers/openai', () => ({
  createOpenAIModel: vi.fn(() => mockModel),
}));
vi.mock('../../../src/lib/models/providers/anthropic', () => ({
  createAnthropicModel: vi.fn(() => ({ ...mockModel, provider: 'anthropic' })),
}));
vi.mock('../../../src/lib/models/providers/google', () => ({
  createGoogleModel: vi.fn(() => ({ ...mockModel, provider: 'google' })),
}));

import { createModel } from '../../../src/lib/models/create-model';
import * as openaiProvider from '../../../src/lib/models/providers/openai';
import * as anthropicProvider from '../../../src/lib/models/providers/anthropic';
import * as googleProvider from '../../../src/lib/models/providers/google';

describe('createModel', () => {
  beforeEach(() => {
    vi.mocked(openaiProvider.createOpenAIModel).mockReturnValue(mockModel);
    vi.mocked(anthropicProvider.createAnthropicModel).mockReturnValue({
      ...mockModel,
      provider: 'anthropic',
    } as never);
    vi.mocked(googleProvider.createGoogleModel).mockReturnValue({
      ...mockModel,
      provider: 'google',
    } as never);
  });

  it('should throw ModelError for unsupported provider', () => {
    const config: ModelConfig = { provider: 'openai', model: 'gpt-4o' };
    (config as { provider: string }).provider = 'azure';
    expect(() => createModel(config)).toThrow(ModelError);
  });

  it('should include supported providers in error message', () => {
    const config: ModelConfig = { provider: 'openai', model: 'gpt-4o' };
    (config as { provider: string }).provider = 'azure';
    try {
      createModel(config);
    } catch (e) {
      expect(e).toBeInstanceOf(ModelError);
      expect((e as ModelError).message).toContain('azure');
      expect((e as ModelError).message).toContain('openai');
      expect((e as ModelError).message).toContain('anthropic');
      expect((e as ModelError).message).toContain('google');
    }
  });

  it('should route to createOpenAIModel for provider openai', () => {
    const config: ModelConfig = { provider: 'openai', model: 'gpt-4o-mini' };
    const model = createModel(config);
    expect(openaiProvider.createOpenAIModel).toHaveBeenCalledWith(config);
    expect(model.provider).toBe('openai');
  });

  it('should route to createAnthropicModel for provider anthropic', () => {
    const config: ModelConfig = {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
    };
    const model = createModel(config);
    expect(anthropicProvider.createAnthropicModel).toHaveBeenCalledWith(config);
    expect(model.provider).toBe('anthropic');
  });

  it('should route to createGoogleModel for provider google', () => {
    const config: ModelConfig = { provider: 'google', model: 'gemini-1.5-flash' };
    const model = createModel(config);
    expect(googleProvider.createGoogleModel).toHaveBeenCalledWith(config);
    expect(model.provider).toBe('google');
  });
});
