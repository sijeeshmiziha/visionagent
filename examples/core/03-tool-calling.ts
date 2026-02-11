/**
 * Example 03: Tool Calling with Agent
 *
 * Run with: npm run example -- examples/core/03-tool-calling.ts
 * Inputs: PROVIDER, MODEL, AGENT_INPUT, MAX_ITERATIONS (env or --key=value)
 */

import { createModel, createToolSet, defineTool, runAgent } from '../../src/index';
import { requireInput } from '../lib/input';
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

  const provider = requireInput('PROVIDER') as 'openai' | 'anthropic' | 'google';
  const modelName = requireInput('MODEL');
  const agentInput = requireInput('AGENT_INPUT');
  const maxIterStr = requireInput('MAX_ITERATIONS');
  const maxIterations = Number.parseInt(maxIterStr, 10) || 5;

  const result = await runAgent({
    model: createModel({ provider, model: modelName }),
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
