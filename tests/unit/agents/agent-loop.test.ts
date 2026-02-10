import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAgent } from '../../../src/agents';
import { createToolSet, defineTool } from '../../../src/tools';
import { z } from 'zod';
import type { Model, ModelResponse } from '../../../src/types/model';
import type { LanguageModelUsage } from 'ai';

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

function createMockModel(responses: ModelResponse[]): Model {
  let callIndex = 0;

  return {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    invoke: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1]!;
      callIndex++;
      return response;
    }),
    generateVision: vi.fn().mockResolvedValue({
      text: 'Vision response',
      toolCalls: [],
      usage: mockUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }),
      finishReason: 'stop',
    }),
  };
}

describe('Agent Loop (Unit - Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete without tool calls', async () => {
    const model = createMockModel([
      {
        text: 'Mocked response',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: {},
      systemPrompt: 'Test prompt',
      input: 'Hello',
      maxIterations: 3,
    });

    expect(result.output).toBe('Mocked response');
    expect(result.steps.length).toBe(1);
    expect(model.invoke).toHaveBeenCalledTimes(1);
  });

  it('should execute tools and continue', async () => {
    const mockHandler = vi.fn().mockResolvedValue({ result: 'tool executed' });

    const mockTool = defineTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ test: z.boolean().optional() }),
      handler: mockHandler,
    });

    const model = createMockModel([
      {
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
      {
        text: 'Final answer after tool execution',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 30, outputTokens: 10, totalTokens: 40 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ test_tool: mockTool }),
      systemPrompt: 'Use tools',
      input: 'Test',
      maxIterations: 5,
    });

    expect(result.steps.length).toBe(2);
    expect(mockHandler).toHaveBeenCalledWith({ test: true }, undefined);
    expect(result.output).toBe('Final answer after tool execution');
  });

  it('should call onStep callback', async () => {
    const model = createMockModel([
      {
        text: 'Done',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const onStep = vi.fn();

    await runAgent({
      model,
      tools: {},
      systemPrompt: 'Test',
      input: 'Hello',
      maxIterations: 3,
      onStep,
    });

    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith(
      expect.objectContaining({
        iteration: 0,
        content: 'Done',
      })
    );
  });

  it('should track token usage across steps', async () => {
    const mockTool = defineTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({}),
      handler: async () => ({ result: 'done' }),
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'call_1', toolName: 'test_tool', input: {} }],
        usage: mockUsage({ inputTokens: 50, outputTokens: 20, totalTokens: 70 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Final',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 30, outputTokens: 10, totalTokens: 40 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ test_tool: mockTool }),
      systemPrompt: 'Test',
      input: 'Hello',
      maxIterations: 3,
    });

    expect(result.totalUsage).toBeDefined();
    expect(result.totalUsage?.totalTokens).toBe(110); // 70 + 40
  });

  it('should include messages in result', async () => {
    const model = createMockModel([
      {
        text: 'Response',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: {},
      systemPrompt: 'You are helpful',
      input: 'Hello',
      maxIterations: 3,
    });

    expect(result.messages).toHaveLength(2); // system + user
    expect(result.messages[0]?.role).toBe('system');
    expect(result.messages[0]?.content).toBe('You are helpful');
    expect(result.messages[1]?.role).toBe('user');
    expect(result.messages[1]?.content).toBe('Hello');
  });

  it('should handle tool execution errors gracefully', async () => {
    const errorTool = defineTool({
      name: 'error_tool',
      description: 'A tool that throws',
      input: z.object({}),
      handler: async () => {
        throw new Error('Tool execution failed');
      },
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'call_1', toolName: 'error_tool', input: {} }],
        usage: mockUsage({ inputTokens: 20, outputTokens: 10, totalTokens: 30 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Handled the error',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 30, outputTokens: 10, totalTokens: 40 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ error_tool: errorTool }),
      systemPrompt: 'Test',
      input: 'Call tool',
      maxIterations: 5,
    });

    expect(result.steps[0]?.toolResults?.[0]?.isError).toBe(true);
    expect(String(result.steps[0]?.toolResults?.[0]?.output)).toContain('Tool execution failed');
    expect(result.output).toBe('Handled the error');
  });
});
