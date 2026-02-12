/**
 * Tests for createAIModel (base provider)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAIModel } from '../../../src/lib/models/providers/base';
import type { ModelTool } from '../../../src/lib/types/model';

const mockUsage = {
  inputTokens: 10,
  outputTokens: 5,
  totalTokens: 15,
  inputTokenDetails: {},
  outputTokenDetails: {},
};

const mockGenerateText = vi.fn();

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
}));

describe('createAIModel', () => {
  const getModel = vi.fn().mockResolvedValue({ id: 'mock-model' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateText.mockResolvedValue({
      text: 'Mocked text',
      toolCalls: [],
      usage: mockUsage,
      finishReason: 'stop',
    });
  });

  it('should set provider and modelName', () => {
    const model = createAIModel({
      provider: 'openai',
      modelName: 'gpt-4o',
      getModel,
    });
    expect(model.provider).toBe('openai');
    expect(model.modelName).toBe('gpt-4o');
  });

  it('should pass messages through to generateText in invoke', async () => {
    const model = createAIModel({
      provider: 'anthropic',
      modelName: 'claude-3',
      getModel,
    });
    const messages = [
      { role: 'system' as const, content: 'You are helpful' },
      { role: 'user' as const, content: 'Hello' },
    ];
    await model.invoke(messages);
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
        model: { id: 'mock-model' },
      })
    );
  });

  it('should strip execute from tools before passing to generateText', async () => {
    const model = createAIModel({
      provider: 'openai',
      modelName: 'gpt-4o',
      getModel,
    });
    const tools = {
      my_tool: {
        description: 'A tool',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => ({}),
      },
    } as unknown as Record<string, ModelTool>;
    await model.invoke([{ role: 'user', content: 'Hi' }], { tools });
    const call = mockGenerateText.mock.calls[0]![0];
    expect(call.tools).toBeDefined();
    expect(call.tools.my_tool).not.toHaveProperty('execute');
    expect(call.tools.my_tool).toHaveProperty('description');
    expect(call.tools.my_tool).toHaveProperty('inputSchema');
  });

  it('should map tool calls in response', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: '',
      toolCalls: [
        {
          toolCallId: 'call_1',
          toolName: 'test_tool',
          input: { x: 1 },
        },
      ],
      usage: mockUsage,
      finishReason: 'tool-calls',
    });
    const model = createAIModel({
      provider: 'openai',
      modelName: 'gpt-4o',
      getModel,
    });
    const response = await model.invoke([{ role: 'user', content: 'Use tool' }]);
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]).toEqual({
      toolCallId: 'call_1',
      toolName: 'test_tool',
      input: { x: 1 },
    });
  });

  it('should wrap invoke errors in ModelError with provider', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('API down'));
    const model = createAIModel({
      provider: 'google',
      modelName: 'gemini',
      getModel,
    });
    await expect(model.invoke([{ role: 'user', content: 'Hi' }])).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'google',
      message: expect.stringContaining('Failed to invoke google model'),
    });
  });

  it('should build correct image content (data URI) in generateVision', async () => {
    const model = createAIModel({
      provider: 'openai',
      modelName: 'gpt-4o',
      getModel,
    });
    await model.generateVision('Describe', [{ base64: 'YWJj', mimeType: 'image/png' }]);
    const call = mockGenerateText.mock.calls[0]![0];
    const userContent = call.messages.find((m: { role: string }) => m.role === 'user');
    expect(userContent.content).toEqual(
      expect.arrayContaining([
        {
          type: 'image',
          image: 'data:image/png;base64,YWJj',
          mimeType: 'image/png',
        },
        { type: 'text', text: 'Describe' },
      ])
    );
  });

  it('should prepend system prompt in generateVision when provided', async () => {
    const model = createAIModel({
      provider: 'openai',
      modelName: 'gpt-4o',
      getModel,
    });
    await model.generateVision('What is this?', [{ base64: 'x', mimeType: 'image/png' }], {
      systemPrompt: 'You are an expert.',
    });
    const call = mockGenerateText.mock.calls[0]![0];
    expect(call.messages[0]).toEqual({
      role: 'system',
      content: 'You are an expert.',
    });
  });

  it('should wrap generateVision errors in ModelError', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Vision failed'));
    const model = createAIModel({
      provider: 'anthropic',
      modelName: 'claude-3',
      getModel,
    });
    await expect(
      model.generateVision('Describe', [{ base64: 'x', mimeType: 'image/png' }])
    ).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'anthropic',
      message: expect.stringContaining('Failed to generate vision response'),
    });
  });
});
