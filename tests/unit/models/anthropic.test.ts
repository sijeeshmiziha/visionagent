/**
 * Tests for createAnthropicModel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ModelMessage } from '../../../src/lib/types/common';
import type { Tool } from '../../../src/lib/types/tool';

const mockGenerateText = vi.fn();

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => vi.fn(() => ({ id: 'claude-haiku-4-5' }))),
}));

import { createAnthropicModel } from '../../../src/lib/models/providers/anthropic';

const mockUsage = {
  inputTokens: 12,
  outputTokens: 8,
  totalTokens: 20,
  inputTokenDetails: {},
  outputTokenDetails: {},
};

describe('createAnthropicModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateText.mockResolvedValue({
      text: 'Mocked Anthropic response',
      toolCalls: [],
      usage: mockUsage,
      finishReason: 'stop',
    });
  });

  it('should set provider to anthropic and modelName', () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    expect(model.provider).toBe('anthropic');
    expect(model.modelName).toBe('claude-haiku-4-5');
  });

  it('should call generateText with messages on invoke', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
    const response = await model.invoke(messages);
    expect(mockGenerateText).toHaveBeenCalledOnce();
    expect(response.text).toBe('Mocked Anthropic response');
    expect(response.finishReason).toBe('stop');
  });

  it('should strip execute from tools before passing to generateText', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-sonnet-4-6' });
    const tools = {
      my_tool: {
        description: 'A tool',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => ({}),
      } as unknown as Tool,
    };
    await model.invoke([{ role: 'user', content: 'Hi' }], { tools });
    const call = mockGenerateText.mock.calls[0]![0];
    expect(call.tools.my_tool).not.toHaveProperty('execute');
    expect(call.tools.my_tool).toHaveProperty('description');
  });

  it('should map tool calls in the response', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: '',
      toolCalls: [{ toolCallId: 'call_1', toolName: 'search', input: { q: 'test' } }],
      usage: mockUsage,
      finishReason: 'tool-calls',
    });
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    const response = await model.invoke([{ role: 'user', content: 'Search' }]);
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]?.toolName).toBe('search');
    expect(response.finishReason).toBe('tool-calls');
  });

  it('should wrap errors in ModelError with provider anthropic', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Rate limit'));
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    await expect(model.invoke([{ role: 'user', content: 'Hi' }])).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'anthropic',
      message: expect.stringContaining('Failed to invoke anthropic/'),
    });
  });

  it('should build correct image content in generateVision', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    await model.generateVision('Describe', [{ base64: 'YWJj', mimeType: 'image/png' }]);
    const call = mockGenerateText.mock.calls[0]![0];
    const userMsg = call.messages.find((m: { role: string }) => m.role === 'user');
    expect(userMsg.content).toEqual(
      expect.arrayContaining([
        { type: 'image', image: 'data:image/png;base64,YWJj', mimeType: 'image/png' },
        { type: 'text', text: 'Describe' },
      ])
    );
  });

  it('should prepend system prompt in generateVision when provided', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    await model.generateVision('What?', [{ base64: 'x', mimeType: 'image/png' }], {
      systemPrompt: 'You are a vision expert.',
    });
    const call = mockGenerateText.mock.calls[0]![0];
    expect(call.messages[0]).toEqual({ role: 'system', content: 'You are a vision expert.' });
  });

  it('should wrap generateVision errors in ModelError', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Vision error'));
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    await expect(
      model.generateVision('Describe', [{ base64: 'x', mimeType: 'image/png' }])
    ).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'anthropic',
      message: expect.stringContaining('Failed to generate vision response'),
    });
  });
});
