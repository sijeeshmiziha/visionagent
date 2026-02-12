/**
 * Example: Tool Calling with Agent
 *
 * Agent with a calculator tool.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 03-tool-calling.ts
 */
import { createModel, createToolSet, defineTool, runAgent } from 'visionagent';
import { z } from 'zod';

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Perform basic math operations',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  handler: async ({ operation, a, b }) => {
    const ops = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: a / b,
    };
    console.log(`  [Calculator] ${a} ${operation} ${b} = ${ops[operation]}`);
    return { result: ops[operation] };
  },
});

async function main() {
  console.log('Testing agent with tools...\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? 'What is 25 multiplied by 4?';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '5') || 5;

  const result = await runAgent({
    model: createModel({
      provider,
      model: modelName,
      apiKey: process.env.OPENAI_API_KEY,
    }),
    tools: createToolSet({ calculator: calculatorTool }),
    systemPrompt: 'You are a helpful math assistant. Use the calculator tool to solve problems.',
    input: agentInput,
    maxIterations,
    onStep: step => {
      console.log(`Step ${step.iteration + 1}:`, step.toolCalls?.[0]?.toolName || 'thinking...');
    },
  });

  console.log('\nFinal answer:', result.output);
  console.log('Steps taken:', result.steps.length);
  console.log('Total tokens:', result.totalUsage);
}

main().catch(console.error);
