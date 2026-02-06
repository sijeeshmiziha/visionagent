/**
 * Simple agent loop implementation
 */

import type { AgentConfig, AgentResult, AgentStep } from '../types/agent';
import type { Message, ToolCall, ToolResult } from '../types/common';
import { AgentError } from '../core/errors';
import { sumTokenUsage } from '../core/utils';
import { getToolSchemas, getTool } from '../tools/tool-set';

/**
 * Run the agent loop
 *
 * This is a simple while loop that:
 * 1. Calls the model with messages and tool definitions
 * 2. If no tool calls, returns the response
 * 3. If tool calls, executes them and adds results to messages
 * 4. Repeats until done or max iterations reached
 */
export async function agentLoop(config: AgentConfig): Promise<AgentResult> {
  const { model, tools, systemPrompt, input, maxIterations = 10, onStep } = config;

  // Initialize messages
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input },
  ];

  const steps: AgentStep[] = [];
  const toolDefinitions = getToolSchemas(tools);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Call the model
    const response = await model.invoke(messages, {
      tools: toolDefinitions,
    });

    // Create step
    const step: AgentStep = {
      iteration,
      content: response.content,
      toolCalls: response.toolCalls,
      usage: response.usage,
    };

    // If no tool calls, we're done
    if (!response.toolCalls?.length) {
      steps.push(step);
      onStep?.(step);

      return {
        output: response.content,
        steps,
        totalUsage: sumTokenUsage(steps.map(s => s.usage)),
        messages,
      };
    }

    // Add assistant message with tool calls
    messages.push({
      role: 'assistant',
      content: response.content || '',
      toolCalls: response.toolCalls,
    });

    // Execute tool calls
    const toolResults: ToolResult[] = [];

    for (const toolCall of response.toolCalls) {
      const result = await executeToolCall(tools, toolCall);
      toolResults.push(result);

      // Add tool result to messages
      messages.push({
        role: 'tool',
        content: typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
        toolCallId: toolCall.id,
      });
    }

    step.toolResults = toolResults;
    steps.push(step);
    onStep?.(step);
  }

  // Max iterations reached
  throw new AgentError(
    `Agent reached maximum iterations (${maxIterations}) without completing`,
    maxIterations - 1
  );
}

/**
 * Execute a single tool call
 */
async function executeToolCall(
  tools: AgentConfig['tools'],
  toolCall: ToolCall
): Promise<ToolResult> {
  const tool = getTool(tools, toolCall.name);

  if (!tool) {
    return {
      callId: toolCall.id,
      result: null,
      error: `Tool not found: ${toolCall.name}`,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await tool.execute(toolCall.args);
    return {
      callId: toolCall.id,
      result,
    };
  } catch (error) {
    return {
      callId: toolCall.id,
      result: null,
      error: (error as Error).message,
    };
  }
}
