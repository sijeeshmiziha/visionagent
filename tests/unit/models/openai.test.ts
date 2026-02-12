import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LanguageModelUsage } from 'ai';
import type { Model, ModelResponse } from '../../../src/lib/types/model';
import type { ModelMessage } from '../../../src/lib/types/common';
import type { Tool } from '../../../src/lib/types/tool';

function mockUsage(u: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}): LanguageModelUsage {
  return {
    ...u,
    inputTokenDetails: {
      noCacheTokens: undefined,
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
    },
    outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
  };
}

function createMockModel(options?: {
  mockResponse?: Partial<ModelResponse>;
  toolCallResponse?: ModelResponse;
}): Model {
  const mockResponse: ModelResponse = {
    text: 'Mocked response',
    toolCalls: [],
    usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
    finishReason: 'stop',
    ...options?.mockResponse,
  };

  return {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    invoke: vi
      .fn()
      .mockImplementation(async (_messages: ModelMessage[], invokeOptions?: unknown) => {
        const opts = invokeOptions as { tools?: Record<string, unknown> } | undefined;
        const hasTools = opts?.tools && Object.keys(opts.tools).length > 0;
        if (hasTools && options?.toolCallResponse) {
          return options.toolCallResponse;
        }
        return mockResponse;
      }),
    generateVision: vi.fn().mockResolvedValue(mockResponse),
  };
}

describe('OpenAI Model (Unit - Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke with mocked response', async () => {
    const model = createMockModel({
      mockResponse: { text: 'Mocked OpenAI response' },
    });

    const response = await model.invoke([{ role: 'user', content: 'test' }]);

    expect(response.text).toBe('Mocked OpenAI response');
    expect(response.usage?.totalTokens).toBe(15);
    expect(model.invoke).toHaveBeenCalledWith([{ role: 'user', content: 'test' }]);
  });

  it('should handle tool calls', async () => {
    const model = createMockModel({
      toolCallResponse: {
        text: '',
        toolCalls: [
          {
            toolCallId: 'call_123',
            toolName: 'test_tool',
            input: { test: true },
          },
        ],
        usage: mockUsage({ inputTokens: 50, outputTokens: 20, totalTokens: 70 }),
        finishReason: 'tool-calls',
      },
    });

    const tools = {
      test_tool: {
        description: 'Test',
        inputSchema: {},
        execute: async () => ({}),
      } as unknown as Tool,
    };

    const response = await model.invoke([{ role: 'user', content: 'use tool' }], { tools });

    expect(response.toolCalls).toBeDefined();
    expect(response.toolCalls?.[0]?.toolName).toBe('test_tool');
  });

  it('should return correct provider and model name', () => {
    const model = createMockModel();

    expect(model.provider).toBe('openai');
    expect(model.modelName).toBe('gpt-4o-mini');
  });

  it('should handle system messages', async () => {
    const model = createMockModel();

    const response = await model.invoke([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
    ]);

    expect(response.text).toBeTruthy();
    expect(model.invoke).toHaveBeenCalledWith([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
    ]);
  });

  it('should handle vision requests', async () => {
    const model = createMockModel();

    const response = await model.generateVision('Describe this image', [
      { base64: 'abc123', mimeType: 'image/png' },
    ]);

    expect(response.text).toBeTruthy();
    expect(model.generateVision).toHaveBeenCalled();
  });

  it('should receive invoke options (maxOutputTokens, temperature, stop)', async () => {
    const model = createMockModel();
    const messages = [{ role: 'user' as const, content: 'Hi' }];
    const options = {
      maxOutputTokens: 100,
      temperature: 0.5,
      stop: ['END'],
    };

    await model.invoke(messages, options);

    expect(model.invoke).toHaveBeenCalledWith(messages, expect.objectContaining(options));
  });

  it('should return correct finishReason values', async () => {
    const modelStop = createMockModel({ mockResponse: { finishReason: 'stop' } });
    const resStop = await modelStop.invoke([{ role: 'user', content: 'x' }]);
    expect(resStop.finishReason).toBe('stop');

    const modelCalls = createMockModel({
      toolCallResponse: {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 't', input: {} }],
        usage: mockUsage({ inputTokens: 1, outputTokens: 1, totalTokens: 2 }),
        finishReason: 'tool-calls',
      },
    });
    const tools = {
      t: { description: 'T', inputSchema: {}, execute: async () => ({}) } as unknown as Tool,
    };
    const resCalls = await modelCalls.invoke([{ role: 'user', content: 'x' }], { tools });
    expect(resCalls.finishReason).toBe('tool-calls');
  });

  it('should handle generateVision with multiple images', async () => {
    const model = createMockModel();
    const images = [
      { base64: 'img1', mimeType: 'image/png' as const },
      { base64: 'img2', mimeType: 'image/jpeg' as const },
    ];

    await model.generateVision('Compare these', images);

    expect(model.generateVision).toHaveBeenCalledWith('Compare these', images);
  });

  it('should handle generateVision with system prompt option', async () => {
    const model = createMockModel();
    const images = [{ base64: 'x', mimeType: 'image/png' as const }];

    await model.generateVision('Describe', images, { systemPrompt: 'You are an expert.' });

    expect(model.generateVision).toHaveBeenCalledWith('Describe', images, {
      systemPrompt: 'You are an expert.',
    });
  });

  it('should handle empty tool calls array', async () => {
    const model = createMockModel({
      mockResponse: { text: 'Reply', toolCalls: [], finishReason: 'stop' as const },
    });

    const response = await model.invoke([{ role: 'user', content: 'Hi' }]);

    expect(response.toolCalls).toEqual([]);
    expect(response.text).toBe('Reply');
  });

  it('should handle response with both text and tool calls', async () => {
    const model = createMockModel({
      toolCallResponse: {
        text: 'Let me call a tool.',
        toolCalls: [{ toolCallId: 'c1', toolName: 'my_tool', input: { x: 1 } }],
        usage: mockUsage({ inputTokens: 20, outputTokens: 10, totalTokens: 30 }),
        finishReason: 'tool-calls',
      },
    });
    const tools = {
      my_tool: {
        description: 'Tool',
        inputSchema: {},
        execute: async () => ({}),
      } as unknown as Tool,
    };

    const response = await model.invoke([{ role: 'user', content: 'Go' }], { tools });

    expect(response.text).toBe('Let me call a tool.');
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]?.toolName).toBe('my_tool');
  });
});
