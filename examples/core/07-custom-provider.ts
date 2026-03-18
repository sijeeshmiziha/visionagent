/**
 * Example: Custom Provider (registerProvider)
 *
 * Shows how to extend VisionAgent with a custom model provider.
 * This example registers a "mock" provider that returns canned responses,
 * demonstrating the extension pattern you'd use for Ollama, Azure OpenAI, etc.
 *
 * Setup:
 *   npm install visionagent
 *
 * Run:
 *   npx tsx examples/core/07-custom-provider.ts
 */
import { createModel, registerProvider, runAgent, defineTool, createToolSet } from 'visionagent';
import type { Model, ModelResponse, LanguageModelUsage } from 'visionagent';
import { z } from 'zod';

const mockUsage: LanguageModelUsage = {
  inputTokens: 10,
  outputTokens: 20,
  totalTokens: 30,
  inputTokenDetails: {
    noCacheTokens: undefined,
    cacheReadTokens: undefined,
    cacheWriteTokens: undefined,
  },
  outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
};

// ── Step 1: Implement the Model interface ──────────────────────────────────────

function createMockModel(modelName: string): Model {
  const mockInvoke = async (
    messages: { role: string; content: string }[]
  ): Promise<ModelResponse> => {
    const lastMsg = messages.at(-1);
    const userText = typeof lastMsg?.content === 'string' ? lastMsg.content : '';
    console.log(`  [mock] Received: "${userText.slice(0, 60)}"`);

    // Simulate a tool call on first turn, then a final answer
    const hasPrevToolResult = messages.some(m => m.role === 'tool');
    if (!hasPrevToolResult && userText.toLowerCase().includes('calculate')) {
      return {
        text: '',
        toolCalls: [
          {
            toolCallId: 'call_mock_1',
            toolName: 'calculator',
            input: { a: 42, b: 8, op: 'multiply' },
          },
        ],
        usage: mockUsage,
        finishReason: 'tool-calls',
      };
    }
    return {
      text: `[Mock response to: "${userText.slice(0, 40)}..."] The answer is 336.`,
      toolCalls: [],
      usage: mockUsage,
      finishReason: 'stop',
    };
  };

  return {
    provider: 'mock' as never,
    modelName,
    invoke: mockInvoke as never,
    generateVision: async (prompt): Promise<ModelResponse> => ({
      text: `[Mock vision: "${prompt.slice(0, 30)}..."] I see a beautiful image.`,
      toolCalls: [],
      usage: mockUsage,
      finishReason: 'stop',
    }),
  };
}

// ── Step 2: Register the provider ─────────────────────────────────────────────

registerProvider('mock', {
  create(config) {
    console.log(`  [mock provider] Creating model: ${config.model}`);
    return createMockModel(config.model);
  },
});

// ── Step 3: Use it via createModel ─────────────────────────────────────────────

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Multiply two numbers',
  input: z.object({ a: z.number(), b: z.number(), op: z.string() }),
  handler: async ({ a, b }) => {
    const result = a * b;
    console.log(`  [calculator] ${a} * ${b} = ${result}`);
    return { result };
  },
});

async function main() {
  console.log('=== Custom Provider Example ===\n');

  // createModel routes to the registered "mock" provider
  const model = createModel({ provider: 'mock' as never, model: 'mock-v1' });

  console.log(`Provider: ${model.provider}, Model: ${model.modelName}\n`);

  // 1. Direct invoke
  console.log('--- Direct invoke ---');
  const response = await model.invoke([{ role: 'user', content: 'Hello from custom provider!' }]);
  console.log('Response:', response.text);
  console.log('Usage:', response.usage);

  // 2. Agent with tools
  console.log('\n--- Agent with tools ---');
  const result = await runAgent({
    model,
    tools: createToolSet({ calculator: calculatorTool }),
    systemPrompt: 'You are a math assistant.',
    input: 'Please calculate 42 multiplied by 8.',
    maxIterations: 5,
    onStep: step => {
      console.log(`Step ${step.iteration + 1}:`, step.toolCalls?.[0]?.toolName ?? 'responding');
    },
  });

  console.log('\nFinal answer:', result.output);
  console.log('Steps:', result.steps.length);
}

main().catch(console.error);
