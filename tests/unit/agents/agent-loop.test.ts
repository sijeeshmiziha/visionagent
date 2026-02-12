import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAgent } from '../../../src/lib/agents';
import { createToolSet, defineTool } from '../../../src/lib/tools';
import { z } from 'zod';
import type { Model, ModelResponse } from '../../../src/lib/types/model';
import type { LanguageModelUsage } from 'ai';
import { AgentError } from '../../../src/lib/utils/errors';

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

  it('should throw AgentError when maxIterations is exceeded', async () => {
    const mockTool = defineTool({
      name: 'loop_tool',
      description: 'Tool that keeps getting called',
      input: z.object({}),
      handler: async () => ({ ok: true }),
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 'loop_tool', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls' as const,
      },
      {
        text: '',
        toolCalls: [{ toolCallId: 'c2', toolName: 'loop_tool', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls' as const,
      },
      {
        text: '',
        toolCalls: [{ toolCallId: 'c3', toolName: 'loop_tool', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls' as const,
      },
    ]);

    await expect(
      runAgent({
        model,
        tools: createToolSet({ loop_tool: mockTool }),
        systemPrompt: 'Test',
        input: 'Loop',
        maxIterations: 3,
      })
    ).rejects.toThrow(AgentError);

    await expect(
      runAgent({
        model,
        tools: createToolSet({ loop_tool: mockTool }),
        systemPrompt: 'Test',
        input: 'Loop',
        maxIterations: 3,
      })
    ).rejects.toMatchObject({ iteration: 2 });
  });

  it('should handle multiple tool calls in one step', async () => {
    const addHandler = vi.fn().mockResolvedValue({ sum: 5 });
    const mulHandler = vi.fn().mockResolvedValue({ product: 12 });

    const addTool = defineTool({
      name: 'add',
      description: 'Add numbers',
      input: z.object({ a: z.number(), b: z.number() }),
      handler: addHandler,
    });
    const mulTool = defineTool({
      name: 'mul',
      description: 'Multiply numbers',
      input: z.object({ a: z.number(), b: z.number() }),
      handler: mulHandler,
    });

    const model = createMockModel([
      {
        text: 'Computing...',
        toolCalls: [
          { toolCallId: 'call_add', toolName: 'add', input: { a: 2, b: 3 } },
          { toolCallId: 'call_mul', toolName: 'mul', input: { a: 3, b: 4 } },
        ],
        usage: mockUsage({ inputTokens: 50, outputTokens: 30, totalTokens: 80 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Done: 5 and 12',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 40, outputTokens: 10, totalTokens: 50 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ add: addTool, mul: mulTool }),
      systemPrompt: 'Use tools',
      input: 'Add 2+3 and multiply 3*4',
      maxIterations: 5,
    });

    expect(result.steps.length).toBe(2);
    expect(result.steps[0]?.toolCalls).toHaveLength(2);
    expect(result.steps[0]?.toolResults).toHaveLength(2);
    expect(addHandler).toHaveBeenCalledWith({ a: 2, b: 3 }, undefined);
    expect(mulHandler).toHaveBeenCalledWith({ a: 3, b: 4 }, undefined);
    expect(result.output).toBe('Done: 5 and 12');
  });

  it('should serialize tool string output in messages', async () => {
    const stringTool = defineTool({
      name: 'echo',
      description: 'Echo string',
      input: z.object({ msg: z.string() }),
      handler: async ({ msg }) => msg,
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 'echo', input: { msg: 'hello' } }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Got hello',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ echo: stringTool }),
      systemPrompt: 'Test',
      input: 'Echo hello',
      maxIterations: 3,
    });

    expect(result.messages).toHaveLength(4); // system, user, assistant, tool
    const toolMsg = result.messages[3];
    expect(toolMsg?.role).toBe('tool');
    const content = toolMsg?.content as {
      type: string;
      output?: { type: string; value: string };
    }[];
    expect(content[0]?.output?.type).toBe('text');
    expect(content[0]?.output?.value).toBe('hello');
  });

  it('should serialize tool non-string output (number) as JSON in messages', async () => {
    const numTool = defineTool({
      name: 'get_num',
      description: 'Return number',
      input: z.object({}),
      handler: async () => 42,
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 'get_num', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Got 42',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ get_num: numTool }),
      systemPrompt: 'Test',
      input: 'Get number',
      maxIterations: 3,
    });

    expect(result.messages).toHaveLength(4);
    const toolMsg = result.messages[3];
    const content = toolMsg?.content as {
      type: string;
      output?: { type: string; value: string };
    }[];
    expect(content[0]?.output?.type).toBe('text');
    expect(content[0]?.output?.value).toBe('42');
  });

  it('should serialize tool null output as JSON in messages', async () => {
    const nullTool = defineTool({
      name: 'get_null',
      description: 'Return null',
      input: z.object({}),
      handler: async () => null,
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 'get_null', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Done',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ get_null: nullTool }),
      systemPrompt: 'Test',
      input: 'Get null',
      maxIterations: 3,
    });

    expect(result.messages).toHaveLength(4);
    const toolMsg = result.messages[3];
    const content = toolMsg?.content as {
      type: string;
      output?: { type: string; value: string };
    }[];
    expect(content[0]?.output?.value).toBe('null');
  });

  it('should call onStep for every iteration including tool-call steps', async () => {
    const mockTool = defineTool({
      name: 'step_tool',
      description: 'Tool for step test',
      input: z.object({}),
      handler: async () => ({ done: true }),
    });

    const model = createMockModel([
      {
        text: '',
        toolCalls: [{ toolCallId: 'c1', toolName: 'step_tool', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Final',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const onStep = vi.fn();

    await runAgent({
      model,
      tools: createToolSet({ step_tool: mockTool }),
      systemPrompt: 'Test',
      input: 'Test',
      maxIterations: 5,
      onStep,
    });

    expect(onStep).toHaveBeenCalledTimes(2);
    expect(onStep).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        iteration: 0,
        toolCalls: expect.any(Array),
        toolResults: expect.any(Array),
      })
    );
    expect(onStep).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ iteration: 1, content: 'Final' })
    );
  });

  it('should append assistant and tool messages with correct AI SDK shapes after tool calls', async () => {
    const mockTool = defineTool({
      name: 'shape_tool',
      description: 'Shape test',
      input: z.object({}),
      handler: async () => ({ key: 'value' }),
    });

    const model = createMockModel([
      {
        text: 'Calling tool',
        toolCalls: [{ toolCallId: 'id1', toolName: 'shape_tool', input: {} }],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'tool-calls',
      },
      {
        text: 'Done',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: createToolSet({ shape_tool: mockTool }),
      systemPrompt: 'Test',
      input: 'Test',
      maxIterations: 3,
    });

    expect(result.messages).toHaveLength(4);
    const assistantMsg = result.messages[2];
    expect(assistantMsg?.role).toBe('assistant');
    const asstContent = assistantMsg?.content as {
      type: string;
      text?: string;
      toolCallId?: string;
      toolName?: string;
    }[];
    expect(asstContent.some(p => p.type === 'text' && p.text === 'Calling tool')).toBe(true);
    expect(asstContent.some(p => p.type === 'tool-call' && p.toolName === 'shape_tool')).toBe(true);

    const toolMsg = result.messages[3];
    expect(toolMsg?.role).toBe('tool');
    const toolContent = toolMsg?.content as {
      type: string;
      toolCallId: string;
      toolName: string;
      output: { type: string; value: string };
    }[];
    expect(toolContent[0]?.type).toBe('tool-result');
    expect(toolContent[0]?.output?.value).toContain('"key":"value"');
  });

  it('should use default maxIterations of 10 when not provided', async () => {
    const model = createMockModel([
      {
        text: 'Quick reply',
        toolCalls: [],
        usage: mockUsage({ inputTokens: 5, outputTokens: 3, totalTokens: 8 }),
        finishReason: 'stop',
      },
    ]);

    const result = await runAgent({
      model,
      tools: {},
      systemPrompt: 'Test',
      input: 'Hi',
    });

    expect(result.output).toBe('Quick reply');
    expect(result.steps.length).toBe(1);
    expect(model.invoke).toHaveBeenCalledTimes(1);
  });
});
