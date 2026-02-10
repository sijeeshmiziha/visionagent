/**
 * Example 03: Tool Calling with Agent
 *
 * Run with: npm run example:03
 *
 * Demonstrates tool calling with a calculator tool.
 * Requires: OPENAI_API_KEY environment variable
 */

import { createModel, createToolSet, defineTool, runAgent } from '../src/index';
import { z } from 'zod';

// Define a calculator tool
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

  const result = await runAgent({
    model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
    tools: createToolSet([calculatorTool]),
    systemPrompt: 'You are a helpful math assistant. Use the calculator tool to solve problems.',
    input: 'What is 25 multiplied by 4?',
    maxIterations: 5,
    onStep: step => {
      console.log(`Step ${step.iteration + 1}:`, step.toolCalls?.[0]?.toolName || 'thinking...');
    },
  });

  console.log('\nFinal answer:', result.output);
  console.log('Steps taken:', result.steps.length);
  console.log('Total tokens:', result.totalUsage);
}

main().catch(console.error);
