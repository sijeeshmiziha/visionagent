/**
 * Tests for createGoogleModel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ModelMessage } from '../../../src/lib/types/common';
import type { Tool } from '../../../src/lib/types/tool';

const mockGenerateText = vi.fn();

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => ({ id: 'gemini-2.0-flash' }))),
}));

import { createGoogleModel } from '../../../src/lib/models/providers/google';

const mockUsage = {
  inputTokens: 10,
  outputTokens: 5,
  totalTokens: 15,
  inputTokenDetails: {},
  outputTokenDetails: {},
};

describe('createGoogleModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateText.mockResolvedValue({
      text: 'Mocked Gemini response',
      toolCalls: [],
      usage: mockUsage,
      finishReason: 'stop',
    });
  });

  it('should set provider to google and modelName', () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    expect(model.provider).toBe('google');
    expect(model.modelName).toBe('gemini-2.0-flash');
  });

  it('should call generateText with messages on invoke', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
    const response = await model.invoke(messages);
    expect(mockGenerateText).toHaveBeenCalledOnce();
    expect(response.text).toBe('Mocked Gemini response');
    expect(response.finishReason).toBe('stop');
  });

  it('should strip execute from tools before passing to generateText', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
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
      toolCalls: [{ toolCallId: 'call_1', toolName: 'lookup', input: { id: 42 } }],
      usage: mockUsage,
      finishReason: 'tool-calls',
    });
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    const response = await model.invoke([{ role: 'user', content: 'Lookup' }]);
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]?.toolName).toBe('lookup');
    expect(response.finishReason).toBe('tool-calls');
  });

  it('should wrap errors in ModelError with provider google', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Quota exceeded'));
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await expect(model.invoke([{ role: 'user', content: 'Hi' }])).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'google',
      message: expect.stringContaining('Failed to invoke google/'),
    });
  });

  it('should build correct image content in generateVision', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await model.generateVision('Describe', [{ base64: 'YWJj', mimeType: 'image/jpeg' }]);
    const call = mockGenerateText.mock.calls[0]![0];
    const userMsg = call.messages.find((m: { role: string }) => m.role === 'user');
    expect(userMsg.content).toEqual(
      expect.arrayContaining([
        { type: 'image', image: 'data:image/jpeg;base64,YWJj', mimeType: 'image/jpeg' },
        { type: 'text', text: 'Describe' },
      ])
    );
  });

  it('should prepend system prompt in generateVision when provided', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await model.generateVision('What?', [{ base64: 'x', mimeType: 'image/png' }], {
      systemPrompt: 'You are a vision expert.',
    });
    const call = mockGenerateText.mock.calls[0]![0];
    expect(call.messages[0]).toEqual({ role: 'system', content: 'You are a vision expert.' });
  });

  it('should wrap generateVision errors in ModelError', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Vision error'));
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await expect(
      model.generateVision('Describe', [{ base64: 'x', mimeType: 'image/png' }])
    ).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'google',
      message: expect.stringContaining('Failed to generate vision response'),
    });
  });
});
