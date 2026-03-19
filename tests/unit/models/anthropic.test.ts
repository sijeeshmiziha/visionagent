/**
 * Tests for createAnthropicModel (native @anthropic-ai/sdk)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ModelMessage } from '../../../src/lib/types/common';
import type { Tool } from '../../../src/lib/types/tool';

const { mockMessagesCreate } = vi.hoisted(() => ({ mockMessagesCreate: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: mockMessagesCreate };
  }
  return { default: MockAnthropic };
});

import { createAnthropicModel } from '../../../src/lib/models/providers/anthropic';

const mockUsage = {
  input_tokens: 12,
  output_tokens: 8,
};

describe('createAnthropicModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Mocked Anthropic response' }],
      stop_reason: 'end_turn',
      usage: mockUsage,
    });
  });

  it('should set provider to anthropic and modelName', () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    expect(model.provider).toBe('anthropic');
    expect(model.modelName).toBe('claude-haiku-4-5');
  });

  it('should call messages.create with messages on invoke', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
    const response = await model.invoke(messages);
    expect(mockMessagesCreate).toHaveBeenCalledOnce();
    expect(response.text).toBe('Mocked Anthropic response');
    expect(response.finishReason).toBe('stop');
  });

  it('should pass tools without execute to messages.create', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-sonnet-4-6' });
    const tools = {
      my_tool: {
        description: 'A tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => ({}),
      } as unknown as Tool,
    };
    await model.invoke([{ role: 'user', content: 'Hi' }], { tools });
    const call = mockMessagesCreate.mock.calls[0]![0];
    expect(call.tools).toBeDefined();
    expect(call.tools[0]).toMatchObject({ name: 'my_tool', description: 'A tool' });
    expect(call.tools[0]).not.toHaveProperty('execute');
  });

  it('should map tool_use to toolCalls in the response', async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      content: [{ type: 'tool_use', id: 'call_1', name: 'search', input: { q: 'test' } }],
      stop_reason: 'tool_use',
      usage: mockUsage,
    });
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    const response = await model.invoke([{ role: 'user', content: 'Search' }]);
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]?.toolName).toBe('search');
    expect(response.finishReason).toBe('tool-calls');
  });

  it('should wrap errors in ModelError with provider anthropic', async () => {
    mockMessagesCreate.mockRejectedValueOnce(new Error('Rate limit'));
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
    const call = mockMessagesCreate.mock.calls[0]![0];
    const userMsg = call.messages[0];
    expect(userMsg.role).toBe('user');
    expect(userMsg.content).toEqual(
      expect.arrayContaining([
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'YWJj' } },
        { type: 'text', text: 'Describe' },
      ])
    );
  });

  it('should prepend system prompt in generateVision when provided', async () => {
    const model = createAnthropicModel({ provider: 'anthropic', model: 'claude-haiku-4-5' });
    await model.generateVision('What?', [{ base64: 'x', mimeType: 'image/png' }], {
      systemPrompt: 'You are a vision expert.',
    });
    const call = mockMessagesCreate.mock.calls[0]![0];
    expect(call.system).toBe('You are a vision expert.');
  });

  it('should wrap generateVision errors in ModelError', async () => {
    mockMessagesCreate.mockRejectedValueOnce(new Error('Vision error'));
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
