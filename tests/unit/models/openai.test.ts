import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Model, ModelResponse } from '../../../src/types/model';
import type { Message } from '../../../src/types/common';

// Create a mock model factory for unit testing
function createMockModel(options?: {
  mockResponse?: Partial<ModelResponse>;
  toolCallResponse?: ModelResponse;
}): Model {
  const mockResponse: ModelResponse = {
    content: 'Mocked response',
    usage: { input: 10, output: 5, total: 15 },
    ...options?.mockResponse,
  };

  return {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    invoke: vi.fn().mockImplementation(async (_messages: Message[], invokeOptions?: unknown) => {
      const opts = invokeOptions as { tools?: unknown[] } | undefined;
      // Return tool call response if tools are provided
      if (opts?.tools?.length && options?.toolCallResponse) {
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
      mockResponse: { content: 'Mocked OpenAI response' },
    });

    const response = await model.invoke([{ role: 'user', content: 'test' }]);

    expect(response.content).toBe('Mocked OpenAI response');
    expect(response.usage?.total).toBe(15);
    expect(model.invoke).toHaveBeenCalledWith([{ role: 'user', content: 'test' }]);
  });

  it('should handle tool calls', async () => {
    const model = createMockModel({
      toolCallResponse: {
        content: '',
        toolCalls: [
          {
            id: 'call_123',
            name: 'test_tool',
            args: { test: true },
          },
        ],
        usage: { input: 50, output: 20, total: 70 },
      },
    });

    const tools = [
      {
        type: 'function' as const,
        function: { name: 'test_tool', description: 'Test', parameters: {} },
      },
    ];

    const response = await model.invoke([{ role: 'user', content: 'use tool' }], { tools });

    expect(response.toolCalls).toBeDefined();
    expect(response.toolCalls?.[0]?.name).toBe('test_tool');
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

    expect(response.content).toBeTruthy();
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

    expect(response.content).toBeTruthy();
    expect(model.generateVision).toHaveBeenCalled();
  });
});
