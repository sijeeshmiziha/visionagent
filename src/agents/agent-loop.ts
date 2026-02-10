/**
 * Simple agent loop implementation (ModelMessage[], AI SDK shapes)
 */

import type { AgentConfig, AgentResult, AgentStep, AgentToolResult } from '../types/agent';
import type { ModelMessage } from '../types/common';
import type { ModelToolCall } from '../types/model';
import { AgentError } from '../core/errors';
import { sumTokenUsage } from '../core/utils';
import { executeToolByName } from '../tools/execute-tool';

/**
 * Run the agent loop
 *
 * 1. Calls the model with ModelMessage[] and tools (Record<string, Tool>)
 * 2. If no tool calls, returns the response
 * 3. If tool calls, executes them and appends assistant + tool messages (AI SDK shape)
 * 4. Repeats until done or max iterations reached
 */
export async function agentLoop(config: AgentConfig): Promise<AgentResult> {
  const { model, tools, systemPrompt, input, maxIterations = 10, onStep } = config;

  const messages: ModelMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input },
  ];

  const steps: AgentStep[] = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const response = await model.invoke(messages, { tools });

    const step: AgentStep = {
      iteration,
      content: response.text,
      toolCalls: response.toolCalls,
      usage: response.usage,
    };

    if (!response.toolCalls?.length) {
      steps.push(step);
      onStep?.(step);
      return {
        output: response.text,
        steps,
        totalUsage: sumTokenUsage(steps.map(s => s.usage)),
        messages,
      };
    }

    // Assistant message with tool-call parts (AI SDK shape)
    const assistantContent = [
      ...(response.text ? [{ type: 'text' as const, text: response.text }] : []),
      ...response.toolCalls.map((tc: ModelToolCall) => ({
        type: 'tool-call' as const,
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        input: tc.input,
      })),
    ];
    messages.push({ role: 'assistant', content: assistantContent });

    const toolResults: AgentToolResult[] = [];

    for (const toolCall of response.toolCalls) {
      const execResult = await executeToolByName(tools, toolCall.toolName, toolCall.input, {
        toolCallId: toolCall.toolCallId,
      });

      const agentResult: AgentToolResult = {
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        output: execResult.success ? execResult.output : execResult.error,
        isError: !execResult.success,
      };
      toolResults.push(agentResult);

      const toolResultOutput = agentResult.isError
        ? { type: 'error-text' as const, value: String(agentResult.output) }
        : {
            type: 'text' as const,
            value:
              typeof agentResult.output === 'string'
                ? agentResult.output
                : JSON.stringify(agentResult.output),
          };

      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result' as const,
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            output: toolResultOutput,
          },
        ],
      });
    }

    step.toolResults = toolResults;
    steps.push(step);
    onStep?.(step);
  }

  throw new AgentError(
    `Agent reached maximum iterations (${maxIterations}) without completing`,
    maxIterations - 1
  );
}
