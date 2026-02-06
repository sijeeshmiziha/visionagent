import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentLoop } from '../../../src/agents/agent-loop';
import { defineTool } from '../../../src/tools/define-tool';
import { z } from 'zod';
import type { Model, ModelResponse } from '../../../src/types/model';

// Create a mock model for testing the agent loop
function createMockModel(responses: ModelResponse[]): Model {
  let callIndex = 0;

  return {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    invoke: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex] || responses[responses.length - 1];
      callIndex++;
      return response;
    }),
    generateVision: vi.fn().mockResolvedValue({ content: 'Vision response' }),
  };
}

describe('Agent Loop (Unit - Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete without tool calls', async () => {
    const model = createMockModel([
      {
        content: 'Mocked response',
        usage: { input: 10, output: 5, total: 15 },
      },
    ]);

    const result = await agentLoop({
      model,
      tools: [],
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

    // First call returns tool call, second call returns final response
    const model = createMockModel([
      {
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
      {
        content: 'Final answer after tool execution',
        usage: { input: 30, output: 10, total: 40 },
      },
    ]);

    const result = await agentLoop({
      model,
      tools: [mockTool],
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
        content: 'Done',
        usage: { input: 10, output: 5, total: 15 },
      },
    ]);

    const onStep = vi.fn();

    await agentLoop({
      model,
      tools: [],
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
        content: '',
        toolCalls: [{ id: 'call_1', name: 'test_tool', args: {} }],
        usage: { input: 50, output: 20, total: 70 },
      },
      {
        content: 'Final',
        usage: { input: 30, output: 10, total: 40 },
      },
    ]);

    const result = await agentLoop({
      model,
      tools: [mockTool],
      systemPrompt: 'Test',
      input: 'Hello',
      maxIterations: 3,
    });

    expect(result.totalUsage).toBeDefined();
    expect(result.totalUsage?.total).toBe(110); // 70 + 40
  });

  it('should include messages in result', async () => {
    const model = createMockModel([
      {
        content: 'Response',
        usage: { input: 10, output: 5, total: 15 },
      },
    ]);

    const result = await agentLoop({
      model,
      tools: [],
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
        content: '',
        toolCalls: [{ id: 'call_1', name: 'error_tool', args: {} }],
        usage: { input: 20, output: 10, total: 30 },
      },
      {
        content: 'Handled the error',
        usage: { input: 30, output: 10, total: 40 },
      },
    ]);

    const result = await agentLoop({
      model,
      tools: [errorTool],
      systemPrompt: 'Test',
      input: 'Call tool',
      maxIterations: 5,
    });

    expect(result.steps[0]?.toolResults?.[0]?.error).toContain('Tool execution failed');
    expect(result.output).toBe('Handled the error');
  });
});
